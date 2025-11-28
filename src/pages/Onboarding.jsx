import React from "react";
import { Property } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/lib/AuthContext";
import { useUser } from "@clerk/clerk-react";

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

const ONBOARDING_STORAGE_KEY = '360_onboarding_progress';

export default function Onboarding() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [onboardingData, setOnboardingData] = React.useState({});
  const [showContent, setShowContent] = React.useState(false);

  const navigate = useNavigate();

  // Use Clerk auth instead of Supabase auth
  const { user, isLoadingAuth } = useAuth();
  const { user: clerkUser } = useUser(); // For updating metadata
  const userLoading = isLoadingAuth;

  const { data: properties = [], isLoading: propertiesLoading, error: propertiesError } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      try {
        const result = await Property.list();
        return result || [];
      } catch (err) {
        console.error('Error fetching properties:', err);
        return []; // Return empty array on error so onboarding can proceed
      }
    },
    enabled: !!user,
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

  // Save onboarding progress to localStorage whenever it changes
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

  // Check onboarding status and decide what to show
  React.useEffect(() => {
    // Already showing content, nothing to do
    if (showContent) return;

    // Still loading auth, wait
    if (userLoading) {
      console.log('Onboarding: waiting for auth...');
      return;
    }

    // No user - show content anyway (RouteGuard handles redirect)
    if (!user) {
      console.log('Onboarding: no user, showing content');
      setShowContent(true);
      return;
    }

    // Still loading properties, wait
    if (propertiesLoading) {
      console.log('Onboarding: waiting for properties...');
      return;
    }

    // All data loaded - make decision
    console.log('Onboarding: all loaded, properties count:', properties.length);

    if (properties.length > 0) {
      // User has properties - mark onboarding complete and skip to dashboard
      console.log('Onboarding: user has properties, marking complete and redirecting to dashboard');
      localStorage.removeItem(`${ONBOARDING_STORAGE_KEY}_${user.id}`);

      // Mark onboarding as completed - use localStorage immediately, then update Clerk
      // localStorage is synchronous and prevents redirect loop
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');

      // Also update Clerk metadata (async, but localStorage already prevents loop)
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
      // No properties - show onboarding
      console.log('Onboarding: no properties, showing onboarding flow');
      setShowContent(true);
    }
  }, [user, clerkUser, properties, userLoading, propertiesLoading, navigate, showContent]);

  // Timeout fallback - if still loading after 3 seconds, show content anyway
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (!showContent) {
        console.log('Onboarding: timeout reached, forcing content display');
        setShowContent(true);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

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
    // Clear onboarding progress from localStorage - data is now in database
    if (user?.id) {
      localStorage.removeItem(`${ONBOARDING_STORAGE_KEY}_${user.id}`);
    }

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

  const handleSkip = () => {
    // Mark onboarding as complete and go to properties page
    if (user?.id) {
      localStorage.removeItem(`${ONBOARDING_STORAGE_KEY}_${user.id}`);
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }

    // Also update Clerk metadata
    if (clerkUser) {
      clerkUser.update({
        publicMetadata: {
          ...clerkUser.publicMetadata,
          onboarding_completed: true
        }
      }).catch(err => console.error('Failed to update onboarding status:', err));
    }

    // Navigate to properties page so they can add a property manually
    navigate(createPageUrl("Properties"), { replace: true });
  };

  // Debug log
  React.useEffect(() => {
    console.log('Onboarding state:', {
      showContent,
      userLoading,
      propertiesLoading,
      hasUser: !!user,
      userId: user?.id,
      propertiesCount: properties.length
    });
  }, [showContent, userLoading, propertiesLoading, user, properties]);

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
          {/* Debug info */}
          <p className="text-xs text-gray-400 mt-4">
            Auth: {userLoading ? 'loading' : 'ready'} |
            Props: {propertiesLoading ? 'loading' : 'ready'} |
            User: {user ? 'yes' : 'no'}
          </p>
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
          onSkip={currentStep === 0 ? handleSkip : null}
          data={onboardingData}
          user={user}
        />
      </div>
    </div>
  );
}
