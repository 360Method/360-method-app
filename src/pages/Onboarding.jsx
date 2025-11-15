import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

import OnboardingWelcome from "../components/onboarding/OnboardingWelcome";
import OnboardingUserProfile from "../components/onboarding/OnboardingUserProfile";
import OnboardingPropertyType from "../components/onboarding/OnboardingPropertyType";
import OnboardingPropertySetup from "../components/onboarding/OnboardingPropertySetup";
import OnboardingBaselinePrimer from "../components/onboarding/OnboardingBaselinePrimer";
import OnboardingComplete from "../components/onboarding/OnboardingComplete";
import OnboardingSkipDialog from "../components/onboarding/OnboardingSkipDialog";

export default function Onboarding() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [onboardingData, setOnboardingData] = React.useState({
    userType: null,
    property_use_type: null,
    property: null,
    selectedPath: null
  });
  const [showSkipDialog, setShowSkipDialog] = React.useState(false);
  const [showContent, setShowContent] = React.useState(false);
  const checkedRef = React.useRef(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: 1,
    staleTime: 30000,
  });

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
    enabled: !!user,
    retry: 1,
    staleTime: 30000,
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  // Check onboarding status once
  React.useEffect(() => {
    if (checkedRef.current) return;
    if (userLoading || propertiesLoading) return;

    checkedRef.current = true;

    if (user?.onboarding_completed && properties.length > 0) {
      navigate(createPageUrl("Dashboard"), { replace: true });
    } else {
      setShowContent(true);
    }
  }, [user, properties, userLoading, propertiesLoading, navigate]);

  const steps = [
    { id: 'welcome', component: OnboardingWelcome, title: 'Welcome to 360° Method' },
    { id: 'profile', component: OnboardingUserProfile, title: 'Tell Us About You' },
    { id: 'propertyType', component: OnboardingPropertyType, title: 'Property Type' },
    { id: 'property', component: OnboardingPropertySetup, title: 'Add Your First Property' },
    { id: 'baseline', component: OnboardingBaselinePrimer, title: 'Understanding Your Baseline' },
    { id: 'complete', component: OnboardingComplete, title: 'You\'re All Set!' }
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

  const handleSkipRequest = () => {
    setShowSkipDialog(true);
  };

  const handleSkipConfirm = async () => {
    await updateUserMutation.mutateAsync({ 
      onboarding_completed: true,
      onboarding_skipped: true,
      onboarding_completed_date: new Date().toISOString()
    });
    setShowSkipDialog(false);
    navigate(createPageUrl("Dashboard"), { replace: true });
  };

  const handleComplete = async (finalData) => {
    await updateUserMutation.mutateAsync({
      ...finalData,
      onboarding_completed: true,
      onboarding_skipped: false,
      onboarding_completed_date: new Date().toISOString()
    });
    
    if (onboardingData.selectedPath === 'wizard') {
      navigate(createPageUrl("Baseline") + `?property=${onboardingData.property.id}&wizard=true&fromOnboarding=true`, { replace: true });
    } else if (onboardingData.selectedPath === 'walkthrough') {
      navigate(createPageUrl("Baseline") + `?property=${onboardingData.property.id}&walkthrough=true&fromOnboarding=true`, { replace: true });
    } else {
      navigate(createPageUrl("Dashboard"), { replace: true });
    }
  };

  if (!showContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 mx-auto mb-4 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <div className="flex justify-end mb-4">
            <Button onClick={handleSkipRequest} variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4 mr-1" />
              Skip Setup
            </Button>
          </div>
        )}

        {currentStep > 0 && currentStep < steps.length - 1 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep} of {steps.length - 2}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / (steps.length - 2)) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(currentStep / (steps.length - 2)) * 100}%`,
                  backgroundColor: '#28A745'
                }}
              />
            </div>
          </div>
        )}

        <CurrentStepComponent
          onNext={handleStepComplete}
          onBack={currentStep > 0 ? handleBack : null}
          onSkip={handleSkipRequest}
          onComplete={handleComplete}
          data={onboardingData}
          user={user}
        />
      </div>

      <OnboardingSkipDialog
        open={showSkipDialog}
        onClose={() => setShowSkipDialog(false)}
        onConfirm={handleSkipConfirm}
      />
    </div>
  );
}