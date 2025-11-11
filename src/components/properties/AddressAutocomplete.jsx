import React from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, AlertCircle } from "lucide-react";

export default function AddressAutocomplete({ onAddressSelect, initialValue = "" }) {
  const [inputValue, setInputValue] = React.useState(initialValue);
  const [predictions, setPredictions] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showManualEntry, setShowManualEntry] = React.useState(false);
  const [selectedAddress, setSelectedAddress] = React.useState(null);

  // Load Google Maps script
  React.useEffect(() => {
    if (window.google) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // Debounced autocomplete search
  React.useEffect(() => {
    if (inputValue.length < 3) {
      setPredictions([]);
      return;
    }

    const timer = setTimeout(() => {
      searchAddresses(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const searchAddresses = async (searchText) => {
    if (!window.google) return;

    setIsLoading(true);
    
    const service = new window.google.maps.places.AutocompleteService();
    
    service.getPlacePredictions(
      {
        input: searchText,
        componentRestrictions: { country: 'us' },
        types: ['address']
      },
      (results, status) => {
        setIsLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
        } else {
          setPredictions([]);
        }
      }
    );
  };

  const handleSelectPrediction = async (prediction) => {
    setInputValue(prediction.description);
    setPredictions([]);
    setIsLoading(true);

    // Get detailed place information
    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    service.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['address_components', 'formatted_address', 'geometry', 'place_id']
      },
      (place, status) => {
        setIsLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const addressData = parseAddressComponents(place);
          setSelectedAddress(addressData);
          onAddressSelect(addressData);
        }
      }
    );
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
        components.county = component.long_name;
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

  if (showManualEntry) {
    return (
      <Card className="border-2 border-orange-300 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Manual Address Entry Mode
              </p>
              <p className="text-sm text-gray-700 mb-3">
                You'll need to enter address details manually. Some features may be limited without address verification.
              </p>
              <Button
                onClick={() => setShowManualEntry(false)}
                variant="outline"
                size="sm"
              >
                ← Back to Address Search
              </Button>
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
            placeholder="Start typing your address..."
            className="pr-10"
            style={{ minHeight: '48px' }}
          />
          {isLoading && (
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
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {inputValue.length >= 3 && predictions.length === 0 && !isLoading && (
        <Card className="border-2 border-gray-300">
          <CardContent className="p-4">
            <p className="text-sm text-gray-700 mb-3">
              Can't find your address?
            </p>
            <Button
              onClick={() => setShowManualEntry(true)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Switch to Manual Entry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}