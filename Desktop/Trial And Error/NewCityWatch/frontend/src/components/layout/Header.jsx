import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, MapPin, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../common/Button';
import './Header.css';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-icon">
            <Eye size={32} className="logo-eye" />
            <MapPin size={16} className="logo-pin" />
          </div>
          <div className="logo-text">
            <span className="logo-name">CityWatch</span>
            <span className="logo-tagline">Report Civic Issues. Track Real Progress.</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          <Link 
            to="/issues" 
            className={`nav-link ${isActive('/issues') ? 'nav-link-active' : ''}`}
          >
            Issues
          </Link>
          {isAuthenticated && (
            <Link 
              to="/my-issues" 
              className={`nav-link ${isActive('/my-issues') ? 'nav-link-active' : ''}`}
            >
              My Reports
            </Link>
          )}
          {(user?.role === 'MODERATOR' || user?.role === 'CITY_ADMIN' || user?.role === 'SUPER_ADMIN') && (
            <Link 
              to="/moderation" 
              className={`nav-link ${isActive('/moderation') ? 'nav-link-active' : ''}`}
            >
              Moderation
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="header-actions">
          <Link to="/report" className="report-btn-desktop">
            <Button size="sm">Report Issue</Button>
          </Link>
          {isAuthenticated ? (
            <div className="user-menu">
              <button className="user-button">
                <span className="user-avatar">{user?.name?.[0] || 'U'}</span>
                <span className="user-name">{user?.name?.split(' ')[0]}</span>
              </button>
              <div className="user-dropdown">
                <Link to="/profile" className="dropdown-item">Profile</Link>
                <button className="dropdown-item" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="login-link">Login</Link>
          )}
          
          {/* Mobile menu toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="nav-mobile">
          <Link to="/issues" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Issues</Link>
          {isAuthenticated && (
            <Link to="/my-issues" className="nav-link" onClick={() => setMobileMenuOpen(false)}>My Reports</Link>
          )}
          <Link to="/report" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Report Issue</Link>
          {!isAuthenticated && (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
