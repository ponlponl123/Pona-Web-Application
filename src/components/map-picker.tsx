import { useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { MapOptions } from 'leaflet';

// Fixing the default icon issue with React-Leaflet and Webpack
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function DraggableMarker({center, onDragging}: { center: L.LatLngExpression, onDragging?: (center: L.LatLngExpression) => void }) {
  const [position, setPosition] = useState(center);
  const markerRef = useRef<L.Marker>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
          if (onDragging) onDragging(marker.getLatLng());
        }
      },
    }),
    [onDragging]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef} />
  );
}

interface props extends MapOptions {
  className?: string;
  style?: React.CSSProperties;
  onDragging?: (center: L.LatLngExpression) => void;
}

export default function Map(props: props) {
  if ( !props.center ) return (
    <div>Map component requires center prop</div>
  )
  return (
    <>
      <MapContainer center={props.center} zoom={13} scrollWheelZoom={true} {...props}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker center={props.center} onDragging={props.onDragging} />
      </MapContainer>
      <span>Map by OpenStreetMap, MapContainer by Leaflet</span>
    </>
  );
}
