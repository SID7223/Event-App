interface Env {
  chillingz_db: D1Database;
  GOOGLE_CLIENT_ID: string;
}

interface GoogleTokenPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  aud: string;
  exp: number;
  iat: number;
  iss: string;
}

interface UserRow {
  id: string;
  google_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string | null;
  avatar_url: string | null;
  avatar_id: string | null;
  phone: string | null;
  preferences: string;
  plan: string;
  bio: string;
  city: string;
  neighborhood: string;
  country: string;
  push_notifications_enabled: number;
  created_at: string;
  updated_at: string;
}

interface SessionRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
}

const JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const ISS = 'https://accounts.google.com';

let cachedJWKS: { keys: JsonWebKey[] } | null = null;
let jwksFetchedAt = 0;

function nanoid(size = 24): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (let i = 0; i < size; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return id;
}

async function getJWKS(): Promise<JsonWebKey[]> {
  const now = Date.now();
  if (cachedJWKS && (now - jwksFetchedAt) < 3600000) {
    return cachedJWKS.keys;
  }
  const res = await fetch(JWKS_URL);
  cachedJWKS = await res.json() as { keys: JsonWebKey[] };
  jwksFetchedAt = now;
  return cachedJWKS.keys;
}

async function verifyGoogleToken(idToken: string, clientId: string): Promise<GoogleTokenPayload> {
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');

  const header = JSON.parse(atob(parts[0]));
  const payload: GoogleTokenPayload = JSON.parse(atob(parts[1]));
  const signature = parts[2];

  if (payload.aud !== clientId) throw new Error('Token audience mismatch');
  if (payload.iss !== ISS) throw new Error('Invalid issuer');
  if (payload.exp * 1000 < Date.now()) throw new Error('Token expired');
  if (!payload.email_verified) throw new Error('Email not verified');

  const keys = await getJWKS();
  const key = keys.find(k => k.kid === header.kid);
  if (!key) throw new Error('Signing key not found');

  const encoder = new TextEncoder();
  const data = encoder.encode(`${parts[0]}.${parts[1]}`);
  const sigBytes = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'jwk', key as any,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['verify']
  );

  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, sigBytes, data);
  if (!valid) throw new Error('Token signature invalid');

  return payload;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/auth/google' && request.method === 'POST') {
      return handleGoogleLogin(request, env);
    }

    if (url.pathname === '/auth/me' && request.method === 'GET') {
      return handleGetMe(request, env);
    }

    if (url.pathname === '/auth/logout' && request.method === 'POST') {
      return handleLogout(request, env);
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  },
};

