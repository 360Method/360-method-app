import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OperatorClient, ImportedServiceHistory, integrations } from '@/api/supabaseClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Mail,
  MessageSquare,
  Home,
  Loader2,
  CheckCircle,
  Send
} from 'lucide-react';

export default function InviteClientDialog({ open, onOpenChange, client, operator }) {
  const queryClient = useQueryClient();
  const [sendEmail, setSendEmail] = useState(!!client?.contact_email);
  const [sendSms, setSendSms] = useState(!!client?.contact_phone);
  const [personalMessage, setPersonalMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [history, setHistory] = useState([]);

  // Fetch service history
  useEffect(() => {
    if (client?.id) {
      ImportedServiceHistory.filter({ client_id: client.id }, { orderBy: '-service_date', limit: 5 })
        .then(setHistory)
        .catch(console.error);
    }
  }, [client?.id]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSent(false);
      setPersonalMessage('');
      setSendEmail(!!client?.contact_email);
      setSendSms(!!client?.contact_phone);
    }
  }, [open, client]);

  const totalSpent = history.reduce((sum, h) => sum + (parseFloat(h.amount) || 0), 0);

  const inviteMutation = useMutation({
    mutationFn: async () => {
      // Update client to generate invitation token
      const updated = await OperatorClient.update(client.id, {
        migration_status: 'invited'
      });

      const inviteUrl = `${window.location.origin}/welcome/${updated.invitation_token}`;

      // Send email
      if (sendEmail && client.contact_email) {
        try {
          await integrations.SendEmail({
            from_name: operator?.business_name || '360 Method',
            to: client.contact_email,
            subject: `Your Property Portal is Ready - ${operator?.business_name || ''}`,
            body: `Hi ${client.contact_name?.split(' ')[0] || 'there'},

Great news! We've created a Property Portal for your home at ${client.property_address}.

You can now:
- View your complete service history
- See all the work we've done together
- Request new jobs anytime
- Track your home's health
${personalMessage ? `\n${personalMessage}\n` : ''}
Click here to access your portal:
${inviteUrl}
${history.length > 0 ? `
YOUR SERVICE HISTORY
${history.map(h => `- ${new Date(h.service_date).toLocaleDateString()} - ${h.description}${h.amount ? ` ($${h.amount})` : ''}`).join('\n')}
Total invested: $${totalSpent.toLocaleString()}` : ''}

Questions? Just reply to this email.

${operator?.business_name || 'Your Service Provider'}
`
          });
        } catch (err) {
          console.error('Failed to send email:', err);
        }
      }

      // Log SMS (in production, integrate with Twilio)
      if (sendSms && client.contact_phone) {
        console.log('Would send SMS to:', client.contact_phone);
        console.log('Message:', `${operator?.business_name}: Your property portal is ready! View your service history and request jobs: ${inviteUrl}`);
      }

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['operator-clients']);
      setSent(true);
    },
    onError: (err) => {
      toast.error('Failed to send invitation: ' + err.message);
    }
  });

  if (sent) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invitation Sent!</h2>
            <p className="text-gray-600 mb-6">
              {client.contact_name} will receive an invitation to join their Property Portal.
            </p>
            <Button onClick={() => { setSent(false); onOpenChange(false); }} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite to Property Portal</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Client Info */}
          <Card className="p-4 bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="font-bold text-blue-600">
                  {client?.contact_name?.charAt(0) || 'C'}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{client?.contact_name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  {client?.property_address}
                </p>
              </div>
            </div>
          </Card>

          {/* What They'll See */}
          {history.length > 0 && (
            <Card className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">What they'll see:</h4>
              <div className="space-y-2 text-sm">
                {history.slice(0, 3).map((h) => (
                  <div key={h.id} className="flex items-center justify-between">
                    <span className="text-gray-600">{h.description}</span>
                    {h.amount && <span className="font-medium">${parseFloat(h.amount).toLocaleString()}</span>}
                  </div>
                ))}
                {history.length > 3 && (
                  <p className="text-gray-400">+ {history.length - 3} more records</p>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 mt-3 border-t">
                <span className="text-gray-600">Total invested</span>
                <span className="font-bold text-green-600">${totalSpent.toLocaleString()}</span>
              </div>
            </Card>
          )}

          {/* Send Via */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Send invitation via:</h4>
            <div className="space-y-3">
              {client?.contact_email && (
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={sendEmail} onCheckedChange={setSendEmail} />
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="flex-1">{client.contact_email}</span>
                </label>
              )}
              {client?.contact_phone && (
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={sendSms} onCheckedChange={setSendSms} />
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="flex-1">{client.contact_phone} (SMS)</span>
                </label>
              )}
            </div>
          </div>

          {/* Personal Message */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Personal message (optional)</h4>
            <textarea
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              placeholder="Add a personal note..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => inviteMutation.mutate()}
              disabled={(!sendEmail && !sendSms) || inviteMutation.isPending}
              className="flex-1 gap-2"
            >
              {inviteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Invitation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
