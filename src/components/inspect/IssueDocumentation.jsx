
import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label"; // Added Label import
import { ArrowLeft, X, AlertTriangle, DollarSign, Sparkles, CheckCircle2 } from "lucide-react"; // Added CheckCircle2 import

import ServiceRequestDialog from "../services/ServiceRequestDialog";
import { estimateCascadeRisk } from "../shared/CascadeEstimator";

const SEVERITY_LEVELS = { // Renamed from SEVERITY_INFO and 'examples' changed to 'example'
  Urgent: {
    icon: '🚨',
    description: 'Safety hazard or will cause damage soon',
    example: 'Active leak, gas smell, sparking outlet, no heat/AC in extreme weather',
    color: '#DC3545'
  },
  Flag: {
    icon: '⚠️',
    description: 'Needs attention within weeks/months to prevent bigger problems',
    example: 'Worn parts, minor leaks, aging systems, preventive maintenance',
    color: '#FF6B35'
  },
  Monitor: {
    icon: '✅',
    description: 'Working now, just track at next inspection',
    example: 'Minor wear, cosmetic issues, long-term planning',
    color: '#28A745'
  }
};

const COST_RANGES = [
  { value: 'free', label: 'Free (DIY, supplies on hand)' },
  { value: '1-50', label: '$1-50 (Minor supplies)' },
  { value: '50-200', label: '$50-200 (Small repair/parts)' },
  { value: '200-500', label: '$200-500 (Moderate repair)' },
  { value: '500-1500', label: '$500-1,500 (Significant work)' },
  { value: '1500+', label: '$1,500+ (Major repair/replacement)' },
  { value: 'unknown', label: 'Unknown - need quote' }
];

// Utility function to parse cost range into a numeric value for AI estimation fallback
const parseCostRange = (costRange) => {
  if (costRange === 'free') return 0;
  if (costRange === 'unknown') return 0;
  if (costRange.includes('+')) return parseInt(costRange.replace('+', ''), 10);
  const [min] = costRange.split('-');
  return parseInt(min, 10);
};

