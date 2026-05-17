import axios from 'axios'

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

export default api
