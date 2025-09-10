import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    
    switch (user.role) {
      case 'admin':
        return '/admin';
      default:
        return '/dashboard';
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={() => setIsMenuOpen(false)}>
          <span className="logo-text">EduGlobal</span>
          <span className="logo-accent">BD</span>
        </Link>

        {/* Mobile menu button */}
        <div className="nav-toggle" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        {/* Navigation Menu */}
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          
          <Link to="/universities" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Universities
          </Link>
          
          <Link to="/scholarships" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Scholarships
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'student' && (
                <>
                  <Link 
                    to="/budget" 
                    className="nav-link budget-link" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    💰 Budget Planner
                  </Link>
                  <Link 
                    to="/deadlines" 
                    className="nav-link deadline-link" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    📅 Deadline Tracker
                  </Link>
                </>
              )}
              {user?.role === 'admin' ? (
                <Link 
                  to={getDashboardLink()} 
                  className="nav-link" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <Link 
                  to="/profile" 
                  className="nav-link" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              )}

              {/* Role-specific links */}
              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="nav-link admin-link" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}



              {/* Notifications for students */}
              {user?.role === 'student' && <NotificationDropdown />}

              {/* User info and logout */}
              <div className="nav-user">
                <span className="user-name">Hi, {user?.name}</span>
                <span className="user-role">({user?.role})</span>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="nav-link" 
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="nav-link signup-link" 
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;