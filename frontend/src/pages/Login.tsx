import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { getConnectUrl } from '../api/gmail'
import logo from '../assets/logo-black.svg'
import Turnstile from '../components/Turnstile'
import googleLogo from '../assets/google.svg'
import { useI18n } from '../context/I18nContext'

export default function Login() {
  const { login, token } = useAuth()
  const { t, lang, setLang } = useI18n()
  const nav = useNavigate()
  // If already authenticated, send user to dashboard
  useEffect(() => {
    if (token) nav('/dashboard', { replace: true })
  }, [token])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const pickLoginError = (err: any): string => {
    const detail = err?.response?.data?.detail ?? err?.response?.data?.error?.message ?? err?.message
    return typeof detail === 'string' ? detail : t('loginFailed')
  }
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
  await login(email, password, siteKey ? captchaToken : null)
      nav('/dashboard')
    } catch (err: any) {
      setError(pickLoginError(err))
    } finally {
      setLoading(false)
    }
  }

  const onGoogle = async () => {
    if (!token) {
      setError(t('gmailLoginRequired'))
      return
    }
    try {
      const url = await getConnectUrl()
      window.location.href = url
    } catch (e) {
      setError(t('googleStartFailed'))
    }
  }

  return (
  <div className="min-h-screen relative" style={{ background: 'radial-gradient(1200px 700px at 20% -10%, rgba(216,64,64,0.16), transparent 60%), radial-gradient(1000px 700px at 80% 0%, rgba(142,22,22,0.22), transparent 55%), linear-gradient(to bottom, #1D1616, #1D1616 40%, #201919)' }}>
      {/* Decorative red wave header */}
      <div className="relative bg-black overflow-hidden z-0 h-36 md:h-40 xl:h-48">
        <div className="absolute inset-x-0 bottom-0 h-16 md:h-20 xl:h-24">
          <svg viewBox="0 0 1440 320" className="w-full h-full">
            <path fill="#ef4444" fillOpacity="1" d="M0,192L48,165.3C96,139,192,85,288,101.3C384,117,480,203,576,229.3C672,256,768,224,864,202.7C960,181,1056,171,1152,176C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      <div className="-mt-14 md:-mt-16 xl:-mt-24 px-4 flex items-start justify-center relative z-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transform transition hover:shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-6 select-none">
            <a className="brand" href="/">
              <span className="logo logo-rb text-3xl">Nexa</span>
            </a>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('signIn')}</h2>
              <p className="text-sm text-gray-500">{t('toAccessYour')}</p>
            </div>
            <div>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                aria-label="Language"
              >
                <option value="en">EN</option>
                <option value="tr">TR</option>
                <option value="de">DE</option>
                <option value="fr">FR</option>
              </select>
            </div>
          </div>

          {/* Tabs: Sign In (active) + Register shortcut */}
          <div className="flex items-center justify-center gap-6 text-sm mb-4">
            <button className="relative text-gray-900 font-medium after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:bg-red-600">{t('signIn')}</button>
            <Link to="/register" className="text-gray-400 hover:text-gray-600 transition">{t('createAccount')}</Link>
          </div>

          <button
            onClick={onGoogle}
            className={`w-full mb-4 flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 transition bg-white text-gray-800 hover:bg-gray-50`}
          >
            <img src={googleLogo} className="h-5 w-5" alt="Google" />
            <span>{t('signInWithGoogle')}</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-xs text-gray-500">{t('or')}</span>
            </div>
          </div>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {typeof error === 'string' ? error : t('loginFailed')}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('email')}</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-600 focus:border-red-600 transition"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('password')}</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-12 focus:ring-2 focus:ring-red-600 focus:border-red-600 transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute inset-y-0 right-0 px-3 text-sm text-gray-600 hover:text-gray-800"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? t('hide') : t('show')}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-600" />
              {t('rememberMe')}
            </label>
            <Link to="/forgot-password" className="text-red-600 hover:text-red-700">{t('forgotPassword')}</Link>
          </div>
          <button
            type="submit"
            disabled={loading || (!!siteKey && !captchaToken)}
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700 transform hover:scale-105 transition disabled:opacity-60"
          >
            {loading ? t('signingIn') : t('signIn')}
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
