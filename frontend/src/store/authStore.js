import { create } from 'zustand';
import API from '../lib/apiClient';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('karigar_user')) || null,
  isAuthenticated: !!localStorage.getItem('karigar_user'),
  loading: false,
  error: null,

  // Check user authentication status on app mount
  checkAuth: async () => {
    // Avoid triggering full loader if we already have a user
    set({ error: null });
    try {
      const response = await API.get('/auth/me');
      const user = response.data.user;
      localStorage.setItem('karigar_user', JSON.stringify(user));
      set({ user, isAuthenticated: true, loading: false });
      return user;
    } catch (error) {
      localStorage.removeItem('karigar_user');
      set({ user: null, isAuthenticated: false, loading: false });
      return null;
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await API.post('/auth/register', data);
      const user = response.data.user;
      localStorage.setItem('karigar_user', JSON.stringify(user));
      set({ user, isAuthenticated: true, loading: false });
      return user;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await API.post('/auth/login', { email, password });
      const user = response.data.user;
      localStorage.setItem('karigar_user', JSON.stringify(user));
      set({ user, isAuthenticated: true, loading: false });
      return user;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await API.post('/auth/logout');
    } catch (e) {
      console.warn('Logout request failed, clearing local state anyway.');
    }
    localStorage.removeItem('karigar_user');
    set({ user: null, isAuthenticated: false, loading: false });
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await API.put('/auth/profile', data);
      const user = response.data.user;
      localStorage.setItem('karigar_user', JSON.stringify(user));
      set({ user, loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update profile';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ loading: true, error: null });
    try {
      const response = await API.put('/auth/change-password', { currentPassword, newPassword });
      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to change password';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    set({ loading: true, error: null });
    try {
      const response = await API.put(`/auth/reset-password/${token}`, { password });
      const user = response.data.user;
      if (user) {
        localStorage.setItem('karigar_user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
      }
      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Password reset failed';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  // Address CRUD inside Auth store for profile sync
  addAddress: async (addressData) => {
    set({ loading: true, error: null });
    try {
      const response = await API.post('/auth/addresses', addressData);
      const updatedUser = { ...get().user, addresses: response.data.addresses };
      localStorage.setItem('karigar_user', JSON.stringify(updatedUser));
      set({ user: updatedUser, loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add address';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  updateAddress: async (addressId, addressData) => {
    set({ loading: true, error: null });
    try {
      const response = await API.put(`/auth/addresses/${addressId}`, addressData);
      const updatedUser = { ...get().user, addresses: response.data.addresses };
      localStorage.setItem('karigar_user', JSON.stringify(updatedUser));
      set({ user: updatedUser, loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update address';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  deleteAddress: async (addressId) => {
    set({ loading: true, error: null });
    try {
      const response = await API.delete(`/auth/addresses/${addressId}`);
      const updatedUser = { ...get().user, addresses: response.data.addresses };
      localStorage.setItem('karigar_user', JSON.stringify(updatedUser));
      set({ user: updatedUser, loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete address';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
