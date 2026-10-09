import { describe, it, expect, vi, beforeEach } from 'vitest';

import { alertsApi } from '@/services/api/alertsApi';
import { supabase } from '@/services/supabase';
import { Alert, IncidentType, IncidentPriority } from '@/types';

vi.mock('@/services/supabase');

const mockSupabase = vi.mocked(supabase);

describe('alertsApi', () => {
  const mockAlert: Alert = {
    id: 'ALT-001',
    incidentId: 'INC-2026-001',
    vehicleId: 'VH-001',
    type: 'crash' as IncidentType,
    priority: 'critical' as IncidentPriority,
    message: 'CRASH — VH-001 at National Highway',
    timestamp: '2026-01-15T08:30:00Z',
    acknowledged: false,
    acknowledgedAt: null,
  };

  const mockDbAlert = {
    id: 'ALT-001',
    incident_id: 'INC-2026-001',
    vehicle_id: 'VH-001',
    type: 'crash',
    priority: 'critical',
    message: 'CRASH — VH-001 at National Highway',
    timestamp: '2026-01-15T08:30:00Z',
    acknowledged: false,
    acknowledged_at: null,
    created_at: '2026-01-15T08:30:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return mapped alerts on success', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [mockDbAlert], error: null }),
      });

      const result = await alertsApi.getAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockAlert);
    });

    it('should throw error on failure', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } }),
      });

      await expect(alertsApi.getAll()).rejects.toThrow('DB Error');
    });
  });

  describe('getById', () => {
    it('should return mapped alert on success', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockDbAlert, error: null }),
      });

      const result = await alertsApi.getById('ALT-001');
      expect(result).toEqual(mockAlert);
    });

    it('should return null when not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      });

      const result = await alertsApi.getById('ALT-999');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return mapped alert', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockDbAlert, error: null }),
      });

      const result = await alertsApi.create(mockAlert);
      expect(result).toEqual(mockAlert);
    });
  });

  describe('acknowledge', () => {
    it('should acknowledge alert', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      await expect(alertsApi.acknowledge('ALT-001')).resolves.not.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete alert', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      await expect(alertsApi.delete('ALT-001')).resolves.not.toThrow();
    });
  });
});
