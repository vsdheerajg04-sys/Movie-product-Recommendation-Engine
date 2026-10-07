import React from 'react';
import { Link } from 'react-router-dom';
import type { Movie } from '../types';
import { Star, Film, Sparkles } from 'lucide-react';

interface Props {
  movie: Movie;
  showRank?: boolean;
}

const MovieCard: React.FC<Props> = ({ movie, showRank = false }) => {
  return (
    <Link
      to={`/movies/${movie.id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        textDecoration: 'none',
        color: 'inherit',
      }}
      className="movie-card-hover"
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 16px 32px rgba(244, 63, 94, 0.2)';
        e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.4)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      {/* Rank Badge */}
      {showRank && movie.rank && (
        <div className="badge-rank">
          #{movie.rank}
        </div>
      )}

      {/* Poster Image */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '140%', backgroundColor: '#05070d', overflow: 'hidden' }}>
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
        />

        {/* Poster overlay gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(9, 12, 21, 0.1) 0%, rgba(9, 12, 21, 0.9) 100%)',
          }}
        />

        {/* Movie Score Pill (if recommendation score present) */}
        {movie.score !== undefined && movie.score > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              backgroundColor: 'rgba(9, 12, 21, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(244, 63, 94, 0.5)',
              borderRadius: '20px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              color: '#fda4af',
              fontSize: '0.8rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Sparkles size={12} color="#f43f5e" />
            <span>{Math.round(movie.score)}% match</span>
          </div>
        )}

        {/* Year tag */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'rgba(9, 12, 21, 0.75)',
            backdropFilter: 'blur(6px)',
            borderRadius: '6px',
            padding: '2px 8px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          {movie.year}
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            lineHeight: 1.3,
            color: '#f8fafc',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={movie.title}
        >
          {movie.title}
        </h3>

        {/* Genres */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {movie.genres.slice(0, 3).map((g) => (
            <span
              key={g}
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                color: '#fca5a5',
                border: '1px solid rgba(244, 63, 94, 0.2)',
              }}
            >
              {g}
            </span>
          ))}
        </div>

        {/* Match Reason (if recommendation present) */}
        {movie.matchReason && (
          <p
            style={{
              fontSize: '0.78rem',
              color: '#cbd5e1',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              padding: '6px 8px',
              borderRadius: '6px',
              lineHeight: 1.4,
              borderLeft: '2px solid #f43f5e',
            }}
          >
            {movie.matchReason}
          </p>
        )}

        {/* Footer info: Rating & Director */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: 700 }}>
            <Star size={14} fill="#fbbf24" color="#fbbf24" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <Film size={12} />
            <span>{movie.director}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
