import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { AnalyticsOverviewResponse } from '../types';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Film,
  ShoppingBag,
  Star,
  Activity,
  Zap,
  RefreshCw,
  Clock,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AnalyticsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<AnalyticsOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await api.getAnalyticsOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics overview', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading || !data) {
    return (
      <div style={{ padding: '120px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Activity size={36} className="animate-spin" style={{ margin: '0 auto 16px', color: '#6366f1' }} />
        <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '8px' }}>Aggregating Platform Intelligence...</h2>
        <p style={{ fontSize: '0.9rem' }}>Analyzing Java in-memory vectors, collaborative ratings, and signal telemetry.</p>
      </div>
    );
  }

  const maxGenreCount = Math.max(...Object.values(data.movieGenreDistribution), 1);
  const maxCategoryCount = Math.max(...Object.values(data.productCategoryDistribution), 1);
  const maxRatingCount = Math.max(...Object.values(data.ratingHistogram), 1);

  return (
    <div style={{ maxWidth: '1360px', margin: '40px auto 80px', padding: '0 24px' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '36px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)',
            }}
          >
            <BarChart3 size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
                Platform Analytics & Engine Insights
              </h1>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                <CheckCircle2 size={13} />
                <span>{data.systemHealth}</span>
              </span>
            </div>
            <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
              Real-time telemetry, candidate vector distributions, and Java DSA computational benchmarks
            </div>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="btn-secondary"
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '0.9rem' }}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing Telemetry...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* 1. Core Platform Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        {/* Total Movies */}
        <div className="glass-panel" style={{ padding: '22px', borderLeft: '4px solid #f43f5e' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Movie Universe
            </span>
            <Film size={18} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'var(--font-heading)' }}>
            {data.totalMovies} Movies
          </div>
          <div style={{ fontSize: '0.82rem', color: '#fda4af', marginTop: '4px' }}>
            Avg Rating: ⭐ {data.avgMovieRating.toFixed(1)} / 5.0
          </div>
        </div>

        {/* Total Products */}
        <div className="glass-panel" style={{ padding: '22px', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Product Catalog
            </span>
            <ShoppingBag size={18} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'var(--font-heading)' }}>
            {data.totalProducts} Products
          </div>
          <div style={{ fontSize: '0.82rem', color: '#67e8f9', marginTop: '4px' }}>
            Avg Price: ${data.avgProductPrice.toFixed(2)} • ⭐ {data.avgProductRating.toFixed(1)}
          </div>
        </div>

        {/* Total Community Ratings */}
        <div className="glass-panel" style={{ padding: '22px', borderLeft: '4px solid #fbbf24' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Collaborative Vectors
            </span>
            <Star size={18} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'var(--font-heading)' }}>
            {data.totalRatings} Ratings
          </div>
          <div style={{ fontSize: '0.82rem', color: '#fde68a', marginTop: '4px' }}>
            Feeds Pearson & Cosine User Similarity
          </div>
        </div>

        {/* Engine Parallelism */}
        <div className="glass-panel" style={{ padding: '22px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Parallel Workers
            </span>
            <Zap size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'var(--font-heading)' }}>
            {data.parallelWorkerThreads} Threads
          </div>
          <div style={{ fontSize: '0.82rem', color: '#6ee7b7', marginTop: '4px' }}>
            Java ForkJoinPool active workers
          </div>
        </div>
      </div>

      {/* 2. Personalized Taste & Affinity Insights Section */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '40px', background: 'radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0.7) 70%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <Compass size={22} color="#818cf8" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            User Taste Profile & Behavioral Vector Insights
          </h2>
          <span className="badge badge-movie">
            {isAuthenticated ? user?.username : 'Guest Session Active'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Movie Affinity */}
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
              <Film size={15} />
              <span>Primary Movie Genre Affinity</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>
              {data.userInsights?.topAffinityGenre || 'Sci-Fi / Cinematic Action'}
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              Computed via Jaccard token overlap on ratings and search history.
            </p>
          </div>

          {/* Product Affinity */}
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#06b6d4', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
              <ShoppingBag size={15} />
              <span>Primary Tech Category Affinity</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>
              {data.userInsights?.topAffinityCategory || 'Audio & Displays'}
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              Calculated using 64-signature MinHash LSH and collaborative preferences.
            </p>
          </div>

          {/* User Interaction Velocity */}
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
              <TrendingUp size={15} />
              <span>User Telemetry Signals</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>
              {data.userInsights?.totalInteractions || data.totalUserSignals} Interactions
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              Recorded search queries, item views, and real-time rating adjustments.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Catalog Distribution Visualizers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '30px', marginBottom: '40px' }}>
        {/* Movie Genre Distribution Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid rgba(244, 63, 94, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e', fontWeight: 800 }}>
              <Film size={18} />
              <span>Movie Genre Distribution</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{data.totalMovies} titles</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(data.movieGenreDistribution).map(([genre, count]) => {
              const pct = (count / maxGenreCount) * 100;
              return (
                <div key={genre}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>{genre}</span>
                    <span style={{ color: '#fda4af', fontWeight: 700 }}>{count} movies</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #f43f5e 0%, #fb923c 100%)',
                        borderRadius: '9999px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Category Distribution Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#06b6d4', fontWeight: 800 }}>
              <ShoppingBag size={18} />
              <span>Product Category Distribution</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{data.totalProducts} products</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(data.productCategoryDistribution).map(([cat, count]) => {
              const pct = (count / maxCategoryCount) * 100;
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>{cat}</span>
                    <span style={{ color: '#67e8f9', fontWeight: 700 }}>{count} items</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)',
                        borderRadius: '9999px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Rating Histogram & Community Score Distribution */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid rgba(251, 191, 36, 0.2)' }}>
          <Star size={18} color="#fbbf24" fill="#fbbf24" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
            Community Rating Distribution Histogram
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', textAlign: 'center' }}>
          {Object.entries(data.ratingHistogram).map(([starLabel, count]) => {
            const heightPct = Math.max(15, (count / maxRatingCount) * 100);
            return (
              <div
                key={starLabel}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: '150px',
                }}
              >
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24', marginBottom: '8px' }}>
                  {count}
                </div>
                <div style={{ width: '40px', height: `${heightPct}%`, backgroundColor: 'rgba(251, 191, 36, 0.25)', border: '1px solid #fbbf24', borderRadius: '6px 6px 0 0', marginBottom: '8px' }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {starLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Java DSA Engine Benchmark & Architecture Telemetry */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Cpu size={22} color="#34d399" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            The 8 Pure Java Recommendation Algorithms: Benchmarks & Complexity
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
          Executed entirely inside the Java 21 Spring Boot JVM backend using ForkJoin multi-core parallelism.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {data.algorithmBenchmarks.map((algo, index) => (
            <div
              key={algo.name}
              className="glass-panel"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                borderLeft: '4px solid #34d399',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase' }}>
                    Algorithm #{index + 1}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: '#c7d2fe' }}>
                    {algo.complexity}
                  </span>
                </div>

                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                  {algo.name}
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {algo.role}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Avg Benchmark:</span>
                <span style={{ color: '#34d399', fontWeight: 700, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  {algo.avgLatencyUs} µs
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
