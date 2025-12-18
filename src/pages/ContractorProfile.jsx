import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Contractor, OperatorContractor } from '@/api/supabaseClient';
import { supabase } from '@/api/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ContractorBottomNav from '../components/contractor/BottomNav';
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Wrench,
  CheckCircle,
  Upload,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

const TRADE_OPTIONS = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Roofing',
  'General Handyman',
  'Painting',
  'Carpentry',
  'Flooring',
  'Drywall',
  'Landscaping'
];

export default function ContractorProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [newZipCode, setNewZipCode] = useState('');

  // Fetch contractor profile
  const { data: contractor, isLoading } = useQuery({
    queryKey: ['contractor-profile', user?.id],
    queryFn: async () => {
      const contractors = await Contractor.filter({ user_id: user?.id });
      return contractors?.[0] || null;
    },
    enabled: !!user?.id
  });

  // Fetch operator connections
  const { data: operatorConnections } = useQuery({
    queryKey: ['contractor-operators', contractor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operator_contractors')
        .select(`
          *,
          operator:operators (
            id,
            company_name
          )
        `)
        .eq('contractor_id', contractor?.id)
        .eq('status', 'active');

      if (error) throw error;
      return data || [];
    },
    enabled: !!contractor?.id
  });

  // Local state for editing
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    trade_types: [],
    trade_specialties: [],
    service_areas: [],
    hourly_rate: 0,
    license_number: '',
    insurance_verified: false
  });

  // Sync profile data when contractor loads
  useEffect(() => {
    if (contractor) {
      setProfileData({
        first_name: contractor.first_name || '',
        last_name: contractor.last_name || '',
        company_name: contractor.company_name || `${contractor.first_name || ''} ${contractor.last_name || ''}`.trim(),
        contact_name: `${contractor.first_name || ''} ${contractor.last_name || ''}`.trim(),
        email: contractor.email || '',
        phone: contractor.phone || '',
        trade_types: contractor.trade_types || [],
        trade_specialties: contractor.trade_types || [], // Use trade_types as specialties
        service_areas: contractor.service_areas || [],
        hourly_rate: contractor.hourly_rate || 0,
        license_number: contractor.license_number || '',
        insurance_verified: contractor.insurance_verified || false
      });
    }
  }, [contractor]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      return await Contractor.update(contractor.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contractor-profile', user?.id]);
      toast.success('Profile updated');
      setEditMode(false);
    },
    onError: () => {
      toast.error('Failed to update profile');
    }
  });

  const handleToggleTrade = (trade) => {
    const updatedTrades = profileData.trade_specialties.includes(trade)
      ? profileData.trade_specialties.filter(t => t !== trade)
      : [...profileData.trade_specialties, trade];
    setProfileData({
      ...profileData,
      trade_types: updatedTrades,
      trade_specialties: updatedTrades
    });
  };

  const handleAddZipCode = () => {
    if (newZipCode.length === 5 && !profileData.service_areas.includes(newZipCode)) {
      setProfileData({
        ...profileData,
        service_areas: [...profileData.service_areas, newZipCode]
      });
      setNewZipCode('');
    }
  };

  const handleRemoveZipCode = (zip) => {
    setProfileData({
      ...profileData,
      service_areas: profileData.service_areas.filter(z => z !== zip)
    });
  };

  const handleSave = () => {
    // Convert to database format
    const saveData = {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      email: profileData.email,
      phone: profileData.phone,
      trade_types: profileData.trade_specialties,
      service_areas: profileData.service_areas,
      hourly_rate: profileData.hourly_rate
    };
    updateProfileMutation.mutate(saveData);
  };

  // Transform operator connections
  const operators = operatorConnections?.map(conn => ({
    id: conn.operator?.id,
    name: conn.operator?.company_name || 'Unknown',
    status: conn.status,
    jobs_completed: conn.jobs_completed || 0
  })) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>
          {!editMode ? (
            <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Basic Info */}
        <Card className="p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name
              </label>
              {editMode ? (
                <Input
                  value={profileData.company_name}
                  onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                />
              ) : (
                <div className="text-gray-900">{profileData.company_name}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Name
              </label>
              {editMode ? (
                <Input
                  value={profileData.contact_name}
                  onChange={(e) => setProfileData({ ...profileData, contact_name: e.target.value })}
                />
              ) : (
                <div className="text-gray-900">{profileData.contact_name}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="flex items-center gap-2 text-gray-900">
                <Mail className="w-4 h-4 text-gray-600" />
                {profileData.email}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>
              {editMode ? (
                <Input
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-900">
                  <Phone className="w-4 h-4 text-gray-600" />
                  {profileData.phone}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Trade Specialties */}
        <Card className="p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Trade Specialties
          </h2>
          {editMode ? (
            <div className="flex flex-wrap gap-2">
              {TRADE_OPTIONS.map(trade => (
                <button
                  key={trade}
                  onClick={() => handleToggleTrade(trade)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    profileData.trade_specialties.includes(trade)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {trade}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profileData.trade_specialties.map(trade => (
                <Badge key={trade} className="bg-blue-100 text-blue-700">
                  {trade}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        {/* Service Areas */}
        <Card className="p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Service Areas
          </h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {profileData.service_areas.map(zip => (
              <Badge key={zip} className="bg-gray-200 text-gray-700">
                {zip}
                {editMode && (
                  <button
                    onClick={() => handleRemoveZipCode(zip)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                )}
              </Badge>
            ))}
          </div>
          {editMode && (
            <div className="flex gap-2">
              <Input
                placeholder="Add zip code"
                value={newZipCode}
                onChange={(e) => setNewZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
              />
              <Button onClick={handleAddZipCode}>Add</Button>
            </div>
          )}
        </Card>

        {/* Credentials */}
        <Card className="p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Credentials
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">License Number</div>
                <div className="font-medium text-gray-900">{profileData.license_number}</div>
              </div>
              {profileData.insurance_verified && (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            {editMode && (
              <Button variant="outline" className="w-full gap-2">
                <Upload className="w-4 h-4" />
                Upload Documents
              </Button>
            )}
          </div>
        </Card>

        {/* Operator Connections */}
        <Card className="p-5">
          <h2 className="font-bold text-gray-900 mb-4">Operator Connections</h2>
          <div className="space-y-3">
            {operators.map(op => (
              <div key={op.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{op.name}</div>
                  <div className="text-sm text-gray-600">
                    {op.jobs_completed} jobs completed
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  Active
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <ContractorBottomNav />
    </div>
  );
}