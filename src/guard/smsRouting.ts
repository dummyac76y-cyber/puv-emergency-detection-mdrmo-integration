import { positionState, type GuardEvent } from './model';
export interface MdrrmoRecipient {
  id: string;
  office: string;
  municipality: 'Kalibo';
  phone: string;
  position: { lat: number; lng: number };
  active: boolean;
  approvalReference: string;
  mode: 'test' | 'live';
  fallback: boolean;
}
export type SmsPlan =
  | {
      recipient: MdrrmoRecipient;
      distanceKm: number | null;
      method: 'nearest' | 'fallback';
      body: string;
      idempotencyKey: string;
    }
  | { blocked: string };
export function normalizePhilippinePhone(value: string): string | null {
  const compact = value.replace(/[\s()-]/g, '');
  const normalized = compact.startsWith('0')
    ? '+63' + compact.slice(1)
    : compact.startsWith('63')
      ? '+' + compact
      : compact;
  return /^\+639\d{9}$/.test(normalized) ? normalized : null;
}
export function validCoordinates(position: { lat: number; lng: number }): boolean {
  return (
    Number.isFinite(position.lat) &&
    Number.isFinite(position.lng) &&
    Math.abs(position.lat) <= 90 &&
    Math.abs(position.lng) <= 180
  );
}
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const dlat = radians(b.lat - a.lat),
    dlng = radians(b.lng - a.lng);
  const term =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dlng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(term), Math.sqrt(Math.max(0, 1 - term)));
}
export function smsTimestamp(value: string): string {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) throw new Error('Invalid crash timestamp');
  // Keep the offset explicit so recipients do not mistake UTC for local time.
  return new Date(time + 8 * 3600_000).toISOString().slice(0, 19).replace('T', ' ') + '+08:00';
}
export function buildCrashSms(event: GuardEvent, mode: 'test' | 'live', now = Date.now()): string {
  if (
    ![event.id, event.userId, event.deviceId].every((value) => /^[A-Za-z0-9_-]{1,48}$/.test(value))
  )
    throw new Error('Invalid registered user, device or event ID');
  const lines = [
    mode === 'test' ? 'TEST ONLY - PUV GUARD' : 'PUV GUARD - SUSPECTED CRASH',
    `User:${event.userId}`,
    `Device:${event.deviceId} Event:${event.id}`,
    `Time:${smsTimestamp(event.occurredAt)}`,
  ];
  if (event.position && validCoordinates(event.position)) {
    const coordinate = `${event.position.lat.toFixed(5)},${event.position.lng.toFixed(5)}`;
    lines.push(
      `GPS:${coordinate} (${positionState(event.position, now)})`,
      `Fix:${smsTimestamp(event.position.capturedAt)}`,
      `https://www.google.com/maps/search/?api=1&query=${coordinate}`
    );
  } else lines.push('GPS:unavailable');
  return lines.join('\n');
}
export function planCrashSms(
  event: GuardEvent,
  recipients: MdrrmoRecipient[],
  mode: 'test' | 'live',
  now = Date.now()
): SmsPlan {
  if (event.status === 'canceled')
    return { blocked: 'Canceled crash events must not generate SMS.' };
  if (event.status === 'closed')
    return { blocked: 'Closed events are retained as records; no new SMS is planned.' };
  if (!Number.isFinite(Date.parse(event.occurredAt)) || Date.parse(event.occurredAt) > now)
    return { blocked: 'Crash timestamp is missing, invalid or in the future.' };
  const eligible = recipients.filter(
    (r) =>
      r.active &&
      r.municipality === 'Kalibo' &&
      r.mode === mode &&
      !!r.approvalReference.trim() &&
      validCoordinates(r.position) &&
      !!normalizePhilippinePhone(r.phone)
  );
  if (!eligible.length)
    return {
      blocked: 'No approved, active recipient is registered for this operating mode in Kalibo.',
    };
  const fresh =
    event.position &&
    validCoordinates(event.position) &&
    positionState(event.position, now) === 'Recent fix';
  let recipient: MdrrmoRecipient | undefined,
    method: 'nearest' | 'fallback',
    distance: number | null = null;
  if (fresh) {
    const ranked = eligible
      .map((r) => ({ recipient: r, distance: distanceKm(event.position!, r.position) }))
      .sort((a, b) => a.distance - b.distance || a.recipient.id.localeCompare(b.recipient.id));
    recipient = ranked[0]?.recipient;
    distance = ranked[0]?.distance ?? null;
    method = 'nearest';
  } else {
    recipient = eligible.filter((r) => r.fallback).sort((a, b) => a.id.localeCompare(b.id))[0];
    method = 'fallback';
  }
  if (!recipient)
    return {
      blocked:
        'No recent GNSS fix. Configure an approved fallback office; the nearest office cannot be determined.',
    };
  try {
    return {
      recipient: { ...recipient, phone: normalizePhilippinePhone(recipient.phone)! },
      distanceKm: distance,
      method,
      body: buildCrashSms(event, mode, now),
      idempotencyKey: `${event.id}:${recipient.id}:sms`,
    };
  } catch {
    return {
      blocked: 'User/device/event identifiers or timestamps are invalid. No SMS can be planned.',
    };
  }
}
