import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Loader2, MapPin, Sparkles } from "lucide-react";
import AddressAutocomplete from "../properties/AddressAutocomplete";

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

export default function OnboardingAddressInput({ onNext, user }) {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddressSelect = (place) => {
    const climateZone = getClimateZone(place.state);
    setSelectedPlace({
      ...place,
      climate_zone: climateZone
    });
  };

  const handleContinue = async () => {
    if (!selectedPlace) return;
    setIsLoading(true);

    // Pass the address data to the next step
    // The next step will handle property creation and data fetching
    onNext({
      address: selectedPlace
    });
  };

  const firstName = user?.full_name?.split(' ')[0] || user?.firstName || '';

  return (
    <div className="min-h-[80vh] flex flex-col justify-center animate-in fade-in-50 duration-500">
      {/* Hero Card */}
      <Card className="border-none shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full translate-y-24 -translate-x-24" />

        <CardContent className="p-8 md:p-12 relative z-10 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-orange-500/20 backdrop-blur-sm flex items-center justify-center mb-6">
            <Home className="w-12 h-12 text-orange-400" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {firstName ? `Welcome, ${firstName}!` : 'Welcome to 360° Method'}
          </h1>

          <p className="text-xl text-slate-300 mb-2 max-w-lg mx-auto">
            Let's see what your home needs.
          </p>
          <p className="text-slate-400 max-w-lg mx-auto">
            Enter your address and we'll instantly show you personalized insights based on your home's age and systems.
          </p>
        </CardContent>
      </Card>

      {/* Address Input Card */}
      <Card className="border-2 border-slate-200 shadow-lg">
        <CardContent className="p-6 md:p-8">
          {!selectedPlace ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-slate-900">
                  What's your property address?
                </h2>
              </div>

              <AddressAutocomplete
                onAddressSelect={handleAddressSelect}
                placeholder="Start typing your address..."
              />

              <p className="text-sm text-slate-500 mt-4 text-center">
                We'll automatically pull your home's details - no forms to fill out.
              </p>
            </>
          ) : (
            <>
              {/* Address Confirmed */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-800 text-sm mb-1">Address Confirmed</p>
                    <p className="text-slate-900 font-medium">{selectedPlace.formatted_address}</p>
                    <button
                      onClick={() => setSelectedPlace(null)}
                      className="text-sm text-green-700 hover:text-green-900 mt-2 underline"
                    >
                      Change address
                    </button>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleContinue}
                disabled={isLoading}
                className="w-full gap-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                style={{
                  backgroundColor: '#f97316',
                  minHeight: '56px'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing your home...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Show Me My Home's Insights
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Trust Badge */}
      <p className="text-center text-sm text-slate-500 mt-6">
        Your data is private and secure. We never share your information.
      </p>
    </div>
  );
}
