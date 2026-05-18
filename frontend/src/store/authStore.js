import { create } from 'zustand'
import API from '../lib/apiClient'

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('karigar_user')) || null,
  token: localStorage.getItem('karigar_token') || null,
  loading: false,
  error: null,

  register: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await API.post('/auth/register', data)
      const { user, token } = response.data
      localStorage.setItem('karigar_user', JSON.stringify(user))
      localStorage.setItem('karigar_token', token)
      set({ user, token, loading: false })
      return response.data
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed'
      set({ error: errorMsg, loading: false })
      throw error
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const response = await API.post('/auth/login', { email, password })
      const { user, token } = response.data
      localStorage.setItem('karigar_user', JSON.stringify(user))
      localStorage.setItem('karigar_token', token)
      set({ user, token, loading: false })
      return response.data
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed'
      set({ error: errorMsg, loading: false })
      throw error
    }
  },

  logout: () => {
    API.post('/auth/logout').catch(() => {})
    localStorage.removeItem('karigar_user')
    localStorage.removeItem('karigar_token')
    set({ user: null, token: null })
  },

  updateProfile: async (data) => {
    set({ loading: true })
    try {
      const response = await API.put('/auth/profile', data)
      const user = response.data.user
      localStorage.setItem('karigar_user', JSON.stringify(user))
      set({ user, loading: false })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))
