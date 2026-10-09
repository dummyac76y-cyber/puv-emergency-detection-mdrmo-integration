import Layout from '@/components/Layout';
import AlertsPage from '@/pages/AlertsPage';
import DevicesPage from '@/pages/DevicesPage';
import IncidentsPage from '@/pages/IncidentsPage';
import LiveMapPage from '@/pages/LiveMapPage';
import OverviewPage from '@/pages/OverviewPage';
import ReportsPage from '@/pages/ReportsPage';
import SettingsPage from '@/pages/SettingsPage';
import VehiclesPage from '@/pages/VehiclesPage';
import { Providers, useApp } from '@/store';

function PageRouter() {
  const { currentPage } = useApp();

  switch (currentPage) {
    case 'overview':
      return <OverviewPage />;
    case 'live-map':
      return <LiveMapPage />;
    case 'incidents':
      return <IncidentsPage />;
    case 'vehicles':
      return <VehiclesPage />;
    case 'alerts':
      return <AlertsPage />;
    case 'reports':
      return <ReportsPage />;
    case 'devices':
      return <DevicesPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <OverviewPage />;
  }
}

export default function App() {
  return (
    <Providers>
      <Layout>
        <PageRouter />
      </Layout>
    </Providers>
  );
}
