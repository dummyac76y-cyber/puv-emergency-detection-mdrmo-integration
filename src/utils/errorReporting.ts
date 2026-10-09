// Error Reporting Utility
// Integrates with Sentry for production error tracking

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

let sentryInitialized = false;

function loadSentry() {
  // Use dynamic import with try-catch to avoid bundling if not available
  return import('@sentry/react').catch(() => null);
}

export function initErrorReporting(dsn?: string): void {
  if (sentryInitialized || !dsn) return;

  loadSentry().then((Sentry) => {
    if (!Sentry) {
      console.warn('[ErrorReporting] Sentry not available');
      return;
    }

    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event) {
        // Filter out development errors
        if (import.meta.env.DEV) {
          console.log('[Sentry] Would send:', event);
          return null;
        }
        return event;
      },
    });
    sentryInitialized = true;
  });
}

export function captureError(error: Error, context?: ErrorContext): void {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...context,
  };

  // Always log to console
  console.error('[ErrorReporting]', errorInfo);

  // Send to Sentry if initialized
  if (sentryInitialized) {
    loadSentry().then((Sentry) => {
      if (Sentry) {
        Sentry.captureException(error, {
          extra: context,
          tags: {
            component: context?.component,
            action: context?.action,
          },
          user: context?.userId ? { id: context.userId } : undefined,
        });
      }
    });
  }
}

export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: ErrorContext
): void {
  const logInfo = {
    message,
    level,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    ...context,
  };

  console.log(`[ErrorReporting:${level}]`, logInfo);

  if (sentryInitialized) {
    loadSentry().then((Sentry) => {
      if (Sentry) {
        Sentry.captureMessage(message, level);
      }
    });
  }
}

export function setUserContext(user: { id: string; email?: string; role?: string } | null): void {
  if (sentryInitialized) {
    loadSentry().then((Sentry) => {
      if (Sentry) {
        Sentry.setUser(user);
      }
    });
  }
}

export function addBreadcrumb(
  category: string,
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, unknown>
): void {
  if (sentryInitialized) {
    loadSentry().then((Sentry) => {
      if (Sentry) {
        Sentry.addBreadcrumb({ category, message, level, data });
      }
    });
  }
}
