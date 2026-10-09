import { describe, it, expect, vi, beforeEach } from 'vitest';

import { vehiclesApi } from '@/services/api/vehiclesApi';
import { supabase } from '@/services/supabase';
import { Vehicle } from '@/types';

vi.mock('@/services/supabase');

const mockSupabase = vi.mocked(supabase);

describe('vehiclesApi', () => {
  const mockVehicle: Vehicle = {
    id: 'VH-001',
    plateNumber: 'ABC-1234',
    type: 'jeepney',
    deviceId: 'ESP32-001',
    driver: 'Juan Dela Cruz',
    operator: 'San Jose Transport Coop',
    status: 'normal',
    registrationStatus: 'active',
    lastCommunication: '2026-01-15T08:32:00Z',
    emergencyContact: '+63 917 123 4567',
    position: { lat: 14.5995, lng: 120.9842 },
    speed: 35,
    passengers: 18,
    fuelLevel: 72,
    route: 'Route 1',
  };

  const mockDbVehicle = {
    id: 'VH-001',
    plate_number: 'ABC-1234',
    type: 'jeepney',
    device_id: 'ESP32-001',
    driver: 'Juan Dela Cruz',
    operator: 'San Jose Transport Coop',
    status: 'normal',
    registration_status: 'active',
    last_communication: '2026-01-15T08:32:00Z',
    emergency_contact: '+63 917 123 4567',
    lat: 14.5995,
    lng: 120.9842,
    speed: 35,
    passengers: 18,
    fuel_level: 72,
    route: 'Route 1',
    created_at: '2026-01-15T08:32:00Z',
    updated_at: '2026-01-15T08:32:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return mapped vehicles on success', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [mockDbVehicle], error: null }),
      });

      const result = await vehiclesApi.getAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockVehicle);
    });

    it('should throw error on failure', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } }),
      });

      await expect(vehiclesApi.getAll()).rejects.toThrow('DB Error');
    });

    it('should return empty array when data is null', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      });

      const result = await vehiclesApi.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should return mapped vehicle on success', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockDbVehicle, error: null }),
      });

      const result = await vehiclesApi.getById('VH-001');
      expect(result).toEqual(mockVehicle);
    });

    it('should return null when not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      });

      const result = await vehiclesApi.getById('VH-999');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return mapped vehicle', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockDbVehicle, error: null }),
      });

      const result = await vehiclesApi.create(mockVehicle);
      expect(result).toEqual(mockVehicle);
    });
  });

  describe('update', () => {
    it('should update vehicle', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      await expect(vehiclesApi.update('VH-001', { status: 'emergency' })).resolves.not.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete vehicle', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      await expect(vehiclesApi.delete('VH-001')).resolves.not.toThrow();
    });
  });

  describe('updateStatus', () => {
    it('should update vehicle status', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      await expect(vehiclesApi.updateStatus('VH-001', 'sos')).resolves.not.toThrow();
    });
  });
});
