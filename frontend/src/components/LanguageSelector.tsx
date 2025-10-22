import { useI18n } from '../context/I18nContext'

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'tr', label: 'Türkçe' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'العربية' },
]

type LanguageSelectorProps = {
  className?: string
}

export default function LanguageSelector({ className }: LanguageSelectorProps) {
  const { lang, setLang, t } = useI18n()
  const wrapperClass = [
    'flex items-center gap-2 text-xs font-medium text-slate-300',
    className ?? '',
  ]
    .join(' ')
    .trim()

  return (
    <label className={wrapperClass}>
      <span className="sr-only">{t('language.select')}</span>
      <select
        value={lang}
        onChange={(event) => setLang(event.target.value as typeof lang)}
        className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 shadow-sm transition focus:border-[var(--nexivo-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--nexivo-accent)] md:w-auto"
      >
        {languageOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
