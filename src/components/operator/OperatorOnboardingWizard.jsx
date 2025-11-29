import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Operator } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  MapPin,
  Palette,
  Link2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Phone,
  Mail,
  Globe,
  Sparkles,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { id: 'business', title: 'Business Info', icon: Building2, description: 'Basic company details' },
  { id: 'location', title: 'Service Area', icon: MapPin, description: 'Where you operate' },
  { id: 'branding', title: 'Branding', icon: Palette, description: 'Logo and colors' },
  { id: 'leadform', title: 'Lead Form', icon: Link2, description: 'Your intake form URL' },
];

export default function OperatorOnboardingWizard({ onComplete }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    business_name: '',
    business_email: user?.email || '',
    business_phone: '',
    website: '',
    description: '',
    // Location
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    service_areas: [],
    // Branding
    slug: '',
    logo_url: '',
    primary_color: '#3B82F6'
  });

  const [newZipCode, setNewZipCode] = useState('');

  // Create operator mutation
  const createOperatorMutation = useMutation({
    mutationFn: async (data) => {
      return Operator.create({
        ...data,
        user_id: user?.id,
        created_by: user?.email,
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myOperator']);
      toast.success('Business profile created!');
      if (onComplete) onComplete();
    },
    onError: (error) => {
      toast.error('Failed to create profile: ' + error.message);
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSlug = () => {
    if (!formData.business_name) return;
    const slug = formData.business_name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    handleChange('slug', slug);
  };

  const addZipCode = () => {
    if (newZipCode.length !== 5) {
      toast.error('Enter a valid 5-digit zip code');
      return;
    }
    if (formData.service_areas.includes(newZipCode)) {
      toast.error('Zip code already added');
      return;
    }
    handleChange('service_areas', [...formData.service_areas, newZipCode]);
    setNewZipCode('');
  };

  const removeZipCode = (zip) => {
    handleChange('service_areas', formData.service_areas.filter(z => z !== zip));
  };

  const canProceed = () => {
    switch (STEPS[currentStep].id) {
      case 'business':
        return formData.business_name && formData.business_email;
      case 'location':
        return formData.city && formData.state;
      case 'branding':
        return formData.slug;
      case 'leadform':
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - create the operator
      createOperatorMutation.mutate(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const baseUrl = window.location.origin;
  const intakeUrl = `${baseUrl}/intake/${formData.slug}`;

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'business':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <Input
                value={formData.business_name}
                onChange={(e) => handleChange('business_name', e.target.value)}
                placeholder="ABC Property Services LLC"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.business_email}
                  onChange={(e) => handleChange('business_email', e.target.value)}
                  placeholder="contact@yourcompany.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone
                </label>
                <Input
                  type="tel"
                  value={formData.business_phone}
                  onChange={(e) => handleChange('business_phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Globe className="w-4 h-4 inline mr-1" />
                Website (optional)
              </label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://yourcompany.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About Your Business
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Tell potential clients about your services and experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
              />
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <Input
                value={formData.street_address}
                onChange={(e) => handleChange('street_address', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Long Beach"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <Input
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                  placeholder="CA"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <Input
                value={formData.zip_code}
                onChange={(e) => handleChange('zip_code', e.target.value)}
                placeholder="90804"
                maxLength={10}
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Areas (ZIP Codes)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.service_areas.map(zip => (
                  <Badge key={zip} className="gap-1 pr-1">
                    {zip}
                    <button onClick={() => removeZipCode(zip)} className="ml-1 hover:bg-gray-200 rounded p-0.5">
                      ×
                    </button>
                  </Badge>
                ))}
                {formData.service_areas.length === 0 && (
                  <span className="text-sm text-gray-500">No service areas added yet</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newZipCode}
                  onChange={(e) => setNewZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="Enter ZIP"
                  maxLength={5}
                  onKeyPress={(e) => e.key === 'Enter' && addZipCode()}
                />
                <Button onClick={addZipCode} variant="outline">Add</Button>
              </div>
            </div>
          </div>
        );

      case 'branding':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom URL Slug *
              </label>
              <div className="flex gap-2">
                <div className="flex items-center flex-1">
                  <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-500">
                    /intake/
                  </span>
                  <Input
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="your-company"
                    className="rounded-l-none"
                  />
                </div>
                <Button variant="outline" onClick={generateSlug}>Generate</Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This creates your unique lead intake form URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL (optional)
              </label>
              <Input
                value={formData.logo_url}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-0"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  className="w-32"
                />
                <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: formData.primary_color }} />
              </div>
            </div>
          </div>
        );

      case 'leadform':
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your Lead Form is Ready!</h3>
              <p className="text-gray-600">
                Share this URL with potential clients or embed it on your website.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Lead Intake URL
              </label>
              <div className="flex gap-2">
                <Input value={intakeUrl} readOnly className="bg-white" />
                <Button variant="outline" onClick={() => copyToClipboard(intakeUrl)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={() => window.open(intakeUrl, '_blank')}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-1">Share via Link</h4>
                <p className="text-blue-700">Send this URL to leads via email, text, or social media</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-1">Embed on Website</h4>
                <p className="text-purple-700">Go to Settings &gt; Lead Capture for embed code</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      {/* Progress Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isComplete ? 'bg-green-500' : isCurrent ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    {isComplete ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <Icon className={`w-5 h-5 ${isCurrent ? 'text-white' : 'text-gray-500'}`} />
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${isCurrent ? 'font-semibold text-blue-600' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {STEPS[currentStep].title}
        </h2>
        <p className="text-gray-600 text-sm">
          {STEPS[currentStep].description}
        </p>
      </div>

      {/* Step Content */}
      <div className="p-6">
        {renderStep()}
      </div>

      {/* Actions */}
      <div className="p-6 border-t bg-gray-50 flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed() || createOperatorMutation.isPending}
          className="gap-2"
        >
          {createOperatorMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : currentStep === STEPS.length - 1 ? (
            <>
              Complete Setup
              <CheckCircle className="w-4 h-4" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
