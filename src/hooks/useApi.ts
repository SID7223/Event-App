import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEvents,
  getEventById,
  getEventsByCategory,
  searchEvents,
  getPopularEvents,
  getUpcomingEvents,
  getUser,
  getTickets,
  getNotifications,
  getBookings,
  toggleFavorite,
} from '../services/api';

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventById(id),
  });
};

export const useEventsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['events', 'category', category],
    queryFn: () => getEventsByCategory(category),
    enabled: !!category,
  });
};

export const useSearchEvents = (query: string) => {
  return useQuery({
    queryKey: ['events', 'search', query],
    queryFn: () => searchEvents(query),
    enabled: !!query,
  });
};

export const usePopularEvents = () => {
  return useQuery({
    queryKey: ['events', 'popular'],
    queryFn: getPopularEvents,
  });
};

export const useUpcomingEvents = () => {
  return useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: getUpcomingEvents,
  });
};

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: getUser,
  });
};

export const useTickets = () => {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: getTickets,
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });
};

export const useBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: getBookings,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => toggleFavorite(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
