import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Film,
  ShoppingBag,
  History,
  Star,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Cpu,
  Sparkles,
  Menu,
  X,
  BarChart3,
} from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import AlgorithmTelemetryModal from './AlgorithmTelemetryModal';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAlgoModal, setShowAlgoModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(9, 12, 21, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '0 24px',
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
              }}
            >
              <Sparkles size={22} color="#ffffff" />
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '-0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>Cine</span>
                <span style={{ color: '#06b6d4' }}>Tech</span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#a5b4fc',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    fontWeight: 700,
                    marginLeft: '2px',
                  }}
                >
                  JAVA DSA
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Recommendation Engine
              </div>
            </div>
          </Link>

          {/* Central Global Search Bar */}
          <div style={{ flex: 1, maxWidth: '420px' }} className="hidden-mobile">
            <GlobalSearch />
          </div>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            className="hidden-mobile"
          >
            <Link
              to="/movies"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: isActive('/movies') ? '#f43f5e' : 'var(--text-secondary)',
                backgroundColor: isActive('/movies') ? 'rgba(244, 63, 94, 0.12)' : 'transparent',
                border: isActive('/movies') ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <Film size={17} />
              <span>Movies</span>
            </Link>

            <Link
              to="/products"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: isActive('/products') ? '#06b6d4' : 'var(--text-secondary)',
                backgroundColor: isActive('/products') ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                border: isActive('/products') ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <ShoppingBag size={17} />
              <span>Products</span>
            </Link>

            <Link
              to="/analytics"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: isActive('/analytics') ? '#818cf8' : 'var(--text-secondary)',
                backgroundColor: isActive('/analytics') ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                border: isActive('/analytics') ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <BarChart3 size={16} color="#818cf8" />
              <span>Analytics</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/history"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: isActive('/history') ? '#a855f7' : 'var(--text-secondary)',
                    backgroundColor: isActive('/history') ? 'rgba(168, 85, 247, 0.12)' : 'transparent',
                    border: isActive('/history') ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid transparent',
                  }}
                >
                  <History size={16} />
                  <span>History</span>
                </Link>

                <Link
                  to="/ratings"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: isActive('/ratings') ? '#f59e0b' : 'var(--text-secondary)',
                    backgroundColor: isActive('/ratings') ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                    border: isActive('/ratings') ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
                  }}
                >
                  <Star size={16} />
                  <span>Ratings</span>
                </Link>
              </>
            )}

            {/* Algorithm Live Telemetry Button */}
            <button
              onClick={() => setShowAlgoModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#34d399',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                cursor: 'pointer',
              }}
              title="Inspect the 8 Java Algorithms"
            >
              <Cpu size={15} />
              <span>Java Algorithms</span>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
            </button>
          </nav>

          {/* Right Action: Profile or Auth buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  to="/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'var(--gradient-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span>{user?.username}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-color)',
                  }}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  to="/login"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <LogIn size={15} />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                  style={{
                    fontSize: '0.88rem',
                    padding: '8px 18px',
                  }}
                >
                  <UserPlus size={15} />
                  <span>Register</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                padding: '8px',
                color: 'var(--text-primary)',
              }}
              className="mobile-toggle"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '16px 24px 24px',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <GlobalSearch onClose={() => setMobileMenuOpen(false)} />
            </div>
            <Link
              to="/movies"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#f43f5e', fontWeight: 600 }}
            >
              <Film size={18} /> Movies
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#06b6d4', fontWeight: 600 }}
            >
              <ShoppingBag size={18} /> Products
            </Link>
            <Link
              to="/analytics"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#818cf8', fontWeight: 600 }}
            >
              <BarChart3 size={18} /> Analytics & Insights
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#a855f7' }}
                >
                  <History size={18} /> History
                </Link>
                <Link
                  to="/ratings"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b' }}
                >
                  <Star size={18} /> Ratings
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}
                >
                  <User size={18} /> Profile
                </Link>
              </>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowAlgoModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#34d399',
                fontWeight: 600,
              }}
            >
              <Cpu size={16} /> Java Algorithms Telemetry
            </button>
          </div>
        )}
      </header>

      {/* Java DSA Status & Telemetry Modal */}
      {showAlgoModal && <AlgorithmTelemetryModal onClose={() => setShowAlgoModal(false)} />}
    </>
  );
};

export default Navbar;
