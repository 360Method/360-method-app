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

export default function PropertyWizard({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = React.useState(-1); // Start at -1 for user type selector
  const [userType, setUserType] = React.useState(null); // 'homeowner' or 'investor'
  const [propertyData, setPropertyData] = React.useState({});
  const [createdProperty, setCreatedProperty] = React.useState(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const queryClient = useQueryClient();

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
        address: mainAddress, // Ensure address field is set
        year_built: data.year_built ? parseInt(data.year_built) : undefined,
        square_footage: data.square_footage ? parseInt(data.square_footage) : undefined,
        bedrooms: data.bedrooms !== undefined && data.bedrooms !== "" ? parseInt(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? parseFloat(data.bathrooms) : undefined,
        purchase_price: data.purchase_price ? parseFloat(data.purchase_price) : undefined,
        current_value: data.current_value ? parseFloat(data.current_value) : undefined,
        rental_config: cleanRentalConfig,
        units: cleanUnits,
        setup_completed: true,
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
      return await base44.entities.Property.create(cleanData);
    },
    onSuccess: (property) => {
      console.log('Property created successfully:', property);
      setCreatedProperty(property);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setIsCreating(false);
      setCurrentStep(6); // Go to complete screen
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
  };

  const handlePropertyTypeSelect = (type) => {
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

  // Step -1: User Type Selection (Homeowner vs Investor)
  if (currentStep === -1) {
    return (
      <UserTypeSelector
        onSelect={handleUserTypeSelect}
        onCancel={onCancel}
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