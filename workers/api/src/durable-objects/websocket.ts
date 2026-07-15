import { DurableObject } from 'cloudflare:workers';
import { first } from '../lib/db';

interface Env {
  chillingz_db: D1Database;
}

interface UserConnection {
  userId: string;
  sessionId: string;
  ws: WebSocket;
  connectedAt: number;
  lastActivity: number;
}

interface WebSocketMessage {
  type: string;
  payload?: Record<string, unknown>;
}

export class WebSocketDurableObject extends DurableObject<Env> {
  private connections: Map<string, UserConnection> = new Map();
  private userConversations: Map<string, Set<string>> = new Map();
  private subscribeTimestamps: Map<string, number> = new Map();
  private connectionKeys: Map<string, string> = new Map(); // userId -> connKey (one active per user)

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected websocket', { status: 400 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const token = url.searchParams.get('token');

    if (!userId || !token) {
      return new Response('Missing userId or token', { status: 400 });
    }

    // Validate session token against D1
    const session = await first<any>(
      this.env.chillingz_db,
      "SELECT id, user_id FROM auth_sessions WHERE token = ? AND expires_at > datetime('now')",
      token
    );
    if (!session || session.user_id !== userId) {
      return new Response('Invalid token', { status: 401 });
    }

    const sessionId = session.id;
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    await this.handleConnection(userId, sessionId, server);

