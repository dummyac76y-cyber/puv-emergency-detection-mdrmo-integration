import { describe, it, expect, vi, beforeEach } from 'vitest';

import { analyticsApi, SystemStats } from '@/services/api/analyticsApi';
import { supabase } from '@/services/supabase';

vi.mock('@/services/supabase');

const mockSupabase = vi.mocked(supabase);

describe('analyticsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSystemStats', () => {
    it('should return system stats on success', async () => {
      let callCount = 0;
      const results = [
        { count: 2, error: null }, // activeEmergencies
        { count: 1, error: null }, // unacknowledgedAlerts
        { count: 8, error: null }, // vehiclesMonitored
        { count: 3, error: null }, // incidentsResolvedToday
        { data: [{ alert_delivery_ms: 1000 }, { alert_delivery_ms: 1200 }], error: null }, // alertDelivery
        { count: 2, error: null }, // devicesOffline
      ];

      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((onFulfilled) => {
          return Promise.resolve(results[callCount++]).then(onFulfilled);
        }),
      }));

      const result: SystemStats = await analyticsApi.getSystemStats();
      expect(result).toEqual({
        activeEmergencies: 2,
        unacknowledgedAlerts: 1,
        vehiclesMonitored: 8,
        incidentsResolvedToday: 3,
        avgAlertDeliveryMs: 1100,
        devicesOffline: 2,
      });
    });

    it('should handle zero alert delivery times', async () => {
      let callCount = 0;
      const results = [
        { count: 0, error: null },
        { count: 0, error: null },
        { count: 0, error: null },
        { count: 0, error: null },
        { data: [], error: null },
        { count: 0, error: null },
      ];

      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((onFulfilled) => {
          return Promise.resolve(results[callCount++]).then(onFulfilled);
        }),
      }));

      const result: SystemStats = await analyticsApi.getSystemStats();
      expect(result.avgAlertDeliveryMs).toBe(0);
    });

    it('should handle null alert delivery data', async () => {
      let callCount = 0;
      const results = [
        { count: 1, error: null },
        { count: 0, error: null },
        { count: 5, error: null },
        { count: 0, error: null },
        { data: null, error: null },
        { count: 0, error: null },
      ];

      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((onFulfilled) => {
          return Promise.resolve(results[callCount++]).then(onFulfilled);
        }),
      }));

      const result: SystemStats = await analyticsApi.getSystemStats();
      expect(result.avgAlertDeliveryMs).toBe(0);
    });

    it('should throw error on failure', async () => {
      let queryIndex = 0;
      mockSupabase.from.mockImplementation(() => {
        const currentIndex = queryIndex++;
        const promise =
          currentIndex === 0
            ? Promise.reject(new Error('DB Error'))
            : Promise.resolve({ count: 0, error: null });
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue(promise),
          eq: vi.fn().mockReturnThis(),
          neq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          not: vi.fn().mockReturnThis(),
        };
      });

      await expect(analyticsApi.getSystemStats()).rejects.toThrow('DB Error');
    });
  });

  describe('getAnalyticsData', () => {
    it('should return analytics data on success', async () => {
      let callCount = 0;
      const results = [
        {
          data: [{ type: 'crash' }, { type: 'crash' }, { type: 'sos' }, { type: 'medical' }],
          error: null,
        },
        { data: [{ type: 'jeepney' }, { type: 'jeepney' }, { type: 'uv-express' }], error: null },
        {
          data: [
            { timestamp: '2026-01-10T08:00:00Z', status: 'new' },
            { timestamp: '2026-01-10T10:00:00Z', status: 'resolved' },
            { timestamp: '2026-01-11T08:00:00Z', status: 'resolved' },
          ],
          error: null,
        },
        {
          data: [
            { timestamp: '2026-01-10T08:00:00Z', alert_delivery_ms: 1000 },
            { timestamp: '2026-01-11T08:00:00Z', alert_delivery_ms: 1200 },
          ],
          error: null,
        },
      ];

      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((onFulfilled) => {
          return Promise.resolve(results[callCount++]).then(onFulfilled);
        }),
      }));

      const result = await analyticsApi.getAnalyticsData();
      expect(result.incidentsByType).toBeDefined();
      expect(result.incidentsByVehicleType).toBeDefined();
      expect(result.dailyIncidents).toBeDefined();
      expect(result.alertDeliveryTime).toBeDefined();
    });
  });
});
