import { create } from 'zustand';
import API from '../lib/apiClient';

export const useProductStore = create((set, get) => ({
  products: [],
  featuredProducts: [],
  product: null,
  reviews: [],
  categories: [],
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  },
  loading: false,
  error: null,

  getProducts: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await API.get(`/products?${params}`);
      set({ 
        products: response.data.results, 
        pagination: response.data.pagination, 
        loading: false 
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch products';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  getMyProducts: async (page = 1, limit = 8) => {
    set({ loading: true, error: null });
    try {
      const response = await API.get(`/products/my-products?page=${page}&limit=${limit}`);
      set({ 
        products: response.data.results, 
        pagination: response.data.pagination, 
        loading: false 
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch studio products';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  getProduct: async (id) => {
    set({ loading: true, error: null, product: null, reviews: [] });
    try {
      const response = await API.get(`/products/${id}`);
      set({ 
        product: response.data.product, 
        reviews: response.data.reviews || [], 
        loading: false 
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch product details';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  getFeaturedProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await API.get('/products/featured');
      set({ featuredProducts: response.data.products, loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch featured products';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await API.get('/products/categories');
      set({ categories: response.data.categories });
      return response.data.categories;
    } catch (error) {
      console.error('Failed to load categories list', error);
      return [];
    }
  },

  createProduct: async (formData) => {
    set({ loading: true, error: null });
    try {
      // Multipart/form-data must be passed directly since it carries file buffers
      const response = await API.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create product listing';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  updateProduct: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      const response = await API.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update product listing';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await API.delete(`/products/${id}`);
      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete product listing';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  addReview: async (productId, reviewData) => {
    set({ loading: true, error: null });
    try {
      const response = await API.post(`/products/${productId}/reviews`, reviewData);
      
      // Refresh current product reviews and rating details
      await get().getProduct(productId);
      
      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to submit product review';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));
