import { useI18n } from '../context/I18nContext'

export default function Features() {
  const { t } = useI18n()
  const features = [
    {
      icon: '🤖',
      title: t('features.aiSorting.title'),
      description: t('features.aiSorting.description'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: '📁',
      title: t('features.smartCategorisation.title'),
      description: t('features.smartCategorisation.description'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '⚡',
      title: t('features.instantAlerts.title'),
      description: t('features.instantAlerts.description'),
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: '🔒',
      title: t('features.secureArchitecture.title'),
      description: t('features.secureArchitecture.description'),
      color: 'from-orange-500 to-red-500',
    },
  ]

  return (
    <section id="features" className="bg-slate-900/50 px-6 py-20">
  <div className="mx-auto w-full max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              {t('features.headingPrefix')}
            </span>{' '}
            <span className="bg-gradient-to-r from-[var(--nexivo-primary)] to-[var(--nexivo-accent)] bg-clip-text text-transparent">
              Nexivo?
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-slate-400">
            {t('features.subheading')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-lg transition-all duration-300 hover:-translate-y-2 hover:border-slate-600/50"
            >
              <div
                className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} transition-transform duration-300 group-hover:scale-110`}
              >
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">{feature.title}</h3>
              <p className="leading-relaxed text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
