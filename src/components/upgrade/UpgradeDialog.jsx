import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Sparkles } from "lucide-react";
import { initializeMilestones } from './upgradeMilestones';

const CATEGORIES = ["High ROI Renovations", "Energy Efficiency", "Rental Income Boosters", "Preventive Replacements", "Curb Appeal", "Interior Updates", "Safety", "Comfort", "Property Value", "Rental Appeal"];

export default function UpgradeDialog({ properties, project, templateId, memberDiscount, onComplete, onCancel }) {
  const [selectedProperty, setSelectedProperty] = React.useState(project?.property_id || '');
  const [formData, setFormData] = React.useState({
    title: "",
    category: "High ROI Renovations",
    description: "",
    current_state: "",
    upgraded_state: "",
    investment_required: "",
    annual_savings: "",
    property_value_impact: "",
    status: "Identified",
    project_manager: "DIY"
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const queryClient = useQueryClient();

  // Fetch template if templateId provided
  const { data: template } = useQuery({
    queryKey: ['upgradeTemplate', templateId],
    queryFn: async () => {
      const templates = await base44.entities.UpgradeTemplate.list();
      return templates.find(t => t.id === templateId);
    },
    enabled: !!templateId && !project,
  });

  // Pre-fill form from template or existing project
  React.useEffect(() => {
    if (project) {
      // Editing existing project
      setFormData({
        title: project.title || "",
        category: project.category || "High ROI Renovations",
        description: project.description || "",
        current_state: project.current_state || "",
        upgraded_state: project.upgraded_state || "",
        investment_required: project.investment_required || "",
        annual_savings: project.annual_savings || "",
        property_value_impact: project.property_value_impact || "",
        status: project.status || "Identified",
        project_manager: project.project_manager || "DIY"
      });
      setSelectedProperty(project.property_id);
    } else if (template) {
      // Creating from template
      const avgCost = (template.average_cost_min + template.average_cost_max) / 2;
      setFormData({
        title: template.title || "",
        category: template.category || "High ROI Renovations",
        description: template.why_it_works?.join(' ') || "",
        current_state: "",
        upgraded_state: "",
        investment_required: avgCost.toString(),
        annual_savings: template.annual_savings?.toString() || "",
        property_value_impact: template.typical_value_added?.toString() || "",
        status: "Planned",
        project_manager: "DIY"
      });
    }
  }, [project, template]);

  // Auto-select first property if none selected
  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const submitData = {
        ...data,
        property_id: selectedProperty,
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

      // Initialize milestones for new projects from template
      if (!project?.id && template) {
        const milestones = initializeMilestones(template, submitData.title);
        submitData.milestones = milestones;
        submitData.progress_percentage = 0;
        submitData.current_milestone = milestones[0]?.title || 'Not Started';
        submitData.template_id = template.id;
        
        console.log('✨ Initialized', milestones.length, 'milestones for project');
      }

      console.log('💾 Saving upgrade project:', submitData);

      if (project?.id) {
        return base44.entities.Upgrade.update(project.id, submitData);
      } else {
        return base44.entities.Upgrade.create(submitData);
      }
    },
    onSuccess: (result) => {
      console.log('✅ Upgrade project saved successfully:', result);
      queryClient.invalidateQueries({ queryKey: ['upgrades'] });
      
      // Show success message
      setShowSuccess(true);
      
      // Close after showing success
      setTimeout(() => {
        setShowSuccess(false);
        onComplete?.();
      }, 1500);
    },
    onError: (error) => {
      console.error('❌ Error saving upgrade project:', error);
      alert('Failed to save project. Please try again.');
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedProperty) {
      alert('Please select a property first');
      return;
    }
    
    setIsSubmitting(true);
    saveMutation.mutate(formData);
  };

  if (showSuccess) {
    return (
      <Dialog open={true} onOpenChange={onComplete}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {project ? 'Project Updated!' : 'Project Created!'}
            </h3>
            <p className="text-gray-600 mb-4">
              {project 
                ? 'Your changes have been saved.'
                : template 
                ? `Your "${formData.title}" project is ready with ${template ? 'guided milestones' : 'tracking'}.`
                : 'Your upgrade project is now in your portfolio.'}
            </p>
            <Button 
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700"
              style={{ minHeight: '48px' }}
            >
              View Your Projects
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {template && <Sparkles className="w-5 h-5 text-blue-600" />}
            {project ? 'Edit Upgrade Project' : template ? `Create: ${template.title}` : 'New Upgrade Project'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          
          {/* Template Info Banner */}
          {template && !project && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-1">
                📋 Creating from Template
              </p>
              <p className="text-sm text-blue-800 mb-2">
                {template.title} • Expected ROI: {template.average_roi_percent}%
              </p>
              <p className="text-xs text-gray-600">
                This template includes step-by-step milestones with AI guidance at each stage.
              </p>
            </div>
          )}

          {/* Property Selector */}
          <div>
            <Label>Property *</Label>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger style={{ minHeight: '48px' }}>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Project Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Kitchen Refresh"
              required
              style={{ minHeight: '48px' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger style={{ minHeight: '48px' }}>
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
                <SelectTrigger style={{ minHeight: '48px' }}>
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
            <Label>Project Manager</Label>
            <Select
              value={formData.project_manager}
              onValueChange={(value) => setFormData({ ...formData, project_manager: value })}
            >
              <SelectTrigger style={{ minHeight: '48px' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DIY">🔨 DIY (Self-Managed)</SelectItem>
                <SelectItem value="Operator">🏢 360° Operator</SelectItem>
                <SelectItem value="Contractor">👷 General Contractor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the upgrade..."
              rows={3}
              style={{ minHeight: '100px' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Current State</Label>
              <Input
                value={formData.current_state}
                onChange={(e) => setFormData({ ...formData, current_state: e.target.value })}
                placeholder="e.g., Standard insulation"
                style={{ minHeight: '48px' }}
              />
            </div>
            <div>
              <Label>After Upgrade</Label>
              <Input
                value={formData.upgraded_state}
                onChange={(e) => setFormData({ ...formData, upgraded_state: e.target.value })}
                placeholder="e.g., R-50 insulation"
                style={{ minHeight: '48px' }}
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
                style={{ minHeight: '48px' }}
              />
            </div>
            <div>
              <Label>Annual Savings ($)</Label>
              <Input
                type="number"
                value={formData.annual_savings}
                onChange={(e) => setFormData({ ...formData, annual_savings: e.target.value })}
                placeholder="0"
                style={{ minHeight: '48px' }}
              />
            </div>
            <div>
              <Label>Property Value Impact ($)</Label>
              <Input
                type="number"
                value={formData.property_value_impact}
                onChange={(e) => setFormData({ ...formData, property_value_impact: e.target.value })}
                placeholder="0"
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>

          {/* ROI Calculation Display */}
          {formData.investment_required > 0 && (
            <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">📊 Estimated Returns</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.annual_savings > 0 && (
                  <div>
                    <p className="text-xs text-gray-600">Payback Period</p>
                    <p className="font-bold text-green-700">
                      {Math.round((formData.investment_required / formData.annual_savings) * 10) / 10} years
                    </p>
                  </div>
                )}
                {formData.property_value_impact > 0 && (
                  <>
                    <div>
                      <p className="text-xs text-gray-600">ROI</p>
                      <p className="font-bold text-green-700">
                        {Math.round((formData.property_value_impact / formData.investment_required) * 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Net Gain</p>
                      <p className="font-bold text-green-700">
                        ${(formData.property_value_impact - formData.investment_required).toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
              style={{ minHeight: '48px' }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedProperty}
              style={{ backgroundColor: 'var(--primary)', minHeight: '48px' }}
            >
              {isSubmitting ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}