async function handleGoogleLogin(request: Request, env: Env): Promise<Response> {
  try {
    const { idToken } = await request.json() as { idToken: string };
    if (!idToken) {
      return new Response(JSON.stringify({ error: 'idToken required' }), { status: 400, headers: corsHeaders });
    }

    const googleUser = await verifyGoogleToken(idToken, env.GOOGLE_CLIENT_ID);

    const existing = await env.chillingz_db.prepare(
      'SELECT * FROM users WHERE google_id = ?'
    ).bind(googleUser.sub).first<UserRow>();

    let userId: string;
    const now = new Date().toISOString();
    const activityId = nanoid();

    if (existing) {
      userId = existing.id;
      await env.chillingz_db.prepare(
        `UPDATE users SET first_name = ?, last_name = ?, avatar_url = ?, email = ?,
         last_login_at = ?, login_count = login_count + 1, updated_at = datetime('now') WHERE id = ?`
      ).bind(googleUser.given_name, googleUser.family_name, googleUser.picture, googleUser.email, now, userId).run();
    } else {
      userId = `user_${nanoid(12)}`;
      const username = `${googleUser.given_name.toLowerCase()}${googleUser.family_name.toLowerCase()}.events`;
      await env.chillingz_db.prepare(
        `INSERT INTO users (id, google_id, email, first_name, last_name, username, avatar_url,
         last_login_at, login_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`
      ).bind(userId, googleUser.sub, googleUser.email, googleUser.given_name, googleUser.family_name, username, googleUser.picture, now).run();
    }

    const token = `sess_${nanoid(32)}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const sessionId = nanoid();
    await env.chillingz_db.prepare(
      'INSERT INTO auth_sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))'
    ).bind(sessionId, userId, token, expiresAt).run();

    // Log login event
    const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '';
    const ua = request.headers.get('User-Agent') || '';

    await env.chillingz_db.prepare(
      "INSERT INTO user_login_history (id, user_id, login_type, ip_address, user_agent, created_at) VALUES (?, ?, 'google', ?, ?, ?)"
    ).bind(nanoid(), userId, ip, ua, now).run();

    // Log activity
    await env.chillingz_db.prepare(
      "INSERT INTO user_activity_log (id, user_id, action, details, ip_address, user_agent, created_at) VALUES (?, ?, 'login', ?, ?, ?, ?)"
    ).bind(activityId, userId, JSON.stringify({ method: 'google', sessionId }), ip, ua, now).run();

    const user = await env.chillingz_db.prepare(
      'SELECT id, google_id, email, first_name, last_name, username, avatar_url, avatar_id, phone, preferences, plan, bio, city, neighborhood, country, push_notifications_enabled FROM users WHERE id = ?'
    ).bind(userId).first<UserRow>();

    return new Response(JSON.stringify({
      token,
      user: {
        id: user?.id,
        googleId: user?.google_id,
        email: user?.email,
        firstName: user?.first_name,
        lastName: user?.last_name,
        username: user?.username,
        avatar: user?.avatar_url,
        avatarId: user?.avatar_id,
        phone: user?.phone,
        preferences: user?.preferences ? JSON.parse(user.preferences) : [],
        plan: user?.plan,
        bio: user?.bio || '',
        city: user?.city || '',
        neighborhood: user?.neighborhood || '',
        country: user?.country || '',
        pushNotificationsEnabled: user?.push_notifications_enabled === 1,
      },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 401, headers: corsHeaders });
  }
}

async function handleGetMe(request: Request, env: Env): Promise<Response> {
  const auth = request.headers.get('Authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    return new Response(JSON.stringify({ error: 'No token' }), { status: 401, headers: corsHeaders });
  }

  const session = await env.chillingz_db.prepare(
    'SELECT * FROM auth_sessions WHERE token = ? AND expires_at > datetime(\'now\')'
  ).bind(token).first<SessionRow>();

  if (!session) {
    return new Response(JSON.stringify({ error: 'Invalid or expired session' }), { status: 401, headers: corsHeaders });
  }

  const user = await env.chillingz_db.prepare(
    'SELECT id, google_id, email, first_name, last_name, username, avatar_url, avatar_id, phone, preferences, plan, bio, city, neighborhood, country, push_notifications_enabled FROM users WHERE id = ?'
  ).bind(session.user_id).first<UserRow>();

  return new Response(JSON.stringify({
    user: {
      id: user?.id,
      googleId: user?.google_id,
      email: user?.email,
      firstName: user?.first_name,
      lastName: user?.last_name,
      username: user?.username,
      avatar: user?.avatar_url,
      avatarId: user?.avatar_id,
      phone: user?.phone,
      preferences: user?.preferences ? JSON.parse(user.preferences) : [],
      plan: user?.plan,
      bio: user?.bio || '',
      city: user?.city || '',
      neighborhood: user?.neighborhood || '',
      country: user?.country || '',
      pushNotificationsEnabled: user?.push_notifications_enabled === 1,
    },
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function handleLogout(request: Request, env: Env): Promise<Response> {
  const auth = request.headers.get('Authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    return new Response(JSON.stringify({ error: 'No token' }), { status: 401, headers: corsHeaders });
  }

  const session = await env.chillingz_db.prepare(
    'SELECT id, user_id FROM auth_sessions WHERE token = ?'
  ).bind(token).first<{ id: string; user_id: string }>();

  if (session) {
    const cf = (request as any).cf;
    const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '';
    const ua = request.headers.get('User-Agent') || '';

    await env.chillingz_db.prepare(
      "INSERT INTO user_activity_log (id, user_id, action, details, ip_address, user_agent, created_at) VALUES (?, ?, 'logout', ?, ?, ?, datetime('now'))"
    ).bind(nanoid(), session.user_id, JSON.stringify({ sessionId: session.id }), ip, ua).run();
  }

  await env.chillingz_db.prepare('DELETE FROM auth_sessions WHERE token = ?').bind(token).run();

  return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
}
