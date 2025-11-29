import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  DollarSign,
  Calendar,
  User,
  Building2,
  Loader2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Shield,
  Star,
  ArrowRight,
  Check,
  X
} from 'lucide-react';

// Status display mapping
const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: Clock },
  viewed: { label: 'Viewed', color: 'bg-purple-100 text-purple-700', icon: FileText },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700', icon: X },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-500', icon: AlertCircle },
};

export default function ViewQuote() {
  const { shortcode } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const queryClient = useQueryClient();

  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // Fetch quote by short code
  const { data: quoteData, isLoading, error } = useQuery({
    queryKey: ['public-quote', shortcode],
    queryFn: async () => {
      // Get quote by short code
      const { data: quote, error: quoteError } = await supabase
        .from('operator_quotes')
        .select('*')
        .eq('short_code', shortcode)
        .single();

      if (quoteError) throw quoteError;
      if (!quote) throw new Error('Quote not found');

      // Check if quote requires token and validate
      if (quote.magic_token && quote.magic_token !== token) {
        throw new Error('Invalid or expired link');
      }

      // Check if token expired
      if (quote.magic_token_expires_at && new Date(quote.magic_token_expires_at) < new Date()) {
        throw new Error('This quote link has expired');
      }

      // Get lead info
      const { data: lead } = await supabase
        .from('operator_leads')
        .select('*')
        .eq('id', quote.lead_id)
        .single();

      // Get operator info
      const { data: operator } = await supabase
        .from('operators')
        .select('*, users(first_name, last_name, email)')
        .eq('id', quote.operator_id)
        .single();

      // Mark as viewed if first time
      if (quote.status === 'sent') {
        await supabase
          .from('operator_quotes')
          .update({
            status: 'viewed',
            viewed_at: new Date().toISOString()
          })
          .eq('id', quote.id);
      }

      return { quote, lead, operator };
    },
    enabled: !!shortcode,
    retry: false
  });

  // Send verification code mutation
  const sendVerificationMutation = useMutation({
    mutationFn: async () => {
      // In production, this would send an actual SMS/email code via Twilio/SendGrid
      console.log('Sending verification code to:', quoteData.lead.contact_phone || quoteData.lead.contact_email);
      return { success: true };
    },
    onSuccess: () => {
      setShowVerification(true);
      toast.success('Verification code sent!');
    }
  });

  // Approve with verification mutation
  const approveWithVerificationMutation = useMutation({
    mutationFn: async () => {
      // Validate code (in production, check actual code)
      if (verificationCode.length !== 6) {
        throw new Error('Please enter the 6-digit code');
      }

      // Update quote
      const { error: quoteError } = await supabase
        .from('operator_quotes')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          metadata: {
            ...quoteData.quote.metadata,
            scheduled_time_slot: selectedTimeSlot
          }
        })
        .eq('id', quoteData.quote.id);

      if (quoteError) throw quoteError;

      // Update lead
      await supabase
        .from('operator_leads')
        .update({
          stage: 'approved',
          converted_at: new Date().toISOString()
        })
        .eq('id', quoteData.quote.lead_id);

      // Create property record (simplified - in production use canonical property lookup)
      let propertyId = null;
      if (quoteData.lead.property_address) {
        const { data: property } = await supabase
          .from('properties')
          .insert({
            street_address: quoteData.lead.property_address,
            city: quoteData.lead.property_city,
            state: quoteData.lead.property_state,
            zip_code: quoteData.lead.property_zip,
          })
          .select()
          .single();

        if (property) {
          propertyId = property.id;
          // Update lead with property ID
          await supabase
            .from('operator_leads')
            .update({ converted_to_property_id: property.id })
            .eq('id', quoteData.quote.lead_id);
        }
      }

      // Log activity
      await supabase
        .from('operator_lead_activities')
        .insert({
          lead_id: quoteData.quote.lead_id,
          operator_id: quoteData.quote.operator_id,
          activity_type: 'approved',
          description: 'Quote approved and account created via verification'
        });

      return { propertyId };
    },
    onSuccess: ({ propertyId }) => {
      queryClient.invalidateQueries(['public-quote', shortcode]);
      toast.success('Quote approved! Your property portal is being created.');
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  // Simple approve (backwards compatible)
  const approveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('operator_quotes')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', quoteData.quote.id);

      if (error) throw error;

      // Update lead stage
      await supabase
        .from('operator_leads')
        .update({ stage: 'approved' })
        .eq('id', quoteData.quote.lead_id);

      // Log activity
      await supabase
        .from('operator_lead_activities')
        .insert({
          lead_id: quoteData.quote.lead_id,
          operator_id: quoteData.quote.operator_id,
          activity_type: 'approved',
          description: 'Quote approved by customer'
        });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['public-quote', shortcode]);
      toast.success('Quote approved! The operator will contact you to schedule.');
    },
    onError: (error) => {
      toast.error('Failed to approve quote: ' + error.message);
    }
  });

  // Decline quote mutation
  const declineMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('operator_quotes')
        .update({
          status: 'declined',
          declined_at: new Date().toISOString(),
          decline_reason: declineReason || null
        })
        .eq('id', quoteData.quote.id);

      if (error) throw error;

      // Update lead stage
      await supabase
        .from('operator_leads')
        .update({ stage: 'lost' })
        .eq('id', quoteData.quote.lead_id);

      // Log activity
      await supabase
        .from('operator_lead_activities')
        .insert({
          lead_id: quoteData.quote.lead_id,
          operator_id: quoteData.quote.operator_id,
          activity_type: 'lost',
          description: `Quote declined${declineReason ? `: ${declineReason}` : ''}`
        });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['public-quote', shortcode]);
      setShowDeclineReason(false);
      toast.success('Quote declined. Thank you for letting us know.');
    },
    onError: (error) => {
      toast.error('Failed to decline quote: ' + error.message);
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      // Log as activity/note
      await supabase
        .from('operator_lead_activities')
        .insert({
          lead_id: quoteData.quote.lead_id,
          operator_id: quoteData.quote.operator_id,
          activity_type: 'note',
          description: `Customer question: ${contactMessage}`
        });

      // In production, this would trigger an email/notification to the operator
      return { success: true };
    },
    onSuccess: () => {
      setShowContactForm(false);
      setContactMessage('');
      toast.success('Message sent! The operator will get back to you soon.');
    },
    onError: (error) => {
      toast.error('Failed to send message: ' + error.message);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Quote Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error.message || 'This quote may have expired or the link is invalid.'}
          </p>
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact the service provider directly.
          </p>
        </Card>
      </div>
    );
  }

  const { quote, lead, operator } = quoteData;
  const statusConfig = STATUS_CONFIG[quote.status] || STATUS_CONFIG.sent;
  const StatusIcon = statusConfig.icon;
  const isExpired = quote.valid_until && new Date(quote.valid_until) < new Date();
  const canTakeAction = ['sent', 'viewed'].includes(quote.status) && !isExpired;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">
                  {operator?.business_name || 'Service Provider'}
                </h1>
                <p className="text-xs text-gray-500">Quote #{quote.short_code}</p>
              </div>
            </div>
            <Badge className={statusConfig.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {isExpired ? 'Expired' : statusConfig.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Approved Success State */}
        {quote.status === 'approved' && (
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="font-bold text-green-800 text-lg">Quote Approved!</h2>
                <p className="text-green-700 mt-1">
                  Thank you for approving this quote. {operator?.business_name || 'The operator'} will contact you soon to schedule the work.
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Approved on {new Date(quote.approved_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Declined State */}
        {quote.status === 'declined' && (
          <Card className="p-6 bg-gray-50 border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <X className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-lg">Quote Declined</h2>
                <p className="text-gray-600 mt-1">
                  This quote was declined on {new Date(quote.declined_at).toLocaleDateString()}.
                </p>
                {quote.decline_reason && (
                  <p className="text-sm text-gray-500 mt-2">
                    Reason: {quote.decline_reason}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Expired Warning */}
        {isExpired && quote.status !== 'approved' && quote.status !== 'declined' && (
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">This quote has expired</p>
                <p className="text-sm text-amber-700">
                  Please contact {operator?.business_name || 'the operator'} for an updated quote.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Quote Details Card */}
        <Card className="overflow-hidden">
          {/* Quote Header */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <h2 className="text-xl font-bold">{quote.title}</h2>
            {quote.description && (
              <p className="text-blue-100 mt-1 text-sm">{quote.description}</p>
            )}
          </div>

          {/* Property & Customer Info */}
          {lead && (
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{lead.contact_name}</p>
                  {lead.property_address && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {lead.property_address}
                      {lead.property_city && `, ${lead.property_city}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Line Items */}
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quote Details</h3>
            <div className="space-y-3">
              {quote.line_items?.map((item, index) => (
                <div key={index} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-gray-900">{item.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <span className="font-medium text-gray-900">
                      ${item.amount?.toLocaleString()}
                    </span>
                    {item.amount_max && (
                      <span className="text-gray-500"> - ${item.amount_max.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>
                  ${quote.subtotal_min?.toLocaleString()}
                  {quote.subtotal_max && ` - $${quote.subtotal_max.toLocaleString()}`}
                </span>
              </div>
              {quote.tax_rate > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax ({(quote.tax_rate * 100).toFixed(2)}%)</span>
                  <span>${quote.tax_amount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg text-green-600">
                  ${quote.total_min?.toLocaleString()}
                  {quote.total_max && ` - $${quote.total_max.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>

          {/* Notes from Operator */}
          {quote.notes_to_customer && (
            <div className="px-6 pb-6">
              <Card className="p-4 bg-blue-50 border-blue-100">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">Message from {operator?.business_name || 'your operator'}</p>
                    <p className="text-sm text-blue-700 whitespace-pre-wrap">{quote.notes_to_customer}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Valid Until */}
          {quote.valid_until && !isExpired && (
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Quote valid until {new Date(quote.valid_until).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        {canTakeAction && (
          <div className="space-y-3">
            {!showDeclineReason && !showContactForm && !showVerification && (
              <>
                <Button
                  onClick={() => sendVerificationMutation.mutate()}
                  disabled={sendVerificationMutation.isPending}
                  className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
                >
                  {sendVerificationMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <ThumbsUp className="w-5 h-5 mr-2" />
                  )}
                  Approve & Schedule
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowContactForm(true)}
                    className="h-12"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Ask a Question
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeclineReason(true)}
                    className="h-12 text-gray-600 hover:text-red-600 hover:border-red-300"
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Decline Quote
                  </Button>
                </div>
              </>
            )}

            {/* Verification Flow */}
            {showVerification && (
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-2">Verify to Approve</h3>
                <p className="text-sm text-gray-600 mb-4">
                  We've sent a verification code to {lead?.contact_phone || lead?.contact_email}.
                </p>

                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2">Enter the 6-digit code:</p>
                  <Input
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest h-14"
                    maxLength={6}
                  />
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preferred time for work:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['Morning', 'Afternoon', 'Flexible'].map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedTimeSlot === slot.toLowerCase() ? 'default' : 'outline'}
                        onClick={() => setSelectedTimeSlot(slot.toLowerCase())}
                        className="h-10"
                        type="button"
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => approveWithVerificationMutation.mutate()}
                  disabled={verificationCode.length !== 6 || approveWithVerificationMutation.isPending}
                  className="w-full h-12 bg-green-600 hover:bg-green-700"
                >
                  {approveWithVerificationMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Confirm & Create My Portal
                </Button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  This creates your free property portal where you can track all work on your home.
                </p>

                <div className="flex items-center justify-between pt-4 mt-4 border-t">
                  <button
                    onClick={() => setShowVerification(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => sendVerificationMutation.mutate()}
                    className="text-sm text-blue-600 hover:underline"
                    disabled={sendVerificationMutation.isPending}
                  >
                    Resend code
                  </button>
                </div>
              </Card>
            )}

            {/* Decline Form */}
            {showDeclineReason && (
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Decline Quote</h3>
                <p className="text-sm text-gray-600 mb-4">
                  We're sorry this quote didn't work out. Your feedback helps us improve.
                </p>
                <textarea
                  placeholder="Reason for declining (optional)..."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  rows={3}
                />
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeclineReason(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => declineMutation.mutate()}
                    disabled={declineMutation.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {declineMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Confirm Decline
                  </Button>
                </div>
              </Card>
            )}

            {/* Contact Form */}
            {showContactForm && (
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Ask a Question</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Have a question about this quote? Send a message to {operator?.business_name || 'the operator'}.
                </p>
                <textarea
                  placeholder="Type your question..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowContactForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => sendMessageMutation.mutate()}
                    disabled={!contactMessage.trim() || sendMessageMutation.isPending}
                    className="flex-1"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <MessageSquare className="w-4 h-4 mr-2" />
                    )}
                    Send Message
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Operator Contact Info */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Contact {operator?.business_name || 'Service Provider'}</h3>
          <div className="space-y-3">
            {operator?.users?.email && (
              <a
                href={`mailto:${operator.users.email}`}
                className="flex items-center gap-3 text-gray-600 hover:text-blue-600"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <span>{operator.users.email}</span>
              </a>
            )}
            {operator?.phone && (
              <a
                href={`tel:${operator.phone}`}
                className="flex items-center gap-3 text-gray-600 hover:text-blue-600"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <span>{operator.phone}</span>
              </a>
            )}
          </div>
        </Card>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 py-4 text-gray-400">
          <div className="flex items-center gap-2 text-xs">
            <Shield className="w-4 h-4" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Star className="w-4 h-4" />
            <span>Trusted Provider</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-xs text-gray-400">
          <p>Powered by 360° Method</p>
          <p className="mt-1">The complete home care platform</p>
        </div>
      </div>
    </div>
  );
}
