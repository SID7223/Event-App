import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserLocation, Event as AppEvent } from '../types';
import { scheduleEventReminder, cancelEventReminder, scheduleTopicNotification, cancelTopicNotification } from '../utils/notifications';

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  location: UserLocation | null;
  preferences: string[];
  savedEvents: string[];
  eventNotifications: Record<string, string>; // eventId -> notificationId
  followedVenues: string[]; // venue IDs
  followedOrganizers: string[]; // organizer IDs
  organizerNotifications: Record<string, string>; // organizerId -> notificationId
  onboardingComplete: boolean;
  pendingEvents: AppEvent[];
  settings: {
    pushNotifications: boolean;
    smartReminders: boolean;
    darkMode: boolean;
  };
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLocation: (location: UserLocation) => void;
  setPreferences: (preferences: string[]) => void;
  addPreference: (preference: string) => void;
  removePreference: (preference: string) => void;
  toggleRSVP: (eventId: string, eventTitle: string, eventDate: string, eventTime: string) => Promise<void>;
  isEventSaved: (eventId: string) => boolean;
  toggleFollowVenue: (venueId: string, venueName: string) => Promise<void>;
  isVenueFollowed: (venueId: string) => boolean;
  toggleFollowOrganizer: (organizerId: string, organizerName: string) => Promise<void>;
  isOrganizerFollowed: (organizerId: string) => boolean;
  unfollowEntity: (id: string, type: 'venue' | 'organizer') => Promise<void>;
  updateSettings: (key: keyof AuthState['settings'], value: boolean) => void;
  submitEvent: (event: Omit<AppEvent, 'id' | 'attendees' | 'rating' | 'isFavorite' | 'isFeatured'>) => void;
  completeOnboarding: (data: { user: User; location: UserLocation; preferences: string[] }) => void;
}

interface AppState {
  activeVibe: string | null;
  searchQuery: string;
  isSearching: boolean;
  setActiveVibe: (vibe: string | null) => void;
  setSearchQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      location: null,
      preferences: [],
      savedEvents: [],
      eventNotifications: {},
      followedVenues: [],
      followedOrganizers: [],
      organizerNotifications: {},
      onboardingComplete: false,
      pendingEvents: [],
      settings: {
        pushNotifications: true,
        smartReminders: true,
        darkMode: true,
      },
      
      login: (user: User) => set({ isLoggedIn: true, user }),
      
      logout: async () => { 
        // Cancel all notifications on logout
        const { eventNotifications, organizerNotifications } = get();
        for (const notificationId of Object.values(eventNotifications)) {
          await cancelEventReminder(notificationId);
        }
        for (const notificationId of Object.values(organizerNotifications)) {
          await cancelTopicNotification(notificationId);
        }
        
        set({ 
          isLoggedIn: false, 
          user: null, 
          location: null, 
          preferences: [],
          savedEvents: [],
          eventNotifications: {},
          followedVenues: [],
          followedOrganizers: [],
          organizerNotifications: {},
          onboardingComplete: false,
          pendingEvents: [],
          settings: {
            pushNotifications: true,
            smartReminders: true,
            darkMode: true,
          },
        });
      },
      
      setUser: (user: User) => set({ user }),
      
      setLocation: (location: UserLocation) => set({ location }),
      
      setPreferences: (preferences: string[]) => set({ preferences }),
      
      addPreference: (preference: string) => {
        const current = get().preferences;
        if (!current.includes(preference)) {
          set({ preferences: [...current, preference] });
        }
      },
      
      removePreference: (preference: string) => {
        const current = get().preferences;
        set({ preferences: current.filter(p => p !== preference) });
      },
      
      toggleRSVP: async (eventId: string, eventTitle: string, eventDate: string, eventTime: string) => {
        const { savedEvents, eventNotifications } = get();
        const isSaved = savedEvents.includes(eventId);
        
        if (isSaved) {
          // Cancel notification if exists
          const notificationId = eventNotifications[eventId];
          if (notificationId) {
            await cancelEventReminder(notificationId);
          }
          
          // Remove from saved events
          const newNotifications = { ...eventNotifications };
          delete newNotifications[eventId];
          
          set({ 
            savedEvents: savedEvents.filter(id => id !== eventId),
            eventNotifications: newNotifications,
          });
        } else {
          // Schedule notification
          const notificationId = await scheduleEventReminder(
            eventId,
            eventTitle,
            eventDate,
            eventTime
          );
          
          // Add to saved events
          const newNotifications = { ...eventNotifications };
          if (notificationId) {
            newNotifications[eventId] = notificationId;
          }
          
          set({ 
            savedEvents: [...savedEvents, eventId],
            eventNotifications: newNotifications,
          });
        }
      },
      
