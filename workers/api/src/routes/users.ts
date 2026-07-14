import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { Env } from '../env';
import { requireAuth } from '../lib/auth';
import { first, run } from '../lib/db';
import { success } from '../lib/response';
import { NotFoundError, ValidationError } from '../lib/errors';
import { updateProfileSchema, updatePreferencesSchema, updateLocationSchema } from '../schemas/user';

function nanoid(size = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (let i = 0; i < size; i++) { id += chars[bytes[i] % chars.length]; }
  return id;
}

interface UserProfileRow {
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
  latitude: number | null;
  longitude: number | null;
  full_address: string;
  gender: string | null;
  push_notifications_enabled: number;
  email_notifications_enabled: number;
  last_login_at: string | null;
  login_count: number;
  created_at: string;
}

export function register(app: Hono<{ Bindings: Env }>) {
  app.get('/users/me', requireAuth, async (c) => {
    const userId = c.get('userId');

    const user = await first<UserProfileRow>(
      c.env.chillingz_db,
      'SELECT * FROM users WHERE id = ?',
      userId
    );

    if (!user) throw new NotFoundError('User');

    return success(c, {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      username: user.username,
      phone: user.phone || '',
      avatar: user.avatar_url || '',
      avatarId: user.avatar_id || undefined,
      interests: JSON.parse(user.preferences || '[]'),
      bio: user.bio,
      plan: user.plan || 'basic',
      gender: user.gender || null,
      pushNotificationsEnabled: user.push_notifications_enabled === 1,
      emailNotificationsEnabled: user.email_notifications_enabled === 1,
      loginCount: user.login_count,
      lastLoginAt: user.last_login_at,
      location: {
        city: user.city,
        neighborhood: user.neighborhood,
        country: user.country,
        fullAddress: user.full_address,
        latitude: user.latitude || undefined,
        longitude: user.longitude || undefined,
      },
      createdAt: user.created_at,
    });
  });

  app.put('/users/me', requireAuth, zValidator('json', updateProfileSchema), async (c) => {
    const body = c.req.valid('json');
    const userId = c.get('userId');
    const updates: string[] = [];
    const params: unknown[] = [];
    const changed: string[] = [];

    if (body.firstName !== undefined) { updates.push('first_name = ?'); params.push(body.firstName); changed.push('firstName'); }
    if (body.lastName !== undefined) { updates.push('last_name = ?'); params.push(body.lastName); changed.push('lastName'); }
    if (body.email !== undefined) { updates.push('email = ?'); params.push(body.email); changed.push('email'); }
    if (body.phone !== undefined) { updates.push('phone = ?'); params.push(body.phone); changed.push('phone'); }
    if (body.avatar !== undefined) { updates.push('avatar_url = ?'); params.push(body.avatar); changed.push('avatar'); }
    if (body.avatarId !== undefined) { updates.push('avatar_id = ?'); params.push(body.avatarId); changed.push('avatarId'); }
    if (body.bio !== undefined) { updates.push('bio = ?'); params.push(body.bio); changed.push('bio'); }
    if (body.username !== undefined) { updates.push('username = ?'); params.push(body.username); changed.push('username'); }
    if (body.gender !== undefined) { updates.push('gender = ?'); params.push(body.gender); changed.push('gender'); }

    if (updates.length === 0) {
      throw new ValidationError('No fields to update');
    }

    updates.push("updated_at = datetime('now')");
    params.push(userId);

    await run(
      c.env.chillingz_db,
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      ...params
    );

    await run(
      c.env.chillingz_db,
      "INSERT INTO user_activity_log (id, user_id, action, details, created_at) VALUES (?, ?, 'profile_update', ?, datetime('now'))",
      nanoid(), userId, JSON.stringify({ fields: changed })
    );

    const user = await first<UserProfileRow>(
      c.env.chillingz_db,
      'SELECT * FROM users WHERE id = ?',
      userId
    );

    return success(c, {
      id: user!.id,
      firstName: user!.first_name,
      lastName: user!.last_name,
      email: user!.email,
      username: user!.username,
      phone: user!.phone || '',
      avatar: user!.avatar_url || '',
      avatarId: user!.avatar_id || undefined,
      interests: JSON.parse(user!.preferences || '[]'),
      bio: user!.bio,
      plan: user!.plan || 'basic',
      gender: user!.gender || null,
      pushNotificationsEnabled: user!.push_notifications_enabled === 1,
    });
  });

  app.put('/users/me/preferences', requireAuth, zValidator('json', updatePreferencesSchema), async (c) => {
    const body = c.req.valid('json');
    const userId = c.get('userId');

    await run(
      c.env.chillingz_db,
      "UPDATE users SET preferences = ?, updated_at = datetime('now') WHERE id = ?",
      JSON.stringify(body.preferences), userId
    );

    await run(
      c.env.chillingz_db,
      "INSERT INTO user_activity_log (id, user_id, action, details, created_at) VALUES (?, ?, 'preferences_update', ?, datetime('now'))",
      nanoid(), userId, JSON.stringify({ preferences: body.preferences })
    );

    return success(c, { preferences: body.preferences });
  });

  app.put('/users/me/location', requireAuth, zValidator('json', updateLocationSchema), async (c) => {
    const body = c.req.valid('json');
    const userId = c.get('userId');

    await run(
      c.env.chillingz_db,
      'UPDATE users SET city = ?, neighborhood = ?, latitude = ?, longitude = ?, country = ?, full_address = ?, updated_at = datetime(\'now\') WHERE id = ?',
      body.city, body.neighborhood, body.latitude ?? null, body.longitude ?? null,
      body.country || '', body.fullAddress || '', userId
    );

    await run(
      c.env.chillingz_db,
      "INSERT INTO user_activity_log (id, user_id, action, details, created_at) VALUES (?, ?, 'location_update', ?, datetime('now'))",
      nanoid(), userId, JSON.stringify({ city: body.city, neighborhood: body.neighborhood })
    );

    return success(c, {
      city: body.city,
      neighborhood: body.neighborhood,
      latitude: body.latitude,
      longitude: body.longitude,
      country: body.country,
      fullAddress: body.fullAddress,
    });
  });
}
