import { Hono } from 'hono';
import { Env } from '../env';
import { requireAuth } from '../lib/auth';
import { query, first } from '../lib/db';
import { success } from '../lib/response';
import { getPusherConfig, authorizeChannel } from '../lib/pusher';

export function register(app: Hono<{ Bindings: Env }>) {
  app.post('/pusher/auth', requireAuth, async (c) => {
    const userId = c.get('userId');
    const db = c.env.chillingz_db;

    const bodyText = await c.req.text();
    let socketId: string;
    let channelName: string;
    try {
      const body = JSON.parse(bodyText);
      socketId = body.socket_id;
      channelName = body.channel_name;
    } catch {
      const params = new URLSearchParams(bodyText);
      socketId = params.get('socket_id') || '';
      channelName = params.get('channel_name') || '';
    }

    if (!socketId || !channelName) {
      return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing socket_id or channel_name' } }, 400);
    }

    if (!channelName.startsWith('private-')) {
      return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Only private channels are supported' } }, 400);
    }

    if (channelName.startsWith('private-conversation-')) {
      const conversationId = channelName.replace('private-conversation-', '');
      const participant = await first<any>(
        db,
        'SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL',
        conversationId, userId
      );
      if (!participant) {
        return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Not a participant of this conversation' } }, 403);
      }
    }

    const config = getPusherConfig(c.env as any);
    if (!config) {
      return c.json({ success: false, error: { code: 'CONFIG_ERROR', message: 'Pusher not configured' } }, 500);
    }

    const auth = authorizeChannel(config, socketId, channelName);
    return success(c, { auth });
  });
}
