import { useI18n } from '../context/I18nContext'

export default function Hero() {
  const { t } = useI18n()
  return (
    <section
      id="get-started"
      className="relative overflow-hidden px-6 pb-28 pt-40 md:pt-48"
    >
      {/* Symmetric background glows to avoid perceived left bias on ultra-wide screens */}
      <div className="pointer-events-none absolute left-1/2 top-24 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--nexivo-primary)]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[var(--nexivo-secondary)]/20 blur-3xl" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl place-items-center text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 inline-flex items-center rounded-full border border-slate-700/50 bg-slate-800/50 px-4 py-2">
            <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-[var(--nexivo-accent)]" />
            <span className="text-sm text-slate-300">{t('hero.badge')}</span>
          </div>

          <h1 className="mb-6 text-5xl font-bold md:text-7xl">
            <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
              {t('hero.headingLine1')}
            </span>
            <br />
            <span className="bg-gradient-to-r from-[var(--nexivo-primary)] via-[var(--nexivo-secondary)] to-[var(--nexivo-accent)] bg-clip-text text-transparent">
              {t('hero.headingLine2')}
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-slate-300 md:text-2xl">
            {t('hero.description.intro')}
            <span className="text-cyan-200">{t('hero.description.brand')}</span>
            {t('hero.description.body')}
            <span className="text-emerald-200">{t('hero.description.efficiency')}</span>
            {t('hero.description.outro')}
          </p>

          <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="transform rounded-xl bg-gradient-to-r from-[var(--nexivo-primary)] to-[var(--nexivo-secondary)] px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/30">
              {t('hero.cta.primary')}
            </button>
            <button className="rounded-xl border border-slate-600 px-8 py-4 text-lg font-semibold text-slate-300 transition-all duration-300 hover:bg-slate-800/50">
              {t('hero.cta.secondary')}
            </button>
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-6 md:grid-cols-4">
            {[{
              label: t('hero.stat.users'),
              value: '50K+',
            },
            {
              label: t('hero.stat.successRate'),
              value: '%99',
            },
            {
              label: t('hero.stat.rating'),
              value: '4.9/5',
            },
            {
              label: t('hero.stat.support'),
              value: '24/7',
            }].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
