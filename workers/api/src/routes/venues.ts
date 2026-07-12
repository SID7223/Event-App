import { Hono } from 'hono';
import { Env } from '../env';
import { query, first } from '../lib/db';
import { success } from '../lib/response';
import { NotFoundError } from '../lib/errors';

interface VenueRow {
  id: string;
  name: string;
  type: string;
  logo_id: string | null;
  cover_id: string | null;
  bio: string;
  address: string;
  neighborhood: string;
  website: string;
  rating: number;
  follower_count: number;
  event_count: number;
  tags: string;
  city: string | null;
  instagram: string;
}

interface EventRow {
  id: string;
  title: string;
  category_id: string | null;
  image_id: string | null;
  price: number;
  location: string;
  date: string;
  time: string;
  attendees: number;
  neighborhood: string | null;
  booking_type: string;
}

interface CategoryRow {
  name: string;
}

function mapVenue(row: VenueRow) {
  return {
    id: row.id,
    name: row.name,
    type: row.type as 'venue' | 'organizer',
    logo: row.logo_id ? `https://media.corlify.com/images/${row.logo_id}` : '',
    coverImage: row.cover_id ? `https://media.corlify.com/images/${row.cover_id}` : '',
    logoId: row.logo_id || undefined,
    coverId: row.cover_id || undefined,
    bio: row.bio,
    address: row.address,
    neighborhood: row.neighborhood,
    website: row.website,
    rating: row.rating,
    followerCount: row.follower_count,
    eventCount: row.event_count,
    tags: JSON.parse(row.tags || '[]'),
    city: row.city as 'lahore' | 'karachi' | 'islamabad' | undefined,
  };
}

function mapEventSummary(row: EventRow) {
  return {
    id: row.id,
    title: row.title,
    image: row.image_id ? `https://media.corlify.com/images/${row.image_id}` : '',
    price: row.price,
    date: row.date,
    time: row.time,
    location: row.location,
    attendees: row.attendees,
    neighborhood: row.neighborhood || undefined,
    bookingType: row.booking_type as 'external_link' | 'whatsapp' | 'in_app',
  };
}

export function register(app: Hono<{ Bindings: Env }>) {
  app.get('/venues', async (c) => {
    const type = c.req.query('type') || 'venue';
    const city = c.req.query('city');
    const neighborhood = c.req.query('neighborhood');

    let sql = "SELECT * FROM venues WHERE type = ?";
    const params: unknown[] = [type];

    if (city) {
      sql += ' AND city = ?';
      params.push(city);
    }

    if (neighborhood) {
      sql += ' AND neighborhood = ?';
      params.push(neighborhood);
    }

    sql += ' ORDER BY follower_count DESC';

    const venues = await query<VenueRow>(c.env.chillingz_db, sql, ...params);
    return success(c, venues.map(mapVenue));
  });

  app.get('/venues/:id', async (c) => {
    const id = c.req.param('id');
    const venue = await first<VenueRow>(
      c.env.chillingz_db,
      'SELECT * FROM venues WHERE id = ?',
      id
    );
    if (!venue) throw new NotFoundError('Venue', id);
    return success(c, mapVenue(venue));
  });

  app.get('/venues/:id/events', async (c) => {
    const id = c.req.param('id');
    const venue = await first<{ id: string }>(
      c.env.chillingz_db,
      'SELECT id FROM venues WHERE id = ?',
      id
    );
    if (!venue) throw new NotFoundError('Venue', id);

    const events = await query<EventRow>(
      c.env.chillingz_db,
      "SELECT id, title, category_id, image_id, price, location, date, time, attendees, neighborhood, booking_type FROM events WHERE venue_id = ? AND status = 'active' ORDER BY date ASC",
      id
    );

    const data = await Promise.all(events.map(async (ev) => {
      let categoryName: string | undefined;
      if (ev.category_id) {
        const cat = await first<CategoryRow>(
          c.env.chillingz_db,
          'SELECT name FROM categories WHERE id = ?',
          ev.category_id
        );
        categoryName = cat?.name;
      }
      return { ...mapEventSummary(ev), category: categoryName || '' };
    }));

    return success(c, data);
  });

  app.get('/organizers/:id', async (c) => {
    const id = c.req.param('id');
    const organizer = await first<VenueRow>(
      c.env.chillingz_db,
      "SELECT * FROM venues WHERE id = ? AND type = 'organizer'",
      id
    );
    if (!organizer) throw new NotFoundError('Organizer', id);

    return success(c, {
      id: organizer.id,
      name: organizer.name,
      avatar: organizer.logo_id ? `https://media.corlify.com/images/${organizer.logo_id}` : '',
      coverImage: organizer.cover_id ? `https://media.corlify.com/images/${organizer.cover_id}` : '',
      avatarId: organizer.logo_id || undefined,
      coverId: organizer.cover_id || undefined,
      bio: organizer.bio,
      website: organizer.website,
      instagram: organizer.instagram,
      rating: organizer.rating,
      followerCount: organizer.follower_count,
      eventCount: organizer.event_count,
      tags: JSON.parse(organizer.tags || '[]'),
      city: organizer.city as 'lahore' | 'karachi' | 'islamabad' | undefined,
    });
  });

  app.get('/organizers/:id/events', async (c) => {
    const id = c.req.param('id');
    const organizer = await first<{ id: string }>(
      c.env.chillingz_db,
      "SELECT id FROM venues WHERE id = ? AND type = 'organizer'",
      id
    );
    if (!organizer) throw new NotFoundError('Organizer', id);

    const events = await query<EventRow>(
      c.env.chillingz_db,
      "SELECT id, title, category_id, image_id, price, location, date, time, attendees, neighborhood, booking_type FROM events WHERE organizer_id = ? AND status = 'active' ORDER BY date ASC",
      id
    );

    const data = await Promise.all(events.map(async (ev) => {
      let categoryName: string | undefined;
      if (ev.category_id) {
        const cat = await first<CategoryRow>(
          c.env.chillingz_db,
          'SELECT name FROM categories WHERE id = ?',
          ev.category_id
        );
        categoryName = cat?.name;
      }
      return { ...mapEventSummary(ev), category: categoryName || '' };
    }));

    return success(c, data);
  });
}
