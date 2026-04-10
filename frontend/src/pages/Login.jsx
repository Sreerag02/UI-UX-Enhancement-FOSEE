import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Login.css'
import Header from '../components/Header'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/workshop/api/csrf/', { credentials: 'include' })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/workshop/api/login/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password })
      })

      const data = await res.json()
      if (res.ok) {
        window.location.href = data.redirect
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch {
      setError('Server error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <Header />

      <main className="login-main">
        <div className="login-container">
          <div className="login-header">
            <div className="login-badge">
              <span className="login-badge-dot"></span>
              Workshop Portal
            </div>
            <h1 className="login-title">Welcome back</h1>
            <p className="login-description">
              Sign in to access your workshops, resources, and coordinator dashboard.
            </p>
          </div>

          <div className="login-card">
            <form onSubmit={handleSubmit} className="login-form">
              {error && <div className="alert error">{error}</div>}

              <div className="field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="Enter your username"
                />
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>

          <div className="login-footer">
            <div className="login-links-row">
              <Link to="/register">Create an account</Link>
              <a href="/reset/">Forgot password?</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
