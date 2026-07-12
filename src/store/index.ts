import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserLocation, Event as AppEvent, Friend, PakistanCity, Movie, Restaurant, Cinema, MovieShowtime } from '../types';
import { scheduleEventReminder, cancelEventReminder, scheduleTopicNotification, cancelTopicNotification } from '../utils/notifications';
import { WeatherData } from '../utils/weather';
import { API_BASE_URL } from '../constants/config';


interface SavedLogin {
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  authToken: string | null;
  location: UserLocation | null;
  preferences: string[];
  savedEvents: string[];
  eventNotifications: Record<string, string>; // eventId -> notificationId
  followedVenues: string[]; // venue IDs
  followedOrganizers: string[]; // organizer IDs
  organizerNotifications: Record<string, string>; // organizerId -> notificationId
  onboardingComplete: boolean;
  pendingEvents: AppEvent[];
  savedLogin: SavedLogin | null;
  theme: 'dark' | 'light';
  settings: {
    pushNotifications: boolean;
    smartReminders: boolean;
    darkMode: boolean;
  };
  friendsList: string[]; // friend IDs
  privacySettings: {
    hideRSVPs: boolean;
  };
  privateRSVPs: string[]; // event IDs marked private
  login: (user: User) => void;
  loginWithToken: (token: string, userData: any) => void;
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
  setTheme: (theme: 'dark' | 'light') => void;
  addFriend: (friendId: string) => void;
  removeFriend: (friendId: string) => void;
  isFriend: (friendId: string) => boolean;
  updatePrivacySettings: (key: keyof AuthState['privacySettings'], value: boolean) => void;
  togglePrivateRSVP: (eventId: string) => void;
  isRSVPPrivate: (eventId: string) => boolean;
  submitEvent: (event: Omit<AppEvent, 'id' | 'attendees' | 'rating' | 'isFavorite' | 'isFeatured'>) => void;
  completeOnboarding: (data: { user: User; location: UserLocation; preferences: string[] }) => void;
  setSavedLogin: (data: SavedLogin) => void;
  clearSavedLogin: () => void;
  userSelectedCity: PakistanCity;
  setUserSelectedCity: (city: PakistanCity) => void;
}

interface AppState {
  activeTab: 'HomeTab' | 'ExploreTab' | 'FriendsTab' | 'PlansTab' | 'ProfileTab';
  activeVibe: string | null;
  searchQuery: string;
  isSearching: boolean;
  userSelectedCity: string;
  weather: WeatherData | null;
  events: AppEvent[];
  movies: Movie[];
  restaurants: Restaurant[];
  cinemas: Cinema[];
  showtimes: MovieShowtime[];
  
  setActiveTab: (tab: 'HomeTab' | 'ExploreTab' | 'PlansTab' | 'ProfileTab') => void;
  setActiveVibe: (vibe: string | null) => void;
  setSearchQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  setUserSelectedCity: (city: string) => void;
  setWeather: (weather: WeatherData | null) => void;
  setEvents: (events: AppEvent[]) => void;
  setMovies: (movies: Movie[]) => void;
  setRestaurants: (restaurants: Restaurant[]) => void;
  setCinemas: (cinemas: Cinema[]) => void;
  setShowtimes: (showtimes: MovieShowtime[]) => void;
  addEvent: (event: AppEvent) => void;
  seedPakistanData: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      authToken: null,
      location: null,
      preferences: [],
      savedEvents: [],
      eventNotifications: {},
      followedVenues: [],
      followedOrganizers: [],
      organizerNotifications: {},
      onboardingComplete: false,
      pendingEvents: [],
      savedLogin: null,
      settings: {
        pushNotifications: true,
        smartReminders: true,
        darkMode: true,
      },
      theme: 'dark' as const,
      friendsList: [],
      privacySettings: {
        hideRSVPs: false,
      },
      privateRSVPs: [],
      userSelectedCity: 'lahore',
      
      login: (user: User) => set({ 
        isLoggedIn: true, 
        onboardingComplete: true,
        user,
        savedLogin: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      }),

      loginWithToken: (token: string, userData: any) => set({
        isLoggedIn: true,
        onboardingComplete: true,
        authToken: token,
        user: {
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone || '',
          avatar: userData.avatar || '',
          avatarId: userData.avatarId,
          interests: userData.preferences || [],
          notifications: true,
          plan: userData.plan || 'basic',
        },
        savedLogin: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
      }),

