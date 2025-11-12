import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropertyTypeSelector from "./PropertyTypeSelector";
import PropertyWizardStep1 from "./PropertyWizardStep1";
import PropertyWizardStep2 from "./PropertyWizardStep2";
import PropertyWizardStep3 from "./PropertyWizardStep3";
import RentalConfigStep from "./RentalConfigStep";
import PropertyWizardStep4 from "./PropertyWizardStep4";
import PropertyConfirmation from "./PropertyConfirmation";
import PropertyWizardComplete from "./PropertyWizardComplete";

export default function PropertyWizard({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = React.useState(0); // Start at 0 for type selector
  const [propertyData, setPropertyData] = React.useState({});
  const [createdProperty, setCreatedProperty] = React.useState(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const queryClient = useQueryClient();

  const createPropertyMutation = useMutation({
    mutationFn: async (data) => {
      console.log('Creating property with data:', data);
      
      // Clean the data - convert empty strings to undefined for numeric fields
      const cleanedData = { ...data };
      
      const numericFields = [
        'year_built', 'square_footage', 'bedrooms', 'bathrooms',
        'purchase_price', 'current_value', 'monthly_rent', 'door_count'
      ];
      
      numericFields.forEach(field => {
        if (cleanedData[field] === '' || cleanedData[field] === null) {
          delete cleanedData[field];
        } else if (cleanedData[field] !== undefined) {
          cleanedData[field] = Number(cleanedData[field]);
        }
      });
      
      // Clean units array if it exists
      if (cleanedData.units && Array.isArray(cleanedData.units)) {
        cleanedData.units = cleanedData.units.map(unit => {
          const cleanedUnit = { ...unit };
          ['square_footage', 'bedrooms', 'bathrooms'].forEach(field => {
            if (cleanedUnit[field] === '' || cleanedUnit[field] === null) {
              delete cleanedUnit[field];
            } else if (cleanedUnit[field] !== undefined) {
              cleanedUnit[field] = Number(cleanedUnit[field]);
            }
          });
          return cleanedUnit;
        });
      }
      
      const fullAddress = `${cleanedData.street_address}${cleanedData.unit_number ? ` #${cleanedData.unit_number}` : ''}, ${cleanedData.city}, ${cleanedData.state} ${cleanedData.zip_code}`;
      
      console.log('Cleaned data before create:', cleanedData);
      
      return base44.entities.Property.create({
        ...cleanedData,
        address: fullAddress,
        setup_completed: true,
        baseline_completion: 0
      });
    },
    onSuccess: (property) => {
      console.log('Property created successfully:', property);
      setCreatedProperty(property);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setIsCreating(false);
      setCurrentStep(6); // Go to complete screen (was 5, now 6)
    },
    onError: (error) => {
      console.error('Error creating property:', error);
      setIsCreating(false);
      alert('Error creating property: ' + (error.message || 'Unknown error'));
    }
  });

  const handleTypeSelect = (type) => {
    handleDataChange({ property_use_type: type });
    setCurrentStep(1);
  };

  const handleStep1Next = () => setCurrentStep(2);
  const handleStep2Next = () => {
    // If property type is primary, skip rental config
    if (propertyData.property_use_type === 'primary') {
      setCurrentStep(4); // Skip to financial details (step 4)
    } else {
      setCurrentStep(3); // Go to rental config
    }
  };
  const handleStep3Next = () => setCurrentStep(4); // Rental config to financial
  const handleStep4Next = () => setCurrentStep(5); // Financial to confirmation
  
  const handleConfirmation = () => {
    console.log('Confirmation clicked, propertyData:', propertyData);
    setIsCreating(true);
    createPropertyMutation.mutate(propertyData);
  };

  const handleDataChange = (stepData) => {
    setPropertyData(prev => {
      const updated = { ...prev, ...stepData };
      console.log('Property data updated:', updated);
      return updated;
    });
  };

  // Step 0: Property Type Selection
  if (currentStep === 0) {
    return (
      <PropertyTypeSelector
        onSelect={handleTypeSelect}
        onCancel={onCancel}
      />
    );
  }

  // Step 1: Address
  if (currentStep === 1) {
    return (
      <PropertyWizardStep1
        data={propertyData}
        onChange={handleDataChange}
        onNext={handleStep1Next}
        onCancel={() => setCurrentStep(0)}
      />
    );
  }

  // Step 2: Property Details
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

  // Step 3: Rental Configuration (conditional)
  if (currentStep === 3) {
    return (
      <RentalConfigStep
        data={propertyData}
        propertyUseType={propertyData.property_use_type}
        onChange={handleDataChange}
        onNext={handleStep3Next}
        onBack={() => setCurrentStep(2)}
      />
    );
  }

  // Step 4: Financial Details
  if (currentStep === 4) {
    return (
      <PropertyWizardStep4
        data={propertyData}
        onChange={handleDataChange}
        onNext={handleStep4Next}
        onBack={() => {
          // Go back to rental config if not primary, otherwise go to property details
          if (propertyData.property_use_type === 'primary') {
            setCurrentStep(2);
          } else {
            setCurrentStep(3);
          }
        }}
        isCreating={false}
      />
    );
  }

  // Step 5: Confirmation
  if (currentStep === 5 && !createdProperty) {
    return (
      <PropertyConfirmation
        data={propertyData}
        onEdit={() => setCurrentStep(1)}
        onConfirm={handleConfirmation}
        isCreating={isCreating}
      />
    );
  }

  // Step 6: Complete
  if (currentStep === 6 && createdProperty) {
    return (
      <PropertyWizardComplete
        property={createdProperty}
        onComplete={onComplete}
      />
    );
  }

  return null;
}