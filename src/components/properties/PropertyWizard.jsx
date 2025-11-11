import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropertyWizardStep1 from "./PropertyWizardStep1";
import PropertyWizardStep2 from "./PropertyWizardStep2";
import PropertyWizardStep3 from "./PropertyWizardStep3";
import PropertyWizardStep4 from "./PropertyWizardStep4";
import PropertyWizardComplete from "./PropertyWizardComplete";

export default function PropertyWizard({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [propertyData, setPropertyData] = React.useState({});
  const [createdProperty, setCreatedProperty] = React.useState(null);
  const queryClient = useQueryClient();

  const createPropertyMutation = useMutation({
    mutationFn: async (data) => {
      const fullAddress = `${data.street_address}${data.unit_number ? ` #${data.unit_number}` : ''}, ${data.city}, ${data.state} ${data.zip_code}`;
      
      return base44.entities.Property.create({
        ...data,
        address: fullAddress,
        setup_completed: true,
        baseline_completion: 0
      });
    },
    onSuccess: (property) => {
      setCreatedProperty(property);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setCurrentStep(5);
    },
  });

  const handleStep1Next = () => setCurrentStep(2);
  const handleStep2Next = () => setCurrentStep(3);
  const handleStep3Next = () => setCurrentStep(4);
  const handleStep4Next = () => {
    createPropertyMutation.mutate(propertyData);
  };

  const handleDataChange = (stepData) => {
    setPropertyData(prev => ({ ...prev, ...stepData }));
  };

  if (currentStep === 1) {
    return (
      <PropertyWizardStep1
        data={propertyData}
        onChange={handleDataChange}
        onNext={handleStep1Next}
        onCancel={onCancel}
      />
    );
  }

  if (currentStep === 2) {
    return (
      <PropertyWizardStep2
        data={propertyData}
        onChange={handleDataChange}
        onNext={handleStep2Next}
        onBack={() => setCurrentStep(1)}
      />
    );
  }

  if (currentStep === 3) {
    return (
      <PropertyWizardStep3
        data={propertyData}
        onChange={handleDataChange}
        onNext={handleStep3Next}
        onBack={() => setCurrentStep(2)}
      />
    );
  }

  if (currentStep === 4) {
    return (
      <PropertyWizardStep4
        data={propertyData}
        onChange={handleDataChange}
        onNext={handleStep4Next}
        onBack={() => setCurrentStep(3)}
      />
    );
  }

  if (currentStep === 5 && createdProperty) {
    return (
      <PropertyWizardComplete
        property={createdProperty}
        onComplete={onComplete}
      />
    );
  }

  return null;
}