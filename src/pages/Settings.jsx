import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, Bell, Shield, LogOut, Crown, Sparkles, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import TierBadge from "../components/upgrade/TierBadge";

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const [profile, setProfile] = React.useState({
    full_name: '',
    email: '',
    phone: '',
    location_zip: ''
  });

  React.useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        location_zip: user.location_zip || ''
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      alert('Profile updated successfully!');
    },
  });

  const handleProfileSave = () => {
    const updateData = {};
    if (profile.phone !== user?.phone) updateData.phone = profile.phone;
    if (profile.location_zip !== user?.location_zip) updateData.location_zip = profile.location_zip;
    
    if (Object.keys(updateData).length > 0) {
      updateProfileMutation.mutate(updateData);
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const currentTier = user?.subscription_tier || 'free';
  const isFreeTier = currentTier === 'free';
  const isProTier = currentTier === 'pro';
  const isServiceMember = currentTier.includes('homecare') || currentTier.includes('propertycare');
  const propertyLimit = user?.property_limit || 1;
  const subscriptionStatus = user?.subscription_status || 'active';
  const trialEndsDate = user?.trial_ends_date;
  const renewalDate = user?.subscription_renewal_date;

  return (
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-4xl md:mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px' }}>
            Settings
          </h1>
          <p className="text-gray-600">Manage your account and subscription</p>
        </div>

        {/* Profile Section */}
        <Card className="border-2 border-gray-200 mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="w-6 h-6" style={{ color: '#1B365D' }} />
              <CardTitle>Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-semibold">Full Name</Label>
              <Input
                value={profile.full_name}
                disabled
                className="mt-2 bg-gray-50"
                style={{ minHeight: '48px' }}
              />
              <p className="text-xs text-gray-500 mt-1">Name cannot be changed here</p>
            </div>

            <div>
              <Label className="font-semibold">Email</Label>
              <Input
                value={profile.email}
                disabled
                className="mt-2 bg-gray-50"
                style={{ minHeight: '48px' }}
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
            </div>

            <div>
              <Label className="font-semibold">Phone Number</Label>
              <Input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="(360) 555-1234"
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
            </div>

            <div>
              <Label className="font-semibold">ZIP Code</Label>
              <Input
                value={profile.location_zip}
                onChange={(e) => setProfile({ ...profile, location_zip: e.target.value })}
                placeholder="98660"
                maxLength="5"
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
              <p className="text-xs text-gray-500 mt-1">Used to match you with local operators</p>
            </div>

            <Button
              onClick={handleProfileSave}
              className="w-full"
              style={{ backgroundColor: '#28A745', minHeight: '48px' }}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* Subscription Section */}
        <Card className="border-2 border-blue-300 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-blue-600" />
                <CardTitle>Subscription</CardTitle>
              </div>
              <TierBadge tier={currentTier} />
            </div>
          </CardHeader>
          <CardContent>
            {/* Tier Status */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Current Plan:</span>
                <span className="text-lg font-bold" style={{ color: '#1B365D' }}>
                  {isFreeTier && 'Free Tier'}
                  {isProTier && 'Pro ($8/month)'}
                  {currentTier === 'homecare_essential' && 'HomeCare Essential'}
                  {currentTier === 'homecare_premium' && 'HomeCare Premium'}
                  {currentTier === 'homecare_elite' && 'HomeCare Elite'}
                  {currentTier === 'propertycare_essential' && 'PropertyCare Essential'}
                  {currentTier === 'propertycare_premium' && 'PropertyCare Premium'}
                  {currentTier === 'propertycare_elite' && 'PropertyCare Elite'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Limit:</span>
                  <span className="font-semibold">
                    {propertyLimit === 999 ? 'Unlimited' : `${properties.length} of ${propertyLimit}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge 
                    variant={subscriptionStatus === 'active' ? 'default' : 'secondary'}
                    className={subscriptionStatus === 'active' ? 'bg-green-600' : ''}
                  >
                    {subscriptionStatus}
                  </Badge>
                </div>
                {trialEndsDate && subscriptionStatus === 'trial' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trial Ends:</span>
                    <span className="font-semibold">{new Date(trialEndsDate).toLocaleDateString()}</span>
                  </div>
                )}
                {renewalDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Renewal:</span>
                    <span className="font-semibold">{new Date(renewalDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Upgrade Options */}
            {isFreeTier && (
              <div className="space-y-3">
                <Button
                  asChild
                  className="w-full font-semibold"
                  style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                >
                  <Link to={createPageUrl("Upgrade")}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade to Pro - $8/month
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                  style={{ minHeight: '48px' }}
                >
                  <Link to={createPageUrl("HomeCare")}>
                    <Crown className="w-4 h-4 mr-2" />
                    Explore HomeCare Service
                  </Link>
                </Button>
              </div>
            )}

            {isProTier && (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  style={{ minHeight: '48px' }}
                  onClick={() => alert('Coming soon: Manage billing portal')}
                >
                  Manage Billing
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                  style={{ minHeight: '48px' }}
                >
                  <Link to={createPageUrl("HomeCare")}>
                    Upgrade to HomeCare Service
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}

            {isServiceMember && (
              <div className="space-y-3">
                {user?.operator_name && (
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-3">
                    <p className="text-sm font-semibold text-green-900 mb-1">
                      Your Operator:
                    </p>
                    <p className="text-green-800">{user.operator_name}</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  style={{ minHeight: '48px' }}
                  onClick={() => alert('Coming soon: Contact operator')}
                >
                  Contact Your Operator
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  style={{ minHeight: '48px' }}
                  onClick={() => alert('Coming soon: Manage service subscription')}
                >
                  Manage Service Subscription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="border-2 border-gray-200 mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-orange-600" />
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Notification preferences coming soon. You'll be able to customize:
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Inspection reminders</li>
              <li>• High-priority task alerts</li>
              <li>• Seasonal maintenance notifications</li>
              <li>• Service visit updates (for service members)</li>
              <li>• Newsletter and tips</li>
            </ul>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="border-2 border-gray-200 mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-purple-600" />
              <CardTitle>Security & Privacy</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                style={{ minHeight: '48px' }}
                onClick={() => alert('Coming soon: Change password')}
              >
                Change Password
              </Button>
              <Button
                variant="outline"
                className="w-full"
                style={{ minHeight: '48px' }}
                onClick={() => alert('Coming soon: Two-factor authentication')}
              >
                Enable Two-Factor Auth
              </Button>
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-300 hover:bg-red-50"
                style={{ minHeight: '48px' }}
                onClick={() => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    alert('Coming soon: Account deletion');
                  }
                }}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="border-2 border-gray-200">
          <CardContent className="p-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-gray-700"
              style={{ minHeight: '48px' }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}