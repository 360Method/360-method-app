import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Maximize2, CheckCircle } from "lucide-react";

export default function AddressVerificationMap({ coordinates, address, onConfirm }) {
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const [showFullscreen, setShowFullscreen] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);
  const mapRef = React.useRef(null);
  const fullscreenMapRef = React.useRef(null);

  // Debug: Check if onConfirm is provided
  React.useEffect(() => {
    if (onConfirm && typeof onConfirm !== 'function') {
      console.error('AddressVerificationMap: onConfirm is not a function', typeof onConfirm);
    }
  }, [onConfirm]);

  React.useEffect(() => {
    if (!coordinates || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: coordinates.lat, lng: coordinates.lng },
      zoom: 17,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: false
    });

    new window.google.maps.Marker({
      position: { lat: coordinates.lat, lng: coordinates.lng },
      map: map,
      title: address,
      animation: window.google.maps.Animation.DROP
    });

    setMapLoaded(true);
  }, [coordinates, address]);

  React.useEffect(() => {
    if (!showFullscreen || !coordinates || !window.google) return;

    const map = new window.google.maps.Map(fullscreenMapRef.current, {
      center: { lat: coordinates.lat, lng: coordinates.lng },
      zoom: 17,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      mapTypeId: 'roadmap'
    });

    new window.google.maps.Marker({
      position: { lat: coordinates.lat, lng: coordinates.lng },
      map: map,
      title: address,
      animation: window.google.maps.Animation.DROP,
      draggable: false
    });
  }, [showFullscreen, coordinates, address]);

  const handleConfirm = () => {
    setConfirmed(true);
    // Only call onConfirm if it's provided and is a function
    if (onConfirm && typeof onConfirm === 'function') {
      onConfirm();
    }
  };

  if (!coordinates) return null;

  return (
    <>
      <Card className={`border-2 ${confirmed ? 'border-green-500 bg-green-50' : 'border-blue-300'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2" style={{ color: '#1B365D' }}>
              {confirmed ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Location Confirmed
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Verify Location
                </>
              )}
            </h4>
            <Button
              onClick={() => setShowFullscreen(true)}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700"
            >
              <Maximize2 className="w-4 h-4 mr-1" />
              Expand
            </Button>
          </div>

          <div
            ref={mapRef}
            className="w-full h-48 rounded-lg border-2 border-gray-200 mb-3"
            style={{ backgroundColor: '#e5e7eb' }}
          />

          {!confirmed ? (
            <>
              <p className="text-sm text-gray-700 mb-3">
                Is this the correct location for your property?
              </p>

              <div className="flex gap-3">
                <Button
                  onClick={handleConfirm}
                  className="flex-1"
                  style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                >
                  ✓ Yes, This is Correct
                </Button>
              </div>
            </>
          ) : (
            <div className="bg-green-100 border-2 border-green-400 rounded-lg p-3">
              <p className="text-sm font-semibold text-green-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Location verified! Click "Next" below to continue.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fullscreen Map Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg" style={{ color: '#1B365D' }}>
                  Property Location
                </h3>
                <p className="text-sm text-gray-600">{address}</p>
              </div>
              <Button
                onClick={() => setShowFullscreen(false)}
                variant="outline"
              >
                Close
              </Button>
            </div>
            <div
              ref={fullscreenMapRef}
              className="flex-1"
              style={{ backgroundColor: '#e5e7eb' }}
            />
          </div>
        </div>
      )}
    </>
  );
}