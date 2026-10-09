import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { Vehicle, VehicleType, VehicleStatus } from '@/types';

const mockVehicle: Vehicle = {
  id: 'VH-001',
  plateNumber: 'ABC-1234',
  type: 'jeepney' as VehicleType,
  deviceId: 'ESP32-001',
  driver: 'Juan Dela Cruz',
  operator: 'San Jose Transport Coop',
  status: 'normal' as VehicleStatus,
  registrationStatus: 'active',
  lastCommunication: '2026-01-15T08:32:00Z',
  emergencyContact: '+63 917 123 4567',
  position: { lat: 14.5995, lng: 120.9842 },
  speed: 35,
  passengers: 18,
  fuelLevel: 72,
  route: 'Route 1 — Town Center to Brgy. San Jose',
};

describe('VehicleCard component', () => {
  const onClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render vehicle details', () => {
    render(<VehicleCard vehicle={mockVehicle} onClick={onClick} />);

    expect(screen.getByText('ABC-1234')).toBeInTheDocument();
    expect(screen.getByText('Juan Dela Cruz')).toBeInTheDocument();
    expect(screen.getByText('ESP32-001')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('35 km/h')).toBeInTheDocument();
    expect(screen.getByText('18 pax')).toBeInTheDocument();
    expect(screen.getByText('72%')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    render(<VehicleCard vehicle={mockVehicle} onClick={onClick} />);

    // Click the button that wraps the card
    fireEvent.click(screen.getByText('ABC-1234').closest('button')!);
    expect(onClick).toHaveBeenCalledWith(mockVehicle);
  });

  it('should show correct status dot color', () => {
    const emergencyVehicle = { ...mockVehicle, status: 'emergency' as VehicleStatus };
    render(<VehicleCard vehicle={emergencyVehicle} onClick={onClick} />);

    const statusDot = screen.getByLabelText('Status: emergency');
    expect(statusDot).toHaveClass('bg-red-500');
  });

  it('should show correct registration status colors', () => {
    const { rerender } = render(<VehicleCard vehicle={mockVehicle} onClick={onClick} />);
    expect(screen.getByText('active')).toHaveClass('bg-green-900/30');

    const expiredVehicle = { ...mockVehicle, registrationStatus: 'expired' as const };
    rerender(<VehicleCard vehicle={expiredVehicle} onClick={onClick} />);
    expect(screen.getByText('expired')).toHaveClass('bg-amber-900/30');

    const suspendedVehicle = { ...mockVehicle, registrationStatus: 'suspended' as const };
    rerender(<VehicleCard vehicle={suspendedVehicle} onClick={onClick} />);
    expect(screen.getByText('suspended')).toHaveClass('bg-red-900/30');
  });
});
