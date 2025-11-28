import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth, Property, PropertyAccess } from '@/api/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Home, Users, XCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function AcceptInvitation() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, valid, expired, accepted, error

  const queryClient = useQueryClient();

  const { data: invitation } = useQuery({
    queryKey: ['invitation', token],
    queryFn: async () => {
      const invitations = await PropertyAccess.filter({
        invitation_token: token,
        status: 'invited'
      });
      return invitations[0] || null;
    },
    enabled: !!token
  });

  const { data: property } = useQuery({
    queryKey: ['property', invitation?.property_id],
    queryFn: () => Property.get(invitation.property_id),
    enabled: !!invitation?.property_id
  });

  useEffect(() => {
    if (!invitation) {
      setStatus('error');
      return;
    }

    const expirationDate = new Date(invitation.invitation_expires);
    if (expirationDate < new Date()) {
      setStatus('expired');
      return;
    }

    setStatus('valid');
  }, [invitation]);

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const user = await auth.me();

      return PropertyAccess.update(invitation.id, {
        user_id: user.id,
        status: 'active',
        accepted_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['propertyAccess'] });
      setStatus('accepted');
    }
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-gray-600">Loading invitation...</div>
        </Card>
      </div>
    );
  }

  if (status === 'error' || !invitation || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">
            This invitation link is not valid or has already been used.
          </p>
          <Button onClick={() => window.location.href = createPageUrl('Properties')}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Expired</h1>
          <p className="text-gray-600 mb-6">
            This invitation has expired. Please contact {invitation.invited_by} for a new invitation.
          </p>
          <Button onClick={() => window.location.href = createPageUrl('Properties')}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Granted!</h1>
          <p className="text-gray-600 mb-6">
            You now have access to {property.address}
          </p>
          <Button onClick={() => window.location.href = createPageUrl('Properties')}>
            View Property
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-6">
          <Home className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Access Invitation</h1>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Property</div>
            <div className="font-semibold text-gray-900">{property.address}</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Invited By</div>
            <div className="font-semibold text-gray-900">{invitation.invited_by}</div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-sm text-gray-600">Your Role</div>
              <Badge className="bg-purple-100 text-purple-700 mt-1">
                {invitation.role}
              </Badge>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="text-sm text-yellow-800">
            This invitation expires on {new Date(invitation.invitation_expires).toLocaleDateString()}
          </div>
        </div>

        <Button
          onClick={() => acceptMutation.mutate()}
          disabled={acceptMutation.isPending}
          className="w-full"
          size="lg"
        >
          {acceptMutation.isPending ? 'Accepting...' : 'Accept Invitation'}
        </Button>
      </Card>
    </div>
  );
}