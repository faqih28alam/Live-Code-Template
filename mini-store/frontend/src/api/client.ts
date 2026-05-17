import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
})

// attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth')
  if (stored) {
    const { state } = JSON.parse(stored)
    if (state?.token) config.headers.Authorization = `Bearer ${state.token}`
  }
  return config
})

// global 401 handler — token expired or invalid → force logout and redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
