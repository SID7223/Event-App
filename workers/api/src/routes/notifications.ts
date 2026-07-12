import { Hono } from 'hono';
import { Env } from '../env';
import { requireAuth } from '../lib/auth';
import { query, first, run } from '../lib/db';
import { success } from '../lib/response';
import { NotFoundError } from '../lib/errors';

interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  icon: string | null;
  is_read: number;
  created_at: string;
}

function mapNotification(row: NotificationRow) {
  const iconMap: Record<string, string> = {
    booking: 'checkmark-circle',
    reminder: 'alarm',
    promotion: 'pricetag',
    update: 'information-circle',
    error: 'alert-circle',
    recommendation: 'compass',
    feedback: 'chatbubble',
  };

  return {
    id: row.id,
    title: row.title,
    message: row.message,
    time: row.created_at,
    read: row.is_read === 1,
    type: row.type,
    icon: row.icon || iconMap[row.type] || 'information-circle',
  };
}

export function register(app: Hono<{ Bindings: Env }>) {
  app.get('/notifications', requireAuth, async (c) => {
    const userId = c.get('userId');
    const unreadOnly = c.req.query('unread') === 'true';

    let sql = 'SELECT * FROM notifications WHERE user_id = ?';
    const params: unknown[] = [userId];

    if (unreadOnly) {
      sql += ' AND is_read = 0';
    }

    sql += ' ORDER BY created_at DESC LIMIT 50';

    const notifications = await query<NotificationRow>(
      c.env.chillingz_db,
      sql,
      ...params
    );

    const unreadCount = await first<{ count: number }>(
      c.env.chillingz_db,
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      userId
    );

    return success(c, {
      items: notifications.map(mapNotification),
      unreadCount: unreadCount?.count ?? 0,
    });
  });

  app.put('/notifications/:id/read', requireAuth, async (c) => {
    const id = c.req.param('id');
    const userId = c.get('userId');

    const existing = await first<{ id: string }>(
      c.env.chillingz_db,
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      id, userId
    );
    if (!existing) throw new NotFoundError('Notification', id);

    await run(
      c.env.chillingz_db,
      'UPDATE notifications SET is_read = 1 WHERE id = ?',
      id
    );

    return success(c, { id, read: true });
  });

  app.put('/notifications/read-all', requireAuth, async (c) => {
    const userId = c.get('userId');

    await run(
      c.env.chillingz_db,
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      userId
    );

    return success(c, { readAll: true });
  });
}
