import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CustomerDashboard from './pages/customer/Dashboard'
import TechnicianDashboard from './pages/technician/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
