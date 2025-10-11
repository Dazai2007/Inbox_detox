import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'

// Allow overriding API base URL in development via VITE_API_URL
const baseURL = (import.meta as any).env?.VITE_API_URL || '/'
if (baseURL === '/') {
  // Helpful hint during development if env var is missing
  // This means requests will go to the same origin (e.g., Vite dev server), not your FastAPI backend.
  // Set VITE_API_URL in frontend/.env, e.g. VITE_API_URL="http://127.0.0.1:8000"
  // and rebuild/restart the dev server.
  // eslint-disable-next-line no-console
  console.warn('[client] VITE_API_URL is not set. API requests will use relative URLs (/) and likely fail unless you proxy.');
}

const client = axios.create({
  baseURL
})

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token) {
    // Normalize headers to AxiosHeaders to avoid TS incompatibilities
    const headers = config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers)
    headers.set('Authorization', `Bearer ${token}`)
    config.headers = headers
  }
  return config
})

export default client
