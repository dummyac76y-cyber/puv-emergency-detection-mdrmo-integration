import { MapPin } from 'lucide-react';
import type { GuardEvent } from './model';
export function googleMapUrl(
  position: GuardEvent['position'],
  key: string | undefined
): string | null {
  if (!position || !key?.trim()) return null;
  const { lat, lng } = position;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)
    return null;
  const params = new URLSearchParams({
    key: key.trim(),
    q: `${lat},${lng}`,
    zoom: '16',
    maptype: 'roadmap',
  });
  return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
}
export default function IncidentMap({ event }: { event: GuardEvent }) {
  const url = googleMapUrl(event.position, import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  if (!url)
    return (
      <div className="map-unavailable">
        <MapPin size={25} />
        <strong>
          {event.position ? 'Google Maps is not configured' : 'No GNSS location recorded'}
        </strong>
        <p>
          {event.position
            ? 'Add the Google Maps API key to enable the incident map. Coordinates remain available below.'
            : 'A map will be available when this event has valid coordinates.'}
        </p>
      </div>
    );
  return (
    <iframe
      key={event.id}
      className="guard-map google-map"
      title={`Google Maps: sample crash ${event.id}`}
      src={url}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
