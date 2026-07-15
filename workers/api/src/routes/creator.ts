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
  // Creator-only middleware
  const requireCreator = async (c: any, next: any) => {
    await requireAuth(c, async () => {
      const user = await first<any>(c.env.chillingz_db, 'SELECT role FROM users WHERE id = ?', c.get('userId'));
      if (!user || user.role === 'user') throw new ForbiddenError('Creator account required');
      await next();
    });
  };

  // POST /creator/apply — submit professional account application
  const applySchema = z.object({
    businessName: z.string().min(1).max(200),
    businessType: z.string().min(1).max(100),
    phone: z.string().min(7).max(20),
    documentUrl: z.string().optional(),
  });

  app.post('/creator/apply', requireAuth, zValidator('json', applySchema), async (c) => {
    const userId = c.get('userId');
    const { businessName, businessType, phone, documentUrl } = c.req.valid('json');

    const existing = await first<any>(c.env.chillingz_db,
      'SELECT id FROM pending_professional_accounts WHERE user_id = ? AND status = \'pending\'',
      userId
    );
    if (existing) throw new ValidationError('You already have a pending application');

    const id = nanoid();
    await run(c.env.chillingz_db,
      `INSERT INTO pending_professional_accounts (id, user_id, business_name, business_type, phone, document_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      id, userId, businessName, businessType, phone, documentUrl || null
    );

    return created(c, { id });
  });

  // GET /creator/dashboard — creator dashboard stats
  app.get('/creator/dashboard', requireCreator, async (c) => {
    const userId = c.get('userId');

    const totalEvents = await first<{ count: number }>(
      c.env.chillingz_db, 'SELECT COUNT(*) as count FROM events WHERE created_by = ?', userId
    );

    const upcomingEvents = await first<{ count: number }>(
      c.env.chillingz_db, 'SELECT COUNT(*) as count FROM events WHERE created_by = ? AND start_time > datetime(\'now\')', userId
    );

    const totalRsvps = await first<{ count: number }>(
      c.env.chillingz_db, 'SELECT COUNT(*) as count FROM event_rsvps er JOIN events e ON e.id = er.event_id WHERE e.created_by = ?', userId
    );

    const recentEvents = await query<any>(
      c.env.chillingz_db,
      `SELECT e.*, COALESCE(er.count, 0) as rsvp_count FROM events e
       LEFT JOIN (SELECT event_id, COUNT(*) as count FROM event_rsvps GROUP BY event_id) er ON er.event_id = e.id
       WHERE e.created_by = ? ORDER BY e.created_at DESC LIMIT 10`,
      userId
    );

    const topEvent = recentEvents.length > 0 ? recentEvents.reduce((max: any, e: any) => e.rsvp_count > max.rsvp_count ? e : max, recentEvents[0]) : null;

    return success(c, {
      stats: {
        totalEvents: totalEvents?.count || 0,
        upcomingEvents: upcomingEvents?.count || 0,
        totalRsvps: totalRsvps?.count || 0,
        totalViews: recentEvents.reduce((s: number, e: any) => s + (e.view_count || 0), 0),
      },
      topEvent: topEvent ? { id: topEvent.id, title: topEvent.title, rsvpCount: topEvent.rsvp_count } : null,
      recentEvents: recentEvents.map((e: any) => ({
        id: e.id,
        title: e.title,
        startTime: e.start_time,
        rsvpCount: e.rsvp_count || 0,
        isFeatured: e.is_featured === 1,
        viewCount: e.view_count || 0,
      })),
    });
  });

  // GET /creator/events — creator's own events with management data
  app.get('/creator/events', requireCreator, async (c) => {
    const userId = c.get('userId');
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 50);
    const offset = (page - 1) * limit;
    const status = c.req.query('status'); // upcoming, past, all

    let whereClause = 'WHERE e.created_by = ?';
    const params: any[] = [userId];

    if (status === 'upcoming') {
      whereClause += ' AND e.start_time > datetime(\'now\')';
    } else if (status === 'past') {
      whereClause += ' AND e.start_time <= datetime(\'now\')';
    }

    const events = await query<any>(
      c.env.chillingz_db,
      `SELECT e.*, COALESCE(er.count, 0) as rsvp_count FROM events e
       LEFT JOIN (SELECT event_id, COUNT(*) as count FROM event_rsvps GROUP BY event_id) er ON er.event_id = e.id
       ${whereClause} ORDER BY e.start_time DESC LIMIT ? OFFSET ?`,
      ...params, limit, offset
    );

    const total = await first<{ count: number }>(
      c.env.chillingz_db, `SELECT COUNT(*) as count FROM events e ${whereClause}`, ...params
    );

    return paginated(c, events.map((e: any) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      type: e.type,
      startTime: e.start_time,
      endTime: e.end_time,
      location: e.location,
      venue: e.venue_id ? { id: e.venue_id, name: e.venue_name || e.location } : null,
      isFeatured: e.is_featured === 1,
      featuredUntil: e.featured_until,
      rsvpCount: e.rsvp_count,
      viewCount: e.view_count || 0,
      image: e.image_url,
      status: e.start_time > new Date().toISOString() ? 'upcoming' : 'past',
      createdAt: e.created_at,
    })), page, limit, total?.count || 0);
  });

  // POST /creator/events — create event as creator (publish immediately)
  const createEventSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(5000),
    type: z.enum(['concert', 'festival', 'club', 'comedy', 'art', 'sports', 'film', 'other']),
    startTime: z.string(),
    endTime: z.string().optional(),
    location: z.string().min(1).max(500),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    imageUrl: z.string().optional(),
    ticketUrl: z.string().optional(),
    venueId: z.string().optional(),
    tags: z.string().optional(),
  });

  app.post('/creator/events', requireCreator, zValidator('json', createEventSchema), async (c) => {
    const userId = c.get('userId');
    const data = c.req.valid('json');

    const id = nanoid();
    const now = new Date().toISOString();
    const agentName = c.env.AI?.run ? 'event-app' : undefined;

    let venueId = data.venueId;
    if (!venueId && data.location) {
      venueId = nanoid();
      await run(c.env.chillingz_db,
        `INSERT INTO venues (id, name, address, latitude, longitude, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        venueId, data.location, data.location, data.latitude || null, data.longitude || null, userId, now, now
      );
    }

    await run(c.env.chillingz_db,
      `INSERT INTO events (id, title, description, type, start_time, end_time, location, latitude, longitude, image_url, ticket_url, venue_id, created_by, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, data.title, data.description, data.type, data.startTime, data.endTime || null,
      data.location, data.latitude || null, data.longitude || null,
      data.imageUrl || null, data.ticketUrl || null, venueId || null, userId, data.tags || null, now, now
    );

    return created(c, { id });
  });

  // PATCH /creator/events/:id — update own event
  const updateEventSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(5000).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    location: z.string().min(1).max(500).optional(),
    imageUrl: z.string().optional(),
    ticketUrl: z.string().optional(),
    tags: z.string().optional(),
  });

  app.patch('/creator/events/:id', requireCreator, zValidator('json', updateEventSchema), async (c) => {
    const eventId = c.req.param('id');
    const userId = c.get('userId');
    const data = c.req.valid('json');

    const event = await first<any>(c.env.chillingz_db,
      'SELECT * FROM events WHERE id = ? AND created_by = ?',
      eventId, userId
    );
    if (!event) throw new NotFoundError('Event', eventId);

    const fields: string[] = [];
    const params: any[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        const col = key.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
        fields.push(`${col} = ?`);
        params.push(value);
      }
    }
    if (fields.length > 0) {
      params.push(eventId);
      await run(c.env.chillingz_db, `UPDATE events SET ${fields.join(', ')}, updated_at = ? WHERE id = ?`,
        ...params, new Date().toISOString()
      );
    }

    return success(c, { id: eventId });
  });

  // DELETE /creator/events/:id — delete own event
  app.delete('/creator/events/:id', requireCreator, async (c) => {
    const eventId = c.req.param('id');
    const userId = c.get('userId');

    const event = await first<any>(c.env.chillingz_db,
      'SELECT * FROM events WHERE id = ? AND created_by = ?',
      eventId, userId
    );
    if (!event) throw new NotFoundError('Event', eventId);

    await run(c.env.chillingz_db, 'DELETE FROM events WHERE id = ?', eventId);
    return success(c, { id: eventId });
  });

  // GET /creator/rsvps/:eventId — see who RSVP'd to your event
  app.get('/creator/rsvps/:eventId', requireCreator, async (c) => {
    const eventId = c.req.param('id');
    const userId = c.get('userId');

    const event = await first<any>(c.env.chillingz_db,
      'SELECT * FROM events WHERE id = ? AND created_by = ?',
      eventId, userId
    );
    if (!event) throw new NotFoundError('Event', eventId);

    const rsvps = await query<any>(
      c.env.chillingz_db,
      `SELECT er.*, u.id as uid, u.first_name, u.last_name, u.avatar_url FROM event_rsvps er
       JOIN users u ON u.id = er.user_id WHERE er.event_id = ? ORDER BY er.created_at DESC`,
      eventId
    );

    return success(c, rsvps.map((r: any) => ({
      userId: r.user_id,
      status: r.status,
      name: `${r.first_name} ${r.last_name}`,
      avatar: r.avatar_url || '',
      rsvpAt: r.created_at,
    })));
  });
}
