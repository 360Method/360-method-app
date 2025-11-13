import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import UserTypeSelector from "./UserTypeSelector";
import PropertyTypeSelector from "./PropertyTypeSelector";
import PropertyWizardStep1 from "./PropertyWizardStep1";
import PropertyWizardStep2 from "./PropertyWizardStep2";
import PropertyWizardStep3 from "./PropertyWizardStep3";
import RentalConfigStep from "./RentalConfigStep";
import PropertyWizardStep4 from "./PropertyWizardStep4";
import PropertyConfirmation from "./PropertyConfirmation";
import PropertyWizardComplete from "./PropertyWizardComplete";

export default function PropertyWizard({ onComplete, onCancel, existingDraft = null }) {
  const [currentStep, setCurrentStep] = React.useState(existingDraft?.draft_step ?? -1);
  const [userType, setUserType] = React.useState(null);
  const [propertyData, setPropertyData] = React.useState(existingDraft || {});
  const [createdProperty, setCreatedProperty] = React.useState(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [draftId, setDraftId] = React.useState(existingDraft?.id || null);
  const queryClient = useQueryClient();

  // Save as draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async ({ data, step }) => {
      const draftData = {
        ...data,
        is_draft: true,
        draft_step: step,
        setup_completed: false
      };

      // Clean data for draft (minimal validation)
      const cleanDraftData = {
        address: data.formatted_address || data.street_address || "Draft Property",
        ...draftData
      };

      // Remove completely undefined values
      Object.keys(cleanDraftData).forEach(key => {
        if (cleanDraftData[key] === undefined) {
          delete cleanDraftData[key];
        }
      });

      if (draftId) {
        // Update existing draft
        return await base44.entities.Property.update(draftId, cleanDraftData);
      } else {
        // Create new draft
        const result = await base44.entities.Property.create(cleanDraftData);
        setDraftId(result.id);
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['draft-properties'] });
    }
  });

  // Auto-save draft when stepping through wizard
  const saveDraft = React.useCallback((step) => {
    if (propertyData.street_address || propertyData.formatted_address) {
      saveDraftMutation.mutate({ data: propertyData, step });
    }
  }, [propertyData, saveDraftMutation]);

  const createPropertyMutation = useMutation({
    mutationFn: async (data) => {
      console.log('Creating property with data:', data);
      
      // Ensure required address field exists
      if (!data.street_address && !data.address && !data.formatted_address) {
        throw new Error('Address is required');
      }

      // Use formatted_address as the main address if street_address is missing
      const mainAddress = data.address || data.formatted_address || 
                         `${data.street_address}${data.unit_number ? ` #${data.unit_number}` : ''}, ${data.city}, ${data.state} ${data.zip_code}`;
      
      // Clean up rental_config to ensure all numeric fields are numbers
      const cleanRentalConfig = data.rental_config ? {
        ...data.rental_config,
        number_of_rental_units: data.rental_config.number_of_rental_units ? parseInt(data.rental_config.number_of_rental_units) : undefined,
        rental_square_footage: data.rental_config.rental_square_footage ? parseInt(data.rental_config.rental_square_footage) : undefined,
        annual_turnovers: data.rental_config.annual_turnovers ? parseInt(data.rental_config.annual_turnovers) : undefined,
        bookings_per_year: data.rental_config.bookings_per_year ? parseInt(data.rental_config.bookings_per_year) : undefined,
        monthly_rent: data.rental_config.monthly_rent ? parseFloat(data.rental_config.monthly_rent) : undefined,
        nightly_rate: data.rental_config.nightly_rate ? parseFloat(data.rental_config.nightly_rate) : undefined,
      } : undefined;

      // Remove undefined values from rental_config
      if (cleanRentalConfig) {
        Object.keys(cleanRentalConfig).forEach(key => {
          if (cleanRentalConfig[key] === undefined || cleanRentalConfig[key] === "" || cleanRentalConfig[key] === null) {
            delete cleanRentalConfig[key];
          }
        });
      }

      // Clean up units array to ensure numeric fields are numbers
      const cleanUnits = data.units ? data.units.map(unit => {
        const cleanUnit = {
          ...unit,
          square_footage: unit.square_footage ? parseInt(unit.square_footage) : undefined,
          bedrooms: unit.bedrooms ? parseInt(unit.bedrooms) : undefined,
          bathrooms: unit.bathrooms ? parseFloat(unit.bathrooms) : undefined,
          monthly_rent: unit.monthly_rent ? parseFloat(unit.monthly_rent) : undefined,
        };
        
        // Remove undefined values
        Object.keys(cleanUnit).forEach(key => {
          if (cleanUnit[key] === undefined || cleanUnit[key] === "" || cleanUnit[key] === null) {
            delete cleanUnit[key];
          }
        });
        
        return cleanUnit;
      }) : undefined;

      // Clean up the data before sending
      const cleanData = {
        ...data,
        address: mainAddress,
        year_built: data.year_built ? parseInt(data.year_built) : undefined,
        square_footage: data.square_footage ? parseInt(data.square_footage) : undefined,
        bedrooms: data.bedrooms !== undefined && data.bedrooms !== "" ? parseInt(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? parseFloat(data.bathrooms) : undefined,
        purchase_price: data.purchase_price ? parseFloat(data.purchase_price) : undefined,
        current_value: data.current_value ? parseFloat(data.current_value) : undefined,
        rental_config: cleanRentalConfig,
        units: cleanUnits,
        setup_completed: true,
        is_draft: false,
        draft_step: null,
        baseline_completion: 0,
        health_score: 0,
        total_maintenance_spent: 0,
        estimated_disasters_prevented: 0,
      };

      // Remove any undefined values
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === undefined || cleanData[key] === "") {
          delete cleanData[key];
        }
      });

      console.log('Cleaned data:', cleanData);
      
      // Update existing draft or create new property
      if (draftId) {
        return await base44.entities.Property.update(draftId, cleanData);
      } else {
        return await base44.entities.Property.create(cleanData);
      }
    },
    onSuccess: (property) => {
      console.log('Property created successfully:', property);
      setCreatedProperty(property);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['draft-properties'] });
      setIsCreating(false);
      setCurrentStep(6);
    },
    onError: (error) => {
      console.error('Property creation failed:', error);
      console.error('Error details:', error.message, error.response?.data);
      alert(`Failed to create property: ${error.message || 'Please check the console for details and try again.'}`);
      setIsCreating(false);
    }
  });

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setCurrentStep(0);
    saveDraft(-1);
  };

  const handlePropertyTypeSelect = (type) => {
    handleDataChange({ property_use_type: type });
    setCurrentStep(1);
    saveDraft(0);
  };

  const handleStep1Next = () => {
    saveDraft(1);
    setCurrentStep(2);
  };
  
  const handleStep2Next = () => {
    saveDraft(2);
    if (propertyData.property_use_type === 'primary') {
      setCurrentStep(4);
    } else {
      setCurrentStep(3);
    }
  };
  
  const handleStep3Next = () => {
    saveDraft(3);
    setCurrentStep(4);
  };
  
  const handleStep4Next = () => {
    saveDraft(4);
    setCurrentStep(5);
  };
  
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

  const handleCancel = () => {
    // Save draft before canceling
    if (currentStep >= 1 && (propertyData.street_address || propertyData.formatted_address)) {
      saveDraft(currentStep);
    }
    onCancel();
  };

  // Step -1: User Type Selection
  if (currentStep === -1) {
    return (
      <UserTypeSelector
        onSelect={handleUserTypeSelect}
        onCancel={handleCancel}
      />
    );
  }

  // Step 0: Property Type Selection
  if (currentStep === 0) {
    return (
      <PropertyTypeSelector
        userType={userType}
        onSelect={handlePropertyTypeSelect}
        onBack={() => setCurrentStep(-1)}
        onCancel={handleCancel}
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
        onCancel={() => {
          saveDraft(1);
          setCurrentStep(0);
        }}
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

  // Step 3: Rental Configuration
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
  if (currentStep === 5) {
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