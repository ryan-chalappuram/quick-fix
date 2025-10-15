import React, { useState, useEffect } from 'react'
import { bookingsAPI, techniciansAPI } from '../../services/api'

function AllBookings() {
  const [bookings, setBookings] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [assigningBookingId, setAssigningBookingId] = useState(null)
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('')
  const [assigningLoader, setAssigningLoader] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [bookingsData, techniciansData] = await Promise.all([
        bookingsAPI.getAllBookings(),
        techniciansAPI.getAllTechnicians(),
      ])
      setBookings(bookingsData)
      setTechnicians(techniciansData)
    } catch (err) {
      setError('Failed to load data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignTechnician = async (bookingId) => {
    if (!selectedTechnicianId) {
      alert('Please select a technician')
      return
    }

    try {
      setAssigningLoader(true)
      await bookingsAPI.assignTechnician(bookingId, parseInt(selectedTechnicianId))
      alert('Technician assigned successfully!')
      setAssigningBookingId(null)
      setSelectedTechnicianId('')
      loadData()
    } catch (err) {
      alert('Failed to assign technician: ' + (err.response?.data?.detail || err.message))
    } finally {
      setAssigningLoader(false)
    }
  }

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: 'badge-warning',
      accepted: 'badge-info',
      in_progress: 'badge-primary',
      completed: 'badge-success',
      cancelled: 'badge-danger',
    }
    return statusMap[status] || 'badge-secondary'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getTechnicianName = (booking) => {
    if (booking.technician) {
      return `${booking.technician.name} - ${booking.technician.specialization}`
    }
    return 'Not assigned'
  }

  const getCustomerName = (booking) => {
    if (booking.customer) {
      return booking.customer.name
    }
    return `ID: ${booking.customer_id}`
  }

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus)

  if (loading) {
    return <div className="loading">Loading all bookings...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="all-bookings-container">
      <div className="bookings-header">
        <h2>All Service Requests</h2>
        <div className="filter-controls">
          <label>Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Bookings ({bookings.length})</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bookings-table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Date & Time</th>
              <th>Address</th>
              <th>Status</th>
              <th>Technician</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td>#{booking.id}</td>
                <td>
                  <div>{getCustomerName(booking)}</div>
                  {booking.customer?.phone && (
                    <div className="text-small">📱 {booking.customer.phone}</div>
                  )}
                </td>
                <td>Service #{booking.service_id}</td>
                <td>
                  <div>{formatDate(booking.preferred_date)}</div>
                  <div className="text-small">{booking.preferred_time}</div>
                </td>
                <td className="address-cell">{booking.address}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td>
                  {booking.technician ? (
                    <div>
                      <span className="assigned-tech">{getTechnicianName(booking)}</span>
                      {booking.technician.phone && (
                        <div className="text-small">📱 {booking.technician.phone}</div>
                      )}
                    </div>
                  ) : (
                    <span className="unassigned">Unassigned</span>
                  )}
                </td>
                <td>
                  {assigningBookingId === booking.id ? (
                    <div className="assign-form">
                      <select
                        value={selectedTechnicianId}
                        onChange={(e) => setSelectedTechnicianId(e.target.value)}
                        className="tech-select"
                        disabled={assigningLoader}
                      >
                        <option value="">Select Technician</option>
                        {technicians.map((tech) => (
                          <option key={tech.id} value={tech.id}>
                            {tech.user_name || `Tech #${tech.id}`} - {tech.specialization} ({tech.experience_years}y, ⭐{tech.rating.toFixed(1)})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssignTechnician(booking.id)}
                        className="btn btn-success btn-xs"
                        disabled={assigningLoader}
                      >
                        {assigningLoader ? 'Assigning...' : 'Assign'}
                      </button>
                      <button
                        onClick={() => {
                          setAssigningBookingId(null)
                          setSelectedTechnicianId('')
                        }}
                        className="btn btn-secondary btn-xs"
                        disabled={assigningLoader}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAssigningBookingId(booking.id)}
                      className="btn btn-primary btn-sm"
                      disabled={booking.status === 'cancelled' || booking.status === 'completed' || booking.status === 'in_progress'}
                    >
                      {booking.technician_id ? 'Reassign' : 'Assign Tech'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <div className="empty-state">
            <p>No bookings found with the selected filter</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AllBookings
