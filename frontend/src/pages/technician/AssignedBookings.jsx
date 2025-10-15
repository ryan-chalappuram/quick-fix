import React, { useState, useEffect } from 'react'
import { bookingsAPI } from '../../services/api'

function AssignedBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const data = await bookingsAPI.getAssignedBookings()
      setBookings(data)
    } catch (err) {
      setError('Failed to load bookings')
      console.error('Error loading bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptBooking = async (bookingId) => {
    try {
      await bookingsAPI.acceptBooking(bookingId)
      alert('Booking accepted successfully!')
      loadBookings()
    } catch (err) {
      alert('Failed to accept booking: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await bookingsAPI.updateBookingStatus(bookingId, newStatus)
      alert(`Booking status updated to ${newStatus}`)
      loadBookings()
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.detail || err.message))
    }
  }

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { icon: '⏳', color: '#ffc107', label: 'Pending' },
      accepted: { icon: '✅', color: '#17a2b8', label: 'Accepted' },
      in_progress: { icon: '🔧', color: '#007bff', label: 'In Progress' },
      completed: { icon: '✔️', color: '#28a745', label: 'Completed' },
      cancelled: { icon: '❌', color: '#dc3545', label: 'Cancelled' },
    }
    return statusMap[status] || { icon: '📋', color: '#6c757d', label: status }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Loading assigned bookings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="empty-bookings">
        <div className="empty-icon">📋</div>
        <h3>No bookings assigned yet</h3>
        <p>Wait for admin to assign bookings to you</p>
      </div>
    )
  }

  return (
    <div className="assigned-bookings-wrapper">
      <div className="bookings-header">
        <div>
          <h2 className="bookings-title">
            <span className="title-icon">📋</span>
            Assigned Bookings
          </h2>
          <p className="bookings-subtitle">Manage your service requests</p>
        </div>

        <div className="filter-group">
          <label>Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Bookings ({bookings.length})</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bookings-grid">
        {filteredBookings.map((booking) => {
          const statusInfo = getStatusInfo(booking.status)
          return (
            <div key={booking.id} className="booking-card-modern">
              <div className="card-header">
                <div className="card-title-section">
                  <span className="booking-number">#{booking.id}</span>
                  <span
                    className="status-badge-modern"
                    style={{ backgroundColor: statusInfo.color }}
                  >
                    <span className="status-icon">{statusInfo.icon}</span>
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              <div className="card-body">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-icon">📅</span>
                    <div className="info-content">
                      <span className="info-label">Date</span>
                      <span className="info-value">{formatDate(booking.preferred_date)}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <span className="info-icon">🕐</span>
                    <div className="info-content">
                      <span className="info-label">Time</span>
                      <span className="info-value">{booking.preferred_time}</span>
                    </div>
                  </div>

                  <div className="info-item full-width">
                    <span className="info-icon">📍</span>
                    <div className="info-content">
                      <span className="info-label">Address</span>
                      <span className="info-value">{booking.address}</span>
                    </div>
                  </div>

                  <div className="info-item full-width">
                    <span className="info-icon">📋</span>
                    <div className="info-content">
                      <span className="info-label">Problem</span>
                      <span className="info-value">{booking.problem_description}</span>
                    </div>
                  </div>

                  {booking.customer && (
                    <div className="info-item">
                      <span className="info-icon">👤</span>
                      <div className="info-content">
                        <span className="info-label">Customer</span>
                        <span className="info-value">{booking.customer.name}</span>
                        {booking.customer.phone && (
                          <span className="info-subtext">📱 {booking.customer.phone}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {booking.final_price && (
                    <div className="info-item">
                      <span className="info-icon">💰</span>
                      <div className="info-content">
                        <span className="info-label">Price</span>
                        <span className="info-value price">${booking.final_price}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-footer">
                {booking.status === 'pending' && (
                  <button
                    onClick={() => handleAcceptBooking(booking.id)}
                    className="btn-action btn-accept"
                  >
                    <span>✓ Accept Booking</span>
                  </button>
                )}

                {booking.status === 'accepted' && (
                  <button
                    onClick={() => handleUpdateStatus(booking.id, 'in_progress')}
                    className="btn-action btn-start"
                  >
                    <span>▶ Start Job</span>
                  </button>
                )}

                {booking.status === 'in_progress' && (
                  <button
                    onClick={() => handleUpdateStatus(booking.id, 'completed')}
                    className="btn-action btn-complete"
                  >
                    <span>✓ Mark as Completed</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredBookings.length === 0 && (
        <div className="no-results">
          <p>No bookings found with the selected filter</p>
        </div>
      )}
    </div>
  )
}

export default AssignedBookings
