import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../services/api'
import './Auth.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const tokenData = await authAPI.login(email, password)

      // Store token first so getCurrentUser can use it
      localStorage.setItem('token', tokenData.access_token)

      const userData = await authAPI.getCurrentUser()

      login(userData, tokenData.access_token)

      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (userData.role === 'technician') {
        navigate('/technician/dashboard')
      } else {
        navigate('/customer/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      {/* Floating decorations */}
      <div className="auth-decoration">
        <div className="floating-icon icon-1">🔧</div>
        <div className="floating-icon icon-2">⚡</div>
        <div className="floating-icon icon-3">🛠️</div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">⚡ QuickFix</div>
          <h2 className="auth-title">Welcome Back!</h2>
          <p className="auth-subtitle">Login to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email" className="input-label">
              <span className="label-icon">📧</span>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="modern-input"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">
              <span className="label-icon">🔒</span>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="modern-input"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <span className="btn-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-link">
            Don't have an account?{' '}
            <Link to="/register" className="link-primary">Register here</Link>
          </p>
          <p className="auth-link">
            <Link to="/" className="link-secondary">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
