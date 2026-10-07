import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { AlgorithmStatusResponse } from '../types';
import { X, Cpu, CheckCircle2, Zap, ArrowRight, Layers } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const AlgorithmTelemetryModal: React.FC<Props> = ({ onClose }) => {
  const [data, setData] = useState<AlgorithmStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAlgorithmStatus()
      .then(res => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          backgroundColor: '#0f1423',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cpu size={24} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Java DSA Recommendation Core</h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Spring Boot Backend Engine</span>
                <span>•</span>
                <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> 8 Java Algorithms Verified
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {/* Pipeline sequence visualizer */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Layers size={17} color="#6366f1" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>
                Pipeline Execution Flow
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '8px',
                padding: '16px',
                backgroundColor: 'rgba(18, 24, 38, 0.7)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {data?.pipelineSequence.map((step, idx) => (
                <React.Fragment key={step}>
                  <div
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      backgroundColor: idx === 0 ? 'rgba(244, 63, 94, 0.2)' : idx === data.pipelineSequence.length - 1 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                      color: idx === 0 ? '#fda4af' : idx === data.pipelineSequence.length - 1 ? '#6ee7b7' : '#c7d2fe',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {step}
                  </div>
                  {idx < data.pipelineSequence.length - 1 && (
                    <ArrowRight size={14} color="#64748b" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Algorithms Grid */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Zap size={17} color="#f59e0b" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>
              8 Pure Java DSA Implementations
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading algorithms verification...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '14px' }}>
              {data?.algorithms.map((algo) => (
                <div
                  key={algo.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(18, 24, 38, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(99, 102, 241, 0.25)',
                          color: '#a5b4fc',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {algo.id}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                        {algo.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      {algo.status}
                    </span>
                  </div>

                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#818cf8' }}>
                    {algo.package}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {algo.techniques.map((tech) => (
                      <span
                        key={tech}
                        style={{
                          fontSize: '0.72rem',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          color: 'var(--text-secondary)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlgorithmTelemetryModal;
