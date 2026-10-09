import React from 'react';
import ReactDOM from 'react-dom/client';

import { ErrorBoundary, GlobalErrorFallback } from '@/components/ui';

import './index.css';
import App from './App';

function handleError(error: Error): void {
  console.error('Unhandled error:', error);
}

function handleRejection(event: PromiseRejectionEvent): void {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => handleError(event.error));
  window.addEventListener('unhandledrejection', handleRejection);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<GlobalErrorFallback error={new Error('Failed to initialize app')} />}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
