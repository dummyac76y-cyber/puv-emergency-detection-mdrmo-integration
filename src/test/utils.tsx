import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, type RenderOptions, type RenderResult } from '@testing-library/react';
import React, { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { AppProvider } from '@/store/AppContext';

interface TestWrapperProps {
  children: ReactNode;
  initialEntries?: string[];
  queryClient?: QueryClient;
}

function TestWrapper({
  children,
  initialEntries = ['/'],
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  }),
}: TestWrapperProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <AppProvider>{children}</AppProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  queryClient?: QueryClient;
}

function customRender(ui: ReactElement, options: CustomRenderOptions = {}): RenderResult {
  const { initialEntries, queryClient, ...renderOptions } = options;
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <TestWrapper initialEntries={initialEntries} queryClient={queryClient}>
      {children}
    </TestWrapper>
  );
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export { customRender as render, screen };

export function createMockQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function waitForLoadingToFinish() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export function actAsync(asyncFn: () => Promise<void>) {
  return asyncFn();
}
