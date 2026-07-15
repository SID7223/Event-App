import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Env } from '../env';
import { requireAuth } from '../lib/auth';
import { query, first, run } from '../lib/db';
import { success, created, deleted } from '../lib/response';
import { NotFoundError, ValidationError } from '../lib/errors';

function nanoid(size = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (let i = 0; i < size; i++) id += chars[bytes[i] % chars.length];
  return id;
}

function getWsStub(env: Env) {
  if (!env.WEBSOCKET_DO) return null;
  const doId = env.WEBSOCKET_DO.idFromName('websocket');
  return env.WEBSOCKET_DO.get(doId);
}

export function register(app: Hono<{ Bindings: Env }>) {
  // GET /conversations — list user's conversations
  app.get('/conversations', requireAuth, async (c) => {
    const userId = c.get('userId');
    const conversations = await query<any>(
      c.env.chillingz_db,
      `SELECT c.* FROM conversations c
       INNER JOIN conversation_participants cp ON cp.conversation_id = c.id
       WHERE cp.user_id = ? AND cp.left_at IS NULL
       ORDER BY c.last_message_at DESC, c.updated_at DESC`,
      userId
    );

    const results = await Promise.all(conversations.map(async (conv) => {
      const participants = await query<any>(
        c.env.chillingz_db,
        `SELECT cp.*, u.id as uid, u.first_name, u.last_name, u.avatar_url, u.is_online, u.last_seen
         FROM conversation_participants cp
         JOIN users u ON u.id = cp.user_id
         WHERE cp.conversation_id = ? AND cp.left_at IS NULL`,
        conv.id
      );

      const unread = await first<{ count: number }>(
        c.env.chillingz_db,
        `SELECT COUNT(*) as count FROM messages m
         LEFT JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id AND cp.user_id = ?
         WHERE m.conversation_id = ? AND m.sender_id != ? AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01')`,
        userId, conv.id, userId
      );

      return {
        id: conv.id,
        type: conv.type,
        title: conv.title,
        participants: participants.map((p: any) => ({
          userId: p.uid,
          role: p.role,
          user: {
            id: p.uid,
            firstName: p.first_name,
            lastName: p.last_name,
            avatar: p.avatar_url || '',
            isOnline: p.is_online === 1,
            lastSeen: p.last_seen,
          },
        })),
        lastMessagePreview: conv.last_message_preview,
        lastMessageAt: conv.last_message_at,
        unreadCount: unread?.count || 0,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
      };
    }));

    return success(c, results);
  });

  // POST /conversations — create a conversation
  const createConversationSchema = z.object({
    participantIds: z.array(z.string()).min(1).max(10),
    title: z.string().optional(),
  });

  app.post('/conversations', requireAuth, zValidator('json', createConversationSchema), async (c) => {
    const userId = c.get('userId');
    const { participantIds, title } = c.req.valid('json');

    const allParticipantIds = [...new Set([userId, ...participantIds])];

    // For direct 1-on-1, check if conversation already exists
    if (allParticipantIds.length === 2) {
      const existing = await first<any>(
        c.env.chillingz_db,
        `SELECT c.id FROM conversations c
         WHERE c.type = 'direct' AND c.id IN (
           SELECT cp1.conversation_id FROM conversation_participants cp1
           INNER JOIN conversation_participants cp2 ON cp2.conversation_id = cp1.conversation_id
           WHERE cp1.user_id = ? AND cp2.user_id = ? AND cp1.left_at IS NULL AND cp2.left_at IS NULL
           GROUP BY cp1.conversation_id HAVING COUNT(*) = 2
         )`,
        ...allParticipantIds
      );
      if (existing) return success(c, { id: existing.id, existing: true });
    }

    const convId = nanoid();
    await run(c.env.chillingz_db, 'INSERT INTO conversations (id, type, title, created_by) VALUES (?, ?, ?, ?)',
      convId, allParticipantIds.length === 2 ? 'direct' : 'group', title || null, userId
    );

    for (const pid of allParticipantIds) {
      await run(c.env.chillingz_db,
        'INSERT INTO conversation_participants (conversation_id, user_id, role) VALUES (?, ?, ?)',
        convId, pid, pid === userId ? 'admin' : 'member'
      );
    }

    return created(c, { id: convId, existing: false });
  });

  // GET /conversations/:id — get single conversation
  app.get('/conversations/:id', requireAuth, async (c) => {
    const conversationId = c.req.param('id');
    const userId = c.get('userId');

    const conv = await first<any>(c.env.chillingz_db, 'SELECT * FROM conversations WHERE id = ?', conversationId);
    if (!conv) throw new NotFoundError('Conversation', conversationId);

    const participant = await first<any>(c.env.chillingz_db,
      'SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL',
      conversationId, userId
    );
    if (!participant) throw new NotFoundError('Conversation', conversationId);

    const participants = await query<any>(
      c.env.chillingz_db,
      `SELECT cp.*, u.id as uid, u.first_name, u.last_name, u.avatar_url, u.is_online
       FROM conversation_participants cp JOIN users u ON u.id = cp.user_id
       WHERE cp.conversation_id = ? AND cp.left_at IS NULL`,
      conversationId
    );

    return success(c, {
      id: conv.id,
      type: conv.type,
      title: conv.title,
      createdBy: conv.created_by,
      participants: participants.map((p: any) => ({
        userId: p.uid,
        role: p.role,
        mutedUntil: p.muted_until,
        user: {
          id: p.uid,
          firstName: p.first_name,
          lastName: p.last_name,
          avatar: p.avatar_url || '',
          isOnline: p.is_online === 1,
        },
      })),
      createdAt: conv.created_at,
    });
  });

  // GET /conversations/:id/messages — list messages
  app.get('/conversations/:id/messages', requireAuth, async (c) => {
    const conversationId = c.req.param('id');
    const userId = c.get('userId');
    const cursor = c.req.query('cursor');
    const limit = Math.min(parseInt(c.req.query('limit') || '30'), 100);

    const participant = await first<any>(c.env.chillingz_db,
      'SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL',
      conversationId, userId
    );
    if (!participant) throw new NotFoundError('Conversation', conversationId);

    const messages = cursor
      ? await query<any>(
          c.env.chillingz_db,
          `SELECT m.*, u.first_name, u.last_name FROM messages m
           JOIN users u ON u.id = m.sender_id
           WHERE m.conversation_id = ? AND m.deleted_at IS NULL AND m.created_at < ?
           ORDER BY m.created_at DESC LIMIT ?`,
          conversationId, cursor, limit
        )
      : await query<any>(
          c.env.chillingz_db,
          `SELECT m.*, u.first_name, u.last_name FROM messages m
           JOIN users u ON u.id = m.sender_id
           WHERE m.conversation_id = ? AND m.deleted_at IS NULL
           ORDER BY m.created_at DESC LIMIT ?`,
          conversationId, limit
        );

    const nextCursor = messages.length === limit ? messages[messages.length - 1].created_at : null;

    return success(c, {
      messages: messages.reverse().map((m: any) => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        senderName: `${m.first_name} ${m.last_name}`,
        type: m.type,
        content: m.content,
        mediaUrl: m.media_url,
        replyToId: m.reply_to_id,
        status: m.status,
        createdAt: m.created_at,
      })),
      nextCursor,
    });
  });

  // POST /conversations/:id/messages — send a message
  const sendMessageSchema = z.object({
    content: z.string().min(1).max(5000),
    type: z.enum(['text', 'image', 'file']).default('text'),
    mediaUrl: z.string().optional(),
    replyToId: z.string().optional(),
  });

  app.post('/conversations/:id/messages', requireAuth, zValidator('json', sendMessageSchema), async (c) => {
    const conversationId = c.req.param('id');
    const userId = c.get('userId');
    const { content, type, mediaUrl, replyToId } = c.req.valid('json');

    const participant = await first<any>(c.env.chillingz_db,
      'SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL',
      conversationId, userId
    );
    if (!participant) throw new NotFoundError('Conversation', conversationId);

    if (replyToId) {
      const replyMsg = await first<any>(c.env.chillingz_db,
        'SELECT 1 FROM messages WHERE id = ? AND conversation_id = ?',
        replyToId, conversationId
      );
      if (!replyMsg) throw new ValidationError('Reply message not found');
    }

    const msgId = nanoid();
    const now = new Date().toISOString();

    await run(c.env.chillingz_db,
      `INSERT INTO messages (id, conversation_id, sender_id, type, content, media_url, reply_to_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      msgId, conversationId, userId, type, content, mediaUrl || null, replyToId || null, now, now
    );

    await run(c.env.chillingz_db,
      'UPDATE conversations SET last_message_at = ?, last_message_preview = ?, last_message_sender_id = ?, updated_at = ? WHERE id = ?',
      now, content.substring(0, 100), userId, now, conversationId
    );

    // Broadcast via WebSocket DO
    const stub = getWsStub(c.env);
    if (stub) {
      stub.broadcastToConversation(conversationId, 'new_message', {
        id: msgId,
        conversationId,
        senderId: userId,
        type,
        content,
        mediaUrl: mediaUrl || null,
        replyToId: replyToId || null,
        status: 'sent',
        createdAt: now,
      }, userId).catch(() => {});
    }

    // Return with status 'sent'; client transitions sending→sent on this response
    return created(c, {
      id: msgId,
      conversationId,
      senderId: userId,
      type,
      content,
      mediaUrl: mediaUrl || null,
      replyToId: replyToId || null,
      status: 'sent',
      createdAt: now,
    });
  });

  // PATCH /messages/:id — edit message
  const editMessageSchema = z.object({ content: z.string().min(1).max(5000) });

  app.patch('/messages/:id', requireAuth, zValidator('json', editMessageSchema), async (c) => {
    const messageId = c.req.param('id');
    const userId = c.get('userId');
    const { content } = c.req.valid('json');

    const msg = await first<any>(c.env.chillingz_db,
      'SELECT * FROM messages WHERE id = ? AND sender_id = ? AND deleted_at IS NULL',
      messageId, userId
    );
    if (!msg) throw new NotFoundError('Message', messageId);

    const elapsed = (Date.now() - new Date(msg.created_at).getTime()) / 1000;
    if (elapsed > 900) throw new ValidationError('Message can only be edited within 15 minutes');

    await run(c.env.chillingz_db, 'UPDATE messages SET content = ?, updated_at = ? WHERE id = ?',
      content, new Date().toISOString(), messageId
    );

    return success(c, { id: messageId, content, updatedAt: new Date().toISOString() });
  });

  // DELETE /messages/:id — soft delete
  app.delete('/messages/:id', requireAuth, async (c) => {
    const messageId = c.req.param('id');
    const userId = c.get('userId');

    const msg = await first<any>(c.env.chillingz_db,
      'SELECT * FROM messages WHERE id = ? AND sender_id = ? AND deleted_at IS NULL',
      messageId, userId
    );
    if (!msg) throw new NotFoundError('Message', messageId);

    const now = new Date().toISOString();
    await run(c.env.chillingz_db, 'UPDATE messages SET content = \'[deleted]\', deleted_at = ? WHERE id = ?', now, messageId);

    return success(c, { id: messageId, deletedAt: now });
  });

  // POST /conversations/:id/read — mark as read + broadcast via DO
  app.post('/conversations/:id/read', requireAuth, async (c) => {
    const conversationId = c.req.param('id');
    const userId = c.get('userId');
    const now = new Date().toISOString();

    await run(c.env.chillingz_db,
      'UPDATE conversation_participants SET last_read_at = ? WHERE conversation_id = ? AND user_id = ?',
      now, conversationId, userId
    );

    // Update delivered messages to read
    await run(c.env.chillingz_db,
      "UPDATE messages SET status = 'read', updated_at = ? WHERE conversation_id = ? AND sender_id != ? AND status = 'delivered'",
      now, conversationId, userId
    );

    // Broadcast read receipt via DO
    const stub = getWsStub(c.env);
    if (stub) {
      stub.broadcastToConversation(conversationId, 'read_receipt', {
        conversationId,
        userId,
        lastReadAt: now,
      }, userId).catch(() => {});
    }

    return success(c, { read: true });
  });

  // POST /conversations/:id/typing — toggle typing indicator
  app.post('/conversations/:id/typing', requireAuth, async (c) => {
    const conversationId = c.req.param('id');
    const userId = c.get('userId');
    const isTyping = c.req.query('isTyping') !== 'false';

    const participant = await first<any>(c.env.chillingz_db,
      'SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL',
      conversationId, userId
    );
    if (!participant) throw new NotFoundError('Conversation', conversationId);

    return success(c, { typing: isTyping, userId, conversationId });
  });

  // PUT /conversations/:id/mute — mute/unmute
  app.put('/conversations/:id/mute', requireAuth, async (c) => {
    const conversationId = c.req.param('id');
    const userId = c.get('userId');
    const muted = c.req.query('muted') !== 'false';

    await run(c.env.chillingz_db,
      'UPDATE conversation_participants SET muted_until = ? WHERE conversation_id = ? AND user_id = ?',
      muted ? '2099-12-31' : null, conversationId, userId
    );

    return success(c, { muted });
  });

  // POST /conversations/:id/delivered — mark messages as delivered
  const deliveredSchema = z.object({
    messageIds: z.array(z.string()).min(1),
  });

  app.post('/conversations/:id/delivered', requireAuth, zValidator('json', deliveredSchema), async (c) => {
    const conversationId = c.req.param('id');
    const userId = c.get('userId');
    const { messageIds } = c.req.valid('json');
    const now = new Date().toISOString();

    const placeholders = messageIds.map(() => '?').join(',');
    await run(c.env.chillingz_db,
      `UPDATE messages SET status = 'delivered', updated_at = ? WHERE conversation_id = ? AND id IN (${placeholders}) AND sender_id != ? AND status = 'sent' AND deleted_at IS NULL`,
      now, conversationId, ...messageIds, userId
    );

    // Notify sender via DO
    const stub = getWsStub(c.env);
    if (stub) {
      stub.broadcastToConversation(conversationId, 'messages_delivered', {
        messageIds,
        conversationId,
        deliveredBy: userId,
      }, userId).catch(() => {});
    }

    return success(c, { delivered: true });
  });

  // GET /users/:id/presence — get user online status
  app.get('/users/:id/presence', requireAuth, async (c) => {
    const targetId = c.req.param('id');

    // Try DO first
    const stub = getWsStub(c.env);
    if (stub) {
      try {
        const presence = await stub.getUserPresence(targetId) as { isOnline: boolean; lastSeen: number };
        return success(c, presence);
      } catch {}
    }

    // Fallback to DB
    const user = await first<any>(c.env.chillingz_db,
      'SELECT is_online, last_seen FROM users WHERE id = ?',
      targetId
    );

    return success(c, {
      isOnline: user?.is_online === 1 || false,
      lastSeen: user?.last_seen || null,
    });
  });
}
