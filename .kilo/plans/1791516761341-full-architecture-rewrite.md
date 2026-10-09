# Full Architecture Rewrite Plan

## Goal
Transform the PUV Command Center from a mock-data demo into a production-ready, maintainable, performant web application with Supabase backend integration, comprehensive testing, and modern React architecture.

---

## Phase 1: Foundation & Tooling (Week 1)

### 1.1 TypeScript Strictness & Path Aliases
- [ ] Enable strict mode in `tsconfig.json`
- [ ] Add path aliases (`@/components`, `@/pages`, `@/store`, `@/hooks`, `@/types`, `@/services`, `@/utils`)
- [ ] Fix all type errors introduced by strict mode

### 1.2 Linting & Formatting
- [ ] Add ESLint with `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `eslint-plugin-tailwindcss`
- [ ] Add Prettier with Tailwind plugin
- [ ] Configure `lint-staged` + `husky` for pre-commit hooks
- [ ] Add `npm run lint` and `npm run format` scripts

### 1.3 Testing Infrastructure
- [ ] Install Vitest + `@testing-library/react` + `@testing-library/user-event` + `jsdom`
- [ ] Install Playwright for E2E testing
- [ ] Configure Vitest with coverage (`vitest.config.ts`)
- [ ] Add test scripts: `test`, `test:ui`, `test:coverage`, `test:e2e`
- [ ] Create test utilities (`renderWithProviders`, mock helpers)

### 1.4 Error Boundaries & Logging
- [ ] Create `ErrorBoundary` component with fallback UI
- [ ] Add global error handler for unhandled promise rejections
- [ ] Integrate error logging service (Sentry/LogRocket placeholder)

---

## Phase 2: Architecture Restructure (Week 2)

### 2.1 Domain-Driven Context Split
Replace monolithic `AppContext` with focused domain contexts:

```
src/store/
├── AppContext.tsx           → Root provider composition
├── auth/
│   ├── AuthContext.tsx      → User, permissions, session
│   ├── authReducer.ts
│   └── authTypes.ts
├── vehicles/
│   ├── VehiclesContext.tsx  → Fleet state, CRUD operations
│   ├── vehiclesReducer.ts
│   └── vehiclesTypes.ts
├── incidents/
│   ├── IncidentsContext.tsx → Incident lifecycle management
│   ├── incidentsReducer.ts
│   └── incidentsTypes.ts
├── alerts/
│   ├── AlertsContext.tsx    → Alert history, acknowledgment
│   ├── alertsReducer.ts
│   └── alertsTypes.ts
├── devices/
│   ├── DevicesContext.tsx   → Device health telemetry
│   ├── devicesReducer.ts
│   └── devicesTypes.ts
├── ui/
│   ├── UIContext.tsx        → Sidebar, notifications, modals
│   ├── uiReducer.ts
│   └── uiTypes.ts
└── map/
    ├── MapContext.tsx       → Map filters, selected markers
    ├── mapReducer.ts
    └── mapTypes.ts
```

**Pattern for each domain:**
```typescript
// domainReducer.ts
export type DomainAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: DataType[] }
  | { type: 'ADD_ITEM'; payload: DataType }
  | { type: 'UPDATE_ITEM'; payload: { id: string; changes: Partial<DataType> } }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null };

export function domainReducer(state: DomainState, action: DomainAction): DomainState
```

### 2.2 Service Layer (API Abstraction)
Create `src/services/` with Supabase integration:

```
src/services/
├── supabase.ts              → Supabase client singleton
├── api/
│   ├── vehiclesApi.ts       → CRUD + real-time subscriptions
│   ├── incidentsApi.ts
│   ├── alertsApi.ts
│   ├── devicesApi.ts
│   └── analyticsApi.ts
├── hooks/
│   ├── useVehicles.ts       → TanStack Query wrappers
│   ├── useIncidents.ts
│   ├── useAlerts.ts
│   └── useDevices.ts
└── realtime/
    ├── vehiclesRealtime.ts  → Presence, broadcasts, postgres_changes
    ├── incidentsRealtime.ts
    └── devicesRealtime.ts
