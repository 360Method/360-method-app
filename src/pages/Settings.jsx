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
  Crown
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

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

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
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
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    updateUserMutation.mutate(formData);
  };

  const handleRestartOnboarding = async () => {
    try {
      await updateUserMutation.mutateAsync({
        onboarding_completed: false,
        onboarding_skipped: false
      });
      // Force refetch to ensure state is updated
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      // Use navigate instead of window.location
      navigate(createPageUrl("Onboarding"));
    } catch (error) {
      console.error("Failed to restart onboarding:", error);
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const tierInfo = {
    apprentice: {
      name: "360 Home Apprentice",
      color: "blue",
      icon: "🏠",
      propertyLimit: 1
    },
    pro: {
      name: "360 Home Pro",
      color: "purple",
      icon: "⭐",
      propertyLimit: 5
    },
    commander: {
      name: "360 Commander",
      color: "gold",
      icon: "👑",
      propertyLimit: "Unlimited"
    }
  };

  const currentTier = user?.subscription_tier || "apprentice";
  const tierDetails = tierInfo[currentTier];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
            Settings
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your account and preferences
          </p>
        </div>

        {/* Current Tier */}
        <Card className={`mb-6 border-2 ${
          currentTier === 'commander' ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50' :
          currentTier === 'pro' ? 'border-purple-300 bg-purple-50' :
          'border-blue-300 bg-blue-50'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{tierDetails.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold" style={{ color: '#1B365D' }}>
                      {tierDetails.name}
                    </h3>
                    {currentTier === 'commander' && <Crown className="w-5 h-5 text-yellow-600" />}
                  </div>
                  <p className="text-sm text-gray-600">
                    {typeof tierDetails.propertyLimit === 'number' 
                      ? `Up to ${tierDetails.propertyLimit} ${tierDetails.propertyLimit === 1 ? 'property' : 'properties'}`
                      : tierDetails.propertyLimit + ' properties'
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Currently managing: <strong>{properties.length}</strong> {properties.length === 1 ? 'property' : 'properties'}
                  </p>
                </div>
              </div>
              {currentTier !== 'commander' && (
                <Button
                  asChild
                  variant="outline"
                  className="gap-2"
                >
                  <Link to={createPageUrl("Pricing")}>
                    <Sparkles className="w-4 h-4" />
                    Upgrade Plan
                  </Link>
                </Button>
              )}
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