import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Create a proper localStorage mock that persists values
const createLocalStorageMock = () => {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((k) => delete store[k]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
};

const localStorageMock = createLocalStorageMock();
const sessionStorageMock = createLocalStorageMock();

// Create a proper matchMedia mock
const createMatchMediaMock = () => {
  let matches = false;
  const listeners: Array<(event: MediaQueryListEvent) => void> = [];
  return {
    get matches() {
      return matches;
    },
    set matches(value: boolean) {
      matches = value;
    },
    media: '',
    onchange: null,
    addListener: vi.fn((listener) => listeners.push(listener)),
    removeListener: vi.fn((listener) => {
      const idx = listeners.indexOf(listener);
      if (idx > -1) listeners.splice(idx, 1);
    }),
    addEventListener: vi.fn((event: string, listener: EventListener) => {
      if (event === 'change') listeners.push(listener);
    }),
    removeEventListener: vi.fn((event: string, listener: EventListener) => {
      if (event === 'change') {
        const idx = listeners.indexOf(listener);
        if (idx > -1) listeners.splice(idx, 1);
      }
    }),
    dispatchEvent: vi.fn((event) => {
      listeners.forEach((l) => l(event));
      return true;
    }),
  };
};

const matchMediaMock = createMatchMediaMock();

// Override window.matchMedia directly using vi.stubGlobal
vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query: string) => ({
    ...matchMediaMock,
    media: query,
  }))
);

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: localStorageMock,
});

Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: sessionStorageMock,
});

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props} data-testid="map-container">
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props} data-testid="marker">
      {children}
    </div>
  ),
  Popup: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props} data-testid="popup">
      {children}
    </div>
  ),
  useMap: () => ({
    setView: vi.fn(),
    getZoom: vi.fn(() => 14),
  }),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn().mockReturnThis(),
    })),
  })),
}));

const mockIntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: mockIntersectionObserver,
});

vi.stubGlobal(
  'ResizeObserver',
  vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
);
