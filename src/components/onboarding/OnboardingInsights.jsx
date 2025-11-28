import React, { useEffect, useState, useRef } from "react";
import { Property } from "@/api/supabaseClient";
import { supabase } from "@/api/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Home,
  Loader2,
  Sparkles,
  TrendingUp,
  Wrench,
  Calendar,
  DollarSign
} from "lucide-react";

// System lifespan data (fallback if DB query fails)
const SYSTEM_LIFESPANS = {
  'Roof': { avgYears: 25, category: 'Structural', icon: '🏠', priority: 1 },
  'HVAC': { avgYears: 15, category: 'Climate', icon: '❄️', priority: 2 },
  'Water Heater': { avgYears: 12, category: 'Plumbing', icon: '🔥', priority: 3 },
  'Electrical Panel': { avgYears: 40, category: 'Electrical', icon: '⚡', priority: 4 },
  'Windows': { avgYears: 25, category: 'Exterior', icon: '🪟', priority: 5 },
  'Plumbing': { avgYears: 50, category: 'Plumbing', icon: '🚿', priority: 6 },
  'Furnace': { avgYears: 20, category: 'Climate', icon: '🔥', priority: 7 },
  'Air Conditioner': { avgYears: 15, category: 'Climate', icon: '❄️', priority: 8 },
  'Siding': { avgYears: 30, category: 'Exterior', icon: '🧱', priority: 9 },
  'Garage Door': { avgYears: 20, category: 'Exterior', icon: '🚗', priority: 10 },
};

// Generate insights based on home age
// Note: These are suggestions to VERIFY, not assumptions about current state
function generateAgeInsights(yearBuilt, currentYear = new Date().getFullYear()) {
  const homeAge = currentYear - yearBuilt;
  const insights = [];

  Object.entries(SYSTEM_LIFESPANS).forEach(([system, data]) => {
    const expectedReplacements = Math.floor(homeAge / data.avgYears);
    const yearsSinceLastExpected = homeAge % data.avgYears;
    const percentOfLifeUsed = (yearsSinceLastExpected / data.avgYears) * 100;

    let status = 'verify';
    let message = '';

    // Frame everything as "worth checking" not "definitely bad"
    if (homeAge > data.avgYears) {
      status = 'verify';
      message = `Worth documenting - may have been updated`;
    } else if (percentOfLifeUsed >= 70) {
      status = 'monitor';
      message = `Good to track for future planning`;
    } else {
      status = 'good';
      message = `Likely in good shape if maintained`;
    }

    insights.push({
      system,
      ...data,
      homeAge,
      expectedReplacements,
      yearsSinceLastExpected,
      percentOfLifeUsed: Math.min(percentOfLifeUsed, 100),
      status,
      message,
      isOriginal: expectedReplacements === 0
    });
  });

  // Sort by priority (systems most worth documenting first)
  const statusOrder = { verify: 0, monitor: 1, good: 2 };
  insights.sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return a.priority - b.priority;
  });

  return insights;
}

// Calculate potential savings from proactive maintenance
function calculatePotentialSavings(homeAge) {
  // Average homeowner saves $3,000-5,000/year with proactive maintenance
  // Scale based on home age (older homes have more potential savings)
  const baseSavings = 3500;
  const ageMultiplier = Math.min(homeAge / 20, 2); // Cap at 2x for 40+ year old homes
  return Math.round(baseSavings * ageMultiplier);
}

