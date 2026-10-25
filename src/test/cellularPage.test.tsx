import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CellularPage from '../guard/CellularPage';
import { createSampleEvents } from '../guard/model';
describe('cellular registration preview', () => {
  it('shows required SMS fields without a recipient and registers a fallback without browser UUID support', () => {
    render(<CellularPage events={createSampleEvents()} />);
    expect(screen.getByLabelText('SMS message content')).toHaveTextContent('User:DEMO-USER-001');
    expect(screen.getByText('Routing needs configuration')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Office / test recipient'), {
      target: { value: 'Synthetic Kalibo office' },
    });
    fireEvent.change(screen.getByLabelText('Philippine mobile SMS number'), {
      target: { value: '+639000000001' },
    });
    fireEvent.change(screen.getByLabelText('Office latitude'), { target: { value: '11.7' } });
    fireEvent.change(screen.getByLabelText('Office longitude'), { target: { value: '122.36' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Add demo recipient' }));
    expect(
      screen.getByText('Configured fallback · current location unavailable')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Demo recipient added for message preview only. Nothing was sent or saved to the cloud.'
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText('SMS message content')).toHaveTextContent('TEST ONLY');
  });
});
