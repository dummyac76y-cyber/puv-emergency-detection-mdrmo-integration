import { googleMapUrl } from '../guard/IncidentMap';
import { describe, expect, it } from 'vitest';
import {
  createSampleEvents,
  csvCell,
  eventCsv,
  positionState,
  transitionEvent,
} from '../guard/model';
describe('research event evidence', () => {
  it('keeps acknowledgment separate from delivery and prevents skipping review', () => {
    const event = createSampleEvents()[0]!;
    expect(transitionEvent(event, 'closed', '2026-10-26T00:00:00Z')).toBe(event);
    const reviewed = transitionEvent(event, 'acknowledged', '2026-10-26T00:00:00Z');
    expect(reviewed.status).toBe('acknowledged');
    expect(reviewed.sms).toBe('modem-accepted');
    expect(reviewed.history).toHaveLength(event.history.length + 1);
    expect(transitionEvent(reviewed, 'acknowledged', '2026-10-26T00:00:01Z')).toBe(reviewed);
    expect(transitionEvent(reviewed, 'closed', '2026-10-26T00:01:00Z').acknowledgment).toEqual(
      reviewed.acknowledgment
    );
  });
  it('does not show missing, old, future or invalid fixes as recent', () => {
    const now = Date.parse('2026-10-26T00:00:00Z');
    expect(positionState(null, now)).toBe('No GNSS fix');
    const fix = { lat: 11.7, lng: 122.3, capturedAt: '2026-10-25T23:59:00Z' };
    expect(positionState(fix, now)).toBe('Recent fix');
    expect(positionState({ ...fix, capturedAt: '2026-10-25T22:00:00Z' }, now)).toBe('Stale fix');
    expect(positionState({ ...fix, capturedAt: 'invalid' }, now)).toBe('Fix time uncertain');
    expect(positionState({ ...fix, capturedAt: '2026-10-27T00:00:00Z' }, now)).toBe(
      'Fix time uncertain'
    );
  });
  it('exports synthetic labels and neutralizes spreadsheet formulas', () => {
    expect(eventCsv(createSampleEvents())).toContain('"DEMO","DEMO-001"');
    expect(csvCell(' =HYPERLINK("bad")')).toBe('"\' =HYPERLINK(""bad"")"');
  });
});

describe('crash-only scope and Google Maps', () => {
  it('creates only automatically detected crash examples', () => {
    expect(createSampleEvents().every((event) => event.type === 'suspected-crash')).toBe(true);
  });
  it('requires both a configured key and valid incident coordinates', () => {
    const position = { lat: 11.7, lng: 122.3, capturedAt: '2026-10-26T00:00:00Z' };
    expect(googleMapUrl(position, undefined)).toBeNull();
    expect(googleMapUrl(null, 'test-key')).toBeNull();
    expect(googleMapUrl({ ...position, lat: 91 }, 'test-key')).toBeNull();
    const url = new URL(googleMapUrl(position, 'test-key')!);
    expect(url.origin).toBe('https://www.google.com');
    expect(url.pathname).toBe('/maps/embed/v1/place');
    expect(url.searchParams.get('q')).toBe('11.7,122.3');
  });
});
