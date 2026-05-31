import { create } from 'zustand'
import API from '../lib/apiClient'

export const useArtisanStore = create((set) => ({
  artisans: [],
  loading: false,
  error: null,

  getArtisans: async (filters = {}) => {
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      const response = await API.get(`/artisans?${params}`)
      set({ artisans: response.data.artisans, loading: false })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false })
      throw error
    }
  },

  getArtisan: async (id) => {
    set({ loading: true })
    try {
      const response = await API.get(`/artisans/${id}`)
      set({ loading: false })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false })
      throw error
    }
  },

  updateProfile: async (data) => {
    set({ loading: true })
    try {
      const response = await API.post('/artisans/profile', data)
      set({ loading: false })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false })
      throw error
    }
  },

  submitKYC: async (data) => {
    try {
      const response = await API.put('/artisans/kyc/update', data)
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message })
      throw error
    }
  },

  getDashboard: async () => {
    try {
      const response = await API.get('/artisans/stats/my')
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message })
      throw error
    }
  },

  getMyProfile: async () => {
    try {
      const response = await API.get('/artisans/profile/me')
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message })
      throw error
    }
  },
}))
