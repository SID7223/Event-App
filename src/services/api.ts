import { API_BASE_URL } from '../constants/config';
import { useAuth } from '../store';
import { Event, User, Ticket, Notification, Booking, SearchResult, Restaurant, MovieWithShowtimes, AdminAnalytics, Billboard, ScrapperEvent, ScrapperOrganizer, PaginatedResult, AdminSession, Conversation, Message, CreatorDashboardData, ProfessionalApplication, FriendAttending } from '../types';

interface AuthResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

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

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error?.message || 'Login failed');
  }

  return body.data;
}

export async function signup(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error?.message || 'Signup failed');
  }

  return body.data;
}

function getToken(): string | null {
  const state = useAuth.getState();
  return state.authToken || null;
}

function getRefreshToken(): string | null {
  const state = useAuth.getState();
  return state.refreshToken || null;
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    const body = await res.json();
    if (!res.ok || !body.success) {
      useAuth.getState().logout();
      return false;
    }

    const { accessToken, refreshToken, accessTokenExpiresAt } = body.data;
    const state = useAuth.getState();
    state.loginWithTokens(accessToken, refreshToken, accessTokenExpiresAt, state.user);
    return true;
  } catch {
    useAuth.getState().logout();
    return false;
  }
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

  let res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshTokens();
    }

    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed) {
      const newToken = getToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
      }
      res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });
    }
  }

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
  gender?: 'male' | 'female' | 'other';
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
  latitude?: number;
  longitude?: number;
}): Promise<{ city: string }> {
  return request<{ city: string }>('/users/me', {
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
  return request<{ eventId: string; favorited: boolean }>(`/events/${eventId}/favorite`, {
    method: 'POST',
  });
}

export async function getFavorites(): Promise<Event[]> {
  return request<Event[]>('/events?favorited=true');
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
  await request(`/follows/venue/${id}`, { method: 'POST' });
}

export async function followOrganizer(id: string): Promise<void> {
  await request(`/follows/organizer/${id}`, { method: 'POST' });
}

export async function unfollowOrganizer(id: string): Promise<void> {
  await request(`/follows/organizer/${id}`, { method: 'POST' });
}

export async function getVenues(params?: {
  type?: string;
  city?: string;
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

export async function getFriendSuggestions(limit = 10): Promise<any[]> {
  const res = await request<{ suggestions: any[] }>(`/friends/suggestions?limit=${limit}`);
  return res.suggestions;
}

export async function searchUsers(query: string, limit = 10): Promise<any[]> {
  const res = await request<{ results: any[] }>(`/friends/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  return res.results;
}

export async function getFriendsAttendingEvent(eventId: string): Promise<any[]> {
  const res = await request<{ friends: any[] }>(`/events/${eventId}/friends-attending`);
  return res.friends;
}

export async function uploadAvatar(localUri: string): Promise<string> {
  const state = useAuth.getState();
  const token = state.authToken;
  if (!token) throw new Error('Not authenticated');

  const ext = localUri.split('.').pop() || 'jpg';
  const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  const initRes = await fetch(`${API_BASE_URL}/users/me/avatar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ contentType, extension: ext }),
  });

  const initBody = await initRes.json();
  if (!initRes.ok || !initBody.success) {
    throw new Error(initBody.error?.message || 'Failed to initiate avatar upload');
  }

  const { uploadUrl, key } = initBody.data;

  const fileRes = await fetch(localUri);
  const blob = await fileRes.blob();

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
  });

  if (!uploadRes.ok) {
    throw new Error('Failed to upload file to storage');
  }

  const confirmRes = await fetch(`${API_BASE_URL}/users/me/avatar`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ key }),
  });

  const confirmBody = await confirmRes.json();
  if (!confirmRes.ok || !confirmBody.success) {
    throw new Error(confirmBody.error?.message || 'Failed to confirm avatar upload');
  }

  return confirmBody.data.avatarUrl;
}

