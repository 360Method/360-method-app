import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const PROPERTY_TYPES = [
  "Single-Family Home",
  "Duplex",
  "Triplex",
  "Fourplex",
  "Small Multi-Family (5-12 units)",
  "Apartment Building (13+ units)",
  "Condo/Townhouse",
  "Mobile/Manufactured Home"
];

const CLIMATE_ZONES = [
  "Pacific Northwest",
  "Northeast",
  "Southeast",
  "Midwest",
  "Southwest",
  "Mountain West"
];

export default function PropertyEditDialog({ property, onClose }) {
  const [formData, setFormData] = React.useState({
    property_type: property.property_type || "",
    door_count: property.door_count || 1,
    year_built: property.year_built || "",
    square_footage: property.square_footage || "",
    bedrooms: property.bedrooms || "",
    bathrooms: property.bathrooms || "",
    climate_zone: property.climate_zone || "Pacific Northwest",
    current_value: property.current_value || "",
    monthly_rent: property.monthly_rent || "",
    property_manager: property.property_manager || "",
    insurance_provider: property.insurance_provider || "",
    insurance_policy: property.insurance_policy || ""
  });

  const queryClient = useQueryClient();

  const updatePropertyMutation = useMutation({
    mutationFn: (data) => {
      const cleanedData = { ...data };
      
      const numericFields = [
        'year_built', 'square_footage', 'bedrooms', 'bathrooms',
        'current_value', 'monthly_rent', 'door_count'
      ];
      
      numericFields.forEach(field => {
        if (cleanedData[field] === '' || cleanedData[field] === null) {
          delete cleanedData[field];
        } else if (cleanedData[field] !== undefined) {
          cleanedData[field] = Number(cleanedData[field]);
        }
      });
      
      return base44.entities.Property.update(property.id, cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePropertyMutation.mutate(formData);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ color: '#1B365D' }}>Edit Property</DialogTitle>
          <DialogDescription>
            {property.address}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Type */}
          <div>
            <Label className="font-semibold">Property Type</Label>
            <Select
              value={formData.property_type}
              onValueChange={(value) => updateField('property_type', value)}
            >
              <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Door Count */}
          <div>
            <Label className="font-semibold">Number of Doors/Units</Label>
            <Input
              type="number"
              value={formData.door_count}
              onChange={(e) => updateField('door_count', e.target.value)}
              min="1"
              className="mt-2"
              style={{ minHeight: '48px' }}
            />
          </div>

          {/* Basic Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Year Built</Label>
              <Input
                type="number"
                value={formData.year_built}
                onChange={(e) => updateField('year_built', e.target.value)}
                placeholder="1985"
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
            </div>
            <div>
              <Label className="font-semibold">Square Footage</Label>
              <Input
                type="number"
                value={formData.square_footage}
                onChange={(e) => updateField('square_footage', e.target.value)}
                placeholder="2000"
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Bedrooms</Label>
              <Input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => updateField('bedrooms', e.target.value)}
                placeholder="3"
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
            </div>
            <div>
              <Label className="font-semibold">Bathrooms</Label>
              <Input
                type="number"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => updateField('bathrooms', e.target.value)}
                placeholder="2"
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>

          {/* Climate Zone */}
          <div>
            <Label className="font-semibold">Climate Zone</Label>
            <Select
              value={formData.climate_zone}
              onValueChange={(value) => updateField('climate_zone', value)}
            >
              <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {CLIMATE_ZONES.map((zone) => (
                  <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Financial Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Current Value</Label>
              <Input
                type="number"
                value={formData.current_value}
                onChange={(e) => updateField('current_value', e.target.value)}
                placeholder="425000"
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
            </div>
            <div>
              <Label className="font-semibold">Monthly Rent</Label>
              <Input
                type="number"
                value={formData.monthly_rent}
                onChange={(e) => updateField('monthly_rent', e.target.value)}
                placeholder="2400"
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>

          {/* Management Info */}
          <div>
            <Label className="font-semibold">Property Manager</Label>
            <Input
              value={formData.property_manager}
              onChange={(e) => updateField('property_manager', e.target.value)}
              placeholder="Name or company"
              className="mt-2"
              style={{ minHeight: '48px' }}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Insurance Provider</Label>
              <Input
                value={formData.insurance_provider}
                onChange={(e) => updateField('insurance_provider', e.target.value)}
                placeholder="Insurance company"
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
            </div>
            <div>
              <Label className="font-semibold">Insurance Policy #</Label>
              <Input
                value={formData.insurance_policy}
                onChange={(e) => updateField('insurance_policy', e.target.value)}
                placeholder="Policy number"
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={updatePropertyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              style={{ backgroundColor: '#28A745' }}
              disabled={updatePropertyMutation.isPending}
            >
              {updatePropertyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}