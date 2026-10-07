import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Product, Rating } from '../types';
import ProductCard from '../components/ProductCard';
import { Star, ArrowLeft, Send, CheckCircle2, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Rating[]>([]);
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState<string>('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setRatingSuccess(false);

    Promise.all([
      api.getProductById(id),
      api.getSimilarProducts(id, 6),
      api.getItemRatings('PRODUCT', id),
    ])
      .then(([p, sim, r]) => {
        setProduct(p);
        setSimilarProducts(sim);
        setReviews(r);
        const myReview = r.find(rev => rev.userId === user?.id);
        if (myReview) {
          setUserRating(myReview.ratingValue);
          setUserComment(myReview.comment);
        }
      })
      .catch(err => console.error('Failed to load product details', err))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmittingRating(true);
    try {
      await api.rateItem('PRODUCT', id, userRating, userComment);
      setRatingSuccess(true);
      const updatedReviews = await api.getItemRatings('PRODUCT', id);
      setReviews(updatedReviews);
      setTimeout(() => setRatingSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to submit product rating', err);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '100px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading product and computing Java feature similarity vectors...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: '100px 24px', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Link to="/products" className="btn-primary" style={{ marginTop: '20px' }}>
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Back button */}
      <Link
        to="/products"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-secondary)',
          fontSize: '0.88rem',
          marginBottom: '24px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          padding: '6px 14px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Product Catalog</span>
      </Link>

      {/* Main Product Showcase Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(300px, 1.8fr)', gap: '40px', marginBottom: '60px' }}>
        {/* Left: Image Container */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          }}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '12px' }}
          />
        </div>

        {/* Right: Info & Purchase Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Brand & Category badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.brand}
            </span>
            <span>•</span>
            <span className="badge badge-product">{product.category}</span>
            <span style={{ fontSize: '0.75rem', color: '#67e8f9' }}>{product.subcategory}</span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, lineHeight: 1.2 }}>
            {product.name}
          </h1>

          {/* Price & Rating Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '16px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'var(--font-heading)' }}>
                ${product.price.toFixed(2)}
              </div>
            </div>

            <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer Rating</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 700, fontSize: '1.2rem', marginTop: '4px' }}>
                <Star size={20} fill="#fbbf24" color="#fbbf24" />
                <span>{product.rating.toFixed(1)}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  ({product.reviewCount.toLocaleString()} reviews)
                </span>
              </div>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1rem' }}>
            {product.description}
          </p>

          {/* Quick Perks */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={16} color="#06b6d4" />
              <span>Free Express Delivery</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#10b981" />
              <span>2-Year Official Manufacturer Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Technical Specs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Specs Table */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Technical Specifications</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {Object.entries(product.specs).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    {key}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Section */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Star size={20} color="#fbbf24" fill="#fbbf24" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Rate & Review This Product</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Your feedback is analyzed by the Java Recommendation Engine to refine product affinity vectors.
            </p>

            <form onSubmit={handleRatingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Your Rating:</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUserRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <Star
                        size={24}
                        color="#fbbf24"
                        fill={star <= userRating ? '#fbbf24' : 'transparent'}
                      />
                    </button>
                  ))}
                </div>
                <span style={{ fontWeight: 800, color: '#fbbf24', marginLeft: '6px' }}>{userRating}.0 / 5.0</span>
              </div>

              <input
                type="text"
                placeholder="Share details about performance, build quality, or usability..."
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(9, 12, 21, 0.7)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: '#fff',
                  outline: 'none',
                }}
              />

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}
                >
                  <Send size={15} />
                  <span>{submittingRating ? 'Calculating Java Vectors...' : 'Submit Rating & Recalculate'}</span>
                </button>

                {ratingSuccess && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#34d399', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <CheckCircle2 size={16} /> Saved! Personalization updated.
                    </span>
                    <Link
                      to="/"
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#67e8f9',
                        textDecoration: 'underline',
                        marginLeft: '4px',
                      }}
                    >
                      View Updated Home Recommendations →
                    </Link>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Community Reviews List */}
          {reviews.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
                Customer Reviews ({reviews.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviews.map(r => (
                  <div
                    key={r.id}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 700 }}>
                        <Star size={14} fill="#fbbf24" color="#fbbf24" />
                        <span>{r.ratingValue.toFixed(1)}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        User: {r.userId}
                      </span>
                    </div>
                    {r.comment && (
                      <p style={{ fontSize: '0.88rem', color: '#e2e8f0', margin: 0 }}>
                        "{r.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Java Similar Products */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={18} color="#06b6d4" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Similar Products</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Computed in Java using category, brand, and MinHash spec vectors.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {similarProducts.map(sim => (
              <ProductCard key={sim.id} product={sim} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
