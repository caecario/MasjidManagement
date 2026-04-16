'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
      } else {
        router.push('/admin')
        router.refresh()
      }
    } catch {
      setError('Gagal menghubungi server. Pastikan koneksi internet Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card animate-slide-up">
        <div className="login-logo">
          <div className="login-logo-icon">🕌</div>
          <div className="login-logo-title">MASJID AS-SYAMS</div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
            Panel Administrasi
          </p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="admin@assyams.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? '⏳ Masuk...' : '🔐 Masuk'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--gray-400)',
          marginTop: '1.5rem',
        }}>
          © 2026 Masjid AS-SYAMS Digital System
        </p>
      </div>
    </div>
  )
}
