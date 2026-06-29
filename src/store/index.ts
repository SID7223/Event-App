import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

interface AppState {
  selectedCategory: string | null;
  searchQuery: string;
  isSearching: boolean;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      login: (user: User) => set({ isLoggedIn: true, user }),
      logout: () => set({ isLoggedIn: false, user: null }),
      setUser: (user: User) => set({ user }),
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

export const useApp = create<AppState>((set) => ({
  selectedCategory: null,
  searchQuery: '',
  isSearching: false,
  setSelectedCategory: (category: string | null) => set({ selectedCategory: category }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setIsSearching: (isSearching: boolean) => set({ isSearching }),
}));
