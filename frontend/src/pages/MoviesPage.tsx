import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Movie, RecommendationItem, PipelineMetrics } from '../types';
import MovieCard from '../components/MovieCard';
import RecommendationCard from '../components/RecommendationCard';
import { Search, Film, Sparkles, X, Clock, Plus, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { searchHistoryUtil, type RecentSearchItem } from '../utils/searchHistory';

const ALL_POSSIBLE_GENRES = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
  'Drama', 'Family', 'Fantasy', 'History', 'Music', 'Mystery', 'Romance',
  'Sci-Fi', 'Thriller'
];

const MoviesPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<RecommendationItem[]>([]);
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState('trending');
  const [loading, setLoading] = useState(true);

  // Add Movie Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newMovie, setNewMovie] = useState({
    title: '',
    year: new Date().getFullYear(),
    genres: ['Sci-Fi', 'Action'],
    director: '',
    cast: '',
    rating: 4.8,
    overview: '',
    posterUrl: '',
    durationMinutes: 120,
    tags: '',
  });

  useEffect(() => {
    const q = searchParams.get('query') || '';
    if (q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    setRecentSearches(searchHistoryUtil.getRecentSearches().filter(s => s.itemType !== 'PRODUCT'));
  }, []);

  // Load genres and recommendations
  useEffect(() => {
    loadGenres();
    fetchRecs();

    const handleUpdate = () => {
      fetchRecs();
      loadMovies();
      loadGenres();
    };

    window.addEventListener('recommendations-updated', handleUpdate);
    return () => {
      window.removeEventListener('recommendations-updated', handleUpdate);
    };
  }, [isAuthenticated]);

  const loadGenres = () => {
    api.getMovieGenres().then(g => {
      if (g.length > 0) setGenres(g);
      else setGenres(ALL_POSSIBLE_GENRES);
    }).catch(() => setGenres(ALL_POSSIBLE_GENRES));
  };

  const fetchRecs = () => {
    api.getRecommendedMovies(6)
      .then(res => {
        setRecommendedMovies(res.recommendations);
        setMetrics(res.metrics);
      })
      .catch(() => {});
  };

  const loadMovies = async () => {
    setLoading(true);
    try {
      if (searchQuery.trim()) {
        searchHistoryUtil.addSearch(searchQuery.trim(), 'MOVIE');
      }
      const data = await api.getMovies({
        query: searchQuery,
        genre: selectedGenre === 'ALL' ? undefined : selectedGenre,
        minRating: minRating > 0 ? minRating : undefined,
        sortBy,
      });
      setMovies(data);
    } catch (err) {
      console.error('Failed to load movies', err);
    } finally {
      setLoading(false);
    }
  };

  // Load movies on filter/search change
  useEffect(() => {
    const debounceTimer = setTimeout(loadMovies, 250);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedGenre, minRating, sortBy]);

  const toggleGenreSelection = (genre: string) => {
    setNewMovie(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMovie.title.trim()) return;
    setIsSubmitting(true);
    try {
      const castList = newMovie.cast.split(',').map(s => s.trim()).filter(Boolean);
      const tagList = newMovie.tags.split(',').map(s => s.trim()).filter(Boolean);
      const poster = newMovie.posterUrl.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80';

      const saved = await api.createMovie({
        title: newMovie.title.trim(),
        year: Number(newMovie.year) || 2024,
        genres: newMovie.genres.length > 0 ? newMovie.genres : ['Drama'],
        director: newMovie.director.trim() || 'Director',
        cast: castList.length > 0 ? castList : ['Lead Actor'],
        rating: Number(newMovie.rating) || 4.5,
        voteCount: 1500,
        posterUrl: poster,
        backdropUrl: poster,
        overview: newMovie.overview.trim() || 'An intriguing film in the catalog.',
        durationMinutes: Number(newMovie.durationMinutes) || 120,
        trendingScore: 92.5,
        tags: tagList.length > 0 ? tagList : ['movie', 'cinema']
      });

      setMovies(prev => [saved, ...prev]);
      setShowAddModal(false);
      setSuccessMessage(`Movie "${saved.title}" successfully added to the engine!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      loadGenres();
      fetchRecs();

      // Reset form
      setNewMovie({
        title: '',
        year: new Date().getFullYear(),
        genres: ['Sci-Fi', 'Action'],
        director: '',
        cast: '',
        rating: 4.8,
        overview: '',
        posterUrl: '',
        durationMinutes: 120,
        tags: '',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to add movie');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Header with Add Movie Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f43f5e',
            }}
          >
            <Film size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>Movie Universe</h1>
            <div style={{ fontSize: '0.9rem', color: '#fda4af' }}>
              Explore curated cinema and personalized recommendations powered by Java DSA
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
            backgroundColor: '#f43f5e',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(244, 63, 94, 0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          <Plus size={18} />
          <span>+ Add Movie</span>
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
      {recommendedMovies.length > 0 && !searchQuery && selectedGenre === 'ALL' && (
        <div style={{ marginBottom: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#f43f5e" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                Top Recommendations For You
              </h2>
              <span className="badge badge-movie">Java Engine Live</span>
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
            {recommendedMovies.map((rec) => (
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
            placeholder="Search movies by title, director, or keywords (e.g. Inception, Nolan, Sci-Fi)..."
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
                <span>Recent Movie Searches</span>
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
                      backgroundColor: 'rgba(244, 63, 94, 0.12)',
                      border: '1px solid rgba(244, 63, 94, 0.25)',
                      color: '#fda4af',
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
          {/* Genre Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              onClick={() => setSelectedGenre('ALL')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: selectedGenre === 'ALL' ? '#f43f5e' : 'rgba(255, 255, 255, 0.05)',
                color: selectedGenre === 'ALL' ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
            >
              All Genres
            </button>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: selectedGenre === g ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedGenre === g ? '#fda4af' : 'var(--text-secondary)',
                  border: selectedGenre === g ? '1px solid #f43f5e' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                }}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Sort & Rating filters */}
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
              <option value="year">📅 Newest Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Searching cinema catalog with Levenshtein fuzzy distance...
        </div>
      ) : movies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <Film size={40} color="#64748b" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No movies found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '18px' }}>
            Try searching with a different term or add a new movie to the catalog.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '10px 18px',
              backgroundColor: '#f43f5e',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + Add Movie Now
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '24px',
          }}
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {/* Add Movie Modal */}
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
              border: '1px solid rgba(244, 63, 94, 0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Film size={22} color="#f43f5e" />
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Add New Movie to Engine</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateMovie} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Movie Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blade Runner 2099"
                  value={newMovie.title}
                  onChange={e => setNewMovie({ ...newMovie, title: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    Release Year
                  </label>
                  <input
                    type="number"
                    value={newMovie.year}
                    onChange={e => setNewMovie({ ...newMovie, year: Number(e.target.value) })}
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
                    Rating (1 - 5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newMovie.rating}
                    onChange={e => setNewMovie({ ...newMovie, rating: Number(e.target.value) })}
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
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    value={newMovie.durationMinutes}
                    onChange={e => setNewMovie({ ...newMovie, durationMinutes: Number(e.target.value) })}
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
                  Director
                </label>
                <input
                  type="text"
                  placeholder="e.g. Denis Villeneuve"
                  value={newMovie.director}
                  onChange={e => setNewMovie({ ...newMovie, director: e.target.value })}
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
                  Lead Cast (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Keanu Reeves, Ana de Armas, Ryan Gosling"
                  value={newMovie.cast}
                  onChange={e => setNewMovie({ ...newMovie, cast: e.target.value })}
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
                  Select Genres
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {ALL_POSSIBLE_GENRES.map(g => {
                    const active = newMovie.genres.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGenreSelection(g)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          backgroundColor: active ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                          color: active ? '#fda4af' : 'var(--text-secondary)',
                          border: active ? '1px solid #f43f5e' : '1px solid var(--border-color)',
                          cursor: 'pointer',
                        }}
                      >
                        {active ? `✓ ${g}` : `+ ${g}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Poster Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newMovie.posterUrl}
                  onChange={e => setNewMovie({ ...newMovie, posterUrl: e.target.value })}
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
                  Overview / Synopsis
                </label>
                <textarea
                  rows={3}
                  placeholder="Plot summary and movie storyline..."
                  value={newMovie.overview}
                  onChange={e => setNewMovie({ ...newMovie, overview: e.target.value })}
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
                  Tags / Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. cyberpunk, dystopian, ai, detective"
                  value={newMovie.tags}
                  onChange={e => setNewMovie({ ...newMovie, tags: e.target.value })}
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
                    backgroundColor: '#f43f5e',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)',
                  }}
                >
                  {isSubmitting ? 'Saving to Engine...' : 'Add Movie & Refresh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
