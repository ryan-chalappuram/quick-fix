import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import AllBookings from './AllBookings'
import Analytics from './Analytics'
import './Dashboard.css'

function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('bookings')

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login')
    }
  }, [user, navigate])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-wave"></div>
        <div className="header-content">
          <div className="header-left">
            <div className="brand-logo">⚡ QuickFix</div>
            <h1 className="header-title">Admin Portal</h1>
          </div>
          <div className="header-right">
            <div className="user-profile">
              <div className="user-avatar">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-greeting">Administrator</span>
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
            className={`nav-tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <span className="tab-icon">📋</span>
            <span className="tab-label">All Bookings</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-label">Analytics</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-main">
        {activeTab === 'bookings' && <AllBookings />}
        {activeTab === 'analytics' && <Analytics />}
      </div>
    </div>
  )
}

export default AdminDashboard
