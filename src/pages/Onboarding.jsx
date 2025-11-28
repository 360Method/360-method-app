import React from "react";
import { auth } from "@/api/supabaseClient";
import { Property } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

// New streamlined onboarding components (3-click flow)
import OnboardingAddressInput from "../components/onboarding/OnboardingAddressInput";
import OnboardingInsights from "../components/onboarding/OnboardingInsights";
import OnboardingFirstTask from "../components/onboarding/OnboardingFirstTask";

/**
 * NEW ONBOARDING FLOW - 3 Clicks to First Win
 *
 * Step 1: Enter Address (single input)
 *   - User enters their property address
 *   - We auto-detect everything else
 *
 * Step 2: See Insights (aha moment!)
 *   - Auto-fetch property data from Zillow API
 *   - Show age-based insights: "Your home is 38 years old, here's what needs attention"
 *   - Create property in database
 *
 * Step 3: First Task
 *   - Show their personalized first recommendation
 *   - "Document your [top priority system]" or "Explore dashboard"
 *   - Complete onboarding and enter the app
 */

export default function Onboarding() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [onboardingData, setOnboardingData] = React.useState({});
  const [showContent, setShowContent] = React.useState(false);
  const checkedRef = React.useRef(false);

  const navigate = useNavigate();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => auth.me(),
    retry: 1,
    staleTime: 30000,
  });

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => Property.list(),
    enabled: !!user,
    retry: 1,
    staleTime: 30000,
  });

  // Check onboarding status once
  React.useEffect(() => {
    if (checkedRef.current) return;
    if (userLoading || propertiesLoading) return;

    checkedRef.current = true;

    // If already completed onboarding and has properties, go to dashboard
    if (user?.onboarding_completed && properties.length > 0) {
      navigate(createPageUrl("Dashboard"), { replace: true });
    } else {
      setShowContent(true);
    }
  }, [user, properties, userLoading, propertiesLoading, navigate]);

  // New streamlined 3-step flow
  const steps = [
    { id: 'address', component: OnboardingAddressInput },
    { id: 'insights', component: OnboardingInsights },
    { id: 'firstTask', component: OnboardingFirstTask }
  ];

  const handleStepComplete = (stepData) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }));

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = (finalData) => {
    // Navigate based on user's choice
    if (finalData.destination === 'baseline' && finalData.property) {
      // Go to baseline with property and suggested system
      const params = new URLSearchParams({
        property: finalData.property.id,
        fromOnboarding: 'true'
      });
      if (finalData.suggestedSystem) {
        params.append('suggestedSystem', finalData.suggestedSystem);
      }
      navigate(`${createPageUrl("Baseline")}?${params.toString()}`, { replace: true });
    } else {
      // Go to dashboard
      navigate(createPageUrl("Dashboard"), { replace: true });
    }
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

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        {/* Progress indicator - simple dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-8 bg-orange-500'
                  : idx < currentStep
                  ? 'bg-green-500'
                  : 'bg-slate-300'
              }`}
            />
          ))}
        </div>

        <CurrentStepComponent
          onNext={handleStepComplete}
          onBack={currentStep > 0 ? handleBack : null}
          onComplete={handleComplete}
          data={onboardingData}
          user={user}
        />
      </div>
    </div>
  );
}
