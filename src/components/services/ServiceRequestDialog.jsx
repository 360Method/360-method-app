import React from "react";
import { auth, Property, ServiceRequest, integrations } from "@/api/supabaseClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function ServiceRequestDialog({ open, onClose, prefilledData }) {
  const queryClient = useQueryClient();
  
  // Ensure prefilledData is never null/undefined
  const safePrefilledData = prefilledData || {};
  
  const [formData, setFormData] = React.useState({
    property_id: safePrefilledData.property_id || "",
    task_id: safePrefilledData.task_id || null,
    service_type: safePrefilledData.service_type || "",
    description: safePrefilledData.description || "",
    urgency: safePrefilledData.urgency || "Medium",
    preferred_contact_time: "",
    contact_method: "email",
    contact_value: "",
    availability: {
      weekday_mornings: false,
      weekday_afternoons: false,
      weekends: false
    },
    additional_notes: ""
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => Property.list('-created_date'),
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => auth.me(),
  });

  // Update form data when prefilledData changes and dialog is open
  React.useEffect(() => {
    if (open && prefilledData) {
      const safe = prefilledData || {};
      setFormData(prev => ({
        ...prev,
        property_id: safe.property_id || prev.property_id || "",
        task_id: safe.task_id || null,
        service_type: safe.service_type || prev.service_type || "",
        description: safe.description || prev.description || "",
        urgency: safe.urgency || prev.urgency || "Medium"
      }));
    }
  }, [open, prefilledData]);

  const createServiceRequestMutation = useMutation({
    mutationFn: async (data) => {
      // Validate property_id exists
      if (!data.property_id) {
        throw new Error('Property ID is required');
      }

      const serviceRequest = await ServiceRequest.create({
        property_id: data.property_id,
        task_id: data.task_id,
        service_type: data.service_type,
        description: data.description,
        urgency: data.urgency,
        preferred_contact_time: data.preferred_contact_time,
        photo_urls: safePrefilledData.photo_urls || [],
        status: 'Submitted'
      });

      const property = properties.find(p => p.id === data.property_id);
      const availabilityText = Object.entries(data.availability)
        .filter(([_, value]) => value)
        .map(([key, _]) => {
          if (key === 'weekday_mornings') return 'Weekday mornings (8am-12pm)';
          if (key === 'weekday_afternoons') return 'Weekday afternoons (12pm-5pm)';
          if (key === 'weekends') return 'Weekends';
          return '';
        })
        .join(', ');

      const emailBody = `
NEW SERVICE REQUEST - #${serviceRequest.id}

CUSTOMER INFORMATION:
Name: ${user?.full_name || 'Not provided'}
Email: ${user?.email || 'Not provided'}
Phone: ${data.contact_method === 'phone' || data.contact_method === 'text' ? data.contact_value : 'Not provided'}

PROPERTY:
Address: ${property?.address || 'Not provided'}

SERVICE DETAILS:
Type: ${data.service_type}
Priority: ${data.urgency}
${data.task_id ? `Related Task ID: ${data.task_id}` : ''}

DESCRIPTION:
${data.description}

SCHEDULING:
Preferred Contact: ${data.contact_method === 'email' ? data.contact_value : data.contact_method === 'phone' ? `Phone: ${data.contact_value}` : `Text: ${data.contact_value}`}
Timeline: ${data.preferred_contact_time}
Availability: ${availabilityText || 'Not specified'}

ADDITIONAL NOTES:
${data.additional_notes || 'None'}

${safePrefilledData.photo_urls && safePrefilledData.photo_urls.length > 0 ? `\nPHOTOS:\n${safePrefilledData.photo_urls.join('\n')}` : ''}

---
View in app: [Link to ServiceRequest #${serviceRequest.id}]
      `;

      await integrations.SendEmail({
        from_name: 'Handy Pioneers App',
        to: 'services@handypioneers.com',
        subject: `New Service Request - ${data.urgency} Priority - ${property?.address || 'Property'}`,
        body: emailBody
      });

      return serviceRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate property_id before submission
    if (!formData.property_id) {
      console.error('Cannot submit: property_id is required');
      return;
    }
    
    createServiceRequestMutation.mutate(formData);
  };

  const selectedProperty = properties.find(p => p.id === formData.property_id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/75" />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white" style={{ backgroundColor: '#FFFFFF', opacity: 1 }}>
        <DialogHeader style={{ backgroundColor: '#FFFFFF', opacity: 1 }}>
          <DialogTitle className="text-2xl font-bold" style={{ color: '#1B365D', backgroundColor: 'transparent' }}>
            Request Professional Service
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" style={{ backgroundColor: '#FFFFFF', opacity: 1 }}>
          {/* Service Type */}
          <div>
            <Label>What do you need help with?</Label>
            <Select
              value={formData.service_type}
              onValueChange={(value) => setFormData({ ...formData, service_type: value })}
              required
            >
              <SelectTrigger style={{ backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', minHeight: '48px' }}>
                <SelectValue placeholder="Select service type..." />
              </SelectTrigger>
              <SelectContent className="bg-white" style={{ backgroundColor: '#FFFFFF', opacity: 1 }}>
                <SelectItem value="Professional Baseline Assessment">Complete Property Baseline Documentation</SelectItem>
                <SelectItem value="Seasonal Inspection">Quarterly Property Inspection</SelectItem>
                <SelectItem value="Professional Inspection">Professional Inspection</SelectItem>
                <SelectItem value="Specific Task Repair">Complete This Specific Task</SelectItem>
                <SelectItem value="Multiple Tasks">Multiple Tasks from Priority Queue</SelectItem>
                <SelectItem value="Emergency Repair">Emergency Repair (Something Just Broke)</SelectItem>
                <SelectItem value="Custom Request">Custom Request</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Selection */}
          <div>
            <Label>Property</Label>
            <Select
              value={formData.property_id}
              onValueChange={(value) => setFormData({ ...formData, property_id: value })}
              required
            >
              <SelectTrigger style={{ backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', minHeight: '48px' }}>
                <SelectValue placeholder="Select property..." />
              </SelectTrigger>
              <SelectContent className="bg-white" style={{ backgroundColor: '#FFFFFF', opacity: 1 }}>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pre-filled task details if from Priority Queue */}
          {safePrefilledData.task_id && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" style={{ backgroundColor: '#EFF6FF', opacity: 1 }}>
              <h4 className="font-semibold text-blue-900 mb-2">Task Details (auto-filled)</h4>
              <p className="text-sm text-gray-800 mb-2">
                <strong>System:</strong> {safePrefilledData.system_type || 'General'}
              </p>
              <p className="text-sm text-gray-800 mb-2">
                <strong>Issue:</strong> {safePrefilledData.title}
              </p>
              {safePrefilledData.severity && (
                <Badge className="bg-orange-100 text-orange-800">
                  {safePrefilledData.severity}
                </Badge>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <Label>Describe what you need</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide details about the work needed..."
              rows={4}
              required
              style={{ backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', minHeight: '96px' }}
            />
            {safePrefilledData.notes && (
              <p className="text-xs text-gray-600 mt-1">
                Your notes: "{safePrefilledData.notes}"
              </p>
            )}
          </div>

          {/* Timeline/Urgency */}
          <div>
            <Label>When do you need this done?</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50" style={{ backgroundColor: formData.preferred_contact_time === "ASAP - This is urgent" ? '#F9FAFB' : '#FFFFFF' }}>
                <input
                  type="radio"
                  name="timeline"
                  value="ASAP - This is urgent"
                  checked={formData.preferred_contact_time === "ASAP - This is urgent"}
                  onChange={(e) => {
                    setFormData({ ...formData, preferred_contact_time: e.target.value, urgency: "Emergency" });
                  }}
                />
                <div>
                  <p className="font-medium">ASAP - This is urgent</p>
                  <p className="text-sm text-gray-600">Emergency service</p>
                </div>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50" style={{ backgroundColor: formData.preferred_contact_time === "Within 1 week - High priority" ? '#F9FAFB' : '#FFFFFF' }}>
                <input
                  type="radio"
                  name="timeline"
                  value="Within 1 week - High priority"
                  checked={formData.preferred_contact_time === "Within 1 week - High priority"}
                  onChange={(e) => {
                    setFormData({ ...formData, preferred_contact_time: e.target.value, urgency: "High" });
                  }}
                />
                <div>
                  <p className="font-medium">Within 1 week - High priority</p>
                </div>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50" style={{ backgroundColor: formData.preferred_contact_time === "Within 2-4 weeks - Normal priority" ? '#F9FAFB' : '#FFFFFF' }}>
                <input
                  type="radio"
                  name="timeline"
                  value="Within 2-4 weeks - Normal priority"
                  checked={formData.preferred_contact_time === "Within 2-4 weeks - Normal priority"}
                  onChange={(e) => {
                    setFormData({ ...formData, preferred_contact_time: e.target.value, urgency: "Medium" });
                  }}
                />
                <div>
                  <p className="font-medium">Within 2-4 weeks - Normal priority</p>
                </div>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50" style={{ backgroundColor: formData.preferred_contact_time === "Flexible - When you have availability" ? '#F9FAFB' : '#FFFFFF' }}>
                <input
                  type="radio"
                  name="timeline"
                  value="Flexible - When you have availability"
                  checked={formData.preferred_contact_time === "Flexible - When you have availability"}
                  onChange={(e) => {
                    setFormData({ ...formData, preferred_contact_time: e.target.value, urgency: "Low" });
                  }}
                />
                <div>
                  <p className="font-medium">Flexible - When you have availability</p>
                </div>
              </label>
            </div>
          </div>

          {/* Contact Method */}
          <div>
            <Label>Preferred Contact Method</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="contact"
                  value="email"
                  checked={formData.contact_method === "email"}
                  onChange={(e) => setFormData({ ...formData, contact_method: e.target.value, contact_value: user?.email || '' })}
                />
                <span>Email: {user?.email || 'Not provided'}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="contact"
                  value="phone"
                  checked={formData.contact_method === "phone"}
                  onChange={(e) => setFormData({ ...formData, contact_method: e.target.value })}
                />
                <span>Phone</span>
              </label>
              {formData.contact_method === "phone" && (
                <Input
                  type="tel"
                  value={formData.contact_value}
                  onChange={(e) => setFormData({ ...formData, contact_value: e.target.value })}
                  placeholder="(360) 555-1234"
                  className="ml-6"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', minHeight: '48px' }}
                />
              )}
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="contact"
                  value="text"
                  checked={formData.contact_method === "text"}
                  onChange={(e) => setFormData({ ...formData, contact_method: e.target.value })}
                />
                <span>Text</span>
              </label>
              {formData.contact_method === "text" && (
                <Input
                  type="tel"
                  value={formData.contact_value}
                  onChange={(e) => setFormData({ ...formData, contact_value: e.target.value })}
                  placeholder="(360) 555-1234"
                  className="ml-6"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', minHeight: '48px' }}
                />
              )}
            </div>
          </div>

          {/* Availability */}
          <div>
            <Label>Best time to reach you</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.availability.weekday_mornings}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    availability: { ...formData.availability, weekday_mornings: checked }
                  })}
                />
                <span>Weekday mornings (8am-12pm)</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.availability.weekday_afternoons}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    availability: { ...formData.availability, weekday_afternoons: checked }
                  })}
                />
                <span>Weekday afternoons (12pm-5pm)</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.availability.weekends}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    availability: { ...formData.availability, weekends: checked }
                  })}
                />
                <span>Weekends</span>
              </label>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <Label>Additional Notes (optional)</Label>
            <Textarea
              value={formData.additional_notes}
              onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
              placeholder="Gate codes, parking instructions, pet information, etc."
              rows={3}
              style={{ backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', minHeight: '72px' }}
            />
          </div>

          {/* What Happens Next */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4" style={{ backgroundColor: '#F0FDF4', opacity: 1 }}>
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              What happens next:
            </h4>
            <ol className="text-sm text-gray-800 space-y-1 ml-6 list-decimal">
              <li>We'll review your request within 4 business hours</li>
              <li>Contact you to confirm details and schedule</li>
              <li>Provide estimate before starting work</li>
              <li>Complete the work and update your app with photos</li>
            </ol>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#1B365D', color: '#1B365D', minHeight: '48px' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createServiceRequestMutation.isPending || !formData.property_id}
              className="flex-1"
              style={{ backgroundColor: '#28A745', color: '#FFFFFF', minHeight: '48px' }}
            >
              {createServiceRequestMutation.isPending ? 'Submitting...' : 'Submit Service Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}