import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  User,
  Home,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Package,
  FileText,
  Building2,
  Clock
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import OperatorLayout from '@/components/operator/OperatorLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, label: 'Owner Info', icon: User },
  { id: 2, label: 'Property Details', icon: Home },
  { id: 3, label: 'Service Package', icon: Package },
  { id: 4, label: 'Confirm', icon: CheckCircle },
];

const SERVICE_PACKAGES = [
  {
    id: 'basic',
    name: 'Basic Care',
    price: 50,
    interval: 'month',
    features: [
      'Annual inspection',
      'Basic maintenance tracking',
      'Emergency support hotline',
    ]
  },
  {
    id: 'essential',
    name: 'Essential PropertyCare',
    price: 100,
    interval: 'month',
    features: [
      'Bi-annual inspections',
      'Preventive maintenance alerts',
      'Priority scheduling',
      'Digital reports & documentation',
    ]
  },
  {
    id: 'premium',
    name: 'Premium HomeCare',
    price: 200,
    interval: 'month',
    features: [
      'Quarterly inspections',
      'Full 360° Method implementation',
      'Dedicated account manager',
      'Contractor coordination',
      '24/7 emergency support',
      'Annual system health report',
    ],
    recommended: true
  },
  {
    id: 'enterprise',
    name: 'Portfolio Care',
    price: 'Custom',
    interval: 'month',
    features: [
      'Multi-property discount',
      'Customized inspection schedule',
      'Volume pricing on repairs',
      'Dedicated team assignment',
      'Monthly portfolio reports',
    ]
  }
];

export default function OperatorAddClient() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Owner info
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    // Property details
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    property_type: '',
    year_built: '',
    square_footage: '',
    bedrooms: '',
    bathrooms: '',
    // Service
    package_id: '',
    start_date: '',
    notes: '',
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.owner_name && formData.owner_email && formData.owner_phone;
      case 2:
        return formData.street_address && formData.city && formData.state && formData.zip_code;
      case 3:
        return formData.package_id && formData.start_date;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    // In real app, would save to backend
    toast.success('Client added successfully!');
    navigate(createPageUrl('OperatorClients'));
  };

  const selectedPackage = SERVICE_PACKAGES.find(p => p.id === formData.package_id);

  return (
    <OperatorLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Add New Client</h1>
          <p className="text-gray-600">Onboard a new property owner to your 360° Method services</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isComplete ? 'bg-green-500 text-white' :
                      isActive ? 'bg-blue-600 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {isComplete ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs mt-2 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <Card className="p-6">
          {/* Step 1: Owner Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Property Owner Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <Input
                    value={formData.owner_name}
                    onChange={(e) => updateFormData('owner_name', e.target.value)}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={formData.owner_email}
                    onChange={(e) => updateFormData('owner_email', e.target.value)}
                    placeholder="john@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    value={formData.owner_phone}
                    onChange={(e) => updateFormData('owner_phone', e.target.value)}
                    placeholder="(503) 555-0123"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Property Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" />
                Property Details
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <Input
                    value={formData.street_address}
                    onChange={(e) => updateFormData('street_address', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <Input
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    placeholder="Portland"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <Input
                      value={formData.state}
                      onChange={(e) => updateFormData('state', e.target.value)}
                      placeholder="OR"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP *
                    </label>
                    <Input
                      value={formData.zip_code}
                      onChange={(e) => updateFormData('zip_code', e.target.value)}
                      placeholder="97201"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type
                  </label>
                  <Select value={formData.property_type} onValueChange={(v) => updateFormData('property_type', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_family">Single Family</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="multi_family">Multi-Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year Built
                  </label>
                  <Input
                    type="number"
                    value={formData.year_built}
                    onChange={(e) => updateFormData('year_built', e.target.value)}
                    placeholder="2005"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Square Footage
                  </label>
                  <Input
                    type="number"
                    value={formData.square_footage}
                    onChange={(e) => updateFormData('square_footage', e.target.value)}
                    placeholder="2000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrooms
                    </label>
                    <Input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => updateFormData('bedrooms', e.target.value)}
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bathrooms
                    </label>
                    <Input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => updateFormData('bathrooms', e.target.value)}
                      placeholder="2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Service Package */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Select Service Package
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {SERVICE_PACKAGES.map(pkg => (
                  <button
                    key={pkg.id}
                    onClick={() => updateFormData('package_id', pkg.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.package_id === pkg.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {pkg.recommended && (
                      <Badge className="bg-blue-600 text-white mb-2">Recommended</Badge>
                    )}
                    <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      {typeof pkg.price === 'number' ? `$${pkg.price}` : pkg.price}
                      <span className="text-sm font-normal text-gray-500">/{pkg.interval}</span>
                    </div>
                    <ul className="mt-3 space-y-1">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Start Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => updateFormData('start_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  placeholder="Any special requirements or notes about this client..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Review & Confirm
              </h2>

              <div className="space-y-4">
                {/* Owner Summary */}
                <Card className="p-4 bg-gray-50">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Property Owner
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-gray-900">{formData.owner_name}</p>
                    <p className="text-gray-600">{formData.owner_email}</p>
                    <p className="text-gray-600">{formData.owner_phone}</p>
                  </div>
                </Card>

                {/* Property Summary */}
                <Card className="p-4 bg-gray-50">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Property
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-gray-900">{formData.street_address}</p>
                    <p className="text-gray-600">{formData.city}, {formData.state} {formData.zip_code}</p>
                    <div className="flex gap-4 mt-2 text-gray-600">
                      {formData.bedrooms && <span>{formData.bedrooms} bed</span>}
                      {formData.bathrooms && <span>{formData.bathrooms} bath</span>}
                      {formData.square_footage && <span>{formData.square_footage} sqft</span>}
                      {formData.year_built && <span>Built {formData.year_built}</span>}
                    </div>
                  </div>
                </Card>

                {/* Package Summary */}
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Service Package
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{selectedPackage?.name}</p>
                      <p className="text-sm text-gray-600">Starting {new Date(formData.start_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {typeof selectedPackage?.price === 'number' ? `$${selectedPackage.price}` : selectedPackage?.price}
                      </div>
                      <div className="text-sm text-gray-500">per month</div>
                    </div>
                  </div>
                </Card>

                {formData.notes && (
                  <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Notes
                    </h3>
                    <p className="text-sm text-gray-600">{formData.notes}</p>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            {currentStep < 4 ? (
              <Button onClick={nextStep} className="gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="gap-2 bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4" />
                Add Client
              </Button>
            )}
          </div>
        </Card>
      </div>
    </OperatorLayout>
  );
}
