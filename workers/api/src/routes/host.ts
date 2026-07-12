import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Env } from '../env';
import { requireAuth } from '../lib/auth';
import { query, first, run } from '../lib/db';
import { success, created } from '../lib/response';

function nanoid(size = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (let i = 0; i < size; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return id;
}

const submitEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().optional().default('19:00'),
  venueName: z.string().min(1, 'Venue name is required'),
  neighborhood: z.string().min(1, 'Neighborhood is required'),
  address: z.string().min(1, 'Address is required'),
  price: z.number().min(0).optional().default(0),
  imageUrl: z.string().optional(),
  externalLink: z.string().optional(),
});

export function register(app: Hono<{ Bindings: Env }>) {
  app.post('/events/hosted', requireAuth, zValidator('json', submitEventSchema), async (c) => {
    const body = c.req.valid('json');
    const userId = c.get('userId');
    const pendingId = `pevt_${nanoid(12)}`;

    let categoryId: string | null = null;
    if (body.category) {
      const cat = await first<{ id: string }>(
        c.env.chillingz_db,
        'SELECT id FROM categories WHERE id = ? OR name = ?',
        body.category, body.category
      );
      if (cat) categoryId = cat.id;
    }

    await run(
      c.env.chillingz_db,
      `INSERT INTO pending_events (id, user_id, title, description, category_id, date, time, venue_name, neighborhood, address, price, image_url, external_link, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
      pendingId, userId, body.title, body.description, categoryId,
      body.date, body.time, body.venueName, body.neighborhood,
      body.address, body.price, body.imageUrl || null, body.externalLink || null
    );

    return created(c, {
      id: pendingId,
      title: body.title,
      status: 'pending',
    });
  });

  app.get('/events/hosted', requireAuth, async (c) => {
    const userId = c.get('userId');
    const events = await query<{
      id: string;
      title: string;
      description: string;
      date: string;
      time: string;
      venue_name: string;
      neighborhood: string;
      price: number;
      status: string;
      created_at: string;
    }>(
      c.env.chillingz_db,
      'SELECT id, title, description, date, time, venue_name, neighborhood, price, status, created_at FROM pending_events WHERE user_id = ? ORDER BY created_at DESC',
      userId
    );

    return success(c, events.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date,
      time: e.time,
      venueName: e.venue_name,
      neighborhood: e.neighborhood,
      price: e.price,
      status: e.status,
      createdAt: e.created_at,
    })));
  });
}
