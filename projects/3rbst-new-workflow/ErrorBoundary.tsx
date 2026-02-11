import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MenuFlows Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#170e10',
          color: 'white',
          padding: '20px',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '40px',
            background: '#241619',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h1 style={{ color: '#c21e3a', marginBottom: '20px' }}>
              🚨 MenuFlows Error
            </h1>
            
            <div style={{ marginBottom: '20px' }}>
              <h3>Something went wrong:</h3>
              <pre style={{
                background: '#1a0d0f',
                padding: '15px',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '14px',
                color: '#ff6b6b'
              }}>
                {this.state.error?.message}
              </pre>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3>Debug Information:</h3>
              <ul style={{ color: '#b79ea2' }}>
                <li><strong>URL:</strong> {window.location.href}</li>
                <li><strong>User Agent:</strong> {navigator.userAgent}</li>
                <li><strong>Timestamp:</strong> {new Date().toISOString()}</li>
                <li><strong>Environment Variables:</strong></li>
                <ul>
                  <li>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</li>
                  <li>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</li>
                </ul>
              </ul>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3>Stack Trace:</h3>
              <pre style={{
                background: '#1a0d0f',
                padding: '15px',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '12px',
                color: '#ffa500',
                maxHeight: '200px'
              }}>
                {this.state.error?.stack}
              </pre>
            </div>

            <div>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#c21e3a',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                🔄 Reload Page
              </button>
              
              <a
                href="/test.html"
                style={{
                  background: '#2d1a1d',
                  color: 'white',
                  padding: '12px 24px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                🧪 Test Page
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;