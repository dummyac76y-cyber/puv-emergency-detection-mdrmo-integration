import { describe, it, expect, vi, beforeEach } from 'vitest';

import { incidentsApi } from '@/services/api/incidentsApi';
import { supabase } from '@/services/supabase';
import { Incident, TimelineEntry } from '@/types';

vi.mock('@/services/supabase');

const mockSupabase = vi.mocked(supabase);

describe('incidentsApi', () => {
  const mockIncident: Incident = {
    id: 'INC-2026-001',
    vehicleId: 'VH-001',
    vehicleType: 'jeepney',
    type: 'crash',
    priority: 'critical',
    status: 'new',
    timestamp: '2026-01-15T08:30:00Z',
    location: 'National Highway',
    coordinates: { lat: 14.6025, lng: 120.9902 },
    assignedResponder: 'Team Alpha',
    notes: 'Multi-vehicle collision',
    alertDeliveryMs: 1200,
    timeline: [],
  };

  const mockDbIncident = {
    id: 'INC-2026-001',
    vehicle_id: 'VH-001',
    vehicle_type: 'jeepney',
    type: 'crash',
    priority: 'critical',
    status: 'new',
    timestamp: '2026-01-15T08:30:00Z',
    location: 'National Highway',
    lat: 14.6025,
    lng: 120.9902,
    assigned_responder: 'Team Alpha',
    notes: 'Multi-vehicle collision',
    alert_delivery_ms: 1200,
    created_at: '2026-01-15T08:30:00Z',
    updated_at: '2026-01-15T08:30:00Z',
  };

  const mockTimeline: TimelineEntry[] = [
    {
      timestamp: '2026-01-15T08:30:00Z',
      action: 'Crash detected',
      actor: 'System',
      details: 'Impact sensor triggered',
    },
    {
      timestamp: '2026-01-15T08:31:00Z',
      action: 'Alert transmitted',
      actor: 'System',
      details: 'Delivery confirmed',
    },
  ];

  const mockDbTimeline = [
    {
      incident_id: 'INC-2026-001',
      timestamp: '2026-01-15T08:30:00Z',
      action: 'Crash detected',
      actor: 'System',
      details: 'Impact sensor triggered',
    },
    {
      incident_id: 'INC-2026-001',
      timestamp: '2026-01-15T08:31:00Z',
      action: 'Alert transmitted',
      actor: 'System',
      details: 'Delivery confirmed',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return mapped incidents with timeline on success', async () => {
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [mockDbIncident], error: null }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockDbTimeline, error: null }),
        });

      const result = await incidentsApi.getAll();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('INC-2026-001');
      expect(result[0].timeline).toHaveLength(2);
    });

    it('should throw error on failure', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } }),
      });

      await expect(incidentsApi.getAll()).rejects.toThrow('DB Error');
    });
  });

  describe('getById', () => {
    it('should return mapped incident with timeline', async () => {
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockDbIncident, error: null }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockDbTimeline, error: null }),
        });

      const result = await incidentsApi.getById('INC-2026-001');
      expect(result).toEqual(
        expect.objectContaining({
          id: 'INC-2026-001',
          timeline: expect.arrayContaining([
            expect.objectContaining({ action: 'Crash detected', actor: 'System' }),
            expect.objectContaining({ action: 'Alert transmitted', actor: 'System' }),
          ]),
        })
      );
    });
  });

  describe('create', () => {
    it('should create incident with timeline', async () => {
      mockSupabase.from
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockDbIncident, error: null }),
        })
        .mockReturnValueOnce({
          insert: vi.fn().mockResolvedValue({ error: null }),
        });

      const newIncident = { ...mockIncident, timeline: mockTimeline };
      const result = await incidentsApi.create(newIncident);
      expect(result).toEqual(
        expect.objectContaining({
          id: 'INC-2026-001',
        })
      );
    });
  });

  describe('update', () => {
    it('should update incident', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      await expect(
        incidentsApi.update('INC-2026-001', { status: 'acknowledged' })
      ).resolves.not.toThrow();
    });
  });

  describe('updateStatus', () => {
    it('should update incident status', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      await expect(incidentsApi.updateStatus('INC-2026-001', 'responding')).resolves.not.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete incident', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      await expect(incidentsApi.delete('INC-2026-001')).resolves.not.toThrow();
    });
  });
});
