import React from "react";
import { Property } from "@/api/supabaseClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useGamification } from "@/lib/GamificationContext";
import { useAuth } from "@/lib/AuthContext";
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
  const { awardXP, checkAchievement, hasAchievement } = useGamification();
  const { user } = useAuth();

  // Query to count existing properties for achievement checks
  const { data: existingProperties = [] } = useQuery({
    queryKey: ['properties', user?.id],
    queryFn: () => user?.id ? Property.list('-created_at', user.id) : Promise.resolve([]),
    enabled: !!user?.id
  });

  // Save as draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async ({ data, step }) => {
      // Build clean draft data with ONLY valid database columns
      const cleanDraftData = {
        // Address fields
        address: data.formatted_address || data.street_address || "Draft Property",
        street_address: data.street_address,
        formatted_address: data.formatted_address,
        unit_number: data.unit_number,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,

        // Property classification
        property_type: data.property_type,
        property_use_type: data.property_use_type,

        // Property details
        year_built: data.year_built ? parseInt(data.year_built) : undefined,
        square_footage: data.square_footage ? parseInt(data.square_footage) : undefined,
        bedrooms: data.bedrooms !== undefined && data.bedrooms !== "" ? parseInt(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? parseFloat(data.bathrooms) : undefined,
        lot_size: data.lot_size ? parseFloat(data.lot_size) : undefined,

        // Financial info
        purchase_price: data.purchase_price ? parseFloat(data.purchase_price) : undefined,
        current_value: data.current_value ? parseFloat(data.current_value) : undefined,

        // Rental configuration (JSONB)
        rental_config: data.rental_config,

        // Multi-unit configuration (JSONB)
        units: data.units,

        // Draft state
        is_draft: true,
        draft_step: step,
        setup_completed: false
      };

      // Remove completely undefined or null values
      Object.keys(cleanDraftData).forEach(key => {
        if (cleanDraftData[key] === undefined || cleanDraftData[key] === null) {
          delete cleanDraftData[key];
        }
      });

      if (draftId) {
        // Update existing draft
        return await Property.update(draftId, cleanDraftData);
      } else {
        // Create new draft
        const result = await Property.create(cleanDraftData);
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

      // Clean up the data before sending - ONLY include valid database columns
      // The properties table schema is defined in migrations 001 and 023
      const cleanData = {
        // Address fields
        address: mainAddress,
        street_address: data.street_address,
        formatted_address: data.formatted_address,
        unit_number: data.unit_number,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,

        // Property classification
        property_type: data.property_type,
        property_use_type: data.property_use_type,

        // Property details
        year_built: data.year_built ? parseInt(data.year_built) : undefined,
        square_footage: data.square_footage ? parseInt(data.square_footage) : undefined,
        bedrooms: data.bedrooms !== undefined && data.bedrooms !== "" ? parseInt(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? parseFloat(data.bathrooms) : undefined,
        lot_size: data.lot_size ? parseFloat(data.lot_size) : undefined,

        // Financial info
        purchase_price: data.purchase_price ? parseFloat(data.purchase_price) : undefined,
        current_value: data.current_value ? parseFloat(data.current_value) : undefined,
        purchase_date: data.purchase_date,

        // Financial profile columns (from migration 023)
        closing_costs: data.closing_costs ? parseFloat(data.closing_costs) : undefined,
        down_payment_percent: data.down_payment_percent ? parseFloat(data.down_payment_percent) : undefined,
        loan_term_years: data.loan_term_years ? parseInt(data.loan_term_years) : undefined,
        mortgage_balance: data.mortgage_balance ? parseFloat(data.mortgage_balance) : undefined,
        monthly_mortgage_payment: data.monthly_mortgage_payment ? parseFloat(data.monthly_mortgage_payment) : undefined,
        interest_rate: data.interest_rate ? parseFloat(data.interest_rate) : undefined,
        monthly_rent: data.monthly_rent ? parseFloat(data.monthly_rent) : undefined,
        monthly_insurance: data.monthly_insurance ? parseFloat(data.monthly_insurance) : undefined,
        monthly_taxes: data.monthly_taxes ? parseFloat(data.monthly_taxes) : undefined,
        monthly_hoa: data.monthly_hoa ? parseFloat(data.monthly_hoa) : undefined,
        estimated_maintenance: data.estimated_maintenance ? parseFloat(data.estimated_maintenance) : undefined,

        // Rental configuration (JSONB)
        rental_config: cleanRentalConfig,

        // Multi-unit configuration (JSONB)
        units: cleanUnits,

        // Photos (JSONB array)
        photos: data.photos,

        // Wizard/draft state
        setup_completed: true,
        is_draft: false,
        draft_step: null,

        // 360° Method metrics - initialize to 0
        baseline_completion: 0,
        health_score: 0,
        total_maintenance_spent: 0,
        estimated_disasters_prevented: 0,
      };

      // Remove any undefined or empty values
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === undefined || cleanData[key] === "" || cleanData[key] === null) {
          delete cleanData[key];
        }
      });

      console.log('Cleaned data:', cleanData);
      
      // Update existing draft or create new property
      if (draftId) {
        return await Property.update(draftId, cleanData);
      } else {
        return await Property.create(cleanData);
      }
    },
    onSuccess: async (property) => {
      console.log('Property created successfully:', property);
      setCreatedProperty(property);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['draft-properties'] });
      setIsCreating(false);
      setCurrentStep(6);

      // ========================================
      // GAMIFICATION: Award XP for adding properties
      // ========================================
      try {
        // Count existing non-draft properties
        const nonDraftProperties = existingProperties.filter(p => !p.is_draft);
        const newPropertyCount = nonDraftProperties.length + 1;

        // Award XP for 2nd property
        if (newPropertyCount === 2) {
          await awardXP('add_second_property', {
            entityType: 'property',
            entityId: property.id,
            propertyCount: newPropertyCount
          });

          // Check for portfolio_starter achievement (2+ properties)
          if (!hasAchievement('portfolio_starter')) {
            await checkAchievement('portfolio_starter');
          }
        }

        // Award XP for 5th property
        if (newPropertyCount === 5) {
          await awardXP('add_fifth_property', {
            entityType: 'property',
            entityId: property.id,
            propertyCount: newPropertyCount
          });

          // Check for portfolio_builder achievement (5+ properties)
          if (!hasAchievement('portfolio_builder')) {
            await checkAchievement('portfolio_builder');
          }
        }

        // Check for wealth_architect achievement (10+ properties)
        if (newPropertyCount >= 10 && !hasAchievement('wealth_architect')) {
          await checkAchievement('wealth_architect');
        }
      } catch (err) {
        console.error('Error awarding XP for property creation:', err);
        // Don't block the user flow
      }
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