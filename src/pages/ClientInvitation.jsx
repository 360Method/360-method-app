import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  CheckCircle,
  Loader2,
  AlertCircle,
  Home,
  Calendar,
  Phone,
  Building2,
  ArrowRight
} from 'lucide-react';

export default function ClientInvitation() {
  const { invitationToken } = useParams();
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);

  // Fetch invitation data
  const { data, isLoading, error } = useQuery({
    queryKey: ['client-invitation', invitationToken],
    queryFn: async () => {
      // Get client by invitation token
      const { data: client, error: clientError } = await supabase
        .from('operator_clients')
        .select('*')
        .eq('invitation_token', invitationToken)
        .single();

      if (clientError) throw clientError;
      if (!client) throw new Error('Invitation not found');

      // Check expiry
      if (client.invitation_expires_at && new Date(client.invitation_expires_at) < new Date()) {
        throw new Error('This invitation has expired');
      }

      // Get operator
      const { data: operator } = await supabase
        .from('operators')
        .select('*, users(first_name, last_name, email)')
        .eq('id', client.operator_id)
        .single();

      // Get service history
      const { data: history } = await supabase
        .from('imported_service_history')
        .select('*')
        .eq('client_id', client.id)
        .order('service_date', { ascending: false })
        .limit(10);

      // Mark as viewed if first time
      if (client.migration_status === 'invited') {
        await supabase
          .from('operator_clients')
          .update({ migration_status: 'viewed' })
          .eq('id', client.id);
      }

      return { client, operator, history: history || [] };
    },
    enabled: !!invitationToken,
    retry: false
  });

  // Send verification code
  const sendCodeMutation = useMutation({
    mutationFn: async () => {
      // In production, this would send an actual SMS/email
      console.log('Sending verification code to:', data.client.contact_phone || data.client.contact_email);
      return { success: true };
    },
    onSuccess: () => {
      setCodeSent(true);
      toast.success('Verification code sent!');
    }
  });

  // Verify and register
  const verifyMutation = useMutation({
    mutationFn: async () => {
      // In production, validate the actual code
      // For demo, accept any 6-digit code
      if (verificationCode.length !== 6) {
        throw new Error('Please enter the 6-digit code');
      }

      // Update the client record
      const { error } = await supabase
        .from('operator_clients')
        .update({
          migration_status: 'registered',
          registered_at: new Date().toISOString()
        })
        .eq('id', data.client.id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      setVerified(true);
      toast.success('Welcome to your Property Portal!');
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invitation Not Found</h1>
          <p className="text-gray-600">{error.message}</p>
        </Card>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Welcome to Your Property Portal!</h1>
          <p className="text-gray-600 mb-6">
            Your account has been created. You can now access your property profile and service history.
          </p>
          <Button className="w-full h-12" onClick={() => window.location.href = '/Properties'}>
            View My Property
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </div>
    );
  }

  const { client, operator, history } = data;
  const totalSpent = history.reduce((sum, h) => sum + (parseFloat(h.amount) || 0), 0);

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
              <h1 className="font-bold text-gray-900">{operator?.business_name || 'Your Service Provider'}</h1>
              <p className="text-sm text-gray-500">Property Portal Invitation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Welcome Message */}
        <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <h2 className="text-xl font-bold mb-2">Welcome, {client.contact_name?.split(' ')[0]}!</h2>
          <p className="text-blue-100">
            {operator?.business_name || 'Your service provider'} has created a Property Portal for your home.
          </p>
        </Card>

        {/* Property Card */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{client.property_address}</h3>
              <p className="text-sm text-gray-500">
                {client.property_city}, {client.property_state} {client.property_zip}
              </p>
            </div>
          </div>
        </Card>

        {/* Service History Preview */}
        {history && history.length > 0 && (
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 mb-4">Your Service History</h3>
            <div className="space-y-3 mb-4">
              {history.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.service_date).toLocaleDateString()}
                    </p>
                  </div>
                  {item.amount && (
                    <span className="text-sm font-medium text-gray-900">${parseFloat(item.amount).toLocaleString()}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-sm text-gray-600">Total invested in your home</span>
              <span className="text-lg font-bold text-green-600">${totalSpent.toLocaleString()}</span>
            </div>
          </Card>
        )}

        {/* Benefits */}
        <Card className="p-6 bg-blue-50 border-blue-100">
          <h3 className="font-bold text-blue-900 mb-4">What You Can Do</h3>
          <ul className="space-y-3">
            {[
              { icon: Calendar, text: 'View your complete service history' },
              { icon: Home, text: "Track your home's health score" },
              { icon: Phone, text: 'Request new jobs anytime' },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-blue-800">
                <item.icon className="w-4 h-4 text-blue-600" />
                {item.text}
              </li>
            ))}
          </ul>
        </Card>

        {/* Verification */}
        <Card className="p-6">
          <h3 className="font-bold text-gray-900 mb-2">Access Your Portal</h3>
          <p className="text-sm text-gray-600 mb-4">
            Verify your phone number to access your property portal.
          </p>

          {!codeSent ? (
            <div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{client.contact_phone || client.contact_email}</span>
              </div>
              <Button
                onClick={() => sendCodeMutation.mutate()}
                disabled={sendCodeMutation.isPending}
                className="w-full h-12"
              >
                {sendCodeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Send Verification Code
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Enter the 6-digit code sent to your phone:
              </p>
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest h-14 mb-4"
                maxLength={6}
              />
              <Button
                onClick={() => verifyMutation.mutate()}
                disabled={verificationCode.length !== 6 || verifyMutation.isPending}
                className="w-full h-12"
              >
                {verifyMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Verify & Access Portal
              </Button>
              <p className="text-xs text-gray-500 text-center mt-3">
                Didn't receive it?{' '}
                <button
                  onClick={() => sendCodeMutation.mutate()}
                  className="text-blue-600 hover:underline"
                >
                  Resend code
                </button>
              </p>
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center py-4 text-xs text-gray-400">
          <p>Powered by 360 Method</p>
        </div>
      </div>
    </div>
  );
}