export async function uploadEventImage(localUri: string): Promise<string> {
  const state = useAuth.getState();
  const token = state.authToken;
  if (!token) throw new Error('Not authenticated');

  const ext = localUri.split('.').pop() || 'jpg';
  const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  const initRes = await fetch(`${API_BASE_URL}/upload/event-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ contentType, extension: ext }),
  });

  const initBody = await initRes.json();
  if (!initRes.ok || !initBody.success) {
    throw new Error(initBody.error?.message || 'Failed to initiate event image upload');
  }

  const { uploadUrl, key } = initBody.data;

  const fileRes = await fetch(localUri);
  const blob = await fileRes.blob();

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
  });

  if (!uploadRes.ok) {
    throw new Error('Failed to upload file to storage');
  }

  const confirmRes = await fetch(`${API_BASE_URL}/upload/event-image`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ key }),
  });

  const confirmBody = await confirmRes.json();
  if (!confirmRes.ok || !confirmBody.success) {
    throw new Error(confirmBody.error?.message || 'Failed to confirm event image upload');
  }

  return confirmBody.data.imageUrl || confirmBody.data.image_id;
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

// ───── DM / Messaging API ────────────────────────────────────────────────────

export async function getConversations(): Promise<Conversation[]> {
  return request<Conversation[]>('/conversations');
}

export async function createConversation(participantIds: string[], title?: string): Promise<{ id: string; existing: boolean }> {
  return request<{ id: string; existing: boolean }>('/conversations', {
    method: 'POST',
    body: JSON.stringify({ participantIds, title }),
  });
}

export async function getConversation(id: string): Promise<Conversation> {
  return request<Conversation>(`/conversations/${id}`);
}

export async function getMessages(conversationId: string, params?: { cursor?: string; limit?: number }): Promise<{ messages: Message[]; nextCursor: string | null }> {
  const res = await request<{ messages: Message[]; nextCursor: string | null }>(addParams(`/conversations/${conversationId}/messages`, params));
  return res;
}

export async function sendMessage(conversationId: string, data: { content: string; type?: string; mediaUrl?: string; replyToId?: string }): Promise<Message> {
  return request<Message>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function editMessage(messageId: string, content: string): Promise<{ id: string; content: string }> {
  return request(`/messages/${messageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  });
}

export async function deleteMessage(messageId: string): Promise<{ id: string }> {
  return request(`/messages/${messageId}`, {
    method: 'DELETE',
  });
}

export async function markConversationRead(conversationId: string): Promise<void> {
  await request(`/conversations/${conversationId}/read`, { method: 'POST' });
}

export async function setConversationTyping(conversationId: string, isTyping: boolean): Promise<void> {
  await request(`/conversations/${conversationId}/typing?isTyping=${isTyping}`, { method: 'POST' });
}

export async function muteConversation(conversationId: string, muted: boolean): Promise<void> {
  await request(`/conversations/${conversationId}/mute?muted=${muted}`, { method: 'PUT' });
}

