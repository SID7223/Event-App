import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Env } from '../env';
import { requireAuth } from '../lib/auth';
import { query, first, run } from '../lib/db';
import { success, paginated } from '../lib/response';
import { NotFoundError, ForbiddenError } from '../lib/errors';

export function register(app: Hono<{ Bindings: Env }>) {
  const requireAdmin = async (c: any, next: any) => {
    await requireAuth(c, async () => {
      const user = await first<any>(c.env.chillingz_db, 'SELECT role FROM users WHERE id = ?', c.get('userId'));
      if (!user || user.role !== 'admin') throw new ForbiddenError('Admin access required');
      await next();
    });
  };

  // GET /admin/professional-applications
  app.get('/admin/professional-applications', requireAdmin, async (c) => {
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 50);
    const offset = (page - 1) * limit;
    const status = c.req.query('status') || 'pending';

    const apps = await query<any>(
      c.env.chillingz_db,
      `SELECT p.*, u.first_name, u.last_name, u.email FROM pending_professional_accounts p
       JOIN users u ON u.id = p.user_id
       WHERE p.status = ?
       ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      status, limit, offset
    );

    const total = await first<{ count: number }>(
      c.env.chillingz_db,
      'SELECT COUNT(*) as count FROM pending_professional_accounts WHERE status = ?',
      status
    );

    return paginated(c, apps.map((a: any) => ({
      id: a.id,
      userId: a.user_id,
      name: `${a.first_name} ${a.last_name}`,
      email: a.email,
      businessName: a.business_name,
      businessType: a.business_type,
      phone: a.phone,
      documentUrl: a.document_url,
      status: a.status,
      createdAt: a.created_at,
    })), page, limit, total?.count || 0);
  });

  // PATCH /admin/professional-applications/:id — approve/reject
  const reviewSchema = z.object({
    status: z.enum(['approved', 'rejected']),
    notes: z.string().optional(),
  });

  app.patch('/admin/professional-applications/:id', requireAdmin, zValidator('json', reviewSchema), async (c) => {
    const appId = c.req.param('id');
    const adminId = c.get('userId');
    const { status } = c.req.valid('json');

    const app = await first<any>(c.env.chillingz_db,
      'SELECT * FROM pending_professional_accounts WHERE id = ?',
      appId
    );
    if (!app) throw new NotFoundError('Application', appId);

    await run(c.env.chillingz_db,
      'UPDATE pending_professional_accounts SET status = ?, reviewed_by = ?, updated_at = ? WHERE id = ?',
      status, adminId, new Date().toISOString(), appId
    );

    if (status === 'approved') {
      await run(c.env.chillingz_db,
        'UPDATE users SET role = \'creator\' WHERE id = ?',
        app.user_id
      );
    }

    return success(c, { id: appId, status });
  });

  // GET /admin/showtimes — showtimes overview
  app.get('/admin/showtimes', requireAdmin, async (c) => {
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 50);
    const offset = (page - 1) * limit;

    const showtimes = await query<any>(
      c.env.chillingz_db,
      `SELECT e.*, COUNT(er.id) as rsvp_count FROM events e
       LEFT JOIN event_rsvps er ON er.event_id = e.id
       WHERE e.type IN ('concert', 'festival', 'club', 'comedy', 'film')
       GROUP BY e.id
       ORDER BY e.start_time DESC LIMIT ? OFFSET ?`,
      limit, offset
    );

    const total = await first<{ count: number }>(
      c.env.chillingz_db,
      "SELECT COUNT(*) as count FROM events WHERE type IN ('concert','festival','club','comedy','film')"
    );

    return paginated(c, showtimes.map((s: any) => ({
      id: s.id,
      title: s.title,
      type: s.type,
      startTime: s.start_time,
      location: s.location,
      createdBy: s.created_by,
      rsvpCount: s.rsvp_count,
      isFeatured: s.is_featured === 1,
      status: s.start_time > new Date().toISOString() ? 'upcoming' : 'past',
    })), page, limit, total?.count || 0);
  });

  // PATCH /admin/showtimes/:id/feature — toggle featured status
  app.patch('/admin/showtimes/:id/feature', requireAdmin, async (c) => {
    const eventId = c.req.param('id');
    const isFeatured = c.req.query('featured') !== 'false';
    const now = new Date().toISOString();

    let featuredUntil = null;
    if (isFeatured) {
      const until = new Date();
      until.setDate(until.getDate() + 7);
      featuredUntil = until.toISOString();
    }

    await run(c.env.chillingz_db,
      'UPDATE events SET is_featured = ?, featured_until = ?, updated_at = ? WHERE id = ?',
      isFeatured ? 1 : 0, featuredUntil, now, eventId
    );

    return success(c, { id: eventId, isFeatured, featuredUntil });
  });

  // GET /admin/users — user management
  app.get('/admin/users', requireAdmin, async (c) => {
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 50);
    const offset = (page - 1) * limit;
    const search = c.req.query('search');

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (search) {
      whereClause += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const users = await query<any>(
      c.env.chillingz_db,
      `SELECT u.id, u.first_name, u.last_name, u.email, u.avatar_url, u.role, u.created_at,
              COALESCE(ec.count, 0) as event_count
       FROM users u
       LEFT JOIN (SELECT created_by, COUNT(*) as count FROM events GROUP BY created_by) ec ON ec.created_by = u.id
       ${whereClause}
       ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
      ...params, limit, offset
    );

    const total = await first<{ count: number }>(
      c.env.chillingz_db,
      `SELECT COUNT(*) as count FROM users u ${whereClause}`,
      ...params
    );

    return paginated(c, users.map((u: any) => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`,
      email: u.email,
      avatar: u.avatar_url || '',
      role: u.role,
      eventCount: u.event_count,
      createdAt: u.created_at,
    })), page, limit, total?.count || 0);
  });

  // PATCH /admin/users/:id/role
  app.patch('/admin/users/:id/role', requireAdmin, zValidator('json', z.object({ role: z.enum(['user', 'creator', 'admin']) })), async (c) => {
    const targetId = c.req.param('id');
    const { role } = c.req.valid('json');

    const user = await first<any>(c.env.chillingz_db, 'SELECT id FROM users WHERE id = ?', targetId);
    if (!user) throw new NotFoundError('User', targetId);

    await run(c.env.chillingz_db, 'UPDATE users SET role = ? WHERE id = ?', role, targetId);
    return success(c, { id: targetId, role });
  });
}
