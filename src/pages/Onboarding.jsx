import React from "react";
import { Property } from "@/api/supabaseClient";
import { supabase } from "@/api/supabaseClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/lib/AuthContext";
import { useUser } from "@clerk/clerk-react";
import { useGamification } from "@/lib/GamificationContext";

// NEW 4-step onboarding components
import OnboardingIntentSurvey from "../components/onboarding/OnboardingIntentSurvey";
import OnboardingAddressInput from "../components/onboarding/OnboardingAddressInput";
import RiskRevelationOverlay from "../components/onboarding/RiskRevelationOverlay";
import SmartSystemConfirmation from "../components/onboarding/SmartSystemConfirmation";
import OnboardingFirstTask from "../components/onboarding/OnboardingFirstTask";

// System lifespan data for generating insights
const SYSTEM_LIFESPANS = {
  'Roof System': { avgYears: 25, icon: '🏠', priority: 1 },
  'HVAC System': { avgYears: 15, icon: '❄️', priority: 2 },
  'Water Heater': { avgYears: 12, icon: '🔥', priority: 3 },
  'Electrical Panel': { avgYears: 40, icon: '⚡', priority: 4 },
  'Plumbing System': { avgYears: 50, icon: '🚿', priority: 5 },
  'Windows': { avgYears: 25, icon: '🪟', priority: 6 },
  'Foundation & Structure': { avgYears: 100, icon: '🏗️', priority: 7 },
};

// Generate insights based on home age
function generateAgeInsights(yearBuilt) {
  const currentYear = new Date().getFullYear();
  const homeAge = currentYear - yearBuilt;
  const insights = [];

  Object.entries(SYSTEM_LIFESPANS).forEach(([system, data]) => {
    const expectedReplacements = Math.floor(homeAge / data.avgYears);
    const yearsSinceLastExpected = homeAge % data.avgYears;
    const percentOfLifeUsed = (yearsSinceLastExpected / data.avgYears) * 100;

    let status = 'good';
    if (homeAge > data.avgYears) {
      status = 'verify';
    } else if (percentOfLifeUsed >= 70) {
      status = 'monitor';
    }

    insights.push({
      system,
      name: system,
      ...data,
      homeAge,
      expectedReplacements,
      yearsOld: homeAge,
      estimatedAge: homeAge,
      percentOfLifeUsed: Math.min(percentOfLifeUsed, 100),
      status,
    });
  });

  // Sort by status priority
  const statusOrder = { verify: 0, monitor: 1, good: 2 };
  insights.sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return a.priority - b.priority;
  });

  return insights;
}

/**
 * NEW ONBOARDING FLOW - 4 Steps with Personalization & Gamification
 *
 * Step 0: Intent Survey (NEW)
 *   - 3 quick tap questions: fear, goal, trigger
 *   - Personalizes entire experience
 *
 * Step 1: Enter Address + Risk Revelation
 *   - User enters their property address
 *   - DRAMATIC reveal of systems at risk (first aha moment!)
 *
 * Step 2: Smart Confirmations
 *   - Show auto-populated system guesses
 *   - Tap to confirm/update (minimize typing)
 *
 * Step 3: Personalized First Task
 *   - Different paths based on intent survey
 *   - Complete onboarding and enter the app
 */

const ONBOARDING_STORAGE_KEY = '360_onboarding_progress';

