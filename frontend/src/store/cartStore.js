import { create } from 'zustand'
import API from '../lib/apiClient'

export const useCartStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  getCart: async () => {
    set({ loading: true })
    try {
      const response = await API.get('/cart')
      set({ items: response.data.cart?.items || [], loading: false })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false })
      throw error
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await API.post('/cart', { productId, quantity })
      await get().getCart()
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message })
      throw error
    }
  },

  updateItem: async (productId, quantity) => {
    try {
      const response = await API.put(`/cart/${productId}`, { quantity })
      await get().getCart()
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message })
      throw error
    }
  },

  removeItem: async (productId) => {
    try {
      const response = await API.delete(`/cart/${productId}`)
      await get().getCart()
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message })
      throw error
    }
  },

  clearCart: async () => {
    try {
      const response = await API.delete('/cart')
      set({ items: [] })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message })
      throw error
    }
  },

  getTotalItems: () => {
    const items = get().items || []
    return items.reduce((total, item) => total + item.quantity, 0)
  },

  getTotalPrice: () => {
    const items = get().items || []
    return items.reduce((total, item) => {
      const price = item.product?.finalPrice ?? item.product?.price ?? item.price ?? 0
      return total + price * item.quantity
    }, 0)
  },
}))
