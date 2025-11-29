import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Operator, ServicePackage } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import OperatorLayout from '@/components/operator/OperatorLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Building2,
  Upload,
  Plus,
  X,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Star,
  ExternalLink,
  Loader2,
  Save,
  Eye,
  Award,
  Clock,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

export default function OperatorMarketplaceProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch operator data
  const { data: operator, isLoading } = useQuery({
    queryKey: ['myOperator', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operators')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch service packages
  const { data: servicePackages = [] } = useQuery({
    queryKey: ['operator-packages', operator?.id],
    queryFn: async () => {
      try {
        return await ServicePackage.filter({ operator_id: operator.id });
      } catch {
        return [];
      }
    },
    enabled: !!operator?.id
  });

  const [profileData, setProfileData] = useState({
    business_name: '',
    description: '',
    logo_url: '',
    cover_photo_url: '',
    service_areas: [],
    certifications: [],
    is_marketplace_listed: false,
    years_experience: '',
    specialties: [],
    response_time_hours: 24
  });

  const [packages, setPackages] = useState([]);

  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    price: '',
    frequency: 'monthly'
  });

  const [newZipCode, setNewZipCode] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');

  // Load operator data into form
  useEffect(() => {
    if (operator) {
      setProfileData({
        business_name: operator.business_name || '',
        description: operator.description || '',
        logo_url: operator.logo_url || '',
        cover_photo_url: operator.cover_photo_url || '',
        service_areas: operator.service_areas || [],
        certifications: operator.certifications || [],
        is_marketplace_listed: operator.is_marketplace_listed || false,
        years_experience: operator.years_experience || '',
        specialties: operator.specialties || [],
        response_time_hours: operator.response_time_hours || 24
      });
    }
  }, [operator]);

  // Load service packages
  useEffect(() => {
    if (servicePackages.length > 0) {
      setPackages(servicePackages);
    }
  }, [servicePackages]);

  // Update operator mutation
  const updateOperatorMutation = useMutation({
    mutationFn: async (data) => {
      return Operator.update(operator.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myOperator']);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + error.message);
    }
  });

  // Add package mutation
  const addPackageMutation = useMutation({
    mutationFn: async (packageData) => {
      return ServicePackage.create({
        ...packageData,
        operator_id: operator.id,
        price: parseFloat(packageData.price)
      });
    },
    onSuccess: (newPkg) => {
      setPackages([...packages, newPkg]);
      setNewPackage({ name: '', description: '', price: '', frequency: 'monthly' });
      queryClient.invalidateQueries(['operator-packages']);
      toast.success('Package added');
    },
    onError: (error) => {
      toast.error('Failed to add package: ' + error.message);
    }
  });

  // Delete package mutation
  const deletePackageMutation = useMutation({
    mutationFn: async (packageId) => {
      return ServicePackage.delete(packageId);
    },
    onSuccess: (_, packageId) => {
      setPackages(packages.filter(p => p.id !== packageId));
      queryClient.invalidateQueries(['operator-packages']);
      toast.success('Package removed');
    }
  });

  const handleAddPackage = () => {
    if (!newPackage.name || !newPackage.price) {
      toast.error('Package name and price are required');
      return;
    }
    addPackageMutation.mutate(newPackage);
  };

  const handleRemovePackage = (packageId) => {
    deletePackageMutation.mutate(packageId);
  };

  const handleAddZipCode = () => {
    if (newZipCode.length !== 5) {
      toast.error('Please enter a valid 5-digit zip code');
      return;
    }
    if (profileData.service_areas.includes(newZipCode)) {
      toast.error('This zip code is already added');
      return;
    }
    setProfileData({
      ...profileData,
      service_areas: [...profileData.service_areas, newZipCode]
    });
    setNewZipCode('');
  };

  const handleRemoveZipCode = (zipCode) => {
    setProfileData({
      ...profileData,
      service_areas: profileData.service_areas.filter(z => z !== zipCode)
    });
  };

  const handleAddSpecialty = () => {
    if (!newSpecialty.trim()) return;
    if (profileData.specialties.includes(newSpecialty.trim())) {
      toast.error('Specialty already added');
      return;
    }
    setProfileData({
      ...profileData,
      specialties: [...profileData.specialties, newSpecialty.trim()]
    });
    setNewSpecialty('');
  };

  const handleToggleListing = () => {
    if (!profileData.is_marketplace_listed && !canActivateListing()) {
      toast.error('Complete all required fields before activating your listing');
      return;
    }
    setProfileData({ ...profileData, is_marketplace_listed: !profileData.is_marketplace_listed });
  };

  const canActivateListing = () => {
    return profileData.business_name &&
           profileData.description &&
           packages.length > 0 &&
           profileData.service_areas.length > 0;
  };

  const handleSave = () => {
    updateOperatorMutation.mutate(profileData);
  };

  if (isLoading) {
    return (
      <OperatorLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </OperatorLayout>
    );
  }

  if (!operator) {
    return (
      <OperatorLayout>
        <div className="p-6 max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Set Up Your Business First</h2>
            <p className="text-gray-600 mb-4">
              Configure your business settings before creating your marketplace profile.
            </p>
            <Button onClick={() => window.location.href = '/OperatorSettings'}>
              Go to Settings
            </Button>
          </Card>
        </div>
      </OperatorLayout>
    );
  }

  return (
    <OperatorLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              Marketplace Profile
            </h1>
            <p className="text-gray-600">Manage your public listing and attract new clients</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateOperatorMutation.isPending}
            className="gap-2"
          >
            {updateOperatorMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        </div>

        {/* Listing Status */}
        <Card className={`p-6 mb-6 ${profileData.is_marketplace_listed ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profileData.is_marketplace_listed ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-gray-400" />
              )}
              <div>
                <div className="font-bold text-gray-900">
                  {profileData.is_marketplace_listed ? 'Listed on Marketplace' : 'Not Listed'}
                </div>
                <div className="text-sm text-gray-600">
                  {profileData.is_marketplace_listed
                    ? 'Property owners can find and hire you'
                    : canActivateListing()
                      ? 'Ready to activate your listing'
                      : 'Complete your profile to activate'
                  }
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {profileData.is_marketplace_listed && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
              )}
              <Switch
                checked={profileData.is_marketplace_listed}
                onCheckedChange={handleToggleListing}
                disabled={!profileData.is_marketplace_listed && !canActivateListing()}
              />
            </div>
          </div>
        </Card>

        {/* Company Info */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Company Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <Input
                value={profileData.business_name}
                onChange={(e) => setProfileData({ ...profileData, business_name: e.target.value })}
                placeholder="Your Company LLC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={profileData.description}
                onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                placeholder="Tell property owners about your services, experience, and what makes you unique..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="4"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Response Time (hours)
                </label>
                <Input
                  type="number"
                  value={profileData.response_time_hours}
                  onChange={(e) => setProfileData({ ...profileData, response_time_hours: parseInt(e.target.value) || 24 })}
                  min={1}
                  max={72}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Award className="w-4 h-4 inline mr-1" />
                  Years of Experience
                </label>
                <Input
                  type="number"
                  value={profileData.years_experience}
                  onChange={(e) => setProfileData({ ...profileData, years_experience: e.target.value })}
                  placeholder="5"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <Input
                  value={profileData.logo_url}
                  onChange={(e) => setProfileData({ ...profileData, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Photo URL
                </label>
                <Input
                  value={profileData.cover_photo_url}
                  onChange={(e) => setProfileData({ ...profileData, cover_photo_url: e.target.value })}
                  placeholder="https://example.com/cover.jpg"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Specialties */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Specialties
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {profileData.specialties.map((specialty, index) => (
              <Badge key={index} variant="secondary" className="gap-1 pr-1">
                {specialty}
                <button
                  onClick={() => setProfileData({
                    ...profileData,
                    specialties: profileData.specialties.filter((_, i) => i !== index)
                  })}
                  className="ml-1 hover:bg-gray-300 rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., HVAC, Plumbing, Electrical"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSpecialty()}
            />
            <Button onClick={handleAddSpecialty} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </Card>

        {/* Service Packages */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Service Packages *
          </h2>

          {/* Existing Packages */}
          <div className="space-y-3 mb-4">
            {packages.map(pkg => (
              <div key={pkg.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{pkg.name}</div>
                  <div className="text-sm text-gray-600 mb-1">{pkg.description}</div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-green-100 text-green-800">
                      ${pkg.price}/{pkg.frequency || 'monthly'}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePackage(pkg.id)}
                  disabled={deletePackageMutation.isPending}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {packages.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                No packages yet. Add at least one service package.
              </div>
            )}
          </div>

          {/* Add New Package */}
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <Input
                placeholder="Package name"
                value={newPackage.name}
                onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Price"
                  value={newPackage.price}
                  onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                />
                <select
                  value={newPackage.frequency}
                  onChange={(e) => setNewPackage({ ...newPackage, frequency: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                  <option value="one-time">One-time</option>
                </select>
              </div>
            </div>
            <Input
              placeholder="Package description"
              value={newPackage.description}
              onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
            />
            <Button
              onClick={handleAddPackage}
              variant="outline"
              className="w-full gap-2"
              disabled={addPackageMutation.isPending}
            >
              {addPackageMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add Package
            </Button>
          </div>
        </Card>

        {/* Service Areas */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            Service Areas *
          </h2>

          {/* Current Zip Codes */}
          <div className="flex flex-wrap gap-2 mb-4">
            {profileData.service_areas.map(zip => (
              <Badge key={zip} className="gap-1 pr-1 bg-blue-100 text-blue-800">
                {zip}
                <button
                  onClick={() => handleRemoveZipCode(zip)}
                  className="ml-1 hover:bg-blue-200 rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {profileData.service_areas.length === 0 && (
              <span className="text-gray-500 text-sm">No service areas added yet</span>
            )}
          </div>

          {/* Add Zip Code */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter zip code"
              value={newZipCode}
              onChange={(e) => setNewZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              maxLength={5}
              onKeyPress={(e) => e.key === 'Enter' && handleAddZipCode()}
            />
            <Button onClick={handleAddZipCode} className="gap-2">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </Card>

        {/* Completion Checklist */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Profile Completion
          </h2>
          <div className="space-y-3">
            <CheckItem checked={!!profileData.business_name} label="Company name added" />
            <CheckItem checked={!!profileData.description && profileData.description.length > 50} label="Description added (50+ characters)" />
            <CheckItem checked={!!profileData.logo_url} label="Logo uploaded" />
            <CheckItem checked={packages.length > 0} label="At least one service package" />
            <CheckItem checked={profileData.service_areas.length > 0} label="Service areas defined" />
            <CheckItem checked={profileData.specialties.length > 0} label="Specialties listed" />
          </div>

          {canActivateListing() && !profileData.is_marketplace_listed && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                Your profile is ready! Toggle the switch above to go live on the marketplace.
              </p>
            </div>
          )}
        </Card>
      </div>
    </OperatorLayout>
  );
}

// Helper component for completion checklist
function CheckItem({ checked, label }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
        checked ? 'bg-green-500' : 'bg-gray-200'
      }`}>
        {checked && <CheckCircle className="w-4 h-4 text-white" />}
      </div>
      <span className={checked ? 'text-gray-900' : 'text-gray-500'}>
        {label}
      </span>
    </div>
  );
}
