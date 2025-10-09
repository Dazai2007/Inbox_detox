import { createContext, useContext, useEffect, useState } from 'react'
import client from '../api/client'

interface User { id: number; email: string; full_name?: string }

interface AuthContextValue {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      // Try fetch current user
      client.get('/auth/me').then(res => setUser(res.data)).catch(() => {})
    }
  }, [token])

  const login = async (email: string, password: string) => {
    const form = new URLSearchParams()
    form.set('username', email)
    form.set('password', password)
    const res = await client.post('/auth/login', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    const t = res.data.access_token as string
    localStorage.setItem('token', t)
    setToken(t)
    const me = await client.get('/auth/me')
    setUser(me.data)
  }

  const register = async (email: string, password: string, fullName?: string) => {
    await client.post('/auth/register', { email, password, full_name: fullName })
    await login(email, password)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
