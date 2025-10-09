import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'

const client = axios.create({
  baseURL: '/'
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
