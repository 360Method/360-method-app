import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { OperatorStripeAccount } from '@/api/supabaseClient';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function StripeSetupNotice({ operatorId }) {
  const { data: stripeAccount } = useQuery({
    queryKey: ['operatorStripeAccount', operatorId],
    queryFn: async () => {
      const accounts = await OperatorStripeAccount.filter({
        operator_id: operatorId
      });
      return accounts[0] || null;
    },
    enabled: !!operatorId
  });

  if (!stripeAccount || !stripeAccount.charges_enabled) {
    return (
      <Card className="p-4 bg-yellow-50 border-yellow-200 mb-6">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Payment Notice:</strong> Clients cannot pay this invoice through the platform until you connect your Stripe account. 
            You can still create and send invoices, but clients will need to pay you directly.
          </div>
        </div>
      </Card>
    );
  }

  return null;
}