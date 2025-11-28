import React, { useEffect, useState } from "react";
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
function generateAgeInsights(yearBuilt, currentYear = new Date().getFullYear()) {
  const homeAge = currentYear - yearBuilt;
  const insights = [];

  Object.entries(SYSTEM_LIFESPANS).forEach(([system, data]) => {
    const expectedReplacements = Math.floor(homeAge / data.avgYears);
    const yearsSinceLastExpected = homeAge % data.avgYears;
    const percentOfLifeUsed = (yearsSinceLastExpected / data.avgYears) * 100;

    let status = 'good';
    let message = '';

    if (percentOfLifeUsed >= 100) {
      status = 'critical';
      message = `Likely past expected lifespan if original`;
    } else if (percentOfLifeUsed >= 80) {
      status = 'warning';
      message = `May need attention in ${Math.ceil(data.avgYears - yearsSinceLastExpected)} years`;
    } else if (percentOfLifeUsed >= 60) {
      status = 'monitor';
      message = `About ${Math.round(percentOfLifeUsed)}% through typical lifespan`;
    } else {
      status = 'good';
      message = `Typically has ${Math.ceil(data.avgYears - yearsSinceLastExpected)}+ years remaining`;
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

  // Sort by priority and status (critical first)
  const statusOrder = { critical: 0, warning: 1, monitor: 2, good: 3 };
  insights.sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return a.priority - b.priority;
  });

  return insights;
}

// Calculate potential savings
function calculatePotentialSavings(insights) {
  let potentialSavings = 0;
  insights.forEach(insight => {
    if (insight.status === 'critical' || insight.status === 'warning') {
      // Catching issues early saves roughly 50-70% of emergency costs
      const avgReplacementCost = {
        'Roof': 15000,
        'HVAC': 8000,
        'Water Heater': 1500,
        'Electrical Panel': 2500,
        'Windows': 8000,
        'Plumbing': 5000,
        'Furnace': 4500,
        'Air Conditioner': 5500,
        'Siding': 15000,
        'Garage Door': 1200
      }[insight.system] || 2000;
      potentialSavings += avgReplacementCost * 0.4; // 40% savings from proactive vs reactive
    }
  });
  return Math.round(potentialSavings);
}

export default function OnboardingInsights({ onNext, onBack, data }) {
  const [propertyData, setPropertyData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createdProperty, setCreatedProperty] = useState(null);

  const queryClient = useQueryClient();

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: (propertyData) => Property.create(propertyData),
    onSuccess: (newProperty) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setCreatedProperty(newProperty);
    },
  });

  // Fetch property data and create property
  useEffect(() => {
    async function fetchAndCreate() {
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

          if (response.data?.success && response.data?.data) {
            fetchedData = response.data.data;
          }
        } catch (fetchError) {
          console.log('Property data fetch failed, will use manual entry:', fetchError);
        }

        // 2. Create the property
        const propertyPayload = {
          address: address.formatted_address,
          street_address: address.street_address,
          unit_number: address.unit_number,
          city: address.city,
          state: address.state,
          zip_code: address.zip_code,
          county: address.county,
          formatted_address: address.formatted_address,
          place_id: address.place_id,
          coordinates: address.coordinates,
          address_verified: true,
          verification_source: "google_maps",
          climate_zone: address.climate_zone,
          property_type: fetchedData?.property_type || "Single-Family Home",
          year_built: fetchedData?.year_built || null,
          square_footage: fetchedData?.square_footage || null,
          bedrooms: fetchedData?.bedrooms || null,
          bathrooms: fetchedData?.bathrooms || null,
          door_count: 1,
          setup_completed: false,
          baseline_completion: 0
        };

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
        setError('Failed to set up your property. Please try again.');
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
  const criticalCount = insights.filter(i => i.status === 'critical').length;
  const warningCount = insights.filter(i => i.status === 'warning').length;
  const potentialSavings = calculatePotentialSavings(insights);

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
              <div className="text-3xl font-bold text-orange-400">{criticalCount + warningCount}</div>
              <div className="text-sm text-slate-300">Systems to Watch</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-400">${Math.round(potentialSavings / 1000)}K</div>
              <div className="text-sm text-slate-300">Potential Savings</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{homeAge}</div>
              <div className="text-sm text-slate-300">Years Old</div>
            </div>
          </div>

          <p className="text-slate-300 text-center">
            Based on your home's age, here's what typically needs attention.
            <span className="text-orange-400 font-medium"> Let's catch the $50 fix before it becomes the $5,000 disaster.</span>
          </p>
        </CardContent>
      </Card>

      {/* Systems Insights */}
      <Card className="border-2 border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Systems to Watch</h2>
          </div>

          <div className="space-y-3">
            {insights.slice(0, 5).map((insight) => (
              <div
                key={insight.system}
                className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                  insight.status === 'critical'
                    ? 'bg-red-50 border-red-200'
                    : insight.status === 'warning'
                    ? 'bg-amber-50 border-amber-200'
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
                    insight.status === 'critical'
                      ? 'bg-red-500 text-white'
                      : insight.status === 'warning'
                      ? 'bg-amber-500 text-white'
                      : insight.status === 'monitor'
                      ? 'bg-blue-500 text-white'
                      : 'bg-green-500 text-white'
                  }
                >
                  {insight.status === 'critical'
                    ? 'Check Soon'
                    : insight.status === 'warning'
                    ? 'Watch'
                    : insight.status === 'monitor'
                    ? 'Monitor'
                    : 'Good'}
                </Badge>
              </div>
            ))}
          </div>

          {insights.length > 5 && (
            <p className="text-center text-sm text-slate-500 mt-4">
              + {insights.length - 5} more systems to track
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
                Save up to ${potentialSavings.toLocaleString()} Over 5 Years
              </h3>
              <p className="text-green-800 text-sm">
                By tracking these systems and catching issues early, you could avoid costly emergency repairs.
                The average homeowner spends 60% more on reactive repairs than those who plan ahead.
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
