import { EmailMessage } from 'cloudflare:email';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Env } from '../env';
import { requireAuth } from '../lib/auth';
import { query, first, run } from '../lib/db';
import { success, created } from '../lib/response';
import { AuthError, ValidationError, ConflictError } from '../lib/errors';
import { hashPassword, verifyPassword, generateSecureToken } from '../lib/password';
import { authRateLimit } from '../lib/rateLimit';
import { buildResetPasswordHtml } from '../templates/reset-password';

function nanoid(size = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (let i = 0; i < size; i++) id += chars[bytes[i] % chars.length];
  return id;
}

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function register(app: Hono<{ Bindings: Env }>) {
  // POST /auth/signup — email/password registration
  const signupSchema = z.object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(128),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    phone: z.string().max(20).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
  });

  app.post('/auth/signup', authRateLimit(), zValidator('json', signupSchema), async (c) => {
    const db = c.env.chillingz_db;
    const { email, password, firstName, lastName, phone, gender } = c.req.valid('json');

    const existing = await first<any>(db, 'SELECT id FROM users WHERE email = ?', email.toLowerCase());
    if (existing) throw new ConflictError('An account with this email already exists');

    const passwordHash = await hashPassword(password);
    const verificationToken = generateSecureToken();
    const userId = nanoid();

    await run(db,
      `INSERT INTO users (id, email, first_name, last_name, phone, password_hash, verification_token, gender, preferences, plan, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]', 'basic', datetime('now'), datetime('now'))`,
      userId, email.toLowerCase(), firstName, lastName, phone || null, passwordHash, verificationToken, gender || null
    );

    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    await run(db,
      "INSERT INTO auth_sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
      nanoid(), userId, token, expiresAt
    );

    return created(c, {
      user: { id: userId, firstName, lastName, email: email.toLowerCase(), phone: phone || '', role: 'user', plan: 'basic' },
      accessToken: token,
      expiresAt,
    });
  });

  // POST /auth/login — email/password login
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  app.post('/auth/login', authRateLimit(), zValidator('json', loginSchema), async (c) => {
    const db = c.env.chillingz_db;
    const { email, password } = c.req.valid('json');

    const user = await first<any>(db,
      'SELECT id, email, first_name, last_name, avatar_url, phone, password_hash, preferences, plan, role FROM users WHERE email = ?',
      email.toLowerCase()
    );
    if (!user || !user.password_hash) throw new AuthError('Invalid email or password');

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) throw new AuthError('Invalid email or password');

    const token = generateSecureToken();
    const sessionId = nanoid();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    const ip = c.req.header('CF-Connecting-IP') || '';
    const ua = c.req.header('User-Agent') || '';

    await run(db,
      'INSERT INTO auth_sessions (id, user_id, token, expires_at, user_agent, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime(\'now\'))',
      sessionId, user.id, token, expiresAt, ua, ip
    );

    await run(db,
      'INSERT INTO user_security_log (id, user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
      nanoid(), user.id, 'login', ip, ua
    );

    return success(c, {
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        avatar: user.avatar_url || '',
        phone: user.phone || '',
        preferences: JSON.parse(user.preferences || '[]'),
        plan: user.plan,
        role: user.role || 'user',
      },
      accessToken: token,
      expiresAt,
    });
  });

  // POST /auth/forgot-password — send reset token via email
  const forgotSchema = z.object({ email: z.string().email() });

  app.post('/auth/forgot-password', authRateLimit(), zValidator('json', forgotSchema), async (c) => {
    const db = c.env.chillingz_db;
    const { email } = c.req.valid('json');

    const user = await first<any>(db, 'SELECT id, first_name, email FROM users WHERE email = ?', email.toLowerCase());
    if (!user) return success(c, { sent: true });

    const resetToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + 3600000).toISOString();

    await run(db, 'UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?',
      resetToken, expiresAt, user.id
    );

    const { subject, html } = buildResetPasswordHtml({
      firstName: user.first_name || 'there',
      resetToken,
      expiresInHours: 1,
    });

    try {
      const msg = new EmailMessage('noreply@chillingz.com', user.email, { subject, html } as any);
      await c.env.SEND_EMAIL.send(msg);
    } catch {
      console.error('Failed to send password reset email to', user.email);
    }

    return success(c, { sent: true });
  });

  // POST /auth/reset-password — reset with token
  const resetSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(128),
  });

  app.post('/auth/reset-password', authRateLimit(), zValidator('json', resetSchema), async (c) => {
    const db = c.env.chillingz_db;
    const { token, password } = c.req.valid('json');

    const user = await first<any>(db,
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires_at > datetime(\'now\')',
      token
    );
    if (!user) throw new ValidationError('Invalid or expired reset token');

    const passwordHash = await hashPassword(password);
    await run(db,
      "UPDATE users SET password_hash = ?, password_updated_at = datetime('now'), reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?",
      passwordHash, user.id
    );

    // Invalidate all sessions
    await run(db, 'DELETE FROM auth_sessions WHERE user_id = ?', user.id);

    await run(db,
      'INSERT INTO user_security_log (id, user_id, action) VALUES (?, ?, ?)',
      nanoid(), user.id, 'password_reset'
    );

    return success(c, { reset: true });
  });

  // POST /auth/verify-email — verify with token
  app.post('/auth/verify-email', zValidator('json', z.object({ token: z.string().min(1) })), async (c) => {
    const db = c.env.chillingz_db;

    const user = await first<any>(db,
      'SELECT id FROM users WHERE verification_token = ? AND email_verified = 0',
      c.req.valid('json').token
    );
    if (!user) throw new ValidationError('Invalid verification token');

    await run(db,
      "UPDATE users SET email_verified = 1, email_verified_at = datetime('now'), verification_token = NULL WHERE id = ?",
      user.id
    );

    return success(c, { verified: true });
  });

  // POST /auth/resend-verification
  app.post('/auth/resend-verification', authRateLimit(), zValidator('json', z.object({ email: z.string().email() })), async (c) => {
    const db = c.env.chillingz_db;
    const { email } = c.req.valid('json');

    const user = await first<any>(db, 'SELECT id, email_verified FROM users WHERE email = ?', email.toLowerCase());
    if (!user) return success(c, { sent: true });
    if (user.email_verified) throw new ValidationError('Email already verified');

    const newToken = generateSecureToken();
    await run(db, 'UPDATE users SET verification_token = ? WHERE id = ?', newToken, user.id);

    return success(c, { sent: true, verificationToken: newToken });
  });

  // POST /auth/change-password — authenticated password change
  const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
  });

  app.post('/auth/change-password', requireAuth, zValidator('json', changePasswordSchema), async (c) => {
    const db = c.env.chillingz_db;
    const userId = c.get('userId');
    const { currentPassword, newPassword } = c.req.valid('json');

    const user = await first<any>(db, 'SELECT password_hash FROM users WHERE id = ?', userId);
    if (!user || !user.password_hash) throw new AuthError('No password set. Use Google login.');

    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) throw new AuthError('Current password is incorrect');

    const newHash = await hashPassword(newPassword);
    await run(db,
      "UPDATE users SET password_hash = ?, password_updated_at = datetime('now') WHERE id = ?",
      newHash, userId
    );

    await run(db,
      'INSERT INTO user_security_log (id, user_id, action) VALUES (?, ?, ?)',
      nanoid(), userId, 'password_change'
    );

    return success(c, { changed: true });
  });

  // GET /auth/sessions — list active sessions
  app.get('/auth/sessions', requireAuth, async (c) => {
    const userId = c.get('userId');

    const sessions = await query<any>(c.env.chillingz_db,
      'SELECT id, user_agent, ip_address, created_at FROM auth_sessions WHERE user_id = ? AND expires_at > datetime(\'now\') ORDER BY created_at DESC',
      userId
    );

    return success(c, sessions.map(s => ({
      id: s.id,
      userAgent: s.user_agent || '',
      ipAddress: s.ip_address || '',
      createdAt: s.created_at,
    })));
  });

  // DELETE /auth/sessions/:id — revoke session
  app.delete('/auth/sessions/:id', requireAuth, async (c) => {
    const userId = c.get('userId');
    const sessionId = c.req.param('id');

    await run(c.env.chillingz_db,
      'DELETE FROM auth_sessions WHERE id = ? AND user_id = ?',
      sessionId, userId
    );

    return success(c, { revoked: true });
  });

  // POST /auth/logout/all — revoke all sessions
  app.post('/auth/logout/all', requireAuth, async (c) => {
    const userId = c.get('userId');
    await run(c.env.chillingz_db, 'DELETE FROM auth_sessions WHERE user_id = ?', userId);
    return success(c, { revoked: true });
  });
}
