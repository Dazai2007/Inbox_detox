"use client"
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { register } from '../../lib/api'

export default function RegisterPage() {
  const r = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await register(email, password, name)
      setOk(true)
      setTimeout(()=> r.replace('/login'), 800)
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Register failed')
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-md mx-auto card p-6">
        <h1 className="text-xl font-semibold">Create account</h1>
        {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
        {ok && <div className="mt-2 text-sm text-green-400">Account created. You can sign in.</div>}
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-sm text-muted">Full name</label>
            <input className="input w-full" value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-muted">Email</label>
            <input className="input w-full" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-muted">Password</label>
            <input className="input w-full" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <button className="btn-primary w-full">Create account</button>
        </form>
      </div>
    </div>
  )
}
