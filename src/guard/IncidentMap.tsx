import { useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { eventNames, type GuardEvent } from './model';
export default function IncidentMap({
  events,
  selected,
  onSelect,
}: {
  events: GuardEvent[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const [tileError, setTileError] = useState(false);
  return (
    <>
      <MapContainer
        center={[11.703, 122.366]}
        zoom={14}
        className="guard-map"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{ tileerror: () => setTileError(true) }}
        />
        {events
          .filter((e) => e.position)
          .map((e) => (
            <CircleMarker
              key={e.id}
              center={[e.position!.lat, e.position!.lng]}
              radius={e.id === selected ? 11 : 7}
              pathOptions={{
                color: e.type === 'assistance' ? '#9a650c' : '#b63732',
                fillOpacity: 0.8,
                weight: 3,
              }}
              eventHandlers={{ click: () => onSelect(e.id) }}
            >
              <Popup>
                <strong>{e.id}</strong>
                <br />
                {eventNames[e.type]}
                <br />
                Sample incident position
                <br />
                <button onClick={() => onSelect(e.id)}>View event details</button>
              </Popup>
            </CircleMarker>
          ))}
      </MapContainer>
      {tileError && (
        <p className="tile-error" role="status">
          Map tiles unavailable. Use the selected event’s coordinates below.
        </p>
      )}
    </>
  );
}
