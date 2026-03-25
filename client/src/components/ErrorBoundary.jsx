import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            gap: '12px',
          }}
        >
          <h1 style={{ fontSize: '2rem', margin: 0 }}>出了点问题</h1>
          <p style={{ color: 'var(--text-secondary, #888)' }}>
            {this.state.error?.message || '页面渲染时发生错误'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '8px 20px',
              borderRadius: '16px',
              border: '1px solid var(--accent-blue, #a0d8ef)',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            重试
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
