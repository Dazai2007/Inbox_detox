"use client"
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { login } from '../../lib/api'

export default function LoginPage() {
  const r = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const t = await login(email, password)
      localStorage.setItem('token', t.access_token)
      r.replace('/dashboard')
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-md mx-auto card p-6">
        <h1 className="text-xl font-semibold">Sign in</h1>
        {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-sm text-muted">Email</label>
            <input className="input w-full" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-muted">Password</label>
            <input className="input w-full" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  )
}
