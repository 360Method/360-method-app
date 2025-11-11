import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Crown, Loader2, Home, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Waitlist() {
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    zip_code: '',
    region: '',
    property_type: 'homecare',
    door_count: 1,
    service_tier: 'undecided',
    notes: '',
    source: 'waitlist_page'
  });

  // Get params from URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const zip = params.get('zip');
    const area = params.get('area');
    
    if (zip) {
      setFormData(prev => ({ ...prev, zip_code: zip, region: area || '' }));
    }
  }, []);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Pre-fill from user if available
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.full_name?.split(' ')[0] || '',
        last_name: user.full_name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        zip_code: prev.zip_code || user.location_zip || ''
      }));
    }
  }, [user]);

  const submitWaitlistMutation = useMutation({
    mutationFn: (data) => base44.entities.Waitlist.create(data),
    onSuccess: () => {
      setSubmitted(true);
      // Send confirmation email
      base44.integrations.Core.SendEmail({
        from_name: '360° Method',
        to: formData.email,
        subject: 'You\'re on the Waitlist! 🎉',
        body: `
Hi ${formData.first_name},

Thank you for joining the 360° Method waitlist!

We'll notify you as soon as professional services launch in ${formData.region || 'your area'}.

What's Next:
✓ You're on the priority list for ${formData.region}
✓ We'll email you when service launches
✓ Waitlist members get exclusive launch pricing
✓ In the meantime, use Command Center software FREE!

Service You're Interested In:
${formData.property_type === 'homecare' ? 'HomeCare (Primary Residence)' : `PropertyCare (${formData.door_count} doors)`}
Tier: ${formData.service_tier === 'undecided' ? 'Not decided yet' : formData.service_tier}

Start using 360° Command Center today:
${window.location.origin}${createPageUrl('Properties')}

Questions? Reply to this email anytime.

Best regards,
The 360° Method Team

---
Powered by 360° Method
        `
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitWaitlistMutation.mutate(formData);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mobile-container md:max-w-4xl md:mx-auto pt-8">
          <Card className="border-2 border-green-300 bg-green-50">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
              
              <h1 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '28px' }}>
                You're on the Waitlist! 🎉
              </h1>
              
              <p className="text-gray-700 mb-4 text-lg">
                We'll notify you as soon as professional services launch in {formData.region || 'your area'}.
              </p>

              <div className="bg-white rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                <p className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                  What happens next:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ You're on the priority list for {formData.region}</li>
                  <li>✓ We'll email you when service launches</li>
                  <li>✓ Waitlist members get exclusive launch pricing</li>
                  <li>✓ In the meantime, use Command Center FREE!</li>
                </ul>
              </div>

              <div className="flex flex-col md:flex-row gap-3 max-w-md mx-auto">
                <Button
                  asChild
                  className="flex-1 font-bold"
                  style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                >
                  <Link to={createPageUrl('Properties')}>
                    Start Using Command Center Free
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1"
                  style={{ minHeight: '48px' }}
                >
                  <Link to={createPageUrl('Dashboard')}>
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-4xl md:mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4" style={{ backgroundColor: '#8B5CF6' }}>
            JOIN WAITLIST
          </Badge>
          <h1 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '32px' }}>
            Join the Waitlist
          </h1>
          <p className="text-gray-600 text-lg">
            Be first to know when 360° services launch in your area
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Form - Left Side */}
          <Card className="md:col-span-3 border-2 border-purple-300">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">First Name *</Label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                      className="mt-2"
                      style={{ minHeight: '48px' }}
                    />
                  </div>
                  <div>
                    <Label className="font-semibold">Last Name *</Label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                      className="mt-2"
                      style={{ minHeight: '48px' }}
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="mt-2"
                      style={{ minHeight: '48px' }}
                    />
                  </div>
                  <div>
                    <Label className="font-semibold">Phone (Optional)</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(360) 555-1234"
                      className="mt-2"
                      style={{ minHeight: '48px' }}
                    />
                  </div>
                </div>

                {/* ZIP & Region */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">ZIP Code *</Label>
                    <Input
                      value={formData.zip_code}
                      onChange={(e) => setFormData({ ...formData, zip_code: e.target.value.slice(0, 5) })}
                      required
                      maxLength="5"
                      className="mt-2"
                      style={{ minHeight: '48px' }}
                    />
                  </div>
                  <div>
                    <Label className="font-semibold">Region/City</Label>
                    <Input
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      placeholder="Portland, OR"
                      className="mt-2"
                      style={{ minHeight: '48px' }}
                    />
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <Label className="font-semibold">Property Type *</Label>
                  <Select
                    value={formData.property_type}
                    onValueChange={(value) => setFormData({ ...formData, property_type: value })}
                  >
                    <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="homecare">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4" />
                          <span>Primary Residence (HomeCare)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="propertycare">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>Rental Property (PropertyCare)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Door Count if PropertyCare */}
                {formData.property_type === 'propertycare' && (
                  <div>
                    <Label className="font-semibold">Number of Doors</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.door_count}
                      onChange={(e) => setFormData({ ...formData, door_count: parseInt(e.target.value) || 1 })}
                      className="mt-2"
                      style={{ minHeight: '48px' }}
                    />
                  </div>
                )}

                {/* Service Tier */}
                <div>
                  <Label className="font-semibold">Which service interests you?</Label>
                  <Select
                    value={formData.service_tier}
                    onValueChange={(value) => setFormData({ ...formData, service_tier: value })}
                  >
                    <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="essential">Essential ($124/month)</SelectItem>
                      <SelectItem value="premium">Premium ($183/month) - Most Popular</SelectItem>
                      <SelectItem value="elite">Elite ($233/month)</SelectItem>
                      <SelectItem value="undecided">Not sure yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div>
                  <Label className="font-semibold">Questions or Notes (Optional)</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any questions or details you'd like to share?"
                    className="mt-2 h-24"
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={submitWaitlistMutation.isPending}
                  className="w-full font-bold"
                  style={{ backgroundColor: '#8B5CF6', minHeight: '56px' }}
                >
                  {submitWaitlistMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Crown className="w-5 h-5 mr-2" />
                      Join Waitlist
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Sidebar - Right Side */}
          <div className="md:col-span-2 space-y-4">
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardContent className="p-4">
                <h3 className="font-bold mb-3" style={{ color: '#1B365D' }}>
                  What You'll Get:
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Priority booking when we launch</li>
                  <li>✓ Exclusive launch discount</li>
                  <li>✓ Early access notification</li>
                  <li>✓ Free Command Center in the meantime</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-300 bg-green-50">
              <CardContent className="p-4">
                <h3 className="font-bold mb-3" style={{ color: '#1B365D' }}>
                  Use Software Now:
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Don't wait! Start using 360° Command Center today for FREE.
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full border-green-600 text-green-700"
                >
                  <Link to={createPageUrl('Properties')}>
                    Start Free
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardContent className="p-4">
                <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '16px' }}>
                  Questions?
                </h3>
                <p className="text-xs text-gray-600">
                  Email us anytime at support@360method.com
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}