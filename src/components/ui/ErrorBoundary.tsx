import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';

import { Button } from '@/components/ui/Button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-navy-950 p-4">
          <div className="w-full max-w-md bg-surface-raised border border-border-default rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/30 border border-red-800/30 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-lg font-semibold text-text-primary mb-2">Something went wrong</h1>
            <p className="text-sm text-text-secondary mb-6">
              We encountered an unexpected error. Please try again or reload the page.
            </p>

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-xs text-text-muted cursor-pointer mb-2">
                  Error details
                </summary>
                <pre className="bg-navy-900 border border-border-subtle rounded-lg p-3 text-[11px] text-text-secondary overflow-auto max-h-48 text-left">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      {'\n\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={this.handleRetry} variant="primary" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={this.handleReload} variant="secondary" className="flex-1">
                Reload Page
              </Button>
              <Button onClick={this.handleGoHome} variant="ghost" className="flex-1">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function GlobalErrorFallback({ error }: { error: Error }): ReactNode {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 p-4">
      <div className="w-full max-w-md bg-surface-raised border border-border-default rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/30 border border-red-800/30 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-lg font-semibold text-text-primary mb-2">Application Error</h1>
        <p className="text-sm text-text-secondary mb-6">
          A critical error occurred. Please refresh the page to continue.
        </p>
        <pre className="bg-navy-900 border border-border-subtle rounded-lg p-3 text-[11px] text-text-secondary overflow-auto max-h-48 text-left">
          {error.toString()}
        </pre>
        <Button onClick={() => window.location.reload()} variant="primary" className="w-full mt-4">
          Refresh Page
        </Button>
      </div>
    </div>
  );
}
