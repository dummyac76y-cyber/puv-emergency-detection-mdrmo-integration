import { describe, expect, it } from 'vitest';
import { createSampleEvents } from '../guard/model';
import {
  buildCrashSms,
  distanceKm,
  normalizePhilippinePhone,
  planCrashSms,
  type MdrrmoRecipient,
} from '../guard/smsRouting';
const now = Date.parse('2026-10-26T00:00:00Z');
const event = {
  ...createSampleEvents(now)[0]!,
  position: { lat: 11.7, lng: 122.36, capturedAt: '2026-10-25T23:59:30Z' },
};
const office = (
  id: string,
  lat: number,
  patch: Partial<MdrrmoRecipient> = {}
): MdrrmoRecipient => ({
  id,
  office: 'Synthetic test office',
  municipality: 'Kalibo',
  phone: '+639000000001',
  position: { lat, lng: 122.36 },
  active: true,
  approvalReference: 'TEST-APPROVAL',
  mode: 'test',
  fallback: false,
  ...patch,
});
describe('GSM/4G crash SMS routing', () => {
  it('selects the nearest eligible registered office rather than first registration', () => {
    const result = planCrashSms(event, [office('far', 11.8), office('near', 11.701)], 'test', now);
    expect('recipient' in result && result.recipient.id).toBe('near');
    expect('method' in result && result.method).toBe('nearest');
    expect(distanceKm({ lat: 0, lng: 0 }, { lat: 0, lng: 1 })).toBeCloseTo(111.195, 2);
  });
  it('excludes inactive, unapproved, invalid and wrong-mode recipients', () => {
    const candidates = [
      office('inactive', 11.7, { active: false }),
      office('unapproved', 11.7, { approvalReference: '' }),
      office('wrongmode', 11.7, { mode: 'live' }),
      office('invalid', 11.7, { phone: '911' }),
    ];
    expect(planCrashSms(event, candidates, 'test', now)).toHaveProperty('blocked');
    expect(planCrashSms(event, [office('test', 11.7)], 'live', now)).toHaveProperty('blocked');
  });
  it('does not use missing or stale coordinates to claim a nearest office', () => {
    const stale = { ...event, position: { ...event.position, capturedAt: '2026-10-25T20:00:00Z' } };
    expect(planCrashSms(stale, [office('near', 11.7)], 'test', now)).toHaveProperty('blocked');
    const result = planCrashSms(
      stale,
      [office('near', 11.7), office('fallback', 11.8, { fallback: true })],
      'test',
      now
    );
    expect('recipient' in result && result.recipient.id).toBe('fallback');
    expect('method' in result && result.method).toBe('fallback');
    expect('body' in result && result.body).toContain('Stale fix');
    const missing = planCrashSms(
      { ...event, position: null },
      [office('fallback', 11.8, { fallback: true })],
      'test',
      now
    );
    expect('body' in missing && missing.body).toContain('GPS:unavailable');
  });
  it('includes the registered user ID, crash time, location and Maps link in a marked test message', () => {
    const body = buildCrashSms(event, 'test', now);
    expect(body).toContain('TEST ONLY');
    expect(body).toContain('User:DEMO-USER-001');
    expect(body).toContain('Time:2026-10-26 07:57:00+08:00');
    expect(body).toContain('GPS:11.70000,122.36000 (Recent fix)');
    expect(body).toContain('https://www.google.com/maps/search/?api=1&query=11.70000,122.36000');
  });
  it('blocks canceled, closed, invalid and future events and provides a stable delivery key', () => {
    const recipients = [office('office-1', 11.7)];
    for (const changed of [
      { ...event, status: 'canceled' as const },
      { ...event, status: 'closed' as const },
      { ...event, occurredAt: '2026-10-27T00:00:00Z' },
      { ...event, userId: 'user\nInjected' },
    ])
      expect(planCrashSms(changed, recipients, 'test', now)).toHaveProperty('blocked');
    expect(planCrashSms(event, recipients, 'test', now)).toMatchObject({
      idempotencyKey: 'DEMO-001:office-1:sms',
    });
  });
  it('normalizes Philippine mobile numbers and rejects non-SMS service/landline numbers', () => {
    expect(normalizePhilippinePhone('0900 000 0001')).toBe('+639000000001');
    expect(normalizePhilippinePhone('+63 (900) 000-0001')).toBe('+639000000001');
    expect(normalizePhilippinePhone('911')).toBeNull();
    expect(normalizePhilippinePhone('+63281234567')).toBeNull();
  });
});
