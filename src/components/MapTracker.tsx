import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapTrackerProps {
  progress: number; // 0 to 1
  eta: number;      // minutes remaining
  currentSavings: number; // live savings amount
  userCoords: [number, number];
  restaurantCoords: [number, number];
}

// Helper component to auto-zoom and center the map on the dynamic route
interface MapControllerProps {
  userCoords: [number, number];
  restaurantCoords: [number, number];
}

const MapController: React.FC<MapControllerProps> = ({ userCoords, restaurantCoords }) => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([restaurantCoords, userCoords], {
      padding: [50, 50],
      maxZoom: 15,
    });
  }, [map, userCoords, restaurantCoords]);
  return null;
};

// Custom HTML DivIcons styled with Tailwind CSS
const restaurantIcon = L.divIcon({
  className: 'custom-rest-icon',
  html: `
    <div class="relative flex items-center justify-center h-10 w-10 bg-slate-900 border border-slate-700 rounded-full shadow-glass-glow">
      <span class="text-lg">🏢</span>
      <span class="absolute -bottom-1 bg-indigo-500 text-[8px] px-1 rounded font-bold text-white uppercase tracking-wider">Start</span>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const userIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `
    <div class="relative flex items-center justify-center h-10 w-10 bg-slate-900 border border-slate-700 rounded-full shadow-glass-glow">
      <span class="text-lg">🏠</span>
      <div class="absolute -inset-0.5 bg-emerald-500/20 rounded-full animate-ping -z-10"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const riderIcon = L.divIcon({
  className: 'custom-rider-icon',
  html: `
    <div class="relative flex items-center justify-center h-12 w-12 bg-indigo-600 border-2 border-slate-900 rounded-full shadow-accent-glow animate-bounce">
      <span class="text-xl">🚴</span>
      <div class="absolute -bottom-1 bg-indigo-500 text-[8px] px-1.5 py-0.2 rounded font-bold text-white uppercase tracking-wider">Rider</div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

// Linear interpolation between two coordinates
const interpolateCoords = (
  start: [number, number],
  end: [number, number],
  fraction: number
): [number, number] => {
  const lat = start[0] + (end[0] - start[0]) * fraction;
  const lng = start[1] + (end[1] - start[1]) * fraction;
  return [lat, lng];
};

export const MapTracker: React.FC<MapTrackerProps> = ({
  progress,
  userCoords,
  restaurantCoords,
}) => {
  const riderPos = interpolateCoords(restaurantCoords, userCoords, progress);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={restaurantCoords}
        zoom={13}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapController userCoords={userCoords} restaurantCoords={restaurantCoords} />
        
        {/* Path Line */}
        <Polyline
          positions={[restaurantCoords, userCoords]}
          color="#6366F1"
          weight={4}
          opacity={0.6}
          dashArray="8, 8"
        />

        {/* Markers */}
        <Marker position={restaurantCoords} icon={restaurantIcon} />
        <Marker position={userCoords} icon={userIcon} />
        <Marker position={riderPos} icon={riderIcon} />
      </MapContainer>
    </div>
  );
};
export default MapTracker;
