import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OperatorStripeAccount, functions } from '@/api/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function StripeConnectCard({ operatorId }) {
  const queryClient = useQueryClient();

  const { data: stripeAccount, isLoading } = useQuery({
    queryKey: ['operatorStripeAccount', operatorId],
    queryFn: async () => {
      const accounts = await OperatorStripeAccount.filter({
        operator_id: operatorId
      });
      return accounts[0] || null;
    }
  });

  const createAccountMutation = useMutation({
    mutationFn: async () => {
      const returnUrl = window.location.origin + '/operator-dashboard?stripe_setup=complete';
      const refreshUrl = window.location.origin + '/operator-dashboard?stripe_setup=refresh';

      const { data } = await functions.invoke('createOperatorConnectAccount', {
        operator_id: operatorId,
        return_url: returnUrl,
        refresh_url: refreshUrl
      });
      return data;
    },
    onSuccess: (data) => {
      window.location.href = data.onboarding_url;
    }
  });

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('stripe_setup') === 'complete') {
      functions.invoke('completeOperatorOnboarding', { operator_id: operatorId })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['operatorStripeAccount'] });
          toast.success('Stripe account connected successfully!');
          window.history.replaceState({}, '', window.location.pathname);
        });
    }
  }, [operatorId]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  // Not Started
  if (!stripeAccount) {
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 rounded-full p-3">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Set Up Payments</h3>
            <p className="text-gray-700 mb-4">
              Connect your Stripe account to start receiving payments from clients
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Receive payments directly
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Automatic deposits to your bank
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Track all your earnings
              </li>
            </ul>
            <Button
              onClick={() => createAccountMutation.mutate()}
              disabled={createAccountMutation.isPending}
              size="lg"
              className="gap-2"
            >
              {createAccountMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>Connect with Stripe</>
              )}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Pending/Incomplete
  if (!stripeAccount.onboarding_complete || stripeAccount.stripe_account_status === 'requires_information') {
    return (
      <Card className="p-6 bg-yellow-50 border-2 border-yellow-300">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Complete Stripe Setup</h3>
            <p className="text-gray-700 mb-4">
              Your Stripe account setup is incomplete. Additional information is needed.
            </p>
            {stripeAccount.requirements_due && stripeAccount.requirements_due.length > 0 && (
              <div className="text-sm text-gray-600 mb-4">
                Required: {stripeAccount.requirements_due.join(', ')}
              </div>
            )}
            <Button
              onClick={() => createAccountMutation.mutate()}
              disabled={createAccountMutation.isPending}
              variant="outline"
            >
              Continue Setup
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Active
  if (stripeAccount.charges_enabled && stripeAccount.payouts_enabled) {
    return (
      <Card className="p-6 bg-green-50 border-2 border-green-300">
        <div className="flex items-start gap-4">
          <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900">Payments Active</h3>
              <Badge className="bg-green-600 text-white">Connected</Badge>
            </div>
            <p className="text-gray-700 mb-4">
              Your Stripe account is fully set up and you can receive payments from clients.
            </p>
            <Button
              variant="outline"
              onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
            >
              Manage in Stripe Dashboard
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Restricted
  return (
    <Card className="p-6 bg-red-50 border-2 border-red-300">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Account Restricted</h3>
          <p className="text-gray-700 mb-4">
            Your Stripe account has restrictions. Please resolve the issues to accept payments.
          </p>
          <Button onClick={() => createAccountMutation.mutate()}>
            Resolve Issues
          </Button>
        </div>
      </div>
    </Card>
  );
}