import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import './Auth.css'

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'customer',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authAPI.register(formData)
      alert('Registration successful! Please login.')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
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

      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="auth-logo">⚡ QuickFix</div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join QuickFix and get started today!</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="full_name" className="input-label">
              <span className="label-icon">👤</span>
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              className="modern-input"
            />
          </div>

          <div className="input-group">
            <label htmlFor="email" className="input-label">
              <span className="label-icon">📧</span>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Min 6 characters"
              className="modern-input"
            />
          </div>

          <div className="input-group">
            <label htmlFor="phone" className="input-label">
              <span className="label-icon">📱</span>
              Phone Number <span className="optional-text">(Optional)</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="modern-input"
            />
          </div>

          <div className="input-group">
            <label htmlFor="role" className="input-label">
              <span className="label-icon">🎯</span>
              Register As
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="modern-input modern-select"
            >
              <option value="customer">👨‍💼 Customer - Book Services</option>
              <option value="technician">🔧 Technician - Provide Services</option>
            </select>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <span className="btn-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-link">
            Already have an account?{' '}
            <Link to="/login" className="link-primary">Login here</Link>
          </p>
          <p className="auth-link">
            <Link to="/" className="link-secondary">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
