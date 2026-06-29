import {
  mockEvents,
  mockUser,
  mockTickets,
  mockNotifications,
  mockBookings,
} from './mockData';
import { Event, User, Ticket, Notification, Booking } from '../types';

const simulateDelay = (min: number = 500, max: number = 800): Promise<void> => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export const getEvents = async (): Promise<Event[]> => {
  await simulateDelay();
  return [...mockEvents];
};

export const getEventById = async (id: string): Promise<Event | undefined> => {
  await simulateDelay();
  return mockEvents.find((event) => event.id === id);
};

export const getEventsByCategory = async (
  category: string
): Promise<Event[]> => {
  await simulateDelay();
  return mockEvents.filter(
    (event) => event.category.toLowerCase() === category.toLowerCase()
  );
};

export const searchEvents = async (query: string): Promise<Event[]> => {
  await simulateDelay();
  const lowerQuery = query.toLowerCase();
  return mockEvents.filter(
    (event) =>
      event.title.toLowerCase().includes(lowerQuery) ||
      event.description.toLowerCase().includes(lowerQuery)
  );
};

export const getPopularEvents = async (): Promise<Event[]> => {
  await simulateDelay();
  const featured = mockEvents.filter((event) => event.isFeatured);
  return featured.length > 0 ? featured : mockEvents.slice(0, 5);
};

export const getUpcomingEvents = async (): Promise<Event[]> => {
  await simulateDelay();
  const now = new Date().toISOString().split('T')[0];
  return [...mockEvents]
    .filter((event) => event.date >= now)
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const getUser = async (): Promise<User> => {
  await simulateDelay();
  return { ...mockUser };
};

export const getTickets = async (): Promise<Ticket[]> => {
  await simulateDelay();
  return [...mockTickets];
};

export const getNotifications = async (): Promise<Notification[]> => {
  await simulateDelay();
  return [...mockNotifications];
};

export const getBookings = async (): Promise<Booking[]> => {
  await simulateDelay();
  return [...mockBookings];
};

export const toggleFavorite = async (eventId: string): Promise<Event> => {
  await simulateDelay();
  const event = mockEvents.find((e) => e.id === eventId);
  if (!event) {
    throw new Error(`Event with id ${eventId} not found`);
  }
  event.isFavorite = !event.isFavorite;
  return { ...event };
};
