import Header from '../components/Header'
import Footer from '../components/Footer'
import { useI18n } from '../context/I18nContext'

export default function StatusPage() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen text-[var(--nexivo-text)]">
      <Header />
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-white">{t('status.title')}</h1>
        <section className="prose prose-invert mt-6 max-w-none">
          <p>{t('status.content')}</p>
          <p>
            Public status page integration can be linked here (e.g., Statuspage/Better Stack). For now, this page provides
            basic availability information.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
