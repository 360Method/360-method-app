import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { functions } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Trash2, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentMethods() {
  const [addingCard, setAddingCard] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ['paymentMethods', user?.id],
    queryFn: async () => {
      const { data } = await functions.invoke('syncPaymentMethodsFromStripe', {
        user_id: user.id,
        user_email: user.email
      });
      return data?.payment_methods || [];
    },
    enabled: !!user?.id
  });

  const addPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('Please log in to add a payment method');
      }
      const returnUrl = window.location.origin + window.location.pathname + '?setup=complete';
      const { data, error } = await functions.invoke('addPaymentMethod', {
        return_url: returnUrl,
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name || user.name
      });

      if (error) throw new Error(error.message || 'Failed to start setup');

      // Redirect to Stripe-hosted setup page
      if (data?.setup_url) {
        window.location.href = data.setup_url;
      }
      return data;
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add payment method');
    }
  });

  const removePaymentMutation = useMutation({
    mutationFn: (paymentMethodId) => functions.invoke('removePaymentMethod', {
      payment_method_id: paymentMethodId,
      user_id: user?.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast.success('Payment method removed');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove payment method');
    }
  });

  const setDefaultMutation = useMutation({
    mutationFn: (paymentMethodId) => functions.invoke('setDefaultPaymentMethod', {
      payment_method_id: paymentMethodId,
      user_id: user?.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast.success('Default payment method updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update default payment method');
    }
  });

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('setup') === 'complete') {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast.success('Payment method added successfully');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const getCardIcon = (brand) => {
    return <CreditCard className="w-8 h-8" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => window.history.back()} className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Methods</h1>
          <p className="text-gray-600">Manage your saved payment methods</p>
        </div>

        {paymentMethods.length === 0 && !isLoading ? (
          <Card className="p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No payment methods</h3>
            <p className="text-gray-600 mb-6">
              Add a payment method to easily pay invoices
            </p>
            <Button
              onClick={() => addPaymentMutation.mutate()}
              disabled={addPaymentMutation.isPending}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              {addPaymentMutation.isPending ? 'Redirecting...' : 'Add Payment Method'}
            </Button>
          </Card>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => addPaymentMutation.mutate()}
                disabled={addPaymentMutation.isPending}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Payment Method
              </Button>
            </div>

            <div className="space-y-3">
              {paymentMethods.map(method => (
                <Card key={method.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getCardIcon(method.card_brand)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 capitalize">
                            {method.card_brand}
                          </span>
                          <span className="text-gray-600">•••• {method.card_last_four}</span>
                          {method.is_default && (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Expires {method.card_exp_month}/{method.card_exp_year}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!method.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDefaultMutation.mutate(method.id)}
                          disabled={setDefaultMutation.isPending}
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm('Remove this payment method?')) {
                            removePaymentMutation.mutate(method.id);
                          }
                        }}
                        disabled={removePaymentMutation.isPending}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}