import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Home.css'

function Home() {
  const { user } = useAuth()

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">🛠️ Professional Home Services</div>
          <h1 className="hero-title">
            Welcome to <span className="brand-highlight">QuickFix</span>
          </h1>
          <p className="hero-subtitle">
            Your trusted platform for booking skilled technicians instantly.
            <br />Quality service, guaranteed satisfaction.
          </p>

          {!user ? (
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                <span>Get Started</span>
                <span className="btn-icon">→</span>
              </Link>
              <Link to="/login" className="btn btn-secondary btn-large">
                <span>Sign In</span>
              </Link>
            </div>
          ) : (
            <div className="cta-buttons">
              <Link
                to={
                  user.role === 'admin'
                    ? '/admin/dashboard'
                    : user.role === 'technician'
                    ? '/technician/dashboard'
                    : '/customer/dashboard'
                }
                className="btn btn-primary btn-large"
              >
                <span>Go to Dashboard</span>
                <span className="btn-icon">→</span>
              </Link>
            </div>
          )}

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Expert Technicians</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        <div className="hero-decoration">
          <div className="floating-card card-1">⚡</div>
          <div className="floating-card card-2">🔧</div>
          <div className="floating-card card-3">💡</div>
        </div>
      </div>

      {/* Services Section */}
      <div className="services-section">
        <div className="section-header">
          <h2 className="section-title">Our Professional Services</h2>
          <p className="section-subtitle">
            Expert solutions for all your home service needs
          </p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">⚡</div>
            <h3>Electrical Services</h3>
            <p>Professional electricians for installations, repairs, and maintenance</p>
            <ul className="service-features">
              <li>✓ Wiring & Rewiring</li>
              <li>✓ Circuit Breakers</li>
              <li>✓ Emergency Repairs</li>
            </ul>
          </div>

          <div className="service-card">
            <div className="service-icon">💧</div>
            <h3>Plumbing Services</h3>
            <p>Expert plumbers for all your plumbing needs and emergencies</p>
            <ul className="service-features">
              <li>✓ Leak Repairs</li>
              <li>✓ Pipe Installation</li>
              <li>✓ Drain Cleaning</li>
            </ul>
          </div>

          <div className="service-card">
            <div className="service-icon">🔧</div>
            <h3>Appliance Repair</h3>
            <p>Quick and reliable repairs for all household appliances</p>
            <ul className="service-features">
              <li>✓ Refrigerators</li>
              <li>✓ Washing Machines</li>
              <li>✓ Dishwashers</li>
            </ul>
          </div>

          <div className="service-card">
            <div className="service-icon">❄️</div>
            <h3>HVAC Services</h3>
            <p>Climate control experts for heating and cooling systems</p>
            <ul className="service-features">
              <li>✓ AC Installation</li>
              <li>✓ Heater Repair</li>
              <li>✓ Maintenance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get your service booked in 3 simple steps</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon">📝</div>
            <h3>Choose Service</h3>
            <p>Select the service you need and describe your problem</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon">👨‍🔧</div>
            <h3>Get Matched</h3>
            <p>We assign the best technician for your job</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon">✅</div>
            <h3>Job Done</h3>
            <p>Expert service delivered to your satisfaction</p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="features-highlight-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose QuickFix?</h2>
        </div>

        <div className="features-highlight-grid">
          <div className="highlight-card">
            <div className="highlight-icon">🏆</div>
            <h3>Verified Professionals</h3>
            <p>All technicians are background-checked and certified</p>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon">💰</div>
            <h3>Transparent Pricing</h3>
            <p>No hidden fees, upfront pricing for all services</p>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon">⚡</div>
            <h3>Quick Response</h3>
            <p>Same-day service available for urgent needs</p>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon">🛡️</div>
            <h3>Quality Guarantee</h3>
            <p>100% satisfaction guaranteed or your money back</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="cta-section">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of satisfied customers today</p>
            <Link to="/register" className="btn btn-primary btn-large">
              <span>Book Your Service Now</span>
              <span className="btn-icon">→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
