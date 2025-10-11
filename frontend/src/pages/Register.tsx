import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo-black.svg'
import { Link, useNavigate } from 'react-router-dom'
import Turnstile from '../components/Turnstile'
import { useI18n } from '../context/I18nContext'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
  
  const validatePassword = (pwd: string): string | null => {
    if (!pwd || pwd.length < 8) return 'Password must be at least 8 characters'
    const hasLower = /[a-z]/.test(pwd)
    const hasUpper = /[A-Z]/.test(pwd)
    const hasDigit = /\d/.test(pwd)
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd)
    if (!(hasLower && hasUpper && hasDigit && hasSpecial)) {
      return 'Password must include upper, lower, digit, and special character'
    }
    return null
  }

  const pickRegisterError = (err: any, fallback: string): string => {
    const detail = err?.response?.data?.detail ?? err?.response?.data?.error?.message ?? err?.message
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail.length && typeof detail[0]?.msg === 'string') return detail[0].msg
    return fallback
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const pwdErr = validatePassword(password)
      if (pwdErr) {
        setError(pwdErr)
        return
      }
      await register(email, password, fullName, siteKey ? captchaToken : null)
      alert(t('registerSuccess'))
      nav('/login')
    } catch (err: any) {
      const msg = pickRegisterError(err, t('registerFailed'))
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
  <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-zinc-800 relative">
      {/* Decorative red wave header */}
      <div className="relative bg-black overflow-hidden z-0 h-36 md:h-40 xl:h-48">
        <div className="absolute inset-x-0 bottom-0 h-16 md:h-20 xl:h-24">
          <svg viewBox="0 0 1440 320" className="w-full h-full">
            <path fill="#ef4444" fillOpacity="1" d="M0,192L48,165.3C96,139,192,85,288,101.3C384,117,480,203,576,229.3C672,256,768,224,864,202.7C960,181,1056,171,1152,176C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      <div className="-mt-14 md:-mt-16 xl:-mt-24 px-4 flex items-start justify-center relative z-10">
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
          <div className="flex items-center justify-center gap-3 mb-4 select-none">
            <img src={logo} alt="Nexa" className="h-9 w-9 rounded-lg" />
            <h2 className="text-2xl font-semibold text-gray-900">Create your account</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Already have an account? <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">Login</Link></p>
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {typeof error === 'string' ? error : t('registerFailed')}
          </div>
        )}
        <form onSubmit={onSubmit} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative mt-1">
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute inset-y-0 right-0 px-3 text-sm text-gray-600 hover:text-gray-800"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">8-128 chars, include upper, lower, digit, and special</div>
          </div>
          <button
            className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60 transform hover:scale-105 transition"
            type="submit"
            disabled={loading || (!!siteKey && !captchaToken)}
          >
            {loading ? 'Creating…' : 'Create Account'}
          </button>
          {siteKey && (
            <div className="mt-3">
              <Turnstile siteKey={siteKey} onVerify={setCaptchaToken} theme="dark" />
              <p className="mt-2 text-xs text-gray-500">{t('captchaInfo')}</p>
            </div>
          )}
        </form>
        </div>
      </div>
    </div>
  )
}
