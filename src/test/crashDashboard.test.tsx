import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CrashOverview from '../guard/CrashOverview';
import { createSampleEvents } from '../guard/model';
vi.mock('../guard/CrashMap', () => ({ default: () => <div>Google Maps test surface</div> }));
describe('crash dashboard', () => {
  it('keeps crashes without coordinates visible and routes the selected record to review', async () => {
    const onReview = vi.fn();
    render(<CrashOverview events={createSampleEvents()} onReview={onReview} />);
    await screen.findByText('Google Maps test surface');
    expect(screen.getByRole('heading', { name: 'Live accident map' })).toBeInTheDocument();
    expect(screen.getByText('Demo · feed not connected')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /TRI-01 DEMO-003/ }));
    expect(screen.getByText(/No coordinates recorded/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Review crash' }));
    expect(onReview).toHaveBeenCalledWith('DEMO-003');
  });
  it('retains closed events outside the active crash queue', async () => {
    const events = createSampleEvents().map((event) => ({ ...event, status: 'closed' as const }));
    render(<CrashOverview events={events} onReview={vi.fn()} />);
    await screen.findByText('Google Maps test surface');
    expect(screen.getByText('No active crashes')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Review crash' })).not.toBeInTheDocument();
  });
});
