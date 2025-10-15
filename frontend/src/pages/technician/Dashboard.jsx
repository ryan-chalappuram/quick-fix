import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import AssignedBookings from './AssignedBookings'
import WeeklySchedule from './WeeklySchedule'
import MyProfile from './MyProfile'
import './Dashboard.css'

function TechnicianDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('bookings')

  useEffect(() => {
    if (!user || user.role !== 'technician') {
      navigate('/login')
    }
  }, [user, navigate])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="technician-dashboard">
      {/* Header */}
      <header className="technician-header">
        <div className="header-wave"></div>
        <div className="header-content">
          <div className="header-left">
            <div className="brand-logo">🔧 QuickFix</div>
            <h1 className="header-title">Technician Portal</h1>
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
            className={`nav-tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <span className="tab-icon">📋</span>
            <span className="tab-label">Assigned Bookings</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <span className="tab-icon">📅</span>
            <span className="tab-label">Weekly Schedule</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="tab-icon">👤</span>
            <span className="tab-label">My Profile</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-main">
        {activeTab === 'bookings' && <AssignedBookings />}
        {activeTab === 'schedule' && <WeeklySchedule />}
        {activeTab === 'profile' && <MyProfile />}
      </div>
    </div>
  )
}

export default TechnicianDashboard
