import React, { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

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
  const [inputValue, setInputValue] = useState(initialValue);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualAddress, setManualAddress] = useState({
    street_address: "",
    unit_number: "",
    city: "",
    state: "",
    zip_code: ""
  });

  // Ensure Google autocomplete dropdown appears above modal
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .pac-container {
        z-index: 10000 !important;
        border-radius: 8px !important;
        margin-top: 4px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
      }
      .pac-item {
        padding: 10px 12px !important;
        cursor: pointer !important;
      }
      .pac-item:hover {
        background-color: #f3f4f6 !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Update input value when initialValue changes
  useEffect(() => {
    if (initialValue) {
      setInputValue(initialValue);
    }
  }, [initialValue]);

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

    // No timeout - Google Maps autocomplete stays active indefinitely
    // Users can always manually enter if autocomplete doesn't load
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
        
        // Update local state
        setInputValue(addressData.formatted_address);
        setSelectedAddress(addressData);
        
        // Immediately notify parent
        if (onAddressSelect) {
          onAddressSelect(addressData);
        }
      });

      autocompleteRef.current = autocomplete;
      console.log('✅ Event listener attached');
    } catch (err) {
      console.error('❌ Error initializing autocomplete:', err);
      setError(true);
      setShowManualEntry(true);
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
    setInputValue('');
    // If there's an external state for verification, it should be updated here.
    // Assuming onAddressSelect handles resetting for the parent.
    if (onAddressSelect) {
        onAddressSelect({
            street_address: "",
            unit_number: "",
            city: "",
            state: "",
            zip_code: "",
            county: "",
            formatted_address: "",
            place_id: null,
            coordinates: null,
            address_verified: false,
            verification_source: null
        });
    }
  };

  const handleManualSubmit = () => {
    if (!manualAddress.street_address || !manualAddress.city || !manualAddress.state || !manualAddress.zip_code) {
      toast.error("Please fill in all required address fields");
      return;
    }

    const addressData = {
      ...manualAddress,
      formatted_address: `${manualAddress.street_address}${manualAddress.unit_number ? ' ' + manualAddress.unit_number : ''}, ${manualAddress.city}, ${manualAddress.state} ${manualAddress.zip_code}`,
      address: `${manualAddress.street_address}${manualAddress.unit_number ? ' ' + manualAddress.unit_number : ''}, ${manualAddress.city}, ${manualAddress.state} ${manualAddress.zip_code}`,
      address_verified: true,
      verification_source: 'manual_entry',
      coordinates: null,
      place_id: null,
      county: ""
    };

    setSelectedAddress(addressData);
    // Again, if `setAddressVerified` is meant to be called here, it's missing.
    if (onAddressSelect) {
      onAddressSelect(addressData);
    }
    setShowManualEntry(false);
  };

  // Manual entry mode
  if (showManualEntry) {
    return (
      <div className="space-y-4">
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Manual Address Entry
                </p>
                <p className="text-xs text-gray-700 mb-3">
                  Enter your property address manually. You can still use all features!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div>
            <Label className="text-sm font-semibold">Street Address *</Label>
            <Input
              value={manualAddress.street_address}
              onChange={(e) => setManualAddress({...manualAddress, street_address: e.target.value})}
              placeholder="123 Main St"
              style={{ minHeight: '48px' }}
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">Unit/Apt # (optional)</Label>
            <Input
              value={manualAddress.unit_number}
              onChange={(e) => setManualAddress({...manualAddress, unit_number: e.target.value})}
              placeholder="Apt 4B"
              style={{ minHeight: '48px' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-semibold">City *</Label>
              <Input
                value={manualAddress.city}
                onChange={(e) => setManualAddress({...manualAddress, city: e.target.value})}
                placeholder="Vancouver"
                style={{ minHeight: '48px' }}
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">State *</Label>
              <Input
                value={manualAddress.state}
                onChange={(e) => setManualAddress({...manualAddress, state: e.target.value.toUpperCase()})}
                placeholder="WA"
                maxLength={2}
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold">ZIP Code *</Label>
            <Input
              value={manualAddress.zip_code}
              onChange={(e) => setManualAddress({...manualAddress, zip_code: e.target.value})}
              placeholder="98660"
              maxLength={5}
              style={{ minHeight: '48px' }}
            />
          </div>

          <Button
            onClick={handleManualSubmit}
            className="w-full"
            style={{ backgroundColor: '#FF6B35', minHeight: '48px' }}
          >
            Save Address
          </Button>

          {!error && ready && (
            <Button
              onClick={() => setShowManualEntry(false)}
              variant="outline"
              className="w-full"
              style={{ minHeight: '48px' }}
            >
              ← Back to Address Search
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Loading state */}
      {!ready && !error && (
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
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            // Clear selected address when user types (they're searching for a new one)
            if (selectedAddress) {
              setSelectedAddress(null);
            }
          }}
          disabled={!ready && !error}
          autoComplete="off"
          style={{ minHeight: '48px' }}
          className="w-full"
        />
        {!ready && !error && (
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
            className="text-blue-600 hover:underline font-semibold"
          >
            Enter manually instead
          </button>
        </p>
      )}
    </div>
  );
};

export default AddressAutocomplete;