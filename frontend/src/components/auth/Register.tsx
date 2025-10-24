import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useI18n } from '../../context/I18nContext'

type FormState = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

type ErrorState = Partial<Record<keyof FormState | 'submit', string>>

type RegisterProps = {
  onRegister?: () => void
}

const emailPattern = /\S+@\S+\.\S+/

function getPasswordStrength(password: string) {
  if (!password) return { score: 0, text: '', color: '' }
  let score = 0
  if (password.length >= 8) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  // Labels will be injected at render-time via i18n; here only return color and score
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
  const idx = Math.max(0, Math.min(score - 1, colors.length - 1))
  return { score, text: '', color: colors[idx] || '' }
}

const Register = ({ onRegister }: RegisterProps) => {
  const [formData, setFormData] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<ErrorState>({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()
  const { t } = useI18n()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (errors[name as keyof ErrorState]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validationErrors = useMemo(() => {
    const newErrors: ErrorState = {}

  if (!formData.firstName.trim()) newErrors.firstName = t('register.validation.firstNameRequired')
  if (!formData.lastName.trim()) newErrors.lastName = t('register.validation.lastNameRequired')

  if (!formData.email) newErrors.email = t('register.validation.emailRequired')
  else if (!emailPattern.test(formData.email)) newErrors.email = t('register.validation.emailInvalid')

  if (!formData.password) newErrors.password = t('register.validation.passwordRequired')
  else if (formData.password.length < 8) newErrors.password = t('register.validation.passwordMin')
  else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) newErrors.password = t('register.validation.passwordComplexity')

  if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('register.validation.passwordMismatch')

  if (!formData.agreeToTerms) newErrors.agreeToTerms = t('register.validation.agreeToTerms')

    return newErrors
  }, [formData])

  const pickErrorMessage = (err: any, fallback: string) => {
    const detail = err?.response?.data?.detail ?? err?.response?.data?.error?.message ?? err?.message
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail.length && typeof detail[0]?.msg === 'string') return detail[0].msg
    return fallback
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim()
      await register(formData.email, formData.password, fullName)
      onRegister?.()
      navigate('/login', { replace: true })
    } catch (error: any) {
      setErrors({ submit: pickErrorMessage(error, t('registerFailed')) })
    } finally {
      setIsLoading(false)
    }
  }

  const strength = getPasswordStrength(formData.password)

  return (
    <div className="w-full max-w-md">
      {/* Logo & Brand */}
      <div className="mb-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-nexivo-primary to-nexivo-secondary shadow-lg">
              <span className="text-xl font-bold text-white">N</span>
            </div>
            <span className="text-3xl font-bold text-transparent bg-gradient-to-r from-white to-slate-300 bg-clip-text">Nexivo</span>
          </div>
        </div>
        <h2 className="mb-2 text-3xl font-bold text-white">{t('register.heading')}</h2>
        <p className="text-slate-400">{t('register.subtitle')}</p>
      </div>

      {/* Register Form */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-8 shadow-2xl backdrop-blur-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-slate-300">
                {t('register.firstName')}
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:border-transparent ${
                  errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 bg-slate-800/50 focus:ring-nexivo-primary'
                }`}
                placeholder={t('register.firstName')}
                autoComplete="given-name"
              />
              {errors.firstName && <p className="mt-2 text-sm text-red-400">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-slate-300">
                {t('register.lastName')}
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:border-transparent ${
                  errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 bg-slate-800/50 focus:ring-nexivo-primary'
                }`}
                placeholder={t('register.lastName')}
                autoComplete="family-name"
              />
              {errors.lastName && <p className="mt-2 text-sm text-red-400">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
              {t('email')}
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:border-transparent ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 bg-slate-800/50 focus:ring-nexivo-primary'
                }`}
                placeholder="name@example.com"
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

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
              {t('password')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full rounded-xl border px-4 py-3 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:border-transparent ${
                errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 bg-slate-800/50 focus:ring-nexivo-primary'
              }`}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {formData.password && (
              <div className="mt-2">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{t('register.passwordStrength')}</span>
                  {/* Optional label text can be localised if we compute buckets here */}
                </div>
                <div className="h-2 w-full rounded-full bg-slate-700">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-300">
              {t('register.confirmPassword')}
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full rounded-xl border px-4 py-3 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:border-transparent ${
                errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 bg-slate-800/50 focus:ring-nexivo-primary'
              }`}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {errors.confirmPassword && <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>}
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start space-x-3">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-nexivo-primary focus:ring-2 focus:ring-nexivo-primary"
            />
            <label htmlFor="agreeToTerms" className="text-sm text-slate-300">
              <span>
                <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                  Hizmet şartlarını
                </Link> ve{' '}
                <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
                  gizlilik politikasını
                </Link> okudum ve kabul ediyorum
              </span>
              {errors.agreeToTerms && (
                <p className="mt-1 text-sm text-red-400">{errors.agreeToTerms}</p>
              )}
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
            className="w-full rounded-xl bg-gradient-to-r from-nexivo-primary to-nexivo-secondary px-4 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-nexivo-primary focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-t-2 border-white" />
                {t('register.loading')}
              </div>
            ) : (
              t('register.submit')
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-slate-400">
            {t('register.haveAccount')}{' '}
            <Link to="/login" className="font-medium text-nexivo-accent transition-colors hover:text-nexivo-primary">
              {t('signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
