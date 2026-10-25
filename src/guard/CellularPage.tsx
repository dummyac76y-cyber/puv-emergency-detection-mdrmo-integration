import { useRef, useState, type FormEvent } from 'react';
import { Radio, Plus, Trash2 } from 'lucide-react';
import {
  buildCrashSms,
  planCrashSms,
  normalizePhilippinePhone,
  validCoordinates,
  type MdrrmoRecipient,
} from './smsRouting';
import type { GuardEvent } from './model';
export default function CellularPage({ events }: { events: GuardEvent[] }) {
  const nextRecipientId = useRef(1);
  const [recipients, setRecipients] = useState<MdrrmoRecipient[]>([]);
  const [eventId, setEventId] = useState(events[0]?.id ?? '');
  const [notice, setNotice] = useState('');
  const event = events.find((e) => e.id === eventId);
  const plan = event ? planCrashSms(event, recipients, 'test') : null;
  const message = event ? buildCrashSms(event, 'test') : '';
  function register(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = new FormData(form);
    const office = String(values.get('office') ?? '').trim();
    const phone = normalizePhilippinePhone(String(values.get('phone') ?? ''));
    const position = { lat: Number(values.get('lat')), lng: Number(values.get('lng')) };
    if (!office || !phone || !validCoordinates(position)) {
      setNotice(
        'Enter an office label, valid Philippine mobile number and valid office coordinates.'
      );
      return;
    }
    if (recipients.some((r) => r.phone === phone)) {
      setNotice('That number already exists in this demo registry.');
      return;
    }
    const fallback = values.get('fallback') === 'on';
    const recipient: MdrrmoRecipient = {
      id: `demo-recipient-${nextRecipientId.current++}`,
      office,
      phone,
      position,
      municipality: 'Kalibo',
      active: true,
      mode: 'test',
      approvalReference: 'DEMO-ONLY-NO-AUTHORIZATION',
      fallback,
    };
    setRecipients((previous) => [
      ...previous.map((r) => (fallback ? { ...r, fallback: false } : r)),
      recipient,
    ]);
    form.reset();
    setNotice(
      'Demo recipient added for message preview only. Nothing was sent or saved to the cloud.'
    );
  }
  return (
    <div className="cellular-page">
      <div className="cellular-flow">
        <Radio size={22} />
        <div>
          <h2>Device cellular modem → registered MDRRMO recipient</h2>
          <p>
            The ESP32 sends SMS through its GSM/4G-capable modem. Mobile data separately uploads the
            same event to the protected backend. This browser does not send SMS.
          </p>
        </div>
        <span className="status">Modem not connected</span>
      </div>
      <div className="cellular-grid">
        <section className="panel protocol">
          <h2>MDRRMO recipient registry</h2>
          <p className="cellular-help">
            Session-only test registration. Use designated test numbers. Live recipients need
            authenticated administrator approval and documented office authorization.
          </p>
          <form onSubmit={register} className="recipient-form">
            <label>
              Office / test recipient
              <input name="office" required maxLength={80} placeholder="Kalibo test recipient" />
            </label>
            <label>
              Philippine mobile SMS number
              <input name="phone" required type="tel" autoComplete="off" placeholder="+63…" />
            </label>
            <div className="coordinate-fields">
              <label>
                Office latitude
                <input
                  name="lat"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  required
                  placeholder="11.70…"
                />
              </label>
              <label>
                Office longitude
                <input
                  name="lng"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  required
                  placeholder="122.36…"
                />
              </label>
            </div>
            <label className="checkbox-label">
              <input type="checkbox" name="fallback" />
              Use as fallback when the crash location is missing or stale
            </label>
            <button className="secondary" type="submit">
              <Plus size={15} />
              Add demo recipient
            </button>
          </form>
          <p className="cellular-notice" role="status">
            {notice}
          </p>
          <div className="recipient-list">
            {recipients.length ? (
              recipients.map((r) => (
                <div className="recipient" key={r.id}>
                  <div>
                    <strong>{r.office}</strong>
                    <p>{r.phone} · Kalibo · test only</p>
                    <p>
                      {r.position.lat}, {r.position.lng}
                      {r.fallback ? ' · Fallback' : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${r.office}`}
                    onClick={() =>
                      setRecipients((previous) => previous.filter((item) => item.id !== r.id))
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty">
                <h3>No registered recipients</h3>
                <p>No real MDRRMO numbers are prefilled or published.</p>
              </div>
            )}
          </div>
        </section>
        <section className="panel protocol">
          <h2>Crash SMS preview</h2>
          <label className="preview-event">
            Select event
            <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.id} · {e.userId}
                </option>
              ))}
            </select>
          </label>
          {plan &&
            ('blocked' in plan ? (
              <div className="routing-blocked">
                <h3>Routing needs configuration</h3>
                <p>{plan.blocked}</p>
              </div>
            ) : (
              <>
                <dl>
                  <div>
                    <dt>Recipient</dt>
                    <dd>{plan.recipient.office}</dd>
                  </div>
                  <div>
                    <dt>Destination</dt>
                    <dd>{plan.recipient.phone}</dd>
                  </div>
                  <div>
                    <dt>Routing</dt>
                    <dd>
                      {plan.method === 'nearest'
                        ? `Nearest registered office · ${plan.distanceKm?.toFixed(2)} km straight-line`
                        : 'Configured fallback · current location unavailable'}
                    </dd>
                  </div>
                </dl>

                <p className="cellular-help">
                  {message.length} characters. This message may require multiple SMS segments.
                  Delivery status must come from modem/network evidence.
                </p>
              </>
            ))}
          <pre className="sms-preview" aria-label="SMS message content">
            {message}
          </pre>
          <div className="protocol-note">
            <h3>Every crash alert carries</h3>
            <p>
              Registered user ID, device ID, event ID, crash timestamp in Philippine time, and
              available GNSS coordinates with fix time and freshness. A Google Maps link is included
              when coordinates are available.
            </p>
          </div>
          <p className="cellular-help">
            The nearest office is selected only from active, approved registrations for the
            configured municipality. Missing or stale GNSS uses the designated fallback; it never
            silently chooses an office using an old location.
          </p>
          <p className="cellular-help">
            This is a message/routing preview, not a modem transmission. Recipient changes are lost
            when you leave the demo or refresh.
          </p>
        </section>
      </div>
    </div>
  );
}
