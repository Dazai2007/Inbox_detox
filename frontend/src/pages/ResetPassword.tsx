import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/auth'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = useMemo(() => params.get('token') || '', [params])
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!token) { setError('Missing token'); return }
    if (pw.length < 8) { setError('Password must be at least 8 characters'); return }
    if (pw !== pw2) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await resetPassword(token, pw)
      setDone(true)
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md card p-6 bg-white/10">
        <h2 className="text-xl font-semibold mb-1">Reset password</h2>
        {!token && <div className="text-sm text-red-300 mb-2">Invalid or missing token.</div>}
        {done ? (
          <div className="rounded border border-emerald-300/40 bg-emerald-500/10 text-emerald-300 p-3 text-sm">
            Your password has been reset. You can now <Link className="text-sky-300 hover:text-sky-200" to="/login">sign in</Link>.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {error && <div className="rounded border border-red-300/40 bg-red-500/10 text-red-300 p-3 text-sm">{error}</div>}
            <div>
              <label className="block text-sm text-muted mb-1">New password</label>
              <input type="password" className="input w-full" value={pw} onChange={e=>setPw(e.target.value)} required placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Confirm password</label>
              <input type="password" className="input w-full" value={pw2} onChange={e=>setPw2(e.target.value)} required placeholder="••••••••" />
            </div>
            <button className="btn-primary w-full" disabled={loading || !token}>{loading ? 'Resetting…' : 'Reset password'}</button>
          </form>
        )}
        <div className="mt-4 text-sm text-muted">
          <Link to="/login" className="text-sky-300 hover:text-sky-200">Back to login</Link>
        </div>
      </div>
    </div>
  )
}
