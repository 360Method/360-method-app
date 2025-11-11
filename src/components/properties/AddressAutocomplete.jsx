import React from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, AlertCircle, Key } from "lucide-react";

// TEMPORARY: For testing, you can add your API key here
// In production, this should come from environment variables
const GOOGLE_MAPS_API_KEY = ""; // Add your key here temporarily for testing

export default function AddressAutocomplete({ onAddressSelect, initialValue = "" }) {
  const [inputValue, setInputValue] = React.useState(initialValue);
  const [predictions, setPredictions] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showManualEntry, setShowManualEntry] = React.useState(false);
  const [selectedAddress, setSelectedAddress] = React.useState(null);
  const [scriptLoaded, setScriptLoaded] = React.useState(false);
  const [scriptError, setScriptError] = React.useState(false);
  const [apiKeyMissing, setApiKeyMissing] = React.useState(false);

  // Load Google Maps script
  React.useEffect(() => {
    console.log('AddressAutocomplete: Component mounted');
    
    if (window.google?.maps?.places) {
      console.log('AddressAutocomplete: Google Maps already loaded');
      setScriptLoaded(true);
      return;
    }

    // Check for API key
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('AddressAutocomplete: No API key configured');
      setApiKeyMissing(true);
      setScriptError(true);
      return;
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('AddressAutocomplete: Script already exists, waiting for load');
      existingScript.addEventListener('load', () => {
        console.log('AddressAutocomplete: Existing script loaded');
        setScriptLoaded(true);
      });
      existingScript.addEventListener('error', () => {
        console.error('AddressAutocomplete: Existing script failed to load');
        setScriptError(true);
      });
      return;
    }

    console.log('AddressAutocomplete: Creating new script tag');
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.addEventListener('load', () => {
      console.log('AddressAutocomplete: Google Maps script loaded successfully');
      if (window.google?.maps?.places) {
        setScriptLoaded(true);
      } else {
        console.error('AddressAutocomplete: Script loaded but google.maps.places not available');
        setScriptError(true);
      }
    });
    
    script.addEventListener('error', (e) => {
      console.error('AddressAutocomplete: Failed to load Google Maps script', e);
      setScriptError(true);
    });
    
    document.head.appendChild(script);
    console.log('AddressAutocomplete: Script tag added to document');
  }, []);

  // Debounced autocomplete search
  React.useEffect(() => {
    if (!scriptLoaded || inputValue.length < 3) {
      setPredictions([]);
      return;
    }

    console.log('AddressAutocomplete: Searching for:', inputValue);
    const timer = setTimeout(() => {
      searchAddresses(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, scriptLoaded]);

  const searchAddresses = async (searchText) => {
    if (!window.google?.maps?.places) {
      console.error('AddressAutocomplete: Google Maps Places API not available');
      return;
    }

    setIsLoading(true);
    console.log('AddressAutocomplete: Calling Google Places API');
    
    try {
      const service = new window.google.maps.places.AutocompleteService();
      
      service.getPlacePredictions(
        {
          input: searchText,
          componentRestrictions: { country: 'us' },
          types: ['address']
        },
        (results, status) => {
          console.log('AddressAutocomplete: API response status:', status);
          console.log('AddressAutocomplete: Results count:', results?.length || 0);
          
          setIsLoading(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results.slice(0, 5));
          } else {
            console.log('AddressAutocomplete: No results or error status:', status);
            setPredictions([]);
          }
        }
      );
    } catch (error) {
      console.error('AddressAutocomplete: Error calling Places API:', error);
      setIsLoading(false);
    }
  };

  const handleSelectPrediction = async (prediction) => {
    console.log('AddressAutocomplete: Selected prediction:', prediction.description);
    setInputValue(prediction.description);
    setPredictions([]);
    setIsLoading(true);

    try {
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );

      service.getDetails(
        {
          placeId: prediction.place_id,
          fields: ['address_components', 'formatted_address', 'geometry', 'place_id']
        },
        (place, status) => {
          console.log('AddressAutocomplete: Place details status:', status);
          setIsLoading(false);
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const addressData = parseAddressComponents(place);
            console.log('AddressAutocomplete: Parsed address data:', addressData);
            setSelectedAddress(addressData);
            onAddressSelect(addressData);
          }
        }
      );
    } catch (error) {
      console.error('AddressAutocomplete: Error getting place details:', error);
      setIsLoading(false);
    }
  };

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

  if (apiKeyMissing) {
    return (
      <Card className="border-2 border-orange-300 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Google Maps API Key Required
              </p>
              <p className="text-sm text-gray-700 mb-3">
                To enable address autocomplete, add your Google Maps API key to the <code className="bg-white px-1 py-0.5 rounded">AddressAutocomplete.jsx</code> file.
              </p>
              <div className="text-xs text-gray-600 mb-3 space-y-1">
                <p><strong>Steps:</strong></p>
                <ol className="ml-4 space-y-1">
                  <li>1. Get a key from <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-600 underline">Google Cloud Console</a></li>
                  <li>2. Enable "Places API" and "Maps JavaScript API"</li>
                  <li>3. Add key to <code>GOOGLE_MAPS_API_KEY</code> constant</li>
                </ol>
              </div>
              <Button
                onClick={() => setShowManualEntry(true)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Enter Address Manually Instead
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (scriptError && !apiKeyMissing) {
    return (
      <Card className="border-2 border-red-300 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Address Search Unavailable
              </p>
              <p className="text-sm text-gray-700 mb-3">
                Unable to load Google Maps. Check browser console for details.
              </p>
              <Button
                onClick={() => setShowManualEntry(true)}
                variant="outline"
                size="sm"
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
                Enter address details manually below. Without verification, map display and some location features may be limited.
              </p>
              {!apiKeyMissing && (
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
      <div className="relative">
        <div className="relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={scriptLoaded ? "Start typing your address..." : "Loading address search..."}
            className="pr-10"
            style={{ minHeight: '48px' }}
            disabled={!scriptLoaded}
          />
          {(isLoading || !scriptLoaded) && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />
          )}
        </div>

        {predictions.length > 0 && (
          <Card className="absolute z-50 w-full mt-2 shadow-lg border-2 border-blue-200">
            <CardContent className="p-2">
              {predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  onClick={() => handleSelectPrediction(prediction)}
                  className="w-full text-left p-3 hover:bg-blue-50 rounded-lg transition-colors flex items-start gap-3"
                  style={{ minHeight: '56px' }}
                >
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {prediction.structured_formatting.main_text}
                    </p>
                    <p className="text-xs text-gray-600">
                      {prediction.structured_formatting.secondary_text}
                    </p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {!scriptLoaded && !scriptError && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-3">
            <p className="text-sm text-gray-700">
              Loading address search... Check browser console if this takes more than a few seconds.
            </p>
          </CardContent>
        </Card>
      )}

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
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {inputValue.length >= 3 && predictions.length === 0 && !isLoading && scriptLoaded && (
        <Card className="border-2 border-gray-300">
          <CardContent className="p-4">
            <p className="text-sm text-gray-700 mb-3">
              Can't find your address? This might happen if:
            </p>
            <ul className="text-xs text-gray-600 ml-4 mb-3 space-y-1">
              <li>• Your property is new construction</li>
              <li>• The address isn't in Google's database yet</li>
              <li>• You're using a PO Box (use physical address instead)</li>
            </ul>
            <Button
              onClick={() => setShowManualEntry(true)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Enter Address Manually
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}