import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Property } from '@/api/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import {
  Home,
  Building2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Users,
  Wrench
} from 'lucide-react';

const USER_TYPES = [
  {
    id: 'homeowner',
    title: 'Homeowner',
    description: 'I own and live in my home',
    icon: Home,
    color: 'blue'
  },
  {
    id: 'investor',
    title: 'Real Estate Investor',
    description: 'I own rental properties',
    icon: Building2,
    color: 'green'
  }
];

const MANAGEMENT_STYLES = [
  {
    id: 'diy',
    title: 'DIY / Self-Managed',
    description: 'I want to handle maintenance myself',
    icon: Wrench,
    features: ['Full dashboard access', 'DIY guides & videos', 'Budget tracking', 'Schedule reminders']
  },
  {
    id: 'hybrid',
    title: 'Hybrid',
    description: 'I want help with some tasks',
    icon: Users,
    features: ['Everything in DIY', 'Request professional help', 'Operator marketplace', 'Priority support']
  },
  {
    id: 'managed',
    title: 'Fully Managed',
    description: 'Let professionals handle everything',
    icon: CheckCircle,
    features: ['Dedicated operator', 'Hands-off maintenance', 'Monthly reports', 'Guaranteed response times']
  }
];

export default function PortalOnboarding() {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    userType: null,
    propertyCount: 1,
    managementStyle: null
  });

  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: (data) => auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      window.location.href = createPageUrl('Properties') + '?welcome=true';
    }
  });

  const handleComplete = () => {
    updateUserMutation.mutate({
      onboarding_completed: true,
      user_type: userData.userType,
      property_count: userData.propertyCount,
      management_style: userData.managementStyle
    });
  };

  const canContinue = () => {
    if (step === 1) return userData.userType !== null;
    if (step === 2) return userData.propertyCount > 0;
    if (step === 3) return userData.managementStyle !== null;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full p-8 md:p-12">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(num => (
            <div key={num} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                num < step ? 'bg-green-500 text-white' :
                num === step ? 'bg-blue-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {num < step ? <CheckCircle className="w-6 h-6" /> : num}
              </div>
              {num < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  num < step ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: User Type */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to 360° Asset Command Center
              </h1>
              <p className="text-gray-600">
                Let's personalize your experience
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-4">
                What best describes you?
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {USER_TYPES.map(type => {
                  const Icon = type.icon;
                  const isSelected = userData.userType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setUserData({ ...userData, userType: type.id })}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-12 h-12 mb-3 ${
                        isSelected ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className="font-bold text-gray-900 mb-1">
                        {type.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {type.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Property Count */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                How many properties do you manage?
              </h1>
              <p className="text-gray-600">
                This helps us customize your dashboard
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <Input
                type="number"
                min="1"
                value={userData.propertyCount}
                onChange={(e) => setUserData({ ...userData, propertyCount: parseInt(e.target.value) || 1 })}
                className="text-center text-3xl font-bold h-20"
              />
              <p className="text-sm text-gray-600 text-center mt-2">
                {userData.propertyCount === 1 
                  ? 'You can add more properties later'
                  : `You'll see a portfolio view for all ${userData.propertyCount} properties`
                }
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Management Style */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                How do you want to manage your {userData.propertyCount > 1 ? 'properties' : 'property'}?
              </h1>
              <p className="text-gray-600">
                You can change this anytime
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {MANAGEMENT_STYLES.map(style => {
                const Icon = style.icon;
                const isSelected = userData.managementStyle === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => setUserData({ ...userData, managementStyle: style.id })}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-10 h-10 mb-3 ${
                      isSelected ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="font-bold text-gray-900 mb-1">
                      {style.title}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {style.description}
                    </div>
                    <div className="space-y-1">
                      {style.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canContinue()}
              className="gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canContinue() || updateUserMutation.isPending}
              className="gap-2"
            >
              {updateUserMutation.isPending ? 'Setting up...' : 'Get Started'}
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}