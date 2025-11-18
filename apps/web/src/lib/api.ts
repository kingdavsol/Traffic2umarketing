import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; name: string; password: string; confirmPassword: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

// Vehicles API
export const vehiclesAPI = {
  getAll: () => api.get('/vehicles'),
  getOne: (id: string) => api.get(`/vehicles/${id}`),
  create: (data: any) => api.post('/vehicles', data),
  update: (id: string, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`)
};

// Problems API
export const problemsAPI = {
  getByVehicle: (make: string, model: string, params?: any) =>
    api.get(`/problems/vehicle/${make}/${model}`, { params }),
  getOne: (id: string) => api.get(`/problems/${id}`),
  getAll: (params?: any) => api.get('/problems', { params })
};

// Parts API
export const partsAPI = {
  getByProblem: (problemId: string) => api.get(`/parts/problem/${problemId}`),
  getOne: (id: string) => api.get(`/parts/${id}`),
  getBestPrice: (id: string) => api.get(`/parts/${id}/best-price`),
  compare: (id: string) => api.get(`/parts/${id}/compare`)
};

// Tires API
export const tiresAPI = {
  getByVehicle: (make: string, model: string, year: string, params?: any) =>
    api.get(`/tires/vehicle/${make}/${model}/${year}`, { params }),
  getAll: (params?: any) => api.get('/tires', { params }),
  getOne: (id: string) => api.get(`/tires/${id}`)
};

// Modifications API
export const modificationsAPI = {
  getByVehicle: (make: string, model: string, params?: any) =>
    api.get(`/modifications/vehicle/${make}/${model}`, { params }),
  getAll: (params?: any) => api.get('/modifications', { params }),
  getOne: (id: string) => api.get(`/modifications/${id}`),
  getPopular: (category: string) => api.get(`/modifications/popular/${category}`)
};

// Maintenance API
export const maintenanceAPI = {
  getSchedule: (make: string, model: string, year: string) =>
    api.get(`/maintenance/schedule/${make}/${model}/${year}`),
  getDeals: (params?: any) => api.get('/maintenance/deals/items', { params }),
  getDealsByRetailer: (retailer: string, params?: any) =>
    api.get(`/maintenance/deals/retailer/${retailer}`, { params }),
  create: (data: any) => api.post('/maintenance', data),
  getVehicleHistory: (vehicleId: string, params?: any) =>
    api.get(`/maintenance/vehicle/${vehicleId}`, { params }),
  getOne: (id: string) => api.get(`/maintenance/${id}`),
  update: (id: string, data: any) => api.put(`/maintenance/${id}`, data),
  delete: (id: string) => api.delete(`/maintenance/${id}`)
};

// Valuation API
export const valuationAPI = {
  get: (make: string, model: string, year: string, params?: any) =>
    api.get(`/valuation/${make}/${model}/${year}`, { params }),
  getHistory: (make: string, model: string, year: string, params?: any) =>
    api.get(`/valuation/history/${make}/${model}/${year}`, { params }),
  compare: (vehicles: any[]) => api.post('/valuation/compare', { vehicles }),
  getTrending: () => api.get('/valuation/trending')
};
