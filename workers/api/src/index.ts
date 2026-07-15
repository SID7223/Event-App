import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './env';
import { handleError } from './lib/errors';
import { securityHeaders } from './lib/security';
import { register as registerEvents } from './routes/events';
import { register as registerVenues } from './routes/venues';
import { register as registerBookings } from './routes/bookings';
import { register as registerMovies } from './routes/movies';
import { register as registerRestaurants } from './routes/restaurants';
import { register as registerUsers } from './routes/users';
import { register as registerSocial } from './routes/social';
import { register as registerHost } from './routes/host';
import { register as registerNotifications } from './routes/notifications';
import { register as registerCategories } from './routes/categories';
import { register as registerSearch } from './routes/search';
import { register as registerDms } from './routes/dms';
import { register as registerPusher } from './routes/pusher';
import { register as registerTickets } from './routes/tickets';
import { register as registerCreator } from './routes/creator';
import { register as registerAdmin } from './routes/admin';
import { register as registerAuth } from './routes/auth';

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400,
}));

app.use('*', securityHeaders);

app.onError(handleError);

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

registerEvents(app);
registerVenues(app);
registerBookings(app);
registerMovies(app);
registerRestaurants(app);
registerUsers(app);
registerSocial(app);
registerHost(app);
registerNotifications(app);
registerCategories(app);
registerSearch(app);
registerDms(app);
registerPusher(app);
registerTickets(app);
registerCreator(app);
registerAdmin(app);
registerAuth(app);

app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${c.req.method} ${c.req.path}`,
    },
  }, 404);
});

export default app;
