import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { Env } from '../env';
import { requireAuth, optionalAuth } from '../lib/auth';
import { query, first, run } from '../lib/db';
import { success, paginated } from '../lib/response';
import { NotFoundError, ValidationError } from '../lib/errors';
import { createEventSchema, updateEventSchema, eventQuerySchema } from '../schemas/event';

interface EventRow {
  id: string;
  title: string;
  description: string;
  category_id: string | null;
  image_id: string | null;
  price: number;
  location: string;
  date: string;
  time: string;
  organizer_id: string | null;
  venue_id: string | null;
  attendees: number;
  rating: number;
  is_featured: number;
  featured_until: string | null;
  neighborhood: string | null;
  city: string;
  booking_type: string;
  external_link: string | null;
  whatsapp_number: string | null;
  data_source: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CategoryRow {
  id: string;
  name: string;
}

interface FavoriteRow {
  event_id: string;
}

function mapEvent(row: EventRow, categoryName?: string, isFavorited = false) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: categoryName || row.category_id || '',
    image: `https://media.corlify.com/images/${row.image_id || ''}`,
    imageId: row.image_id || undefined,
    price: row.price,
    location: row.location,
    date: row.date,
    time: row.time,
    organizer: row.organizer_id || '',
    organizerId: row.organizer_id || undefined,
    venue: row.venue_id || '',
    venueId: row.venue_id || undefined,
    attendees: row.attendees,
    rating: row.rating,
    isFavorite: isFavorited,
    isFeatured: row.is_featured === 1,
    featuredUntil: row.featured_until || undefined,
    neighborhood: row.neighborhood || undefined,
    city: row.city as 'lahore' | 'karachi' | 'islamabad' | undefined,
    bookingType: row.booking_type as 'external_link' | 'whatsapp' | 'in_app',
    externalLink: row.external_link,
    whatsappNumber: row.whatsapp_number,
    dataSource: row.data_source as 'ticketwala' | 'bookme' | 'manual_entry' | 'user_host',
  };
}

