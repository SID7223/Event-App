import { API_BASE_URL } from '../constants/config';
import { useAuth } from '../store';
import { Event, User, Ticket, Notification, Booking, SearchResult, Restaurant, MovieWithShowtimes } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

function getToken(): string | null {
  const state = useAuth.getState();
  return state.authToken || null;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const body = await res.json();

  if (!res.ok) {
    const err = body as ApiError;
    throw new Error(err.error?.message || `Request failed: ${res.status}`);
  }

  const response = body as ApiResponse<T>;
  return response.data;
}

function addParams(path: string, params?: Record<string, string | number | undefined>): string {
  if (!params) return path;
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function getEvents(params?: {
  category?: string;
  city?: string;
  q?: string;
  neighborhood?: string;
  page?: number;
  limit?: number;
  sort?: 'date' | 'popular' | 'rating';
}): Promise<Event[]> {
  return request<Event[]>(addParams('/events', params));
}

export async function getEventById(id: string): Promise<Event> {
  return request<Event>(`/events/${id}`);
}

export async function getEventsByCategory(category: string): Promise<Event[]> {
  return request<Event[]>(`/events?category=${encodeURIComponent(category)}`);
}

export async function searchEvents(query: string): Promise<Event[]> {
  return request<Event[]>(`/events?q=${encodeURIComponent(query)}`);
}

export async function getPopularEvents(): Promise<Event[]> {
  return request<Event[]>('/events/popular');
}

export async function getUpcomingEvents(): Promise<Event[]> {
  return request<Event[]>('/events/upcoming');
}

export async function getCategories(): Promise<{ id: string; name: string; icon: string; color: string; count: number }[]> {
  return request('/categories');
}

export async function getVibes(): Promise<{ id: string; label: string; icon: string; categories: string[] }[]> {
  return request('/vibes');
}

export async function getUser(): Promise<User> {
  return request<User>('/users/me');
}

export async function updateProfile(data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}): Promise<User> {
  return request<User>('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updatePreferences(preferences: string[]): Promise<{ preferences: string[] }> {
  return request('/users/me/preferences', {
    method: 'PUT',
    body: JSON.stringify({ preferences }),
  });
}

export async function updateLocation(data: {
  city: string;
  neighborhood: string;
  latitude?: number;
  longitude?: number;
}): Promise<{ city: string; neighborhood: string }> {
  return request('/users/me/location', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getTickets(): Promise<Ticket[]> {
  return request<Ticket[]>('/tickets');
}

export async function getNotifications(params?: { unread?: boolean }): Promise<{
  items: Notification[];
  unreadCount: number;
}> {
  return request(addParams('/notifications', params));
}

export async function markNotificationRead(id: string): Promise<void> {
  await request(`/notifications/${id}/read`, { method: 'PUT' });
}

export async function markAllNotificationsRead(): Promise<void> {
  await request('/notifications/read-all', { method: 'PUT' });
}

export async function getBookings(): Promise<Booking[]> {
  return request<Booking[]>('/bookings');
}

export async function createBooking(data: {
  eventId: string;
  tickets: { type: string; price: number; quantity: number; seat?: string }[];
  paymentMethod: string;
  totalAmount: number;
}): Promise<Booking> {
  return request<Booking>('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function toggleFavorite(eventId: string): Promise<{ eventId: string; favorited: boolean }> {
  return request<{ eventId: string; favorited: boolean }>(`/favorites/${eventId}`, {
    method: 'POST',
  });
}

export async function getFavorites(): Promise<string[]> {
  return request<string[]>('/favorites');
}

export async function getFollows(): Promise<{
  venues: { id: string; name: string }[];
  organizers: { id: string; name: string }[];
}> {
  return request('/follows');
}

export async function followVenue(id: string): Promise<void> {
  await request(`/follows/venue/${id}`, { method: 'POST' });
}

export async function unfollowVenue(id: string): Promise<void> {
  await request(`/follows/venue/${id}`, { method: 'DELETE' });
}

export async function followOrganizer(id: string): Promise<void> {
  await request(`/follows/organizer/${id}`, { method: 'POST' });
}

export async function unfollowOrganizer(id: string): Promise<void> {
  await request(`/follows/organizer/${id}`, { method: 'DELETE' });
}

export async function getVenues(params?: {
  type?: string;
  city?: string;
  neighborhood?: string;
}): Promise<any[]> {
  return request(addParams('/venues', params));
}

export async function getVenueById(id: string): Promise<any> {
  return request(`/venues/${id}`);
}

export async function getVenueEvents(id: string): Promise<any[]> {
  return request(`/venues/${id}/events`);
}

export async function getOrganizerById(id: string): Promise<any> {
  return request(`/organizers/${id}`);
}

export async function getOrganizerEvents(id: string): Promise<any[]> {
  return request(`/organizers/${id}/events`);
}

export async function getMovies(): Promise<MovieWithShowtimes[]> {
  return request<MovieWithShowtimes[]>('/movies');
}

export async function getMovieById(id: string): Promise<MovieWithShowtimes> {
  return request<MovieWithShowtimes>(`/movies/${id}`);
}

export async function getMovieShowtimes(id: string): Promise<any[]> {
  return request(`/movies/${id}/showtimes`);
}

export async function getCinemas(): Promise<any[]> {
  return request('/cinemas');
}

export async function getCinemaShowtimes(id: string): Promise<any[]> {
  return request(`/cinemas/${id}/showtimes`);
}

export async function getRestaurants(params?: {
  cuisine?: string;
  open_now?: string;
  city?: string;
  neighborhood?: string;
  has_live_music?: string;
  q?: string;
  sort?: 'rating' | 'reviews';
}): Promise<Restaurant[]> {
  return request<Restaurant[]>(addParams('/restaurants', params));
}

export async function getRestaurantById(id: string): Promise<Restaurant> {
  return request<Restaurant>(`/restaurants/${id}`);
}

export async function searchAll(params: {
  q?: string;
  type?: string;
  city?: string;
  category?: string;
}): Promise<SearchResult> {
  return request<SearchResult>(addParams('/search', params));
}

export async function submitHostedEvent(data: {
  title: string;
  description: string;
  date: string;
  time?: string;
  venueName: string;
  neighborhood: string;
  address: string;
  price?: number;
  category?: string;
  imageUrl?: string;
  externalLink?: string;
}): Promise<{ id: string; title: string; status: string }> {
  return request('/events/hosted', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getHostedEvents(): Promise<any[]> {
  return request('/events/hosted');
}

export async function getFriends(): Promise<any[]> {
  return request('/friends');
}

export async function addFriend(id: string): Promise<void> {
  await request(`/friends/${id}`, { method: 'POST' });
}

export async function removeFriend(id: string): Promise<void> {
  await request(`/friends/${id}`, { method: 'DELETE' });
}

export async function getPrivacySettings(): Promise<{ hideRSVPs: boolean }> {
  return request('/privacy');
}

export async function updatePrivacySettings(data: { hideRSVPs: boolean }): Promise<{ hideRSVPs: boolean }> {
  return request('/privacy', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
