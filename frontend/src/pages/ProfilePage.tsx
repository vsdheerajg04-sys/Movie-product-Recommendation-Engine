import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Star, History, Cpu, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [ratingsCount, setRatingsCount] = useState(0);
  const [signalsCount, setSignalsCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.getMyRatings().then(r => setRatingsCount(r.length)).catch(() => {});
    api.getUserHistory().then(h => setSignalsCount(h.length)).catch(() => {});
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <User size={48} color="#6366f1" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Sign In to View Your Profile</h2>
          <Link to="/login" className="btn-primary">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto 80px', padding: '0 24px' }}>
      {/* Profile Card Header */}
      <div
        className="glass-panel"
        style={{
          padding: '36px',
          marginBottom: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(18, 24, 38, 0.8) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 900,
              color: '#fff',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>
              {user?.username}
            </h1>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {user?.email}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#818cf8', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              User ID: {user?.id}
            </div>
          </div>
        </div>

        <button onClick={logout} className="btn-secondary" style={{ color: '#f87171' }}>
          Log Out
        </button>
      </div>

      {/* Activity Statistics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Star size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Ratings Recorded
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>
              {ratingsCount}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
            <History size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Telemetry Signals
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>
              {signalsCount}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Cpu size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Engine Status
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
              Active (8 Algos)
            </div>
          </div>
        </div>
      </div>

      {/* Java Algorithms Profiling Card */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={20} color="#f59e0b" />
          <span>Active Personalization Engine Parameters</span>
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px' }}>
          Your user profile is mapped onto high-dimensional vector spaces in the Java Spring Boot backend. Every time you view a product or rate a movie, the engine recalculates:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, color: '#f43f5e', fontSize: '0.95rem', marginBottom: '4px' }}>
              Movie Behavior Vector
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Analyzes movie ratings & genre overlaps. Strictly segregated from products.
            </div>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, color: '#06b6d4', fontSize: '0.95rem', marginBottom: '4px' }}>
              Product Behavior Vector
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Analyzes product searches, brand affinity, and price preferences.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
