import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useI18n } from '../../context/I18nContext'

type FormState = {
  email: string
  password: string
  rememberMe: boolean
}

type ErrorState = {
  email?: string
  password?: string
  submit?: string
}

type LoginProps = {
  onLogin?: () => void
}

const emailPattern = /\S+@\S+\.\S+/

const Login = ({ onLogin }: LoginProps) => {
  const [formData, setFormData] = useState<FormState>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState<ErrorState>({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useI18n()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (errors[name as keyof ErrorState]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const validationErrors = useMemo(() => {
    const nextErrors: ErrorState = {}

    if (!formData.email) {
      nextErrors.email = 'Email adresi gereklidir'
    } else if (!emailPattern.test(formData.email)) {
      nextErrors.email = 'Geçerli bir email adresi girin'
    }

    if (!formData.password) {
      nextErrors.password = 'Şifre gereklidir'
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Şifre en az 6 karakter olmalıdır'
    }

    return nextErrors
  }, [formData.email, formData.password])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
      onLogin?.()
      navigate('/', { replace: true })
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.'
      setErrors({ submit: message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: 'google' | 'github') => {
    // TODO: integrate provider-based auth when backend supports it
    console.info(`${provider} ile giriş yapılıyor...`)
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-nexivo-primary to-nexivo-secondary shadow-lg">
              <span className="text-xl font-bold text-white">N</span>
            </div>
            <span className="text-3xl font-bold text-transparent bg-gradient-to-r from-white to-slate-300 bg-clip-text">
              Nexivo
            </span>
          </div>
        </div>
        <h2 className="mb-2 text-3xl font-bold text-white">Hesabınıza Giriş Yapın</h2>
        <p className="text-slate-400">Email yönetiminde devrime katılın</p>
      </div>

      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-8 shadow-2xl backdrop-blur-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
              Email Adresi
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:border-transparent ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-600 bg-slate-800/50 focus:ring-nexivo-primary'
                }`}
                placeholder="ornek@email.com"
                autoComplete="email"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            </div>
            {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Şifre
              </label>
              <Link to="/forgot-password" className="text-sm text-nexivo-accent transition-colors hover:text-nexivo-primary">
                Şifremi Unuttum?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:border-transparent ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-600 bg-slate-800/50 focus:ring-nexivo-primary'
                }`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="rememberMe" className="flex items-center text-sm text-slate-300">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-nexivo-primary focus:ring-2 focus:ring-nexivo-primary"
              />
              <span className="ml-2">Beni Hatırla</span>
            </label>
          </div>

          {errors.submit && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-center text-sm text-red-400">{errors.submit}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-nexivo-primary to-nexivo-secondary px-4 py-3 font-semibold text-white transition-all duration-300 hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-nexivo-primary focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-white" />
                Giriş Yapılıyor...
              </div>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-800/30 px-2 text-slate-400">veya</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-slate-700/50"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-slate-700/50"
            >
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>
        </div>

        {/* Legal note */}
        <p className="mt-6 text-center text-xs text-slate-500">
          {t('auth.legal.prefix')}
          <Link to="/terms" className="text-slate-300 hover:text-white">{t('terms.title')}</Link>
          {t('auth.legal.and')}
          <Link to="/privacy" className="text-slate-300 hover:text-white">{t('privacy.title')}</Link>
          {t('auth.legal.suffix')}
        </p>

        <div className="mt-6 text-center">
          <p className="text-slate-400">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="font-medium text-nexivo-accent transition-colors hover:text-nexivo-primary">
              Ücretsiz kaydolun
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
