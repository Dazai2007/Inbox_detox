import { useI18n } from '../context/I18nContext'

export default function Dashboard() {
  const { t } = useI18n()

  const categories = [
    { label: t('dashboard.categories.inbox'), count: '24' },
    { label: t('dashboard.categories.important'), count: '24' },
    { label: t('dashboard.categories.starred'), count: '24' },
    { label: t('dashboard.categories.sent'), count: '24' },
    { label: t('dashboard.categories.drafts'), count: '24' },
  ]

  const stats = [
    { label: t('dashboard.stats.total.label'), value: t('dashboard.stats.total.value'), color: 'text-blue-400' },
    { label: t('dashboard.stats.unread.label'), value: t('dashboard.stats.unread.value'), color: 'text-red-400' },
    { label: t('dashboard.stats.important.label'), value: t('dashboard.stats.important.value'), color: 'text-green-400' },
    { label: t('dashboard.stats.spam.label'), value: t('dashboard.stats.spam.value'), color: 'text-yellow-400' },
  ]

  const emails = [
    {
      name: t('dashboard.emails.1.name'),
      subject: t('dashboard.emails.1.subject'),
      time: t('dashboard.emails.1.time'),
      unread: true,
    },
    {
      name: t('dashboard.emails.2.name'),
      subject: t('dashboard.emails.2.subject'),
      time: t('dashboard.emails.2.time'),
      unread: false,
    },
    {
      name: t('dashboard.emails.3.name'),
      subject: t('dashboard.emails.3.subject'),
      time: t('dashboard.emails.3.time'),
      unread: true,
    },
  ]

  return (
    <section id="dashboard" className="px-6 py-20">
  <div className="mx-auto w-full max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            <span className="bg-gradient-to-r from-[var(--nexivo-primary)] to-[var(--nexivo-accent)] bg-clip-text text-transparent">
              {t('dashboard.heading')}
            </span>
          </h2>
          <p className="text-xl text-slate-400">{t('dashboard.subheading')}</p>
        </div>

  <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 p-8 backdrop-blur-lg">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <div className="rounded-xl bg-slate-800/50 p-6">
                <h3 className="mb-4 font-semibold text-white">{t('dashboard.categories.title')}</h3>
                <div className="space-y-2">
                  {categories.map((item) => (
                    <div
                      key={item.label}
                      className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-700/50"
                    >
                      <span className="text-slate-300">{item.label}</span>
                      <span className="text-sm text-slate-500">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-2">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-slate-800/50 p-4 text-center">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-slate-800/50 p-6">
                <h3 className="mb-4 font-semibold text-white">{t('dashboard.emails.title')}</h3>
                <div className="space-y-4">
                  {emails.map((email) => (
                    <div
                      key={`${email.name}-${email.time}`}
                      className={`flex items-center justify-between rounded-lg p-3 ${
                        email.unread
                          ? 'border border-blue-500/20 bg-blue-500/10'
                          : 'hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[var(--nexivo-primary)] to-[var(--nexivo-secondary)]">
                          <span className="text-sm font-bold text-white">{email.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{email.name}</div>
                          <div className="text-sm text-slate-400">{email.subject}</div>
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">{email.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