```

### 2.3 Custom Hooks Layer
Extract reusable logic from components:

```
src/hooks/
├── useDebounce.ts
├── useLocalStorage.ts
├── useMediaQuery.ts
├── useKeyPress.ts
├── useClickOutside.ts
├── useInterval.ts
├── useFilterSort.ts        → Generic filter/sort for tables
├── usePagination.ts
├── useModal.ts
├── useToast.ts
└── useConfirmation.ts
```

---

## Phase 3: Backend Integration (Week 3)

### 3.1 Supabase Schema Design
```sql
-- Core tables
vehicles (id, plate_number, type, device_id, driver, operator, status, registration_status, last_communication, emergency_contact, position, speed, passengers, fuel_level, route, created_at, updated_at)
incidents (id, vehicle_id, vehicle_type, type, priority, status, timestamp, location, coordinates, assigned_responder, notes, alert_delivery_ms, created_at, updated_at)
incident_timeline (id, incident_id, timestamp, action, actor, details, created_at)
alerts (id, incident_id, vehicle_id, type, priority, message, timestamp, acknowledged, acknowledged_at, created_at)
devices (id, vehicle_id, device_id, status, battery_level, signal_strength, gps_accuracy, last_heartbeat, firmware_version, uptime, created_at, updated_at)
users (id, email, role, name, avatar_url, created_at)
system_stats (id, active_emergencies, unacknowledged_alerts, vehicles_monitored, incidents_resolved_today, avg_alert_delivery_ms, devices_offline, updated_at)

-- RLS policies for multi-tenant (operators)
-- Real-time subscriptions on all tables
-- Indexes on frequently queried columns
```

### 3.2 Real-time Architecture
- **Postgres Changes**: Subscribe to `incidents`, `alerts`, `vehicles`, `devices` tables
- **Broadcast**: Driver SOS, location updates via `supabase.channel('vehicle:{id}').send()`
- **Presence**: Track operator online status in `incidents` page
- **Fallback**: Polling for critical data if real-time fails

### 3.3 Authentication & Authorization
- Supabase Auth with email/password + OAuth (Google, Microsoft)
- Role-based access: `admin`, `operator`, `dispatcher`, `viewer`
- RLS policies per operator/region
- Session persistence with `localStorage`

### 3.4 Migration Strategy
1. Keep mock data as fallback (`VITE_USE_MOCK_DATA=true`)
2. Implement API layer with interface matching mock functions
3. Gradual page-by-page migration
4. Feature flag for simulation mode

---

## Phase 4: Performance Optimization (Week 4)

### 4.1 Code Splitting & Lazy Loading
```typescript
// App.tsx - Route-based splitting
const OverviewPage = lazy(() => import('./pages/OverviewPage'));
const IncidentsPage = lazy(() => import('./pages/IncidentsPage'));
// ... all pages

