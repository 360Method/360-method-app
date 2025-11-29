import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Phone, Mail, User, MapPin, FileText } from 'lucide-react';

export default function EmbedLeadForm() {
  const { operatorSlug } = useParams();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    property_zip: '',
    description: '',
  });

  // Fetch operator by slug
  const { data: operator, isLoading: operatorLoading, error: operatorError } = useQuery({
    queryKey: ['operator-embed', operatorSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operators')
        .select('id, business_name, slug, logo_url, primary_color')
        .eq('slug', operatorSlug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!operatorSlug,
    retry: false
  });

  // Submit lead
  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('operator_leads')
        .insert({
          operator_id: operator.id,
          contact_name: formData.contact_name,
          contact_phone: formData.contact_phone || null,
          contact_email: formData.contact_email || null,
          property_zip: formData.property_zip || null,
          description: formData.description || null,
          source: 'website',
          lead_type: 'job',
          stage: 'new',
          priority: 'medium'
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('operator_lead_activities').insert({
        lead_id: data.id,
        operator_id: operator.id,
        activity_type: 'created',
        description: 'Lead submitted via embedded form'
      });

      // Notify parent window if in iframe
      if (window.parent !== window) {
        window.parent.postMessage({ type: '360_LEAD_SUBMITTED', leadId: data.id }, '*');
      }

      return data;
    },
    onSuccess: () => setSubmitted(true),
    onError: (err) => toast.error('Failed to submit: ' + err.message)
  });

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.contact_name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.contact_phone && !formData.contact_email) {
      toast.error('Please provide a phone number or email');
      return;
    }
    submitMutation.mutate();
  };

  if (operatorLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (operatorError || !operator) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Form not available</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Request Received!</h2>
        <p className="text-gray-600 text-sm">
          {operator.business_name || 'We'} will contact you within 24 hours.
        </p>
      </div>
    );
  }

  const primaryColor = operator.primary_color || '#2563eb';

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        {operator.logo_url ? (
          <img src={operator.logo_url} alt={operator.business_name} className="h-10 mx-auto mb-2" />
        ) : (
          <h2 className="text-lg font-bold" style={{ color: primaryColor }}>
            {operator.business_name || 'Get a Quote'}
          </h2>
        )}
        <p className="text-sm text-gray-600">Tell us what you need</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Your Name *"
              value={formData.contact_name}
              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Phone Number"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: formatPhone(e.target.value) })}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="email"
              placeholder="Email Address"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* ZIP */}
        <div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="ZIP Code"
              maxLength={5}
              value={formData.property_zip}
              onChange={(e) => setFormData({ ...formData, property_zip: e.target.value.replace(/\D/g, '') })}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              placeholder="What do you need help with?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={submitMutation.isPending}
          className="w-full h-12 text-base"
          style={{ backgroundColor: primaryColor }}
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            'Get My Free Quote'
          )}
        </Button>

        {/* Trust line */}
        <p className="text-xs text-center text-gray-400">
          No spam - Free quote - Response within 24 hours
        </p>
      </form>
    </div>
  );
}
