import Header from '../components/Header'
import Footer from '../components/Footer'
import { useI18n } from '../context/I18nContext'

export default function TermsPage() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen text-[var(--nexivo-text)]">
      <Header />
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-white">{t('terms.title')}</h1>
        <p className="mt-2 text-sm text-slate-400">{t('terms.updated')} {new Date().toLocaleDateString()}</p>

        <section className="prose prose-invert mt-8 max-w-none">
          <p>{t('terms.intro')}</p>

          <h2>1. {t('terms.eligibility.title')}</h2>
          <p>{t('terms.eligibility.body')}</p>

          <h2>2. {t('terms.accounts.title')}</h2>
          <p>{t('terms.accounts.body')}</p>

          <h2>3. {t('terms.acceptable.title')}</h2>
          <p>{t('terms.acceptable.body')}</p>

          <h2>4. {t('terms.billing.title')}</h2>
          <p>{t('terms.billing.body')}</p>

          <h2>5. {t('terms.termination.title')}</h2>
          <p>{t('terms.termination.body')}</p>

          <h2>6. {t('terms.changes.title')}</h2>
          <p>{t('terms.changes.body')}</p>

          <h2>7. {t('terms.contact.title')}</h2>
          <p>{t('terms.contact.body')}</p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
