import { create } from 'zustand'
import API from '../lib/apiClient'

export const useProductStore = create((set) => ({
  products: [],
  loading: false,
  error: null,

  getProducts: async (filters = {}) => {
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      const response = await API.get(`/products?${params}`)
      set({ products: response.data.products, loading: false })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false })
      throw error
    }
  },

  getProduct: async (id) => {
    set({ loading: true })
    try {
      const response = await API.get(`/products/${id}`)
      set({ loading: false })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false })
      throw error
    }
  },

  createProduct: async (data) => {
    set({ loading: true })
    try {
      const response = await API.post('/products', data)
      set({ loading: false })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false })
      throw error
    }
  },

  updateProduct: async (id, data) => {
    try {
      const response = await API.put(`/products/${id}`, data)
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message })
      throw error
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await API.delete(`/products/${id}`)
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message })
      throw error
    }
  },

  addReview: async (productId, data) => {
    try {
      const response = await API.post(`/products/${productId}/reviews`, data)
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message })
      throw error
    }
  },
}))
