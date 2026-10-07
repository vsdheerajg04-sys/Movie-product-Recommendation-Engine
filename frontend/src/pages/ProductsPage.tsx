import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Product, RecommendationItem, PipelineMetrics } from '../types';
import ProductCard from '../components/ProductCard';
import RecommendationCard from '../components/RecommendationCard';
import { Search, ShoppingBag, Sparkles, X, Clock, Plus, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { searchHistoryUtil, type RecentSearchItem } from '../utils/searchHistory';

const ALL_POSSIBLE_CATEGORIES = [
  'Audio', 'Computing', 'Gaming', 'Mobile', 'Wearables', 'Photography', 'Smart Home', 'Electronics'
];

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

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category: 'Audio',
    subcategory: 'Headphones',
    price: 199.99,
    rating: 4.8,
    imageUrl: '',
    description: '',
    specs: 'Battery: 30 hours, Connectivity: Bluetooth 5.3',
    tags: '',
  });

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
    loadCategories();
    fetchRecs();

    const handleUpdate = () => {
      fetchRecs();
      loadProducts();
      loadCategories();
    };

    window.addEventListener('recommendations-updated', handleUpdate);
    return () => {
      window.removeEventListener('recommendations-updated', handleUpdate);
    };
  }, [isAuthenticated]);

  const loadCategories = () => {
    api.getProductCategories().then(c => {
      if (c.length > 0) setCategories(c);
      else setCategories(ALL_POSSIBLE_CATEGORIES);
    }).catch(() => setCategories(ALL_POSSIBLE_CATEGORIES));
  };

  const fetchRecs = () => {
    api.getRecommendedProducts(6)
      .then(res => {
        setRecommendedProducts(res.recommendations);
        setMetrics(res.metrics);
      })
      .catch(() => {});
  };

  const loadProducts = async () => {
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

  useEffect(() => {
    const debounceTimer = setTimeout(loadProducts, 250);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory, minRating, maxPrice, sortBy]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;
    setIsSubmitting(true);
    try {
      const tagList = newProduct.tags.split(',').map(s => s.trim()).filter(Boolean);
      const specsObj: Record<string, string> = {};
      newProduct.specs.split(',').forEach(item => {
        const parts = item.split(':');
        if (parts.length >= 2) {
          specsObj[parts[0].trim()] = parts.slice(1).join(':').trim();
        }
      });

      const image = newProduct.imageUrl.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

      const saved = await api.createProduct({
        name: newProduct.name.trim(),
        brand: newProduct.brand.trim() || 'TechBrand',
        category: newProduct.category || 'Electronics',
        subcategory: newProduct.subcategory.trim() || 'General',
        price: Number(newProduct.price) || 99.99,
        rating: Number(newProduct.rating) || 4.7,
        reviewCount: 450,
        imageUrl: image,
        description: newProduct.description.trim() || 'Premium quality tech device engineered for peak performance.',
        specs: Object.keys(specsObj).length > 0 ? specsObj : { Quality: 'Premium', Connectivity: 'Wireless' },
        trendingScore: 93.0,
        tags: tagList.length > 0 ? tagList : ['tech', 'gadget', 'product']
      });

      setProducts(prev => [saved, ...prev]);
      setShowAddModal(false);
      setSuccessMessage(`Product "${saved.name}" successfully added to the catalog!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      loadCategories();
      fetchRecs();

      // Reset form
      setNewProduct({
        name: '',
        brand: '',
        category: 'Audio',
        subcategory: 'Headphones',
        price: 199.99,
        rating: 4.8,
        imageUrl: '',
        description: '',
        specs: 'Battery: 30 hours, Connectivity: Bluetooth 5.3',
        tags: '',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Header with Add Product Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#06b6d4',
            }}
          >
            <ShoppingBag size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>Product Catalog</h1>
            <div style={{ fontSize: '0.9rem', color: '#67e8f9' }}>
              Explore premium electronics, smart home, and tech powered by Java recommendation pipeline
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#06b6d4',
            color: '#090c15',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(6, 182, 212, 0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          <Plus size={18} />
          <span>+ Add Product</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 18px',
            borderRadius: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#6ee7b7',
            marginBottom: '28px',
            fontSize: '0.92rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle size={20} color="#10b981" />
          <span>{successMessage}</span>
        </div>
      )}

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
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '18px' }}>
            Try searching with different terms or add a new product to the catalog.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '10px 18px',
              backgroundColor: '#06b6d4',
              color: '#090c15',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            + Add Product Now
          </button>
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              borderRadius: '20px',
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingBag size={22} color="#06b6d4" />
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Add New Product to Catalog</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony WH-1000XM6 Wireless Headphones"
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(9, 12, 21, 0.8)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    Brand
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sony, Apple, Logitech"
                    value={newProduct.brand}
                    onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'rgba(9, 12, 21, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#fff',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'rgba(9, 12, 21, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#fff',
                      outline: 'none',
                    }}
                  >
                    {ALL_POSSIBLE_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    Subcategory
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Headphones"
                    value={newProduct.subcategory}
                    onChange={e => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'rgba(9, 12, 21, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#fff',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'rgba(9, 12, 21, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#fff',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newProduct.rating}
                    onChange={e => setNewProduct({ ...newProduct, rating: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'rgba(9, 12, 21, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#fff',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newProduct.imageUrl}
                  onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(9, 12, 21, 0.8)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Key features, performance characteristics, and build highlights..."
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(9, 12, 21, 0.8)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Specifications (e.g. Key: Value, Key: Value)
                </label>
                <input
                  type="text"
                  placeholder="Battery: 30 hours, Connectivity: Bluetooth 5.3, Weight: 250g"
                  value={newProduct.specs}
                  onChange={e => setNewProduct({ ...newProduct, specs: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(9, 12, 21, 0.8)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Tags / Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. headphones, anc, audio, wireless"
                  value={newProduct.tags}
                  onChange={e => setNewProduct({ ...newProduct, tags: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(9, 12, 21, 0.8)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    color: '#cbd5e1',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 2,
                    padding: '12px',
                    backgroundColor: '#06b6d4',
                    border: 'none',
                    color: '#090c15',
                    borderRadius: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
                  }}
                >
                  {isSubmitting ? 'Saving to Catalog...' : 'Add Product & Refresh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
