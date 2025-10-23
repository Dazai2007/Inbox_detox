import Header from '../components/Header'
import Footer from '../components/Footer'
import { useI18n } from '../context/I18nContext'

export default function PrivacyPage() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen text-[var(--nexivo-text)]">
      <Header />
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-white">{t('privacy.title')}</h1>
        <p className="mt-2 text-sm text-slate-400">{t('privacy.updated')} {new Date().toLocaleDateString()}</p>

        <section className="prose prose-invert mt-8 max-w-none">
          <p>{t('privacy.intro')}</p>

          <h2>1. {t('privacy.collect.title')}</h2>
          <ul>
            <li>{t('privacy.collect.item1')}</li>
            <li>{t('privacy.collect.item2')}</li>
            <li>{t('privacy.collect.item3')}</li>
          </ul>

          <h2>2. {t('privacy.use.title')}</h2>
          <p>{t('privacy.use.body')}</p>

          <h2>3. {t('privacy.sharing.title')}</h2>
          <p>{t('privacy.sharing.body')}</p>

          <h2>4. {t('privacy.security.title')}</h2>
          <p>{t('privacy.security.body')}</p>

          <h2>5. {t('privacy.choices.title')}</h2>
          <p>{t('privacy.choices.body')}</p>

          <h2>6. {t('privacy.changes.title')}</h2>
          <p>{t('privacy.changes.body')}</p>

          <h2>7. {t('privacy.contact.title')}</h2>
          <p>{t('privacy.contact.body')}</p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
