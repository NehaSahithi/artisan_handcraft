import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { LotusMotif } from '../common/Heritage';

/**
 * Standard React Class Component Error Boundary to catch render failures.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error telemetry to console
    console.error('⚠️ React Error Boundary caught crash:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Premium themed error recovery screen
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6 select-none font-sans">
          <div className="bg-white p-8 md:p-12 rounded-xl border border-border shadow-md max-w-xl relative overflow-hidden flex flex-col items-center">
            {/* Center ornament */}
            <div className="mb-6 p-4 rounded-full bg-red-50 text-red-500 animate-pulse flex items-center justify-center">
              <AlertTriangle className="w-12 h-12" />
            </div>

            <h1 className="text-3xl font-serif text-stone-800 mb-4 font-bold">
              Something went wrong
            </h1>
            
            <p className="text-stone-500 text-sm max-w-md leading-relaxed mb-8">
              A rendering discrepancy occurred while displaying this page. Rest assured, your data is safe. Let's return to the home screen.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={() => window.location.reload()}
                className="w-full btn-outline flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              
              <button
                onClick={this.handleReset}
                className="w-full btn-primary"
              >
                Return to Home
              </button>
            </div>

            {/* Decorative background lotus */}
            <div className="absolute -bottom-8 -right-8 opacity-5">
              <LotusMotif className="w-32 h-32" />
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
