import { Event, User, Ticket, Notification, Booking } from '../types';

const simulateDelay = (min: number = 500, max: number = 800): Promise<void> => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export const getEvents = async (): Promise<Event[]> => {
  await simulateDelay();
  return [];
};

export const getEventById = async (id: string): Promise<Event | undefined> => {
  await simulateDelay();
  return undefined;
};

export const getEventsByCategory = async (
  category: string
): Promise<Event[]> => {
  await simulateDelay();
  return [];
};

export const searchEvents = async (query: string): Promise<Event[]> => {
  await simulateDelay();
  return [];
};

export const getPopularEvents = async (): Promise<Event[]> => {
  await simulateDelay();
  return [];
};

export const getUpcomingEvents = async (): Promise<Event[]> => {
  await simulateDelay();
  return [];
};

export const getUser = async (): Promise<User> => {
  await simulateDelay();
  return {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
    interests: [],
    notifications: true,
  };
};

export const getTickets = async (): Promise<Ticket[]> => {
  await simulateDelay();
  return [];
};

export const getNotifications = async (): Promise<Notification[]> => {
  await simulateDelay();
  return [];
};

export const getBookings = async (): Promise<Booking[]> => {
  await simulateDelay();
  return [];
};

export const toggleFavorite = async (eventId: string): Promise<Event> => {
  await simulateDelay();
  throw new Error(`Event with id ${eventId} not found`);
};
