import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { functions } from '@/api/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InvoicePaymentDialog({ invoice, open, onClose }) {
  const [processing, setProcessing] = useState(false);
  const queryClient = useQueryClient();

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      const { data } = await functions.invoke('syncPaymentMethodsFromStripe');
      return data.payment_methods || [];
    },
    enabled: open
  });

  const defaultMethod = paymentMethods.find(m => m.is_default);

  const handlePayment = async () => {
    try {
      setProcessing(true);

      // Process payment via backend
      const { data: result } = await functions.invoke('processInvoicePayment', {
        invoice_id: invoice.id,
        payment_method_id: defaultMethod?.stripe_payment_method_id
      });

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        queryClient.invalidateQueries({ queryKey: ['invoice', invoice.id] });
        toast.success('Payment successful!');
        onClose();
      } else {
        toast.error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const amount = (invoice.actual_cost || invoice.final_cost_max || invoice.total_estimated_cost_max);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Invoice</div>
            <div className="font-semibold text-gray-900">{invoice.package_name}</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">
              ${amount.toFixed(2)}
            </div>
          </div>

          {/* Payment Method */}
          {paymentMethods.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">No payment methods available</p>
              <Button onClick={() => window.location.href = '/payment-methods'}>
                Add Payment Method
              </Button>
            </div>
          ) : (
            <>
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-2">Payment Method</div>
                {defaultMethod && (
                  <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <CreditCard className="w-6 h-6 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900 capitalize">
                        {defaultMethod.card_brand} •••• {defaultMethod.card_last4}
                      </div>
                      <div className="text-xs text-gray-500">
                        Expires {defaultMethod.card_exp_month}/{defaultMethod.card_exp_year}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="flex-shrink-0">🔒</div>
                <div>Secured by Stripe. Your payment information is encrypted.</div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handlePayment}
                  disabled={processing}
                  className="flex-1 gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Pay ${amount.toFixed(2)}</>
                  )}
                </Button>
                <Button variant="outline" onClick={onClose} disabled={processing}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}