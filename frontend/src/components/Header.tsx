import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'
import LanguageSelector from './LanguageSelector'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useI18n()

  return (
    <header className="fixed z-50 w-full border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-lg">
  <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[var(--nexivo-primary)] to-[var(--nexivo-secondary)]">
              <span className="text-lg font-bold text-white">N</span>
            </div>
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-xl font-bold text-transparent">
              Nexivo
            </span>
          </div>

        <div className="hidden md:flex items-center space-x-8">
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-300 hover:text-white transition-all duration-300 font-medium">
              {t('nav.features')}
            </a>
            <a href="#dashboard" className="text-slate-300 hover:text-white transition-all duration-300 font-medium">
              {t('nav.dashboard')}
            </a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition-all duration-300 font-medium">
              {t('nav.pricing')}
            </a>
          </nav>
          <LanguageSelector />
          {/* Auth Butonları */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-slate-300 hover:text-white transition-all duration-300 font-medium"
            >
              {t('signIn')}
            </Link>
            <Link 
              to="/register" 
              className="bg-gradient-to-r from-nexivo-primary to-nexivo-secondary text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              {t('nav.cta')}
            </Link>
          </div>
        </div>

        <button
          type="button"
          className="text-2xl text-slate-300 md:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
        >
          ☰
        </button>
      </div>

      {isMenuOpen && (
  <div className="mx-auto mt-0 w-full max-w-7xl border-t border-slate-700/50 px-6 pb-4 pt-4 md:hidden">
          <div className="flex flex-col space-y-4">
            <LanguageSelector className="w-full" />
            <a href="#features" className="text-slate-300 transition hover:text-white">
              {t('nav.features')}
            </a>
            <a href="#dashboard" className="text-slate-300 transition hover:text-white">
              {t('nav.dashboard')}
            </a>
            <a href="#pricing" className="text-slate-300 transition hover:text-white">
              {t('nav.pricing')}
            </a>
            <Link to="/login" className="text-slate-300 hover:text-white font-medium">
              {t('signIn')}
            </Link>
            <Link to="/register" className="rounded-lg bg-gradient-to-r from-[var(--nexivo-primary)] to-[var(--nexivo-secondary)] px-4 py-2 font-semibold text-white">
              {t('nav.cta')}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
