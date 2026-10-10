import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  Bus,
  Bell,
  BarChart3,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Clock,
  Wifi,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { ReactNode, useState, useEffect } from 'react';

import { Notification } from '@/components/shared';
import { useApp } from '@/store/AppContext';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'live-map', label: 'Live Map', icon: Map },
  { id: 'incidents', label: 'Emergency Incidents', icon: AlertTriangle },
  { id: 'vehicles', label: 'Vehicle Registry', icon: Bus },
  { id: 'alerts', label: 'Alert History', icon: Bell },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'devices', label: 'Device Health', icon: Cpu },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Layout({ children }: { children: ReactNode }) {
  const {
    currentPage,
    setCurrentPage,
    sidebarCollapsed,
    toggleSidebar,
    alerts,
    notification,
    clearNotification,
  } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleOverlayClick = () => setMobileMenuOpen(false);

  return (
    <div className="h-screen flex flex-col bg-navy-950 overflow-hidden">
      {/* Top Navigation */}
      <header className="h-14 bg-navy-900 border-b border-border-subtle flex items-center justify-between px-4 flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          {/* Mobile menu */}
          <button
            className="lg:hidden p-1.5 text-text-secondary hover:text-text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          {/* Sidebar toggle */}
          <button
            className="hidden lg:flex p-1.5 text-text-secondary hover:text-text-primary rounded"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-text-primary leading-tight tracking-wide">
                PUV COMMAND CENTER
              </h1>
              <p className="text-[10px] text-text-muted leading-tight">
                MDRRMO Emergency Operations
              </p>
            </div>
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search vehicles, incidents, alerts..."
              className="w-full bg-navy-800 border border-border-subtle rounded-lg pl-9 pr-3 py-1.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* System status */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted">
            <Wifi className="w-3.5 h-3.5 text-green-400" />
            <span>Online</span>
          </div>
          {/* Notifications */}
          <button
            onClick={() => setCurrentPage('alerts')}
            className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unacknowledgedCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unacknowledgedCount}
              </span>
            )}
          </button>
          {/* Time */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-text-muted">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">
              {currentTime.toLocaleTimeString('en-US', { hour12: false })}
            </span>
            <span className="text-text-muted/60">•</span>
            <span>
              {currentTime.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          {/* Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-border-subtle">
            <div className="w-7 h-7 bg-accent/20 border border-accent/30 rounded-full flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="hidden sm:block text-xs text-text-secondary font-medium">Admin</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 fixed lg:relative z-20 h-full
            ${sidebarCollapsed ? 'w-16' : 'w-56'}
            bg-navy-900 border-r border-border-subtle flex flex-col transition-all duration-200
          `}
          role="navigation"
          aria-label="Main navigation"
        >
          <nav className="flex-1 py-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              const badge =
                item.id === 'incidents' ? 2 : item.id === 'alerts' ? unacknowledgedCount : 0;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors relative
                    ${isActive ? 'bg-accent/10 text-accent border-r-2 border-accent' : 'text-text-secondary hover:text-text-primary hover:bg-navy-800'}
                    ${sidebarCollapsed ? 'justify-center px-0' : ''}
                  `}
                  title={sidebarCollapsed ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="w-4.5 h-4.5 flex-shrink-0" aria-hidden="true" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left text-[13px]">{item.label}</span>
                      {badge > 0 && (
                        <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                  {sidebarCollapsed && badge > 0 && (
                    <span
                      className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                      aria-label={`${badge} notifications`}
                    />
                  )}
                </button>
              );
            })}
          </nav>
          {/* Sidebar footer */}
          {!sidebarCollapsed && (
            <div className="p-3 border-t border-border-subtle">
              <div className="bg-navy-800 rounded-lg p-2.5">
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">
                  System Status
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
                  <span className="text-xs text-text-secondary">All systems operational</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={handleOverlayClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Escape' && setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-hidden bg-navy-950" role="main">
          <div className="h-full overflow-y-auto bg-navy-950">{children}</div>
        </main>
      </div>

      {/* Notification toast */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}
    </div>
  );
}
