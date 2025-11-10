
import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, X, Lightbulb, AlertTriangle, Clock, DollarSign } from "lucide-react";

import ServiceRequestDialog from "../services/ServiceRequestDialog";

const SEVERITY_INFO = {
  Urgent: {
    icon: '🚨',
    description: 'Safety hazard or will cause damage soon',
    examples: 'Active leak, gas smell, sparking outlet, no heat/AC in extreme weather',
    color: '#DC3545'
  },
  Flag: {
    icon: '⚠️',
    description: 'Needs attention within weeks/months to prevent bigger problems',
    examples: 'Worn parts, minor leaks, aging systems, preventive maintenance',
    color: '#FF6B35'
  },
  Monitor: {
    icon: '✅',
    description: 'Working now, just track at next inspection',
    examples: 'Minor wear, cosmetic issues, long-term planning',
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

export default function IssueDocumentation({ area, inspection, property, relevantSystems, onSave, onCancel }) {
  const [selectedSystem, setSelectedSystem] = React.useState(relevantSystems.length === 1 ? relevantSystems[0].id : '');
  const [description, setDescription] = React.useState('');
  const [photos, setPhotos] = React.useState([]);
  const [uploading, setUploading] = React.useState(false);
  const [severity, setSeverity] = React.useState('Flag');
  const [isQuickFix, setIsQuickFix] = React.useState(null); // null means not answered yet
  const [estimatedCost, setEstimatedCost] = React.useState('');
  const [whoWillFix, setWhoWillFix] = React.useState('not_sure');
  const [showServiceDialog, setShowServiceDialog] = React.useState(false); // New state

  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      return base44.entities.MaintenanceTask.create(taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
    },
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => base44.integrations.Core.UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      setPhotos(prev => [...prev, ...urls]);
    } catch (error) {
      console.error("Upload error:", error);
    }
    setUploading(false);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const selectedSystemData = relevantSystems.find(s => s.id === selectedSystem);

  // Construct currentIssueData for rendering and eventual saving
  const currentIssueData = {
    area: area.name,
    area_id: area.id,
    system_name: selectedSystemData?.nickname || selectedSystemData?.system_type || area.name,
    system_id: selectedSystem || null,
    description,
    photo_urls: photos,
    severity,
    is_quick_fix: isQuickFix,
    estimated_cost: estimatedCost,
    who_will_fix: whoWillFix,
    found_date: new Date().toISOString().split('T')[0],
    status: 'Identified' // Default status. If it was a quick fix, it's just a candidate, not necessarily fixed yet.
  };

  const handleSave = async () => {
    // Only create a MaintenanceTask if it's explicitly NOT a quick fix,
    // or if `isQuickFix` is true but the user wants to add it to the queue (this option is removed from UI, so assume `isQuickFix` = true means no task initially)
    // If it's a quick fix (`isQuickFix === true`), we assume it's handled or user can request service separately.
    if (currentIssueData.is_quick_fix === false) {
      const cascadeRiskScores = {
        'Urgent': 9,
        'Flag': 6,
        'Monitor': 3
      };

      const costEstimates = {
        'free': { current: 0, delayed: 500 },
        '1-50': { current: 25, delayed: 1000 },
        '50-200': { current: 125, delayed: 2500 },
        '200-500': { current: 350, delayed: 5000 },
        '500-1500': { current: 1000, delayed: 10000 },
        '1500+': { current: 3000, delayed: 20000 },
        'unknown': { current: 500, delayed: 5000 }
      };

      const costs = costEstimates[currentIssueData.estimated_cost] || { current: 200, delayed: 2000 };

      await createTaskMutation.mutateAsync({
        property_id: property.id,
        title: `${currentIssueData.area}: ${currentIssueData.description.substring(0, 50)}${currentIssueData.description.length > 50 ? '...' : ''}`,
        description: `Issue found during ${inspection.season} ${inspection.year} inspection.\n\n${currentIssueData.description}`,
        system_type: selectedSystemData?.system_type || 'General',
        priority: currentIssueData.severity === 'Urgent' ? 'High' : currentIssueData.severity === 'Flag' ? 'Medium' : 'Low',
        status: 'Identified',
        cascade_risk_score: cascadeRiskScores[currentIssueData.severity],
        current_fix_cost: costs.current,
        delayed_fix_cost: costs.delayed,
        urgency_timeline: currentIssueData.severity === 'Urgent' ? 'Immediate' : currentIssueData.severity === 'Flag' ? '30-90 days' : 'Next inspection',
        has_cascade_alert: currentIssueData.severity === 'Urgent',
        photo_urls: currentIssueData.photo_urls,
        execution_type: currentIssueData.who_will_fix === 'diy' ? 'DIY' : currentIssueData.who_will_fix === 'professional' ? 'Professional' : 'Not Decided'
      });
    }

    onSave(currentIssueData);
  };

  const serviceDialogPrefilledData = {
    property_id: property.id,
    service_type: "Specific Task Repair",
    description: `${currentIssueData.area}: ${currentIssueData.description}`,
    urgency: currentIssueData.severity === 'Urgent' ? 'Emergency' : 'High',
    photo_urls: currentIssueData.photo_urls,
    notes: currentIssueData.description // Using description as notes for the service request
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <Button
          variant="ghost"
          onClick={onCancel}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B365D' }}>Document Issue - {area.name}</h1>
        </div>

        {/* System Selection */}
        {relevantSystems.length > 1 && (
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Which system?</label>
              <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select system" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {relevantSystems.map((system) => (
                    <SelectItem key={system.id} value={system.id}>
                      {system.nickname || system.system_type}
                      {system.brand_model && ` - ${system.brand_model}`}
                      {system.installation_year && ` (${new Date().getFullYear() - system.installation_year} years old)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {relevantSystems.length === 1 && (
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-700 mb-1">System:</p>
              <p className="text-lg font-semibold" style={{ color: '#1B365D' }}>
                {selectedSystemData?.nickname || selectedSystemData?.system_type}
              </p>
            </CardContent>
          </Card>
        )}

        <hr className="border-gray-200" />

        {/* Description */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">What did you find?</label>
            <p className="text-sm text-gray-600 mb-3">(Description - be specific)</p>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Filter extremely dirty, not changed in 6+ months based on color. Airflow noticeably reduced from vents in living room and master bedroom."
              rows={4}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Photos */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              📷 Add Photos (Recommended)
            </label>
            <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploading}
              />
              <span className="text-gray-600">{uploading ? 'Uploading...' : `Upload Photos (${photos.length} photos)`}</span>
            </label>
            {photos.length > 0 && (
              <div className="flex gap-3 flex-wrap mt-4">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt="" className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <hr className="border-gray-200" />

        {/* Severity Rating */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold" style={{ color: '#1B365D' }}>⚡ SEVERITY RATING:</h2>
            
            {Object.entries(SEVERITY_INFO).map(([level, info]) => (
              <label
                key={level}
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  severity === level ? 'border-current shadow-md' : 'border-gray-200'
                }`}
                style={severity === level ? { borderColor: info.color, backgroundColor: `${info.color}10` } : {}}
              >
                <input
                  type="radio"
                  value={level}
                  checked={severity === level}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{info.icon}</span>
                    <span className="font-bold text-lg" style={{ color: info.color }}>{level.toUpperCase()}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">{info.description}</p>
                  <p className="text-xs text-gray-600">Examples: {info.examples}</p>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Quick Fix Question */}
        {isQuickFix === null && (
          <Card className="border-2" style={{ borderColor: '#28A745', backgroundColor: '#F0FFF4' }}>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold" style={{ color: '#1B365D' }}>
                ⚡ CAN YOU FIX THIS IN 5 MINUTES OR LESS?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                This is critical. Quick fixes (5 min or less) should be done immediately during inspection. Longer tasks go to your Priority Queue to schedule when time allows.
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={() => setIsQuickFix(true)}
                  className="w-full justify-start text-left p-4 h-auto"
                  variant="outline"
                >
                  <div>
                    <p className="font-semibold mb-1">○ Yes - I can fix this now (Quick Fix)</p>
                    <p className="text-sm text-gray-600">→ Filter replacement, tightening loose screws, testing detectors, etc.</p>
                  </div>
                </Button>
                
                <Button
                  onClick={() => setIsQuickFix(false)}
                  className="w-full justify-start text-left p-4 h-auto"
                  variant="outline"
                >
                  <div>
                    <p className="font-semibold mb-1">● No - Needs more time or help (Add to Priority Queue)</p>
                    <p className="text-sm text-gray-600">→ Research needed, special tools, technical work, hire professional</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estimated Cost & Who Will Fix - Only if not a quick fix */}
        {isQuickFix === false && (
          <>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6" style={{ color: '#1B365D' }} />
                  <h2 className="text-xl font-bold" style={{ color: '#1B365D' }}>💰 ESTIMATED COST TO FIX:</h2>
                </div>
                
                <Select value={estimatedCost} onValueChange={setEstimatedCost}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select cost range" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {COST_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <hr className="border-gray-200" />

            {/* Who Will Fix */}
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold" style={{ color: '#1B365D' }}>📋 ACTION PLAN:</h2>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Who will fix this?</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="diy"
                        checked={whoWillFix === 'diy'}
                        onChange={(e) => setWhoWillFix(e.target.value)}
                      />
                      <span>I'll do it myself (DIY)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="professional"
                        checked={whoWillFix === 'professional'}
                        onChange={(e) => setWhoWillFix(e.target.value)}
                      />
                      <span>Hire a professional</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="not_sure"
                        checked={whoWillFix === 'not_sure'}
                        onChange={(e) => setWhoWillFix(e.target.value)}
                      />
                      <span>Not sure yet</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-6 border-t">
          <Button
            onClick={handleSave}
            disabled={
                !currentIssueData.description || // Description is required
                currentIssueData.is_quick_fix === null || // Must have made a quick fix decision
                (currentIssueData.is_quick_fix === false && !currentIssueData.estimated_cost) || // If not quick fix, estimated cost is required
                createTaskMutation.isPending // Disable during save operation
            }
            className="w-full h-14 text-lg font-bold"
            style={{ backgroundColor: '#28A745' }}
          >
            {createTaskMutation.isPending ? 'Saving...' : 'Save Issue & Continue Inspection'}
          </Button>

          {/* Professional Service Option */}
          {((currentIssueData.severity === 'Urgent' || currentIssueData.severity === 'Flag') && (currentIssueData.description && currentIssueData.is_quick_fix !== null)) && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Can't or don't want to fix this yourself?
              </p>
              <Button
                onClick={() => setShowServiceDialog(true)}
                variant="outline"
                className="w-full"
                style={{ borderColor: '#28A745', color: '#28A745' }}
              >
                Request Professional Service for This Issue
              </Button>
            </div>
          )}

          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>

      <ServiceRequestDialog
        open={showServiceDialog}
        onClose={() => setShowServiceDialog(false)}
        prefilledData={serviceDialogPrefilledData}
      />
    </div>
  );
}
