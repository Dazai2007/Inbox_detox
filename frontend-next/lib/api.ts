import axios from 'axios'

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
  }
  return config
})

export async function login(email: string, password: string) {
  const form = new URLSearchParams()
  form.set('username', email)
  form.set('password', password)
  const res = await api.post('/api/auth/login', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
  return res.data as { access_token: string, token_type: string }
}

export async function register(email: string, password: string, full_name?: string) {
  await api.post('/api/auth/register', { email, password, full_name })
}

export async function me() {
  const res = await api.get('/api/auth/me')
  return res.data
}

export async function gmailConnectUrl() {
  const res = await api.get('/api/gmail/connect_url')
  return (res.data?.url || '') as string
}

export async function gmailStatus() {
  const res = await api.get('/api/gmail/status')
  return res.data as { connected: boolean, token_expires_at: string | null }
}

export async function analyticsSummary() {
  const res = await api.get('/analytics/usage/summary')
  return res.data as { total_analyses: number, month_analyses: number, quota_limit: number }
}

export async function analyticsDaily() {
  const res = await api.get('/analytics/usage/daily')
  return res.data as { data: { date: string, count: number }[] }
}
