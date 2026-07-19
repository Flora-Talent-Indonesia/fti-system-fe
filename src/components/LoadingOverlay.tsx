import React from 'react';

interface LoadingOverlayProps {
  text?: string;
  fixed?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  text = 'Loading...',
  fixed = false,
}) => {
  return (
    <div
      style={{
        position: fixed ? 'fixed' : 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(255, 255, 255, 0.2)',
          borderTopColor: '#ffffff',
          borderRadius: '50%',
          animation: 'loading-spin 0.75s linear infinite',
        }}
      />

      {text && (
        <p
          style={{
            marginTop: '16px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.08em',
          }}
        >
          {text}
        </p>
      )}

      {/* Inline keyframe — works without any global stylesheet changes */}
      <style>{`
        @keyframes loading-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;
