import { create } from 'zustand';
import API from '../lib/apiClient';

export const useArtisanStore = create((set, get) => ({
  artisans: [],
  featuredArtisans: [],
  artisan: null,
  artisanProducts: [],
  states: [],
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  },
  loading: false,
  error: null,

  // Get all verified artisans publicly with query parameters
  getArtisans: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await API.get(`/artisans?${params}`);
      set({ 
        artisans: response.data.results, 
        pagination: response.data.pagination, 
        loading: false 
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load artisans list';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  // Get single artisan profile & products publicly
  getArtisan: async (id) => {
    set({ loading: true, error: null, artisan: null, artisanProducts: [] });
    try {
      const response = await API.get(`/artisans/${id}`);
      set({ 
        artisan: response.data.artisan, 
        artisanProducts: response.data.products || [], 
        loading: false 
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load artisan profile';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  // Create or update artisan profile details
  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const response = await API.put('/artisans/profile', profileData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save profile';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  // Retrieve current logged-in artisan profile
  getMyProfile: async () => {
    set({ loading: true, error: null });
    try {
      const response = await API.get('/artisans/me');
      set({ loading: false });
      return response.data.profile;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to retrieve profile';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  // Submit KYC data and document uploads (Aadhaar & PAN to Cloudinary)
  submitKYC: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await API.post('/artisans/kyc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to submit KYC documents';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  // Update shop media assets (Logo & Banner to Cloudinary)
  updateShopMedia: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await API.put('/artisans/shop-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update shop media';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  // Retrieve dashboard stats (Artisan only)
  getDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await API.get('/artisans/dashboard/stats');
      set({ loading: false });
      return response.data.stats;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load dashboard metrics';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  // Retrieve featured artisans
  getFeaturedArtisans: async () => {
    set({ loading: true, error: null });
    try {
      const response = await API.get('/artisans/featured');
      set({ featuredArtisans: response.data.artisans, loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load featured artisans';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  // Retrieve list of states having active artisans
  getStatesList: async () => {
    try {
      const response = await API.get('/artisans/states');
      set({ states: response.data.states });
      return response.data.states;
    } catch (error) {
      console.error('Failed to load active states list', error);
      return [];
    }
  },

  clearError: () => set({ error: null })
}));
