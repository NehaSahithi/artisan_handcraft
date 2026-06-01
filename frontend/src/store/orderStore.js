import { create } from 'zustand';
import API from '../lib/apiClient';

export const useOrderStore = create((set, get) => ({
  orders: [],
  salesStats: { totalOrders: 0, totalRevenue: 0, totalItemsSold: 0 },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  },
  loading: false,
  error: null,

  // Initialize a new payment transaction & order on the backend
  createRazorpayOrder: async ({ shippingAddress, notes }) => {
    set({ loading: true, error: null });
    try {
      const response = await API.post('/orders', { shippingAddress, notes });
      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create order transaction';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  // Verify Razorpay payment signature
  verifyPayment: async (paymentData) => {
    set({ loading: true, error: null });
    try {
      const response = await API.post('/orders/verify-payment', paymentData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Payment signature verification failed';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  // Retrieve buyer's own paginated orders
  getMyOrders: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await API.get(`/orders/my-orders?page=${page}&limit=${limit}`);
      set({ 
        orders: response.data.results, 
        pagination: response.data.pagination, 
        loading: false 
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load order history';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  // Retrieve artisan's own paginated orders
  getSellerOrders: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await API.get(`/orders/seller-orders?page=${page}&limit=${limit}`);
      set({ 
        orders: response.data.results, 
        pagination: response.data.pagination, 
        loading: false 
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load seller orders';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  // Retrieve single detailed order
  getOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await API.get(`/orders/${id}`);
      set({ loading: false });
      return response.data.order;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch order details';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  // Update specific order item shipping status (Artisan only)
  updateItemStatus: async (orderId, itemId, status) => {
    set({ loading: true, error: null });
    try {
      const response = await API.put(`/orders/${orderId}/item/${itemId}/status`, { status });
      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update shipping status';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  // Cancel order (Buyer only, before shipment)
  cancelOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const response = await API.put(`/orders/${orderId}/cancel`);
      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to cancel order';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  // Get seller sales metrics
  getSalesStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await API.get('/orders/stats');
      set({ salesStats: response.data.stats, loading: false });
      return response.data.stats;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load sales stats';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));
