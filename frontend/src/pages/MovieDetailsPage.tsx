import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Movie, Rating } from '../types';
import MovieCard from '../components/MovieCard';
import { Star, Clock, Calendar, Film, ArrowLeft, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
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
      api.getMovieById(id),
      api.getSimilarMovies(id, 6),
      api.getItemRatings('MOVIE', id),
    ])
      .then(([m, sim, r]) => {
        setMovie(m);
        setSimilarMovies(sim);
        setReviews(r);
        const myReview = r.find(rev => rev.userId === user?.id);
        if (myReview) {
          setUserRating(myReview.ratingValue);
          setUserComment(myReview.comment);
        }
      })
      .catch(err => console.error('Failed to load movie details', err))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmittingRating(true);
    try {
      await api.rateItem('MOVIE', id, userRating, userComment);
      setRatingSuccess(true);
      // Refresh item ratings
      const updatedReviews = await api.getItemRatings('MOVIE', id);
      setReviews(updatedReviews);
      setTimeout(() => setRatingSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to submit rating', err);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '100px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading movie and computing Java item-item similarity vectors...
      </div>
    );
  }

  if (!movie) {
    return (
      <div style={{ padding: '100px 24px', textAlign: 'center' }}>
        <h2>Movie not found</h2>
        <Link to="/movies" className="btn-primary" style={{ marginTop: '20px' }}>
          Back to Movies
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Backdrop Header */}
      <div
        style={{
          position: 'relative',
          minHeight: '420px',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '40px 24px',
          backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
        }}
      >
        {/* Dark cinematic gradient overlays */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(9, 12, 21, 0.4) 0%, rgba(9, 12, 21, 0.95) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at right, transparent 0%, #090c15 80%)',
          }}
        />

        <div style={{ maxWidth: '1360px', width: '100%', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <Link
            to="/movies"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-secondary)',
              fontSize: '0.88rem',
              marginBottom: '24px',
              backgroundColor: 'rgba(9, 12, 21, 0.6)',
              padding: '6px 14px',
              borderRadius: '8px',
              backdropFilter: 'blur(6px)',
              border: '1px solid var(--border-color)',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Cinema List</span>
          </Link>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-end' }}>
            {/* Poster Card */}
            <div
              style={{
                width: '180px',
                height: '260px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                flexShrink: 0,
              }}
            >
              <img src={movie.posterUrl} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Main Info */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {movie.genres.map(g => (
                  <span key={g} className="badge badge-movie">{g}</span>
                ))}
                <span style={{ fontSize: '0.8rem', color: '#fda4af', padding: '4px 10px', borderRadius: '9999px', backgroundColor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                  🔥 Trending #{Math.round(100 - movie.trendingScore) + 1}
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '12px' }}>
                {movie.title}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 700 }}>
                  <Star size={18} fill="#fbbf24" color="#fbbf24" />
                  <span style={{ fontSize: '1.1rem' }}>{movie.rating.toFixed(1)}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({movie.voteCount.toLocaleString()} votes)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} />
                  <span>{movie.year}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} />
                  <span>{movie.durationMinutes} min</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Film size={16} />
                  <span>Director: <strong style={{ color: '#fff' }}>{movie.director}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div style={{ maxWidth: '1360px', margin: '40px auto 0', padding: '0 24px', display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '40px' }}>
        {/* Left Column: Synopsis, Cast, Ratings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Overview */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '12px' }}>Overview</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1rem' }}>
              {movie.overview}
            </p>
          </div>

          {/* Cast */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Key Cast</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {movie.cast.map(actor => (
                <div
                  key={actor}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#f8fafc',
                  }}
                >
                  {actor}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Rating & User Signals */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Star size={20} color="#fbbf24" fill="#fbbf24" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Rate This Movie</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Your rating feeds directly into the Java Pearson Collaborative Filtering and Jaccard vector algorithms to personalize future movie recommendations.
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
                placeholder="Add your thoughts or review comment..."
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
                  style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)' }}
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
                        color: '#fda4af',
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
                Community Ratings & Feedback ({reviews.length})
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
                        User ID: {r.userId}
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

        {/* Right Column: Java Similar Movies */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={18} color="#f43f5e" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Similar Movies</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Computed in Java using MinHash signature overlaps & cosine genre vectors.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {similarMovies.map(sim => (
              <MovieCard key={sim.id} movie={sim} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;
