import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Env } from '../env';
import { requireAuth } from '../lib/auth';
import { query, first, run } from '../lib/db';
import { success, created, paginated } from '../lib/response';
import { NotFoundError, ValidationError, ForbiddenError } from '../lib/errors';

function nanoid(size = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (let i = 0; i < size; i++) id += chars[bytes[i] % chars.length];
  return id;
}

export function register(app: Hono<{ Bindings: Env }>) {
  // GET /tickets — user's purchased tickets
  app.get('/tickets', requireAuth, async (c) => {
    const userId = c.get('userId');
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 50);
    const offset = (page - 1) * limit;

    const tickets = await query<any>(
      c.env.chillingz_db,
      `SELECT t.*, e.title as event_title, e.start_time, e.end_time, e.location, e.image_url
       FROM event_rsvps t
       JOIN events e ON e.id = t.event_id
       WHERE t.user_id = ?
       ORDER BY e.start_time DESC LIMIT ? OFFSET ?`,
      userId, limit, offset
    );

    const total = await first<{ count: number }>(
      c.env.chillingz_db,
      'SELECT COUNT(*) as count FROM event_rsvps WHERE user_id = ?',
      userId
    );

    return paginated(c, tickets.map((t: any) => ({
      id: t.id,
      eventId: t.event_id,
      eventTitle: t.event_title,
      startTime: t.start_time,
      endTime: t.end_time,
      location: t.location,
      image: t.image_url || '',
      status: t.status,
      rsvpAt: t.created_at,
      isUpcoming: t.start_time > new Date().toISOString(),
    })), page, limit, total?.count || 0);
  });

  // POST /events/:id/rsvp — RSVP to an event
  const rsvpSchema = z.object({
    status: z.enum(['going', 'interested', 'maybe']).default('going'),
    plusOne: z.boolean().default(false),
  });

  app.post('/events/:id/rsvp', requireAuth, zValidator('json', rsvpSchema), async (c) => {
    const eventId = c.req.param('id');
    const userId = c.get('userId');
    const { status, plusOne } = c.req.valid('json');

    const event = await first<any>(c.env.chillingz_db, 'SELECT * FROM events WHERE id = ?', eventId);
    if (!event) throw new NotFoundError('Event', eventId);

    if (event.start_time < new Date().toISOString()) throw new ValidationError('Cannot RSVP to past events');

    const existing = await first<any>(c.env.chillingz_db,
      'SELECT * FROM event_rsvps WHERE event_id = ? AND user_id = ?',
      eventId, userId
    );

    const now = new Date().toISOString();
    if (existing) {
      await run(c.env.chillingz_db,
        'UPDATE event_rsvps SET status = ?, plus_one = ?, updated_at = ? WHERE id = ?',
        status, plusOne ? 1 : 0, now, existing.id
      );
    } else {
      const id = nanoid();
      await run(c.env.chillingz_db,
        'INSERT INTO event_rsvps (id, event_id, user_id, status, plus_one, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        id, eventId, userId, status, plusOne ? 1 : 0, now
      );
    }

    // Update RSVP count
    const count = await first<{ count: number }>(
      c.env.chillingz_db,
      "SELECT COUNT(*) as count FROM event_rsvps WHERE event_id = ? AND status IN ('going','interested','maybe')",
      eventId
    );
    await run(c.env.chillingz_db, 'UPDATE events SET rsvp_count = ? WHERE id = ?', count?.count || 0, eventId);

    return success(c, { eventId, userId, status, plusOne });
  });

  // DELETE /events/:id/rsvp — cancel RSVP
  app.delete('/events/:id/rsvp', requireAuth, async (c) => {
    const eventId = c.req.param('id');
    const userId = c.get('userId');

    await run(c.env.chillingz_db,
      'DELETE FROM event_rsvps WHERE event_id = ? AND user_id = ?',
      eventId, userId
    );

    const count = await first<{ count: number }>(
      c.env.chillingz_db,
      "SELECT COUNT(*) as count FROM event_rsvps WHERE event_id = ? AND status IN ('going','interested','maybe')",
      eventId
    );
    await run(c.env.chillingz_db, 'UPDATE events SET rsvp_count = ? WHERE id = ?', count?.count || 0, eventId);

    return success(c, { cancelled: true });
  });

  // GET /events/:id/friends-attending
  app.get('/events/:id/friends-attending', requireAuth, async (c) => {
    const eventId = c.req.param('id');
    const userId = c.get('userId');

    const friends = await query<any>(
      c.env.chillingz_db,
      `SELECT u.id, u.first_name, u.last_name, u.avatar_url, er.status, er.created_at as rsvp_at
       FROM event_rsvps er
       JOIN users u ON u.id = er.user_id
       WHERE er.event_id = ? AND er.user_id != ?
       AND er.user_id IN (
         SELECT CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END
         FROM friends f
         WHERE f.status = 'accepted' AND (f.user_id = ? OR f.friend_id = ?)
       )
       ORDER BY er.created_at DESC`,
      eventId, userId, userId, userId, userId
    );

    return success(c, friends.map((f: any) => ({
      userId: f.id,
      firstName: f.first_name,
      lastName: f.last_name,
      avatar: f.avatar_url || '',
      status: f.status,
      rsvpAt: f.rsvp_at,
    })));
  });

  // GET /events/:id/attendees — public attendee list
  app.get('/events/:id/attendees', async (c) => {
    const eventId = c.req.param('id');

    const attendees = await query<any>(
      c.env.chillingz_db,
      `SELECT u.id, u.first_name, u.last_name, u.avatar_url, er.status, er.created_at as rsvp_at
       FROM event_rsvps er
       JOIN users u ON u.id = er.user_id
       WHERE er.event_id = ? AND er.status IN ('going','interested','maybe')
       ORDER BY er.created_at DESC LIMIT 100`,
      eventId
    );

    return success(c, attendees.map((a: any) => ({
      userId: a.id,
      name: `${a.first_name} ${a.last_name}`,
      firstName: a.first_name,
      lastName: a.last_name,
      avatar: a.avatar_url || '',
      status: a.status,
      rsvpAt: a.rsvp_at,
    })));
  });
}
