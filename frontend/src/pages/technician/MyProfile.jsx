import React, { useState, useEffect } from 'react'
import { techniciansAPI } from '../../services/api'

function MyProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    specialization: '',
    experience_years: 0,
    bio: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await techniciansAPI.getMyProfile()
      setProfile(data)
      setFormData({
        specialization: data.specialization,
        experience_years: data.experience_years,
        bio: data.bio || '',
      })
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'experience_years' ? parseInt(value) || 0 : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await techniciansAPI.updateProfile(profile.id, formData)
      alert('Profile updated successfully!')
      setEditing(false)
      loadProfile()
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data?.detail || err.message))
    }
  }

  if (loading) {
    return <div className="loading">Loading profile...</div>
  }

  if (!profile) {
    return <div className="error-message">Profile not found</div>
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn btn-primary">
            Edit Profile
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="specialization">Specialization *</label>
            <select
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
            >
              <option value="General">General</option>
              <option value="Electrician">Electrician</option>
              <option value="Plumber">Plumber</option>
              <option value="HVAC Technician">HVAC Technician</option>
              <option value="Appliance Repair">Appliance Repair</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Painter">Painter</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="experience_years">Years of Experience *</label>
            <input
              type="number"
              id="experience_years"
              name="experience_years"
              value={formData.experience_years}
              onChange={handleChange}
              min="0"
              max="50"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Tell customers about your experience and expertise..."
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success">
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setFormData({
                  specialization: profile.specialization,
                  experience_years: profile.experience_years,
                  bio: profile.bio || '',
                })
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-view">
          <div className="profile-info-card">
            <div className="info-row">
              <strong>Specialization:</strong>
              <span>{profile.specialization}</span>
            </div>
            <div className="info-row">
              <strong>Experience:</strong>
              <span>{profile.experience_years} years</span>
            </div>
            <div className="info-row">
              <strong>Rating:</strong>
              <span>⭐ {profile.rating.toFixed(1)}</span>
            </div>
            <div className="info-row">
              <strong>Total Jobs Completed:</strong>
              <span>{profile.total_jobs}</span>
            </div>
            <div className="info-row">
              <strong>Bio:</strong>
              <p>{profile.bio || 'No bio provided yet'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyProfile
