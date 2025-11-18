import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface User {
  userId: string;
  email: string;
  name: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  error: null,

  setUser: (user) => {
    set({ user });
  },

  setToken: async (token) => {
    set({ token });
    if (token) {
      try {
        await SecureStore.setItemAsync('token', token);
      } catch (e) {
        console.log('Failed to save token');
      }
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  logout: async () => {
    set({ user: null, token: null, error: null });
    try {
      await SecureStore.deleteItemAsync('token');
    } catch (e) {
      console.log('Failed to delete token');
    }
  },

  restoreToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        set({ token });
      }
    } catch (e) {
      console.log('Failed to restore token');
    } finally {
      set({ isLoading: false });
    }
  }
}));
