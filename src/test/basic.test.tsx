import { describe, it, expect } from 'vitest';

import { SimulationBanner } from '@/components/shared';
import { AppProvider } from '@/store/AppContext';
import { render, screen } from '@/test/utils';

describe('SimulationBanner', () => {
  it('renders simulation mode text', () => {
    render(
      <AppProvider>
        <SimulationBanner />
      </AppProvider>
    );

    expect(screen.getByText(/Simulation Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/Vehicle accident & driver threat monitoring/i)).toBeInTheDocument();
  });
});

describe('Test utilities', () => {
  it('renders with providers', () => {
    const { container } = render(<div data-testid="test">Hello</div>);
    expect(container.querySelector("[data-testid='test']")).toHaveTextContent('Hello');
  });
});

describe('cn utility', () => {
  it('combines class names correctly', async () => {
    const { cn } = await import('@/utils/cn');
    expect(cn('base', 'extra')).toBe('base extra');
    const conditional = false;
    expect(cn('base', conditional ? 'conditional' : '')).toBe('base');
    expect(cn('base', null, undefined, 'extra')).toBe('base extra');
  });
});
