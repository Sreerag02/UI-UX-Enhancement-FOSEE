import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import './Activation.css'

export default function Activation() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const urlStatus = searchParams.get('status')
    if (urlStatus) {
      mapDjangoStatus(urlStatus)
    } else {
      // Default to pending if no status provided
      setStatus('pending')
      setLoading(false)
    }
  }, [])

  const mapDjangoStatus = (djangoStatus) => {
    switch (djangoStatus) {
      case '0':
        setStatus('activated')
        break
      case '1':
        setStatus('expired')
        break
      case '2':
        setStatus('already_verified')
        break
      default:
        setStatus('pending')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (status === 'expired' || status === 'already_verified') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            window.location.href = status === 'expired' ? '/register' : '/login'
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [status])

  if (loading) {
    return (
      <div className="activation-page">
        <Header />
        <main className="activation-main">
          <div className="activation-container">
            <div className="loading-spinner"></div>
            <p>Checking activation status...</p>
          </div>
        </main>
      </div>
    )
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          ),
          title: 'Check your email',
          description: 'We\'ve sent an activation link to your email address. Click the link to verify your account. The link expires in 24 hours.',
          action: null
        }
      case 'expired':
        return {
          icon: (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          ),
          title: 'Activation link expired',
          description: 'Your activation link has expired. You\'ll be redirected to register again in',
          action: {
            text: 'Register again now',
            link: '/register',
            primary: true
          }
        }
      case 'activated':
        return {
          icon: (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          ),
          title: 'Account activated!',
          description: 'Your account has been successfully activated. You can now access all features.',
          action: {
            text: 'Go to dashboard',
            link: '/workshop/',
            primary: true
          }
        }
      case 'already_verified':
        return {
          icon: (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          ),
          title: 'Email already verified',
          description: 'Your email is already verified. You\'ll be redirected to sign in.',
          action: {
            text: 'Sign in now',
            link: '/login',
            primary: true
          }
        }
      default:
        return {
          icon: null,
          title: '',
          description: '',
          action: null
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className="activation-page">
      <Header />
      <main className="activation-main">
        <div className="activation-container">
          <div className={`activation-card status-${status}`}>
            <div className="activation-icon">
              {config.icon}
            </div>

            <h1 className="activation-title">{config.title}</h1>
            <p className="activation-description">{config.description}</p>

            {(status === 'expired' || status === 'already_verified') && (
              <p className="countdown">Redirecting in {countdown} seconds...</p>
            )}

            <div className="activation-actions">
              {config.action && (
                <Link
                  to={config.action.link}
                  className={`btn ${config.action.primary ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {config.action.text}
                </Link>
              )}

              {status === 'pending' && (
                <Link to="/login" className="btn btn-secondary">
                  Back to sign in
                </Link>
              )}
            </div>
          </div>

          {status === 'pending' && (
            <div className="activation-help">
              <h3>Didn't receive the email?</h3>
              <ul>
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Wait a few minutes for the email to arrive</li>
                <li>If still not received, you may need to register again</li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
