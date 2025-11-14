import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, MapPin, Home, Save, Lightbulb } from "lucide-react";
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
    property_use_type: 'primary',
    door_count: 1,
    climate_zone: 'Zone 4: Temperate/Coastal (Pacific NW)'
  });

  const [isSaving, setIsSaving] = useState(false);

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
                    onAddressSelect={(addressData) => {
                      // AddressAutocomplete returns a single addressData object
                      setFormData({
                        ...formData,
                        address: addressData.formatted_address || '',
                        street_address: addressData.street_address || '',
                        city: addressData.city || '',
                        state: addressData.state || '',
                        zip_code: addressData.zip_code || '',
                        county: addressData.county || '',
                        formatted_address: addressData.formatted_address || '',
                        place_id: addressData.place_id || '',
                        coordinates: addressData.coordinates || null,
                        address_verified: addressData.address_verified || true,
                        verification_source: addressData.verification_source || 'google_maps'
                      });
                    }}
                  />
                </div>

                {formData.address && formData.coordinates && (
                  <AddressVerificationMap
                    address={formData.address}
                    coordinates={formData.coordinates}
                    onConfirm={() => {
                      setFormData({ ...formData, address_verified: true });
                    }}
                  />
                )}

                {/* Why We Ask */}
                <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-600">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-900">Why We Ask This</p>
                      <p className="text-xs text-blue-800">
                        Your location determines climate-specific maintenance needs. Pacific NW homes need different care than Arizona homes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PROPERTY BASICS */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Property Type
                  </label>
                  <Select value={formData.property_type} onValueChange={(value) => setFormData({ ...formData, property_type: value })}>
                    <SelectTrigger style={{ minHeight: '48px' }}>
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
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Year Built (approximate is fine)
                  </label>
                  <Select 
                    value={formData.year_built?.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, year_built: parseInt(value) })}
                  >
                    <SelectTrigger style={{ minHeight: '48px' }}>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: CURRENT_YEAR - 1900 + 1 }, (_, i) => CURRENT_YEAR - i).map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Why We Ask */}
                <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-600">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-900">Why We Ask This</p>
                      <p className="text-xs text-blue-800">
                        Year built helps us estimate system ages and predict when major replacements are needed. Property type determines which systems to track.
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
                      onClick={() => setFormData({ ...formData, property_use_type: 'primary', door_count: 1 })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.property_use_type === 'primary'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                      style={{ minHeight: '100px' }}
                    >
                      <Home className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <p className="font-semibold text-gray-900">My Home</p>
                      <p className="text-xs text-gray-600 mt-1">Primary residence</p>
                    </button>

                    {/* Rental - Investment Property (FIXED: only matches rental, not primary_with_rental) */}
                    <button
                      onClick={() => setFormData({ ...formData, property_use_type: 'rental_unfurnished', door_count: formData.property_type?.includes('Duplex') ? 2 : formData.property_type?.includes('Triplex') ? 3 : formData.property_type?.includes('Fourplex') ? 4 : 1 })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.property_use_type === 'rental_unfurnished' || formData.property_use_type === 'rental_furnished' || formData.property_use_type === 'vacation_rental'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                      style={{ minHeight: '100px' }}
                    >
                      <Home className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="font-semibold text-gray-900">Rental</p>
                      <p className="text-xs text-gray-600 mt-1">Investment property</p>
                    </button>

                    {/* Both - Live + Rent Part */}
                    <button
                      onClick={() => setFormData({ ...formData, property_use_type: 'primary_with_rental', door_count: 2 })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.property_use_type === 'primary_with_rental'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                      style={{ minHeight: '100px' }}
                    >
                      <Home className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <p className="font-semibold text-gray-900">Both</p>
                      <p className="text-xs text-gray-600 mt-1">Live + rent part</p>
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
                      value={formData.door_count || 1}
                      onChange={(e) => setFormData({ ...formData, door_count: parseInt(e.target.value) || 1 })}
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