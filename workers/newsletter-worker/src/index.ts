import { EmailMessage } from 'cloudflare:email';
import { Env } from './env';
import { buildHtml, pickSubject } from './templates/newsletter';

function nanoid(size = 16): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (let i = 0; i < size; i++) { id += chars[bytes[i] % chars.length]; }
  return id;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

interface SubscriberRow {
  id: string;
  email: string;
  city: string;
  is_active: number;
  unsubscribe_token: string;
}

interface EventRow {
  id: string;
  title: string;
  category_id: string | null;
  image_id: string | null;
  image_url: string | null;
  price: number;
  location: string;
  date: string;
  time: string;
  neighborhood: string | null;
  city: string;
}

interface CategoryRow {
  name: string;
}

const CITY_MAP: Record<string, string> = {
  lahore: 'lahore',
  lhr: 'lahore',
  karachi: 'karachi',
  khi: 'karachi',
  islamabad: 'islamabad',
  isb: 'islamabad',
  rawalpindi: 'islamabad',
};

function detectCity(request: Request): string {
  const cf = (request as any).cf;
  if (cf?.city) {
    const city = cf.city.toLowerCase().trim();
    for (const [key, value] of Object.entries(CITY_MAP)) {
      if (city.includes(key)) return value;
    }
  }
  return 'lahore';
}

function getEventImageUrl(row: EventRow): string {
  if (row.image_id) return `https://media.corlify.com/images/${row.image_id}`;
  if (row.image_url) return row.image_url;
  return `https://picsum.photos/seed/${row.id}/400/200`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (url.pathname === '/subscribe' && request.method === 'POST') {
      return handleSubscribe(request, env);
    }

    if (url.pathname === '/unsubscribe' && (request.method === 'GET' || request.method === 'POST')) {
      return handleUnsubscribe(request, env);
    }

    if (url.pathname === '/send-newsletter' && request.method === 'POST') {
      return handleSendNewsletter(request, env);
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: CORS_HEADERS });
  },
};

async function handleSubscribe(request: Request, env: Env): Promise<Response> {
  try {
    const { email } = await request.json() as { email: string };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400, headers: CORS_HEADERS });
    }

    const city = detectCity(request);
    const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '';
    const ua = request.headers.get('User-Agent') || '';

    const existing = await env.chillingz_db.prepare(
      'SELECT id, is_active, unsubscribe_token FROM newsletter_subscribers WHERE email = ?'
    ).bind(email).first<SubscriberRow>();

    if (existing) {
      if (existing.is_active === 1) {
        return new Response(JSON.stringify({ message: 'Already subscribed', city }), { headers: CORS_HEADERS });
      }
      await env.chillingz_db.prepare(
        "UPDATE newsletter_subscribers SET is_active = 1, city = ?, ip_address = ?, user_agent = ?, unsubscribed_at = NULL, subscribed_at = datetime('now') WHERE id = ?"
      ).bind(city, ip, ua, existing.id).run();
      return new Response(JSON.stringify({ message: 'Resubscribed successfully', city }), { status: 200, headers: CORS_HEADERS });
    }

    const subscriberId = `sub_${nanoid(12)}`;
    const unsubToken = nanoid(24);

    await env.chillingz_db.prepare(
      "INSERT INTO newsletter_subscribers (id, email, city, ip_address, user_agent, unsubscribe_token, subscribed_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))"
    ).bind(subscriberId, email, city, ip, ua, unsubToken).run();

    return new Response(JSON.stringify({ message: 'Subscribed successfully', city }), { status: 201, headers: CORS_HEADERS });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Subscription failed' }), { status: 500, headers: CORS_HEADERS });
  }
}

