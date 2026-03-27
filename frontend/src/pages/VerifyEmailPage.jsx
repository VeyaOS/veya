import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState({ loading: true, error: '' })

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus({ loading: false, error: 'Verification link is missing a token.' })
      return
    }

    let cancelled = false

    const verify = async () => {
      try {
        const response = await api.post('/auth/verify-email', { token })
        if (cancelled) return

        const { token: authToken, user } = response.data
        localStorage.setItem('token', authToken)
        localStorage.setItem('user', JSON.stringify(user))
        setStatus({ loading: false, error: '' })
        navigate('/dashboard', { replace: true })
      } catch (error) {
        if (cancelled) return
        setStatus({
          loading: false,
          error: error.response?.data?.error || 'Verification failed. Please request a new verification email.',
        })
      }
    }

    verify()

    return () => {
      cancelled = true
    }
  }, [navigate, searchParams])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0a0a0b',
        color: '#f0ede8',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#111114',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '32px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '28px' }}>
          {status.loading ? 'Verifying your email...' : status.error ? 'Verification failed' : 'Email verified'}
        </h1>
        <p style={{ color: '#9e9b94', lineHeight: 1.7, marginTop: '12px' }}>
          {status.loading
            ? 'Please wait while we activate your account.'
            : status.error
              ? status.error
              : 'Your account is verified. Redirecting to your dashboard.'}
        </p>
        {!status.loading && status.error && (
          <Link
            to="/auth"
            style={{
              display: 'inline-block',
              marginTop: '16px',
              color: '#f5a623',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Back to sign in
          </Link>
        )}
      </div>
    </div>
  )
}
