import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';

export default function AddressVerificationMap({ 
  address, 
  coordinates, 
  zoom = 17,
  height = '350px',
  onMapLoad 
}) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    if (!coordinates || !window.google) return;

    // Initialize map with better styling
    const newMap = new window.google.maps.Map(mapRef.current, {
      center: coordinates,
      zoom: zoom,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_RIGHT,
        mapTypeIds: ['roadmap', 'satellite']
      },
      streetViewControl: true,
      streetViewControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_TOP
      },
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_TOP
      },
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_CENTER
      },
      gestureHandling: 'cooperative', // Better mobile experience
    });

    // Add animated marker
    const newMarker = new window.google.maps.Marker({
      position: coordinates,
      map: newMap,
      title: address,
      animation: window.google.maps.Animation.DROP,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3
      }
    });

    // Add info window with rich content
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; max-width: 250px;">
          <div style="font-weight: 600; color: #1F2937; margin-bottom: 8px;">
            📍 Property Location
          </div>
          <div style="font-size: 13px; color: #4B5563; margin-bottom: 8px;">
            ${address}
          </div>
          <div>
            <a 
              href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}"
              target="_blank"
              rel="noopener noreferrer"
              style="display: inline-flex; align-items: center; gap: 4px; color: #3B82F6; text-decoration: none; font-size: 12px;"
            >
              Open in Google Maps
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      `
    });

    // Open info window on marker click
    newMarker.addListener('click', () => {
      infoWindow.open(newMap, newMarker);
    });

    // Auto-open info window after a brief delay
    setTimeout(() => {
      infoWindow.open(newMap, newMarker);
    }, 500);

    // Add property boundary circle (rough estimate)
    const propertyCircle = new window.google.maps.Circle({
      strokeColor: '#3B82F6',
      strokeOpacity: 0.6,
      strokeWeight: 2,
      fillColor: '#3B82F6',
      fillOpacity: 0.1,
      map: newMap,
      center: coordinates,
      radius: 30 // ~30 meters radius (typical residential lot)
    });

    setMap(newMap);
    setMarker(newMarker);

    if (onMapLoad) {
      onMapLoad(newMap, newMarker);
    }

    // Cleanup
    return () => {
      if (newMarker) newMarker.setMap(null);
      if (propertyCircle) propertyCircle.setMap(null);
    };
  }, [coordinates, address, zoom]);

  return (
    <div className="relative">
      {/* Map container */}
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }} 
        className="rounded-lg border-2 border-gray-300 shadow-md"
      />
      
      {/* Coordinates display (bottom left) */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600 shadow-sm">
        <span className="font-mono">
          {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
        </span>
      </div>

      {/* Open in Google Maps link (top right overlay) */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-200 hover:bg-white transition-colors flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
      >
        <ExternalLink className="w-4 h-4" />
        Open in Google Maps
      </a>

      {/* Map type hint */}
      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600 shadow-sm">
        💡 Switch to satellite view to see the property
      </div>
    </div>
  );
}