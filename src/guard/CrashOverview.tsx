import { lazy, Suspense, useCallback, useState } from 'react';
import { AlertTriangle, ArrowUpRight, MapPin, Radio } from 'lucide-react';
import { positionState, smsNames, type GuardEvent } from './model';
const CrashMap = lazy(() => import('./CrashMap'));
export default function CrashOverview({
  events,
  onReview,
}: {
  events: GuardEvent[];
  onReview: (id: string) => void;
}) {
  const active = events.filter(
    (event) => event.status === 'new' || event.status === 'acknowledged'
  );
  const [selectedId, setSelectedId] = useState(active[0]?.id ?? '');
  const choose = useCallback((id: string) => setSelectedId(id), []);
  const selected = active.find((event) => event.id === selectedId) ?? active[0];
  const missing = active.filter((event) => !event.position).length;
  return (
    <>
      <section className="summary" aria-label="Crash dashboard summary">
        <div>
          <span>Active suspected crashes</span>
          <strong>{active.length.toString().padStart(2, '0')}</strong>
          <small>Demo records awaiting closure</small>
        </div>
        <div>
          <span>Awaiting acknowledgment</span>
          <strong>
            {active
              .filter((e) => e.status === 'new')
              .length.toString()
              .padStart(2, '0')}
          </strong>
          <small>Review the event and delivery evidence</small>
        </div>
        <div>
          <span>No GNSS location</span>
          <strong>{missing.toString().padStart(2, '0')}</strong>
          <small>Retained in the list, never placed on the map</small>
        </div>
      </section>
      <div className="crash-overview-grid">
        <section className="panel crash-map-panel">
          <header className="panel-heading">
            <div>
              <h2>Live accident map</h2>
              <p>Kalibo, Aklan · suspected crash locations</p>
            </div>
            <span className="status">Demo · feed not connected</span>
          </header>
          <Suspense fallback={<div className="dashboard-map-fallback">Loading map component…</div>}>
            <CrashMap events={active} selected={selected?.id ?? ''} onSelect={choose} />
          </Suspense>
          <div className="crash-map-legend">
            <span>
              <i />
              Suspected crash
            </span>
            <span>
              <MapPin size={13} />
              Timestamped incident location, not vehicle tracking
            </span>
          </div>
        </section>
        <section className="panel active-crashes">
          <div className="panel-heading">
            <h2>
              Active crashes <span>{active.length}</span>
            </h2>
            <Radio size={16} />
          </div>
          <div className="active-crash-queue">
            {active.map((event) => (
              <button
                key={event.id}
                aria-pressed={selected?.id === event.id}
                className={`event ${selected?.id === event.id ? 'selected' : ''}`}
                onClick={() => choose(event.id)}
              >
                <div className="event-top">
                  <span className="event-type">
                    <AlertTriangle size={15} />
                    Suspected crash
                  </span>
                  <span className={`status ${event.status}`}>{event.status}</span>
                </div>
                <strong>
                  {event.deviceId}
                  <span>{event.id}</span>
                </strong>
                <p>{event.location}</p>
                <div className="event-meta">
                  <span>
                    {new Date(event.occurredAt).toLocaleTimeString('en-PH', {
                      timeZone: 'Asia/Manila',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    PHT
                  </span>
                  <span>{positionState(event.position)}</span>
                </div>
              </button>
            ))}
            {!active.length && (
              <div className="empty">
                <h3>No active crashes</h3>
                <p>Closed events remain in incident records.</p>
              </div>
            )}
          </div>
        </section>
      </div>
      {selected && (
        <section className="panel selected-crash">
          <div>
            <p className="eyebrow">SELECTED CRASH / {selected.id}</p>
            <h2>{selected.deviceId} · Suspected crash</h2>
            <p>
              {selected.position
                ? `${selected.position.lat.toFixed(5)}, ${selected.position.lng.toFixed(5)}`
                : 'No coordinates recorded'}{' '}
              · {positionState(selected.position)}
            </p>
          </div>
          <div>
            <span className="subtle">SMS evidence</span>
            <p>{smsNames[selected.sms]}</p>
          </div>
          <button className="primary" onClick={() => onReview(selected.id)}>
            Review crash <ArrowUpRight size={16} />
          </button>
        </section>
      )}
      <div className="feed-note">
        <Radio size={16} />
        <p>
          <strong>Live feed not connected.</strong> This dashboard currently shows sample crashes.
          Real-time markers require an authenticated backend receiving actual device events.
        </p>
      </div>
    </>
  );
}