export default function OnboardingInsights({ onNext, onBack, data }) {
  const [propertyData, setPropertyData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createdProperty, setCreatedProperty] = useState(null);
  const hasRunRef = useRef(false);

  const queryClient = useQueryClient();

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: (propertyData) => Property.create(propertyData),
    onSuccess: (newProperty) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setCreatedProperty(newProperty);
    },
  });

  // Fetch property data and create property - only run once
  useEffect(() => {
    async function fetchAndCreate() {
      // Prevent duplicate runs
      if (hasRunRef.current) return;
      hasRunRef.current = true;

      if (!data?.address) {
        setError('No address provided');
        setIsLoading(false);
        return;
      }

      const address = data.address;

      try {
        // 1. Try to fetch property data from Zillow via edge function
        let fetchedData = null;
        try {
          const response = await supabase.functions.invoke('fetch-property-data', {
            body: { address: address.formatted_address }
          });

          console.log('Zillow API response:', response);

          if (response.data?.success && response.data?.data) {
            fetchedData = response.data.data;
          }
        } catch (fetchError) {
          console.log('Property data fetch failed, will use manual entry:', fetchError);
        }

        // 2. Create the property - only include fields that exist in the database
        const propertyPayload = {
          address: address.formatted_address,
          street_address: address.street_address || '',
          city: address.city || '',
          state: address.state || '',
          zip_code: address.zip_code || '',
          formatted_address: address.formatted_address,
          property_type: fetchedData?.property_type || "Single-Family Home",
          year_built: fetchedData?.year_built || null,
          square_footage: fetchedData?.square_footage || null,
          bedrooms: fetchedData?.bedrooms || null,
          bathrooms: fetchedData?.bathrooms || null
        };

        // Only add optional fields if they have values
        if (address.unit_number) propertyPayload.unit_number = address.unit_number;

        console.log('Creating property with payload:', propertyPayload);

        const newProperty = await Property.create(propertyPayload);
        setCreatedProperty(newProperty);
        queryClient.invalidateQueries({ queryKey: ['properties'] });

        // 3. Generate insights
        const yearBuilt = fetchedData?.year_built || newProperty?.year_built;

        if (yearBuilt) {
          const generatedInsights = generateAgeInsights(yearBuilt);
          setInsights(generatedInsights);
          setPropertyData({
            ...fetchedData,
            year_built: yearBuilt,
            ...newProperty
          });
        } else {
          // No year built data - we'll need to ask
          setPropertyData({
            ...newProperty,
            needsYearBuilt: true
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error in onboarding:', err);
        console.error('Error details:', err?.message, err?.code, err?.details);
        setError(`Failed to set up your property: ${err?.message || 'Unknown error'}. Please try again.`);
        setIsLoading(false);
      }
    }

    fetchAndCreate();
  }, [data?.address]);

  const handleContinue = () => {
    onNext({
      property: createdProperty,
      insights,
      propertyData
    });
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center animate-in fade-in-50 duration-500">
        <Card className="border-none shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white max-w-md w-full">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center mb-6">
              <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Analyzing Your Home</h2>
            <p className="text-slate-400">
              Fetching property details and generating personalized insights...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Card className="border-2 border-red-200 bg-red-50 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={onBack} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Need year built
  if (propertyData?.needsYearBuilt) {
    return (
      <OnboardingYearBuiltInput
        property={createdProperty}
        onComplete={(yearBuilt) => {
          const generatedInsights = generateAgeInsights(yearBuilt);
          setInsights(generatedInsights);
          setPropertyData({ ...propertyData, year_built: yearBuilt, needsYearBuilt: false });
        }}
      />
    );
  }

  const homeAge = new Date().getFullYear() - propertyData?.year_built;
  const systemsToVerify = insights.filter(i => i.status === 'verify').length;
  const potentialSavings = calculatePotentialSavings(homeAge);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Hero - The Aha Moment */}
      <Card className="border-none shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -translate-y-32 translate-x-32" />

        <CardContent className="p-8 md:p-10 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center">
              <Home className="w-9 h-9 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Your Home is {homeAge} Years Old</h1>
              <p className="text-slate-400">Built in {propertyData?.year_built}</p>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-orange-400">{systemsToVerify}</div>
              <div className="text-sm text-slate-300">Systems to Document</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-400">${Math.round(potentialSavings / 1000)}K</div>
              <div className="text-sm text-slate-300">Avg. Annual Savings</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{homeAge}</div>
              <div className="text-sm text-slate-300">Years Old</div>
            </div>
          </div>

          <p className="text-slate-300 text-center">
            Based on your home's age, here are the systems worth documenting.
            <span className="text-orange-400 font-medium"> Many may have been updated - let's find out!</span>
          </p>
        </CardContent>
      </Card>

      {/* Systems Insights */}
      <Card className="border-2 border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Systems to Document</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            These may have been updated - documenting them helps us give you accurate recommendations.
          </p>

          <div className="space-y-3">
            {insights.slice(0, 5).map((insight) => (
              <div
                key={insight.system}
                className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                  insight.status === 'verify'
                    ? 'bg-orange-50 border-orange-200'
                    : insight.status === 'monitor'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-900">{insight.system}</p>
                    <p className="text-sm text-slate-600">{insight.message}</p>
                  </div>
                </div>
                <Badge
                  className={
                    insight.status === 'verify'
                      ? 'bg-orange-500 text-white'
                      : insight.status === 'monitor'
                      ? 'bg-blue-500 text-white'
                      : 'bg-green-500 text-white'
                  }
                >
                  {insight.status === 'verify'
                    ? 'Document'
                    : insight.status === 'monitor'
                    ? 'Track'
                    : 'Good'}
                </Badge>
              </div>
            ))}
          </div>

          {insights.length > 5 && (
            <p className="text-center text-sm text-slate-500 mt-4">
              + {insights.length - 5} more systems to document
            </p>
          )}
        </CardContent>
      </Card>

      {/* Value Proposition */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-green-900 text-lg mb-1">
                Homeowners Save ~${potentialSavings.toLocaleString()}/Year
              </h3>
              <p className="text-green-800 text-sm">
                By knowing what you have and planning ahead, you avoid emergency pricing and can budget for updates on your timeline.
                Whether your systems are new or original, tracking them helps you stay ahead.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="pt-4">
        <Button
          onClick={handleContinue}
          className="w-full gap-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          style={{
            backgroundColor: '#f97316',
            minHeight: '56px'
          }}
        >
          <Sparkles className="w-5 h-5" />
          Let's Start Protecting My Home
        </Button>
        <p className="text-center text-sm text-slate-500 mt-3">
          We'll help you document your systems and create a personalized maintenance plan.
        </p>
      </div>
    </div>
  );
}