    return new Response(null, { status: 101, webSocket: client });
  }

  private async handleConnection(userId: string, sessionId: string, ws: WebSocket): Promise<void> {
    ws.accept();

    const connKey = `${userId}:${sessionId}`;

    // Close existing connection for same user
    const existingKey = this.connectionKeys.get(userId);
    if (existingKey) {
      const existing = this.connections.get(existingKey);
      if (existing) {
        try { existing.ws.close(1000, 'replaced'); } catch {}
        this.connections.delete(existingKey);
      }
    }

    const connection: UserConnection = {
      userId,
      sessionId,
      ws,
      connectedAt: Date.now(),
      lastActivity: Date.now(),
    };

    this.connections.set(connKey, connection);
    this.connectionKeys.set(userId, connKey);

    // Notify user they're connected
    ws.send(JSON.stringify({ type: 'connected', payload: { userId, sessionId } }));

    // Broadcast online to all subscribed conversations
    await this.broadcastPresence(userId, true);

    // Update DB: set is_online
    try {
      await this.env.chillingz_db.prepare(
        "UPDATE users SET is_online = 1, last_seen = datetime('now') WHERE id = ?"
      ).bind(userId).run();
    } catch {}

    // Set idle alarm
    await this.setIdleAlarm();

    ws.addEventListener('message', async (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data as string);
        await this.handleMessage(connKey, message);
      } catch (e) {
        console.error('WS message error:', e);
      }
    });

    ws.addEventListener('close', async () => {
      this.connections.delete(connKey);
      if (this.connectionKeys.get(userId) === connKey) {
        this.connectionKeys.delete(userId);
      }

      // If no more connections for this user, mark offline
      const stillConnected = Array.from(this.connections.values()).some(c => c.userId === userId);
      if (!stillConnected) {
        await this.broadcastPresence(userId, false);
        try {
          await this.env.chillingz_db.prepare(
            "UPDATE users SET is_online = 0, last_seen = datetime('now') WHERE id = ?"
          ).bind(userId).run();
        } catch {}
      }
    });

    ws.addEventListener('error', () => {
      this.connections.delete(connKey);
      if (this.connectionKeys.get(userId) === connKey) {
        this.connectionKeys.delete(userId);
      }
    });
  }

  private async handleMessage(connKey: string, message: WebSocketMessage): Promise<void> {
    const connection = this.connections.get(connKey);
    if (!connection) return;

    const { userId } = connection;

    switch (message.type) {
      case 'ping':
        connection.ws.send(JSON.stringify({ type: 'pong', payload: { timestamp: Date.now() } }));
        break;

      case 'subscribe_conversation': {
        const convId = message.payload?.conversationId as string;
        if (!convId) break;

        // Rate limit: 500ms per subscribe
        const rateKey = `${userId}:${convId}`;
        const now = Date.now();
        const last = this.subscribeTimestamps.get(rateKey) || 0;
        if (now - last < 500) {
          connection.ws.send(JSON.stringify({
            type: 'subscribe_conversation_error',
            payload: { conversationId: convId, error: 'rate_limited' },
          }));
          break;
        }
        this.subscribeTimestamps.set(rateKey, now);

        if (!this.userConversations.has(userId)) {
          this.userConversations.set(userId, new Set());
        }
        this.userConversations.get(userId)!.add(convId);

        connection.ws.send(JSON.stringify({
          type: 'subscribed',
          payload: { conversationId: convId },
        }));
        break;
      }

      case 'unsubscribe_conversation': {
        const unsubConvId = message.payload?.conversationId as string;
        if (!unsubConvId) break;

        const convs = this.userConversations.get(userId);
        if (convs) {
          convs.delete(unsubConvId);
          if (convs.size === 0) this.userConversations.delete(userId);
        }
        break;
      }

      case 'mark_delivered': {
        const deliveredConvId = message.payload?.conversationId as string;
        const messageIds = message.payload?.messageIds as string[];
        const deliveredAt = new Date().toISOString();

        if (deliveredConvId && messageIds?.length) {
          try {
            await this.env.chillingz_db.prepare(
              `UPDATE messages SET status = 'delivered', updated_at = ? WHERE conversation_id = ? AND id IN (${messageIds.map(() => '?').join(',')}) AND sender_id != ? AND status = 'sent'`
            ).bind(deliveredAt, deliveredConvId, ...messageIds, userId).run();
          } catch {}

          // Notify sender
          await this.broadcastToConversation(deliveredConvId, 'messages_delivered', {
            messageIds,
            conversationId: deliveredConvId,
            deliveredBy: userId,
          }, userId);
        }
        break;
      }

      case 'mark_read': {
        const readConvId = message.payload?.conversationId as string;
        const readAtRaw = message.payload?.lastReadAt as number;
        const readAt = readAtRaw ? new Date(readAtRaw).toISOString() : new Date().toISOString();

        if (readConvId) {
          try {
            await this.env.chillingz_db.prepare(
              'UPDATE conversation_participants SET last_read_at = ? WHERE conversation_id = ? AND user_id = ?'
            ).bind(readAt, readConvId, userId).run();

            // Update unread messages to 'read'
            await this.env.chillingz_db.prepare(
              `UPDATE messages SET status = 'read', updated_at = ? WHERE conversation_id = ? AND sender_id != ? AND status = 'delivered'`
            ).bind(readAt, readConvId, userId).run();
          } catch {}

          // Notify sender
          await this.broadcastToConversation(readConvId, 'read_receipt', {
            conversationId: readConvId,
            userId,
            lastReadAt: readAt,
          }, userId);
        }
        break;
      }

      case 'activity':
        connection.lastActivity = Date.now();
        break;

      default:
        break;
    }
  }

  async broadcastToConversation(
    conversationId: string,
    type: string,
    payload: Record<string, unknown>,
    excludeUserId?: string
  ): Promise<number> {
    let sent = 0;

    for (const [, conn] of this.connections) {
      if (conn.userId === excludeUserId) continue;
      if (conn.ws.readyState !== WebSocket.OPEN) continue;

      // Check if user is subscribed to this conversation OR just online
      const convs = this.userConversations.get(conn.userId);
      const isSubscribed = convs?.has(conversationId);

      if (isSubscribed) {
        conn.ws.send(JSON.stringify({ type, payload }));
        sent++;
      }
    }

    // If no WS subscribers, try Pusher fallback for offline users
    if (sent === 0) {
      await this.triggerPusherFallback(conversationId, type, payload);
    }

    return sent;
  }

  private async triggerPusherFallback(
    conversationId: string,
    type: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    const pusherKey = (this.env as any).PUSHER_KEY;
    const pusherCluster = (this.env as any).PUSHER_CLUSTER;
    if (!pusherKey || !pusherCluster) return;

    try {
      const { triggerEvent, getPusherConfig } = await import('../lib/pusher');
      const config = getPusherConfig(this.env as any);
      if (config) {
        await triggerEvent(config, `private-conversation-${conversationId}`, type, payload);
      }
    } catch {}
  }

  private async broadcastPresence(userId: string, isOnline: boolean): Promise<void> {
    const presence = {
      userId,
      isOnline,
      lastSeen: Date.now(),
    };

    // Get all users connected to this DO who are in conversations with this user
    const affectedUsers = new Set<string>();
    for (const [, conn] of this.connections) {
      if (conn.userId === userId) continue;
      const convs = this.userConversations.get(conn.userId);
      if (convs) {
        affectedUsers.add(conn.userId);
      }
    }

    for (const [, conn] of this.connections) {
      if (affectedUsers.has(conn.userId) || conn.userId !== userId) {
        // Also broadcast to anyone who has a conversation with this user
        conn.ws.send(JSON.stringify({
          type: isOnline ? 'user_online' : 'user_offline',
          payload: presence,
        }));
      }
    }
  }

  async getUserPresence(targetUserId: string): Promise<{ isOnline: boolean; lastSeen: number }> {
    const isOnline = Array.from(this.connections.values()).some(
      c => c.userId === targetUserId && c.ws.readyState === WebSocket.OPEN
    );
    return {
      isOnline,
      lastSeen: isOnline ? Date.now() : 0,
    };
  }

  async sendMessage(type: string, payload: Record<string, unknown>, targetUserId: string): Promise<number> {
    let sent = 0;
    for (const [, conn] of this.connections) {
      if (conn.userId === targetUserId && conn.ws.readyState === WebSocket.OPEN) {
        conn.ws.send(JSON.stringify({ type, payload }));
        sent++;
      }
    }
    return sent;
  }

  async getOnlineUsers(): Promise<string[]> {
    const users = new Set<string>();
    for (const [, conn] of this.connections) {
      if (conn.ws.readyState === WebSocket.OPEN) {
        users.add(conn.userId);
      }
    }
    return Array.from(users);
  }

  async alarm(): Promise<void> {
    // Idle detection: close stale connections
    const now = Date.now();
    const IDLE_TIMEOUT = 30000; // 30 seconds

    for (const [key, conn] of this.connections) {
      if (now - conn.lastActivity > IDLE_TIMEOUT) {
        try {
          conn.ws.send(JSON.stringify({ type: 'sleep', payload: { timeout: 60000 } }));
          conn.ws.close(1000, 'idle_timeout');
        } catch {}
        this.connections.delete(key);

        // Mark offline
        await this.broadcastPresence(conn.userId, false);
        try {
          await this.env.chillingz_db.prepare(
            "UPDATE users SET is_online = 0, last_seen = datetime('now') WHERE id = ?"
          ).bind(conn.userId).run();
        } catch {}
      }
    }

    // Set next alarm if connections remain
    await this.setIdleAlarm();
  }

  private async setIdleAlarm(): Promise<void> {
    const active = Array.from(this.connections.values()).some(
      c => c.ws.readyState === WebSocket.OPEN
    );
    if (active) {
      await this.ctx.storage.setAlarm(Date.now() + 15000); // Check every 15s
    } else {
      await this.ctx.storage.deleteAlarm();
    }
  }
}
