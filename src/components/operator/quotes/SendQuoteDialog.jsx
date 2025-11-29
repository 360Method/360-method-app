import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OperatorQuote, OperatorLead, OperatorLeadActivity, functions } from '@/api/supabaseClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle,
  Copy,
  ExternalLink,
  FileText,
  DollarSign,
  User,
  Loader2,
  Smartphone,
  Clock
} from 'lucide-react';

export default function SendQuoteDialog({
  open,
  onOpenChange,
  quote,
  lead,
  operatorId
}) {
  const queryClient = useQueryClient();

  const [sendEmail, setSendEmail] = useState(!!lead?.contact_email);
  const [sendSMS, setSendSMS] = useState(!!lead?.contact_phone);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Generate quote URL
  const quoteUrl = `${window.location.origin}/q/${quote?.short_code}`;

  // Send quote mutation
  const sendQuoteMutation = useMutation({
    mutationFn: async () => {
      // Update quote to sent status
      await OperatorQuote.update(quote.id, {
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_via: [sendEmail && 'email', sendSMS && 'sms'].filter(Boolean),
        magic_token: quote.magic_token || crypto.randomUUID(),
        magic_token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Update lead stage
      await OperatorLead.update(lead.id, {
        stage: 'quoted',
        last_contacted_at: new Date().toISOString()
      });

      // Log activity
      await OperatorLeadActivity.create({
        lead_id: lead.id,
        operator_id: operatorId,
        activity_type: 'quoted',
        description: `Quote sent via ${[sendEmail && 'email', sendSMS && 'SMS'].filter(Boolean).join(' and ')}`,
        metadata: { quote_id: quote.id, methods: { email: sendEmail, sms: sendSMS } }
      });

      // Send email if enabled
      if (sendEmail && lead.contact_email) {
        try {
          await functions.invoke('sendQuote', {
            quote_id: quote.id,
            send_email: true,
            send_sms: false
          });
        } catch (e) {
          console.log('Email send queued or dev mode:', e);
        }
      }

      // Send SMS if enabled
      if (sendSMS && lead.contact_phone) {
        try {
          await functions.invoke('sendQuote', {
            quote_id: quote.id,
            send_email: false,
            send_sms: true
          });
        } catch (e) {
          console.log('SMS send queued or dev mode:', e);
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['operator-leads', operatorId]);
      queryClient.invalidateQueries(['lead-quotes', lead.id]);
      setSent(true);
      toast.success('Quote sent successfully!');
    },
    onError: (error) => {
      toast.error('Failed to send quote: ' + error.message);
    }
  });

  const handleSend = async () => {
    if (!sendEmail && !sendSMS) {
      toast.error('Please select at least one delivery method');
      return;
    }
    setIsSending(true);
    await sendQuoteMutation.mutateAsync();
    setIsSending(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(quoteUrl);
    toast.success('Link copied to clipboard!');
  };

  if (!quote || !lead) return null;

  // If already sent, show success state
  if (sent) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Quote Sent!</h2>
            <p className="text-gray-600 mb-6">
              Your quote has been sent to {lead.contact_name}.
            </p>

            {/* Quote Link */}
            <Card className="p-4 bg-gray-50 mb-4">
              <p className="text-xs text-gray-500 mb-2">Share this link:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-blue-600 bg-white px-3 py-2 rounded border truncate">
                  {quoteUrl}
                </code>
                <Button variant="outline" size="sm" onClick={copyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(quoteUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Send className="w-4 h-4 text-blue-600" />
            </div>
            Send Quote
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Quote Summary */}
          <Card className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{quote.title}</h4>
                <p className="text-sm text-gray-500">To: {lead.contact_name}</p>
              </div>
              <Badge variant="secondary">Draft</Badge>
            </div>
            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-sm text-gray-600">Quote Total</span>
              <span className="text-xl font-bold text-green-600">
                ${quote.total_min?.toLocaleString()}
                {quote.total_max && ` - $${quote.total_max.toLocaleString()}`}
              </span>
            </div>
          </Card>

          {/* Delivery Methods */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Send via:</Label>

            {/* Email Option */}
            <Card
              className={`p-4 cursor-pointer transition-all ${
                sendEmail ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              } ${!lead.contact_email ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => lead.contact_email && setSendEmail(!sendEmail)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={sendEmail}
                  disabled={!lead.contact_email}
                  onCheckedChange={setSendEmail}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Mail className={`w-4 h-4 ${sendEmail ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="font-medium">Email</span>
                  </div>
                  {lead.contact_email ? (
                    <p className="text-sm text-gray-500 mt-0.5">{lead.contact_email}</p>
                  ) : (
                    <p className="text-sm text-red-500 mt-0.5">No email on file</p>
                  )}
                </div>
              </div>
            </Card>

            {/* SMS Option */}
            <Card
              className={`p-4 cursor-pointer transition-all ${
                sendSMS ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              } ${!lead.contact_phone ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => lead.contact_phone && setSendSMS(!sendSMS)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={sendSMS}
                  disabled={!lead.contact_phone}
                  onCheckedChange={setSendSMS}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Smartphone className={`w-4 h-4 ${sendSMS ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="font-medium">Text Message (SMS)</span>
                  </div>
                  {lead.contact_phone ? (
                    <p className="text-sm text-gray-500 mt-0.5">{lead.contact_phone}</p>
                  ) : (
                    <p className="text-sm text-red-500 mt-0.5">No phone on file</p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Preview Section */}
          <Card className="p-4 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Preview</p>
            {sendEmail && (
              <div className="mb-3 pb-3 border-b">
                <p className="text-xs text-gray-500">Email will include:</p>
                <ul className="text-sm text-gray-700 mt-1 space-y-1">
                  <li>• Quote summary with line items</li>
                  <li>• "View Full Quote" button</li>
                  <li>• "Approve & Schedule" button</li>
                  <li>• PDF attachment</li>
                </ul>
              </div>
            )}
            {sendSMS && (
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-sm text-gray-700">
                  Hi {lead.contact_name?.split(' ')[0]}! Your quote from [Your Business] is ready: ${quote.total_min?.toLocaleString()} - View & approve here: {quoteUrl.substring(0, 30)}...
                </p>
              </div>
            )}
          </Card>

          {/* Quote Valid */}
          {quote.valid_until && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Quote valid until {new Date(quote.valid_until).toLocaleDateString()}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending || (!sendEmail && !sendSMS)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Quote
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
