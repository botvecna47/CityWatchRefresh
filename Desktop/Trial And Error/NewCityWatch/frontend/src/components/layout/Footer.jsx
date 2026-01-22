import { Eye, MapPin, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* About */}
          <div className="footer-section">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <Eye size={24} className="footer-eye" />
                <MapPin size={12} className="footer-pin" />
              </div>
              <span className="footer-logo-text">CityWatch</span>
            </div>
            <p className="footer-about">
              A civic accountability platform for transparent reporting and tracking of public infrastructure issues.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/issues">Browse Issues</Link></li>
              <li><Link to="/report">Report Issue</Link></li>
              <li><Link to="/my-issues">My Reports</Link></li>
              <li><a href="#how-it-works">How It Works</a></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="footer-section">
            <h3>Legal</h3>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Community Guidelines</a></li>
              <li><a href="#">Data Protection</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div className="footer-section">
            <h3>Contact</h3>
            <ul className="contact-list">
              <li>
                <Mail size={16} />
                <span>support@citywatch.in</span>
              </li>
              <li>
                <Phone size={16} />
                <span>1800-XXX-XXXX</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2026 CityWatch. Built for civic transparency and accountability.</p>
        </div>
      </div>
    </footer>
  );
}
