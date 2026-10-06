import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2' }}>
          <div style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <AlertCircle size={48} style={{ color: '#dc2626' }} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '16px', lineHeight: '1.5' }}>
              The application encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre style={{ backgroundColor: '#f3f4f6', padding: '12px', borderRadius: '8px', textAlign: 'left', fontSize: '12px', overflow: 'auto', marginBottom: '16px' }}>
                {this.state.error.toString()}
              </pre>
            )}
            <button 
              onClick={() => window.location.href = '/'}
              style={{ backgroundColor: '#3b82f6', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
