import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // Add useNavigate hook

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/'); // Redirect to home page after logout
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header>
      <div className="container">
        <nav>
          <Link to="/" className="logo" onClick={() => setIsMenuOpen(false)}>
            Medi<span>Care</span>
          </Link>

          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`fas fa-${isMenuOpen ? 'times' : 'bars'}`}></i>
          </button>

          <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <li>
              <Link 
                to="/" 
                className={isActive('/') ? 'active' : ''}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            
            {user ? (
              <>
                <li>
                  <Link 
                    to={
                      user.role === 'patient' ? '/patient-dashboard' :
                        user.role === 'doctor' ? '/doctor-dashboard' :
                        user.role === 'staff' ? '/dashboard' : '/dashboard'
                    }
                    className="active"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={handleLogout} // Use the new handleLogout function
                    className="btn btn-danger"
                  >
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link 
                    to="/login" 
                    className={isActive('/login') ? 'active' : ''}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/patient-signup" 
                    className={`btn ${isActive('/patient-signup') ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Patient Signup
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;