export async function submitProfessionalApplication(data: { businessName: string; businessType: string; phone: string; documentUrl?: string }): Promise<{ id: string }> {
  return request<{ id: string }>('/creator/apply', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCreatorDashboard(): Promise<CreatorDashboardData> {
  return request<CreatorDashboardData>('/creator/dashboard');
}

export async function getCreatorEvents(params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResult<any>> {
  return request<PaginatedResult<any>>(addParams('/creator/events', params));
}

export async function createCreatorEvent(data: any): Promise<{ id: string }> {
  return request<{ id: string }>('/creator/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCreatorEvent(id: string, data: any): Promise<{ id: string }> {
  return request(`/creator/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCreatorEvent(id: string): Promise<{ id: string }> {
  return request(`/creator/events/${id}`, { method: 'DELETE' });
}

export async function getEventAttendees(eventId: string): Promise<any[]> {
  return request(`/events/${eventId}/attendees`);
}

export async function getAttendeesForCreator(eventId: string): Promise<any[]> {
  return request(`/creator/rsvps/${eventId}`);
}

export async function getFriendsAttending(eventId: string): Promise<FriendAttending[]> {
  return request<FriendAttending[]>(`/events/${eventId}/friends-attending`);
}

export async function rsvpEvent(eventId: string, data: { status?: string; plusOne?: boolean }): Promise<void> {
  await request(`/events/${eventId}/rsvp`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function cancelRsvp(eventId: string): Promise<void> {
  await request(`/events/${eventId}/rsvp`, { method: 'DELETE' });
}

export async function getAdminApplications(params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResult<ProfessionalApplication>> {
  return request<PaginatedResult<ProfessionalApplication>>(addParams('/admin/professional-applications', params));
}

export async function reviewApplication(id: string, status: 'approved' | 'rejected'): Promise<{ id: string; status: string }> {
  return request(`/admin/professional-applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getAdminShowtimes(params?: { page?: number; limit?: number }): Promise<PaginatedResult<any>> {
  return request<PaginatedResult<any>>(addParams('/admin/showtimes', params));
}

export async function toggleFeatured(eventId: string, featured: boolean): Promise<void> {
  await request(`/admin/showtimes/${eventId}/feature?featured=${featured}`, { method: 'PATCH' });
}

// ───── Admin API ─────────────────────────────────────────────────────────────

export async function adminGetUsers(params?: { page?: number; limit?: number; q?: string }): Promise<PaginatedResult<User>> {
  return request<PaginatedResult<User>>(addParams('/admin/users', params));
}

export async function adminGetUser(id: string): Promise<{ user: User; sessions: AdminSession[]; events: Event[] }> {
  return request(`/admin/users/${id}`);
}

export async function adminUpdateUserRole(id: string, role: 'user' | 'creator' | 'admin'): Promise<void> {
  await request(`/admin/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export async function adminGetEvents(params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResult<Event>> {
  return request<PaginatedResult<Event>>(addParams('/admin/events', params));
}

export async function adminUpdateEventStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
  await request(`/admin/events/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function adminGetAnalytics(): Promise<AdminAnalytics> {
  return request<AdminAnalytics>('/admin/analytics');
}

export async function adminGetAnalyticsDetail(table: string, params?: Record<string, string | number | boolean | undefined>): Promise<PaginatedResult<any>> {
  return request<PaginatedResult<any>>(addParams(`/admin/analytics/${table}`, params));
}

export async function adminGetBillboards(params?: { status?: string }): Promise<Billboard[]> {
  return request<Billboard[]>(addParams('/admin/billboards', params));
}

export async function adminCreateBillboard(data: { title: string; cover_url?: string; creator_id?: string; target_city: string; start_time: number; end_time: number }): Promise<{ id: string }> {
  return request<{ id: string }>('/admin/billboards', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminUpdateBillboard(id: string, data: Partial<Billboard>): Promise<void> {
  await request(`/admin/billboards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function adminDeleteBillboard(id: string): Promise<void> {
  await request(`/admin/billboards/${id}`, {
    method: 'DELETE',
  });
}

export async function adminGetScrapperEvents(params?: Record<string, string | number | boolean | undefined>): Promise<PaginatedResult<ScrapperEvent>> {
  return request<PaginatedResult<ScrapperEvent>>(addParams('/admin/scrapper/events', params));
}

export async function adminMarkScrapperEventContacted(id: string): Promise<void> {
  await request(`/admin/scrapper/events/${id}/contact`, { method: 'PUT' });
}

export async function adminGetScrapperOrganizers(params?: Record<string, string | number | boolean | undefined>): Promise<PaginatedResult<ScrapperOrganizer>> {
  return request<PaginatedResult<ScrapperOrganizer>>(addParams('/admin/scrapper/organizers', params));
}

export async function adminGetScrapperTopOrganizers(params?: Record<string, string | number | boolean | undefined>): Promise<PaginatedResult<ScrapperOrganizer>> {
  return request<PaginatedResult<ScrapperOrganizer>>(addParams('/admin/scrapper/top-organizers', params));
}

export async function adminMarkTopOrganizerContacted(id: string): Promise<void> {
  await request(`/admin/scrapper/top-organizers/${id}/contact`, { method: 'PUT' });
}

// ───── Auth / Password API ───────────────────────────────────────────────────

export async function signupWithEmail(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  gender?: string;
}): Promise<{ user: any; accessToken: string; expiresAt: string }> {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function loginWithEmail(email: string, password: string): Promise<{ user: any; accessToken: string; expiresAt: string }> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function forgotPassword(email: string): Promise<{ sent: boolean }> {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string): Promise<{ reset: boolean }> {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export async function verifyEmail(token: string): Promise<{ verified: boolean }> {
  return request('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function resendVerification(email: string): Promise<{ sent: boolean }> {
  return request('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ changed: boolean }> {
  return request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function getActiveSessions(): Promise<{ id: string; userAgent: string; ipAddress: string; createdAt: string }[]> {
  return request('/auth/sessions');
}

export async function revokeSession(id: string): Promise<void> {
  await request(`/auth/sessions/${id}`, { method: 'DELETE' });
}

export async function revokeAllSessions(): Promise<void> {
  await request('/auth/logout/all', { method: 'POST' });
}

// ───── Friend Request API ────────────────────────────────────────────────────

export async function sendFriendRequest(userId: string): Promise<{ userId: string; friendId: string; status: string }> {
  return request(`/friends/request/${userId}`, { method: 'POST' });
}

export async function acceptFriendRequest(userId: string): Promise<void> {
  await request(`/friends/accept/${userId}`, { method: 'POST' });
}

export async function rejectFriendRequest(userId: string): Promise<void> {
  await request(`/friends/reject/${userId}`, { method: 'POST' });
}

export async function getFriendRequests(): Promise<any[]> {
  return request('/friends?filter=requests');
}

export async function getPendingFriendCount(): Promise<number> {
  const res = await request<{ count: number }>('/friends/pending-count');
  return res.count;
}
