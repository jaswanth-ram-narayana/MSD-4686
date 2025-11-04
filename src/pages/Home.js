import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Hero from '../components/Hero';

const Home = () => {
  const { user } = useAuth();

  return (
    <>
      {/* Hero Section */}
      <Hero user={user} />

      {/* Services Section */}
      <section className="container">
        <div className="card text-center">
          <h2 className="card-title">Our Services</h2>
          <p>Comprehensive healthcare services for all your needs</p>
          
          <div className="grid-container mt-3">
            <div className="card">
              <i className="fas fa-heartbeat fa-3x service-icon"></i>
              <h3>Cardiology</h3>
              <p>Advanced cardiac care with state-of-the-art diagnostic equipment.</p>
            </div>
            <div className="card">
              <i className="fas fa-bone fa-3x service-icon"></i>
              <h3>Orthopedics</h3>
              <p>Specialized care for bones, joints, and musculoskeletal system.</p>
            </div>
            <div className="card">
              <i className="fas fa-brain fa-3x service-icon"></i>
              <h3>Neurology</h3>
              <p>Comprehensive neurological care for brain disorders.</p>
            </div>
          </div>
          
          <Link to="/services" className="btn btn-outline mt-3">
            View All Services
          </Link>
        </div>
      </section>

      {/* Quick Links */}
      <section className="container">
        <div className="card">
          <h2 className="card-title text-center">Quick Access</h2>
          <div className="grid-container">
            <Link to="/book-appointment" className="card text-center">
              <i className="fas fa-calendar-check fa-2x quick-icon"></i>
              <h3>Book Appointment</h3>
            </Link>
            <Link to="/find-doctor" className="card text-center">
              <i className="fas fa-user-md fa-2x quick-icon"></i>
              <h3>Find a Doctor</h3>
            </Link>
            <Link to={user ? '/patient-dashboard' : '/login'} className="card text-center">
              <i className="fas fa-procedures fa-2x quick-icon"></i>
              <h3>Patient Portal</h3>
              {!user && <small>Login Required</small>}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-column">
              <h3>MediCare Hospital</h3>
              <p>Providing exceptional healthcare services with compassion and excellence. Our state-of-the-art facilities and expert medical professionals are here to serve you.</p>
              <div className="contact-info">
                <i className="fas fa-map-marker-alt"></i>
                <p>45 Healthway Boulevard<br />Central Medical District<br />Mumbai, MH 400001</p>
              </div>
              <div className="contact-info">
                <i className="fas fa-phone-alt"></i>
                <p>Emergency: +91 22 4000 9111<br />Appointments: +91 22 4000 9222</p>
              </div>
              <div className="footer-social">
                <a href="#" className="social-icon" aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="social-icon" aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="social-icon" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="#" className="social-icon" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>

            <div className="footer-column">
              <h3>Quick Links</h3>
              <ul>
                <li><Link to="/"><i className="fas fa-chevron-right"></i> Home</Link></li>
                <li><Link to="/services"><i className="fas fa-chevron-right"></i> Our Services</Link></li>
                <li><Link to="/doctors"><i className="fas fa-chevron-right"></i> Find a Doctor</Link></li>
                <li><Link to="/book-appointment"><i className="fas fa-chevron-right"></i> Book Appointment</Link></li>
                <li><Link to="/patient-signup"><i className="fas fa-chevron-right"></i> Patient Registration</Link></li>
                <li><Link to="/billing"><i className="fas fa-chevron-right"></i> Billing & Insurance</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Our Services</h3>
              <ul>
                <li><Link to="/services#emergency"><i className="fas fa-chevron-right"></i> Emergency Care</Link></li>
                <li><Link to="/services#cardiology"><i className="fas fa-chevron-right"></i> Cardiology</Link></li>
                <li><Link to="/services#neurology"><i className="fas fa-chevron-right"></i> Neurology</Link></li>
                <li><Link to="/services#orthopedics"><i className="fas fa-chevron-right"></i> Orthopedics</Link></li>
                <li><Link to="/services#pediatrics"><i className="fas fa-chevron-right"></i> Pediatrics</Link></li>
                <li><Link to="/services#diagnostic"><i className="fas fa-chevron-right"></i> Diagnostic Services</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Opening Hours</h3>
              <ul>
                <li>
                  <div className="contact-info">
                    <i className="far fa-clock"></i>
                    <p><strong>Emergency Care</strong><br />24 Hours, All Days</p>
                  </div>
                </li>
                <li>
                  <div className="contact-info">
                    <i className="far fa-clock"></i>
                    <p><strong>OPD Timings</strong><br />Mon-Sat: 9:00 AM - 5:00 PM</p>
                  </div>
                </li>
                <li>
                  <div className="contact-info">
                    <i className="far fa-clock"></i>
                    <p><strong>Visiting Hours</strong><br />Daily: 8:00 AM - 8:00 PM</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p style={{ marginBottom: 4 }}>© {new Date().getFullYear()} MediCare Hospital — All Rights Reserved.</p>
            <small>Privacy Policy • Terms & Conditions • Patient Rights</small>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;