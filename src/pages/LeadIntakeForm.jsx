import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Zap,
  Clock,
  Calendar,
  CheckCircle,
  Loader2,
  AlertCircle,
  Wrench,
  ListChecks,
  Heart,
  Star,
  Shield
} from 'lucide-react';

const LEAD_TYPES = [
  { id: 'job', label: 'One-Time Job', description: 'Repair, installation, or project', icon: Wrench },
  { id: 'list', label: 'Task List', description: 'Multiple items to address', icon: ListChecks },
  { id: 'service', label: 'Ongoing Service', description: 'Regular maintenance plan', icon: Heart },
];

const URGENCY_OPTIONS = [
  { id: 'emergency', label: 'Emergency', description: "Need help today", color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'soon', label: 'Soon', description: 'Within a week', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'flexible', label: 'Flexible', description: 'No rush', color: 'bg-green-100 text-green-700 border-green-200' },
];

export default function LeadIntakeForm() {
  const { operatorSlug } = useParams();

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    property_address: '',
    property_city: '',
    property_state: '',
    property_zip: '',
    lead_type: 'job',
    urgency: 'flexible',
    description: '',
    preferred_contact: 'phone',
    best_time: '',
  });

  // Fetch operator by slug
  const { data: operator, isLoading: operatorLoading, error: operatorError } = useQuery({
    queryKey: ['operator-public', operatorSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operators')
        .select('*, users(first_name, last_name, email)')
        .eq('slug', operatorSlug)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!operatorSlug,
    retry: false
  });

  // Submit lead mutation
  const submitLeadMutation = useMutation({
    mutationFn: async () => {
      const { data: lead, error } = await supabase
        .from('operator_leads')
        .insert({
          operator_id: operator.id,
          contact_name: formData.contact_name,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email,
          property_address: formData.property_address,
          property_city: formData.property_city,
          property_state: formData.property_state,
          property_zip: formData.property_zip,
          lead_type: formData.lead_type,
          urgency: formData.urgency,
          description: formData.description,
          source: 'website',
          stage: 'new',
          priority: formData.urgency === 'emergency' ? 'hot' : formData.urgency === 'soon' ? 'high' : 'medium',
          metadata: {
            preferred_contact: formData.preferred_contact,
            best_time: formData.best_time,
            submitted_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase
        .from('operator_lead_activities')
        .insert({
          lead_id: lead.id,
          operator_id: operator.id,
          activity_type: 'created',
          description: 'Lead submitted via website form'
        });

      return lead;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Request submitted!');
    },
    onError: (error) => {
      toast.error('Failed to submit: ' + error.message);
    }
  });

  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, contact_phone: formatted });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.contact_name.trim() || (!formData.contact_phone.trim() && !formData.contact_email.trim())) {
        toast.error('Please provide your name and at least one contact method');
        return;
      }
    }
    if (step === 2) {
      if (!formData.property_address.trim()) {
        toast.error('Please provide your property address');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = () => {
    if (!formData.description.trim()) {
      toast.error('Please describe what you need help with');
      return;
    }
    submitLeadMutation.mutate();
  };

  if (operatorLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (operatorError || !operator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Service Provider Not Found</h1>
          <p className="text-gray-600">
            The service provider you're looking for isn't available. Please check the link and try again.
          </p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Thank you, {formData.contact_name.split(' ')[0]}! {operator.business_name || 'The operator'} will contact you
            {formData.urgency === 'emergency' ? ' as soon as possible' : ' within 24 hours'}.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-sm text-gray-500 mb-2">What happens next:</p>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Your request has been received</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>
                  {operator.business_name || 'The operator'} will review your request
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <span>You'll be contacted via {formData.preferred_contact}</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">{operator.business_name || 'Service Provider'}</h1>
              <p className="text-sm text-gray-500">Request a Quote</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 rounded ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Contact</span>
            <span>Property</span>
            <span>Details</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Step 1: Contact Info */}
        {step === 1 && (
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Your Contact Information</h2>
            <p className="text-sm text-gray-500 mb-6">How can we reach you?</p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    placeholder="John Smith"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="(555) 123-4567"
                    value={formData.contact_phone}
                    onChange={handlePhoneChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm">Preferred Contact Method</Label>
                <div className="flex gap-2 mt-2">
                  {['phone', 'email', 'text'].map((method) => (
                    <Button
                      key={method}
                      type="button"
                      variant={formData.preferred_contact === method ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, preferred_contact: method })}
                      className="flex-1 capitalize"
                    >
                      {method}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={handleNext} className="w-full mt-6 h-12">
              Continue
            </Button>
          </Card>
        )}

        {/* Step 2: Property Info */}
        {step === 2 && (
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Property Address</h2>
            <p className="text-sm text-gray-500 mb-6">Where is the work needed?</p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address *</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={formData.property_address}
                    onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.property_city}
                    onChange={(e) => setFormData({ ...formData, property_city: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="CA"
                      maxLength={2}
                      value={formData.property_state}
                      onChange={(e) => setFormData({ ...formData, property_state: e.target.value.toUpperCase() })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP</Label>
                    <Input
                      id="zip"
                      placeholder="90210"
                      maxLength={5}
                      value={formData.property_zip}
                      onChange={(e) => setFormData({ ...formData, property_zip: e.target.value.replace(/\D/g, '') })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Continue
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Service Details */}
        {step === 3 && (
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">What do you need?</h2>
              <p className="text-sm text-gray-500 mb-4">Tell us about the work</p>

              {/* Lead Type Selection */}
              <div className="space-y-2 mb-6">
                {LEAD_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={type.id}
                      className={`p-4 cursor-pointer transition-all ${
                        formData.lead_type === type.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setFormData({ ...formData, lead_type: type.id })}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          formData.lead_type === type.id ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            formData.lead_type === type.id ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{type.label}</p>
                          <p className="text-sm text-gray-500">{type.description}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Urgency */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-2 block">How urgent is this?</Label>
                <div className="flex gap-2">
                  {URGENCY_OPTIONS.map((option) => (
                    <Button
                      key={option.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, urgency: option.id })}
                      className={`flex-1 ${
                        formData.urgency === option.id ? option.color : ''
                      }`}
                    >
                      {option.id === 'emergency' && <Zap className="w-3 h-3 mr-1" />}
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Describe what you need *</Label>
                <textarea
                  id="description"
                  placeholder="Please describe the work you need done, any issues you're experiencing, or questions you have..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={5}
                />
              </div>

              {/* Best Time */}
              <div className="mt-4">
                <Label htmlFor="best_time">Best time to reach you (optional)</Label>
                <Input
                  id="best_time"
                  placeholder="e.g., Weekday mornings, After 5pm"
                  value={formData.best_time}
                  onChange={(e) => setFormData({ ...formData, best_time: e.target.value })}
                  className="mt-1"
                />
              </div>
            </Card>

            {/* Summary Card */}
            <Card className="p-4 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Request Summary</p>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Name:</span> {formData.contact_name}</p>
                <p><span className="text-gray-500">Address:</span> {formData.property_address}</p>
                <p><span className="text-gray-500">Type:</span> {LEAD_TYPES.find(t => t.id === formData.lead_type)?.label}</p>
                <p><span className="text-gray-500">Urgency:</span> {URGENCY_OPTIONS.find(u => u.id === formData.urgency)?.label}</p>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitLeadMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 h-12"
              >
                {submitLeadMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 py-6 text-gray-400">
          <div className="flex items-center gap-2 text-xs">
            <Shield className="w-4 h-4" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Star className="w-4 h-4" />
            <span>Trusted</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-6 text-xs text-gray-400">
          <p>Powered by 360° Method</p>
        </div>
      </div>
    </div>
  );
}
