import { Context, Next } from 'hono';
import { Env } from '../env';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
}

const DEFAULTS: RateLimitConfig = {
  windowMs: 60000,
  max: 60,
  message: 'Too many requests, please try again later',
};

export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const opts = { ...DEFAULTS, ...config };

  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const key = c.get('userId') || c.req.header('CF-Connecting-IP') || 'anonymous';
    const cacheKey = `ratelimit:${key}:${Math.floor(Date.now() / opts.windowMs)}`;

    const db = c.env.chillingz_db;

    if (db) {
      const row = await db.prepare(
        'SELECT count FROM rate_limit_counts WHERE cache_key = ? AND expires_at > datetime(\'now\')'
      ).first<{ count: number }>(cacheKey);

      const count = row?.count || 0;

      if (count >= opts.max) {
        return c.json({
          success: false,
          error: { code: 'RATE_LIMIT', message: opts.message },
        }, 429 as any);
      }

      if (row) {
        await db.prepare('UPDATE rate_limit_counts SET count = count + 1 WHERE cache_key = ?').bind(cacheKey).run();
      } else {
        await db.prepare(
          "INSERT INTO rate_limit_counts (cache_key, count, expires_at) VALUES (?, 1, datetime('now', ? || ' seconds'))"
        ).bind(cacheKey, String(Math.ceil(opts.windowMs / 1000))).run();
      }
    }

    await next();
  };
}

export function strictRateLimit() {
  return rateLimit({ windowMs: 60000, max: 10, message: 'Too many requests. Slow down.' });
}

export function authRateLimit() {
  return rateLimit({ windowMs: 900000, max: 5, message: 'Too many login attempts. Try again in 15 minutes.' });
}

export async function createRateLimitTable(db: D1Database): Promise<void> {
  await db.exec(`CREATE TABLE IF NOT EXISTS rate_limit_counts (
    cache_key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 1,
    expires_at TEXT NOT NULL
  ); CREATE INDEX IF NOT EXISTS idx_rate_limit_expires ON rate_limit_counts(expires_at);`);
}
