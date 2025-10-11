import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/auth'
import { useI18n } from '../context/I18nContext'

export default function ForgotPassword() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md card p-6 bg-white/10">
        <h2 className="text-xl font-semibold mb-1">Forgot password</h2>
        <p className="text-sm text-muted mb-4">Enter your email and well send you a reset link.</p>
        {sent ? (
          <div className="rounded border border-emerald-300/40 bg-emerald-500/10 text-emerald-300 p-3 text-sm">
            If an account exists, a reset email has been sent.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {error && <div className="rounded border border-red-300/40 bg-red-500/10 text-red-300 p-3 text-sm">{error}</div>}
            <div>
              <label className="block text-sm text-muted mb-1">Email</label>
              <input type="email" className="input w-full" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <button className="btn-primary w-full" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</button>
          </form>
        )}
        <div className="mt-4 text-sm text-muted">
          <Link to="/login" className="text-sky-300 hover:text-sky-200">Back to login</Link>
        </div>
      </div>
    </div>
  )
}
