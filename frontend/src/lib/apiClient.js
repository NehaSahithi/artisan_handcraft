import axios from 'axios'

const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('karigar_token')

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default API