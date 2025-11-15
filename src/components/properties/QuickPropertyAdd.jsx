import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AddressAutocomplete from "./AddressAutocomplete";

export default function QuickPropertyAdd({ open, onClose, onSuccess }) {
  const [formData, setFormData] = React.useState({
    address: "",
    property_type: "Single-Family Home",
    occupancy_status: "Owner Occupied",
    year_built: "",
    square_footage: ""
  });
  const [showOptional, setShowOptional] = React.useState(false);
  
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Property.create(data);
    },
    onSuccess: async (property) => {
      // Update user's last property
      await base44.auth.updateMe({ last_property_id: property.id });
      
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      toast.success('🎉 Property added! Let\'s document your systems.');
      
      // Close modal
      onClose();
      
      // Call success callback with property ID
      if (onSuccess) {
        onSuccess(property.id);
      }
    },
    onError: (error) => {
      console.error('Property creation failed:', error);
      toast.error('Failed to add property. Please try again.');
    }
  });

  const handleAddressSelect = (addressData) => {
    setFormData(prev => ({
      ...prev,
      address: addressData.formatted_address,
      street_address: addressData.street_address,
      city: addressData.city,
      state: addressData.state,
      zip_code: addressData.zip_code,
      coordinates: addressData.coordinates,
      formatted_address: addressData.formatted_address,
      place_id: addressData.place_id,
      address_verified: true,
      verification_source: 'google_maps'
    }));
  };

  const handleSave = () => {
    if (!formData.address) {
      toast.error('Please enter your property address');
      return;
    }

    const submitData = {
      ...formData,
      // Only include optional fields if provided
      ...(formData.year_built && { year_built: parseInt(formData.year_built) }),
      ...(formData.square_footage && { square_footage: parseInt(formData.square_footage) })
    };

    createMutation.mutate(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Your Property</DialogTitle>
          <DialogDescription>
            Just your address to start. Add details later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Single required field - prominent */}
          <div>
            <Label className="text-lg font-semibold mb-2">Property Address *</Label>
            <AddressAutocomplete
              value={formData.address}
              onSelect={handleAddressSelect}
              placeholder="123 Main St, Portland, OR"
              className="text-lg h-12"
              autoFocus
            />
          </div>

          {/* Optional details - collapsed by default */}
          <Collapsible open={showOptional} onOpenChange={setShowOptional}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Add more details (optional)
              <ChevronDown className={`w-4 h-4 transition-transform ${showOptional ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <div>
                <Label>Property Type</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, property_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single-Family Home">Single-Family Home</SelectItem>
                    <SelectItem value="Duplex">Duplex</SelectItem>
                    <SelectItem value="Triplex">Triplex</SelectItem>
                    <SelectItem value="Fourplex">Fourplex</SelectItem>
                    <SelectItem value="Condo/Townhouse">Condo/Townhouse</SelectItem>
                    <SelectItem value="Small Multi-Family (5-12 units)">Small Multi-Family (5-12 units)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Year Built</Label>
                <Input
                  type="number"
                  placeholder="e.g., 1985"
                  value={formData.year_built}
                  onChange={(e) => setFormData(prev => ({ ...prev, year_built: e.target.value }))}
                />
              </div>

              <div>
                <Label>Square Footage</Label>
                <Input
                  type="number"
                  placeholder="e.g., 2400"
                  value={formData.square_footage}
                  onChange={(e) => setFormData(prev => ({ ...prev, square_footage: e.target.value }))}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={createMutation.isPending}
            className="order-2 sm:order-1"
          >
            Maybe Later
          </Button>
          <Button
            size="lg"
            onClick={handleSave}
            disabled={createMutation.isPending || !formData.address}
            className="order-1 sm:order-2 w-full sm:w-auto"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {createMutation.isPending ? 'Saving...' : 'Save & Start Baseline →'}
          </Button>
        </DialogFooter>

        {/* Time estimate */}
        <p className="text-xs text-gray-500 text-center -mt-2">
          ⏱️ Takes 30 seconds
        </p>
      </DialogContent>
    </Dialog>
  );
}