import { create } from 'zustand';
import api from '../services/api';

export const useSavingsStore = create((set, get) => ({
  savings: [],
  goals: [],
  achievements: [],
  analytics: null,
  loading: false,
  error: null,

  addSaving: async (amount, type, description) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/savings/add', { amount, type, description });
      set(state => ({
        savings: [...state.savings, data.savings],
        loading: false
      }));
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getMonthlySavings: async (month, year) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/savings/monthly', { params: { month, year } });
      set({ savings: data.savings, loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getAnalytics: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/savings/analytics');
      set({ analytics: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createGoal: async (title, targetAmount, deadline, category) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/goals/create', { title, targetAmount, deadline, category });
      set(state => ({
        goals: [...state.goals, data],
        loading: false
      }));
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getGoals: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/goals/list');
      set({ goals: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getAchievements: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/achievements/list');
      set({ achievements: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  unlockAchievement: async (type, title, description, points) => {
    try {
      const { data } = await api.post('/achievements/unlock', { type, title, description, points });
      set(state => ({
        achievements: [...state.achievements, data]
      }));
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  }
}));
