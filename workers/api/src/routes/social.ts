import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Env } from '../env';
import { requireAuth } from '../lib/auth';
import { query, first, run } from '../lib/db';
import { success, created, deleted } from '../lib/response';
import { NotFoundError, ConflictError, ValidationError } from '../lib/errors';

function nanoid(size = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (let i = 0; i < size; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return id;
}

export function register(app: Hono<{ Bindings: Env }>) {
  app.post('/favorites/:eventId', requireAuth, async (c) => {
    const eventId = c.req.param('eventId');
    const userId = c.get('userId');

    const event = await first<{ id: string }>(
      c.env.chillingz_db,
      "SELECT id FROM events WHERE id = ? AND status = 'active'",
      eventId
    );
    if (!event) throw new NotFoundError('Event', eventId);

    const existing = await first<{ id: string }>(
      c.env.chillingz_db,
      'SELECT id FROM favorites WHERE user_id = ? AND event_id = ?',
      userId, eventId
    );

    if (existing) {
      await run(c.env.chillingz_db, 'DELETE FROM favorites WHERE id = ?', existing.id);
      return success(c, { eventId, favorited: false });
    }

    await run(
      c.env.chillingz_db,
      'INSERT INTO favorites (id, user_id, event_id, created_at) VALUES (?, ?, ?, datetime(\'now\'))',
      nanoid(), userId, eventId
    );

    return created(c, { eventId, favorited: true });
  });

  app.delete('/favorites/:eventId', requireAuth, async (c) => {
    const eventId = c.req.param('eventId');
    const userId = c.get('userId');

    const existing = await first<{ id: string }>(
      c.env.chillingz_db,
      'SELECT id FROM favorites WHERE user_id = ? AND event_id = ?',
      userId, eventId
    );
    if (!existing) throw new NotFoundError('Favorite');

    await run(c.env.chillingz_db, 'DELETE FROM favorites WHERE id = ?', existing.id);
    return deleted(c);
  });

  app.get('/favorites', requireAuth, async (c) => {
    const userId = c.get('userId');
    const eventIds = await query<{ event_id: string }>(
      c.env.chillingz_db,
      'SELECT event_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
      userId
    );
    return success(c, eventIds.map(e => e.event_id));
  });

  app.get('/follows', requireAuth, async (c) => {
    const userId = c.get('userId');
    const follows = await query<{ entity_id: string; entity_type: string; created_at: string }>(
      c.env.chillingz_db,
      'SELECT entity_id, entity_type, created_at FROM follows WHERE user_id = ? ORDER BY created_at DESC',
      userId
    );

    const venueIds = follows.filter(f => f.entity_type === 'venue').map(f => f.entity_id);
    const organizerIds = follows.filter(f => f.entity_type === 'organizer').map(f => f.entity_id);

    const venues = venueIds.length > 0
      ? await query<{ id: string; name: string }>(
          c.env.chillingz_db,
          `SELECT id, name FROM venues WHERE id IN (${venueIds.map(() => '?').join(',')})`,
          ...venueIds
        )
      : [];

    const organizers = organizerIds.length > 0
      ? await query<{ id: string; name: string }>(
          c.env.chillingz_db,
          `SELECT id, name FROM venues WHERE id IN (${organizerIds.map(() => '?').join(',')})`,
          ...organizerIds
        )
      : [];

    return success(c, {
      venues: venues.map(v => ({ id: v.id, name: v.name })),
      organizers: organizers.map(o => ({ id: o.id, name: o.name })),
    });
  });

  app.post('/follows/venue/:id', requireAuth, async (c) => {
    const entityId = c.req.param('id');
    const userId = c.get('userId');

    const venue = await first<{ id: string }>(
      c.env.chillingz_db,
      "SELECT id FROM venues WHERE id = ? AND type = 'venue'",
      entityId
    );
    if (!venue) throw new NotFoundError('Venue', entityId);

    const existing = await first<{ id: string }>(
      c.env.chillingz_db,
      'SELECT id FROM follows WHERE user_id = ? AND entity_id = ? AND entity_type = ?',
      userId, entityId, 'venue'
    );
    if (existing) throw new ConflictError('Already following this venue');

    await run(
      c.env.chillingz_db,
      'INSERT INTO follows (id, user_id, entity_id, entity_type, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))',
      nanoid(), userId, entityId, 'venue'
    );

    await run(
      c.env.chillingz_db,
      'UPDATE venues SET follower_count = follower_count + 1 WHERE id = ?',
      entityId
    );

    return created(c, { entityId, entityType: 'venue', following: true });
  });

  app.delete('/follows/venue/:id', requireAuth, async (c) => {
    const entityId = c.req.param('id');
    const userId = c.get('userId');

    const existing = await first<{ id: string }>(
      c.env.chillingz_db,
      'SELECT id FROM follows WHERE user_id = ? AND entity_id = ? AND entity_type = ?',
      userId, entityId, 'venue'
    );
    if (!existing) throw new NotFoundError('Follow');

    await run(c.env.chillingz_db, 'DELETE FROM follows WHERE id = ?', existing.id);
    await run(
      c.env.chillingz_db,
      'UPDATE venues SET follower_count = MAX(0, follower_count - 1) WHERE id = ?',
      entityId
    );

    return deleted(c);
  });

  app.post('/follows/organizer/:id', requireAuth, async (c) => {
    const entityId = c.req.param('id');
    const userId = c.get('userId');

    const organizer = await first<{ id: string }>(
      c.env.chillingz_db,
      "SELECT id FROM venues WHERE id = ? AND type = 'organizer'",
      entityId
    );
    if (!organizer) throw new NotFoundError('Organizer', entityId);

    const existing = await first<{ id: string }>(
      c.env.chillingz_db,
      'SELECT id FROM follows WHERE user_id = ? AND entity_id = ? AND entity_type = ?',
      userId, entityId, 'organizer'
    );
    if (existing) throw new ConflictError('Already following this organizer');

    await run(
      c.env.chillingz_db,
      'INSERT INTO follows (id, user_id, entity_id, entity_type, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))',
      nanoid(), userId, entityId, 'organizer'
    );

    await run(
      c.env.chillingz_db,
      'UPDATE venues SET follower_count = follower_count + 1 WHERE id = ?',
      entityId
    );

    return created(c, { entityId, entityType: 'organizer', following: true });
  });

  app.delete('/follows/organizer/:id', requireAuth, async (c) => {
    const entityId = c.req.param('id');
    const userId = c.get('userId');

    const existing = await first<{ id: string }>(
      c.env.chillingz_db,
      'SELECT id FROM follows WHERE user_id = ? AND entity_id = ? AND entity_type = ?',
      userId, entityId, 'organizer'
    );
    if (!existing) throw new NotFoundError('Follow');

    await run(c.env.chillingz_db, 'DELETE FROM follows WHERE id = ?', existing.id);
    await run(
      c.env.chillingz_db,
      'UPDATE venues SET follower_count = MAX(0, follower_count - 1) WHERE id = ?',
      entityId
    );

    return deleted(c);
  });

  app.get('/friends', requireAuth, async (c) => {
    const userId = c.get('userId');
    const friends = await query<{ friend_id: string; created_at: string }>(
      c.env.chillingz_db,
      'SELECT friend_id, created_at FROM friends WHERE user_id = ? ORDER BY created_at DESC',
      userId
    );

    if (friends.length === 0) return success(c, []);

    const friendIds = friends.map(f => f.friend_id);
    const users = await query<{ id: string; first_name: string; last_name: string; avatar_url: string | null; city: string; gender: string | null }>(
      c.env.chillingz_db,
      `SELECT id, first_name, last_name, avatar_url, city, gender FROM users WHERE id IN (${friendIds.map(() => '?').join(',')})`,
      ...friendIds
    );

    return success(c, users.map(u => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`,
      handle: `@${u.first_name.toLowerCase()}${u.last_name.toLowerCase()}.events`,
      avatar: u.avatar_url || '',
      city: u.city || '',
      gender: u.gender || null,
      mutualFriends: 0,
      isOnline: false,
    })));
  });

  app.get('/friends/suggestions', requireAuth, async (c) => {
    const userId = c.get('userId');
    const limit = Math.min(parseInt(c.req.query('limit') || '10'), 50);

    const currentUser = await first<{ city: string; gender: string | null }>(
      c.env.chillingz_db,
      'SELECT city, gender FROM users WHERE id = ?',
      userId
    );

    if (!currentUser || !currentUser.city) {
      return success(c, { suggestions: [] });
    }

    const existingFriendIds = await query<{ friend_id: string }>(
      c.env.chillingz_db,
      'SELECT friend_id FROM friends WHERE user_id = ?',
      userId
    );

    const excludeIds = [userId, ...existingFriendIds.map(f => f.friend_id)];

    const oppositeGender = currentUser.gender === 'male' ? 'female'
      : currentUser.gender === 'female' ? 'male'
      : null;

    let suggestions: any[];
    if (oppositeGender) {
      suggestions = await query(
        c.env.chillingz_db,
        `SELECT id, first_name, last_name, avatar_url, city, gender FROM users
         WHERE city = ? AND (gender = ? OR gender IS NULL)
         AND id NOT IN (${excludeIds.map(() => '?').join(',')})
         ORDER BY CASE WHEN gender = ? THEN 0 ELSE 1 END
         LIMIT ?`,
        currentUser.city, oppositeGender, ...excludeIds, oppositeGender, limit
      );
    } else {
      suggestions = await query(
        c.env.chillingz_db,
        `SELECT id, first_name, last_name, avatar_url, city, gender FROM users
         WHERE city = ? AND id NOT IN (${excludeIds.map(() => '?').join(',')})
         LIMIT ?`,
        currentUser.city, ...excludeIds, limit
      );
    }

    return success(c, {
      suggestions: suggestions.map(u => ({
        id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        handle: `@${u.first_name.toLowerCase()}${u.last_name.toLowerCase()}.events`,
        avatar: u.avatar_url || '',
        city: u.city || '',
        gender: u.gender || null,
        mutualFriends: 0,
        isOnline: false,
      })),
    });
  });

  app.get('/friends/search', requireAuth, async (c) => {
    const q = c.req.query('q');
    const limit = Math.min(parseInt(c.req.query('limit') || '10'), 50);

    if (!q || q.length < 2) {
      return success(c, { results: [] });
    }

    const userId = c.get('userId');
    const searchTerm = `%${q}%`;

    const results = await query(
      c.env.chillingz_db,
      `SELECT id, first_name, last_name, avatar_url, city, gender FROM users
       WHERE id != ? AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)
       LIMIT ?`,
      userId, searchTerm, searchTerm, searchTerm, limit
    );

    return success(c, {
      results: results.map(u => ({
        id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        handle: `@${u.first_name.toLowerCase()}${u.last_name.toLowerCase()}.events`,
        avatar: u.avatar_url || '',
        city: u.city || '',
        gender: u.gender || null,
        mutualFriends: 0,
        isOnline: false,
      })),
    });
  });

  app.post('/friends/:id', requireAuth, async (c) => {
    const friendId = c.req.param('id');
    const userId = c.get('userId');

    if (userId === friendId) {
      throw new ValidationError('Cannot add yourself as a friend');
    }

    const user = await first<{ id: string }>(
      c.env.chillingz_db,
      'SELECT id FROM users WHERE id = ?',
      friendId
    );
    if (!user) throw new NotFoundError('User', friendId);

    const existing = await first<{ id: string }>(
      c.env.chillingz_db,
      'SELECT id FROM friends WHERE user_id = ? AND friend_id = ?',
      userId, friendId
    );
    if (existing) throw new ConflictError('Already friends');

    await run(
      c.env.chillingz_db,
      'INSERT INTO friends (id, user_id, friend_id, created_at) VALUES (?, ?, ?, datetime(\'now\'))',
      nanoid(), userId, friendId
    );

    return created(c, { userId, friendId });
  });

  app.delete('/friends/:id', requireAuth, async (c) => {
    const friendId = c.req.param('id');
    const userId = c.get('userId');

    const existing = await first<{ id: string }>(
      c.env.chillingz_db,
      'SELECT id FROM friends WHERE user_id = ? AND friend_id = ?',
      userId, friendId
    );
    if (!existing) throw new NotFoundError('Friendship');

    await run(c.env.chillingz_db, 'DELETE FROM friends WHERE id = ?', existing.id);
    return deleted(c);
  });

  const privacySchema = z.object({
    hideRSVPs: z.boolean(),
  });

  app.get('/privacy', requireAuth, async (c) => {
    const userId = c.get('userId');
    const settings = await first<{ hide_rsvps: number }>(
      c.env.chillingz_db,
      'SELECT hide_rsvps FROM privacy_settings WHERE user_id = ?',
      userId
    );
    return success(c, { hideRSVPs: settings ? settings.hide_rsvps === 1 : false });
  });

  app.put('/privacy', requireAuth, zValidator('json', privacySchema), async (c) => {
    const body = c.req.valid('json');
    const userId = c.get('userId');

    await run(
      c.env.chillingz_db,
      'INSERT INTO privacy_settings (user_id, hide_rsvps) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET hide_rsvps = ?',
      userId, body.hideRSVPs ? 1 : 0, body.hideRSVPs ? 1 : 0
    );

    return success(c, { hideRSVPs: body.hideRSVPs });
  });
}
