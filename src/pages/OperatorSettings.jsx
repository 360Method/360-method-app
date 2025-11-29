import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Operator } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import OperatorLayout from '@/components/operator/OperatorLayout';
import EmbedCodeGenerator from '@/components/operator/EmbedCodeGenerator';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Palette,
  Globe,
  Bell,
  Shield,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Upload,
  Save,
  Check,
  AlertCircle,
  Link2,
  Copy,
  ExternalLink,
  Settings,
  Loader2,
  Code,
  User,
  Clock,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

export default function OperatorSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('business');

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

  // Form state
  const [formData, setFormData] = useState({
    business_name: '',
    business_email: '',
    business_phone: '',
    website: '',
    description: '',
    slug: '',
    logo_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#1E40AF',
    // Address
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    // Settings
    auto_respond_leads: true,
    lead_notification_email: true,
    lead_notification_sms: false,
    quote_expiry_days: 14,
    working_hours_start: '08:00',
    working_hours_end: '18:00',
    working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  });

  // Update form when operator data loads
  React.useEffect(() => {
    if (operator) {
      setFormData(prev => ({
        ...prev,
        business_name: operator.business_name || '',
        business_email: operator.business_email || operator.email || '',
        business_phone: operator.business_phone || operator.phone || '',
        website: operator.website || '',
        description: operator.description || '',
        slug: operator.slug || '',
        logo_url: operator.logo_url || '',
        primary_color: operator.primary_color || '#3B82F6',
        secondary_color: operator.secondary_color || '#1E40AF',
        street_address: operator.street_address || '',
        city: operator.city || '',
        state: operator.state || '',
        zip_code: operator.zip_code || '',
        auto_respond_leads: operator.auto_respond_leads ?? true,
        lead_notification_email: operator.lead_notification_email ?? true,
        lead_notification_sms: operator.lead_notification_sms ?? false,
        quote_expiry_days: operator.quote_expiry_days || 14,
        working_hours_start: operator.working_hours_start || '08:00',
        working_hours_end: operator.working_hours_end || '18:00',
        working_days: operator.working_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      }));
    }
  }, [operator]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (operator?.id) {
        return Operator.update(operator.id, data);
      } else {
        return Operator.create({
          ...data,
          user_id: user?.id,
          created_by: user?.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myOperator']);
      toast.success('Settings saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save settings: ' + error.message);
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generate slug from business name
  const generateSlug = () => {
    const slug = formData.business_name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    handleChange('slug', slug);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const baseUrl = window.location.origin;
  const intakeFormUrl = `${baseUrl}/intake/${formData.slug}`;
  const embedFormUrl = `${baseUrl}/embed/${formData.slug}`;

  if (isLoading) {
    return (
      <OperatorLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </OperatorLayout>
    );
  }

  return (
    <OperatorLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Settings
            </h1>
            <p className="text-gray-600">Manage your business profile and preferences</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="gap-2"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
            <TabsTrigger value="business" className="gap-2">
              <Building2 className="w-4 h-4 hidden md:block" />
              Business
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-2">
              <Palette className="w-4 h-4 hidden md:block" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-2">
              <Globe className="w-4 h-4 hidden md:block" />
              Lead Capture
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4 hidden md:block" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="hours" className="gap-2">
              <Clock className="w-4 h-4 hidden md:block" />
              Hours
            </TabsTrigger>
          </TabsList>

          {/* Business Info Tab */}
          <TabsContent value="business">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Business Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <Input
                    value={formData.business_name}
                    onChange={(e) => handleChange('business_name', e.target.value)}
                    placeholder="Your Company LLC"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Business Email
                    </label>
                    <Input
                      type="email"
                      value={formData.business_email}
                      onChange={(e) => handleChange('business_email', e.target.value)}
                      placeholder="contact@yourbusiness.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Business Phone
                    </label>
                    <Input
                      type="tel"
                      value={formData.business_phone}
                      onChange={(e) => handleChange('business_phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Website
                  </label>
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://yourbusiness.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Tell clients about your services, experience, and what makes you unique..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="4"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    Business Address
                  </h3>
                  <div className="space-y-3">
                    <Input
                      value={formData.street_address}
                      onChange={(e) => handleChange('street_address', e.target.value)}
                      placeholder="Street Address"
                    />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Input
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="City"
                        className="col-span-2"
                      />
                      <Input
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        placeholder="State"
                        maxLength={2}
                      />
                      <Input
                        value={formData.zip_code}
                        onChange={(e) => handleChange('zip_code', e.target.value)}
                        placeholder="ZIP"
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                Brand Customization
              </h2>

              <div className="space-y-6">
                {/* URL Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Link2 className="w-4 h-4 inline mr-1" />
                    Custom URL Slug
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center">
                      <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-500">
                        {baseUrl}/intake/
                      </span>
                      <Input
                        value={formData.slug}
                        onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="your-company"
                        className="rounded-l-none"
                      />
                    </div>
                    <Button variant="outline" onClick={generateSlug}>
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This creates your unique lead intake form URL
                  </p>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo
                  </label>
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      {formData.logo_url ? (
                        <img
                          src={formData.logo_url}
                          alt="Logo"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <Upload className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        value={formData.logo_url}
                        onChange={(e) => handleChange('logo_url', e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter a URL to your logo, or upload one (coming soon)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Brand Colors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Colors
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => handleChange('primary_color', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <Input
                          value={formData.primary_color}
                          onChange={(e) => handleChange('primary_color', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Secondary Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.secondary_color}
                          onChange={(e) => handleChange('secondary_color', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <Input
                          value={formData.secondary_color}
                          onChange={(e) => handleChange('secondary_color', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Preview
                  </label>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      {formData.logo_url ? (
                        <img src={formData.logo_url} alt="Logo" className="w-12 h-12 object-contain" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: formData.primary_color }}>
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{formData.business_name || 'Your Business'}</h3>
                        <p className="text-sm text-gray-500">360° Method Certified Operator</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button style={{ backgroundColor: formData.primary_color }} className="text-white">
                        Primary Button
                      </Button>
                      <Button variant="outline" style={{ borderColor: formData.primary_color, color: formData.primary_color }}>
                        Secondary Button
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Lead Capture Tab */}
          <TabsContent value="leads">
            <div className="space-y-6">
              {/* Quick Links */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-blue-600" />
                  Lead Capture Links
                </h2>

                {formData.slug ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lead Intake Form (Full Page)
                      </label>
                      <div className="flex gap-2">
                        <Input value={intakeFormUrl} readOnly className="bg-gray-50" />
                        <Button variant="outline" onClick={() => copyToClipboard(intakeFormUrl)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" onClick={() => window.open(intakeFormUrl, '_blank')}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Embeddable Form (For your website)
                      </label>
                      <div className="flex gap-2">
                        <Input value={embedFormUrl} readOnly className="bg-gray-50" />
                        <Button variant="outline" onClick={() => copyToClipboard(embedFormUrl)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">URL Slug Required</p>
                        <p className="text-sm text-yellow-700">
                          Set your URL slug in the Branding tab to generate your lead capture links.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Embed Code Generator */}
              {formData.slug && (
                <EmbedCodeGenerator operatorSlug={formData.slug} />
              )}

              {/* Lead Settings */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Auto-respond to new leads</p>
                      <p className="text-sm text-gray-500">Send automatic confirmation when leads submit</p>
                    </div>
                    <Switch
                      checked={formData.auto_respond_leads}
                      onCheckedChange={(checked) => handleChange('auto_respond_leads', checked)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quote Expiry (days)
                    </label>
                    <Input
                      type="number"
                      value={formData.quote_expiry_days}
                      onChange={(e) => handleChange('quote_expiry_days', parseInt(e.target.value) || 14)}
                      min={1}
                      max={90}
                      className="w-32"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      How long quotes remain valid after sending
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                Notification Preferences
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive email when new leads come in</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.lead_notification_email}
                    onCheckedChange={(checked) => handleChange('lead_notification_email', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-500">Receive text messages for urgent leads</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.lead_notification_sms}
                    onCheckedChange={(checked) => handleChange('lead_notification_sms', checked)}
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Enable SMS notifications for hot leads to respond faster
                    and win more business. Response time is the #1 factor in lead conversion.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Working Hours Tab */}
          <TabsContent value="hours">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                Working Hours
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <Input
                      type="time"
                      value={formData.working_hours_start}
                      onChange={(e) => handleChange('working_hours_start', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <Input
                      type="time"
                      value={formData.working_hours_end}
                      onChange={(e) => handleChange('working_hours_end', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Working Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                      const isSelected = formData.working_days.includes(day);
                      return (
                        <button
                          key={day}
                          onClick={() => {
                            const newDays = isSelected
                              ? formData.working_days.filter(d => d !== day)
                              : [...formData.working_days, day];
                            handleChange('working_days', newDays);
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Current Schedule:</strong>{' '}
                    {formData.working_days.length > 0
                      ? `${formData.working_days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')} from ${formData.working_hours_start} to ${formData.working_hours_end}`
                      : 'No working days selected'
                    }
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OperatorLayout>
  );
}
