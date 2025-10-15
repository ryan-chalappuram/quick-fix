import React, { createContext, useState, useContext, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Restore user session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          // Fetch current user from backend
          const userData = await authAPI.getCurrentUser()
          setUser(userData)
          setToken(storedToken)
        } catch (error) {
          console.error('Failed to restore session:', error)
          // Token is invalid or expired, clear it
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }

    restoreSession()
  }, [])

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  const login = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
  }

  // Show loading state while restoring session
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
