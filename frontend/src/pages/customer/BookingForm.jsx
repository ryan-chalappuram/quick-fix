import React, { useState, useEffect } from 'react'
import { servicesAPI, bookingsAPI } from '../../services/api'

function BookingForm() {
  const [services, setServices] = useState([])
  const [formData, setFormData] = useState({
    service_id: '',
    problem_description: '',
    address: '',
    preferred_date: '',
    preferred_time: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const data = await servicesAPI.getAllServices()
      setServices(data)
    } catch (err) {
      console.error('Error loading services:', err)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const bookingData = {
        ...formData,
        service_id: parseInt(formData.service_id),
        preferred_date: new Date(formData.preferred_date).toISOString(),
      }

      await bookingsAPI.createBooking(bookingData)
      setSuccess('🎉 Booking created successfully! We will assign a technician soon.')

      // Reset form
      setFormData({
        service_id: '',
        problem_description: '',
        address: '',
        preferred_date: '',
        preferred_time: '',
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (categoryOrName) => {
    const lower = categoryOrName.toLowerCase()
    if (lower.includes('electric')) return '⚡'
    if (lower.includes('plumb')) return '💧'
    if (lower.includes('appliance') || lower.includes('refrigerator') || lower.includes('washing') || lower.includes('dishwasher')) return '🔧'
    if (lower.includes('hvac') || lower.includes('ac') || lower.includes('heater')) return '❄️'
    return '🛠️'
  }

  return (
    <div className="booking-form-wrapper">
      <div className="form-header">
        <h2 className="form-title">
          <span className="title-icon">📝</span>
          Book a Service
        </h2>
        <p className="form-subtitle">Fill in the details and we'll connect you with a professional technician</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="modern-form">
        <div className="form-section">
          <h3 className="section-title">Service Selection</h3>

          <div className="input-group">
            <label htmlFor="service_id" className="input-label">
              <span className="label-icon">🛠️</span>
              Choose Service Type
            </label>
            <select
              id="service_id"
              name="service_id"
              value={formData.service_id}
              onChange={handleChange}
              className="modern-input modern-select"
              required
            >
              <option value="">-- Select a service --</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {getServiceIcon(service.category)} {service.name} - ${service.base_price}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="problem_description" className="input-label">
              <span className="label-icon">📋</span>
              Describe Your Problem
            </label>
            <textarea
              id="problem_description"
              name="problem_description"
              value={formData.problem_description}
              onChange={handleChange}
              className="modern-input modern-textarea"
              required
              rows="4"
              placeholder="Please describe the issue in detail so we can help you better..."
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Location & Schedule</h3>

          <div className="input-group">
            <label htmlFor="address" className="input-label">
              <span className="label-icon">📍</span>
              Service Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="modern-input"
              required
              placeholder="Enter your full address"
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="preferred_date" className="input-label">
                <span className="label-icon">📅</span>
                Preferred Date
              </label>
              <input
                type="date"
                id="preferred_date"
                name="preferred_date"
                value={formData.preferred_date}
                onChange={handleChange}
                className="modern-input"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="input-group">
              <label htmlFor="preferred_time" className="input-label">
                <span className="label-icon">🕐</span>
                Preferred Time
              </label>
              <select
                id="preferred_time"
                name="preferred_time"
                value={formData.preferred_time}
                onChange={handleChange}
                className="modern-input modern-select"
                required
              >
                <option value="">-- Select time slot --</option>
                <option value="08:00-10:00">🌅 8:00 AM - 10:00 AM</option>
                <option value="10:00-12:00">☀️ 10:00 AM - 12:00 PM</option>
                <option value="12:00-14:00">🌤️ 12:00 PM - 2:00 PM</option>
                <option value="14:00-16:00">🌞 2:00 PM - 4:00 PM</option>
                <option value="16:00-18:00">🌆 4:00 PM - 6:00 PM</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Book Service Now</span>
              <span className="btn-arrow">→</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default BookingForm
