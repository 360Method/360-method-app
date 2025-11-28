import React from "react";
import { auth } from "@/api/supabaseClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function OperatorContactDialog({ operator, serviceTier, onClose }) {
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    zip_code: '',
    service_type: 'homecare',
    tier: serviceTier || 'premium',
    property_count: '1',
    message: '',
    preferred_contact: 'phone'
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => auth.me(),
  });

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        zip_code: user.location_zip || ''
      }));
    }
  }, [user]);

  const contactOperatorMutation = useMutation({
    mutationFn: async (data) => {
      // Send email to operator
      await base44.integrations.Core.SendEmail({
        from_name: '360° Command Center',
        to: operator.email,
        subject: `New Service Inquiry from ${data.name}`,
        body: `
NEW SERVICE INQUIRY

Operator: ${operator.company_name}

Customer Details:
- Name: ${data.name}
- Email: ${data.email}
- Phone: ${data.phone}
- ZIP Code: ${data.zip_code}

Service Request:
- Service Type: ${data.service_type === 'homecare' ? 'HomeCare' : 'PropertyCare'}
- Tier: ${data.tier}
- Property Count: ${data.property_count}
- Preferred Contact Method: ${data.preferred_contact}

Message:
${data.message || 'No additional message provided'}

---
This inquiry was submitted via 360° Command Center.
Please respond within 24 hours.
        `
      });

      // Send confirmation to customer
      await base44.integrations.Core.SendEmail({
        from_name: operator.company_name,
        to: data.email,
        subject: `Service Inquiry Received - ${operator.company_name}`,
        body: `
Hi ${data.name},

Thank you for your interest in our ${data.service_type === 'homecare' ? 'HomeCare' : 'PropertyCare'} service!

We've received your inquiry and will contact you within 24 hours via ${data.preferred_contact}.

Service Details:
- Tier: ${data.tier}
- Properties: ${data.property_count}

In the meantime, feel free to visit our website or call us directly:
${operator.website ? `Website: ${operator.website}` : ''}
Phone: ${operator.phone}

Best regards,
${operator.company_name}

---
Powered by 360° Method
        `
      });
    },
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    contactOperatorMutation.mutate(formData);
  };

  if (submitted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-600" />
              Inquiry Sent!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-700 mb-4">
              Your inquiry has been sent to <strong>{operator.company_name}</strong>.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              They'll contact you within 24 hours via {formData.preferred_contact}.
            </p>
            <Button
              onClick={onClose}
              className="w-full"
              style={{ backgroundColor: '#28A745', minHeight: '48px' }}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ color: '#1B365D' }}>
            Contact {operator.company_name}
          </DialogTitle>
          <DialogDescription>
            Fill out this form and they'll reach out within 24 hours
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
            </div>
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
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Phone *</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="(360) 555-1234"
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
            </div>
            <div>
              <Label className="font-semibold">ZIP Code *</Label>
              <Input
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                required
                maxLength="5"
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>

          {/* Service Details */}
          <div>
            <Label className="font-semibold">Service Type *</Label>
            <Select
              value={formData.service_type}
              onValueChange={(value) => setFormData({ ...formData, service_type: value })}
            >
              <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="homecare">HomeCare (Primary Residence)</SelectItem>
                <SelectItem value="propertycare">PropertyCare (Rentals)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Service Tier *</Label>
              <Select
                value={formData.tier}
                onValueChange={(value) => setFormData({ ...formData, tier: value })}
              >
                <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="essential">Essential</SelectItem>
                  <SelectItem value="premium">Premium (Most Popular)</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-semibold">
                {formData.service_type === 'homecare' ? 'Properties' : 'Doors/Units'}
              </Label>
              <Input
                type="number"
                min="1"
                value={formData.property_count}
                onChange={(e) => setFormData({ ...formData, property_count: e.target.value })}
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>

          <div>
            <Label className="font-semibold">Preferred Contact Method</Label>
            <Select
              value={formData.preferred_contact}
              onValueChange={(value) => setFormData({ ...formData, preferred_contact: value })}
            >
              <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="either">Either</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-semibold">Message (Optional)</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Any specific questions or details you'd like to share?"
              className="mt-2 h-24"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={contactOperatorMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              style={{ backgroundColor: '#1B365D' }}
              disabled={contactOperatorMutation.isPending}
            >
              {contactOperatorMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Inquiry'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}