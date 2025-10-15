import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import BookingForm from './BookingForm'
import MyBookings from './MyBookings'
import './Dashboard.css'

function CustomerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('book')

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      navigate('/login')
    }
  }, [user, navigate])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="customer-dashboard">
      {/* Header */}
      <header className="customer-header">
        <div className="header-wave"></div>
        <div className="header-content">
          <div className="header-left">
            <div className="brand-logo">⚡ QuickFix</div>
            <h1 className="header-title">Customer Portal</h1>
          </div>
          <div className="header-right">
            <div className="user-profile">
              <div className="user-avatar">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-greeting">Welcome back,</span>
                <span className="user-name">{user.full_name}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              <span>Logout</span>
              <span className="logout-icon">→</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        <div className="nav-container">
          <button
            className={`nav-tab ${activeTab === 'book' ? 'active' : ''}`}
            onClick={() => setActiveTab('book')}
          >
            <span className="tab-icon">📝</span>
            <span className="tab-label">Book Service</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <span className="tab-icon">📋</span>
            <span className="tab-label">My Bookings</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-main">
        {activeTab === 'book' && <BookingForm />}
        {activeTab === 'bookings' && <MyBookings />}
      </div>
    </div>
  )
}

export default CustomerDashboard
