import { create } from 'zustand'
import API from '../lib/apiClient'

export const useOrderStore = create((set) => ({
  orders: [],
  loading: false,
  error: null,

  createRazorpayOrder: async ({ shippingAddress, notes }) => {
    set({ loading: true })
    try {
      const response = await API.post('/orders', { shippingAddress, notes })
      set({ loading: false })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false })
      throw error
    }
  },

  verifyPayment: async (data) => {
    try {
      const response = await API.post('/orders/verify-payment', data)
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message })
      throw error
    }
  },

  getMyOrders: async (filters = {}) => {
    set({ loading: true })
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      const response = await API.get(`/orders?${params}`)
      set({ orders: response.data.orders, loading: false })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false })
      throw error
    }
  },

  getSellerOrders: async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      const response = await API.get(`/orders?${params}`)
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message })
      throw error
    }
  },

  getOrder: async (id) => {
    try {
      const response = await API.get(`/orders/${id}`)
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message })
      throw error
    }
  },

  updateItemStatus: async (orderId, itemId, data) => {
    try {
      const response = await API.put(`/orders/${orderId}/status`, data)
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message })
      throw error
    }
  },

  cancelOrder: async (orderId, reason) => {
    try {
      const response = await API.put(`/orders/${orderId}/cancel`, { cancellationReason: reason })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message })
      throw error
    }
  },
}))
