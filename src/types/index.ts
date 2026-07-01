export type BookingType = 'external_link' | 'whatsapp' | 'in_app';
export type DataSource = 'ticketwala' | 'bookme' | 'manual_entry' | 'user_host';
export type PakistanCity = 'lahore' | 'karachi' | 'islamabad';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  price: number;
  location: string;
  date: string;
  time: string;
  organizer: string;
  organizerId?: string;
  venue: string;
  venueId?: string;
  attendees: number;
  rating: number;
  isFavorite: boolean;
  isFeatured: boolean;
  neighborhood?: string;
  city?: PakistanCity;
  bookingType?: BookingType;
  externalLink?: string | null;
  whatsappNumber?: string | null;
  dataSource?: DataSource;
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
}

export interface UserLocation {
  city: string;
  neighborhood: string;
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
  interests: string[];
  notifications: boolean;
  location?: UserLocation;
  preferences?: string[];
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
  neighborhood: string;
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
  priceRange: string; // '$', '$$', '$$$', '$$$$'
  rating: number;
  reviewCount: number;
  address: string;
  neighborhood: string;
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
  bio: string;
  address: string;
  neighborhood: string;
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
  mutualFriends: number;
  isOnline: boolean;
}

// QR Code type
export interface QRCode {
  userId: string;
  handle: string;
  generatedAt: string;
}
