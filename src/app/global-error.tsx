'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          padding: '1rem',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              backgroundColor: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '1.5rem',
            }}>
              ⚠
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              An unexpected error occurred. Please try again.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e2e8f0',
                  color: '#0f172a',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
