import React from 'react';
import { Link } from 'react-router-dom';

const Hero = ({ user }) => {
  return (
    <section className="hero"
    >
      <div className="hero-overlay"></div>
      <div className="container">
        <div className="hero-content">
          <h1>Your Health Is Our Priority</h1>
          <h2>Excellence in Healthcare</h2>
          <p>Providing exceptional healthcare services with compassion and cutting-edge technology. Our team of expert doctors and state-of-the-art facilities ensure the highest quality of care.</p>
          <div className="hero-stats">
            <div className="stat-item">
              <i className="fas fa-user-md"></i>
              <span className="stat-number">50+</span>
              <span className="stat-label">Expert Doctors</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-hospital"></i>
              <span className="stat-number">25+</span>
              <span className="stat-label">Years of Service</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-smile"></i>
              <span className="stat-number">10k+</span>
              <span className="stat-label">Happy Patients</span>
            </div>
          </div>
          <div className="hero-buttons">
            {!user ? (
              <>
                <Link to="/book-appointment" className="btn btn-primary btn-lg">
                  <i className="fas fa-calendar-check"></i> Book an Appointment
                </Link>
                <a href="tel:911" className="btn btn-danger btn-lg">
                  <i className="fas fa-phone-alt"></i> Emergency: 911
                </a>
                <Link to="/patient-signup" className="btn btn-outline btn-lg">
                  <i className="fas fa-user-plus"></i> New Patient Registration
                </Link>
              </>
            ) : (
              <Link 
                to={
                  user.role === 'patient' ? '/patient-dashboard' :
                  user.role === 'doctor' ? '/doctor-dashboard' :
                  user.role === 'staff' ? '/staff-dashboard' : '/dashboard'
                } 
                className="btn btn-primary btn-lg"
              >
                <i className="fas fa-columns"></i> Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;