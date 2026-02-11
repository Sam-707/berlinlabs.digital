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
        <div className="min-h-screen bg-background-dark text-white p-5 font-sans">
          <div className="max-w-[600px] mx-auto p-10 bg-surface-elevated rounded-[20px] border border-white/10">
            <h1 className="text-primary mb-5">
              🚨 MenuFlows Error
            </h1>

            <div className="mb-5">
              <h3>Something went wrong:</h3>
              <pre className="bg-[#1a0d0f] p-4 rounded-lg overflow-auto text-sm text-[#ff6b6b]">
                {this.state.error?.message}
              </pre>
            </div>

            <div className="mb-5">
              <h3>Debug Information:</h3>
              <ul className="text-[#b79ea2]">
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

            <div className="mb-5">
              <h3>Stack Trace:</h3>
              <pre className="bg-[#1a0d0f] p-4 rounded-lg overflow-auto text-xs text-[#ffa500] max-h-[200px]">
                {this.state.error?.stack}
              </pre>
            </div>

            <div>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white px-6 py-3 border-none rounded-lg cursor-pointer mr-2.5"
              >
                🔄 Reload Page
              </button>

              <a
                href="/test.html"
                className="bg-[#2d1a1d] text-white px-6 py-3 border border-white/20 rounded-lg no-underline inline-block"
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
