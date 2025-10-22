import { useState } from 'react'
import { useI18n } from '../context/I18nContext'
import LanguageSelector from './LanguageSelector'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useI18n()

  return (
    <header className="fixed z-50 w-full border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[var(--nexivo-primary)] to-[var(--nexivo-secondary)]">
              <span className="text-lg font-bold text-white">N</span>
            </div>
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-xl font-bold text-transparent">
              Nexivo
            </span>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <nav className="flex items-center gap-6 text-sm">
              <a
                href="#features"
                className="font-medium text-slate-300 transition-all duration-300 hover:text-white"
              >
                {t('nav.features')}
              </a>
              <a
                href="#dashboard"
                className="font-medium text-slate-300 transition-all duration-300 hover:text-white"
              >
                {t('nav.dashboard')}
              </a>
              <a
                href="#pricing"
                className="font-medium text-slate-300 transition-all duration-300 hover:text-white"
              >
                {t('nav.pricing')}
              </a>
            </nav>
            <LanguageSelector />
            <button className="rounded-lg bg-gradient-to-r from-[var(--nexivo-primary)] to-[var(--nexivo-secondary)] px-6 py-2 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25">
              {t('nav.cta')}
            </button>
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
          <div className="mt-4 border-t border-slate-700/50 pt-4 pb-4 md:hidden">
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
              <button className="rounded-lg bg-gradient-to-r from-[var(--nexivo-primary)] to-[var(--nexivo-secondary)] px-4 py-2 font-semibold text-white">
                {t('nav.cta')}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
