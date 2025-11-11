import React, { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, AlertCircle, CheckCircle } from "lucide-react";

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyBQaKy7wOT8z0Rw_96AS5-GoMe1z2GzTa0";

// Load Google Maps script ONCE at module level
let scriptLoaded = false;
let scriptLoading = false;

const loadGoogleMaps = (callback) => {
  console.log('🔍 Checking Google Maps status...');
  
  // Already loaded
  if (window.google?.maps?.places) {
    console.log('✅ Google Maps already loaded');
    callback();
    return;
  }

  // Already loading, wait for it
  if (scriptLoading) {
    console.log('⏳ Script already loading, waiting...');
    const checkInterval = setInterval(() => {
      if (window.google?.maps?.places) {
        console.log('✅ Script finished loading');
        clearInterval(checkInterval);
        callback();
      }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => clearInterval(checkInterval), 10000);
    return;
  }

  // Check if script tag already exists
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript) {
    console.log('📜 Script tag exists, waiting for load...');
    scriptLoading = true;
    
    const checkInterval = setInterval(() => {
      if (window.google?.maps?.places) {
        console.log('✅ Existing script loaded');
        clearInterval(checkInterval);
        scriptLoaded = true;
        scriptLoading = false;
        callback();
      }
    }, 100);
    
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!window.google?.maps?.places) {
        console.error('❌ Timeout waiting for existing script');
        scriptLoading = false;
      }
    }, 10000);
    return;
  }

  // Load for first time
  console.log('📥 Loading Google Maps script...');
  scriptLoading = true;
  
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  
  script.onload = () => {
    console.log('✅ Script loaded successfully');
    scriptLoaded = true;
    scriptLoading = false;
    
    // Wait a moment for Places API to be ready
    setTimeout(() => {
      if (window.google?.maps?.places) {
        console.log('✅ Places API ready');
        callback();
      } else {
        console.error('❌ Script loaded but Places API not available');
      }
    }, 500);
  };
  
  script.onerror = (error) => {
    console.error('❌ Failed to load Google Maps script:', error);
    scriptLoading = false;
  };
  
  document.head.appendChild(script);
  console.log('📝 Script tag added to head');
};

const AddressAutocomplete = ({ onAddressSelect, initialValue = "" }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    console.log('🎯 AddressAutocomplete mounted');
    
    loadGoogleMaps(() => {
      console.log('🎉 Google Maps ready, initializing autocomplete');
      setReady(true);
      
      // Small delay to ensure ref is set
      setTimeout(() => {
        initAutocomplete();
      }, 100);
    });

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (!ready) {
        console.error('❌ Timeout loading Google Maps');
        setError(true);
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, []);

  const initAutocomplete = () => {
    if (!inputRef.current || autocompleteRef.current) {
      return;
    }

    console.log('🔧 Initializing Autocomplete widget');

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['address_components', 'formatted_address', 'geometry', 'place_id']
        }
      );

      console.log('✅ Autocomplete widget created');

      autocomplete.addListener('place_changed', () => {
        console.log('📍 Place changed event');
        const place = autocomplete.getPlace();
        
        console.log('📊 Place data:', place);

        if (!place.geometry) {
          console.warn('⚠️ No geometry in place');
          return;
        }

        const addressData = parseAddress(place);
        console.log('✅ Parsed address:', addressData);
        
        setSelectedAddress(addressData);
        
        if (onAddressSelect) {
          onAddressSelect(addressData);
        }
      });

      autocompleteRef.current = autocomplete;
      console.log('✅ Event listener attached');
    } catch (err) {
      console.error('❌ Error initializing autocomplete:', err);
      setError(true);
    }
  };

  const parseAddress = (place) => {
    const comp = {};
    
    place.address_components.forEach(c => {
      const type = c.types[0];
      comp[type] = c.long_name;
      
      if (type === 'administrative_area_level_1') {
        comp.state_short = c.short_name;
      }
      if (type === 'administrative_area_level_2') {
        comp.county_clean = c.long_name.replace(' County', '');
      }
    });

    return {
      street_address: `${comp.street_number || ''} ${comp.route || ''}`.trim(),
      city: comp.locality || '',
      state: comp.state_short || '',
      zip_code: comp.postal_code || '',
      county: comp.county_clean || '',
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

  // Error state
  if (error) {
    return (
      <Card className="border-2 border-red-300 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Google Maps Failed to Load
              </p>
              <p className="text-xs text-gray-600 mb-3">
                <strong>Common issues:</strong><br/>
                • Places API not enabled in Google Cloud Console<br/>
                • Billing not set up (required even for free tier)<br/>
                • API key restrictions blocking the domain<br/>
                • Check browser console (F12) for detailed errors
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

  // Manual entry mode
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
              {!error && (
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
      {/* Loading state */}
      {!ready && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <p className="text-sm text-gray-700">Loading address lookup...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ready state */}
      {ready && !selectedAddress && (
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

      {/* Address input - Google handles autocomplete dropdown */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={ready ? "Start typing your address..." : "Loading..."}
          defaultValue={initialValue}
          disabled={!ready}
          autoComplete="off"
          style={{ minHeight: '48px' }}
          className="w-full"
        />
        {!ready && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />
        )}
      </div>

      {/* Selected address confirmation */}
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

      {/* Help text */}
      {ready && !selectedAddress && (
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
};

export default AddressAutocomplete;