      logout: async () => { 
        const { authToken } = get();
        if (authToken) {
          try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${authToken}` },
            });
          } catch (_) {}
        }

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
          authToken: null,
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
          friendsList: [],
          privacySettings: { hideRSVPs: false },
          privateRSVPs: [],
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
        if (key === 'darkMode') {
          set({ theme: value ? 'dark' : 'light' });
        }
      },

      setTheme: (theme: 'dark' | 'light') => {
        set({ theme, settings: { ...get().settings, darkMode: theme === 'dark' } });
      },

      addFriend: (friendId: string) => {
        const { friendsList } = get();
        if (!friendsList.includes(friendId)) {
          set({ friendsList: [...friendsList, friendId] });
        }
      },

      removeFriend: (friendId: string) => {
        const { friendsList } = get();
        set({ friendsList: friendsList.filter(id => id !== friendId) });
      },

      isFriend: (friendId: string) => {
        return get().friendsList.includes(friendId);
      },

      updatePrivacySettings: (key: keyof AuthState['privacySettings'], value: boolean) => {
        const { privacySettings } = get();
        set({ privacySettings: { ...privacySettings, [key]: value } });
      },

      togglePrivateRSVP: (eventId: string) => {
        const { privateRSVPs } = get();
        if (privateRSVPs.includes(eventId)) {
          set({ privateRSVPs: privateRSVPs.filter(id => id !== eventId) });
        } else {
          set({ privateRSVPs: [...privateRSVPs, eventId] });
        }
      },

      isRSVPPrivate: (eventId: string) => {
        return get().privateRSVPs.includes(eventId);
      },

      setUserSelectedCity: (city: PakistanCity) => set({ userSelectedCity: city }),
      
      submitEvent: (eventData) => {
        const { pendingEvents } = get();
        const newEvent: AppEvent = {
          ...eventData,
          id: `user_${Date.now()}`,
          attendees: 0,
          rating: 0,
          isFavorite: false,
          isFeatured: false,
          city: (useApp.getState().userSelectedCity || 'lahore') as PakistanCity,
          bookingType: 'in_app',
          dataSource: 'user_host',
        };
        set({ pendingEvents: [...pendingEvents, newEvent] });
        
        // Also inject into general events list for immediate UI updates
        useApp.getState().addEvent(newEvent);
      },
      
      completeOnboarding: (data: { user: User; location: UserLocation; preferences: string[] }) => {
        set({ 
          isLoggedIn: true,
          user: { ...data.user, location: data.location, preferences: data.preferences },
          location: data.location,
          preferences: data.preferences,
          onboardingComplete: true,
          savedLogin: {
            email: data.user.email,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
          },
        });
      },

      setSavedLogin: (data: SavedLogin) => set({ savedLogin: data }),

      clearSavedLogin: () => set({ savedLogin: null }),
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
    (set, get) => ({
      activeTab: 'HomeTab' as const,
      activeVibe: null,
      searchQuery: '',
      isSearching: false,
      userSelectedCity: 'lahore',
      weather: null,
      events: [],
      movies: [],
      restaurants: [],
      cinemas: [],
      showtimes: [],
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      setActiveVibe: (vibe: string | null) => set({ activeVibe: vibe }),
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setIsSearching: (isSearching: boolean) => set({ isSearching }),
      setUserSelectedCity: (city: string) => set({ userSelectedCity: city }),
      setWeather: (weather: WeatherData | null) => set({ weather }),
      setEvents: (events: AppEvent[]) => set({ events }),
      setMovies: (movies: Movie[]) => set({ movies }),
      setRestaurants: (restaurants: Restaurant[]) => set({ restaurants }),
      setCinemas: (cinemas: Cinema[]) => set({ cinemas }),
      setShowtimes: (showtimes: MovieShowtime[]) => set({ showtimes }),
      addEvent: (event: AppEvent) => set({ events: [event, ...get().events] }),
      seedPakistanData: () => {},
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
        userSelectedCity: state.userSelectedCity,
        // NOTE: weather is intentionally NOT persisted — it is time-sensitive
        // and must be fetched fresh on every app start to show the correct icon.
        events: state.events,
        movies: state.movies,
        restaurants: state.restaurants,
        cinemas: state.cinemas,
        showtimes: state.showtimes,
      }),
      // Version bump: v2 strips stale weather data from old AsyncStorage
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2 && persistedState) {
          // Remove stale weather cached from previous versions
          delete persistedState.weather;
        }
        return persistedState;
      },
    }
  )
);
