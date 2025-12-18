import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/AuthContext';
import { ContractorInvitation, Contractor } from '@/api/supabaseClient';
import { supabase } from '@/api/supabaseClient';
import { SignUp, SignIn } from '@clerk/clerk-react';
import {
  Wrench,
  Building,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  ArrowRight,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Shield
} from 'lucide-react';

export default function ContractorAcceptInvitation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  const [invitationStatus, setInvitationStatus] = useState('loading'); // loading, valid, invalid, expired, accepted
  const [invitation, setInvitation] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Get invitation token from URL
  const token = searchParams.get('token');

  // Fetch invitation from database
  useEffect(() => {
    const validateInvitation = async () => {
      if (!token) {
        setInvitationStatus('invalid');
        return;
      }

      try {
        // Fetch invitation by token
        const { data: invData, error } = await supabase
          .from('contractor_invitations')
          .select(`
            *,
            operator:operators (
              id,
              company_name,
              logo_url
            )
          `)
          .eq('token', token)
          .single();

        if (error || !invData) {
          setInvitationStatus('invalid');
          return;
        }

        // Check if expired
        if (invData.expires_at && new Date(invData.expires_at) < new Date()) {
          setInvitationStatus('expired');
          return;
        }

        // Check if already accepted
        if (invData.status === 'accepted') {
          setInvitation({
            id: invData.id,
            operator_name: invData.operator?.company_name || 'Unknown Operator',
            operator_logo: invData.operator?.logo_url,
            inviter_name: invData.invited_by_name || 'Operator Admin',
            email: invData.email,
            trade_type: invData.trade_types?.[0] || 'General Maintenance',
            message: invData.message || '',
            created_at: invData.created_at,
            expires_at: invData.expires_at,
            operator_id: invData.operator_id
          });
          setInvitationStatus('accepted');
          return;
        }

        // Valid invitation
        setInvitation({
          id: invData.id,
          operator_name: invData.operator?.company_name || 'Unknown Operator',
          operator_logo: invData.operator?.logo_url,
          inviter_name: invData.invited_by_name || 'Operator Admin',
          email: invData.email,
          trade_type: invData.trade_types?.[0] || 'General Maintenance',
          message: invData.message || 'We\'d love to have you join our contractor network!',
          created_at: invData.created_at,
          expires_at: invData.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          operator_id: invData.operator_id
        });
        setInvitationStatus('valid');
      } catch (err) {
        console.error('Error validating invitation:', err);
        setInvitationStatus('invalid');
      }
    };

    validateInvitation();
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    setIsAccepting(true);

    try {
      // Check if contractor profile already exists for this user
      const existingContractors = await Contractor.filter({ user_id: user.id });
      let contractorId;

      if (existingContractors && existingContractors.length > 0) {
        // Use existing contractor profile
        contractorId = existingContractors[0].id;
      } else {
        // Create new contractor profile
        const newContractor = await Contractor.create({
          user_id: user.id,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email,
          phone: '',
          trade_types: [invitation.trade_type],
          status: 'active',
          available: true
        });
        contractorId = newContractor.id;
      }

      // Link contractor to operator
      const { error: linkError } = await supabase
        .from('operator_contractors')
        .upsert({
          operator_id: invitation.operator_id,
          contractor_id: contractorId,
          status: 'active',
          created_at: new Date().toISOString()
        }, {
          onConflict: 'operator_id,contractor_id'
        });

      if (linkError) {
        console.error('Error linking contractor to operator:', linkError);
      }

      // Mark invitation as accepted
      const { error: invError } = await supabase
        .from('contractor_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          contractor_id: contractorId
        })
        .eq('id', invitation.id);

      if (invError) {
        console.error('Error updating invitation:', invError);
      }

      setInvitationStatus('accepted');

      // Redirect to contractor dashboard or onboarding after short delay
      setTimeout(() => {
        if (existingContractors && existingContractors.length > 0) {
          navigate('/ContractorDashboard');
        } else {
          navigate('/ContractorOnboarding');
        }
      }, 2000);

    } catch (error) {
      console.error('Failed to accept invitation:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  // Loading state
  if (invitationStatus === 'loading' || isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  // Invalid or missing token
  if (invitationStatus === 'invalid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or has already been used.
            Please contact the operator who sent you the invitation.
          </p>
          <Button onClick={() => navigate('/Welcome')}>
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  // Expired invitation
  if (invitationStatus === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invitation Expired</h1>
          <p className="text-gray-600 mb-6">
            This invitation has expired. Please contact the operator to request a new invitation.
          </p>
          <Button onClick={() => navigate('/Welcome')}>
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  // Accepted state
  if (invitationStatus === 'accepted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invitation Accepted!</h1>
          <p className="text-gray-600 mb-4">
            Welcome to {invitation.operator_name}'s contractor network.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirecting to onboarding...
          </div>
        </Card>
      </div>
    );
  }

  // Show auth if needed
  if (showAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600">
            Sign up to join {invitation?.operator_name}
          </p>
        </div>

        <SignUp
          routing="virtual"
          signInUrl={`/ContractorAcceptInvitation?token=${token}`}
          afterSignUpUrl={`/ContractorAcceptInvitation?token=${token}`}
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg",
              formButtonPrimary: "bg-orange-500 hover:bg-orange-600"
            }
          }}
        />

        <p className="mt-6 text-sm text-gray-500">
          Already have an account?{' '}
          <button
            onClick={() => setShowAuth(false)}
            className="text-orange-600 hover:underline"
          >
            Sign in instead
          </button>
        </p>
      </div>
    );
  }

  // Valid invitation - show accept UI
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-orange-600" />
            </div>
            <span className="font-semibold text-gray-900">360° Method</span>
          </div>
          <Badge className="bg-green-100 text-green-700">Contractor Invitation</Badge>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Invitation Card */}
        <Card className="p-6 md:p-8 mb-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building className="w-10 h-10 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              You're Invited to Join
            </h1>
            <h2 className="text-xl text-orange-600 font-semibold">
              {invitation.operator_name}
            </h2>
          </div>

          {/* Invitation Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Invited by {invitation.inviter_name}</div>
                <div className="text-sm text-gray-500">Operator Admin</div>
              </div>
            </div>

            {invitation.message && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 italic">"{invitation.message}"</p>
              </div>
            )}
          </div>

          {/* Trade Type */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Trade Type</div>
              <div className="font-medium text-gray-900">{invitation.trade_type}</div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">What You'll Get</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Steady stream of job assignments</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Mobile app for job management</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Timely payments via direct deposit</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>AI-powered scope & materials</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Professional documentation tools</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Build your reputation & ratings</span>
              </div>
            </div>
          </div>

          {/* Accept Button */}
          {isAuthenticated ? (
            <Button
              size="lg"
              onClick={handleAcceptInvitation}
              disabled={isAccepting}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Accepting Invitation...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept Invitation
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <Button
                size="lg"
                onClick={() => setShowAuth(true)}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Create Account to Accept
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link
                  to={`/Login?redirect_url=/ContractorAcceptInvitation?token=${token}`}
                  className="text-orange-600 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </Card>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            <span>Secure Platform</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>Fast Payments</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Flexible Schedule</span>
          </div>
        </div>

        {/* Expiration Notice */}
        <div className="mt-6 text-center text-sm text-gray-500">
          This invitation expires on{' '}
          {new Date(invitation.expires_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      </div>
    </div>
  );
}
