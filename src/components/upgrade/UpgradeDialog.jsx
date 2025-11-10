import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = ["Energy Efficiency", "Safety", "Comfort", "Property Value", "Rental Appeal"];

export default function UpgradeDialog({ open, onClose, propertyId, editingUpgrade }) {
  const [formData, setFormData] = React.useState({
    title: "",
    category: "Energy Efficiency",
    description: "",
    current_state: "",
    upgraded_state: "",
    investment_required: "",
    annual_savings: "",
    property_value_impact: "",
    status: "Identified"
  });

  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (editingUpgrade) {
      setFormData({
        title: editingUpgrade.title || "",
        category: editingUpgrade.category || "Energy Efficiency",
        description: editingUpgrade.description || "",
        current_state: editingUpgrade.current_state || "",
        upgraded_state: editingUpgrade.upgraded_state || "",
        investment_required: editingUpgrade.investment_required || "",
        annual_savings: editingUpgrade.annual_savings || "",
        property_value_impact: editingUpgrade.property_value_impact || "",
        status: editingUpgrade.status || "Identified"
      });
    } else {
      setFormData({
        title: "",
        category: "Energy Efficiency",
        description: "",
        current_state: "",
        upgraded_state: "",
        investment_required: "",
        annual_savings: "",
        property_value_impact: "",
        status: "Identified"
      });
    }
  }, [editingUpgrade, open]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const submitData = {
        ...data,
        property_id: propertyId,
        investment_required: parseFloat(data.investment_required) || 0,
        annual_savings: parseFloat(data.annual_savings) || 0,
        property_value_impact: parseFloat(data.property_value_impact) || 0,
      };

      // Calculate ROI timeline
      if (submitData.annual_savings > 0 && submitData.investment_required > 0) {
        submitData.roi_timeline_months = Math.round(
          (submitData.investment_required / submitData.annual_savings) * 12
        );
      }

      if (editingUpgrade?.id) {
        return base44.entities.Upgrade.update(editingUpgrade.id, submitData);
      } else {
        return base44.entities.Upgrade.create(submitData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upgrades'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingUpgrade ? 'Edit' : 'Add'} Upgrade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Upgrade Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Install Solar Panels"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Identified">Identified</SelectItem>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Deferred">Deferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the upgrade..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Current State</Label>
              <Input
                value={formData.current_state}
                onChange={(e) => setFormData({ ...formData, current_state: e.target.value })}
                placeholder="e.g., Standard insulation"
              />
            </div>
            <div>
              <Label>After Upgrade</Label>
              <Input
                value={formData.upgraded_state}
                onChange={(e) => setFormData({ ...formData, upgraded_state: e.target.value })}
                placeholder="e.g., R-50 insulation"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Investment Required ($)</Label>
              <Input
                type="number"
                value={formData.investment_required}
                onChange={(e) => setFormData({ ...formData, investment_required: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Annual Savings ($)</Label>
              <Input
                type="number"
                value={formData.annual_savings}
                onChange={(e) => setFormData({ ...formData, annual_savings: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Property Value Impact ($)</Label>
              <Input
                type="number"
                value={formData.property_value_impact}
                onChange={(e) => setFormData({ ...formData, property_value_impact: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          {formData.investment_required > 0 && formData.annual_savings > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-900">
                <span className="font-semibold">Payback Period:</span>{' '}
                {Math.round((formData.investment_required / formData.annual_savings) * 10) / 10} years
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending} style={{ backgroundColor: 'var(--primary)' }}>
              {saveMutation.isPending ? 'Saving...' : 'Save Upgrade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}