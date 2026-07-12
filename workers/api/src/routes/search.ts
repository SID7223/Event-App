import { Hono } from 'hono';
import { Env } from '../env';
import { query, first } from '../lib/db';
import { success } from '../lib/response';

interface EventRow {
  id: string;
  title: string;
  category_id: string | null;
  image_id: string | null;
  price: number;
  location: string;
  date: string;
  time: string;
  neighborhood: string | null;
  city: string;
  attendees: number;
  booking_type: string;
}

interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface VenueRow {
  id: string;
  name: string;
  type: string;
  logo_id: string | null;
  neighborhood: string;
}

interface RestaurantRow {
  id: string;
  name: string;
  cuisine: string;
  image_id: string | null;
  neighborhood: string;
  rating: number;
  price_range: string;
}

export function register(app: Hono<{ Bindings: Env }>) {
  app.get('/search', async (c) => {
    const q = (c.req.query('q') || '').trim();
    const type = c.req.query('type') || 'all';
    const city = c.req.query('city');
    const category = c.req.query('category');

    const results: Record<string, unknown[]> = {};

    if (!q && !city && !category) {
      return success(c, { events: [], categories: [], total: 0 });
    }

    if (type === 'all' || type === 'events') {
      const conditions: string[] = ["e.status = 'active'"];
      const eventParams: unknown[] = [];

      if (q) {
        conditions.push("(e.title LIKE ? OR e.location LIKE ?)");
        const term = `%${q}%`;
        eventParams.push(term, term);
      }
      if (city) { conditions.push('e.city = ?'); eventParams.push(city); }
      if (category) {
        conditions.push('(c.name = ? OR c.id = ?)');
        eventParams.push(category, category);
      }

      const events = await query<EventRow>(
        c.env.chillingz_db,
        `SELECT e.* FROM events e LEFT JOIN categories c ON e.category_id = c.id WHERE ${conditions.join(' AND ')} ORDER BY e.attendees DESC LIMIT 20`,
        ...eventParams
      );

      results.events = await Promise.all(events.map(async (ev) => {
        let categoryName: string | undefined;
        if (ev.category_id) {
          const cat = await first<{ name: string }>(
            c.env.chillingz_db,
            'SELECT name FROM categories WHERE id = ?',
            ev.category_id
          );
          categoryName = cat?.name;
        }
        return {
          id: ev.id,
          title: ev.title,
          category: categoryName || ev.category_id || '',
          image: ev.image_id ? `https://media.corlify.com/images/${ev.image_id}` : '',
          price: ev.price,
          location: ev.location,
          date: ev.date,
          time: ev.time,
          neighborhood: ev.neighborhood,
          city: ev.city,
          attendees: ev.attendees,
          bookingType: ev.booking_type,
        };
      }));
    }

    if (type === 'all' || type === 'venues') {
      const conditions: string[] = [];
      const venueParams: unknown[] = [];

      if (q) {
        conditions.push('(name LIKE ? OR neighborhood LIKE ?)');
        const term = `%${q}%`;
        venueParams.push(term, term);
      }
      if (city) { conditions.push('city = ?'); venueParams.push(city); }

      const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
      const venues = await query<VenueRow>(
        c.env.chillingz_db,
        `SELECT id, name, type, logo_id, neighborhood FROM venues ${where} ORDER BY follower_count DESC LIMIT 10`,
        ...venueParams
      );

      results.venues = venues.map(v => ({
        id: v.id,
        name: v.name,
        type: v.type,
        logo: v.logo_id ? `https://media.corlify.com/images/${v.logo_id}` : '',
        neighborhood: v.neighborhood,
      }));
    }

    if (type === 'all' || type === 'restaurants') {
      const conditions: string[] = [];
      const restParams: unknown[] = [];

      if (q) {
        conditions.push('(name LIKE ? OR cuisine LIKE ? OR neighborhood LIKE ?)');
        const term = `%${q}%`;
        restParams.push(term, term, term);
      }
      if (city) { conditions.push('city = ?'); restParams.push(city); }

      const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
      const restaurants = await query<RestaurantRow>(
        c.env.chillingz_db,
        `SELECT id, name, cuisine, image_id, neighborhood, rating, price_range FROM restaurants ${where} ORDER BY rating DESC LIMIT 10`,
        ...restParams
      );

      results.restaurants = restaurants.map(r => ({
        id: r.id,
        name: r.name,
        cuisine: r.cuisine,
        image: r.image_id ? `https://media.corlify.com/images/${r.image_id}` : '',
        neighborhood: r.neighborhood,
        rating: r.rating,
        priceRange: r.price_range,
      }));
    }

    const categories = await query<CategoryRow>(
      c.env.chillingz_db,
      'SELECT id, name, icon, color FROM categories ORDER BY sort_order ASC'
    );

    return success(c, {
      ...results,
      categories: categories.map(c => ({ id: c.id, name: c.name, icon: c.icon, color: c.color, count: 0 })),
      total: (results.events as unknown[])?.length ?? 0,
    });
  });
}