export default function IssueDocumentation({
  propertyId,
  inspection,
  area,
  existingIssues = [],
  onComplete,
  preselectedSystem = null // NEW: System to pre-populate
}) {
  const [formData, setFormData] = React.useState({
    system: preselectedSystem || '', // Pre-populate if provided
    description: '',
    severity: 'Flag',
    photo_urls: [],
    is_quick_fix: null, // null, true, or false
    estimated_cost: '', // e.g., '1-50', 'unknown'
    who_will_fix: '' // 'diy', 'professional', 'undecided'
  });
  const [photos, setPhotos] = React.useState([]); // Local state for photo display and manipulation
  const [uploading, setUploading] = React.useState(false);
  const [showQuickFixQuestion, setShowQuickFixQuestion] = React.useState(false);
  const [aiEstimating, setAiEstimating] = React.useState(false); // Replaces isEstimating
  const [aiEstimate, setAiEstimate] = React.useState(null);
  const [showServiceDialog, setShowServiceDialog] = React.useState(false);
  const [editingFixDecision, setEditingFixDecision] = React.useState(false); // NEW: For editing quick fix decision

  const queryClient = useQueryClient();

  // Fetch baseline systems for the property to potentially update them
  const { data: baselineSystems = [] } = useQuery({
    queryKey: ['systemBaselines', propertyId],
    queryFn: () => base44.entities.SystemBaseline.list({ property_id: propertyId }),
    enabled: !!propertyId,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      return base44.entities.MaintenanceTask.create(taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks', propertyId] }); // Invalidate for specific property
    },
  });

  const updateSystemMutation = useMutation({
    mutationFn: async ({ systemId, updates }) => {
      return base44.entities.SystemBaseline.update(systemId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemBaselines', propertyId] }); // Invalidate for specific property
    },
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => base44.integrations.Core.UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.file_url);
      setPhotos(prev => [...prev, ...newUrls]); // Update local photos state for display
      setFormData(prev => ({
        ...prev,
        photo_urls: [...prev.photo_urls, ...newUrls] // Update formData
      }));
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      e.target.value = ''; // Clear the input field
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index)); // Update local photos state
    setFormData(prev => ({
      ...prev,
      photo_urls: prev.photo_urls.filter((_, i) => i !== index) // Update formData
    }));
  };

  const handleQuickFixAnswer = async (isQuickFix) => {
    setFormData(prev => ({ ...prev, is_quick_fix: isQuickFix }));
    setShowQuickFixQuestion(false);
    setEditingFixDecision(false); // Reset editing state

    if (!isQuickFix) { // If not a quick fix, proceed with AI estimation
      setAiEstimating(true);
      setAiEstimate(null); // Clear previous estimate
      try {
        const estimate = await estimateCascadeRisk({
          description: formData.description,
          system_type: formData.system,
          severity: formData.severity,
          area: area.name,
          estimated_cost: formData.estimated_cost
        });
        setAiEstimate(estimate);
      } catch (error) {
        console.error('AI estimation failed:', error);
        // Provide a fallback AI estimate if the service fails
        setAiEstimate({
          cascade_risk_score: 5, // Default if AI fails
          cascade_risk_reason: 'Could not get AI estimate. Manual review needed.',
          current_fix_cost: parseCostRange(formData.estimated_cost),
          delayed_fix_cost: parseCostRange(formData.estimated_cost) * 1.5, // Heuristic default
          cost_impact_reason: 'AI estimation failed, using default values.',
          cost_disclaimer: 'AI estimation failed. The following costs are estimated based on your input cost range only.'
        });
      } finally {
        setAiEstimating(false);
      }
    }
  };

  const handleEditFixDecision = () => {
    setEditingFixDecision(true);
    setFormData(prev => ({ ...prev, is_quick_fix: null, who_will_fix: '' })); // Reset decision and who_will_fix
    setAiEstimate(null); // Clear AI estimate as it's no longer relevant
  };

  const handleSubmit = async () => {
    if (formData.is_quick_fix) {
      // Quick fix path
      onComplete([...existingIssues, {
        area_id: area.id,
        item_name: `${formData.system}: ${formData.description}`,
        severity: formData.severity,
        notes: `Quick fix completed during inspection. ${formData.who_will_fix === 'diy' ? 'DIY repair' : 'Professional service'}. Estimated cost: ${formData.estimated_cost}.`,
        photo_urls: formData.photo_urls,
        completed: true
      }]);
    } else {
      // Non-quick fix path (add to Priority Queue)
      if (!aiEstimate) {
        console.error("AI estimate missing for non-quick fix. Cannot proceed.");
        return;
      }

      const taskData = {
        property_id: propertyId,
        title: `${formData.system}: ${formData.description.substring(0, 50)}${formData.description.length > 50 ? '...' : ''}`,
        description: `Issue found during ${inspection.season} ${inspection.year} inspection in ${area.name}.\n\nDescription: ${formData.description}\n\nSeverity: ${formData.severity}\nSystem: ${formData.system}${aiEstimate ? `\n\n--- AI Risk Analysis ---\n  Cascade Risk Score: ${aiEstimate.cascade_risk_score}/10 - ${aiEstimate.cascade_risk_reason}\n  Estimated Fix Now Cost: $${aiEstimate.current_fix_cost.toLocaleString()}\n  Estimated Fix Later Cost: $${aiEstimate.delayed_fix_cost.toLocaleString()}\n  Cost Impact Reason: ${aiEstimate.cost_impact_reason}\n\n${aiEstimate.cost_disclaimer}` : ''}`,
        system_type: formData.system,
        priority: formData.severity === 'Urgent' ? 'High' : formData.severity === 'Flag' ? 'Medium' : 'Low',
        status: 'Identified',
        photo_urls: formData.photo_urls,
        current_fix_cost: aiEstimate.current_fix_cost,
        delayed_fix_cost: aiEstimate.delayed_fix_cost,
        cascade_risk_score: aiEstimate.cascade_risk_score,
        cascade_risk_reason: aiEstimate.cascade_risk_reason,
        cost_impact_reason: aiEstimate.cost_impact_reason,
        has_cascade_alert: aiEstimate.cascade_risk_score >= 7,
        execution_type: formData.who_will_fix === 'diy' ? 'DIY' : formData.who_will_fix === 'professional' ? 'Professional' : 'Not Decided'
      };

      try {
        await createTaskMutation.mutateAsync(taskData);

        // Update related baseline systems for this property and system_type
        if (formData.system !== 'General') {
          const systemsToUpdate = baselineSystems.filter(s => s.system_type === formData.system);
          for (const system of systemsToUpdate) {
            const conditionUpdates = {};

            // Update condition based on severity (preserving original logic)
            if (formData.severity === 'Urgent') {
              conditionUpdates.condition = 'Urgent';
            } else if (formData.severity === 'Flag' && ['Good', 'Excellent'].includes(system.condition)) {
              conditionUpdates.condition = 'Fair';
            }

            // Add warning signs if not already present (preserving original logic)
            const existingWarnings = system.warning_signs_present || [];
            const newWarning = formData.description.substring(0, 100);
            if (newWarning && !existingWarnings.includes(newWarning)) {
              conditionUpdates.warning_signs_present = [...existingWarnings, newWarning];
            }

            // Add condition notes (preserving original logic)
            const timestamp = new Date().toLocaleDateString();
            const existingNotes = system.condition_notes || '';
            const newNote = `\n[${timestamp}] ${inspection.season} ${inspection.year} Inspection: ${formData.description}`;
            conditionUpdates.condition_notes = existingNotes.includes(newNote) ? existingNotes : existingNotes + newNote;


            if (Object.keys(conditionUpdates).length > 0) {
              await updateSystemMutation.mutateAsync({
                systemId: system.id,
                updates: conditionUpdates
              });
            }
          }
        }
        onComplete([...existingIssues, {
          area_id: area.id,
          item_name: `${formData.system}: ${formData.description}`,
          severity: formData.severity,
          notes: 'Added to Priority Queue for scheduling',
          photo_urls: formData.photo_urls,
          completed: false
        }]);

      } catch (error) {
        console.error("Error creating task or updating system:", error);
      }
    }
  };

  // Determine if the "Continue" button for quick fix question should be enabled
  const canAskQuickFixQuestion = formData.system && formData.description && formData.estimated_cost;
  // Determine if the Quick Fix submit button should be enabled
  const canSubmitQuickFix = formData.is_quick_fix === true && formData.who_will_fix;
  // Determine if the Priority Queue submit button should be enabled
  const canSubmitPriorityQueue = formData.is_quick_fix === false && aiEstimate && formData.who_will_fix;

  return (
    <>
      <div className="min-h-screen bg-white pb-8">
        <div className="mobile-container md:max-w-3xl md:mx-auto">
          <Button
            variant="ghost"
            onClick={() => onComplete(existingIssues)} // Go back to area inspection, not just cancel form
            className="mb-4"
            style={{ minHeight: '44px' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Area Inspection
          </Button>

          <Card className="border-2 mobile-card" style={{ borderColor: '#FF6B35' }}>
            <CardHeader>
              <CardTitle style={{ color: '#1B365D', fontSize: '20px' }}>
                Document Issue Found
              </CardTitle>
              <p className="text-sm text-gray-600">
                Area: {area.name}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* System Selection */}
              <div>
                <Label htmlFor="system-select">Which system is affected?</Label>
                <Select
                  value={formData.system}
                  onValueChange={(value) => setFormData({ ...formData, system: value })}
                  required
                >
                  <SelectTrigger id="system-select" style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}>
                    <SelectValue placeholder="Select system..." />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: '#FFFFFF' }}>
                    <SelectItem value="HVAC">HVAC</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Roof">Roof</SelectItem>
                    <SelectItem value="Foundation">Foundation</SelectItem>
                    <SelectItem value="Gutters">Gutters</SelectItem>
                    <SelectItem value="Exterior">Exterior</SelectItem>
                    <SelectItem value="Windows/Doors">Windows/Doors</SelectItem>
                    <SelectItem value="Appliances">Appliances</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="issue-description">Describe the issue</Label>
                <Textarea
                  id="issue-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Be specific: What did you notice? Where exactly? How bad is it?"
                  rows={4}
                  required
                  style={{ minHeight: '96px', backgroundColor: '#FFFFFF' }}
                />
              </div>

              {/* Photo Upload */}
              <div>
                <Label htmlFor="photo-upload">📷 Photos (highly recommended)</Label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="mb-4"
                  disabled={uploading}
                  style={{ minHeight: '48px' }}
                />
                {uploading && <p className="text-sm text-gray-600">Uploading...</p>}
                <div className="flex flex-wrap gap-2 mt-4">
                  {photos.map((url, idx) => (
                    <div key={idx} className="relative">
                      <img src={url} alt={`Issue ${idx + 1}`} className="w-24 h-24 object-cover rounded border-2 border-white shadow" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        style={{ minHeight: '28px', minWidth: '28px' }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Severity Rating */}
              <div>
                <Label>How urgent is this?</Label>
                <div className="space-y-2 mt-2">
                  {Object.entries(SEVERITY_LEVELS).map(([key, level]) => (
                    <label
                      key={key}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.severity === key ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ minHeight: '80px' }}
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={key}
                        checked={formData.severity === key}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{level.icon}</span>
                          <span className="font-semibold" style={{ color: level.color }}>{key}</span>
                        </div>
                        <p className="text-sm text-gray-700">{level.description}</p>
                        <p className="text-xs text-gray-600 mt-1">Example: {level.example}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cost Estimate */}
              <div>
                <Label htmlFor="cost-estimate">Estimated cost to fix</Label>
                <Select
                  value={formData.estimated_cost}
                  onValueChange={(value) => setFormData({ ...formData, estimated_cost: value })}
                  required
                >
                  <SelectTrigger id="cost-estimate" style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}>
                    <SelectValue placeholder="Select cost range..." />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: '#FFFFFF' }}>
                    {COST_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Fix Question - Show button if not answered and not editing */}
              {formData.is_quick_fix === null && !showQuickFixQuestion && !editingFixDecision && (
                <Button
                  onClick={() => setShowQuickFixQuestion(true)}
                  disabled={!canAskQuickFixQuestion}
                  className="w-full"
                  style={{ backgroundColor: '#28A745', minHeight: '56px', fontSize: '16px' }}
                >
                  Continue
                </Button>
              )}

              {/* Display Quick Fix Question */}
              {(showQuickFixQuestion || editingFixDecision) && (
                <Card className="border-2 border-blue-300 bg-blue-50">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '18px' }}>
                      Can you fix this yourself RIGHT NOW?
                    </h3>
                    <p className="text-sm text-gray-700 mb-6">
                      Quick fixes are simple tasks you can complete during this inspection (like tightening a loose screw, replacing a battery, etc.)
                    </p>
                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={() => handleQuickFixAnswer(true)}
                        className="w-full"
                        style={{ backgroundColor: '#28A745', minHeight: '56px' }}
                      >
                        ✅ Yes - I'll fix it now (Quick Fix)
                      </Button>
                      <Button
                        onClick={() => handleQuickFixAnswer(false)}
                        variant="outline"
                        className="w-full"
                        style={{ minHeight: '56px' }}
                      >
                        📋 No - Add to Priority Queue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Fix Path - Show only if answered YES to quick fix */}
              {formData.is_quick_fix === true && !editingFixDecision && (
                <Card className="border-2 border-green-300 bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold flex items-center gap-2" style={{ color: '#28A745' }}>
                        <CheckCircle2 className="w-6 h-6" />
                        Great! Quick Fix
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditFixDecision}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Change Decision
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="who-fixed-quick-fix">Who fixed it?</Label>
                        <Select
                          value={formData.who_will_fix}
                          onValueChange={(value) => setFormData({ ...formData, who_will_fix: value })}
                          required
                        >
                          <SelectTrigger id="who-fixed-quick-fix" style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent style={{ backgroundColor: '#FFFFFF' }}>
                            <SelectItem value="diy">I fixed it myself (DIY)</SelectItem>
                            <SelectItem value="professional">Called a professional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleSubmit}
                        disabled={!canSubmitQuickFix || createTaskMutation.isPending}
                        className="w-full"
                        style={{ backgroundColor: '#28A745', minHeight: '56px', fontSize: '16px' }}
                      >
                        {createTaskMutation.isPending ? 'Saving...' : 'Mark as Fixed & Continue'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Priority Queue Path with AI Estimate - Show only if answered NO to quick fix */}
              {formData.is_quick_fix === false && !editingFixDecision && (
                <>
                  {aiEstimating && (
                    <Card className="border-2 border-purple-300 bg-purple-50">
                      <CardContent className="p-6 text-center">
                        <div className="animate-spin text-5xl mb-4">⚙️</div>
                        <p className="font-medium text-gray-700">AI analyzing cascade risk...</p>
                      </CardContent>
                    </Card>
                  )}

                  {aiEstimate && (
                    <Card className="border-2 border-orange-300 bg-orange-50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold flex items-center gap-2" style={{ color: '#FF6B35' }}>
                            <AlertTriangle className="w-6 h-6" />
                            AI Risk Analysis
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEditFixDecision}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            Change Decision
                          </Button>
                        </div>

                        {/* Cost Disclaimer */}
                        <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
                          <p className="text-xs text-yellow-900 leading-relaxed">
                            {aiEstimate.cost_disclaimer}
                          </p>
                        </div>

                        {/* Cascade Risk Score */}
                        <div className="mb-4 p-4 bg-white rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Cascade Risk:</span>
                            <Badge className={
                              aiEstimate.cascade_risk_score >= 7 ? 'bg-red-600' :
                              aiEstimate.cascade_risk_score >= 4 ? 'bg-orange-600' :
                              'bg-green-600'
                            }>
                              {aiEstimate.cascade_risk_score}/10
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700">{aiEstimate.cascade_risk_reason}</p>
                        </div>

                        {/* Cost Comparison */}
                        <div className="mb-4 p-4 bg-white rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Fix Now Estimate:</span>
                            <span className="font-bold text-green-700">${aiEstimate.current_fix_cost.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Fix Later Estimate:</span>
                            <span className="font-bold text-red-700">${aiEstimate.delayed_fix_cost.toLocaleString()}</span>
                          </div>
                          <div className="pt-2 border-t flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-900">Potential Cost Increase:</span>
                            <span className="font-bold text-red-700">
                              +${(aiEstimate.delayed_fix_cost - aiEstimate.current_fix_cost).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-3 italic">
                            {aiEstimate.cost_impact_reason}
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="who-will-fix-priority">Who will handle this?</Label>
                          <Select
                            value={formData.who_will_fix}
                            onValueChange={(value) => setFormData({ ...formData, who_will_fix: value })}
                            required
                          >
                            <SelectTrigger id="who-will-fix-priority" style={{ minHeight: '48px', backgroundColor: '#FFFFFF' }}>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent style={{ backgroundColor: '#FFFFFF' }}>
                              <SelectItem value="diy">I'll do it myself (DIY)</SelectItem>
                              <SelectItem value="professional">Hire a professional</SelectItem>
                              <SelectItem value="undecided">Not sure yet</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col gap-3 mt-6">
                          <Button
                            onClick={handleSubmit}
                            disabled={!canSubmitPriorityQueue || createTaskMutation.isPending}
                            className="w-full"
                            style={{ backgroundColor: '#FF6B35', minHeight: '56px', fontSize: '16px' }}
                          >
                            {createTaskMutation.isPending ? 'Adding...' : 'Add to Priority Queue'}
                          </Button>
                          {formData.who_will_fix === 'professional' && (
                            <Button
                              onClick={() => setShowServiceDialog(true)}
                              variant="outline"
                              className="w-full"
                              style={{ minHeight: '56px' }}
                            >
                              Request Professional Service Now
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Service Request Dialog */}
      <ServiceRequestDialog
        open={showServiceDialog}
        onClose={() => setShowServiceDialog(false)}
        prefilledData={{
          property_id: propertyId,
          service_type: "Inspection Issue - Professional Repair",
          description: `Issue found during ${inspection.season} ${inspection.year} inspection in ${area.name}:\n\n${formData.description}\n\nSeverity: ${formData.severity}\nSystem: ${formData.system}\n\nEstimated Cost: ${formData.estimated_cost}\n\nNote: Cost estimate is AI-generated average. Actual cost may vary.`,
          severity: formData.severity,
          system_type: formData.system,
          photo_urls: formData.photo_urls,
          title: `${formData.system}: ${formData.description.substring(0, 50)}${formData.description.length > 50 ? '...' : ''}`,
          notes: `Found during ${inspection.season} ${inspection.year} inspection. AI cascade risk: ${aiEstimate?.cascade_risk_score}/10`
        }}
      />
    </>
  );
}
