import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password })
    return response.data
  },

  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData)
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me')
    return response.data
  },
}

// Services API
export const servicesAPI = {
  getAllServices: async () => {
    const response = await api.get('/api/services/')
    return response.data
  },

  getService: async (id) => {
    const response = await api.get(`/api/services/${id}`)
    return response.data
  },
}

// Bookings API
export const bookingsAPI = {
  createBooking: async (bookingData) => {
    const response = await api.post('/api/bookings/', bookingData)
    return response.data
  },

  getMyBookings: async () => {
    const response = await api.get('/api/bookings/my-bookings')
    return response.data
  },

  getBooking: async (id) => {
    const response = await api.get(`/api/bookings/${id}`)
    return response.data
  },

  updateBooking: async (id, bookingData) => {
    const response = await api.put(`/api/bookings/${id}`, bookingData)
    return response.data
  },

  cancelBooking: async (id) => {
    const response = await api.delete(`/api/bookings/${id}`)
    return response.data
  },

  // Technician endpoints
  getAssignedBookings: async () => {
    const response = await api.get('/api/bookings/technician/assigned')
    return response.data
  },

  updateBookingStatus: async (id, status) => {
    const response = await api.patch(`/api/bookings/${id}/status`, { status })
    return response.data
  },

  acceptBooking: async (id) => {
    const response = await api.patch(`/api/bookings/${id}/accept`)
    return response.data
  },

  // Admin endpoints
  getAllBookings: async () => {
    const response = await api.get('/api/bookings/')
    return response.data
  },

  assignTechnician: async (bookingId, technicianId) => {
    const response = await api.patch(`/api/bookings/${bookingId}/assign`, {
      technician_id: technicianId,
    })
    return response.data
  },
}

// Technicians API
export const techniciansAPI = {
  getAllTechnicians: async () => {
    const response = await api.get('/api/technicians/')
    return response.data
  },

  getTechnician: async (id) => {
    const response = await api.get(`/api/technicians/${id}`)
    return response.data
  },

  getMyProfile: async () => {
    const response = await api.get('/api/technicians/me/profile')
    return response.data
  },

  updateProfile: async (id, profileData) => {
    const response = await api.put(`/api/technicians/${id}`, profileData)
    return response.data
  },
}

export default api
