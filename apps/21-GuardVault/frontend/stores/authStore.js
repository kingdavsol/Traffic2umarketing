import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  loading: false,
  error: null,

  setToken: (token) => {
    set({ token });
    if (token) SecureStore.setItemAsync('authToken', token);
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      set({ token: data.token, user: data.user, loading: false });
      await SecureStore.setItemAsync('authToken', data.token);
      return data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Login failed', loading: false });
      throw error;
    }
  },

  register: async (email, password, firstName, lastName, phone) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', {
        email, password, firstName, lastName, phone
      });
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Registration failed', loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ token: null, user: null });
    await SecureStore.deleteItemAsync('authToken');
  }
}));
