export type BookingType = 'external_link' | 'whatsapp' | 'in_app';
export type DataSource = 'ticketwala' | 'bookme' | 'manual_entry' | 'user_host';
export type PakistanCity = 'lahore' | 'karachi' | 'islamabad';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  image_url?: string;
  imageId?: string;
  price: number;
  location: string;
  date: string;
  time: string;
  organizer: string;
  organizer_name?: string;
  organizerId?: string;
  organizer_id?: string;
  venue: string;
  venue_name?: string;
  venueId?: string;
  venue_id?: string;
  attendees: number;
  attendee_count?: number;
  rating: number;
  isFavorite: boolean;
  isFeatured: boolean;
  is_featured?: boolean;
  city?: PakistanCity;
  bookingType?: BookingType;
  booking_type?: BookingType;
  externalLink?: string | null;
  external_link?: string | null;
  whatsappNumber?: string | null;
  dataSource?: DataSource;
  data_source?: DataSource;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface VibeCategory {
  id: string;
  label: string;
  icon: string;
  categories: string[];
}

export interface UserLocation {
  city: string;
  latitude: number;
  longitude: number;
  country: string;
  fullAddress: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  avatarUrl?: string;
  avatarId?: string;
  interests: string[];
  preferences?: string[];
  notifications: boolean;
  settings?: { pushNotifications: boolean };
  location?: UserLocation;
  plan?: 'basic' | 'premium';
  role?: 'user' | 'creator' | 'admin';
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  type: string;
  price: number;
  quantity: number;
  seat: string;
  qrCode: string;
  status: 'upcoming' | 'past' | 'cancelled';
  purchaseDate: string;
}

export interface Booking {
  id: string;
  eventId: string;
  tickets: Ticket[];
  totalAmount: number;
  paymentMethod: string;
  status: string;
  date: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
  icon: string;
}

export interface SearchResult {
  events: Event[];
  categories: Category[];
  total: number;
}

// Cinema types
export interface Movie {
  id: string;
  title: string;
  genre: string[];
  duration: number; // minutes
  rating: number; // 1-5
  poster: string;
  posterId?: string;
  releaseDate: string;
  synopsis: string;
  director: string;
  cast: string[];
  ageRating: string;
  city?: PakistanCity;
  bookingType?: BookingType;
  externalLink?: string | null;
  whatsappNumber?: string | null;
  dataSource?: DataSource;
}

export interface Cinema {
  id: string;
  name: string;
  address: string;
  distance: string; // e.g., "1.2 km"
  city?: PakistanCity;
}

export interface MovieShowtime {
  id: string;
  movieId: string;
  cinemaId: string;
  date: string;
  time: string;
  format: '2D' | '3D' | 'IMAX' | '4DX';
  price: number;
  availableSeats: number;
  bookingType?: BookingType;
  externalLink?: string | null;
  whatsappNumber?: string | null;
  dataSource?: DataSource;
  city?: PakistanCity;
}

export interface MovieWithShowtimes extends Movie {
  cinemas: {
    cinema: Cinema;
    showtimes: MovieShowtime[];
  }[];
}

// Dining types
export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  image: string;
  imageId?: string;
  priceRange: string; // '$', '$$', '$$$', '$$$$'
  rating: number;
  reviewCount: number;
  address: string;
  distance: string;
  phone: string;
  isOpen: boolean;
  hasLiveMusic: boolean;
  openingHours: string;
  tags: string[];
  featured: boolean;
  city?: PakistanCity;
  bookingType?: BookingType;
  whatsappNumber?: string | null;
  externalLink?: string | null;
  dataSource?: DataSource;
}

// Venue / Organizer types
export interface Venue {
  id: string;
  name: string;
  type: 'venue' | 'organizer';
  logo: string;
  coverImage: string;
  logoId?: string;
  coverId?: string;
  bio: string;
  address: string;
  website: string;
  rating: number;
  followerCount: number;
  eventCount: number;
  tags: string[];
  city?: PakistanCity;
}

// Organizer Profile type (distinct from Venue)
export interface Organizer {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  avatarId?: string;
  coverId?: string;
  bio: string;
  website: string;
  instagram: string;
  rating: number;
  followerCount: number;
  eventCount: number;
  tags: string[];
  city?: PakistanCity;
}

// Social types
export interface Friend {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  avatarId?: string;
  mutualFriends: number;
  isOnline: boolean;
}

export interface PrivacySettings {
  hideRSVPs: boolean;
}

// QR Code type
export interface QRCode {
  userId: string;
  handle: string;
  generatedAt: string;
}

// ─── Admin types ─────────────────────────────────────────────────────────────

export interface AdminAnalytics {
  users: number;
  events: number;
  bookings: number;
  revenue: number;
  cityStats: Array<{ city: string; count: number }>;
}

export interface Billboard {
  id: string;
  title: string;
  cover_url: string | null;
  creator_id: string | null;
  target_city: string;
  start_time: number;
  end_time: number;
  status: 'scheduled' | 'active' | 'ended';
  created_at: number;
}

export interface ScrapperEvent {
  id: string;
  title: string;
  source: string;
  url: string;
  image_url: string | null;
  venue: string;
  location: string;
  city: string;
  date: string;
  time: string;
  price: string;
  category: string;
  contacted: 0 | 1;
  contacted_at: number | null;
  scraped_at: number;
}

export interface ScrapperOrganizer {
  id: string;
  name: string;
  source: string;
  url: string;
  city: string;
  status: string;
  event_count: number;
  contacted: 0 | 1;
  contacted_at: number | null;
  scraped_at: number;
}

export interface AdminSession {
  id: string;
  device: string;
  ip: string;
  created_at: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
