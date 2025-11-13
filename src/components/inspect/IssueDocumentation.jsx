
import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // New import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ArrowLeft, X, AlertTriangle, DollarSign, Sparkles, CheckCircle2, Clock } from "lucide-react";

import ServiceRequestDialog from "../services/ServiceRequestDialog";
import { estimateCascadeRisk } from "../shared/CascadeEstimator";

// Safe string truncation helper
const safeSubstring = (str, maxLength) => {
  if (!str || typeof str !== 'string') return '';
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};

// Format labor hours into readable string
const formatLaborHours = (minHours, maxHours) => {
  const formatSingle = (hours) => {
    if (hours === 0) return '0 hours';
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    } else if (hours === 1) {
      return '1 hour';
    } else if (hours < 8) {
      return `${hours} hours`;
    } else {
      const days = Math.floor(hours / 8);
      const remainingHours = hours % 8;
      if (remainingHours === 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
      } else {
        return `${days} day${days > 1 ? 's' : ''}, ${remainingHours} hours`;
      }
    }
  };

  return `${formatSingle(minHours)} - ${formatSingle(maxHours)}`;
};

const SEVERITY_LEVELS = {
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
  if (!costRange || costRange === 'free') return 0;
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
  preselectedSystem = null,
  editingIssue = null, // New prop for editing
  editingIssueIndex = null // New prop for editing
}) {
  // Pre-fill form data if editing an existing issue
  const [formData, setFormData] = React.useState(() => {
    if (editingIssue) {
      // Extract system from item_name (format: "System: Description")
      const systemMatch = editingIssue.item_name?.match(/^([^:]+):/);
      const extractedSystem = systemMatch ? systemMatch[1].trim() : '';

      return {
        system: extractedSystem || preselectedSystem || '',
        description: editingIssue.description || editingIssue.notes || '',
        severity: editingIssue.severity || 'Flag',
        photo_urls: editingIssue.photo_urls || [],
        is_quick_fix: editingIssue.completed && !editingIssue.resolved_during_inspection ? true : null, // If completed AND not resolved_during_inspection, then it was a quick fix. Otherwise, undecided.
        estimated_cost: editingIssue.estimated_cost || '',
        who_will_fix: editingIssue.who_will_fix || '',
        resolvedDuringInspection: editingIssue.resolved_during_inspection || false, // New field
        resolutionNotes: editingIssue.resolution_notes || '', // New field
        resolutionCost: editingIssue.resolution_cost || 0, // New field
        resolutionTimeMinutes: editingIssue.resolution_time_minutes || 0, // New field
        resolutionPhotoUrl: editingIssue.resolution_photo_url || '' // New field
      };
    }

    return {
      system: preselectedSystem || '',
      description: '',
      severity: 'Flag',
      photo_urls: [],
      is_quick_fix: null,
      estimated_cost: '',
      who_will_fix: '',
      resolvedDuringInspection: false, // New field
      resolutionNotes: '', // New field
      resolutionCost: 0, // New field
      resolutionTimeMinutes: 0, // New field
      resolutionPhotoUrl: '' // New field
    };
  });

  // Initialize photos state with existing photos if editing
  const [photos, setPhotos] = React.useState(editingIssue?.photo_urls || []);
  const [uploading, setUploading] = React.useState(false);
  const [uploadingResolution, setUploadingResolution] = React.useState(false); // New state for resolution photo
  // If editing, we assume the quick fix decision might have been made, so initially hide the question.
  // We'll show it if the fix decision needs to be changed.
  const [showQuickFixQuestion, setShowQuickFixQuestion] = React.useState(false);
  const [aiEstimating, setAiEstimating] = React.useState(false);
  const [aiEstimate, setAiEstimate] = React.useState(null); // When editing, we don't have this directly from the `item`
  const [showServiceDialog, setShowServiceDialog] = React.useState(false);
  const [editingFixDecision, setEditingFixDecision] = React.useState(false);

  // Effect to re-evaluate AI estimate if editing an existing non-quick fix issue
  // and relevant formData fields change or component mounts
  React.useEffect(() => {
    // If we're editing an issue that was NOT a quick fix (or its quick fix state is now false)
    // and we haven't already generated an AI estimate for display
    // or if the relevant form data has changed (e.g., description, system type, etc.), re-run AI estimation.
    // We only trigger this if is_quick_fix is explicitly false (meaning it's a priority queue item)
    // or if it was initially undecided and now became false.
    if (editingIssue && formData.is_quick_fix === false && !formData.resolvedDuringInspection && !aiEstimate && !aiEstimating) { // Added !formData.resolvedDuringInspection
      const fetchEstimate = async () => {
        setAiEstimating(true);
        try {
          const estimate = await estimateCascadeRisk({
            description: formData.description || '',
            system_type: formData.system,
            severity: formData.severity,
            area: area.name,
            estimated_cost: formData.estimated_cost
          });
          setAiEstimate(estimate);
        } catch (error) {
          console.error('AI estimation failed during edit load:', error);
          setAiEstimate({
            cascade_risk_score: 5,
            cascade_risk_reason: 'Could not get AI estimate during edit. Manual review needed.',
            current_fix_cost: parseCostRange(formData.estimated_cost),
            delayed_fix_cost: parseCostRange(formData.estimated_cost) * 1.5,
            cost_impact_reason: 'AI estimation failed, using default values.',
            min_hours: 1, // Fallback for min hours
            max_hours: 4, // Fallback for max hours
            cost_disclaimer: 'AI estimation failed. The following costs and time estimates are rough defaults based on your input cost range only.'
          });
        } finally {
          setAiEstimating(false);
        }
      };
      fetchEstimate();
    }
  }, [editingIssue, formData.is_quick_fix, formData.resolvedDuringInspection, formData.description, formData.system, formData.severity, formData.estimated_cost, area.name, aiEstimate, aiEstimating]);


  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks', propertyId] });
    },
  });

  const updateSystemMutation = useMutation({
    mutationFn: async ({ systemId, updates }) => {
      return base44.entities.SystemBaseline.update(systemId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemBaselines', propertyId] });
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
      setPhotos(prev => [...prev, ...newUrls]);
      setFormData(prev => ({
        ...prev,
        photo_urls: [...prev.photo_urls, ...newUrls]
      }));
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      photo_urls: prev.photo_urls.filter((_, i) => i !== index)
    }));
  };

  const handleResolutionPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResolution(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        resolutionPhotoUrl: result.file_url
      }));
    } catch (error) {
      console.error("Resolution photo upload error:", error);
      alert('Failed to upload resolution photo');
    } finally {
      setUploadingResolution(false);
      e.target.value = '';
    }
  };

  const handleQuickFixAnswer = async (isQuickFix) => {
    setFormData(prev => ({ ...prev, is_quick_fix: isQuickFix }));
    setShowQuickFixQuestion(false);
    setEditingFixDecision(false);

    if (!isQuickFix) {
      setAiEstimating(true);
      setAiEstimate(null);
      try {
        const estimate = await estimateCascadeRisk({
          description: formData.description || '',
          system_type: formData.system,
          severity: formData.severity,
          area: area.name,
          estimated_cost: formData.estimated_cost
        });
        setAiEstimate(estimate);
      } catch (error) {
        console.error('AI estimation failed:', error);
        setAiEstimate({
          cascade_risk_score: 5,
          cascade_risk_reason: 'Could not get AI estimate. Manual review needed.',
          current_fix_cost: parseCostRange(formData.estimated_cost),
          delayed_fix_cost: parseCostRange(formData.estimated_cost) * 1.5,
          cost_impact_reason: 'AI estimation failed, using default values.',
          min_hours: 1, // Fallback for min hours
          max_hours: 4, // Fallback for max hours
          cost_disclaimer: 'AI estimation failed. The following costs and time estimates are rough defaults based on your input cost range only.'
        });
      } finally {
        setAiEstimating(false);
      }
    }
  };

  const handleEditFixDecision = () => {
    setEditingFixDecision(true);
    // Reset is_quick_fix to null to re-ask the question, and clear who_will_fix.
    // Preserve other formData fields.
    setFormData(prev => ({ ...prev, is_quick_fix: null, who_will_fix: '' }));
    setAiEstimate(null); // Clear AI estimate so it can be re-calculated if needed
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.description || !formData.system) {
      console.error("Missing required fields");
      return;
    }

    // Base issue object with common fields
    const baseIssue = {
      area_id: area.id,
      item_name: `${formData.system}: ${safeSubstring(formData.description, 50)}`,
      severity: formData.severity,
      description: formData.description, // Store full description
      photo_urls: formData.photo_urls,
      estimated_cost: formData.estimated_cost,
      who_will_fix: formData.who_will_fix,
      // New resolution fields
      resolved_during_inspection: formData.resolvedDuringInspection,
      resolution_notes: formData.resolutionNotes,
      resolution_cost: formData.resolutionCost,
      resolution_time_minutes: formData.resolutionTimeMinutes,
      resolution_photo_url: formData.resolutionPhotoUrl
    };

    let updatedIssue;

    if (formData.resolvedDuringInspection) {
      // New: Issue fixed during inspection
      const taskData = {
        property_id: propertyId,
        title: baseIssue.item_name,
        description: `Issue found and FIXED during ${inspection.season} ${inspection.year} inspection in ${area.name}.\n\nOriginal Issue: ${baseIssue.description}\n\nRESOLUTION NOTES:\n${formData.resolutionNotes || 'No specific notes.'}\n\nCost: $${formData.resolutionCost || 0}\nTime: ${formData.resolutionTimeMinutes || 0} minutes.`,
        system_type: baseIssue.system,
        priority: baseIssue.severity === 'Urgent' ? 'High' : baseIssue.severity === 'Flag' ? 'Medium' : 'Low',
        status: 'Completed',
        execution_type: 'DIY', // Assuming DIY for resolution during inspection
        completion_date: new Date().toISOString().split('T')[0],
        actual_cost: formData.resolutionCost || 0,
        actual_hours: (formData.resolutionTimeMinutes || 0) / 60, // Convert minutes to hours
        completion_notes: formData.resolutionNotes || 'Fixed during inspection',
        completion_photos: formData.resolutionPhotoUrl ? [formData.resolutionPhotoUrl] : [],
        photo_urls: baseIssue.photo_urls, // Original issue photos
        resolved_during_inspection: true, // Explicitly mark as resolved during inspection
      };

      try {
        await createTaskMutation.mutateAsync(taskData);
        console.log(`✓ Task created as completed and resolved during inspection: ${baseIssue.item_name}`);
      } catch (error) {
        console.error("Error creating completed task for in-inspection resolution:", error);
      }

      updatedIssue = {
        ...baseIssue,
        notes: `Fixed during inspection. ${formData.resolutionNotes}`,
        completed: true,
        is_quick_fix: false, // Not considered a "quick fix" in the old sense; it's a full resolution
      };

    } else if (formData.is_quick_fix) {
      // Quick fix path (existing logic)
      updatedIssue = {
        ...baseIssue,
        notes: `Quick fix completed during inspection. ${formData.who_will_fix === 'diy' ? 'DIY repair' : 'Professional service'}. Estimated cost: ${formData.estimated_cost}.`,
        completed: true,
        is_quick_fix: true, // Explicitly set for quick fix
      };
    } else {
      // Non-quick fix path (Priority Queue - existing logic)
      if (!aiEstimate) {
        console.error("AI estimate missing for non-quick fix. Cannot proceed.");
        return;
      }
      updatedIssue = {
        ...baseIssue,
        notes: 'Added to Priority Queue for scheduling',
        completed: false,
        is_quick_fix: false, // Explicitly set for non-quick fix
        // Add AI estimate details to the issue object for persistence/display
        current_fix_cost: aiEstimate.current_fix_cost,
        delayed_fix_cost: aiEstimate.delayed_fix_cost,
        cascade_risk_score: aiEstimate.cascade_risk_score,
        cascade_risk_reason: aiEstimate.cascade_risk_reason,
        cost_impact_reason: aiEstimate.cost_impact_reason,
        cost_disclaimer: aiEstimate.cost_disclaimer,
        min_hours: aiEstimate.min_hours,
        max_hours: aiEstimate.max_hours,
      };

      // Create/update maintenance task in the backend only for non-quick fixes
      const taskData = {
        property_id: propertyId,
        title: updatedIssue.item_name,
        description: `Issue found during ${inspection.season} ${inspection.year} inspection in ${area.name}.\n\nDescription: ${updatedIssue.description}\n\nSeverity: ${updatedIssue.severity}\nSystem: ${updatedIssue.system}${aiEstimate ? `\n\n--- AI Risk Analysis ---\n  Cascade Risk Score: ${aiEstimate.cascade_risk_score}/10 - ${aiEstimate.cascade_risk_reason}\n  Estimated Fix Now Cost: $${aiEstimate.current_fix_cost.toLocaleString()}\n  Estimated Fix Later Cost: $${aiEstimate.delayed_fix_cost.toLocaleString()}\n  Cost Impact Reason: ${aiEstimate.cost_impact_reason}\n  Estimated Labor Hours: ${formatLaborHours(aiEstimate.min_hours, aiEstimate.max_hours)}\n\n${aiEstimate.cost_disclaimer}` : ''}`,
        system_type: updatedIssue.system,
        priority: updatedIssue.severity === 'Urgent' ? 'High' : updatedIssue.severity === 'Flag' ? 'Medium' : 'Low',
        status: 'Identified',
        photo_urls: updatedIssue.photo_urls,
        current_fix_cost: aiEstimate.current_fix_cost,
        delayed_fix_cost: aiEstimate.delayed_fix_cost,
        cascade_risk_score: aiEstimate.cascade_risk_score,
        cascade_risk_reason: aiEstimate.cascade_risk_reason,
        cost_impact_reason: aiEstimate.cost_impact_reason,
        has_cascade_alert: aiEstimate.cascade_risk_score >= 7,
        execution_type: updatedIssue.who_will_fix === 'diy' ? 'DIY' : updatedIssue.who_will_fix === 'professional' ? 'Professional' : 'Not Decided',
        estimated_hours: aiEstimate.max_hours // Use max hours as a single estimate for task
      };

      try {
        await createTaskMutation.mutateAsync(taskData);

        // Update related baseline systems
        if (updatedIssue.system !== 'General') {
          const systemsToUpdate = baselineSystems.filter(s => s.system_type === updatedIssue.system);
          for (const system of systemsToUpdate) {
            const conditionUpdates = {};

            if (updatedIssue.severity === 'Urgent') {
              conditionUpdates.condition = 'Urgent';
            } else if (updatedIssue.severity === 'Flag' && ['Good', 'Excellent'].includes(system.condition)) {
              conditionUpdates.condition = 'Fair';
            }

            const existingWarnings = system.warning_signs_present || [];
            const newWarning = safeSubstring(updatedIssue.description, 100);
            if (newWarning && !existingWarnings.includes(newWarning)) {
              conditionUpdates.warning_signs_present = [...existingWarnings, newWarning];
            }

            const timestamp = new Date().toLocaleDateString();
            const existingNotes = system.condition_notes || '';
            const newNote = `\n[${timestamp}] ${inspection.season} ${inspection.year} Inspection: ${updatedIssue.description}`;
            conditionUpdates.condition_notes = existingNotes.includes(newNote) ? existingNotes : existingNotes + newNote;

            if (Object.keys(conditionUpdates).length > 0) {
              await updateSystemMutation.mutateAsync({
                systemId: system.id,
                updates: conditionUpdates
              });
            }
          }
        }
      } catch (error) {
        console.error("Error creating task or updating system:", error);
      }
    }

    // Update the local list of issues
    let newIssuesList = [...existingIssues];
    if (editingIssueIndex !== null) {
      newIssuesList[editingIssueIndex] = updatedIssue;
    } else {
      newIssuesList.push(updatedIssue);
    }

    // Call onComplete with the modified list of issues
    onComplete(newIssuesList);
  };

  const canAskQuickFixQuestion = formData.system && formData.description && formData.estimated_cost;
  const canSubmitQuickFix = formData.is_quick_fix === true && formData.who_will_fix;
  const canSubmitPriorityQueue = formData.is_quick_fix === false && aiEstimate && formData.who_will_fix;
  const canSubmitResolved = formData.resolvedDuringInspection && formData.resolutionNotes.trim() !== ''; // Must have notes if resolved

  return (
    <>
      <div className="min-h-screen bg-white pb-8">
        <div className="mobile-container md:max-w-3xl md:mx-auto">
          <Button
            variant="ghost"
            onClick={() => onComplete(existingIssues)} // Go back with original issues if cancelled
            className="mb-4"
            style={{ minHeight: '44px' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Area Inspection
          </Button>

          <Card className="border-2 mobile-card" style={{ borderColor: '#FF6B35' }}>
            <CardHeader>
              <CardTitle style={{ color: '#1B365D', fontSize: '20px' }}>
                {editingIssue ? 'Edit Issue' : 'Document Issue Found'}
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

              {/* NEW: Fixed During Inspection Section */}
              <div className="mt-4 pt-4 border-t">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.resolvedDuringInspection || false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData(prev => ({
                        ...prev,
                        resolvedDuringInspection: checked,
                        // Reset other decision fields if this is checked, to ensure clean state
                        is_quick_fix: checked ? null : prev.is_quick_fix,
                        who_will_fix: checked ? '' : prev.who_will_fix,
                        resolutionNotes: checked ? prev.resolutionNotes : '',
                        resolutionCost: checked ? prev.resolutionCost : 0,
                        resolutionTimeMinutes: checked ? prev.resolutionTimeMinutes : 0,
                        resolutionPhotoUrl: checked ? prev.resolutionPhotoUrl : ''
                      }));
                      // Hide other questions if this is enabled
                      if (checked) {
                        setShowQuickFixQuestion(false);
                        setEditingFixDecision(false);
                        setAiEstimate(null); // Clear AI estimate if switching to fixed
                      }
                    }}
                    className="w-4 h-4"
                    style={{ minHeight: '20px', minWidth: '20px' }}
                  />
                  <span className="font-semibold text-green-700">
                    ✓ This issue was fixed during the inspection
                  </span>
                </label>
                
                {formData.resolvedDuringInspection && (
                  <div className="mt-3 space-y-3 bg-green-50 border border-green-200 rounded-lg p-4">
                    
                    <div>
                      <Label htmlFor="resolution-notes">What did you do to fix it? <span className="text-red-500">*</span></Label>
                      <Textarea
                        id="resolution-notes"
                        value={formData.resolutionNotes}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          resolutionNotes: e.target.value
                        }))}
                        placeholder="E.g., Replaced air filter with new one; Tightened loose screw; Reset breaker"
                        rows={2}
                        required
                        className="w-full px-3 py-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        style={{ minHeight: '44px', backgroundColor: '#FFFFFF' }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="resolution-cost">Cost (if any)</Label>
                        <Input
                          id="resolution-cost"
                          type="number"
                          value={formData.resolutionCost || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            resolutionCost: parseFloat(e.target.value) || 0
                          }))}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          style={{ minHeight: '44px', backgroundColor: '#FFFFFF' }}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="resolution-time">Time (minutes)</Label>
                        <Input
                          id="resolution-time"
                          type="number"
                          value={formData.resolutionTimeMinutes || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            resolutionTimeMinutes: parseInt(e.target.value) || 0
                          }))}
                          placeholder="5"
                          className="w-full px-3 py-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          style={{ minHeight: '44px', backgroundColor: '#FFFFFF' }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="resolution-photo">After photo (optional)</Label>
                      <input
                        id="resolution-photo"
                        type="file"
                        accept="image/*"
                        onChange={handleResolutionPhotoUpload}
                        disabled={uploadingResolution}
                        className="w-full text-sm"
                        style={{ minHeight: '44px' }}
                      />
                      {uploadingResolution && <p className="text-sm text-gray-600 mt-1">Uploading...</p>}
                      {formData.resolutionPhotoUrl && (
                        <div className="mt-2 relative inline-block">
                          <img 
                            src={formData.resolutionPhotoUrl}
                            alt="After fix"
                            className="w-32 h-32 object-cover rounded border border-green-300"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, resolutionPhotoUrl: '' }))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            style={{ minHeight: '28px', minWidth: '28px' }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={!canSubmitResolved || createTaskMutation.isPending}
                      className="w-full"
                      style={{ backgroundColor: '#28A745', minHeight: '56px', fontSize: '16px' }}
                    >
                      {createTaskMutation.isPending ? 'Saving...' : editingIssue ? 'Update & Mark as Fixed' : 'Save as Fixed ✓'}
                    </Button>
                    
                  </div>
                )}
              </div>

              {/* Quick Fix Question */}
              { !formData.resolvedDuringInspection && formData.is_quick_fix === null && !showQuickFixQuestion && !editingFixDecision && (
                <Button
                  onClick={() => setShowQuickFixQuestion(true)}
                  disabled={!canAskQuickFixQuestion}
                  className="w-full"
                  style={{ backgroundColor: '#28A745', minHeight: '56px', fontSize: '16px' }}
                >
                  Continue
                </Button>
              )}

              { !formData.resolvedDuringInspection && (showQuickFixQuestion || editingFixDecision) && (
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

              {/* Quick Fix Path */}
              { !formData.resolvedDuringInspection && formData.is_quick_fix === true && !editingFixDecision && (
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
                        {createTaskMutation.isPending ? 'Saving...' : editingIssue ? 'Update Issue' : 'Mark as Fixed & Continue'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Priority Queue Path with AI Estimate */}
              { !formData.resolvedDuringInspection && formData.is_quick_fix === false && !editingFixDecision && (
                <>
                  {aiEstimating && (
                    <Card className="border-2 border-purple-300 bg-purple-50">
                      <CardContent className="p-6 text-center">
                        <div className="animate-spin text-5xl mb-4">⚙️</div>
                        <p className="font-medium text-gray-700">AI analyzing cascade risk and labor hours...</p>
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

                        <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
                          <p className="text-xs text-yellow-900 leading-relaxed">
                            {aiEstimate.cost_disclaimer}
                          </p>
                        </div>

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

                        {/* NEW: Labor Hours Estimate */}
                        {aiEstimate.min_hours != null && aiEstimate.max_hours != null && (
                          <div className="mb-4 p-4 bg-white rounded border">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-5 h-5 text-blue-600" />
                              <span className="font-semibold">Estimated Labor Time:</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">DIY / Handyman Time:</span>
                              <span className="font-bold text-blue-700">
                                {formatLaborHours(aiEstimate.min_hours, aiEstimate.max_hours)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-2 italic">
                              Actual time may vary based on skill level, tool access, and specific conditions
                            </p>
                          </div>
                        )}

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
                            {createTaskMutation.isPending ? 'Saving...' : editingIssue ? 'Update Issue' : 'Add to Priority Queue'}
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
          description: `Issue found during ${inspection.season} ${inspection.year} inspection in ${area.name}:\n\n${formData.description}\n\nSeverity: ${formData.severity}\nSystem: ${formData.system}\n\nEstimated Cost: ${formData.estimated_cost}\nEstimated Labor: ${aiEstimate?.min_hours != null && aiEstimate?.max_hours != null ? formatLaborHours(aiEstimate.min_hours, aiEstimate.max_hours) : 'Unknown'}\n\nNote: Cost and time estimates are AI-generated averages. Actual costs may vary.`,
          severity: formData.severity,
          system_type: formData.system,
          photo_urls: formData.photo_urls,
          title: `${formData.system}: ${safeSubstring(formData.description, 50)}`,
          notes: `Found during ${inspection.season} ${inspection.year} inspection. AI cascade risk: ${aiEstimate?.cascade_risk_score}/10`
        }}
      />
    </>
  );
}
