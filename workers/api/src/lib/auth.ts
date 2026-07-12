import { Context, Next } from 'hono';
import { Env } from '../env';
import { AuthError } from './errors';
import { first } from './db';

interface SessionRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
}

interface UserRow {
  id: string;
  google_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  avatar_id: string | null;
  phone: string | null;
  preferences: string;
  plan: string;
}

export interface AuthUser {
  id: string;
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  avatarId: string | null;
  phone: string | null;
  preferences: string[];
  plan: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
    sessionId: string;
    authUser: AuthUser;
  }
}

export async function requireAuth(c: Context<{ Bindings: Env }>, next: Next) {
  const auth = c.req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    throw new AuthError('Missing or invalid Authorization header');
  }

  const token = auth.slice(7);
  if (!token) {
    throw new AuthError('Missing or invalid Authorization header');
  }

  const session = await first<SessionRow>(
    c.env.chillingz_db,
    "SELECT id, user_id, token, expires_at FROM auth_sessions WHERE token = ? AND expires_at > datetime('now')",
    token
  );

  if (!session) {
    throw new AuthError('Session expired or invalid');
  }

  const user = await first<UserRow>(
    c.env.chillingz_db,
    'SELECT id, google_id, email, first_name, last_name, avatar_url, avatar_id, phone, preferences, plan FROM users WHERE id = ?',
    session.user_id
  );

  if (!user) {
    throw new AuthError('User not found');
  }

  c.set('userId', session.user_id);
  c.set('sessionId', session.id);
  c.set('authUser', {
    id: user.id,
    googleId: user.google_id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    avatar: user.avatar_url,
    avatarId: user.avatar_id,
    phone: user.phone,
    preferences: JSON.parse(user.preferences || '[]'),
    plan: user.plan,
  });

  await next();
}

export async function optionalAuth(c: Context<{ Bindings: Env }>, next: Next) {
  const auth = c.req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    await next();
    return;
  }

  const token = auth.slice(7);
  if (!token) {
    await next();
    return;
  }

  try {
    const session = await first<SessionRow>(
      c.env.chillingz_db,
      "SELECT id, user_id FROM auth_sessions WHERE token = ? AND expires_at > datetime('now')",
      token
    );

    if (session) {
      c.set('userId', session.user_id);
      c.set('sessionId', session.id);
    }
  } catch {
    // Silently continue without auth
  }

  await next();
}
