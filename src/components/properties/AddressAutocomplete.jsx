import React from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, AlertCircle, CheckCircle } from "lucide-react";

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyBQaKy7wOT8z0Rw_96AS5-GoMe1z2GzTa0";

export default function AddressAutocomplete({ onAddressSelect, initialValue = "" }) {
  const [showManualEntry, setShowManualEntry] = React.useState(false);
  const [selectedAddress, setSelectedAddress] = React.useState(null);
  const [scriptLoaded, setScriptLoaded] = React.useState(false);
  const [scriptError, setScriptError] = React.useState(false);
  const [loadingStatus, setLoadingStatus] = React.useState("Initializing...");
  
  const inputRef = React.useRef(null);
  const autocompleteRef = React.useRef(null);

  // Load Google Maps script
  React.useEffect(() => {
    console.log('🟦 AddressAutocomplete: Component mounted');
    setLoadingStatus("Loading Google Maps...");
    
    if (window.google?.maps?.places) {
      console.log('✅ AddressAutocomplete: Google Maps already loaded');
      setLoadingStatus("Google Maps ready!");
      setScriptLoaded(true);
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      console.error('❌ AddressAutocomplete: No API key configured');
      setLoadingStatus("API key missing");
      setScriptError(true);
      return;
    }

    console.log('🔑 AddressAutocomplete: Using API key:', GOOGLE_MAPS_API_KEY.substring(0, 15) + '...');

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('🟡 AddressAutocomplete: Script already loading, waiting...');
      setLoadingStatus("Loading Google Maps...");
      
      const checkLoaded = setInterval(() => {
        if (window.google?.maps?.places) {
          console.log('✅ AddressAutocomplete: Google Maps loaded');
          clearInterval(checkLoaded);
          setLoadingStatus("Google Maps ready!");
          setScriptLoaded(true);
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!window.google?.maps?.places) {
          console.error('❌ AddressAutocomplete: Timeout waiting for script');
          setLoadingStatus("Failed to load - timeout");
          setScriptError(true);
        }
      }, 10000);
      
      return;
    }

    console.log('🔄 AddressAutocomplete: Creating new script tag');
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.addEventListener('load', () => {
      console.log('✅ AddressAutocomplete: Script loaded');
      if (window.google?.maps?.places) {
        console.log('✅ AddressAutocomplete: Places API available');
        setLoadingStatus("Google Maps ready!");
        setScriptLoaded(true);
      } else {
        console.error('❌ AddressAutocomplete: Places API not available after load');
        setLoadingStatus("Places API not available");
        setScriptError(true);
      }
    });
    
    script.addEventListener('error', (e) => {
      console.error('❌ AddressAutocomplete: Script load error', e);
      setLoadingStatus("Failed to load - check API key");
      setScriptError(true);
    });
    
    document.head.appendChild(script);
    console.log('📝 AddressAutocomplete: Script tag added');
  }, []);

  // Initialize Autocomplete widget when script loads
  React.useEffect(() => {
    if (!scriptLoaded || !inputRef.current || autocompleteRef.current) {
      return;
    }

    console.log('🎯 AddressAutocomplete: Initializing Autocomplete widget');

    try {
      // Create Autocomplete instance - NEW API
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });

      console.log('✅ AddressAutocomplete: Autocomplete widget created');

      // Listen for place selection
      autocomplete.addListener('place_changed', () => {
        console.log('📍 AddressAutocomplete: Place changed event fired');
        const place = autocomplete.getPlace();
        
        console.log('📊 AddressAutocomplete: Place object:', place);

        if (!place.geometry) {
          console.error('❌ AddressAutocomplete: No geometry in place');
          return;
        }

        // Parse address components
        const addressData = parseAddressComponents(place);
        console.log('✅ AddressAutocomplete: Parsed address:', addressData);
        
        setSelectedAddress(addressData);
        onAddressSelect(addressData);
      });

      autocompleteRef.current = autocomplete;
      console.log('✅ AddressAutocomplete: Event listener attached');
    } catch (error) {
      console.error('❌ AddressAutocomplete: Error initializing widget:', error);
      setScriptError(true);
      setLoadingStatus("Failed to initialize - " + error.message);
    }
  }, [scriptLoaded, onAddressSelect]);

  const parseAddressComponents = (place) => {
    const components = {};
    
    place.address_components.forEach(component => {
      const types = component.types;
      if (types.includes('street_number')) {
        components.street_number = component.long_name;
      }
      if (types.includes('route')) {
        components.route = component.long_name;
      }
      if (types.includes('locality')) {
        components.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        components.state = component.short_name;
      }
      if (types.includes('postal_code')) {
        components.zip_code = component.long_name;
      }
      if (types.includes('administrative_area_level_2')) {
        components.county = component.long_name.replace(' County', '');
      }
    });

    return {
      street_address: `${components.street_number || ''} ${components.route || ''}`.trim(),
      city: components.city || '',
      state: components.state || '',
      zip_code: components.zip_code || '',
      county: components.county || '',
      formatted_address: place.formatted_address,
      place_id: place.place_id,
      coordinates: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      },
      address_verified: true,
      verification_source: 'google_maps'
    };
  };

  const handleClearAddress = () => {
    setSelectedAddress(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  if (scriptError) {
    return (
      <Card className="border-2 border-red-300 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Google Maps Failed to Load
              </p>
              <p className="text-sm text-gray-700 mb-2">
                Status: {loadingStatus}
              </p>
              <p className="text-xs text-gray-600 mb-3">
                <strong>Common issues:</strong><br/>
                • Places API not enabled in Google Cloud Console<br/>
                • Billing not set up (required even for free tier)<br/>
                • API key restrictions blocking the domain<br/>
                • Check browser console (F12) for details
              </p>
              <Button
                onClick={() => setShowManualEntry(true)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Continue with Manual Entry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showManualEntry) {
    return (
      <Card className="border-2 border-blue-300 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Manual Address Entry Mode
              </p>
              <p className="text-sm text-gray-700 mb-3">
                Enter address details manually below. Map verification will be limited.
              </p>
              {!scriptError && (
                <Button
                  onClick={() => setShowManualEntry(false)}
                  variant="outline"
                  size="sm"
                >
                  ← Back to Address Search
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Loading Indicator */}
      {!scriptLoaded && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <p className="text-sm text-gray-700">{loadingStatus}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Indicator */}
      {scriptLoaded && !selectedAddress && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-900 font-medium">
                ✨ Start typing your address - Google will suggest matches
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Address Input - Google handles dropdown automatically */}
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder={scriptLoaded ? "Start typing your address..." : "Loading..."}
          defaultValue={initialValue}
          className="w-full"
          style={{ minHeight: '48px' }}
          disabled={!scriptLoaded}
          autoComplete="off"
        />
        {!scriptLoaded && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />
        )}
      </div>

      {/* Selected Address Confirmation */}
      {selectedAddress && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900 mb-1">
                  ✓ Address Verified
                </p>
                <p className="text-sm text-gray-700">
                  {selectedAddress.formatted_address}
                </p>
                {selectedAddress.county && (
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedAddress.county} County
                  </p>
                )}
                <Button
                  onClick={handleClearAddress}
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs h-auto p-1"
                >
                  Clear & Search Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      {scriptLoaded && !selectedAddress && (
        <p className="text-xs text-gray-600">
          Can't find your address? <button 
            onClick={() => setShowManualEntry(true)}
            className="text-blue-600 hover:underline"
          >
            Enter manually instead
          </button>
        </p>
      )}
    </div>
  );
}