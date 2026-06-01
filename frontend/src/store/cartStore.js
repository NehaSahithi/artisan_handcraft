import { create } from 'zustand';
import API from '../lib/apiClient';

export const useCartStore = create((set, get) => ({
  items: [],
  subtotal: 0,
  totalItems: 0,
  loading: false,
  error: null,

  getCart: async () => {
    set({ loading: true, error: null });
    try {
      const response = await API.get('/cart');
      const cart = response.data.cart || { items: [], subtotal: 0, totalItems: 0 };
      set({ 
        items: cart.items, 
        subtotal: cart.subtotal, 
        totalItems: cart.totalItems, 
        loading: false 
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch cart';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  addToCart: async (productId, quantity = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await API.post('/cart/add', { productId, quantity });
      const cart = response.data.cart || { items: [], subtotal: 0, totalItems: 0 };
      set({ 
        items: cart.items, 
        subtotal: cart.subtotal, 
        totalItems: cart.totalItems, 
        loading: false 
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add item to cart';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  updateItem: async (productId, quantity) => {
    set({ loading: true, error: null });
    try {
      const response = await API.put('/cart/update', { productId, quantity });
      const cart = response.data.cart || { items: [], subtotal: 0, totalItems: 0 };
      set({ 
        items: cart.items, 
        subtotal: cart.subtotal, 
        totalItems: cart.totalItems, 
        loading: false 
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update cart quantity';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  removeItem: async (productId) => {
    set({ loading: true, error: null });
    try {
      const response = await API.delete(`/cart/${productId}`);
      const cart = response.data.cart || { items: [], subtotal: 0, totalItems: 0 };
      set({ 
        items: cart.items, 
        subtotal: cart.subtotal, 
        totalItems: cart.totalItems, 
        loading: false 
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to remove item from cart';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  clearCart: async () => {
    set({ loading: true, error: null });
    try {
      const response = await API.delete('/cart/clear');
      set({ items: [], subtotal: 0, totalItems: 0, loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to clear cart';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  getTotalItems: () => {
    return get().totalItems || 0;
  },

  getTotalPrice: () => {
    return get().subtotal || 0;
  },

  clearError: () => set({ error: null })
}));
