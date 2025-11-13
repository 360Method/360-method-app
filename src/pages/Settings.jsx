
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Save,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  LogOut,
  Crown,
  CreditCard,
  TrendingUp,
  Zap,
  ArrowUpCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { calculateTotalDoors, getTierConfig, calculateGoodPricing, calculateBetterPricing, calculateBestPricing } from "../components/shared/TierCalculator";

const Label = ({ children, className = "", ...props }) => (
  <label className={`text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
);

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = React.useState({
    full_name: "",
    email: "",
    phone_number: "",
    preferred_contact_method: "email",
    timezone: "America/Los_Angeles"
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [isChangingTier, setIsChangingTier] = React.useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const allProps = await base44.entities.Property.list();
      return allProps.filter(p => !p.is_draft);
    },
  });

  // Initialize form with user data
  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        preferred_contact_method: user.preferred_contact_method || "email",
        timezone: user.timezone || "America/Los_Angeles"
      });
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setIsSaving(false);
      setSaveSuccess(true);
      setIsChangingTier(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (error) => {
      setIsSaving(false);
      setIsChangingTier(false);
      console.error("Failed to update user:", error);
      alert("Failed to update settings. Please try again.");
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    updateUserMutation.mutate(formData);
  };

  const handleChangeTier = (newTier) => {
    if (confirm(`Switch to ${getTierConfig(newTier).displayName} tier?`)) {
      setIsChangingTier(true);
      updateUserMutation.mutate({ tier: newTier });
    }
  };

  const handleRestartOnboarding = async () => {
    try {
      await updateUserMutation.mutateAsync({
        onboarding_completed: false,
        onboarding_skipped: false
      });
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      navigate(createPageUrl("Onboarding"));
    } catch (error) {
      console.error("Failed to restart onboarding:", error);
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  // Tier calculations
  const currentTier = user?.tier || 'free';
  const totalDoors = calculateTotalDoors(properties);
  const tierConfig = getTierConfig(currentTier);

  // Get pricing for all tiers
  const goodPricing = calculateGoodPricing(totalDoors);
  const betterPricing = calculateBetterPricing(totalDoors);
  const bestPricing = calculateBestPricing();

  // Determine which tier pricing applies
  let currentPricing = null;
  if (currentTier === 'good') currentPricing = goodPricing;
  if (currentTier === 'better') currentPricing = betterPricing;
  if (currentTier === 'best') currentPricing = bestPricing;

  const getTierIcon = (tier) => {
    switch(tier) {
      case 'free': return <Sparkles className="w-5 h-5 text-gray-600" />;
      case 'good': return <Zap className="w-5 h-5 text-green-600" />;
      case 'better': return <TrendingUp className="w-5 h-5 text-purple-600" />;
      case 'best': return <Crown className="w-5 h-5 text-orange-600" />;
      default: return <Sparkles className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
            Settings
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your account and subscription
          </p>
        </div>

        {/* Current Tier & Billing */}
        <Card className={`mb-6 border-2 shadow-lg ${
          currentTier === 'best' ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-yellow-50' :
          currentTier === 'better' ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50' :
          currentTier === 'good' ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50' :
          'border-gray-300 bg-gray-50'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getTierIcon(currentTier)}
              <span style={{ color: '#1B365D' }}>Current Plan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold" style={{ color: tierConfig.color }}>
                    {tierConfig.displayName}
                  </h3>
                  <Badge 
                    className="text-white"
                    style={{ backgroundColor: tierConfig.color }}
                  >
                    {tierConfig.name.toUpperCase()}
                  </Badge>
                </div>
                
                {/* Pricing Display */}
                {currentPricing && currentTier !== 'free' && (
                  <div className="mb-3">
                    <p className="text-3xl font-bold" style={{ color: tierConfig.color }}>
                      ${currentPricing.monthlyPrice}<span className="text-lg">/month</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      ${currentPricing.annualPrice}/year
                    </p>
                    {currentPricing.additionalDoors > 0 && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                        <p className="text-xs text-gray-700">
                          <strong>Breakdown:</strong> ${currentPricing.breakdown.base} base + ${currentPricing.breakdown.additionalCost} for {currentPricing.additionalDoors} extra door{currentPricing.additionalDoors > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {currentTier === 'free' && (
                  <p className="text-lg text-gray-700 mb-3">
                    <strong>$0/month</strong> • Learning the Method
                  </p>
                )}

                {/* Door Count */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Properties</p>
                    <p className="text-2xl font-bold" style={{ color: tierConfig.color }}>
                      {properties.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {tierConfig.propertyLimit === Infinity ? 'Unlimited' : `of ${tierConfig.propertyLimit} max`}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Total Doors</p>
                    <p className="text-2xl font-bold" style={{ color: tierConfig.color }}>
                      {totalDoors}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {tierConfig.doorLimit === null ? 'Any size' : tierConfig.doorLimit === Infinity ? 'Unlimited' : `of ${tierConfig.doorLimit} max`}
                    </p>
                  </div>
                </div>
              </div>

              {currentTier !== 'best' && (
                <Button
                  asChild
                  className="gap-2"
                  style={{ backgroundColor: '#FF6B35', minHeight: '48px' }}
                >
                  <Link to={createPageUrl("Pricing")}>
                    <ArrowUpCircle className="w-4 h-4" />
                    Change Plan
                  </Link>
                </Button>
              )}
            </div>

            {/* Quick Tier Switcher */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-3">Quick Plan Switch:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  onClick={() => handleChangeTier('free')}
                  variant={currentTier === 'free' ? 'default' : 'outline'}
                  size="sm"
                  disabled={currentTier === 'free' || isChangingTier}
                  className={currentTier === 'free' ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'text-gray-900 border-gray-300'}
                  style={{ minHeight: '44px' }}
                >
                  {isChangingTier && currentTier === 'free' ? <RefreshCw className="w-4 h-4 animate-spin" /> : currentTier === 'free' ? '✓ Free' : 'Free'}
                </Button>
                <Button
                  onClick={() => handleChangeTier('good')}
                  variant={currentTier === 'good' ? 'default' : 'outline'}
                  size="sm"
                  disabled={currentTier === 'good' || isChangingTier || totalDoors > 25}
                  className={currentTier === 'good' ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-gray-900 border-gray-300'}
                  style={{ minHeight: '44px' }}
                >
                  {isChangingTier && currentTier === 'good' ? <RefreshCw className="w-4 h-4 animate-spin" /> : currentTier === 'good' ? '✓ Pro' : 'Pro'}
                </Button>
                <Button
                  onClick={() => handleChangeTier('better')}
                  variant={currentTier === 'better' ? 'default' : 'outline'}
                  size="sm"
                  disabled={currentTier === 'better' || isChangingTier || totalDoors > 100}
                  className={currentTier === 'better' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'text-gray-900 border-gray-300'}
                  style={{ minHeight: '44px' }}
                >
                  {isChangingTier && currentTier === 'better' ? <RefreshCw className="w-4 h-4 animate-spin" /> : currentTier === 'better' ? '✓ Premium' : 'Premium'}
                </Button>
                <Button
                  onClick={() => handleChangeTier('best')}
                  variant={currentTier === 'best' ? 'default' : 'outline'}
                  size="sm"
                  disabled={currentTier === 'best' || isChangingTier}
                  className={currentTier === 'best' ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'text-gray-900 border-gray-300'}
                  style={{ minHeight: '44px' }}
                >
                  {isChangingTier && currentTier === 'best' ? <RefreshCw className="w-4 h-4 animate-spin" /> : currentTier === 'best' ? '✓ Enterprise' : 'Enterprise'}
                </Button>
              </div>
              {isChangingTier && (
                <p className="text-xs text-center text-gray-600 mt-2">Updating your plan...</p>
              )}
              {(currentTier === 'good' && totalDoors > 25) && (
                <p className="text-xs text-red-600 text-center mt-2">
                  Pro tier has a 25-door limit. Please upgrade to a higher plan.
                </p>
              )}
              {(currentTier === 'better' && totalDoors > 100) && (
                <p className="text-xs text-red-600 text-center mt-2">
                  Premium tier has a 100-door limit. Please upgrade to Enterprise.
                </p>
              )}
            </div>

            {/* Upgrade Suggestions */}
            {currentTier === 'free' && totalDoors > 1 && (
              <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  💡 Suggested: Upgrade to Pro
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  With {totalDoors} doors, Pro costs <strong>${goodPricing.monthlyPrice}/month</strong> and unlocks AI that prevents disasters:
                </p>
                <ul className="text-xs text-gray-700 space-y-1 ml-4 list-disc">
                  <li>AI cascade risk alerts (see chain reactions)</li>
                  <li>AI spending forecasts (budget accurately)</li>
                  <li>AI maintenance insights (become an expert)</li>
                </ul>
              </div>
            )}

            {currentTier === 'good' && totalDoors > 20 && totalDoors <= 25 && (
              <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  💡 Consider: Premium (Better Value Soon)
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  You're at {totalDoors} doors paying ${goodPricing.monthlyPrice}/month. At 26+ doors, Premium becomes better value at $50 base.
                </p>
              </div>
            )}

            {currentTier === 'good' && totalDoors > 25 && (
              <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  ⚠️ Door Limit Exceeded
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  You have {totalDoors} doors but Pro maxes at 25. Upgrade to Premium for up to 100 doors + advanced AI features.
                </p>
              </div>
            )}

            {currentTier === 'better' && totalDoors > 80 && (
              <div className="bg-white rounded-lg p-4 border-2 border-orange-300">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  💡 Suggested: Enterprise (Save Money!)
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  At {totalDoors} doors, you're paying ${betterPricing.monthlyPrice}/month. Enterprise is $299 flat - saving you <strong>${(betterPricing.monthlyPrice - 299).toFixed(2)}/month</strong> plus you get:
                </p>
                <ul className="text-xs text-gray-700 space-y-1 ml-4 list-disc">
                  <li>Multi-user accounts (add team members)</li>
                  <li>Custom AI reporting</li>
                  <li>Dedicated account manager</li>
                  <li>Phone support (4hr response)</li>
                </ul>
              </div>
            )}

            {/* Feature List */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-3">Included Features:</p>
              <ul className="space-y-2">
                {tierConfig.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: tierConfig.color }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card className="mb-6 border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">Full Name</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
                style={{ minHeight: '48px' }}
              />
            </div>

            <div>
              <Label className="mb-2 block">Email Address</Label>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <Input
                  value={formData.email}
                  disabled
                  className="flex-1 bg-gray-100"
                  style={{ minHeight: '48px' }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            <div>
              <Label className="mb-2 block">Phone Number</Label>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-400" />
                <Input
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="flex-1"
                  style={{ minHeight: '48px' }}
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Preferred Contact Method</Label>
              <Select
                value={formData.preferred_contact_method}
                onValueChange={(value) => setFormData({ ...formData, preferred_contact_method: value })}
              >
                <SelectTrigger style={{ minHeight: '48px' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="phone">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      SMS
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData({ ...formData, timezone: value })}
              >
                <SelectTrigger style={{ minHeight: '48px' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving || saveSuccess}
                className="flex-1 gap-2"
                style={{ 
                  backgroundColor: saveSuccess ? '#28A745' : '#1B365D',
                  minHeight: '48px'
                }}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Profile Type */}
        {user?.user_profile_type && (
          <Card className="mb-6 border-2 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Account Type</p>
                  <p className="text-sm text-gray-700 capitalize">
                    {user.user_profile_type === 'homeowner' ? '🏠 Homeowner' : '🏢 Property Investor'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Onboarding Status */}
        <Card className="mb-6 border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  {user?.onboarding_completed ? '✅ Onboarding Complete' : '⏳ Onboarding Pending'}
                </p>
                {user?.onboarding_completed && user?.onboarding_completed_date && (
                  <p className="text-sm text-gray-600">
                    Completed on {new Date(user.onboarding_completed_date).toLocaleDateString()}
                  </p>
                )}
                {user?.onboarding_skipped && (
                  <Badge className="bg-orange-600 text-white mt-2">
                    Previously Skipped
                  </Badge>
                )}
              </div>
              <Button
                onClick={handleRestartOnboarding}
                variant="outline"
                className="gap-2"
                style={{ minHeight: '48px' }}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    {user?.onboarding_completed ? 'Restart Onboarding' : 'Complete Onboarding'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="border-2 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Sign Out</p>
                <p className="text-sm text-gray-600">
                  Log out of your 360° Method account
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="gap-2 text-red-600 border-red-300 hover:bg-red-50"
                style={{ minHeight: '48px' }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