      isEventSaved: (eventId: string) => {
        return get().savedEvents.includes(eventId);
      },
      
      toggleFollowOrganizer: async (organizerId: string, organizerName: string) => {
        const { followedOrganizers, organizerNotifications } = get();
        const isFollowed = followedOrganizers.includes(organizerId);
        
        if (isFollowed) {
          // Unfollow: cancel topic notification
          const notificationId = organizerNotifications[organizerId];
          if (notificationId) {
            await cancelTopicNotification(notificationId);
          }
          
          const newNotifications = { ...organizerNotifications };
          delete newNotifications[organizerId];
          
          set({
            followedOrganizers: followedOrganizers.filter(id => id !== organizerId),
            organizerNotifications: newNotifications,
          });
        } else {
          // Follow: subscribe to topic notifications
          const notificationId = await scheduleTopicNotification(
            organizerId,
            organizerName
          );
          
          const newNotifications = { ...organizerNotifications };
          if (notificationId) {
            newNotifications[organizerId] = notificationId;
          }
          
          set({
            followedOrganizers: [...followedOrganizers, organizerId],
            organizerNotifications: newNotifications,
          });
        }
      },
      
      isOrganizerFollowed: (organizerId: string) => {
        return get().followedOrganizers.includes(organizerId);
      },
      
      toggleFollowVenue: async (venueId: string, venueName: string) => {
        const { followedVenues, organizerNotifications } = get();
        const isFollowed = followedVenues.includes(venueId);
        
        if (isFollowed) {
          const notificationId = organizerNotifications[venueId];
          if (notificationId) {
            await cancelTopicNotification(notificationId);
          }
          const newNotifications = { ...organizerNotifications };
          delete newNotifications[venueId];
          set({
            followedVenues: followedVenues.filter(id => id !== venueId),
            organizerNotifications: newNotifications,
          });
        } else {
          const notificationId = await scheduleTopicNotification(venueId, venueName);
          const newNotifications = { ...organizerNotifications };
          if (notificationId) {
            newNotifications[venueId] = notificationId;
          }
          set({
            followedVenues: [...followedVenues, venueId],
            organizerNotifications: newNotifications,
          });
        }
      },
      
      isVenueFollowed: (venueId: string) => {
        return get().followedVenues.includes(venueId);
      },
      
      unfollowEntity: async (id: string, type: 'venue' | 'organizer') => {
        if (type === 'venue') {
          const { followedVenues, organizerNotifications } = get();
          const notificationId = organizerNotifications[id];
          if (notificationId) {
            await cancelTopicNotification(notificationId);
          }
          const newNotifications = { ...organizerNotifications };
          delete newNotifications[id];
          set({
            followedVenues: followedVenues.filter(vid => vid !== id),
            organizerNotifications: newNotifications,
          });
        } else {
          const { followedOrganizers, organizerNotifications } = get();
          const notificationId = organizerNotifications[id];
          if (notificationId) {
            await cancelTopicNotification(notificationId);
          }
          const newNotifications = { ...organizerNotifications };
          delete newNotifications[id];
          set({
            followedOrganizers: followedOrganizers.filter(oid => oid !== id),
            organizerNotifications: newNotifications,
          });
        }
      },
      
      updateSettings: (key: keyof AuthState['settings'], value: boolean) => {
        const { settings } = get();
        set({ settings: { ...settings, [key]: value } });
      },
      
      submitEvent: (eventData) => {
        const { pendingEvents } = get();
        const newEvent: AppEvent = {
          ...eventData,
          id: `user_${Date.now()}`,
          attendees: 0,
          rating: 0,
          isFavorite: false,
          isFeatured: false,
        };
        set({ pendingEvents: [...pendingEvents, newEvent] });
      },
      
      completeOnboarding: (data: { user: User; location: UserLocation; preferences: string[] }) => {
        set({ 
          isLoggedIn: true,
          user: { ...data.user, location: data.location, preferences: data.preferences },
          location: data.location,
          preferences: data.preferences,
          onboardingComplete: true 
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name: string, value: unknown) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name);
        },
      })),
    }
  )
);

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      activeVibe: null,
      searchQuery: '',
      isSearching: false,
      setActiveVibe: (vibe: string | null) => set({ activeVibe: vibe }),
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setIsSearching: (isSearching: boolean) => set({ isSearching }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name: string, value: unknown) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name);
        },
      })),
      partialize: (state) => ({
        activeVibe: state.activeVibe,
      }),
    }
  )
);
