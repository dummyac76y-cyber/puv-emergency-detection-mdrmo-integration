import { AppProvider, useApp } from './store/AppContext';
import Layout from './components/Layout';
import OverviewPage from './pages/OverviewPage';
import LiveMapPage from './pages/LiveMapPage';
import IncidentsPage from './pages/IncidentsPage';
import VehiclesPage from './pages/VehiclesPage';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import DevicesPage from './pages/DevicesPage';
import SettingsPage from './pages/SettingsPage';

function PageRouter() {
  const { currentPage } = useApp();

  switch (currentPage) {
    case 'overview': return <OverviewPage />;
    case 'live-map': return <LiveMapPage />;
    case 'incidents': return <IncidentsPage />;
    case 'vehicles': return <VehiclesPage />;
    case 'alerts': return <AlertsPage />;
    case 'reports': return <ReportsPage />;
    case 'devices': return <DevicesPage />;
    case 'settings': return <SettingsPage />;
    default: return <OverviewPage />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <PageRouter />
      </Layout>
    </AppProvider>
  );
}
