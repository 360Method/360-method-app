import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/AuthContext';
import {
  Building,
  ArrowRight,
  ArrowLeft,
  Check,
  MapPin,
  Phone,
  Mail,
  User,
  Briefcase,
  Globe,
  CreditCard,
  Shield,
  Loader2
} from 'lucide-react';

export default function OperatorApplication() {
  const navigate = useNavigate();
  const { user, isAuthenticated, clerkUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: '',

    // Step 2: Business Info
    company_name: '',
    business_type: '',
    years_in_business: '',
    employees_count: '',
    website: '',
    description: '',

    // Step 3: Service Area
    service_areas: [],
    service_radius: '25',
    service_types: [],

    // Step 4: Agreements
    agree_terms: false,
    agree_background_check: false,
    agree_certification: false,

    // Payment preference
    payment_plan: 'monthly'
  });

  const totalSteps = 4;

  const serviceTypes = [
    'General Maintenance',
    'HVAC Services',
    'Plumbing',
    'Electrical',
    'Roofing',
    'Landscaping',
    'Cleaning Services',
    'Pest Control',
    'Pool Services',
    'Handyman Services'
  ];

  const businessTypes = [
    { value: 'sole_proprietor', label: 'Sole Proprietor' },
    { value: 'llc', label: 'LLC' },
    { value: 'corporation', label: 'Corporation' },
    { value: 'partnership', label: 'Partnership' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceTypeToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      service_types: prev.service_types.includes(service)
        ? prev.service_types.filter(s => s !== service)
        : [...prev.service_types, service]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Here we would:
      // 1. Create operator record in Supabase
      // 2. Update Clerk metadata to add operator role
      // 3. Redirect to payment

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update user metadata to add operator role (in real implementation)
      // await clerkUser?.update({
      //   publicMetadata: {
      //     ...clerkUser.publicMetadata,
      //     roles: [...(clerkUser.publicMetadata.roles || ['owner']), 'operator'],
      //     operator_profile: {
      //       company_name: formData.company_name,
      //       certified: false,
      //       training_completed: false,
      //       application_submitted: true,
      //       application_date: new Date().toISOString()
      //     }
      //   }
      // });

      // For now, redirect to pending page
      navigate('/OperatorPending');

    } catch (error) {
      console.error('Application submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.first_name && formData.last_name && formData.email && formData.phone;
      case 2:
        return formData.company_name && formData.business_type && formData.years_in_business;
      case 3:
        return formData.service_types.length > 0;
      case 4:
        return formData.agree_terms && formData.agree_background_check && formData.agree_certification;
      default:
        return false;
    }
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/Login?redirect_url=/OperatorApplication');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/BecomeOperator" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-gray-900">Operator Application</span>
          </div>
          <div className="text-sm text-gray-500">
            Step {step} of {totalSteps}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s < step ? 'bg-green-500 text-white' :
                  s === step ? 'bg-orange-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-16 md:w-24 h-1 mx-2 ${
                    s < step ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Personal</span>
            <span>Business</span>
            <span>Services</span>
            <span>Confirm</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card className="p-6 md:p-8">
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
                <p className="text-gray-600">Let's start with your basic contact details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          )}

          {/* Step 2: Business Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Information</h2>
                <p className="text-gray-600">Tell us about your property service business</p>
              </div>

              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="ABC Property Services"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_type">Business Type *</Label>
                  <select
                    id="business_type"
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
                  >
                    <option value="">Select type...</option>
                    {businessTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="years_in_business">Years in Business *</Label>
                  <select
                    id="years_in_business"
                    name="years_in_business"
                    value={formData.years_in_business}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
                  >
                    <option value="">Select...</option>
                    <option value="0-1">Less than 1 year</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="employees_count">Number of Employees/Contractors</Label>
                <select
                  id="employees_count"
                  name="employees_count"
                  value={formData.employees_count}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
                >
                  <option value="">Select...</option>
                  <option value="1">Just me</option>
                  <option value="2-5">2-5</option>
                  <option value="6-10">6-10</option>
                  <option value="11-25">11-25</option>
                  <option value="25+">25+</option>
                </select>
              </div>

              <div>
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div>
                <Label htmlFor="description">Brief Description of Services</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell us about the services you offer..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Service Area & Types */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Services & Coverage</h2>
                <p className="text-gray-600">Select the services you offer and your coverage area</p>
              </div>

              <div>
                <Label className="mb-3 block">Service Types * (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {serviceTypes.map(service => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => handleServiceTypeToggle(service)}
                      className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                        formData.service_types.includes(service)
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          formData.service_types.includes(service)
                            ? 'bg-orange-500 border-orange-500'
                            : 'border-gray-300'
                        }`}>
                          {formData.service_types.includes(service) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        {service}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="service_radius">Service Radius (miles)</Label>
                <select
                  id="service_radius"
                  name="service_radius"
                  value={formData.service_radius}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
                >
                  <option value="10">10 miles</option>
                  <option value="25">25 miles</option>
                  <option value="50">50 miles</option>
                  <option value="100">100 miles</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  You can adjust this later in your operator settings
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Confirm</h2>
                <p className="text-gray-600">Almost there! Review your information and agree to our terms</p>
              </div>

              {/* Summary */}
              <Card className="p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-3">Application Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{formData.first_name} {formData.last_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-medium">{formData.company_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Services:</span>
                    <span className="font-medium">{formData.service_types.length} selected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Radius:</span>
                    <span className="font-medium">{formData.service_radius} miles</span>
                  </div>
                </div>
              </Card>

              {/* Payment Plan Selection */}
              <div>
                <Label className="mb-3 block">Select Your Plan</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, payment_plan: 'monthly' }))}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      formData.payment_plan === 'monthly'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Monthly</div>
                    <div className="text-2xl font-bold text-orange-600">$29/mo</div>
                    <div className="text-xs text-gray-500">Cancel anytime</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, payment_plan: 'lifetime' }))}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      formData.payment_plan === 'lifetime'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">One-Time</div>
                    <div className="text-2xl font-bold text-orange-600">$299</div>
                    <div className="text-xs text-gray-500">Lifetime access</div>
                  </button>
                </div>
              </div>

              {/* Agreements */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agree_terms"
                    checked={formData.agree_terms}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, agree_terms: checked }))
                    }
                  />
                  <Label htmlFor="agree_terms" className="text-sm leading-relaxed cursor-pointer">
                    I agree to the <Link to="#" className="text-orange-600 hover:underline">Terms of Service</Link> and <Link to="#" className="text-orange-600 hover:underline">Privacy Policy</Link> *
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agree_background_check"
                    checked={formData.agree_background_check}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, agree_background_check: checked }))
                    }
                  />
                  <Label htmlFor="agree_background_check" className="text-sm leading-relaxed cursor-pointer">
                    I consent to a background check and verification of my business credentials *
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agree_certification"
                    checked={formData.agree_certification}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, agree_certification: checked }))
                    }
                  />
                  <Label htmlFor="agree_certification" className="text-sm leading-relaxed cursor-pointer">
                    I commit to completing the 360° Method certification training within 30 days *
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