// Component splitting for heavy components
const LiveMap = lazy(() => import('./components/LiveMap'));
const Charts = lazy(() => import('./components/Charts'));
```

### 4.2 Render Optimization
- [ ] `React.memo` on all list item components
- [ ] `useMemo`/`useCallback` for expensive computations
- [ ] Virtualized lists for large datasets (`@tanstack/react-virtual`)
- [ ] Context selector pattern to prevent unnecessary re-renders
- [ ] Memoized selectors in reducers

### 4.3 Map Performance
- [ ] Marker clustering for 100+ vehicles (`leaflet.markercluster`)
- [ ] Viewport-based marker rendering (only render visible markers)
- [ ] Web Workers for coordinate calculations
- [ ] Canvas renderer option for high-density markers

### 4.4 Bundle Optimization
- [ ] Analyze bundle with `vite-bundle-analyzer`
- [ ] Tree-shake unused Lucide icons (use `lucide-react` with individual imports)
- [ ] Dynamic imports for heavy libs (Recharts, Leaflet, Framer Motion)
- [ ] Configure Vite `build.rollupOptions.output.manualChunks`

### 4.5 Caching Strategy
- [ ] TanStack Query: `staleTime: 30000`, `gcTime: 300000`
- [ ] Prefetch adjacent pages on hover
- [ ] Optimistic updates for mutations
- [ ] Service Worker for offline support (Workbox)

---

## Phase 5: Code Quality & Maintainability (Week 5)

### 5.1 Component Architecture
```
src/components/
├── ui/                      → Primitive components (Button, Input, Select, Card, Badge, Modal, Table, Tabs)
├── layout/                  → Layout components (Sidebar, Header, Footer, PageContainer)
├── maps/                    → Map components (VehicleMarker, IncidentMarker, MapControls, MapLegend)
├── charts/                  → Chart wrappers (IncidentChart, DeliveryTimeChart, VehicleTypeChart)
├── forms/                   → Form components (VehicleForm, IncidentForm, SettingsForm)
├── vehicles/                → Vehicle-specific (VehicleCard, VehicleDetail, VehicleTable)
├── incidents/               → Incident-specific (IncidentRow, IncidentDetail, IncidentTimeline)
├── alerts/                  → Alert-specific (AlertItem, AlertFilters)
├── devices/                 → Device-specific (DeviceRow, DeviceHealthCard)
└── common/                  → Shared (SimulationBanner, LoadingSpinner, EmptyState, ConfirmDialog)
```

### 5.2 Design System Tokens
- [ ] Extract colors, spacing, typography to `src/theme/tokens.ts`
- [ ] Create Tailwind preset in `tailwind.config.ts`
- [ ] Document component API with Storybook (optional)

### 5.3 Accessibility (WCAG 2.1 AA)
- [ ] Semantic HTML structure
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation for all custom components
- [ ] Focus management in modals/drawers
- [ ] Color contrast validation
- [ ] Screen reader announcements for live updates

### 5.4 Documentation
- [ ] `ARCHITECTURE.md` - System design decisions
- [ ] `CONTRIBUTING.md` - Development workflow
- [ ] `API.md` - Service layer interfaces
- [ ] Component README files with props documentation

---

## Phase 6: Testing Implementation (Week 6)

### 6.1 Unit Tests (Vitest + RTL)
```typescript
// Target coverage: 80%+ for hooks, utils, reducers
// Examples:
- reducers: authReducer, vehiclesReducer, incidentsReducer, alertsReducer
- hooks: useFilterSort, useDebounce, useLocalStorage, useModal
- utils: date formatting, coordinate calculations, validation
- services: API response mapping, error handling
```

### 6.2 Integration Tests
```typescript
// Test component + context + hooks together
- VehicleCard with VehiclesContext
- IncidentTable with IncidentsContext + filters
- LiveMap with MapContext + real-time updates
- AlertList with AlertsContext + acknowledgment flow
- Settings form with validation + persistence
```

### 6.3 E2E Tests (Playwright)
```typescript
// Critical user journeys
- Login → Dashboard → Acknowledge alert → Update incident status
- Register new vehicle → Verify on map → Simulate SOS
- Generate report → Export CSV → Verify data
- Offline mode → Reconnect → Sync data
- Mobile responsive: sidebar, map, tables
```

### 6.4 Visual Regression (Optional)
- [ ] Chromatic or Playwright visual snapshots for key pages

---

## Phase 7: Production Hardening (Week 7)

### 7.1 Observability
- [ ] Structured logging (Pino/Winston)
- [ ] Metrics: API latency, error rates, active users
- [ ] Health check endpoint (`/health`)
- [ ] Sentry/LogRocket integration

### 7.2 Security
- [ ] CSP headers via Vite plugin
- [ ] Input sanitization (DOMPurify for user content)
- [ ] Rate limiting on API routes
- [ ] Secrets management (no keys in repo)
- [ ] Dependency audit (`npm audit`, `snyk`)

### 7.3 CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
- Lint + TypeCheck + Test (unit + integration)
- Build + Bundle size check
- E2E tests on preview deploy
- Deploy to staging on merge to main
- Production deploy with approval
```

