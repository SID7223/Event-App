import { Hono } from 'hono';
import { Env } from '../env';
import { query, first } from '../lib/db';
import { success } from '../lib/response';
import { NotFoundError } from '../lib/errors';

interface MovieRow {
  id: string;
  title: string;
  genre: string;
  duration: number;
  rating: number;
  poster_id: string | null;
  release_date: string | null;
  synopsis: string;
  director: string;
  cast: string;
  age_rating: string;
  city: string | null;
  booking_type: string;
  external_link: string | null;
  whatsapp_number: string | null;
  data_source: string;
}

interface CinemaRow {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string | null;
}

interface ShowtimeRow {
  id: string;
  movie_id: string;
  cinema_id: string;
  date: string;
  time: string;
  format: string;
  price: number;
  available_seats: number;
  booking_type: string;
  external_link: string | null;
  whatsapp_number: string | null;
  data_source: string;
  city: string | null;
}

function mapMovie(row: MovieRow) {
  return {
    id: row.id,
    title: row.title,
    genre: JSON.parse(row.genre || '[]'),
    duration: row.duration,
    rating: row.rating,
    poster: row.poster_id ? `https://media.corlify.com/images/${row.poster_id}` : '',
    posterId: row.poster_id || undefined,
    releaseDate: row.release_date || '',
    synopsis: row.synopsis,
    director: row.director,
    cast: JSON.parse(row.cast || '[]'),
    ageRating: row.age_rating,
    city: row.city as 'lahore' | 'karachi' | 'islamabad' | undefined,
    bookingType: row.booking_type as 'external_link' | 'whatsapp' | 'in_app',
    externalLink: row.external_link,
    whatsappNumber: row.whatsapp_number,
    dataSource: row.data_source as 'ticketwala' | 'bookme' | 'manual_entry' | 'user_host',
  };
}

function mapShowtime(row: ShowtimeRow) {
  return {
    id: row.id,
    movieId: row.movie_id,
    cinemaId: row.cinema_id,
    date: row.date,
    time: row.time,
    format: row.format as '2D' | '3D' | 'IMAX' | '4DX',
    price: row.price,
    availableSeats: row.available_seats,
    bookingType: row.booking_type as 'external_link' | 'whatsapp' | 'in_app',
    externalLink: row.external_link,
    whatsappNumber: row.whatsapp_number,
    dataSource: row.data_source as 'ticketwala' | 'bookme' | 'manual_entry' | 'user_host',
    city: row.city as 'lahore' | 'karachi' | 'islamabad' | undefined,
  };
}

function mapCinema(row: CinemaRow) {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    neighborhood: row.neighborhood,
    city: row.city as 'lahore' | 'karachi' | 'islamabad' | undefined,
  };
}

export function register(app: Hono<{ Bindings: Env }>) {
  app.get('/movies', async (c) => {
    const city = c.req.query('city');
    let sql = 'SELECT * FROM movies';
    const params: unknown[] = [];

    if (city) {
      sql += ' WHERE city = ?';
      params.push(city);
    }

    sql += ' ORDER BY rating DESC';
    const movies = await query<MovieRow>(c.env.chillingz_db, sql, ...params);

    const data = await Promise.all(movies.map(async (movie) => {
      const showtimes = await query<ShowtimeRow>(
        c.env.chillingz_db,
        'SELECT * FROM showtimes WHERE movie_id = ? AND date >= date(\'now\') ORDER BY date, time',
        movie.id
      );

      const cinemaIds = [...new Set(showtimes.map(s => s.cinema_id))];
      const cinemas = await Promise.all(cinemaIds.map(async (cid) => {
        const cinema = await first<CinemaRow>(
          c.env.chillingz_db,
          'SELECT * FROM cinemas WHERE id = ?',
          cid
        );
        if (!cinema) return null;
        return {
          cinema: mapCinema(cinema),
          showtimes: showtimes.filter(s => s.cinema_id === cid).map(mapShowtime),
        };
      }));

      return {
        ...mapMovie(movie),
        cinemas: cinemas.filter(Boolean),
      };
    }));

    return success(c, data);
  });

  app.get('/movies/:id', async (c) => {
    const id = c.req.param('id');
    const movie = await first<MovieRow>(
      c.env.chillingz_db,
      'SELECT * FROM movies WHERE id = ?',
      id
    );
    if (!movie) throw new NotFoundError('Movie', id);

    const showtimes = await query<ShowtimeRow>(
      c.env.chillingz_db,
      'SELECT * FROM showtimes WHERE movie_id = ? AND date >= date(\'now\') ORDER BY date, time',
      id
    );

    const cinemaIds = [...new Set(showtimes.map(s => s.cinema_id))];
    const cinemas = await Promise.all(cinemaIds.map(async (cid) => {
      const cinema = await first<CinemaRow>(
        c.env.chillingz_db,
        'SELECT * FROM cinemas WHERE id = ?',
        cid
      );
      if (!cinema) return null;
      return {
        cinema: mapCinema(cinema),
        showtimes: showtimes.filter(s => s.cinema_id === cid).map(mapShowtime),
      };
    }));

    return success(c, { ...mapMovie(movie), cinemas: cinemas.filter(Boolean) });
  });

  app.get('/movies/:id/showtimes', async (c) => {
    const id = c.req.param('id');
    const movie = await first<{ id: string }>(
      c.env.chillingz_db,
      'SELECT id FROM movies WHERE id = ?',
      id
    );
    if (!movie) throw new NotFoundError('Movie', id);

    const showtimes = await query<ShowtimeRow>(
      c.env.chillingz_db,
      'SELECT * FROM showtimes WHERE movie_id = ? ORDER BY date, time',
      id
    );

    return success(c, showtimes.map(mapShowtime));
  });

  app.get('/cinemas', async (c) => {
    const city = c.req.query('city');
    const neighborhood = c.req.query('neighborhood');

    let sql = 'SELECT * FROM cinemas';
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (city) { conditions.push('city = ?'); params.push(city); }
    if (neighborhood) { conditions.push('neighborhood = ?'); params.push(neighborhood); }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY name';
    const cinemas = await query<CinemaRow>(c.env.chillingz_db, sql, ...params);
    return success(c, cinemas.map(mapCinema));
  });

  app.get('/cinemas/:id/showtimes', async (c) => {
    const id = c.req.param('id');
    const cinema = await first<{ id: string }>(
      c.env.chillingz_db,
      'SELECT id FROM cinemas WHERE id = ?',
      id
    );
    if (!cinema) throw new NotFoundError('Cinema', id);

    const showtimes = await query<ShowtimeRow>(
      c.env.chillingz_db,
      'SELECT * FROM showtimes WHERE cinema_id = ? ORDER BY date, time',
      id
    );

    return success(c, showtimes.map(mapShowtime));
  });
}
