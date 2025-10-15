import React, { useState, useEffect } from 'react'
import { bookingsAPI, techniciansAPI } from '../../services/api'

function Analytics() {
  const [bookings, setBookings] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)

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
      console.error('Error loading analytics data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const totalBookings = bookings.length
  const pendingBookings = bookings.filter(b => b.status === 'pending').length
  const inProgressBookings = bookings.filter(b => b.status === 'in_progress').length
  const completedBookings = bookings.filter(b => b.status === 'completed').length
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length

  const completionRate = totalBookings > 0
    ? ((completedBookings / totalBookings) * 100).toFixed(1)
    : 0

  // Technician workload
  const technicianWorkload = technicians.map(tech => {
    const assignedBookings = bookings.filter(b => b.technician_id === tech.id)
    const activeBookings = assignedBookings.filter(
      b => b.status !== 'completed' && b.status !== 'cancelled'
    )

    return {
      ...tech,
      totalAssigned: assignedBookings.length,
      activeJobs: activeBookings.length,
      completedJobs: tech.total_jobs || 0,
    }
  }).sort((a, b) => b.activeJobs - a.activeJobs)

  if (loading) {
    return <div className="loading">Loading analytics...</div>
  }

  return (
    <div className="analytics-container">
      <h2>Analytics Dashboard</h2>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card total">
          <div className="metric-value">{totalBookings}</div>
          <div className="metric-label">Total Requests</div>
        </div>

        <div className="metric-card pending">
          <div className="metric-value">{pendingBookings}</div>
          <div className="metric-label">Pending</div>
        </div>

        <div className="metric-card progress">
          <div className="metric-value">{inProgressBookings}</div>
          <div className="metric-label">In Progress</div>
        </div>

        <div className="metric-card completed">
          <div className="metric-value">{completedBookings}</div>
          <div className="metric-label">Completed</div>
        </div>

        <div className="metric-card cancelled">
          <div className="metric-value">{cancelledBookings}</div>
          <div className="metric-label">Cancelled</div>
        </div>

        <div className="metric-card rate">
          <div className="metric-value">{completionRate}%</div>
          <div className="metric-label">Completion Rate</div>
        </div>
      </div>

      {/* Technician Workload */}
      <div className="workload-section">
        <h3>Technician Job Load</h3>
        <div className="workload-table-container">
          <table className="workload-table">
            <thead>
              <tr>
                <th>Technician</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Rating</th>
                <th>Active Jobs</th>
                <th>Total Assigned</th>
                <th>Completed</th>
                <th>Load Status</th>
              </tr>
            </thead>
            <tbody>
              {technicianWorkload.map((tech) => {
                const loadStatus =
                  tech.activeJobs === 0
                    ? 'available'
                    : tech.activeJobs <= 2
                    ? 'moderate'
                    : 'heavy'

                return (
                  <tr key={tech.id}>
                    <td>
                      <div>{tech.user_name || `Tech #${tech.id}`}</div>
                      {tech.user_phone && (
                        <div className="text-small">📱 {tech.user_phone}</div>
                      )}
                    </td>
                    <td>{tech.specialization}</td>
                    <td>{tech.experience_years} years</td>
                    <td>
                      <span className="rating">⭐ {tech.rating.toFixed(1)}</span>
                    </td>
                    <td>
                      <strong className="active-jobs">{tech.activeJobs}</strong>
                    </td>
                    <td>{tech.totalAssigned}</td>
                    <td>{tech.completedJobs}</td>
                    <td>
                      <span className={`load-badge load-${loadStatus}`}>
                        {loadStatus.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {technicians.length === 0 && (
            <div className="empty-state">
              <p>No technicians registered yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Distribution */}
      <div className="distribution-section">
        <h3>Booking Status Distribution</h3>
        <div className="chart-container">
          <div className="bar-chart">
            {[
              { label: 'Pending', count: pendingBookings, color: '#ffc107' },
              { label: 'Accepted', count: bookings.filter(b => b.status === 'accepted').length, color: '#17a2b8' },
              { label: 'In Progress', count: inProgressBookings, color: '#007bff' },
              { label: 'Completed', count: completedBookings, color: '#28a745' },
              { label: 'Cancelled', count: cancelledBookings, color: '#dc3545' },
            ].map((item, index) => {
              const percentage = totalBookings > 0 ? (item.count / totalBookings) * 100 : 0
              return (
                <div key={index} className="bar-item">
                  <div className="bar-label">{item.label}</div>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                    ></div>
                  </div>
                  <div className="bar-value">{item.count} ({percentage.toFixed(1)}%)</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
