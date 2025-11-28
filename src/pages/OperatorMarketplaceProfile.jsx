import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Operator } from '@/api/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Upload,
  Plus,
  X,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

export default function OperatorMarketplaceProfile() {
  const [profileData, setProfileData] = useState({
    company_name: '',
    description: '',
    logo_url: '',
    cover_photo_url: '',
    service_packages: [],
    service_areas: [],
    certifications: [],
    is_listed: false
  });

  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    price: '',
    frequency: 'monthly'
  });

  const [newZipCode, setNewZipCode] = useState('');

  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: (data) => Operator.update('operator_id', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator'] });
      toast.success('Profile updated successfully');
    }
  });

  const handleAddPackage = () => {
    if (!newPackage.name || !newPackage.price) {
      toast.error('Package name and price are required');
      return;
    }
    setProfileData({
      ...profileData,
      service_packages: [...profileData.service_packages, { ...newPackage, id: Date.now().toString() }]
    });
    setNewPackage({ name: '', description: '', price: '', frequency: 'monthly' });
  };

  const handleRemovePackage = (packageId) => {
    setProfileData({
      ...profileData,
      service_packages: profileData.service_packages.filter(p => p.id !== packageId)
    });
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

  const handleToggleListing = () => {
    if (!profileData.is_listed && !canActivateListing()) {
      toast.error('Complete all required fields before activating your listing');
      return;
    }
    setProfileData({ ...profileData, is_listed: !profileData.is_listed });
  };

  const canActivateListing = () => {
    return profileData.company_name &&
           profileData.description &&
           profileData.service_packages.length > 0 &&
           profileData.service_areas.length > 0;
  };

  const handleSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Marketplace Profile
          </h1>
          <p className="text-gray-600">
            Manage your public listing and attract new clients
          </p>
        </div>

        {/* Listing Status */}
        <Card className={`p-6 mb-6 ${profileData.is_listed ? 'border-green-500' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profileData.is_listed ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-gray-400" />
              )}
              <div>
                <div className="font-bold text-gray-900">
                  {profileData.is_listed ? 'Listed on Marketplace' : 'Not Listed'}
                </div>
                <div className="text-sm text-gray-600">
                  {profileData.is_listed 
                    ? 'Your profile is visible to property owners'
                    : canActivateListing()
                      ? 'Ready to activate your listing'
                      : 'Complete your profile to activate'
                  }
                </div>
              </div>
            </div>
            <Button
              onClick={handleToggleListing}
              variant={profileData.is_listed ? 'outline' : 'default'}
              disabled={!profileData.is_listed && !canActivateListing()}
            >
              {profileData.is_listed ? 'Deactivate' : 'Activate Listing'}
            </Button>
          </div>
        </Card>

        {/* Company Info */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name *
              </label>
              <Input
                value={profileData.company_name}
                onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                placeholder="Your Company LLC"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={profileData.description}
                onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                placeholder="Tell property owners about your services, experience, and what makes you unique..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                rows="4"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Logo
                </label>
                <Button variant="outline" className="w-full gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </Button>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cover Photo
                </label>
                <Button variant="outline" className="w-full gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Cover
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Service Packages */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Service Packages *
          </h2>
          
          {/* Existing Packages */}
          <div className="space-y-3 mb-4">
            {profileData.service_packages.map(pkg => (
              <div key={pkg.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{pkg.name}</div>
                  <div className="text-sm text-gray-600 mb-1">{pkg.description}</div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge>${pkg.price}/{pkg.frequency}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePackage(pkg.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
            <Button onClick={handleAddPackage} variant="outline" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add Package
            </Button>
          </div>
        </Card>

        {/* Service Areas */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Service Areas *
          </h2>
          
          {/* Current Zip Codes */}
          <div className="flex flex-wrap gap-2 mb-4">
            {profileData.service_areas.map(zip => (
              <Badge key={zip} className="gap-1 pr-1">
                {zip}
                <button
                  onClick={() => handleRemoveZipCode(zip)}
                  className="ml-1 hover:bg-gray-200 rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* Add Zip Code */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter zip code"
              value={newZipCode}
              onChange={(e) => setNewZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              maxLength={5}
            />
            <Button onClick={handleAddZipCode} className="gap-2">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button 
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
            className="flex-1"
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}