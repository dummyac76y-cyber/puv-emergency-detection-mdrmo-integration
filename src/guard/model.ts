export type EventType = 'suspected-crash';
export type ProcessingStatus = 'new' | 'acknowledged' | 'closed' | 'canceled';
export interface GuardEvent {
  id: string;
  deviceId: string;
  userId: string;
  type: EventType;
  occurredAt: string;
  position: { lat: number; lng: number; capturedAt: string } | null;
  location: string;
  trigger: string;
  sms: 'not-attempted' | 'queued' | 'modem-accepted' | 'delivery-confirmed' | 'failed';
  serverReceivedAt: string | null;
  recoveredOffline: boolean;
  status: ProcessingStatus;
  acknowledgment: { actor: string; at: string } | null;
  history: { at: string; actor: string; action: string }[];
}
export const eventNames: Record<EventType, string> = {
  'suspected-crash': 'Suspected crash',
};
export const smsNames = {
  'not-attempted': 'Not attempted',
  queued: 'Queued on device',
  'modem-accepted': 'Accepted by modem',
  'delivery-confirmed': 'Delivery confirmed',
  failed: 'Attempt failed',
};
export function positionState(position: GuardEvent['position'], reference = Date.now()): string {
  if (!position) return 'No GNSS fix';
  const age = reference - Date.parse(position.capturedAt);
  if (!Number.isFinite(age) || age < 0) return 'Fix time uncertain';
  return age <= 120_000 ? 'Recent fix' : 'Stale fix';
}
export function transitionEvent(
  event: GuardEvent,
  status: 'acknowledged' | 'closed',
  at: string
): GuardEvent {
  if (
    (status === 'acknowledged' && event.status !== 'new') ||
    (status === 'closed' && event.status !== 'acknowledged')
  )
    return event;
  return {
    ...event,
    status,
    acknowledgment:
      status === 'acknowledged' ? { actor: 'Demo evaluator', at } : event.acknowledgment,
    history: [
      ...event.history,
      {
        at,
        actor: 'Demo evaluator',
        action: status === 'acknowledged' ? 'Acknowledged in demo' : 'Closed in demo',
      },
    ],
  };
}
export function createSampleEvents(now = Date.now()): GuardEvent[] {
  const time = (minutes: number) => new Date(now - minutes * 60_000).toISOString();
  return [
    {
      id: 'DEMO-001',
      deviceId: 'TRI-01',
      userId: 'DEMO-USER-001',
      type: 'suspected-crash',
      occurredAt: time(3),
      position: { lat: 11.7069, lng: 122.3642, capturedAt: time(3) },
      location: 'Kalibo town center · sample location',
      trigger: 'IMU + 801S shock indication',
      sms: 'modem-accepted',
      serverReceivedAt: time(3),
      recoveredOffline: false,
      status: 'new',
      acknowledgment: null,
      history: [{ at: time(3), actor: 'Sample device', action: 'Synthetic event received' }],
    },
    {
      id: 'DEMO-002',
      deviceId: 'TRI-02',
      userId: 'DEMO-USER-002',
      type: 'suspected-crash',
      occurredAt: time(8),
      position: { lat: 11.699, lng: 122.37, capturedAt: time(15) },
      location: 'Kalibo · sample location',
      trigger: 'IMU + pronounced orientation change',
      sms: 'queued',
      serverReceivedAt: time(5),
      recoveredOffline: true,
      status: 'new',
      acknowledgment: null,
      history: [
        { at: time(8), actor: 'Sample device', action: 'Synthetic suspected-crash event' },
        { at: time(5), actor: 'Sample backend', action: 'Recovered offline record' },
      ],
    },
    {
      id: 'DEMO-003',
      deviceId: 'TRI-01',
      userId: 'DEMO-USER-001',
      type: 'suspected-crash',
      occurredAt: time(25),
      position: null,
      location: 'Location unavailable',
      trigger: 'IMU + 801S shock indication',
      sms: 'not-attempted',
      serverReceivedAt: time(25),
      recoveredOffline: false,
      status: 'acknowledged',
      acknowledgment: { actor: 'Demo evaluator', at: time(24) },
      history: [
        {
          at: time(25),
          actor: 'Sample device',
          action: 'Synthetic suspected-crash event received',
        },
        { at: time(24), actor: 'Demo evaluator', action: 'Acknowledged in sample data' },
      ],
    },
  ];
}
export const sampleDevices = [
  {
    id: 'TRI-01',
    label: 'Tricycle prototype 01',
    battery: 82,
    network: '4G LTE · sample',
    pending: 0,
    condition: 'Sample connected',
    imu: 'Sample available',
    shock: 'Sample available',
    heartbeat: 'Sample heartbeat only',
  },
  {
    id: 'TRI-02',
    label: 'Tricycle prototype 02',
    battery: 46,
    network: 'No service · sample',
    pending: 1,
    condition: 'Sample offline',
    imu: 'Sample available',
    shock: 'Sample available',
    heartbeat: 'Sample heartbeat only',
  },
];
export function csvCell(value: string): string {
  // Neutralize spreadsheet formula injection, including leading whitespace.
  const safe = /^[\s]*[=+@-]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
export function eventCsv(events: GuardEvent[]): string {
  return [
    [
      'mode',
      'eventId',
      'deviceId',
      'userId',
      'type',
      'occurredAt',
      'status',
      'sms',
      'serverReceivedAt',
      'latitude',
      'longitude',
      'fixAt',
      'acknowledgedAt',
    ],
    ...events.map((e) => [
      'DEMO',
      e.id,
      e.deviceId,
      e.userId,
      e.type,
      e.occurredAt,
      e.status,
      e.sms,
      e.serverReceivedAt ?? '',
      e.position?.lat.toString() ?? '',
      e.position?.lng.toString() ?? '',
      e.position?.capturedAt ?? '',
      e.acknowledgment?.at ?? '',
    ]),
  ]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n');
}