function buildWhereClause(query: Record<string, string | undefined>): { sql: string; params: unknown[] } {
  const conditions: string[] = ["e.status = 'active'", "e.date >= date('now')"];
  const params: unknown[] = [];

  if (query.category) {
    conditions.push('(c.name = ? OR c.id = ?)');
    params.push(query.category, query.category);
  }

  if (query.city) {
    conditions.push('e.city = ?');
    params.push(query.city);
  }

  if (query.neighborhood) {
    conditions.push('e.neighborhood = ?');
    params.push(query.neighborhood);
  }

  if (query.q) {
    conditions.push("(e.title LIKE ? OR e.location LIKE ? OR e.description LIKE ?)");
    const term = `%${query.q}%`;
    params.push(term, term, term);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { sql: where, params };
}

export function register(app: Hono<{ Bindings: Env }>) {
  app.get('/events', optionalAuth, async (c) => {
    const queryParams = eventQuerySchema.parse(c.req.query());
    const { sql: where, params } = buildWhereClause(c.req.query() as Record<string, string>);
    const offset = (queryParams.page - 1) * queryParams.limit;

    let orderBy = 'e.date ASC';
    if (queryParams.sort === 'popular') orderBy = 'e.attendees DESC';
    if (queryParams.sort === 'rating') orderBy = 'e.rating DESC';

    const countResult = await first<{ total: number }>(
      c.env.chillingz_db,
      `SELECT COUNT(*) as total FROM events e LEFT JOIN categories c ON e.category_id = c.id ${where}`,
      ...params
    );
    const total = countResult?.total ?? 0;

    const events = await query<EventRow>(
      c.env.chillingz_db,
      `SELECT e.* FROM events e LEFT JOIN categories c ON e.category_id = c.id ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      ...params, queryParams.limit, offset
    );

    const userId = c.get('userId');
    let favoritedIds = new Set<string>();
    if (userId) {
      const favs = await query<FavoriteRow>(
        c.env.chillingz_db,
        'SELECT event_id FROM favorites WHERE user_id = ?',
        userId
      );
      favoritedIds = new Set(favs.map(f => f.event_id));
    }

    const data = await Promise.all(events.map(async (event) => {
      let categoryName: string | undefined;
      if (event.category_id) {
        const cat = await first<CategoryRow>(
          c.env.chillingz_db,
          'SELECT name FROM categories WHERE id = ?',
          event.category_id
        );
        categoryName = cat?.name;
      }
      return mapEvent(event, categoryName, favoritedIds.has(event.id));
    }));

    return paginated(c, data, total, queryParams.page, queryParams.limit);
  });

  app.get('/events/featured', async (c) => {
    const events = await query<EventRow>(
      c.env.chillingz_db,
      "SELECT * FROM events WHERE status = 'active' AND is_featured = 1 AND date >= date('now') AND (featured_until IS NULL OR featured_until >= date('now')) ORDER BY attendees DESC LIMIT 10"
    );

    const data = await Promise.all(events.map(async (event) => {
      let categoryName: string | undefined;
      if (event.category_id) {
        const cat = await first<CategoryRow>(
          c.env.chillingz_db,
          'SELECT name FROM categories WHERE id = ?',
          event.category_id
        );
        categoryName = cat?.name;
      }
      return mapEvent(event, categoryName);
    }));

    return success(c, data);
  });

  app.get('/events/popular', async (c) => {
    const events = await query<EventRow>(
      c.env.chillingz_db,
      "SELECT * FROM events WHERE status = 'active' ORDER BY attendees DESC LIMIT 20"
    );

    const data = await Promise.all(events.map(async (event) => {
      let categoryName: string | undefined;
      if (event.category_id) {
        const cat = await first<CategoryRow>(
          c.env.chillingz_db,
          'SELECT name FROM categories WHERE id = ?',
          event.category_id
        );
        categoryName = cat?.name;
      }
      return mapEvent(event, categoryName);
    }));

    return success(c, data);
  });

  app.get('/events/upcoming', async (c) => {
    const events = await query<EventRow>(
      c.env.chillingz_db,
      "SELECT * FROM events WHERE status = 'active' AND date >= date('now') ORDER BY date ASC LIMIT 20"
    );

    const data = await Promise.all(events.map(async (event) => {
      let categoryName: string | undefined;
      if (event.category_id) {
        const cat = await first<CategoryRow>(
          c.env.chillingz_db,
          'SELECT name FROM categories WHERE id = ?',
          event.category_id
        );
        categoryName = cat?.name;
      }
      return mapEvent(event, categoryName);
    }));

    return success(c, data);
  });

  app.get('/events/:id', optionalAuth, async (c) => {
    const id = c.req.param('id');
    const event = await first<EventRow>(
      c.env.chillingz_db,
      "SELECT * FROM events WHERE id = ? AND status = 'active'",
      id
    );

    if (!event) throw new NotFoundError('Event', id);

    let categoryName: string | undefined;
    if (event.category_id) {
      const cat = await first<CategoryRow>(
        c.env.chillingz_db,
        'SELECT name FROM categories WHERE id = ?',
        event.category_id
      );
      categoryName = cat?.name;
    }

    const userId = c.get('userId');
    let isFavorited = false;
    if (userId) {
      const fav = await first<{ id: string }>(
        c.env.chillingz_db,
        'SELECT id FROM favorites WHERE user_id = ? AND event_id = ?',
        userId, id
      );
      isFavorited = !!fav;
    }

    return success(c, mapEvent(event, categoryName, isFavorited));
  });

  app.post('/events', requireAuth, zValidator('json', createEventSchema), async (c) => {
    const body = c.req.valid('json');
    const userId = c.get('userId');
    const eventId = `evt_${nanoid(12)}`;

    let categoryId: string | null = null;
    if (body.category) {
      const cat = await first<{ id: string }>(
        c.env.chillingz_db,
        'SELECT id FROM categories WHERE id = ? OR name = ?',
        body.category, body.category
      );
      if (cat) categoryId = cat.id;
    }

    const imageId = body.image && body.image.startsWith('img_') ? body.image : null;

    const isFeatured = body.featured ? 1 : 0;
    const featuredUntil = body.featuredUntil || null;

    await run(
      c.env.chillingz_db,
      `INSERT INTO events (id, title, description, category_id, image_id, price, location, date, time, organizer_id, neighborhood, city, booking_type, external_link, whatsapp_number, data_source, attendees, rating, is_featured, featured_until, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, datetime('now'), datetime('now'))`,
      eventId, body.title, body.description, categoryId, imageId, body.price,
      body.location, body.date, body.time, body.organizerId || userId,
      body.neighborhood || null, body.city, body.bookingType,
      body.externalLink || null, body.whatsappNumber || null, body.dataSource,
      isFeatured, featuredUntil
    );

    const created = await first<EventRow>(
      c.env.chillingz_db,
      'SELECT * FROM events WHERE id = ?',
      eventId
    );

    return success(c, mapEvent(created!), 201);
  });

  app.put('/events/:id', requireAuth, zValidator('json', updateEventSchema), async (c) => {
    const id = c.req.param('id');
    const existing = await first<EventRow>(
      c.env.chillingz_db,
      "SELECT * FROM events WHERE id = ? AND status = 'active'",
      id
    );
    if (!existing) throw new NotFoundError('Event', id);

    const body = c.req.valid('json');
    const updates: string[] = [];
    const params: unknown[] = [];

    if (body.title !== undefined) { updates.push('title = ?'); params.push(body.title); }
    if (body.description !== undefined) { updates.push('description = ?'); params.push(body.description); }
    if (body.price !== undefined) { updates.push('price = ?'); params.push(body.price); }
    if (body.location !== undefined) { updates.push('location = ?'); params.push(body.location); }
    if (body.date !== undefined) { updates.push('date = ?'); params.push(body.date); }
    if (body.time !== undefined) { updates.push('time = ?'); params.push(body.time); }
    if (body.neighborhood !== undefined) { updates.push('neighborhood = ?'); params.push(body.neighborhood); }
    if (body.city !== undefined) { updates.push('city = ?'); params.push(body.city); }
    if (body.bookingType !== undefined) { updates.push('booking_type = ?'); params.push(body.bookingType); }
    if (body.externalLink !== undefined) { updates.push('external_link = ?'); params.push(body.externalLink); }
    if (body.whatsappNumber !== undefined) { updates.push('whatsapp_number = ?'); params.push(body.whatsappNumber); }
    if (body.featured !== undefined) { updates.push('is_featured = ?'); params.push(body.featured ? 1 : 0); }
    if (body.featuredUntil !== undefined) { updates.push('featured_until = ?'); params.push(body.featuredUntil || null); }

    if (body.category !== undefined) {
      const cat = await first<{ id: string }>(
        c.env.chillingz_db,
        'SELECT id FROM categories WHERE id = ? OR name = ?',
        body.category, body.category
      );
      updates.push('category_id = ?');
      params.push(cat?.id || null);
    }

    if (updates.length === 0) {
      throw new ValidationError('No fields to update');
    }

    updates.push("updated_at = datetime('now')");
    params.push(id);

    await run(
      c.env.chillingz_db,
      `UPDATE events SET ${updates.join(', ')} WHERE id = ?`,
      ...params
    );

    const updated = await first<EventRow>(
      c.env.chillingz_db,
      'SELECT * FROM events WHERE id = ?',
      id
    );

    let categoryName: string | undefined;
    if (updated?.category_id) {
      const cat = await first<CategoryRow>(
        c.env.chillingz_db,
        'SELECT name FROM categories WHERE id = ?',
        updated.category_id
      );
      categoryName = cat?.name;
    }

    return success(c, mapEvent(updated!, categoryName));
  });

  app.delete('/events/:id', requireAuth, async (c) => {
    const id = c.req.param('id');
    const existing = await first<{ id: string }>(
      c.env.chillingz_db,
      "SELECT id FROM events WHERE id = ? AND status = 'active'",
      id
    );
    if (!existing) throw new NotFoundError('Event', id);

    await run(
      c.env.chillingz_db,
      "UPDATE events SET status = 'inactive', updated_at = datetime('now') WHERE id = ?",
      id
    );

    return c.json({ success: true, data: null });
  });
}

function nanoid(size = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (let i = 0; i < size; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return id;
}
