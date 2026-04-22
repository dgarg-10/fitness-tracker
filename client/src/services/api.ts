import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { supabase } from './supabase'

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api