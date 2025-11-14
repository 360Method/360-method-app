import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, MapPin, Home, Save, Lightbulb, Loader2, CheckCircle, Sparkles } from "lucide-react";
import AddressAutocomplete from "./AddressAutocomplete";
import AddressVerificationMap from "./AddressVerificationMap";

const CURRENT_YEAR = new Date().getFullYear();

export default function PropertyWizardSimplified({ onComplete, onCancel, existingProperty }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(existingProperty || {
    address: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    formatted_address: '',
    place_id: '',
    coordinates: null,
    address_verified: false,
    property_type: '',
    year_built: null,
    bedrooms: null,
    bathrooms: null,
    square_footage: null,
    property_use_type: 'primary',
    door_count: 1,
    climate_zone: 'Zone 4: Temperate/Coastal (Pacific NW)'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isLoadingPropertyData, setIsLoadingPropertyData] = useState(false);
  const [autoFillMessage, setAutoFillMessage] = useState('');

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingProperty?.id) {
        return await base44.entities.Property.update(existingProperty.id, data);
      } else {
        return await base44.entities.Property.create({
          ...data,
          setup_completed: true,
          baseline_completion: 0,
          health_score: 0
        });
      }
    },
    onSuccess: (savedProperty) => {
      onComplete(savedProperty);
    }
  });

  const handleAddressSelect = async (addressData) => {
    console.log('Address selected:', addressData);
    
    setFormData(prev => ({
      ...prev,
      address: addressData.formatted_address || '',
      street_address: addressData.street_address || '',
      city: addressData.city || '',
      state: addressData.state || '',
      zip_code: addressData.zip_code || '',
      county: addressData.county || '',
      formatted_address: addressData.formatted_address || '',
      place_id: addressData.place_id || '',
      coordinates: addressData.coordinates || null,
      address_verified: false, // Reset until user confirms
      verification_source: addressData.verification_source || 'google_maps'
    }));
    
    setShowMap(true);
    setAutoFillMessage('');
    
    // Fetch property data from public records
    await fetchPropertyDataViaWebSearch(addressData);
  };

  const fetchPropertyDataViaWebSearch = async (address) => {
    setIsLoadingPropertyData(true);
    
    try {
      console.log('Searching for property data:', address.formatted_address);
      
      // Search public listing sites
      const searchQuery = `${address.formatted_address} property details year built bedrooms bathrooms square feet`;
      
      const searchResults = await base44.integrations.Core.InvokeLLM({
        prompt: `Find property details for this address: ${address.formatted_address}

Please search for publicly available information about this property including:
- Year built
- Number of bedrooms
- Number of bathrooms  
- Square footage
- Property type

Return the information in this JSON format:
{
  "year_built": number or null,
  "bedrooms": number or null,
  "bathrooms": number or null,
  "square_footage": number or null,
  "property_type": string or null,
  "confidence": "high" | "medium" | "low" | "none",
  "source": "description of source"
}

If you cannot find specific information, return null for those fields and set confidence to "none".`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            year_built: { type: ["number", "null"] },
            bedrooms: { type: ["number", "null"] },
            bathrooms: { type: ["number", "null"] },
            square_footage: { type: ["number", "null"] },
            property_type: { type: ["string", "null"] },
            confidence: { type: "string" },
            source: { type: "string" }
          }
        }
      });
      
      console.log('Property data received:', searchResults);
      
      // Auto-fill form data if property details found
      if (searchResults && (searchResults.year_built || searchResults.bedrooms || searchResults.square_footage)) {
        const fieldsFound = [];
        const updates = {};
        
        if (searchResults.year_built) {
          updates.year_built = searchResults.year_built;
          fieldsFound.push('year built');
        }
        if (searchResults.bedrooms) {
          updates.bedrooms = searchResults.bedrooms;
          fieldsFound.push('bedrooms');
        }
        if (searchResults.bathrooms) {
          updates.bathrooms = searchResults.bathrooms;
          fieldsFound.push('bathrooms');
        }
        if (searchResults.square_footage) {
          updates.square_footage = searchResults.square_footage;
          fieldsFound.push('square footage');
        }
        if (searchResults.property_type) {
          updates.property_type = searchResults.property_type;
          fieldsFound.push('property type');
        }
        
        setFormData(prev => ({ ...prev, ...updates }));
        
        // Show success message
        if (fieldsFound.length > 0) {
          setAutoFillMessage(`✓ Found ${fieldsFound.join(', ')} from public records (${searchResults.confidence} confidence)`);
        }
      }
      
    } catch (error) {
      console.error('Error fetching property data:', error);
    } finally {
      setIsLoadingPropertyData(false);
    }
  };

  const handleConfirmAddress = () => {
    setFormData(prev => ({
      ...prev,
      address_verified: true
    }));
  };

  const handleReenterAddress = () => {
    setShowMap(false);
    setAutoFillMessage('');
    setFormData(prev => ({
      ...prev,
      address_verified: false,
      coordinates: null
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      saveMutation.mutate(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      if (existingProperty?.id) {
        await base44.entities.Property.update(existingProperty.id, {
          ...formData,
          is_draft: true,
          draft_step: currentStep
        });
      } else {
        await base44.entities.Property.create({
          ...formData,
          is_draft: true,
          draft_step: currentStep,
          setup_completed: false
        });
      }
      onCancel();
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return formData.address_verified && formData.address;
    if (currentStep === 2) return formData.property_type && formData.year_built;
    if (currentStep === 3) return formData.property_use_type;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Step {currentStep} of 3</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              Save & Finish Later
            </Button>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full ${
                  step <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <Card className="border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <MapPin className="w-6 h-6 text-blue-600" />}
              {currentStep === 2 && <Home className="w-6 h-6 text-blue-600" />}
              {currentStep === 3 && <Badge className="bg-blue-600 text-white">Final Step</Badge>}
              
              {currentStep === 1 && "Where's Your Property?"}
              {currentStep === 2 && "Tell Us About This Property"}
              {currentStep === 3 && "How Do You Use This Property?"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* STEP 1: ADDRESS */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Property Address
                  </label>
                  <AddressAutocomplete
                    initialValue={formData.address}
                    onAddressSelect={handleAddressSelect}
                  />
                </div>

                {/* Loading state while fetching property data */}
                {isLoadingPropertyData && (
                  <Card className="border-2 border-blue-300 bg-blue-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <p className="text-sm text-gray-700">Searching public records for property details...</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Auto-fill success message */}
                {autoFillMessage && (
                  <Card className="border-2 border-green-300 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-900 mb-1">
                            {autoFillMessage}
                          </p>
                          <p className="text-xs text-gray-700">
                            You can verify and edit these details in the next step
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Map - STAYS VISIBLE until confirmed */}
                {showMap && formData.coordinates && (
                  <div className="space-y-4">
                    <AddressVerificationMap
                      address={formData.formatted_address}
                      coordinates={formData.coordinates}
                    />

                    {/* Confirmation UI - REQUIRED to proceed */}
                    {!formData.address_verified ? (
                      <Card className="border-2 border-blue-300 bg-blue-50">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">
                                Is this the correct location?
                              </p>
                              <p className="text-sm text-gray-700">
                                {formData.formatted_address}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={handleConfirmAddress}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                style={{ minHeight: '48px' }}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Yes, this is correct
                              </Button>
                              <Button
                                onClick={handleReenterAddress}
                                variant="outline"
                                style={{ minHeight: '48px' }}
                              >
                                ← No, let me re-enter
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="border-2 border-green-300 bg-green-50">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <p className="text-sm font-semibold text-green-900">
                              Address verified!
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Why We Ask */}
                <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-600">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-900">Why We Ask This</p>
                      <p className="text-xs text-blue-800">
                        Your location determines climate-specific maintenance needs. We'll also search public records to help fill in property details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PROPERTY BASICS */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {/* Show banner if any data was auto-filled */}
                {(formData.year_built || formData.bedrooms || formData.bathrooms || formData.square_footage) && autoFillMessage && (
                  <Card className="border-2 border-blue-300 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-blue-900 mb-1">
                            Property details pre-filled from public records
                          </p>
                          <p className="text-xs text-gray-700">
                            We found some information about your property. Please verify these details are correct and update any that aren't.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    Property Type
                    {formData.property_type && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Auto-filled
                      </Badge>
                    )}
                  </label>
                  <Select value={formData.property_type} onValueChange={(value) => setFormData({ ...formData, property_type: value })}>
                    <SelectTrigger style={{ minHeight: '48px' }} className={formData.property_type ? 'border-green-300 bg-green-50/30' : ''}>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single-Family Home">Single-Family Home</SelectItem>
                      <SelectItem value="Duplex">Duplex</SelectItem>
                      <SelectItem value="Triplex">Triplex</SelectItem>
                      <SelectItem value="Fourplex">Fourplex</SelectItem>
                      <SelectItem value="Small Multi-Family (5-12 units)">Small Multi-Family (5-12 units)</SelectItem>
                      <SelectItem value="Condo/Townhouse">Condo/Townhouse</SelectItem>
                      <SelectItem value="Mobile/Manufactured Home">Mobile/Manufactured Home</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    Year Built (approximate is fine)
                    {formData.year_built && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Auto-filled
                      </Badge>
                    )}
                  </label>
                  <Select 
                    value={formData.year_built?.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, year_built: parseInt(value) })}
                  >
                    <SelectTrigger style={{ minHeight: '48px' }} className={formData.year_built ? 'border-green-300 bg-green-50/30' : ''}>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: CURRENT_YEAR - 1900 + 1 }, (_, i) => CURRENT_YEAR - i).map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.year_built && (
                    <p className="text-xs text-gray-500 mt-1">
                      Property is approximately {CURRENT_YEAR - formData.year_built} years old
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    Bedrooms (optional)
                    {formData.bedrooms && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Auto-filled
                      </Badge>
                    )}
                  </label>
                  <Input
                    type="number"
                    value={formData.bedrooms || ''}
                    onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || null })}
                    placeholder="e.g., 3"
                    min="0"
                    max="20"
                    style={{ minHeight: '48px' }}
                    className={formData.bedrooms ? 'border-green-300 bg-green-50/30' : ''}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    Bathrooms (optional)
                    {formData.bathrooms && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Auto-filled
                      </Badge>
                    )}
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.bathrooms || ''}
                    onChange={(e) => setFormData({ ...formData, bathrooms: parseFloat(e.target.value) || null })}
                    placeholder="e.g., 2.5"
                    min="0"
                    max="20"
                    style={{ minHeight: '48px' }}
                    className={formData.bathrooms ? 'border-green-300 bg-green-50/30' : ''}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use .5 for half baths (e.g., 2.5 = 2 full + 1 half bath)
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    Square Footage (optional)
                    {formData.square_footage && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Auto-filled
                      </Badge>
                    )}
                  </label>
                  <Input
                    type="number"
                    value={formData.square_footage || ''}
                    onChange={(e) => setFormData({ ...formData, square_footage: parseInt(e.target.value) || null })}
                    placeholder="e.g., 2000"
                    min="0"
                    style={{ minHeight: '48px' }}
                    className={formData.square_footage ? 'border-green-300 bg-green-50/30' : ''}
                  />
                </div>

                {/* Why We Ask */}
                <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-600">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-900">Why We Ask This</p>
                      <p className="text-xs text-blue-800">
                        Property age and size help us provide accurate maintenance schedules. Older properties need more frequent inspections, and larger homes have more systems to track.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PROPERTY USE */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    I use this property as:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* My Home - Primary Residence */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, property_use_type: 'primary', door_count: 1 })}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        formData.property_use_type === 'primary'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                      style={{ minHeight: '120px' }}
                    >
                      <Home className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <p className="font-semibold text-base text-gray-900 mb-1">My Home</p>
                      <p className="text-xs text-gray-600">Primary residence</p>
                    </button>

                    {/* Rental - Investment Property */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, property_use_type: 'rental_unfurnished', door_count: formData.property_type?.includes('Duplex') ? 2 : formData.property_type?.includes('Triplex') ? 3 : formData.property_type?.includes('Fourplex') ? 4 : 1 })}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        formData.property_use_type === 'rental_unfurnished' || formData.property_use_type === 'rental_furnished' || formData.property_use_type === 'vacation_rental'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                      style={{ minHeight: '120px' }}
                    >
                      <Home className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="font-semibold text-base text-gray-900 mb-1">Rental</p>
                      <p className="text-xs text-gray-600">Investment property</p>
                    </button>

                    {/* Both - Live + Rent Part */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, property_use_type: 'primary_with_rental', door_count: 2 })}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        formData.property_use_type === 'primary_with_rental'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                      style={{ minHeight: '120px' }}
                    >
                      <Home className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <p className="font-semibold text-base text-gray-900 mb-1">Both</p>
                      <p className="text-xs text-gray-600">Live + rent part</p>
                    </button>
                  </div>
                </div>

                {/* Conditional: If rental or both */}
                {(formData.property_use_type === 'rental_unfurnished' || 
                  formData.property_use_type === 'rental_furnished' || 
                  formData.property_use_type === 'vacation_rental' || 
                  formData.property_use_type === 'primary_with_rental') && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Number of Rental Units (Doors)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.door_count === '' ? '' : formData.door_count}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ 
                          ...formData, 
                          door_count: val === '' ? '' : parseInt(val) || 1 
                        });
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '' || parseInt(e.target.value) < 1) {
                          setFormData({ ...formData, door_count: 1 });
                        }
                      }}
                      style={{ minHeight: '48px' }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This determines your pricing tier and task generation
                    </p>
                  </div>
                )}

                {/* Why We Ask */}
                <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-600">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-900">Why We Ask This</p>
                      <p className="text-xs text-blue-800">
                        Rental properties need different maintenance strategies (tenant turnover, wear patterns) and pricing than primary residences.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary Preview */}
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <p className="text-sm font-semibold text-green-900 mb-2">✓ Property Summary:</p>
                  <div className="space-y-1 text-sm text-green-800">
                    <p>📍 {formData.address}</p>
                    <p>🏠 {formData.property_type} • Built {formData.year_built}</p>
                    <p>🎯 {formData.property_use_type === 'primary' ? 'Primary Residence' : formData.property_use_type === 'primary_with_rental' ? 'Primary + Rental' : 'Rental Property'}</p>
                    {formData.door_count > 1 && <p>🚪 {formData.door_count} doors</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  style={{ minHeight: '48px' }}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={!canProceed() || saveMutation.isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                style={{ minHeight: '48px' }}
              >
                {currentStep === 3 ? (
                  saveMutation.isLoading ? 'Saving...' : 'Complete Setup'
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Cancel */}
            <Button
              variant="ghost"
              onClick={onCancel}
              className="w-full"
            >
              Cancel
            </Button>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}