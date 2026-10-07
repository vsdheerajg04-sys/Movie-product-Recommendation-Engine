import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Rating, Movie, Product } from '../types';
import { Star, Trash2, ArrowRight, Film, ShoppingBag, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RatingsPage: React.FC = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [moviesMap, setMoviesMap] = useState<Record<string, Movie>>({});
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [activeCategory, setActiveCategory] = useState<'MOVIES' | 'PRODUCTS' | 'SPLIT'>('MOVIES');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      api.getMyRatings(),
      api.getMovies(),
      api.getProducts(),
    ])
      .then(([rList, mList, pList]) => {
        setRatings(rList);
        const mMap: Record<string, Movie> = {};
        mList.forEach(m => { mMap[m.id] = m; });
        setMoviesMap(mMap);

        const pMap: Record<string, Product> = {};
        pList.forEach(p => { pMap[p.id] = p; });
        setProductsMap(pMap);
      })
      .catch(err => console.error('Failed to load ratings', err))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDeleteRating = async (id: string) => {
    await api.deleteRating(id);
    setRatings(prev => prev.filter(r => r.id !== id));
  };

  const movieRatings = ratings.filter(r => r.itemType === 'MOVIE');
  const productRatings = ratings.filter(r => r.itemType === 'PRODUCT');

  const renderRatingCard = (r: Rating) => {
    const isMovie = r.itemType === 'MOVIE';
    const movie = isMovie ? moviesMap[r.itemId] : null;
    const product = !isMovie ? productsMap[r.itemId] : null;
    const title = movie?.title || product?.name || `Item ${r.itemId}`;
    const image = movie?.posterUrl || product?.imageUrl;
    const route = isMovie ? `/movies/${r.itemId}` : `/products/${r.itemId}`;

    return (
      <div
        key={r.id}
        className="glass-panel"
        style={{
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          borderLeft: `4px solid ${isMovie ? '#f43f5e' : '#06b6d4'}`,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {image && (
            <Link to={route} style={{ width: '56px', height: isMovie ? '80px' : '56px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#fff' }}>
              <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: isMovie ? 'cover' : 'contain' }} />
            </Link>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className={isMovie ? 'badge badge-movie' : 'badge badge-product'}>
                {isMovie ? 'MOVIE' : 'PRODUCT'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#fbbf24', fontWeight: 800, fontSize: '0.9rem' }}>
                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                <span>{r.ratingValue.toFixed(1)} / 5.0</span>
              </div>
            </div>

            <Link to={route} style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
              {title}
            </Link>

            {r.comment && (
              <p style={{ color: '#cbd5e1', fontSize: '0.86rem', marginTop: '6px', fontStyle: 'italic', margin: '4px 0 0' }}>
                "{r.comment}"
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to={route}
            className="btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: isMovie ? '#fda4af' : '#67e8f9',
              borderColor: isMovie ? 'rgba(244, 63, 94, 0.3)' : 'rgba(6, 182, 212, 0.3)',
            }}
          >
            <span>View</span>
            <ArrowRight size={13} />
          </Link>

          <button
            onClick={() => handleDeleteRating(r.id)}
            style={{
              padding: '8px',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
            }}
            title="Remove Rating"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto 80px', padding: '0 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f59e0b',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <Star size={24} fill="#f59e0b" />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>Your Ratings & Reviews</h1>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Collaborative vector ratings analyzed by Java Pearson user-similarity engine
          </div>
        </div>
      </div>

      {/* Primary Category Selector */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '28px',
        }}
      >
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
          }}
        >
          <Film size={18} color="#f43f5e" />
          <span>Movie Ratings Only ({movieRatings.length})</span>
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
          }}
        >
          <ShoppingBag size={18} color="#06b6d4" />
          <span>Product Ratings Only ({productRatings.length})</span>
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
          }}
        >
          <Sparkles size={16} color="#a855f7" />
          <span>Side-by-Side Dual View</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Retrieving user ratings...
        </div>
      ) : (
        <div>
          {/* VIEW 1: MOVIE RATINGS ONLY */}
          {activeCategory === 'MOVIES' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid rgba(244, 63, 94, 0.2)' }}>
                <Film size={20} color="#f43f5e" />
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                  Movie Ratings
                </h2>
                <span className="badge badge-movie">Strictly Movies</span>
              </div>

              {movieRatings.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <Film size={36} color="#64748b" style={{ marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No Movie Ratings Yet</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                    Rate movies in the catalog to generate collaborative recommendations!
                  </p>
                  <Link to="/movies" className="btn-primary" style={{ background: 'var(--gradient-movie)', display: 'inline-flex' }}>
                    Rate Movies
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {movieRatings.map(renderRatingCard)}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: PRODUCT RATINGS ONLY */}
          {activeCategory === 'PRODUCTS' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid rgba(6, 182, 212, 0.2)' }}>
                <ShoppingBag size={20} color="#06b6d4" />
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                  Product Ratings
                </h2>
                <span className="badge badge-product">Strictly Products</span>
              </div>

              {productRatings.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <ShoppingBag size={36} color="#64748b" style={{ marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No Product Ratings Yet</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                    Rate tech and gear products to train collaborative affinity vectors!
                  </p>
                  <Link to="/products" className="btn-primary" style={{ background: 'var(--gradient-product)', display: 'inline-flex' }}>
                    Rate Products
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {productRatings.map(renderRatingCard)}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: SPLIT DUAL VIEW */}
          {activeCategory === 'SPLIT' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '32px' }}>
              {/* Left Column: Movie Ratings */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid rgba(244, 63, 94, 0.2)' }}>
                  <Film size={18} color="#f43f5e" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Movie Ratings ({movieRatings.length})</h3>
                </div>
                {movieRatings.length === 0 ? (
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 16px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No movie ratings submitted</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {movieRatings.map(renderRatingCard)}
                  </div>
                )}
              </div>

              {/* Right Column: Product Ratings */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid rgba(6, 182, 212, 0.2)' }}>
                  <ShoppingBag size={18} color="#06b6d4" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Product Ratings ({productRatings.length})</h3>
                </div>
                {productRatings.length === 0 ? (
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 16px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No product ratings submitted</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {productRatings.map(renderRatingCard)}
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

export default RatingsPage;
