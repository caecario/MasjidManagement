'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: '1rem',
          background: 'var(--cream-50, #FDFAF9)',
          color: 'var(--gray-900, #1A1A1A)',
          fontFamily: 'var(--font-sans)',
        }}>
          <span style={{ fontSize: '3rem' }}>⚠️</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Terjadi kesalahan
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500, #6B6B6B)', maxWidth: '400px', textAlign: 'center' }}>
            {this.state.error?.message || 'Silakan muat ulang halaman.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '0.625rem 1.25rem',
              background: 'var(--green-700, #9B111E)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Muat Ulang
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
