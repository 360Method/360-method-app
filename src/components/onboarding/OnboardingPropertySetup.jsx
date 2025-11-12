import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, MapPin, Loader2 } from "lucide-react";
import AddressAutocomplete from "../properties/AddressAutocomplete";
import AddressVerificationMap from "../properties/AddressVerificationMap";
import OperatorAvailabilityCheck from "../properties/OperatorAvailabilityCheck";

// Climate zone mapping based on state
const getClimateZone = (state) => {
  const stateUpper = state?.toUpperCase();
  
  const climateMap = {
    'WA': 'Pacific Northwest', 'OR': 'Pacific Northwest', 'ID': 'Pacific Northwest',
    'ME': 'Northeast', 'NH': 'Northeast', 'VT': 'Northeast', 'MA': 'Northeast', 'RI': 'Northeast',
    'CT': 'Northeast', 'NY': 'Northeast', 'NJ': 'Northeast', 'PA': 'Northeast', 'DE': 'Northeast', 'MD': 'Northeast',
    'VA': 'Southeast', 'WV': 'Southeast', 'KY': 'Southeast', 'TN': 'Southeast', 'NC': 'Southeast',
    'SC': 'Southeast', 'GA': 'Southeast', 'FL': 'Southeast', 'AL': 'Southeast', 'MS': 'Southeast',
    'LA': 'Southeast', 'AR': 'Southeast',
    'OH': 'Midwest', 'MI': 'Midwest', 'IN': 'Midwest', 'IL': 'Midwest', 'WI': 'Midwest',
    'MN': 'Midwest', 'IA': 'Midwest', 'MO': 'Midwest', 'ND': 'Midwest', 'SD': 'Midwest',
    'NE': 'Midwest', 'KS': 'Midwest',
    'TX': 'Southwest', 'OK': 'Southwest', 'NM': 'Southwest', 'AZ': 'Southwest', 'NV': 'Southwest', 'CA': 'Southwest',
    'MT': 'Mountain West', 'WY': 'Mountain West', 'CO': 'Mountain West', 'UT': 'Mountain West'
  };
  
  return climateMap[stateUpper] || 'Midwest';
};