export default function Onboarding() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [onboardingData, setOnboardingData] = React.useState({});
  const [showContent, setShowContent] = React.useState(false);
  const [showRiskReveal, setShowRiskReveal] = React.useState(false);

  const navigate = useNavigate();

  // Auth and gamification
  const { user, isLoadingAuth } = useAuth();
  const { user: clerkUser } = useUser();
  const { awardXP, saveOnboardingIntent } = useGamification();
  const queryClient = useQueryClient();
  const userLoading = isLoadingAuth;
  const [isCreatingProperty, setIsCreatingProperty] = React.useState(false);

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties', user?.id],
    queryFn: async () => {
      try {
        // Filter by user_id for security (Clerk auth with permissive RLS)
        const result = await Property.list('-created_at', user?.id);
        return result || [];
      } catch (err) {
        console.error('Error fetching properties:', err);
        return [];
      }
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 5000,
  });

  // Load saved onboarding progress from localStorage
  React.useEffect(() => {
    if (!user?.id) return;

    try {
      const saved = localStorage.getItem(`${ONBOARDING_STORAGE_KEY}_${user.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.onboardingData) {
          setOnboardingData(parsed.onboardingData);
        }
        if (typeof parsed.currentStep === 'number') {
          setCurrentStep(parsed.currentStep);
        }
      }
    } catch (err) {
      console.error('Error loading onboarding progress:', err);
    }
  }, [user?.id]);

  // Save onboarding progress to localStorage
  React.useEffect(() => {
    if (!user?.id) return;

    try {
      localStorage.setItem(`${ONBOARDING_STORAGE_KEY}_${user.id}`, JSON.stringify({
        currentStep,
        onboardingData,
        lastUpdated: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Error saving onboarding progress:', err);
    }
  }, [user?.id, currentStep, onboardingData]);

  // Check onboarding status
  React.useEffect(() => {
    if (showContent) return;
    if (userLoading) return;

    if (!user) {
      setShowContent(true);
      return;
    }

    if (propertiesLoading) return;

    if (properties.length > 0) {
      localStorage.removeItem(`${ONBOARDING_STORAGE_KEY}_${user.id}`);
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');

      if (clerkUser && !clerkUser.publicMetadata?.onboarding_completed) {
        clerkUser.update({
          publicMetadata: {
            ...clerkUser.publicMetadata,
            onboarding_completed: true
          }
        }).catch(err => console.error('Failed to update onboarding status:', err));
      }

      navigate(createPageUrl("Dashboard"), { replace: true });
    } else {
      setShowContent(true);
    }
  }, [user, clerkUser, properties, userLoading, propertiesLoading, navigate, showContent]);

  // Timeout fallback
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (!showContent) {
        setShowContent(true);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  // NEW 4-step flow
  const steps = [
    { id: 'intent', label: 'Intent' },
    { id: 'address', label: 'Address' },
    { id: 'confirmations', label: 'Confirm' },
    { id: 'firstTask', label: 'Start' }
  ];

  // Handle step completion
  const handleStepComplete = async (stepData) => {
    const newData = { ...onboardingData, ...stepData };
    setOnboardingData(newData);

    // Step 0: Intent Survey completed
    if (currentStep === 0 && stepData.intent) {
      await awardXP('complete_survey');
      await saveOnboardingIntent(stepData.intent);
      setCurrentStep(1);
      return;
    }

    // Step 1: Address completed - CREATE PROPERTY and show risk revelation
    if (currentStep === 1 && stepData.address) {
      setIsCreatingProperty(true);

      try {
        const address = stepData.address;

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

        // 2. Create the property (include user_id for Clerk auth)
        const propertyPayload = {
          user_id: user?.id, // Associate property with the current Clerk user
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

        if (address.unit_number) propertyPayload.unit_number = address.unit_number;

        if (!user?.id) {
          throw new Error('User ID is required to create a property');
        }

        const newProperty = await Property.create(propertyPayload);

        // Invalidate ALL property queries (including user-specific ones)
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        queryClient.invalidateQueries({ queryKey: ['properties', user?.id] });

        // 3. Generate insights if we have year_built
        const yearBuilt = fetchedData?.year_built || newProperty?.year_built;
        let insights = [];
        let propertyData = { ...newProperty, ...fetchedData };

        if (yearBuilt) {
          insights = generateAgeInsights(yearBuilt);
          propertyData.year_built = yearBuilt;
        }

        // 4. Update state with all the data
        setOnboardingData(prev => ({
          ...prev,
          address: stepData.address,
          property: newProperty,
          propertyData,
          insights
        }));

        await awardXP('add_property');
        setIsCreatingProperty(false);
        setShowRiskReveal(true);

      } catch (err) {
        console.error('Error creating property:', err);
        console.error('Error details:', {
          message: err?.message,
          code: err?.code,
          details: err?.details,
          hint: err?.hint,
          stack: err?.stack
        });
        setIsCreatingProperty(false);
        // Still try to proceed even if property creation fails
        setOnboardingData(prev => ({
          ...prev,
          address: stepData.address,
          insights: []
        }));
        setShowRiskReveal(true);
      }
      return;
    }

    // Step 2: Confirmations completed
    if (currentStep === 2) {
      setCurrentStep(3);
      return;
    }

    // Default: advance to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle risk reveal continue
  const handleRiskRevealContinue = async () => {
    await awardXP('first_aha_moment');
    setShowRiskReveal(false);
    setCurrentStep(2);
  };

  // Handle back navigation
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle final completion
  const handleComplete = async (finalData) => {
    // Award completion XP
    await awardXP('complete_onboarding');

    // Clear onboarding progress
    if (user?.id) {
      localStorage.removeItem(`${ONBOARDING_STORAGE_KEY}_${user.id}`);
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }

    // Update Clerk metadata
    if (clerkUser) {
      clerkUser.update({
        publicMetadata: {
          ...clerkUser.publicMetadata,
          onboarding_completed: true,
          user_type: onboardingData.intent?.goal === 'build_wealth' ? 'investor' : 'homeowner'
        }
      }).catch(err => console.error('Failed to update onboarding status:', err));
    }

    // Navigate based on user's choice and intent
    if (finalData.destination === 'baseline' && finalData.property) {
      const params = new URLSearchParams({
        property: finalData.property.id,
        fromOnboarding: 'true'
      });
      if (finalData.suggestedSystem) {
        params.append('suggestedSystem', finalData.suggestedSystem);
      }
      navigate(`${createPageUrl("Baseline")}?${params.toString()}`, { replace: true });
    } else if (onboardingData.intent?.goal === 'build_wealth') {
      // Investor path - go to investor dashboard
      navigate(createPageUrl("DashboardInvestor"), { replace: true });
    } else {
      navigate(createPageUrl("Dashboard"), { replace: true });
    }
  };

  // Handle skip
  const handleSkip = () => {
    if (user?.id) {
      localStorage.removeItem(`${ONBOARDING_STORAGE_KEY}_${user.id}`);
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }

    if (clerkUser) {
      clerkUser.update({
        publicMetadata: {
          ...clerkUser.publicMetadata,
          onboarding_completed: true
        }
      }).catch(err => console.error('Failed to update onboarding status:', err));
    }

    navigate(createPageUrl("Properties"), { replace: true });
  };

  // Loading state
  if (!showContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 mx-auto mb-4 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Preparing your experience</p>
        </div>
      </div>
    );
  }

  // Creating property loading state
  if (isCreatingProperty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 mx-auto mb-4 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing Your Home</h2>
          <p className="text-gray-600">Fetching property details and generating insights...</p>
        </div>
      </div>
    );
  }

  // Show risk revelation overlay
  if (showRiskReveal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
        <div className="max-w-2xl mx-auto p-4 md:p-8">
          <RiskRevelationOverlay
            propertyData={onboardingData.propertyData}
            insights={onboardingData.insights || []}
            intentData={onboardingData.intent}
            onContinue={handleRiskRevealContinue}
          />
        </div>
      </div>
    );
  }

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <OnboardingIntentSurvey
            onNext={handleStepComplete}
            user={user}
          />
        );

      case 1:
        return (
          <OnboardingAddressInput
            onNext={handleStepComplete}
            onBack={handleBack}
            onSkip={handleSkip}
            data={onboardingData}
            user={user}
          />
        );

      case 2:
        return (
          <SmartSystemConfirmation
            propertyData={onboardingData.propertyData}
            insights={onboardingData.insights || []}
            onNext={handleStepComplete}
            onBack={handleBack}
          />
        );

      case 3:
        return (
          <OnboardingFirstTask
            onComplete={handleComplete}
            data={{
              ...onboardingData,
              intent: onboardingData.intent
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        {/* Progress indicator - 4 steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-8 bg-orange-500'
                  : idx < currentStep
                  ? 'w-2.5 bg-green-500'
                  : 'w-2.5 bg-slate-300'
              }`}
            />
          ))}
        </div>

        {renderStep()}
      </div>
    </div>
  );
}
