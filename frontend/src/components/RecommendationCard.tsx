import React from 'react';
import { Link } from 'react-router-dom';
import type { RecommendationItem } from '../types';
import { Star, Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  item: RecommendationItem;
}

const RecommendationCard: React.FC<Props> = ({ item }) => {
  const isMovie = item.itemType === 'MOVIE';
  const accentColor = isMovie ? '#f43f5e' : '#06b6d4';
  const route = isMovie ? `/movies/${item.id}` : `/products/${item.id}`;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      className="rec-card"
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 14px 28px ${isMovie ? 'rgba(244, 63, 94, 0.18)' : 'rgba(6, 182, 212, 0.18)'}`;
        e.currentTarget.style.borderColor = accentColor;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      {/* Top Banner: Rank & Score */}
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isMovie
            ? 'linear-gradient(90deg, rgba(244, 63, 94, 0.15) 0%, rgba(15, 20, 35, 0.4) 100%)'
            : 'linear-gradient(90deg, rgba(6, 182, 212, 0.15) 0%, rgba(15, 20, 35, 0.4) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 900,
              color: '#fbbf24',
              fontFamily: 'var(--font-heading)',
            }}
          >
            #{item.rank}
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: isMovie ? 'rgba(244, 63, 94, 0.2)' : 'rgba(6, 182, 212, 0.2)',
              color: isMovie ? '#fda4af' : '#67e8f9',
              textTransform: 'uppercase',
            }}
          >
            {item.itemType}
          </span>
        </div>

        {/* Score Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: 'rgba(9, 12, 21, 0.8)',
            padding: '4px 10px',
            borderRadius: '20px',
            border: `1px solid ${accentColor}`,
            fontSize: '0.85rem',
            fontWeight: 800,
            color: '#fff',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Sparkles size={13} color={accentColor} />
          <span>Score: {Math.round(item.score)}%</span>
        </div>
      </div>

      {/* Main Card Body */}
      <div style={{ display: 'flex', padding: '16px', gap: '16px' }}>
        {/* Thumbnail Image */}
        <Link to={route} style={{ flexShrink: 0, width: '100px', height: isMovie ? '140px' : '100px', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
          <img
            src={item.imageUrl}
            alt={item.titleOrName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Link>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, justifyContent: 'space-between' }}>
          <div>
            <Link
              to={route}
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#fff',
                textDecoration: 'none',
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.titleOrName}
            </Link>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {item.subtitle}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', color: '#fbbf24', fontSize: '0.82rem', fontWeight: 700 }}>
              <Star size={14} fill="#fbbf24" color="#fbbf24" />
              <span>{item.rating.toFixed(1)}</span>
            </div>
          </div>

          <Link
            to={route}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: accentColor,
              marginTop: '10px',
            }}
          >
            <span>View details & similar</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Dynamic Recommendation Reason */}
      <div
        style={{
          margin: '0 16px 16px',
          padding: '10px 14px',
          borderRadius: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderLeft: `3px solid ${accentColor}`,
          fontSize: '0.82rem',
          color: '#e2e8f0',
          lineHeight: 1.4,
          fontStyle: 'italic',
        }}
      >
        "{item.matchReason}"
      </div>
    </div>
  );
};

export default RecommendationCard;
