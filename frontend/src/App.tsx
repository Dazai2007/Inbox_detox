import { ReactNode, useMemo } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import DashboardShowcase from './components/Dashboard'
import Pricing from './components/Pricing'
import Footer from './components/Footer'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import DashboardPage from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import TermsOfService from '../components/TermsOfService'
import PrivacyPolicy from '../components/PrivacyPolicy'
import SecurityPage from './pages/Security'
import StatusPage from './pages/Status'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { token } = useAuth()
  const isAuthenticated = useMemo(() => Boolean(token), [token])

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-nexivo-dark to-slate-900">
        <Routes>
          <Route
            path="/login"
            element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            }
          />

          <Route
            path="/register"
            element={
              <AuthLayout>
                <Register />
              </AuthLayout>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <AuthLayout>
                <ForgotPassword />
              </AuthLayout>
            }
          />

          <Route
            path="/reset-password"
            element={
              <AuthLayout>
                <ResetPassword />
              </AuthLayout>
            }
          />

          <Route
            path="/dashboard"
            element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />}
          />

          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/status" element={<StatusPage />} />

          <Route
            path="/"
            element={isAuthenticated ? <LandingPage /> : <Navigate to="/login" replace />}
          />

          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />}
          />
        </Routes>
      </div>
    </Router>
  )
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--nexivo-dark)] via-slate-900 to-black text-[var(--nexivo-text)]">
      <div className="bg-noise min-h-screen" data-theme="gradient">
        <Header />
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-40 px-6 py-24">
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

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout relative flex min-h-screen items-center justify-center overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-nexivo-primary/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-nexivo-secondary/20 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexivo-accent/10 blur-3xl" />
      <div className="relative z-10 w-full max-w-lg">{children}</div>
    </div>
  )
}