### 7.4 Feature Flags
- [ ] LaunchDarkly/Unleash or custom solution
- [ ] Flags: `simulation_mode`, `realtime_enabled`, `new_map_renderer`, `analytics_v2`

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Components                          │
├─────────────────────────────────────────────────────────────────┤
│  Custom Hooks (useVehicles, useIncidents, useFilterSort, etc.)  │
├─────────────────────────────────────────────────────────────────┤
│  Domain Contexts (VehiclesContext, IncidentsContext, etc.)      │
│         │                    │                    │              │
│    useReducer           useReducer           useReducer         │
├─────────────────────────────────────────────────────────────────┤
│  Service Layer (TanStack Query + Supabase Realtime)             │
│         │                    │                    │              │
│   Query Cache         Query Cache           Query Cache         │
│         │                    │                    │              │
│   Supabase Client ◄──► Postgres Changes ◄──► Broadcast         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State Management | Domain Contexts + useReducer | Team familiarity, no extra deps, colocation |
| Server State | TanStack Query | Caching, deduping, optimistic updates, devtools |
| Real-time | Supabase Realtime | Built-in, scales, postgres_changes |
| Routing | React Router v6 | Standard, nested routes, data loaders (future) |
| Styling | Tailwind v4 | Utility-first, design tokens, JIT |
| Maps | React Leaflet | Open source, customizable, performant |
| Charts | Recharts | React-native, composable, accessible |
| Testing | Vitest + Playwright | Fast, modern, good DX |
| Auth | Supabase Auth | Integrated, RLS, social providers |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Real-time connection drops | High | Exponential backoff, polling fallback, connection indicator |
| Large dataset performance | High | Virtualization, pagination, clustering, indexing |
| Migration data loss | Critical | Dual-write period, validation scripts, rollback plan |
| Browser compatibility | Medium | Polyfills, progressive enhancement, testing matrix |
| Team learning curve | Medium | Pair programming, documentation, incremental adoption |

---

## Validation Criteria

### Definition of Done per Phase
- [ ] All TypeScript errors resolved (`npm run typecheck`)
- [ ] Lint passes (`npm run lint`)
- [ ] Unit tests pass with >80% coverage (`npm run test:coverage`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Bundle size < 500KB gzipped (initial load)
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices)
- [ ] No console errors/warnings in production build
- [ ] Manual QA on staging environment

### Success Metrics
- **Time to Interactive**: < 3s on 3G
- **First Contentful Paint**: < 1.5s
- **API Response Time**: p95 < 200ms
- **Real-time Latency**: < 500ms end-to-end
- **Error Rate**: < 0.1%
- **Test Coverage**: > 80% (unit), 100% (critical paths E2E)

---

## File Structure (Target)

```
src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   ├── maps/
│   ├── charts/
│   ├── forms/
│   ├── vehicles/
│   ├── incidents/
│   ├── alerts/
│   ├── devices/
│   └── common/
├── pages/
│   ├── OverviewPage.tsx
│   ├── LiveMapPage.tsx
│   ├── IncidentsPage.tsx
│   ├── VehiclesPage.tsx
│   ├── AlertsPage.tsx
│   ├── ReportsPage.tsx
│   ├── DevicesPage.tsx
│   ├── SettingsPage.tsx
│   └── Auth/
├── store/
│   ├── AppContext.tsx
│   ├── auth/
│   ├── vehicles/
│   ├── incidents/
│   ├── alerts/
│   ├── devices/
│   ├── ui/
│   └── map/
├── hooks/
├── services/
│   ├── supabase.ts
│   ├── api/
│   ├── hooks/
│   └── realtime/
├── types/
│   ├── index.ts
│   ├── auth.ts
│   ├── vehicles.ts
│   ├── incidents.ts
│   ├── alerts.ts
│   ├── devices.ts
│   └── api.ts
├── utils/
│   ├── date.ts
│   ├── coordinates.ts
│   ├── validation.ts
│   ├── formatting.ts
│   └── constants.ts
├── theme/
│   └── tokens.ts
├── test/
│   ├── setup.ts
│   ├── utils.tsx
│   └── mocks/
└── styles/
    └── globals.css
```

---

## Next Steps

1. **Review and approve** this plan
2. **Set up Supabase project** with schema
3. **Begin Phase 1** - Foundation & Tooling
4. **Weekly check-ins** to adjust scope/timeline

---

*Plan created: 2026-10-09*
*Target completion: 7 weeks (phased delivery)*