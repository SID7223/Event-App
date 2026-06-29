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
  venue: string;
  attendees: number;
  rating: number;
  isFavorite: boolean;
  isFeatured: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
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
