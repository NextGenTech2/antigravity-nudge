import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import confetti from 'canvas-confetti';
import { haptics } from '../services/haptics';

interface MapTrackerProps {
  progress: number; // 0 to 1
  eta: number;      // minutes remaining
  currentSavings: number; // live savings amount
  userCoords: [number, number];
  restaurantCoords: [number, number];
  recenterTrigger?: number;
}

const WITTY_FACTS = [
  "Eating this would have cost you ₹500. Now that's ₹500 closer to early retirement.",
  "Fun fact: Your brain just wanted a 10-second dopamine hit, not the 1,200 calories!",
  "Instead of a heavy stomach, you get a heavy wallet. Win-win!",
  "Craving intercepted! You're literally paying yourself to not eat junk right now."
];

// Helper component to auto-zoom and center the map on the dynamic route
interface MapControllerProps {
  userCoords: [number, number];
  restaurantCoords: [number, number];
  recenterTrigger: number;
}

const MapController: React.FC<MapControllerProps> = ({ userCoords, restaurantCoords, recenterTrigger }) => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([restaurantCoords, userCoords], {
      padding: [50, 50],
      maxZoom: 15,
      animate: true,
      duration: 1.0,
    });
  }, [map, userCoords, restaurantCoords, recenterTrigger]);
  return null;
};

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
  eta,
  userCoords,
  restaurantCoords,
  recenterTrigger = 0,
}) => {
  const [activeBubble, setActiveBubble] = useState<string | null>(null);

  // Trigger Final Stretch Celebration
  const isFinalStretch = progress >= 0.95 || eta <= 1;
  useEffect(() => {
    if (isFinalStretch) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#10B981', '#FF2E93']
      });
      haptics.successNotification();
    }
  }, [isFinalStretch]);

  const handleRiderClick = () => {
    haptics.lightTap();
    const fact = WITTY_FACTS[Math.floor(Math.random() * WITTY_FACTS.length)];
    setActiveBubble(fact);
    setTimeout(() => setActiveBubble(null), 7000); // Hold for 7 seconds
  };

  const riderPos = interpolateCoords(restaurantCoords, userCoords, progress);
  
  // POI Locations
  const poiParkCoords = interpolateCoords(restaurantCoords, userCoords, 0.3);
  const poiBankCoords = interpolateCoords(restaurantCoords, userCoords, 0.6);

  // Easter Egg Intersections (Tolerance of +/- 2%)
  const isAtPark = progress >= 0.28 && progress <= 0.32;
  const isAtBank = progress >= 0.58 && progress <= 0.62;

  // Icon Generators
  const getRiderIcon = () => {
    let emoji = '🚴';
    let label = 'Rider';
    let animationClass = 'animate-bounce';

    if (isAtPark) {
      emoji = '🧘';
      label = 'Zen Mode';
      animationClass = ''; // Paused, calming down
    } else if (isAtBank) {
      emoji = '💸';
      label = 'Securing bag';
      animationClass = 'animate-pulse-glow';
    } else if (progress < 0.3) {
      label = 'Racing to Goal';
      animationClass = 'animate-fast-bounce';
    } else if (progress < 0.8) {
      label = 'Dodging Urges';
      animationClass = 'animate-rock';
    } else {
      label = 'Final Stretch';
      animationClass = 'animate-float';
      emoji = '🚶'; // Triumphant stroll
    }

    // Determine horizontal position on screen (0 = far left, 1 = far right)
    const minLng = Math.min(restaurantCoords[1], userCoords[1]);
    const maxLng = Math.max(restaurantCoords[1], userCoords[1]);
    const lngRange = maxLng - minLng;
    // Prevent division by zero if start and end are exactly identical
    const horizontalPos = lngRange === 0 ? 0.5 : (riderPos[1] - minLng) / lngRange;

    let bubblePositionClasses = 'left-1/2 -translate-x-1/2';
    let pointerClasses = 'left-1/2 -translate-x-1/2';

    if (horizontalPos < 0.25) {
      // On the left side of the screen, anchor left
      bubblePositionClasses = 'left-[-0.5rem]';
      pointerClasses = 'left-8';
    } else if (horizontalPos > 0.75) {
      // On the right side of the screen, anchor right
      bubblePositionClasses = 'right-[-0.5rem]';
      pointerClasses = 'right-8';
    }

    const bubbleHtml = activeBubble 
      ? `<div class="absolute -top-[6.5rem] ${bubblePositionClasses} w-52 bg-slate-900 border border-indigo-500 rounded-xl p-3 shadow-xl z-[1000] text-center animate-in fade-in zoom-in duration-300">
           <p class="text-xs text-white font-semibold leading-snug">${activeBubble}</p>
           <div class="absolute -bottom-1.5 ${pointerClasses} w-3 h-3 bg-slate-900 border-r border-b border-indigo-500 rotate-45"></div>
         </div>`
      : '';

    return L.divIcon({
      className: 'custom-rider-icon',
      html: `
        ${bubbleHtml}
        <div class="relative flex items-center justify-center h-12 w-12 bg-indigo-600 border-2 border-slate-900 rounded-full shadow-accent-glow transition-all duration-300 ${animationClass}">
          <span class="text-xl">${emoji}</span>
          <div class="absolute -bottom-2.5 bg-indigo-500 text-[9px] px-2 py-0.5 rounded-full font-black text-white uppercase tracking-wider whitespace-nowrap shadow-md">${label}</div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
  };

  const getDestinationIcon = () => {
    return L.divIcon({
      className: 'custom-user-icon',
      html: `
        <div class="relative flex items-center justify-center h-10 w-10 ${isFinalStretch ? 'bg-emerald-600' : 'bg-slate-900'} border border-slate-700 rounded-full shadow-glass-glow transition-colors duration-500">
          <span class="text-lg">${isFinalStretch ? '🏁' : '🏠'}</span>
          <div class="absolute -inset-0.5 bg-emerald-500/20 rounded-full animate-ping -z-10"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

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

  const poiIcon = (emoji: string) => L.divIcon({
    className: 'custom-poi-icon opacity-40',
    html: `<div class="text-2xl filter grayscale contrast-50 drop-shadow-md transition-all duration-300 hover:grayscale-0 hover:opacity-100">${emoji}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={restaurantCoords}
        zoom={13}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapController 
          userCoords={userCoords} 
          restaurantCoords={restaurantCoords} 
          recenterTrigger={recenterTrigger} 
        />
        
        {/* Path Line */}
        <Polyline
          positions={[restaurantCoords, userCoords]}
          color="#6366F1"
          weight={4}
          opacity={0.6}
          dashArray="8, 8"
        />

        {/* POI Markers */}
        <Marker position={poiParkCoords} icon={poiIcon('🌳')} interactive={false} />
        <Marker position={poiBankCoords} icon={poiIcon('🏦')} interactive={false} />

        {/* Primary Markers */}
        <Marker position={restaurantCoords} icon={restaurantIcon} interactive={false} />
        <Marker position={userCoords} icon={getDestinationIcon()} interactive={false} />
        
        {/* Rider Marker (Interactive) */}
        <Marker 
          position={riderPos} 
          icon={getRiderIcon()} 
          eventHandlers={{ click: handleRiderClick }}
          zIndexOffset={1000}
        />
      </MapContainer>
    </div>
  );
};
export default MapTracker;
