interface Env {
  chillingz_db: D1Database;
}

function nanoid(size = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (let i = 0; i < size; i++) { id += chars[bytes[i] % chars.length]; }
  return id;
}

async function runCleanup(env: Env): Promise<{ expiredFeatured: number; markedPast: number; errors: string[] }> {
  const errors: string[] = [];
  const now = new Date().toISOString().split('T')[0];

  // 1. Expire featured events where featured_until has passed
  let expiredFeatured = 0;
  try {
    const featuredResult = await env.chillingz_db.prepare(
      "UPDATE events SET is_featured = 0, updated_at = datetime('now') WHERE is_featured = 1 AND featured_until IS NOT NULL AND featured_until < date('now')"
    ).run();
    expiredFeatured = featuredResult.meta.changes ?? 0;
  } catch (e: any) {
    errors.push(`Featured expiration failed: ${e.message}`);
  }

  // 2. Mark past events — move events older than yesterday to 'past' status
  let markedPast = 0;
  try {
    const pastResult = await env.chillingz_db.prepare(
      "UPDATE events SET status = 'past', is_featured = 0, updated_at = datetime('now') WHERE status = 'active' AND date < date('now')"
    ).run();
    markedPast = pastResult.meta.changes ?? 0;
  } catch (e: any) {
    errors.push(`Past event marking failed: ${e.message}`);
  }

  // 3. Log the cleanup run
  if (expiredFeatured > 0 || markedPast > 0) {
    await env.chillingz_db.prepare(
      "INSERT INTO user_activity_log (id, user_id, action, details, created_at) VALUES (?, '__system__', 'event_cleanup', ?, datetime('now'))"
    ).bind(
      nanoid(),
      JSON.stringify({
        expiredFeatured,
        markedPast,
        errors: errors.length > 0 ? errors : undefined,
        runAt: now,
      })
    ).run();
  }

  return { expiredFeatured, markedPast, errors };
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    console.log(`[Cleanup] Starting scheduled run at ${new Date().toISOString()}`);
    const result = await runCleanup(env);
    console.log(`[Cleanup] Complete: ${result.expiredFeatured} featured expired, ${result.markedPast} events marked past`);
    if (result.errors.length > 0) {
      console.error(`[Cleanup] Errors:`, result.errors);
    }
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/__cleanup' && request.method === 'POST') {
      console.log(`[Cleanup] Manual trigger from admin`);
      const result = await runCleanup(env);
      return new Response(JSON.stringify({
        success: true,
        expiredFeatured: result.expiredFeatured,
        markedPast: result.markedPast,
        errors: result.errors.length > 0 ? result.errors : undefined,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      worker: 'event-cleanup',
      schedule: '0 0 * * * (daily midnight)',
      lastRun: null,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
