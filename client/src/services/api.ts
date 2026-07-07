import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { supabase } from './supabase'

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

let pendingRequests = 0
const listeners = new Set<(pending: number) => void>()

export function subscribeToApiActivity(listener: (pending: number) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function setPendingRequests(next: number): void {
  pendingRequests = next
  listeners.forEach((listener) => listener(pendingRequests))
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  setPendingRequests(pendingRequests + 1)
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    setPendingRequests(pendingRequests - 1)
    return response
  },
  (error) => {
    setPendingRequests(pendingRequests - 1)
    return Promise.reject(error)
  }
)

export default api