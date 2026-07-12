import { Hono } from 'hono';
import { Env } from '../env';
import { query, first } from '../lib/db';
import { success } from '../lib/response';
import { NotFoundError } from '../lib/errors';

interface RestaurantRow {
  id: string;
  name: string;
  cuisine: string;
  image_id: string | null;
  price_range: string;
  rating: number;
  review_count: number;
  address: string;
  neighborhood: string;
  distance: string | null;
  phone: string;
  is_open: number;
  has_live_music: number;
  opening_hours: string;
  tags: string;
  featured: number;
  city: string | null;
  booking_type: string;
  whatsapp_number: string | null;
  external_link: string | null;
  data_source: string;
}

function mapRestaurant(row: RestaurantRow) {
  return {
    id: row.id,
    name: row.name,
    cuisine: row.cuisine,
    image: row.image_id ? `https://media.corlify.com/images/${row.image_id}` : '',
    imageId: row.image_id || undefined,
    priceRange: row.price_range,
    rating: row.rating,
    reviewCount: row.review_count,
    address: row.address,
    neighborhood: row.neighborhood,
    distance: row.distance || '',
    phone: row.phone,
    isOpen: row.is_open === 1,
    hasLiveMusic: row.has_live_music === 1,
    openingHours: row.opening_hours,
    tags: JSON.parse(row.tags || '[]'),
    featured: row.featured === 1,
    city: row.city as 'lahore' | 'karachi' | 'islamabad' | undefined,
    bookingType: row.booking_type as 'external_link' | 'whatsapp' | 'in_app',
    whatsappNumber: row.whatsapp_number,
    externalLink: row.external_link,
    dataSource: row.data_source as 'ticketwala' | 'bookme' | 'manual_entry' | 'user_host',
  };
}

export function register(app: Hono<{ Bindings: Env }>) {
  app.get('/restaurants', async (c) => {
    const { cuisine, open_now, city, neighborhood, has_live_music, q } = c.req.query();

    let sql = 'SELECT * FROM restaurants';
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (cuisine) { conditions.push('cuisine LIKE ?'); params.push(`%${cuisine}%`); }
    if (city) { conditions.push('city = ?'); params.push(city); }
    if (neighborhood) { conditions.push('neighborhood = ?'); params.push(neighborhood); }
    if (open_now === 'true') { conditions.push('is_open = 1'); }
    if (has_live_music === 'true') { conditions.push('has_live_music = 1'); }
    if (q) {
      conditions.push('(name LIKE ? OR cuisine LIKE ? OR neighborhood LIKE ?)');
      const term = `%${q}%`;
      params.push(term, term, term);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const sort = c.req.query('sort');
    if (sort === 'rating') sql += ' ORDER BY rating DESC';
    else if (sort === 'reviews') sql += ' ORDER BY review_count DESC';
    else sql += ' ORDER BY featured DESC, rating DESC';

    const restaurants = await query<RestaurantRow>(c.env.chillingz_db, sql, ...params);
    return success(c, restaurants.map(mapRestaurant));
  });

  app.get('/restaurants/:id', async (c) => {
    const id = c.req.param('id');
    const restaurant = await first<RestaurantRow>(
      c.env.chillingz_db,
      'SELECT * FROM restaurants WHERE id = ?',
      id
    );
    if (!restaurant) throw new NotFoundError('Restaurant', id);
    return success(c, mapRestaurant(restaurant));
  });
}
