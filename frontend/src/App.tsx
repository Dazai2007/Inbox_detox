import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import logo from './assets/logo-black.svg'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export default function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="bg-noise" data-theme="gradient">
        <nav className="header">
          <div className="container flex items-center gap-4 py-1 text-white">
            <Link to="/" className="brand">
              <span className="logo logo-rb">Nexa</span>
            </Link>
            <div className="nav">
              <Link to="/dashboard">Dashboard</Link>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

function HomeRedirect() {
  const { token } = useAuth()
  return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
}
