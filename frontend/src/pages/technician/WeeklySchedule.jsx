import React, { useState, useEffect } from 'react'
import { bookingsAPI } from '../../services/api'

function WeeklySchedule() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const data = await bookingsAPI.getAssignedBookings()
      // Filter out cancelled bookings
      const activeBookings = data.filter(b => b.status !== 'cancelled')
      setBookings(activeBookings)
    } catch (err) {
      console.error('Error loading bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const getWeekDays = () => {
    const today = new Date()
    const week = []

    // Get Monday of current week
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1)

    for (let i = 0; i < 7; i++) {
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      week.push(day)
    }

    return week
  }

  const getBookingsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.preferred_date).toISOString().split('T')[0]
      return bookingDate === dateStr
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      accepted: '#17a2b8',
      in_progress: '#007bff',
      completed: '#28a745',
    }
    return colors[status] || '#6c757d'
  }

  const weekDays = getWeekDays()

  if (loading) {
    return <div className="loading">Loading schedule...</div>
  }

  return (
    <div className="weekly-schedule-container">
      <h2>Weekly Schedule</h2>

      <div className="schedule-grid">
        {weekDays.map((day, index) => {
          const dayBookings = getBookingsForDate(day)
          const isToday = day.toDateString() === new Date().toDateString()

          return (
            <div key={index} className={`day-column ${isToday ? 'today' : ''}`}>
              <div className="day-header">
                <div className="day-name">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="day-date">
                  {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>

              <div className="day-bookings">
                {dayBookings.length === 0 ? (
                  <div className="no-bookings">No bookings</div>
                ) : (
                  dayBookings.map(booking => (
                    <div
                      key={booking.id}
                      className="schedule-booking"
                      style={{ borderLeftColor: getStatusColor(booking.status) }}
                    >
                      <div className="booking-time">{booking.preferred_time}</div>
                      <div className="booking-info">
                        <strong>#{booking.id}</strong>
                        <div className="booking-address">
                          {booking.address.substring(0, 30)}...
                        </div>
                        <div className="booking-status-small">
                          {booking.status.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="schedule-legend">
        <h4>Status Legend:</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#ffc107' }}></span>
            Pending
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#17a2b8' }}></span>
            Accepted
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#007bff' }}></span>
            In Progress
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#28a745' }}></span>
            Completed
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeeklySchedule
