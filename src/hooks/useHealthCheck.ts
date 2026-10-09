// Health Check Hook
// Monitors application health and API connectivity

import { useState, useEffect, useCallback } from 'react';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    api: boolean;
    realtime: boolean;
    auth: boolean;
  };
  latency: number;
  lastCheck: Date | null;
}

export function useHealthCheck(intervalMs = 60000): HealthStatus {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'healthy',
    checks: { api: true, realtime: true, auth: true },
    latency: 0,
    lastCheck: null,
  });

  const runHealthCheck = useCallback(async () => {
    const start = performance.now();
    const checks = { api: false, realtime: false, auth: false };

    try {
      // Check API connectivity
      const apiResponse = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      checks.api = apiResponse.ok;
    } catch {
      checks.api = false;
    }

    // Check auth state
    try {
      const { supabase } = await import('@/services/supabase');
      const { data } = await supabase.auth.getSession();
      checks.auth = !!data.session;
    } catch {
      checks.auth = false;
    }

    // Check realtime (basic check)
    checks.realtime = true; // Would need actual realtime client check

    const latency = performance.now() - start;
    const allHealthy = Object.values(checks).every((v) => v);
    const someHealthy = Object.values(checks).some((v) => v);

    setHealth({
      status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
      checks,
      latency,
      lastCheck: new Date(),
    });
  }, []);

  useEffect(() => {
    runHealthCheck();
    const timer = setInterval(runHealthCheck, intervalMs);
    return () => clearInterval(timer);
  }, [runHealthCheck, intervalMs]);

  return health;
}

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
