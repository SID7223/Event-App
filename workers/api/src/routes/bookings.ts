import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { Env } from '../env';
import { requireAuth } from '../lib/auth';
import { query, first, run } from '../lib/db';
import { success, created } from '../lib/response';
import { NotFoundError } from '../lib/errors';
import { createBookingSchema } from '../schemas/booking';

interface BookingRow {
  id: string;
  user_id: string;
  event_id: string;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
}

interface TicketRow {
  id: string;
  booking_id: string;
  event_id: string;
  user_id: string;
  type: string;
  price: number;
  quantity: number;
  seat: string | null;
  qr_code: string | null;
  status: string;
  purchase_date: string;
}

function nanoid(size = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (let i = 0; i < size; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return id;
}

export function register(app: Hono<{ Bindings: Env }>) {
  app.get('/bookings', requireAuth, async (c) => {
    const userId = c.get('userId');
    const bookings = await query<BookingRow>(
      c.env.chillingz_db,
      'SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC',
      userId
    );

    const data = await Promise.all(bookings.map(async (b) => {
      const tickets = await query<TicketRow>(
        c.env.chillingz_db,
        'SELECT * FROM tickets WHERE booking_id = ?',
        b.id
      );

      return {
        id: b.id,
        eventId: b.event_id,
        tickets: tickets.map(t => ({
          id: t.id,
          eventId: t.event_id,
          userId: t.user_id,
          type: t.type,
          price: t.price,
          quantity: t.quantity,
          seat: t.seat || '',
          qrCode: t.qr_code || '',
          status: t.status as 'upcoming' | 'past' | 'cancelled',
          purchaseDate: t.purchase_date,
        })),
        totalAmount: b.total_amount,
        paymentMethod: b.payment_method,
        status: b.status,
        date: b.created_at,
      };
    }));

    return success(c, data);
  });

  app.get('/bookings/:id', requireAuth, async (c) => {
    const id = c.req.param('id');
    const userId = c.get('userId');

    const booking = await first<BookingRow>(
      c.env.chillingz_db,
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      id, userId
    );
    if (!booking) throw new NotFoundError('Booking', id);

    const tickets = await query<TicketRow>(
      c.env.chillingz_db,
      'SELECT * FROM tickets WHERE booking_id = ?',
      id
    );

    return success(c, {
      id: booking.id,
      eventId: booking.event_id,
      tickets: tickets.map(t => ({
        id: t.id,
        eventId: t.event_id,
        userId: t.user_id,
        type: t.type,
        price: t.price,
        quantity: t.quantity,
        seat: t.seat || '',
        qrCode: t.qr_code || '',
        status: t.status as 'upcoming' | 'past' | 'cancelled',
        purchaseDate: t.purchase_date,
      })),
      totalAmount: booking.total_amount,
      paymentMethod: booking.payment_method,
      status: booking.status,
      date: booking.created_at,
    });
  });

  app.post('/bookings', requireAuth, zValidator('json', createBookingSchema), async (c) => {
    const body = c.req.valid('json');
    const userId = c.get('userId');

    const event = await first<{ id: string; title: string }>(
      c.env.chillingz_db,
      "SELECT id, title FROM events WHERE id = ? AND status = 'active'",
      body.eventId
    );
    if (!event) throw new NotFoundError('Event', body.eventId);

    const bookingId = `bkg_${nanoid(12)}`;
    const now = new Date().toISOString();

    await run(
      c.env.chillingz_db,
      'INSERT INTO bookings (id, user_id, event_id, total_amount, payment_method, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      bookingId, userId, body.eventId, body.totalAmount, body.paymentMethod, 'confirmed', now
    );

    for (const ticket of body.tickets) {
      const ticketId = `tkt_${nanoid(12)}`;
      await run(
        c.env.chillingz_db,
        'INSERT INTO tickets (id, booking_id, event_id, user_id, type, price, quantity, seat, qr_code, status, purchase_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ticketId, bookingId, body.eventId, userId, ticket.type, ticket.price,
        ticket.quantity, ticket.seat || null, `qr_${nanoid(16)}`, 'upcoming', now
      );
    }

    const booking = await first<BookingRow>(
      c.env.chillingz_db,
      'SELECT * FROM bookings WHERE id = ?',
      bookingId
    );

    const tickets = await query<TicketRow>(
      c.env.chillingz_db,
      'SELECT * FROM tickets WHERE booking_id = ?',
      bookingId
    );

    return created(c, {
      id: booking!.id,
      eventId: booking!.event_id,
      tickets: tickets.map(t => ({
        id: t.id,
        eventId: t.event_id,
        userId: t.user_id,
        type: t.type,
        price: t.price,
        quantity: t.quantity,
        seat: t.seat || '',
        qrCode: t.qr_code || '',
        status: t.status as 'upcoming' | 'past' | 'cancelled',
        purchaseDate: t.purchase_date,
      })),
      totalAmount: booking!.total_amount,
      paymentMethod: booking!.payment_method,
      status: booking!.status,
      date: booking!.created_at,
    });
  });

  app.get('/tickets', requireAuth, async (c) => {
    const userId = c.get('userId');
    const tickets = await query<TicketRow>(
      c.env.chillingz_db,
      'SELECT * FROM tickets WHERE user_id = ? ORDER BY purchase_date DESC',
      userId
    );

    return success(c, tickets.map(t => ({
      id: t.id,
      eventId: t.event_id,
      userId: t.user_id,
      type: t.type,
      price: t.price,
      quantity: t.quantity,
      seat: t.seat || '',
      qrCode: t.qr_code || '',
      status: t.status as 'upcoming' | 'past' | 'cancelled',
      purchaseDate: t.purchase_date,
    })));
  });
}
