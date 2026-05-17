import api from './client'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  username: string
  full_name: string
  email: string
  password: string
  role: 'ADMIN' | 'BUYER'
}

export const loginApi = async (payload: LoginPayload) => {
  const { data } = await api.post('/auth/login', payload)
  return data as { token: string }
}

export const registerApi = async (payload: RegisterPayload) => {
  const { data } = await api.post('/auth/register', payload)
  return data
}
