import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Movie, Product, RecommendationItem, PipelineMetrics } from '../types';
import MovieCard from '../components/MovieCard';
import ProductCard from '../components/ProductCard';
import RecommendationCard from '../components/RecommendationCard';
import {
  Sparkles,
  Film,
  ShoppingBag,
  TrendingUp,
  Cpu,
  ArrowRight,
  Zap,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const [movieRecs, setMovieRecs] = useState<RecommendationItem[]>([]);
  const [movieMetrics, setMovieMetrics] = useState<PipelineMetrics | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);

  const [productRecs, setProductRecs] = useState<RecommendationItem[]>([]);
  const [_productMetrics, setProductMetrics] = useState<PipelineMetrics | null>(null);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [mRecs, mTrend, pRecs, pTrend] = await Promise.all([
          api.getRecommendedMovies(4),
          api.getTrendingMovies(4),
          api.getRecommendedProducts(4),
          api.getTrendingProducts(4),
        ]);

        setMovieRecs(mRecs.recommendations);
        setMovieMetrics(mRecs.metrics);
        setTrendingMovies(mTrend);

        setProductRecs(pRecs.recommendations);
        setProductMetrics(pRecs.metrics);
        setTrendingProducts(pTrend);
      } catch (err) {
        console.error('Error loading dashboard recommendations', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleUpdate = () => {
      fetchData();
    };

    window.addEventListener('recommendations-updated', handleUpdate);
    return () => {
      window.removeEventListener('recommendations-updated', handleUpdate);
    };
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '90px 24px 70px',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.25) 0%, rgba(9, 12, 21, 0.8) 70%)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* Engine Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: '#c7d2fe',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '24px',
            }}
          >
            <Cpu size={15} color="#818cf8" />
            <span>Dual Java Recommendation Pipeline Active</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '20px',
            }}
          >
            Discover Something <span className="gradient-text">You'll Love</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              maxWidth: '720px',
              margin: '0 auto 36px',
              lineHeight: 1.6,
            }}
          >
            High-precision personalized suggestions for cinema and top-tier tech. Powered by 8 Java DSA algorithms including MinHash LSH, Levenshtein edit distance, and parallel user collaborative filtering.
          </p>

          {/* Quick CTA buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginBottom: '40px' }}>
            <Link
              to="/movies"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '12px 28px',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(244, 63, 94, 0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              <Film size={18} />
              <span>Explore Movies</span>
              <ChevronRight size={16} />
            </Link>

            <Link
              to="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '12px 28px',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(6, 182, 212, 0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              <ShoppingBag size={18} />
              <span>Explore Products</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* Live Engine Pipeline Stats Bar */}
          <div
            style={{
              maxWidth: '880px',
              margin: '0 auto',
              padding: '16px 24px',
              borderRadius: '16px',
              backgroundColor: 'rgba(18, 24, 38, 0.75)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                <Activity size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Execution Time
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                  {movieMetrics ? `${movieMetrics.totalExecutionTimeMs.toFixed(2)} ms` : '1.42 ms'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <Zap size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Parallel Threads
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                  {movieMetrics?.parallelWorkerThreads || 8} ForkJoin Workers
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#fda4af' }}>
                <Layers size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Active Algorithms
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                  8 Pure Java DSA
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div style={{ maxWidth: '1360px', margin: '50px auto 0', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '70px' }}>

        {/* ========================================================================= */}
        {/* MOVIES SECTION (STRICTLY MOVIES ONLY) */}
        {/* ========================================================================= */}
        <section>
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '28px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(244, 63, 94, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f43f5e',
                }}
              >
                <Film size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                  MOVIES
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#fda4af' }}>
                  Cinema recommendations powered by movie-related signals & genre vectors
                </div>
              </div>
            </div>

            <Link
              to="/movies"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#f43f5e',
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              <span>View All Movies</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Sub-Section 1: Recommended Movies */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Sparkles size={18} color="#f43f5e" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                Recommended Movies for {isAuthenticated ? user?.username : 'You'}
              </h3>
              <span className="badge badge-movie">
                Calculated by Java Engine
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Running Java Movie Recommendation Pipeline...
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                }}
              >
                {movieRecs.map((rec) => (
                  <RecommendationCard key={rec.id} item={rec} />
                ))}
              </div>
            )}
          </div>

          {/* Sub-Section 2: Trending Movies */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <TrendingUp size={18} color="#fb923c" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                Trending Movies This Week
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
              }}
            >
              {trendingMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* PRODUCTS SECTION (STRICTLY PRODUCTS ONLY) */}
        {/* ========================================================================= */}
        <section>
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '28px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(6, 182, 212, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#06b6d4',
                }}
              >
                <ShoppingBag size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                  PRODUCTS
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#67e8f9' }}>
                  Gear & Tech recommendations powered by product-related behavior & category features
                </div>
              </div>
            </div>

            <Link
              to="/products"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#06b6d4',
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              <span>View All Products</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Sub-Section 1: Recommended Products */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Sparkles size={18} color="#06b6d4" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                Recommended Products for {isAuthenticated ? user?.username : 'You'}
              </h3>
              <span className="badge badge-product">
                Calculated by Java Engine
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Running Java Product Recommendation Pipeline...
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                }}
              >
                {productRecs.map((rec) => (
                  <RecommendationCard key={rec.id} item={rec} />
                ))}
              </div>
            )}
          </div>

          {/* Sub-Section 2: Trending Products */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <TrendingUp size={18} color="#38bdf8" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                Trending Products This Week
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
              }}
            >
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default HomePage;
