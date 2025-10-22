import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import DashboardShowcase from './components/Dashboard'
import Pricing from './components/Pricing'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--nexivo-dark)] via-slate-900 to-black text-[var(--nexivo-text)]">
      <div className="bg-noise min-h-screen" data-theme="gradient">
        <Header />
        <main className="container mx-auto flex max-w-6xl flex-col gap-32 px-4 py-16">
          <Hero />
          <Features />
          <DashboardShowcase />
          <Pricing />
        </main>
        <Footer />
      </div>
    </div>
  )
}