export default function OnboardingPropertySetup({ onNext, onBack, data }) {
  const [selectedPlace, setSelectedPlace] = React.useState(null);
  const [operatorData, setOperatorData] = React.useState(null);
  const [operatorCheckComplete, setOperatorCheckComplete] = React.useState(false);
  const queryClient = useQueryClient();

  const propertyUseType = data?.property_use_type || 'primary';
  const userType = data?.userType || 'homeowner';

  const getPropertyTypeLabel = (type) => {
    const labels = {
      'primary': 'Primary Residence',
      'primary_with_rental': 'Primary + Rental',
      'rental_unfurnished': 'Long-Term Rental',
      'rental_furnished': 'Furnished Rental',
      'vacation_rental': 'Vacation Rental'
    };
    return labels[type] || type;
  };

  const createPropertyMutation = useMutation({
    mutationFn: (propertyData) => base44.entities.Property.create(propertyData),
    onSuccess: (newProperty) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      onNext({
        property: newProperty
      });
    },
  });

  const handleAddressSelect = (place) => {
    const climateZone = getClimateZone(place.state);
    
    setSelectedPlace({
      ...place,
      climate_zone: climateZone
    });
  };

  const handleOperatorCheck = (operator) => {
    // Always set operator data, even if no operator found
    setOperatorData({
      operator_id: operator?.id || null,
      operator_available: !!operator,
      operator_checked_date: new Date().toISOString().split('T')[0]
    });
    setOperatorCheckComplete(true);
  };

  // Reset operator check when address changes
  React.useEffect(() => {
    if (selectedPlace) {
      setOperatorCheckComplete(false);
    }
  }, [selectedPlace]);

  const handleContinue = async () => {
    if (!selectedPlace) return;

    const propertyData = {
      address: selectedPlace.formatted_address,
      street_address: selectedPlace.street_address,
      unit_number: selectedPlace.unit_number,
      city: selectedPlace.city,
      state: selectedPlace.state,
      zip_code: selectedPlace.zip_code,
      county: selectedPlace.county,
      formatted_address: selectedPlace.formatted_address,
      place_id: selectedPlace.place_id,
      coordinates: selectedPlace.coordinates,
      address_verified: true,
      verification_source: "google_maps",
      climate_zone: selectedPlace.climate_zone,
      property_use_type: propertyUseType,
      ...operatorData,
      property_type: "Single-Family Home",
      door_count: 1,
      setup_completed: false,
      baseline_completion: 0
    };

    createPropertyMutation.mutate(propertyData);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className="bg-blue-600 text-white">
              {userType === 'homeowner' ? 'Homeowner' : 'Property Investor'}
            </Badge>
            <Badge className="bg-green-600 text-white">
              {getPropertyTypeLabel(propertyUseType)}
            </Badge>
          </div>
          <CardTitle className="text-2xl md:text-3xl text-center" style={{ color: '#1B365D' }}>
            🏠 Add Your Property Address
          </CardTitle>
          <p className="text-center text-gray-600 text-lg mt-2">
            Let's start with your property's full address
          </p>
        </CardHeader>
      </Card>

      {/* Address Autocomplete */}
      {!selectedPlace && (
        <Card className="border-2 border-green-300">
          <CardContent className="p-6 md:p-8">
            <AddressAutocomplete onAddressSelect={handleAddressSelect} />
            <p className="text-sm text-gray-600 mt-3">
              💡 Start typing your address and select from the dropdown for best results
            </p>
          </CardContent>
        </Card>
      )}

      {/* Verified Address Display with Map */}
      {selectedPlace && (
        <>
          <Card className="border-2 border-green-300 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-green-900 mb-1">✓ Address Verified</p>
                  <p className="text-gray-900 font-semibold">{selectedPlace.formatted_address}</p>
                  {selectedPlace.county && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedPlace.county} County
                    </p>
                  )}
                  {selectedPlace.climate_zone && (
                    <p className="text-xs text-green-700 mt-2">
                      🌡️ Climate Zone: <strong>{selectedPlace.climate_zone}</strong>
                    </p>
                  )}
                  <Button
                    onClick={() => {
                      setSelectedPlace(null);
                      setOperatorData(null);
                    }}
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-green-700 hover:text-green-900"
                  >
                    Change Address
                  </Button>
                </div>
              </div>

              {/* Map Display */}
              {selectedPlace.coordinates && (
                <AddressVerificationMap
                  coordinates={selectedPlace.coordinates}
                  address={selectedPlace.formatted_address}
                />
              )}
            </CardContent>
          </Card>

          {/* Operator Availability Check */}
          {selectedPlace.zip_code && (
            <OperatorAvailabilityCheck
              zipCode={selectedPlace.zip_code}
              onOperatorFound={handleOperatorCheck}
            />
          )}
        </>
      )}

      {/* Why This Matters */}
      {!selectedPlace && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <h3 className="font-bold text-purple-900 mb-3 text-lg">
              🎯 Why Your Full Address Matters
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Your address unlocks:</strong>
              </p>
              <ul className="ml-6 space-y-1 list-disc">
                <li><strong>Local Climate Intelligence:</strong> Region-specific maintenance schedules and system recommendations</li>
                <li><strong>Operator Matching:</strong> We'll check if 360° Method certified operators serve your area</li>
                <li><strong>Accurate Cost Estimates:</strong> AI pricing based on your local market rates</li>
                <li><strong>Property Value Context:</strong> Market data for upgrade ROI calculations</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="gap-2"
          style={{ minHeight: '48px' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedPlace || !operatorCheckComplete || createPropertyMutation.isPending}
          className="gap-2"
          style={{ 
            backgroundColor: (selectedPlace && operatorCheckComplete && !createPropertyMutation.isPending) ? '#28A745' : '#CCCCCC', 
            minHeight: '48px'
          }}
        >
          {createPropertyMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}