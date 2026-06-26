import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Our Cars', path: '/cars' },
    { label: 'How to Book', path: '/#how-to-book' },
    { label: 'About Us', path: '/about' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 40 24" fill="none">
              <path d="M4 16L7 8h26l3 8H4z" fill="currentColor" opacity="0.2"/>
              <path d="M7 8L9.5 2h21L33 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <rect x="2" y="14" width="36" height="7" rx="3.5" stroke="currentColor" strokeWidth="2"/>
              <circle cx="10" cy="21" r="3" fill="currentColor"/>
              <circle cx="30" cy="21" r="3" fill="currentColor"/>
              <circle cx="10" cy="21" r="1.5" fill="var(--bg-dark)"/>
              <circle cx="30" cy="21" r="1.5" fill="var(--bg-dark)"/>
            </svg>
          </div>
          <span className="logo-text">Prime<span className="gradient-text">Carz</span></span>
        </Link>

        {/* Desktop Nav */}
        <ul className="navbar-links">
          {navLinks.map(link => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          {user ? (
            <div className="nav-user">
              {isAdmin && (
                <Link to="/admin" className="btn btn-ghost btn-sm">
                  Admin Panel
                </Link>
              )}
              <div className="nav-user-dropdown">
                <div className="nav-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="dropdown-menu">
                  <p className="dropdown-name">{user.name}</p>
                  <p className="dropdown-email">{user.email}</p>
                  <div className="dropdown-divider"/>
                  <Link to="/my-bookings" className="dropdown-item">My Bookings</Link>
                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  <div className="dropdown-divider"/>
                  <button onClick={handleLogout} className="dropdown-item dropdown-item-danger">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}

          {/* Mobile menu button */}
          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            <span className={`hamburger ${mobileOpen ? 'open' : ''}`}/>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mobile-menu-inner">
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} className="mobile-link">
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="mobile-auth">
                  <Link to="/login" className="btn btn-outline btn-full">Login</Link>
                  <Link to="/register" className="btn btn-primary btn-full">Sign Up</Link>
                </div>
              )}
              {user && (
                <button onClick={handleLogout} className="btn btn-outline btn-full">Logout</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
