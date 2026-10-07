import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Film, ShoppingBag, History, X, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import { searchHistoryUtil, type RecentSearchItem } from '../utils/searchHistory';
import type { Movie, Product } from '../types';

interface GlobalSearchProps {
  onClose?: () => void;
  isModal?: boolean;
}

const POPULAR_SEARCHES = [
  { text: 'Inception', type: 'MOVIE' as const },
  { text: 'Christopher Nolan', type: 'MOVIE' as const },
  { text: 'Noise Cancelling Headphones', type: 'PRODUCT' as const },
  { text: 'Dune: Part Two', type: 'MOVIE' as const },
  { text: 'Sony 4K OLED', type: 'PRODUCT' as const },
  { text: 'Sci-Fi Action', type: 'MOVIE' as const },
];

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onClose, isModal = false }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [movieResults, setMovieResults] = useState<Movie[]>([]);
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load and subscribe to search history
  useEffect(() => {
    setRecentSearches(searchHistoryUtil.getRecentSearches());

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<RecentSearchItem[]>;
      if (customEvent.detail) {
        setRecentSearches(customEvent.detail);
      } else {
        setRecentSearches(searchHistoryUtil.getRecentSearches());
      }
    };

    window.addEventListener('search-history-updated', handleUpdate);
    return () => {
      window.removeEventListener('search-history-updated', handleUpdate);
    };
  }, []);

  // Global hotkey Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsFocused(false);
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Click outside to close dropdown if not modal
  useEffect(() => {
    if (isModal) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModal]);

  // Debounced search fetching
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setMovieResults([]);
      setProductResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const [movies, products] = await Promise.all([
          api.getMovies({ query: trimmed }).catch(() => []),
          api.getProducts({ query: trimmed }).catch(() => []),
        ]);
        setMovieResults(movies.slice(0, 4));
        setProductResults(products.slice(0, 4));
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const executeSearch = (searchQuery: string, category: 'ALL' | 'MOVIE' | 'PRODUCT' = 'ALL') => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    searchHistoryUtil.addSearch(trimmed, category);
    setIsFocused(false);
    onClose?.();

    if (category === 'MOVIE') {
      navigate(`/movies?query=${encodeURIComponent(trimmed)}`);
    } else if (category === 'PRODUCT') {
      navigate(`/products?query=${encodeURIComponent(trimmed)}`);
    } else {
      // Default: if movie results match better or general query
      navigate(`/movies?query=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch(query);
    }
  };

  const handleSelectMovie = (movie: Movie) => {
    searchHistoryUtil.addSearch(movie.title, 'MOVIE');
    setIsFocused(false);
    onClose?.();
    navigate(`/movies/${movie.id}`);
  };

  const handleSelectProduct = (product: Product) => {
    searchHistoryUtil.addSearch(product.name, 'PRODUCT');
    setIsFocused(false);
    onClose?.();
    navigate(`/products/${product.id}`);
  };

  const handleRemoveHistoryItem = (e: React.MouseEvent, q: string) => {
    e.stopPropagation();
    searchHistoryUtil.removeSearch(q);
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    searchHistoryUtil.clearAll();
  };

  const showDropdown = isFocused || (isModal && true);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: isModal ? '640px' : '360px',
      }}
    >
      {/* Search Input Bar */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: isFocused ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.05)',
          border: isFocused ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '0 12px',
          boxShadow: isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.25), 0 8px 24px rgba(0,0,0,0.5)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <Search size={17} color={isFocused ? '#818cf8' : 'var(--text-muted)'} style={{ flexShrink: 0, marginRight: '8px' }} />
        
        <input
          ref={inputRef}
          type="text"
          placeholder="Search movies, tech & gear..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            height: isModal ? '48px' : '38px',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: isModal ? '1rem' : '0.88rem',
          }}
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={15} />
          </button>
        )}

        {!query && !isModal && (
          <div
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              padding: '2px 6px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              pointerEvents: 'none',
              fontFamily: 'var(--font-mono)',
              flexShrink: 0,
              marginLeft: '6px',
            }}
          >
            Ctrl K
          </div>
        )}
      </div>

      {/* Dropdown Menu (Search History + Live Results) */}
      {showDropdown && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            backgroundColor: '#0d1322',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '14px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            zIndex: 100,
            maxHeight: '480px',
            overflowY: 'auto',
            padding: '16px',
          }}
        >
          {/* STATE 1: Empty Query -> Show Search History & Popular Suggestions */}
          {!query.trim() && (
            <div>
              {/* Search History */}
              {recentSearches.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <History size={13} color="#a855f7" />
                      <span>Recent Search History</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#f87171',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        padding: '2px 6px',
                      }}
                    >
                      Clear All
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {recentSearches.map((item) => (
                      <div
                        key={item.query}
                        onClick={() => executeSearch(item.query, item.itemType)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.12)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={14} color="var(--text-muted)" />
                          <span style={{ fontSize: '0.88rem', color: '#f8fafc' }}>{item.query}</span>
                          {item.itemType && item.itemType !== 'ALL' && (
                            <span className={item.itemType === 'MOVIE' ? 'badge badge-movie' : 'badge badge-product'} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                              {item.itemType}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveHistoryItem(e, item.query)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Remove from history"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  <TrendingUp size={13} color="#38bdf8" />
                  <span>Popular Trending Searches</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {POPULAR_SEARCHES.map((pop) => (
                    <button
                      key={pop.text}
                      type="button"
                      onClick={() => executeSearch(pop.text, pop.type)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.2)';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      {pop.type === 'MOVIE' ? <Film size={12} color="#f43f5e" /> : <ShoppingBag size={12} color="#06b6d4" />}
                      <span>{pop.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: Query Active -> Show Live Search Results */}
          {query.trim() && (
            <div>
              {loading ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Searching catalog with Levenshtein fuzzy distance...
                </div>
              ) : movieResults.length === 0 && productResults.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>
                    No exact matches for "{query}"
                  </div>
                  <button
                    type="button"
                    onClick={() => executeSearch(query)}
                    className="btn-primary"
                    style={{ fontSize: '0.82rem', padding: '6px 16px' }}
                  >
                    Search all categories for "{query}"
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Matching Movies */}
                  {movieResults.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid rgba(244, 63, 94, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f43f5e', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          <Film size={14} />
                          <span>Matching Movies ({movieResults.length})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => executeSearch(query, 'MOVIE')}
                          style={{ background: 'none', border: 'none', color: '#fda4af', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span>See all</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {movieResults.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => handleSelectMovie(m)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(255, 255, 255, 0.03)',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.15)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
                          >
                            <img
                              src={m.posterUrl}
                              alt={m.title}
                              style={{ width: '32px', height: '46px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {m.title}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {m.year} • {m.genres.slice(0, 2).join(', ')} • ⭐ {m.rating.toFixed(1)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Products */}
                  {productResults.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid rgba(6, 182, 212, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#06b6d4', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          <ShoppingBag size={14} />
                          <span>Matching Products ({productResults.length})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => executeSearch(query, 'PRODUCT')}
                          style={{ background: 'none', border: 'none', color: '#67e8f9', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span>See all</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {productResults.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleSelectProduct(p)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(255, 255, 255, 0.03)',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.15)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
                          >
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '4px', backgroundColor: '#fff', padding: '2px' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {p.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                                ${p.price.toFixed(2)} • {p.brand} • {p.category}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submit Full Search Button */}
                  <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => executeSearch(query, 'MOVIE')}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(244, 63, 94, 0.12)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        color: '#fda4af',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Search Movies for "{query}"
                    </button>
                    <button
                      type="button"
                      onClick={() => executeSearch(query, 'PRODUCT')}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(6, 182, 212, 0.12)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        color: '#67e8f9',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Search Products for "{query}"
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
