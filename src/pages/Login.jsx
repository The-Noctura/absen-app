import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../utils/auth'
import './Login.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username || !password) {
      setError('Harap isi semua kolom')
      return
    }
    setLoading(true)
    setError('')
    const result = await login(username, password)
    setLoading(false)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="login-root">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="login-card">
        <div className="login-badge">
          <span className="badge-icon">📋</span>
        </div>

        <div className="login-header">
          <h1 className="login-title">
            Sistem Rekap<br />
            <em>Absensi</em>
          </h1>
          <p className="login-sub">Masuk untuk melanjutkan</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Username</label>
            <div className="field-wrap">
              <span className="field-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                type="text"
                className="field-input"
                placeholder="Masukkan username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="field-wrap">
              <span className="field-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                className="field-input"
                placeholder="Masukkan password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="field-toggle"
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className={`login-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                Masuk
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="login-footer">SMK — Sistem Rekap Absen Pembinaan</p>
      </div>
    </div>
  )
}
