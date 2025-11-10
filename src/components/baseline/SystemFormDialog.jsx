import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";

export default function SystemFormDialog({ open, onClose, propertyId, editingSystem }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = React.useState({
    system_type: "",
    brand_model: "",
    installation_year: new Date().getFullYear(),
    warranty_info: "",
    last_service_date: "",
    condition: "Good",
    condition_notes: "",
    estimated_lifespan_years: "",
    replacement_cost_estimate: "",
    photo_urls: []
  });
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    if (editingSystem) {
      setFormData({
        system_type: editingSystem.system_type || "",
        brand_model: editingSystem.brand_model || "",
        installation_year: editingSystem.installation_year || new Date().getFullYear(),
        warranty_info: editingSystem.warranty_info || "",
        last_service_date: editingSystem.last_service_date || "",
        condition: editingSystem.condition || "Good",
        condition_notes: editingSystem.condition_notes || "",
        estimated_lifespan_years: editingSystem.estimated_lifespan_years || "",
        replacement_cost_estimate: editingSystem.replacement_cost_estimate || "",
        photo_urls: editingSystem.photo_urls || []
      });
    }
  }, [editingSystem]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingSystem?.id) {
        return base44.entities.SystemBaseline.update(editingSystem.id, data);
      } else {
        return base44.entities.SystemBaseline.create({ ...data, property_id: propertyId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemBaselines'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      installation_year: parseInt(formData.installation_year),
      estimated_lifespan_years: formData.estimated_lifespan_years ? parseInt(formData.estimated_lifespan_years) : undefined,
      replacement_cost_estimate: formData.replacement_cost_estimate ? parseFloat(formData.replacement_cost_estimate) : undefined,
    };
    saveMutation.mutate(submitData);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => base44.integrations.Core.UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      setFormData(prev => ({
        ...prev,
        photo_urls: [...prev.photo_urls, ...urls]
      }));
    } catch (error) {
      console.error("Upload error:", error);
    }
    setUploading(false);
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photo_urls: prev.photo_urls.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSystem?.id ? 'Edit' : 'Add'} {formData.system_type || 'System'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>System Type</Label>
              <Input
                value={formData.system_type}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label>Condition</Label>
              <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Brand/Model</Label>
            <Input
              value={formData.brand_model}
              onChange={(e) => setFormData({ ...formData, brand_model: e.target.value })}
              placeholder="e.g., Carrier HVAC Model ABC123"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Installation Year</Label>
              <Input
                type="number"
                value={formData.installation_year}
                onChange={(e) => setFormData({ ...formData, installation_year: e.target.value })}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            <div>
              <Label>Last Service Date</Label>
              <Input
                type="date"
                value={formData.last_service_date}
                onChange={(e) => setFormData({ ...formData, last_service_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Warranty Information</Label>
            <Input
              value={formData.warranty_info}
              onChange={(e) => setFormData({ ...formData, warranty_info: e.target.value })}
              placeholder="e.g., 10-year warranty, expires 2025"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Estimated Lifespan (years)</Label>
              <Input
                type="number"
                value={formData.estimated_lifespan_years}
                onChange={(e) => setFormData({ ...formData, estimated_lifespan_years: e.target.value })}
                placeholder="e.g., 15"
              />
            </div>
            <div>
              <Label>Replacement Cost Estimate ($)</Label>
              <Input
                type="number"
                value={formData.replacement_cost_estimate}
                onChange={(e) => setFormData({ ...formData, replacement_cost_estimate: e.target.value })}
                placeholder="e.g., 5000"
              />
            </div>
          </div>

          <div>
            <Label>Condition Notes</Label>
            <Textarea
              value={formData.condition_notes}
              onChange={(e) => setFormData({ ...formData, condition_notes: e.target.value })}
              placeholder="Any specific observations or concerns..."
              rows={3}
            />
          </div>

          <div>
            <Label>Photos</Label>
            <div className="mt-2">
              <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : 'Click to upload photos'}
                  </p>
                </div>
              </label>
            </div>
            {formData.photo_urls.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {formData.photo_urls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-24 object-cover rounded border" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: 'var(--primary)' }} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save System'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}