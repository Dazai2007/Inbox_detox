import Header from '../components/Header'
import Footer from '../components/Footer'
import { useI18n } from '../context/I18nContext'

export default function SecurityPage() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen text-[var(--nexivo-text)]">
      <Header />
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-white">{t('security.title')}</h1>
        <section className="prose prose-invert mt-6 max-w-none">
          <p>{t('security.content')}</p>
          <ul>
            <li>TLS/HTTPS everywhere</li>
            <li>At-rest encryption for sensitive data</li>
            <li>Principle of least privilege</li>
            <li>Audit logging and monitoring</li>
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  )
}
