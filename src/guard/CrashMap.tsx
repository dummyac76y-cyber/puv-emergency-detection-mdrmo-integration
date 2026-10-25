import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { positionState, type GuardEvent } from './model';
let configured = false;
export default function CrashMap({
  events,
  selected,
  onSelect,
}: {
  events: GuardEvent[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState('');
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  useEffect(() => {
    if (!key || !container.current) return;
    let active = true;
    if (!configured) {
      setOptions({ key, v: 'weekly' });
      configured = true;
    }
    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () =>
          reject(
            new Error('Google Maps did not load. Check the connection and API configuration.')
          ),
        15000
      );
    });
    Promise.race([importLibrary('maps'), timeout])
      .then((library) => {
        if (active && container.current) {
          const { Map } = library as google.maps.MapsLibrary;
          setMap(
            new Map(container.current, {
              center: { lat: 11.703, lng: 122.366 },
              zoom: 14,
              mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
              gestureHandling: 'cooperative',
            })
          );
        }
      })
      .catch(() => {
        if (active)
          setError(
            'Google Maps could not load. Check the API key, allowed website and network connection.'
          );
      })
      .finally(() => clearTimeout(timer));
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [key]);
  useEffect(() => {
    if (!map) return;
    let active = true;
    const markers: google.maps.marker.AdvancedMarkerElement[] = [];
    const listeners: google.maps.MapsEventListener[] = [];
    importLibrary('marker')
      .then((library) => {
        if (!active) return;
        const { AdvancedMarkerElement } = library as google.maps.MarkerLibrary;
        events
          .filter((e) => e.position)
          .forEach((event) => {
            const position = event.position!;
            const label = document.createElement('div');
            label.className = `crash-pin ${event.id === selected ? 'active' : ''}`;
            label.textContent = event.deviceId;
            const marker = new AdvancedMarkerElement({
              map,
              position: { lat: position.lat, lng: position.lng },
              title: `${event.id}: suspected crash; ${event.status}; ${positionState(position)}`,
              content: label,
              gmpClickable: true,
            });
            listeners.push(marker.addListener('click', () => onSelect(event.id)));
            markers.push(marker);
          });
        const current = events.find((e) => e.id === selected)?.position;
        if (current) map.panTo({ lat: current.lat, lng: current.lng });
      })
      .catch(() => {
        if (active)
          setError('Crash markers could not load. Use the incident list to review locations.');
      });
    return () => {
      active = false;
      listeners.forEach((listener) => listener.remove());
      markers.forEach((marker) => {
        marker.map = null;
      });
    };
  }, [map, events, selected, onSelect]);
  if (!key || error)
    return (
      <div className="dashboard-map-fallback">
        <MapPin size={30} />
        <h3>{error ? 'Map unavailable' : 'Google Maps needs an API key'}</h3>
        <p>
          {error ||
            'The accident map is ready for Google Maps JavaScript API. Configure the website key to display crash locations.'}
        </p>
        <span>Kalibo, Aklan · Coordinates remain available in the crash list.</span>
      </div>
    );
  return (
    <div className="crash-map-shell">
      <div
        ref={container}
        className="crash-map"
        aria-label="Google Maps crash locations in Kalibo"
      />
      {!map && !error && (
        <p className="map-progress" role="status">
          Loading Google Maps…
        </p>
      )}
    </div>
  );
}
