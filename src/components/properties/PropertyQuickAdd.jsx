import React, { useState } from "react";
import { Property } from "@/api/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Loader2 } from "lucide-react";
import AddressAutocomplete from "./AddressAutocomplete";

const CURRENT_YEAR = new Date().getFullYear();

export default function PropertyQuickAdd({ isOpen, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    address: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    formatted_address: '',
    address_verified: false,
    property_type: '',
    year_built: null,
    property_use_type: 'primary',
    door_count: 1
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await Property.create({
        ...data,
        setup_completed: true,
        baseline_completion: 0,
        health_score: 0,
        is_draft: false
      });
    },
    onSuccess: (newProperty) => {
      queryClient.invalidateQueries(['properties']);
      setFormData({
        address: '',
        street_address: '',
        city: '',
        state: '',
        zip_code: '',
        formatted_address: '',
        address_verified: false,
        property_type: '',
        year_built: null,
        property_use_type: 'primary',
        door_count: 1
      });
      onSuccess(newProperty);
      onClose();
    }
  });

  const canSubmit = formData.address_verified && formData.property_type && formData.year_built && formData.property_use_type;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Quick Add Property
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Address</label>
            <AddressAutocomplete
              initialValue={formData.address}
              onAddressSelect={(addressData) => {
                setFormData({
                  ...formData,
                  address: addressData.formatted_address || '',
                  street_address: addressData.street_address || '',
                  city: addressData.city || '',
                  state: addressData.state || '',
                  zip_code: addressData.zip_code || '',
                  formatted_address: addressData.formatted_address || '',
                  address_verified: addressData.address_verified || true
                });
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
            <Select value={formData.property_type} onValueChange={(value) => setFormData({ ...formData, property_type: value })}>
              <SelectTrigger style={{ minHeight: '48px' }}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single-Family Home">Single-Family Home</SelectItem>
                <SelectItem value="Duplex">Duplex (2 units)</SelectItem>
                <SelectItem value="Triplex">Triplex (3 units)</SelectItem>
                <SelectItem value="Fourplex">Fourplex (4 units)</SelectItem>
                <SelectItem value="Condo/Townhouse">Condo/Townhouse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Built</label>
              <Input
                type="number"
                min="1900"
                max={CURRENT_YEAR}
                placeholder="2010"
                value={formData.year_built || ''}
                onChange={(e) => setFormData({ ...formData, year_built: parseInt(e.target.value) || null })}
                style={{ minHeight: '48px' }}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Use</label>
              <Select value={formData.property_use_type} onValueChange={(value) => setFormData({ ...formData, property_use_type: value })}>
                <SelectTrigger style={{ minHeight: '48px' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="rental_unfurnished">Rental</SelectItem>
                  <SelectItem value="primary_with_rental">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.property_use_type?.includes('rental') && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Doors</label>
              <Input
                type="number"
                min="1"
                value={formData.door_count}
                onChange={(e) => setFormData({ ...formData, door_count: parseInt(e.target.value) || 1 })}
                style={{ minHeight: '48px' }}
              />
            </div>
          )}

          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-900">
              💡 You can add full details (beds, baths, purchase price, etc.) later in property settings
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              style={{ minHeight: '48px' }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(formData)}
              disabled={!canSubmit || createMutation.isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
              style={{ minHeight: '48px' }}
            >
              {createMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Add Property
                </>
              )}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}