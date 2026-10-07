import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { UserSignal } from '../types';
import {
  History,
  Trash2,
  Search,
  Eye,
  ArrowRight,
  Film,
  ShoppingBag,
  Filter,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { searchHistoryUtil } from '../utils/searchHistory';

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<UserSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'MOVIES' | 'PRODUCTS' | 'SPLIT'>('MOVIES');
  const [signalFilter, setSignalFilter] = useState<'ALL' | 'SEARCH' | 'VIEW'>('ALL');
  const [filterText, setFilterText] = useState('');

  const loadHistory = () => {
    setLoading(true);
    api.getUserHistory()
      .then(res => setHistory(res))
      .catch(err => console.error('Failed to load history', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const handleDelete = async (id: string) => {
    await api.deleteHistoryItem(id);
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCategory = async (type: 'MOVIE' | 'PRODUCT') => {
    const label = type === 'MOVIE' ? 'Movie' : 'Product';
    if (window.confirm(`Are you sure you want to clear your ${label} history?`)) {
      const toDelete = history.filter(s => s.itemType === type);
      await Promise.all(toDelete.map(s => api.deleteHistoryItem(s.id)));
      setHistory(prev => prev.filter(s => s.itemType !== type));
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      await api.clearUserHistory();
      searchHistoryUtil.clearAll();
      setHistory([]);
    }
  };

  const handleReRunSearch = (query: string, itemType?: string) => {
    if (!query) return;
    if (itemType === 'PRODUCT') {
      navigate(`/products?query=${encodeURIComponent(query)}`);
    } else {
      navigate(`/movies?query=${encodeURIComponent(query)}`);
    }
  };

  // Strictly segregated movie history
  const movieHistory = history.filter((sig) => {
    if (sig.itemType !== 'MOVIE') return false;
    if (signalFilter === 'SEARCH' && sig.signalType !== 'SEARCH') return false;
    if (signalFilter === 'VIEW' && sig.signalType !== 'VIEW') return false;
    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      const matchQuery = sig.query?.toLowerCase().includes(q);
      const matchTitle = (sig.metadata?.title || sig.metadata?.name || sig.itemId || '').toLowerCase().includes(q);
      return matchQuery || matchTitle;
    }
    return true;
  });

  // Strictly segregated product history
  const productHistory = history.filter((sig) => {
    if (sig.itemType !== 'PRODUCT') return false;
    if (signalFilter === 'SEARCH' && sig.signalType !== 'SEARCH') return false;
    if (signalFilter === 'VIEW' && sig.signalType !== 'VIEW') return false;
    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      const matchQuery = sig.query?.toLowerCase().includes(q);
      const matchTitle = (sig.metadata?.title || sig.metadata?.name || sig.itemId || '').toLowerCase().includes(q);
      return matchQuery || matchTitle;
    }
    return true;
  });

  const totalMovieCount = history.filter(s => s.itemType === 'MOVIE').length;
  const totalProductCount = history.filter(s => s.itemType === 'PRODUCT').length;

  const renderSignalCard = (sig: UserSignal) => {
    const isMovie = sig.itemType === 'MOVIE';
    const isSearch = sig.signalType === 'SEARCH';

    return (
      <div
        key={sig.id}
        className="glass-panel"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          borderLeft: `4px solid ${isMovie ? '#f43f5e' : '#06b6d4'}`,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: isSearch
                ? 'rgba(99, 102, 241, 0.15)'
                : isMovie
                ? 'rgba(244, 63, 94, 0.15)'
                : 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isSearch ? '#818cf8' : isMovie ? '#f43f5e' : '#06b6d4',
              flexShrink: 0,
            }}
          >
            {isSearch ? <Search size={18} /> : <Eye size={18} />}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <span className={isMovie ? 'badge badge-movie' : 'badge badge-product'} style={{ fontSize: '0.7rem' }}>
                {isMovie ? 'MOVIE' : 'PRODUCT'}
              </span>
              <span style={{ fontSize: '0.72rem', color: isSearch ? '#818cf8' : 'var(--text-muted)', fontWeight: 600 }}>
                {isSearch ? 'SEARCH QUERY' : 'VIEW SIGNAL'}
              </span>
              {sig.timestamp && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  • {new Date(sig.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isSearch ? (
                <span>Searched: <strong style={{ color: '#fff' }}>"{sig.query}"</strong></span>
              ) : (
                <span>Viewed: <strong style={{ color: '#fff' }}>{sig.metadata?.title || sig.metadata?.name || sig.itemId}</strong></span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {isSearch && sig.query && (
            <button
              onClick={() => handleReRunSearch(sig.query || '', sig.itemType)}
              className="btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: isMovie ? '#fda4af' : '#67e8f9',
                borderColor: isMovie ? 'rgba(244, 63, 94, 0.3)' : 'rgba(6, 182, 212, 0.3)',
              }}
            >
              <RotateCcw size={12} />
              <span>Search</span>
            </button>
          )}

          {!isSearch && sig.itemId && (
            <Link
              to={isMovie ? `/movies/${sig.itemId}` : `/products/${sig.itemId}`}
              className="btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: isMovie ? '#fda4af' : '#67e8f9',
                borderColor: isMovie ? 'rgba(244, 63, 94, 0.3)' : 'rgba(6, 182, 212, 0.3)',
              }}
            >
              <span>View</span>
              <ArrowRight size={12} />
            </Link>
          )}

          <button
            onClick={() => handleDelete(sig.id)}
            style={{
              padding: '7px',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
            }}
            title="Delete signal"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto 80px', padding: '0 24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a855f7',
              border: '1px solid rgba(168, 85, 247, 0.3)',
            }}
          >
            <History size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
              Activity & Search History
            </h1>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Separate movie and product interactions feeding independent Java recommendation pipelines
            </div>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="btn-secondary"
            style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '8px 16px', fontSize: '0.88rem' }}
          >
            <Trash2 size={16} />
            <span>Clear All History</span>
          </button>
        )}
      </div>

      {/* Primary Category Selector: Movies Only vs Products Only vs Split View */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
          padding: '16px 20px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Category Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={() => setActiveCategory('MOVIES')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: activeCategory === 'MOVIES' ? '1px solid #f43f5e' : '1px solid var(--border-color)',
              backgroundColor: activeCategory === 'MOVIES' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: activeCategory === 'MOVIES' ? '#fda4af' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <Film size={18} color="#f43f5e" />
            <span>Movies History Only ({totalMovieCount})</span>
          </button>

          <button
            onClick={() => setActiveCategory('PRODUCTS')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: activeCategory === 'PRODUCTS' ? '1px solid #06b6d4' : '1px solid var(--border-color)',
              backgroundColor: activeCategory === 'PRODUCTS' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: activeCategory === 'PRODUCTS' ? '#67e8f9' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <ShoppingBag size={18} color="#06b6d4" />
            <span>Products History Only ({totalProductCount})</span>
          </button>

          <button
            onClick={() => setActiveCategory('SPLIT')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeCategory === 'SPLIT' ? '1px solid #a855f7' : '1px solid var(--border-color)',
              backgroundColor: activeCategory === 'SPLIT' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: activeCategory === 'SPLIT' ? '#e9d5ff' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <Sparkles size={16} color="#a855f7" />
            <span>Side-by-Side Dual View</span>
          </button>
        </div>

        {/* Signal Sub-filters & Keyword Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={signalFilter}
            onChange={(e) => setSignalFilter(e.target.value as any)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(9, 12, 21, 0.8)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              fontSize: '0.82rem',
              outline: 'none',
            }}
          >
            <option value="ALL">All Signals</option>
            <option value="SEARCH">Searches Only</option>
            <option value="VIEW">Views Only</option>
          </select>

          <div style={{ position: 'relative', width: '200px' }}>
            <Filter size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Filter..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                backgroundColor: 'rgba(9, 12, 21, 0.8)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Retrieving user telemetry signals from Java backend...
        </div>
      ) : (
        <div>
          {/* VIEW 1: MOVIES ONLY */}
          {activeCategory === 'MOVIES' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid rgba(244, 63, 94, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Film size={20} color="#f43f5e" />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                    Movie Activity & Search History
                  </h2>
                  <span className="badge badge-movie">Strictly Movies</span>
                </div>
                {movieHistory.length > 0 && (
                  <button
                    onClick={() => handleClearCategory('MOVIE')}
                    style={{ background: 'none', border: 'none', color: '#fda4af', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={13} />
                    <span>Clear Movie History</span>
                  </button>
                )}
              </div>

              {movieHistory.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <Film size={36} color="#64748b" style={{ marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No Movie Activity Yet</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                    Search for movies or view cinema details to build your movie taste vector!
                  </p>
                  <Link to="/movies" className="btn-primary" style={{ background: 'var(--gradient-movie)', display: 'inline-flex' }}>
                    Explore Movies
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {movieHistory.map(renderSignalCard)}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: PRODUCTS ONLY */}
          {activeCategory === 'PRODUCTS' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid rgba(6, 182, 212, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={20} color="#06b6d4" />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                    Product Activity & Search History
                  </h2>
                  <span className="badge badge-product">Strictly Products</span>
                </div>
                {productHistory.length > 0 && (
                  <button
                    onClick={() => handleClearCategory('PRODUCT')}
                    style={{ background: 'none', border: 'none', color: '#67e8f9', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={13} />
                    <span>Clear Product History</span>
                  </button>
                )}
              </div>

              {productHistory.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <ShoppingBag size={36} color="#64748b" style={{ marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No Product Activity Yet</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                    Search for audio gear, laptops, and displays to train your product recommendation profile!
                  </p>
                  <Link to="/products" className="btn-primary" style={{ background: 'var(--gradient-product)', display: 'inline-flex' }}>
                    Explore Products
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {productHistory.map(renderSignalCard)}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: SPLIT DUAL VIEW */}
          {activeCategory === 'SPLIT' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '32px' }}>
              {/* Left Column: Movies */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid rgba(244, 63, 94, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Film size={18} color="#f43f5e" />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Movies History ({movieHistory.length})</h3>
                  </div>
                  {movieHistory.length > 0 && (
                    <button
                      onClick={() => handleClearCategory('MOVIE')}
                      style={{ background: 'none', border: 'none', color: '#fda4af', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {movieHistory.length === 0 ? (
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 16px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No movie activity recorded</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {movieHistory.map(renderSignalCard)}
                  </div>
                )}
              </div>

              {/* Right Column: Products */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid rgba(6, 182, 212, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingBag size={18} color="#06b6d4" />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Products History ({productHistory.length})</h3>
                  </div>
                  {productHistory.length > 0 && (
                    <button
                      onClick={() => handleClearCategory('PRODUCT')}
                      style={{ background: 'none', border: 'none', color: '#67e8f9', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {productHistory.length === 0 ? (
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 16px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No product activity recorded</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {productHistory.map(renderSignalCard)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
