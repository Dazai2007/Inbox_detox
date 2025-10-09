import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(email, password, fullName)
      nav('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Register failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Full name</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} />
        </div>
        <div>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <label>Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        </div>
        <button type="submit" disabled={loading}>{loading ? '...' : 'Create Account'}</button>
      </form>
      {error && <div style={{color:'crimson'}}>{error}</div>}
      <div style={{marginTop:12}}>Have an account? <Link to="/login">Login</Link></div>
    </div>
  )
}
