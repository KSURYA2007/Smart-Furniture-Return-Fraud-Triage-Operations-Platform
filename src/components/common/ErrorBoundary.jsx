import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log safe diagnostic without leaking personal data
    console.error('[ErrorBoundary caught exception]:', error?.message, errorInfo?.componentStack?.slice(0, 300));
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoDashboard = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-lg mx-auto my-12 rounded-lg bg-surface border border-red-800 text-secondary text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-700 flex items-center justify-center mx-auto text-red-400">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-serif font-bold text-red-300">Something went wrong.</h2>
          <p className="text-xs text-dim leading-relaxed">
            The application prevented the error from crashing the entire system.
          </p>
          <div className="p-2.5 rounded bg-card border border-subtle text-left font-mono text-3xs text-red-400 overflow-x-auto">
            {this.state.error?.message || 'Unknown runtime exception'}
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              className="btn-primary btn-sm flex items-center gap-1.5"
              onClick={this.handleReset}
            >
              <RotateCcw size={13} />
              <span>Try Again</span>
            </button>
            <button
              type="button"
              className="btn-secondary btn-sm flex items-center gap-1.5"
              onClick={this.handleGoDashboard}
            >
              <Home size={13} />
              <span>Go to Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
