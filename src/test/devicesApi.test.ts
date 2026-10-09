import { describe, it, expect, vi, beforeEach } from 'vitest';

import { devicesApi } from '@/services/api/devicesApi';
import { supabase } from '@/services/supabase';
import { DeviceHealth, DeviceStatus } from '@/types';

vi.mock('@/services/supabase');

const mockSupabase = vi.mocked(supabase);

describe('devicesApi', () => {
  const mockDevice: DeviceHealth = {
    vehicleId: 'VH-001',
    deviceId: 'ESP32-001',
    status: 'online' as DeviceStatus,
    batteryLevel: 85,
    signalStrength: 90,
    gpsAccuracy: 3.5,
    lastHeartbeat: '2026-01-15T08:32:00Z',
    firmwareVersion: 'v2.4.1',
    uptime: '48h',
  };

  const mockDbDevice = {
    id: '1',
    vehicle_id: 'VH-001',
    device_id: 'ESP32-001',
    status: 'online',
    battery_level: 85,
    signal_strength: 90,
    gps_accuracy: 3.5,
    last_heartbeat: '2026-01-15T08:32:00Z',
    firmware_version: 'v2.4.1',
    uptime: '48h',
    created_at: '2026-01-15T08:32:00Z',
    updated_at: '2026-01-15T08:32:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return mapped devices on success', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [mockDbDevice], error: null }),
      });

      const result = await devicesApi.getAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockDevice);
    });

    it('should throw error on failure', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } }),
      });

      await expect(devicesApi.getAll()).rejects.toThrow('DB Error');
    });
  });

  describe('getById', () => {
    it('should return mapped device on success', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockDbDevice, error: null }),
      });

      const result = await devicesApi.getById('ESP32-001');
      expect(result).toEqual(mockDevice);
    });
  });

  describe('update', () => {
    it('should update device', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      await expect(devicesApi.update('ESP32-001', { status: 'offline' })).resolves.not.toThrow();
    });
  });

  describe('updateStatus', () => {
    it('should update device status', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      await expect(devicesApi.updateStatus('ESP32-001', 'maintenance')).resolves.not.toThrow();
    });
  });
});