async function handleUnsubscribe(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const email = request.method === 'GET' ? url.searchParams.get('email') : (await request.json() as any).email;
    const token = request.method === 'GET' ? url.searchParams.get('token') : (await request.json() as any).token;

    if (!token && !email) {
      return new Response(JSON.stringify({ error: 'Email or token required' }), { status: 400, headers: CORS_HEADERS });
    }

    let existing: SubscriberRow | null = null;

    if (token) {
      existing = await env.chillingz_db.prepare(
        'SELECT id, email, is_active FROM newsletter_subscribers WHERE unsubscribe_token = ?'
      ).bind(token).first<SubscriberRow>();
    }

    if (!existing && email) {
      existing = await env.chillingz_db.prepare(
        'SELECT id, email, is_active FROM newsletter_subscribers WHERE email = ?'
      ).bind(email).first<SubscriberRow>();
    }

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Subscriber not found' }), { status: 404, headers: CORS_HEADERS });
    }

    if (existing.is_active === 0) {
      return new Response(JSON.stringify({ message: 'Already unsubscribed' }), { headers: CORS_HEADERS });
    }

    await env.chillingz_db.prepare(
      "UPDATE newsletter_subscribers SET is_active = 0, unsubscribed_at = datetime('now') WHERE id = ?"
    ).bind(existing.id).run();

    return new Response(JSON.stringify({ message: 'Unsubscribed successfully' }), { headers: CORS_HEADERS });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Unsubscribe failed' }), { status: 500, headers: CORS_HEADERS });
  }
}

async function handleSendNewsletter(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json().catch(() => ({})) as any;
    const targetCity = body.city || null;

    // Fetch active subscribers
    let sql = 'SELECT id, email, city, is_active, unsubscribe_token FROM newsletter_subscribers WHERE is_active = 1';
    const params: unknown[] = [];
    if (targetCity) {
      sql += ' AND city = ?';
      params.push(targetCity);
    }
    const subscribers = await env.chillingz_db.prepare(sql).bind(...params).all<SubscriberRow>();
    const subscriberList = subscribers.results || [];

    if (subscriberList.length === 0) {
      return new Response(JSON.stringify({ error: 'No active subscribers', sent: 0 }), { headers: CORS_HEADERS });
    }

    // Group subscribers by city
    const cityGroups: Record<string, SubscriberRow[]> = {};
    for (const sub of subscriberList) {
      const c = sub.city || 'lahore';
      if (!cityGroups[c]) cityGroups[c] = [];
      cityGroups[c].push(sub);
    }

    let totalSent = 0;
    const errors: string[] = [];

    for (const [city, subs] of Object.entries(cityGroups)) {
      // Fetch 3 random events for this city
      const events = await env.chillingz_db.prepare(
        "SELECT id, title, category_id, image_id, image_url, price, location, date, time, neighborhood, city FROM events WHERE city = ? AND status = 'active' AND date >= date('now') ORDER BY RANDOM() LIMIT 3"
      ).bind(city).all<EventRow>();
      const eventList = events.results || [];

      if (eventList.length === 0) continue;

      // Resolve category names
      const enrichedEvents = await Promise.all(eventList.map(async (ev) => {
        let category = ev.category_id || 'Event';
        if (ev.category_id) {
          const cat = await env.chillingz_db.prepare(
            'SELECT name FROM categories WHERE id = ?'
          ).bind(ev.category_id).first<CategoryRow>();
          if (cat) category = cat.name;
        }
        return {
          imageUrl: getEventImageUrl(ev),
          title: ev.title,
          date: ev.date,
          time: ev.time,
          location: ev.location,
          price: ev.price,
          category,
          city: ev.city,
        };
      }));

      const subject = pickSubject();

      // Send to each subscriber in this city
      for (const sub of subs) {
        try {
          const html = buildHtml({
            events: enrichedEvents,
            city,
            subscriberEmail: sub.email,
            unsubscribeToken: sub.unsubscribe_token,
            subject,
          });

          const msg = new EmailMessage(
            'newsletter@chillingz.com',
            sub.email,
            { subject, html } as any
          );
          await env.NEWSLETTER_EMAIL.send(msg);
          totalSent++;
        } catch (e: any) {
          errors.push(`${sub.email}: ${e.message}`);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      sent: totalSent,
      errors: errors.length > 0 ? errors : undefined,
      city: targetCity || 'all',
    }), { headers: CORS_HEADERS });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Send failed', sent: 0 }), { status: 500, headers: CORS_HEADERS });
  }
}
