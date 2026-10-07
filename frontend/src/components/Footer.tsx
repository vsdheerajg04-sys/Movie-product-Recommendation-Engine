import React from 'react';
import { Sparkles, Terminal, Shield, Zap } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: '#07090f',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '50px 24px 30px',
        marginTop: '80px',
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '40px',
          marginBottom: '40px',
        }}
      >
        {/* Brand info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} color="#fff" />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              Cine<span style={{ color: '#06b6d4' }}>Tech</span> Engine
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6' }}>
            Dual-domain recommendation platform powered by high-performance Java algorithms including MinHash LSH, Levenshtein edit distance, ForkJoinPool parallelism, and multi-factor scoring.
          </p>
        </div>

        {/* Java Algorithm Pipeline Highlights */}
        <div>
          <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={16} color="#6366f1" /> Java Algorithms Pipeline
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            <li>1. Jaccard & Cosine TF-IDF String Similarity</li>
            <li>2. Damerau-Levenshtein Fuzzy Edit Distance</li>
            <li>3. MurmurHash3 & MinHash LSH Signatures</li>
            <li>4. Pearson Correlation User Affinities</li>
            <li>5. Reservoir Sampling & Quickselect</li>
            <li>6. Multi-threaded ForkJoinPool Workers</li>
          </ul>
        </div>

        {/* Guarantees & Architecture */}
        <div>
          <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} color="#10b981" /> Architecture Guarantees
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            <li>✓ Strict domain segregation (Movies & Products never mixed)</li>
            <li>✓ 100% Java-executed recommendation logic</li>
            <li>✓ Dynamic match explainability on every card</li>
            <li>✓ Real-time user signal telemetry tracking</li>
          </ul>
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="/analytics" style={{ color: '#818cf8', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
              📊 View Analytics & Insights →
            </a>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>
          © 2026 CineTech Recommendation Platform • Built with Java Spring Boot & React TypeScript.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={14} color="#f59e0b" />
          <span>Real-time Java DSA Engine Active</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
