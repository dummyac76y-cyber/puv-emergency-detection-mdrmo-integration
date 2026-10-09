import { Suspense, lazy, type ComponentType, useEffect } from 'react';

import Layout from '@/components/Layout';
import { LoadingSpinner } from '@/components/shared';
import { Providers, useApp } from '@/store';
import { initErrorReporting } from '@/utils/errorReporting';

const OverviewPage = lazy(() => import('@/pages/OverviewPage'));
const LiveMapPage = lazy(() => import('@/pages/LiveMapPage'));
const IncidentsPage = lazy(() => import('@/pages/IncidentsPage'));
const VehiclesPage = lazy(() => import('@/pages/VehiclesPage'));
const AlertsPage = lazy(() => import('@/pages/AlertsPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const DevicesPage = lazy(() => import('@/pages/DevicesPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

type PageComponent = ComponentType<{ compact?: boolean }>;

function PageRouter() {
  const { currentPage } = useApp();

  const pageMap: Record<string, PageComponent> = {
    overview: OverviewPage,
    'live-map': LiveMapPage,
    incidents: IncidentsPage,
    vehicles: VehiclesPage,
    alerts: AlertsPage,
    reports: ReportsPage,
    devices: DevicesPage,
    settings: SettingsPage,
  };

  const Page = pageMap[currentPage] || OverviewPage;

  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <Page />
    </Suspense>
  );
}

export default function App() {
  // Initialize error reporting on app start
  useEffect(() => {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (dsn) {
      initErrorReporting(dsn);
    }
  }, []);

  return (
    <Providers>
      <Layout>
        <PageRouter />
      </Layout>
    </Providers>
  );
}
