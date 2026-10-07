import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Product, RecommendationItem, PipelineMetrics } from '../types';
import ProductCard from '../components/ProductCard';
import RecommendationCard from '../components/RecommendationCard';
import { Search, ShoppingBag, Sparkles, X, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { searchHistoryUtil, type RecentSearchItem } from '../utils/searchHistory';

const ProductsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendationItem[]>([]);
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [sortBy, setSortBy] = useState('trending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = searchParams.get('query') || '';
    if (q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    setRecentSearches(searchHistoryUtil.getRecentSearches().filter(s => s.itemType !== 'MOVIE'));
  }, []);

  useEffect(() => {
    api.getProductCategories().then(c => setCategories(c)).catch(() => {});
    api.getRecommendedProducts(6)
      .then(res => {
        setRecommendedProducts(res.recommendations);
        setMetrics(res.metrics);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        if (searchQuery.trim()) {
          searchHistoryUtil.addSearch(searchQuery.trim(), 'PRODUCT');
        }
        const data = await api.getProducts({
          query: searchQuery,
          category: selectedCategory === 'ALL' ? undefined : selectedCategory,
          minRating: minRating > 0 ? minRating : undefined,
          maxPrice: maxPrice > 0 ? maxPrice : undefined,
          sortBy,
        });
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchProducts, 250);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory, minRating, maxPrice, sortBy]);

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#06b6d4',
            }}
          >
            <ShoppingBag size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>Product Catalog</h1>
            <div style={{ fontSize: '0.9rem', color: '#67e8f9' }}>
              Explore premium electronics, smart home, and tech powered by Java recommendation pipeline
            </div>
          </div>
        </div>
      </div>

      {/* Recommended for you section */}
      {recommendedProducts.length > 0 && !searchQuery && selectedCategory === 'ALL' && (
        <div style={{ marginBottom: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#06b6d4" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                Top Product Recommendations For You
              </h2>
              <span className="badge badge-product">Java Engine Live</span>
            </div>
            {metrics && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Processed in {metrics.totalExecutionTimeMs.toFixed(2)}ms
              </div>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {recommendedProducts.map((rec) => (
              <RecommendationCard key={rec.id} item={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '20px',
          marginBottom: '36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Search input with History Suggestion */}
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            color="#64748b"
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search products by name, brand, or category (e.g. Sony Headphones, Apple MacBook, OLED)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowRecentSearches(true)}
            onBlur={() => setTimeout(() => setShowRecentSearches(false), 200)}
            style={{
              width: '100%',
              padding: '14px 44px 14px 48px',
              backgroundColor: 'rgba(9, 12, 21, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchParams({});
              }}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          )}

          {/* Quick Recent Search History Dropdown */}
          {showRecentSearches && recentSearches.length > 0 && !searchQuery && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                padding: '10px 14px',
                zIndex: 40,
                boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} />
                <span>Recent Product Searches</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {recentSearches.slice(0, 6).map((item) => (
                  <button
                    key={item.query}
                    type="button"
                    onMouseDown={() => {
                      setSearchQuery(item.query);
                      setShowRecentSearches(false);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(6, 182, 212, 0.12)',
                      border: '1px solid rgba(6, 182, 212, 0.25)',
                      color: '#67e8f9',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    {item.query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filters Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          {/* Category Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              onClick={() => setSelectedCategory('ALL')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: selectedCategory === 'ALL' ? '#06b6d4' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategory === 'ALL' ? '#090c15' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: selectedCategory === c ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedCategory === c ? '#67e8f9' : 'var(--text-secondary)',
                  border: selectedCategory === c ? '1px solid #06b6d4' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Sort & Price filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Min Rating */}
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
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
              <option value={0}>All Ratings</option>
              <option value={4.0}>⭐ 4.0+ Stars</option>
              <option value={4.5}>⭐ 4.5+ Stars</option>
              <option value={4.8}>⭐ 4.8+ Stars</option>
            </select>

            {/* Max Price */}
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
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
              <option value={0}>Any Price</option>
              <option value={300}>Under $300</option>
              <option value={800}>Under $800</option>
              <option value={1500}>Under $1,500</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
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
              <option value="trending">🔥 Trending First</option>
              <option value="rating">⭐ Highest Rated</option>
              <option value="price_asc">💲 Price: Low to High</option>
              <option value="price_desc">💲 Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Searching products with Java string similarity algorithms...
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <ShoppingBag size={40} color="#64748b" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No products found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Try searching with different terms or adjusting your filters.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px',
          }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
