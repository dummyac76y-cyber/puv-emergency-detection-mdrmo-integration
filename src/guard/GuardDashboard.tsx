import { lazy, Suspense, useEffect, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Cpu,
  LogOut,
  MapPin,
  Radio,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import {
  createSampleEvents,
  eventCsv,
  eventNames,
  positionState,
  sampleDevices,
  smsNames,
  transitionEvent,
  type GuardEvent,
} from './model';
import './guard.css';
const CrashOverview = lazy(() => import('./CrashOverview'));
const IncidentMap = lazy(() => import('./IncidentMap'));
const formatTime = (value: string | null) =>
  value
    ? new Date(value).toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Not recorded';
type Tab = 'dashboard' | 'incidents' | 'devices' | 'protocol';
export default function GuardDashboard() {
  const [demo, setDemo] = useState(false);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [events, setEvents] = useState(createSampleEvents);
  const [selectedId, setSelectedId] = useState('DEMO-001');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const selected = events.find((e) => e.id === selectedId);
  const visible = events.filter(
    (e) =>
      (filter === 'all' || e.status === filter) &&
      `${e.id} ${e.deviceId} ${eventNames[e.type]}`.toLowerCase().includes(query.toLowerCase())
  );
  function update(status: 'acknowledged' | 'closed') {
    if (!selected) return;
    setEvents((previous) =>
      previous.map((e) =>
        e.id === selected.id ? transitionEvent(e, status, new Date().toISOString()) : e
      )
    );
    setNotice(
      status === 'acknowledged'
        ? 'Demo event acknowledged. No message was sent.'
        : 'Demo event closed. History retained for this session.'
    );
  }
  function exportEvents() {
    const url = URL.createObjectURL(
      new Blob([eventCsv(visible)], { type: 'text/csv;charset=utf-8' })
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'puv-guard-demo-events.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice(
      'Filtered demo records exported. These are synthetic examples, not research results.'
    );
  }
  if (!demo)
    return (
      <div className="guard gate">
        <a className="skip" href="#entry">
          Skip to content
        </a>
        <header className="gate-header">
          <div className="brand">
            <Shield size={25} strokeWidth={1.7} />
            <strong>
              PUV Guard<span>Kalibo · Tricycle research prototype</span>
            </strong>
          </div>
          <span className="tag">RESEARCH PREVIEW</span>
        </header>
        <main id="entry" className="entry">
          <p className="eyebrow">INCIDENT MONITORING / KALIBO, AKLAN</p>
          <h1>
            Tricycle incident
            <br />
            monitoring.
          </h1>
          <p className="intro">
            Monitor automatically detected suspected crashes from registered tricycle prototypes.
          </p>
          <div className="entry-actions">
            <button className="primary" onClick={() => setDemo(true)}>
              Explore demo dashboard <ArrowUpRight size={17} />
            </button>
            <p>Synthetic records only. No alerts are sent.</p>
          </div>
          <section className="access-note">
            <Shield size={19} />
            <div>
              <h2>Authorized access</h2>
              <p>
                Live monitoring requires Firebase Authentication and a protected device backend.
                These services are not connected in this preview. No private records are loaded.
              </p>
            </div>
          </section>
          <footer>
            STI College Kalibo · Thesis prototype
            <br />
            Supplemental incident reporting. Agency participation remains subject to permission.
          </footer>
        </main>
        <aside className="entry-side">
          <span className="eyebrow">CRASH DETECTION WORKFLOW</span>
          {[
            ['01', 'Suspected crash', 'IMU and supporting shock indication.'],
            ['02', 'Location & delivery', 'GNSS position, SMS attempts and server receipt.'],
            ['03', 'Incident review', 'Acknowledgment and a recorded event history.'],
          ].map(([n, title, text]) => (
            <div className="signal" key={n}>
              <span>{n}</span>
              <div>
                <h2>{title}</h2>
                <p>{text}</p>
              </div>
            </div>
          ))}
          <p className="side-foot">
            One municipality. Tricycle-specific evaluation.
            <br />
            No automated dispatch.
          </p>
        </aside>
      </div>
    );
  return (
    <div className="guard dashboard">
      <a className="skip" href="#content">
        Skip to content
      </a>
      <aside className="sidebar">
        <div className="brand">
          <Shield size={27} strokeWidth={1.7} />
          <strong>
            PUV Guard<span>KALIBO / TRICYCLES</span>
          </strong>
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          {(
            [
              { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
              { id: 'incidents', name: 'Incident monitor', icon: ClipboardList },
              { id: 'devices', name: 'Prototype devices', icon: Cpu },
              { id: 'protocol', name: 'Test protocol', icon: Shield },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              aria-current={tab === item.id ? 'page' : undefined}
              onClick={() => setTab(item.id)}
            >
              <item.icon size={18} />
              {item.name}
              {tab === item.id && <ChevronRight size={15} />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="tag">DEMO WORKSPACE</span>
          <p>
            STI College Kalibo
            <br />
            Research prototype
          </p>
          <button
            onClick={() => {
              setDemo(false);
              setEvents(createSampleEvents());
              setNotice('');
            }}
          >
            <LogOut size={16} />
            Leave demo
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="workspace-header">
          <span>
            Research workspace <ChevronRight size={14} />
            <strong>
              {tab === 'dashboard'
                ? 'Crash dashboard'
                : tab === 'incidents'
                  ? 'Incident monitor'
                  : tab === 'devices'
                    ? 'Prototype devices'
                    : 'Test protocol'}
            </strong>
          </span>
          <span className="preview-label">
            <span className="dot" />
            Demo evaluator
          </span>
        </header>
        <main id="content">
          <div className="demo-banner">
            <Radio size={16} />
            <p>
              <strong>Demo mode.</strong> All events and device readings are synthetic. Actions
              affect this session only.
            </p>
          </div>
          <div className="page-heading">
            <div>
              <p className="eyebrow">KALIBO, AKLAN / RESEARCH PROTOTYPE</p>
              <h1>
                {tab === 'dashboard'
                  ? 'Crash dashboard'
                  : tab === 'incidents'
                    ? 'Incident monitor'
                    : tab === 'devices'
                      ? 'Prototype devices'
                      : 'Test protocol'}
              </h1>
              <p>
                {tab === 'dashboard'
                  ? 'Crash locations and the events that need review.'
                  : tab === 'incidents'
                    ? 'Review the signal. Check delivery. Record acknowledgment.'
                    : tab === 'devices'
                      ? 'Check the hardware and connectivity behind each event.'
                      : 'The essential controls and evidence for controlled evaluation.'}
              </p>
            </div>
            {tab === 'incidents' && (
              <button className="secondary" onClick={exportEvents}>
                <ArrowDownToLine size={16} />
                Export records
              </button>
            )}
          </div>
          <p role="status" aria-live="polite" className="notice">
            {notice}
          </p>
          {tab === 'dashboard' && (
            <Suspense fallback={<p>Loading dashboard…</p>}>
              <CrashOverview
                events={events}
                onReview={(id) => {
                  setSelectedId(id);
                  setTab('incidents');
                }}
              />
            </Suspense>
          )}
          {tab === 'incidents' && (
            <>
              <section className="summary" aria-label="Demo event summary">
                <div>
                  <span>Awaiting acknowledgment</span>
                  <strong>
                    {events
                      .filter((e) => e.status === 'new')
                      .length.toString()
                      .padStart(2, '0')}
                  </strong>
                  <small>Review these events first</small>
                </div>
                <div>
                  <span>Open events</span>
                  <strong>
                    {events
                      .filter((e) => ['new', 'acknowledged'].includes(e.status))
                      .length.toString()
                      .padStart(2, '0')}
                  </strong>
                  <small>Automatically detected suspected crashes</small>
                </div>
                <div>
                  <span>Recovered offline</span>
                  <strong>
                    {events
                      .filter((e) => e.recoveredOffline)
                      .length.toString()
                      .padStart(2, '0')}
                  </strong>
                  <small>Stored first, received later</small>
                </div>
              </section>
              <div className="monitor-grid">
                <section className="panel event-list">
                  <div className="panel-heading">
                    <h2>
                      Event queue <span>{events.length}</span>
                    </h2>
                    <span className="subtle">Newest first</span>
                  </div>
                  <div className="filters">
                    <label>
                      <span className="sr-only">Search event or device</span>
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search event or device"
                      />
                    </label>
                    <label>
                      <span className="sr-only">Filter event status</span>
                      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All statuses</option>
                        <option value="new">New</option>
                        <option value="acknowledged">Acknowledged</option>
                        <option value="closed">Closed</option>
                      </select>
                    </label>
                  </div>
                  <div className="queue">
                    {visible.length ? (
                      visible.map((e) => (
                        <button
                          className={`event ${selectedId === e.id ? 'selected' : ''}`}
                          aria-pressed={selectedId === e.id}
                          onClick={() => setSelectedId(e.id)}
                          key={e.id}
                        >
                          <div className="event-top">
                            <span className="event-type">
                              <AlertTriangle size={15} /> {eventNames[e.type]}
                            </span>
                            <ChevronRight size={16} />
                          </div>
                          <strong>
                            {e.deviceId}
                            <span>{e.id}</span>
                          </strong>
                          <p>{e.location}</p>
                          <div className="event-meta">
                            <span>{formatTime(e.occurredAt)}</span>
                            <span className={`status ${e.status}`}>{e.status}</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="empty">
                        <ClipboardList size={24} />
                        <h3>No matching events</h3>
                        <p>Try another device ID or status.</p>
                        <button
                          className="secondary"
                          onClick={() => {
                            setQuery('');
                            setFilter('all');
                          }}
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="queue-foot">Timestamps shown in Philippine time (UTC+8).</div>
                </section>
                <section className="panel detail" aria-label="Selected event">
                  {selected && (
                    <>
                      <div className="detail-heading">
                        <div>
                          <p className="eyebrow">EVENT DETAILS / {selected.id}</p>
                          <h2>{eventNames[selected.type]}</h2>
                        </div>
                        <span className={`status ${selected.status}`}>{selected.status}</span>
                      </div>
                      <p className="detail-context">
                        {selected.deviceId} · {formatTime(selected.occurredAt)}
                      </p>
                      <div className="map-wrap">
                        <Suspense
                          fallback={<div className="map-loading">Loading incident map…</div>}
                        >
                          <IncidentMap event={selected} />
                        </Suspense>
                        <div className="map-caption">
                          <MapPin size={14} />
                          <span>Google Maps · selected sample incident</span>
                        </div>
                      </div>
                      <div className="position-line">
                        <strong>{positionState(selected.position, now)}</strong>
                        <span>
                          {selected.position
                            ? `${selected.position.lat.toFixed(5)}, ${selected.position.lng.toFixed(5)}`
                            : 'Coordinates not available'}
                        </span>
                      </div>
                      <p className="fix-time">
                        Fix captured: {formatTime(selected.position?.capturedAt ?? null)}. “Recent”
                        means within 2 minutes of now; a display rule, not a validated accuracy
                        measure.
                      </p>
                      <div className="evidence">
                        <h3>Signal & delivery evidence</h3>
                        <dl>
                          <div>
                            <dt>Trigger</dt>
                            <dd>{selected.trigger}</dd>
                          </div>
                          <div>
                            <dt>SMS status</dt>
                            <dd>{smsNames[selected.sms]}</dd>
                          </div>
                          <div>
                            <dt>Server received</dt>
                            <dd>{formatTime(selected.serverReceivedAt)}</dd>
                          </div>
                          <div>
                            <dt>Offline recovery</dt>
                            <dd>
                              {selected.recoveredOffline
                                ? 'Recovered from device queue'
                                : 'Not recorded'}
                            </dd>
                          </div>
                          <div>
                            <dt>Acknowledgment</dt>
                            <dd>
                              {selected.acknowledgment
                                ? `${selected.acknowledgment.actor} · ${formatTime(selected.acknowledgment.at)}`
                                : 'Awaiting review'}
                            </dd>
                          </div>
                        </dl>
                        <p className="evidence-note">
                          Modem acceptance does not confirm receipt by the recipient. Suspected
                          crashes do not establish injury or severity.
                        </p>
                      </div>
                      <section className="history">
                        <h3>Event history</h3>
                        <ol>
                          {selected.history.map((h, i) => (
                            <li key={`${h.at}-${i}`}>
                              <span className="history-dot" />
                              <div>
                                <strong>{h.action}</strong>
                                <p>
                                  {h.actor} · {formatTime(h.at)}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </section>
                      <div className="detail-actions">
                        {selected.status === 'new' ? (
                          <button className="primary" onClick={() => update('acknowledged')}>
                            <Check size={16} />
                            Acknowledge demo event
                          </button>
                        ) : selected.status === 'acknowledged' ? (
                          <button className="secondary" onClick={() => update('closed')}>
                            Close demo event
                          </button>
                        ) : (
                          <span>Event closed. History preserved.</span>
                        )}
                        <small>Records review only. No dispatch or SMS action.</small>
                      </div>
                    </>
                  )}
                </section>
              </div>
            </>
          )}
          {tab === 'devices' && (
            <>
              <div className="device-grid">
                {sampleDevices.map((d) => (
                  <section className="panel device" key={d.id}>
                    <div className="panel-heading">
                      <Cpu size={21} />
                      <span className="status">{d.condition}</span>
                    </div>
                    <h2>{d.id}</h2>
                    <p>{d.label}</p>
                    <dl>
                      {[
                        ['Power', `${d.battery}% sample battery`],
                        ['Cellular', d.network],
                        ['IMU', d.imu],
                        ['801S shock sensor', d.shock],
                        ['Pending upload', `${d.pending} sample event(s)`],
                        ['Last contact', d.heartbeat],
                      ].map(([key, value]) => (
                        <div key={key}>
                          <dt>{key}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ))}
              </div>
              <div className="protocol-note">
                <h2>Readings need device evidence</h2>
                <p>
                  A live device screen must use timestamped heartbeats. Offline records stay on the
                  device until connectivity returns; the website cannot inspect an unsynchronized
                  queue. An 801S signal supports event detection and does not measure collision
                  force.
                </p>
              </div>
            </>
          )}
          {tab === 'protocol' && (
            <div className="protocol-grid">
              <section className="panel protocol">
                <h2>Device controls</h2>
                {[
                  [
                    'Automatic suspected crash',
                    'IMU plus shock or orientation evidence initiates a local warning. Allow 10 seconds to cancel before creating an emergency event.',
                  ],
                  [
                    'Connectivity recovery',
                    'Save events with unique IDs in non-volatile storage. Retry later and prevent duplicate incident records.',
                  ],
                ].map(([title, body], i) => (
                  <div className="protocol-item" key={title}>
                    <span>0{i + 1}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{body}</p>
                    </div>
                  </div>
                ))}
                <p className="evidence-note">
                  Proposed timing settings require controlled testing. Device controls run in
                  firmware, not in this dashboard.
                </p>
              </section>
              <section className="panel protocol">
                <h2>Record evidence, not assumptions</h2>
                <ul>
                  <li>Expected and observed detection outcome for each trial.</li>
                  <li>False alerts during vibration, bumps, braking and repositioning.</li>
                  <li>Event time, modem result and verified SMS receipt if available.</li>
                  <li>Server receipt time, including recovered offline events.</li>
                  <li>GNSS timestamp and position against reference coordinates.</li>
                  <li>Evaluator task completion and usability feedback.</li>
                </ul>
                <div className="protocol-note">
                  <h3>Controlled testing only</h3>
                  <p>
                    Use approved locations and designated test recipients. Government notifications
                    need written permission. No deliberate road crashes, automated dispatch or
                    claims of medical severity.
                  </p>
                </div>
                <a
                  href="https://developers.google.com/maps/documentation/embed/get-api-key"
                  target="_blank"
                  rel="noreferrer"
                >
                  Google Maps API setup <ArrowUpRight size={14} />
                </a>
              </section>
            </div>
          )}
          <footer className="workspace-footer">
            <span>PUV Guard · Kalibo tricycle research prototype</span>
            <span>Demo data · No live device connection</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
