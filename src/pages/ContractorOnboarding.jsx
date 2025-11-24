import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Building2, MapPin, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

const TRADE_OPTIONS = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Roofing',
  'General Handyman',
  'Painting',
  'Carpentry',
  'Flooring',
  'Drywall',
  'Landscaping'
];

export default function ContractorOnboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    trade_specialties: [],
    service_areas: []
  });
  const [zipInput, setZipInput] = useState('');

  const queryClient = useQueryClient();

  const completeOnboardingMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe({
      ...data,
      contractor_onboarding_completed: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      window.location.href = createPageUrl('ContractorDashboard');
    }
  });

  const handleToggleTrade = (trade) => {
    setFormData({
      ...formData,
      trade_specialties: formData.trade_specialties.includes(trade)
        ? formData.trade_specialties.filter(t => t !== trade)
        : [...formData.trade_specialties, trade]
    });
  };

  const handleAddZip = () => {
    if (zipInput.length === 5 && !formData.service_areas.includes(zipInput)) {
      setFormData({
        ...formData,
        service_areas: [...formData.service_areas, zipInput]
      });
      setZipInput('');
    }
  };

  const handleComplete = () => {
    if (!formData.company_name || !formData.contact_name || 
        formData.trade_specialties.length === 0 || formData.service_areas.length === 0) {
      toast.error('Please complete all required fields');
      return;
    }
    completeOnboardingMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(num => (
            <div key={num} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                num < step ? 'bg-green-500 text-white' :
                num === step ? 'bg-blue-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {num < step ? <CheckCircle className="w-6 h-6" /> : num}
              </div>
              {num < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  num < step ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Company Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to 360° Asset Command Center
              </h1>
              <p className="text-gray-600">
                Let's set up your contractor profile
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Company Name *
              </label>
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Your Company LLC"
                className="text-lg h-14"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Your Name *
              </label>
              <Input
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                placeholder="John Smith"
                className="text-lg h-14"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Phone Number *
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="text-lg h-14"
              />
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!formData.company_name || !formData.contact_name || !formData.phone}
              className="w-full h-14 text-lg"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Trade Specialties */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Wrench className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                What are your specialties?
              </h2>
              <p className="text-gray-600">
                Select all trades you can handle
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {TRADE_OPTIONS.map(trade => (
                <button
                  key={trade}
                  onClick={() => handleToggleTrade(trade)}
                  className={`p-4 rounded-xl border-2 transition-all font-medium ${
                    formData.trade_specialties.includes(trade)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {trade}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={formData.trade_specialties.length === 0}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Service Areas */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Where do you work?
              </h2>
              <p className="text-gray-600">
                Add zip codes for your service area
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 min-h-[60px]">
              {formData.service_areas.map(zip => (
                <Badge key={zip} className="bg-blue-100 text-blue-700 text-base px-4 py-2">
                  {zip}
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      service_areas: formData.service_areas.filter(z => z !== zip)
                    })}
                    className="ml-2 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Enter zip code"
                value={zipInput}
                onChange={(e) => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                className="text-lg h-14"
              />
              <Button onClick={handleAddZip} className="h-14 px-8">
                Add
              </Button>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={formData.service_areas.length === 0 || completeOnboardingMutation.isPending}
                className="flex-1"
              >
                {completeOnboardingMutation.isPending ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}