// Mini component for when we need to ask for year built
function OnboardingYearBuiltInput({ property, onComplete }) {
  const [yearBuilt, setYearBuilt] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const currentYear = new Date().getFullYear();
  const decades = [];
  for (let year = currentYear; year >= 1900; year -= 10) {
    decades.push(year);
  }

  const handleSubmit = async () => {
    if (!yearBuilt) return;
    setIsUpdating(true);

    try {
      await Property.update(property.id, { year_built: parseInt(yearBuilt) });
      onComplete(parseInt(yearBuilt));
    } catch (err) {
      console.error('Failed to update year built:', err);
    }

    setIsUpdating(false);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center animate-in fade-in-50 duration-500">
      <Card className="border-2 border-slate-200 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">When was your home built?</h2>
            <p className="text-slate-600">
              This helps us show you which systems typically need attention at your home's age.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Year Built (approximate is fine)
            </label>
            <input
              type="number"
              value={yearBuilt}
              onChange={(e) => setYearBuilt(e.target.value)}
              placeholder="e.g., 1985"
              min="1800"
              max={currentYear}
              className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm text-slate-500">Quick select:</span>
            {[2020, 2010, 2000, 1990, 1980, 1970, 1960].map(year => (
              <button
                key={year}
                onClick={() => setYearBuilt(year.toString())}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  yearBuilt === year.toString()
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'border-slate-300 hover:border-orange-500'
                }`}
              >
                {year}s
              </button>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!yearBuilt || isUpdating}
            className="w-full gap-2"
            style={{
              backgroundColor: yearBuilt ? '#f97316' : '#ccc',
              minHeight: '52px'
            }}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Show My Home's Insights
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
