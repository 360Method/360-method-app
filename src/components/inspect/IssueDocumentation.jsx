import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, X, Lightbulb, AlertTriangle, Clock, DollarSign, Sparkles } from "lucide-react";

import ServiceRequestDialog from "../services/ServiceRequestDialog";
import { estimateCascadeRisk } from "../shared/CascadeEstimator";

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
  const [isQuickFix, setIsQuickFix] = React.useState(null);
  const [estimatedCost, setEstimatedCost] = React.useState('');
  const [whoWillFix, setWhoWillFix] = React.useState('not_sure');
  const [showServiceDialog, setShowServiceDialog] = React.useState(false);
  const [isEstimating, setIsEstimating] = React.useState(false);

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
    status: 'Identified'
  };

  const handleSave = async () => {
    if (currentIssueData.is_quick_fix === false) {
      setIsEstimating(true);
      
      try {
        // Use AI to estimate cascade risk and costs
        const aiEstimates = await estimateCascadeRisk({
          description: currentIssueData.description,
          system_type: selectedSystemData?.system_type || 'General',
          severity: currentIssueData.severity,
          area: currentIssueData.area,
          estimated_cost: currentIssueData.estimated_cost
        });

        await createTaskMutation.mutateAsync({
          property_id: property.id,
          title: `${currentIssueData.area}: ${currentIssueData.description.substring(0, 50)}${currentIssueData.description.length > 50 ? '...' : ''}`,
          description: `Issue found during ${inspection.season} ${inspection.year} inspection.\n\n${currentIssueData.description}`,
          system_type: selectedSystemData?.system_type || 'General',
          priority: currentIssueData.severity === 'Urgent' ? 'High' : currentIssueData.severity === 'Flag' ? 'Medium' : 'Low',
          status: 'Identified',
          cascade_risk_score: aiEstimates.cascade_risk_score,
          cascade_risk_reason: aiEstimates.cascade_risk_reason,
          current_fix_cost: aiEstimates.current_fix_cost,
          delayed_fix_cost: aiEstimates.delayed_fix_cost,
          cost_impact_reason: aiEstimates.cost_impact_reason,
          urgency_timeline: currentIssueData.severity === 'Urgent' ? 'Immediate' : currentIssueData.severity === 'Flag' ? '30-90 days' : 'Next inspection',
          has_cascade_alert: aiEstimates.cascade_risk_score >= 7,
          photo_urls: currentIssueData.photo_urls,
          execution_type: currentIssueData.who_will_fix === 'diy' ? 'DIY' : currentIssueData.who_will_fix === 'professional' ? 'Professional' : 'Not Decided'
        });
      } catch (error) {
        console.error("Error creating task:", error);
      } finally {
        setIsEstimating(false);
      }
    }

    onSave(currentIssueData);
  };

  const serviceDialogPrefilledData = {
    property_id: property.id,
    service_type: "Specific Task Repair",
    description: `${currentIssueData.area}: ${currentIssueData.description}`,
    urgency: currentIssueData.severity === 'Urgent' ? 'Emergency' : 'High',
    photo_urls: currentIssueData.photo_urls,
    notes: currentIssueData.description
  };

  const isFormValid = description.trim() && isQuickFix !== null && (isQuickFix === true || estimatedCost);

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="mobile-container md:max-w-4xl md:mx-auto">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="mb-4"
          style={{ minHeight: '44px' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-6">
          <h1 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '24px', lineHeight: '1.2' }}>
            Document Issue - {area.name}
          </h1>
        </div>

        {/* AI Estimation Info Banner */}
        {isQuickFix === false && estimatedCost && (
          <Card className="border-2 border-purple-300 bg-purple-50 mobile-card mb-4">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-purple-900 mb-1">
                    🤖 AI-Powered Analysis
                  </p>
                  <p className="text-sm text-purple-800">
                    When you save this issue, our AI will analyze the cascade risk and provide detailed cost estimates based on your description. This helps you understand the true urgency and potential savings of acting now vs. later.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Selection */}
        {relevantSystems.length > 1 && (
          <Card className="border-none shadow-sm mobile-card">
            <CardContent className="p-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Which system?</label>
              <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                <SelectTrigger className="w-full" style={{ minHeight: '48px' }}>
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
          <Card className="border-none shadow-sm mobile-card">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-700 mb-1">System:</p>
              <p className="font-semibold" style={{ color: '#1B365D', fontSize: '18px' }}>
                {selectedSystemData?.nickname || selectedSystemData?.system_type}
              </p>
            </CardContent>
          </Card>
        )}

        <hr className="border-gray-200 my-6" />

        {/* Description */}
        <Card className="border-none shadow-sm mobile-card">
          <CardContent className="p-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">What did you find? *</label>
            <p className="text-sm text-gray-600 mb-3">
              Be specific about what you observed - the more detail you provide, the better our AI can estimate cascade risks and costs.
            </p>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Filter extremely dirty, not changed in 6+ months based on color. Airflow noticeably reduced from vents in living room and master bedroom."
              rows={4}
              className="w-full"
              style={{ minHeight: '120px', fontSize: '16px' }}
            />
          </CardContent>
        </Card>

        {/* Photos */}
        <Card className="border-none shadow-sm mobile-card">
          <CardContent className="p-4">
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              📷 Add Photos (Recommended)
            </label>
            <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors" style={{ minHeight: '56px' }}>
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
                      style={{ minHeight: '28px', minWidth: '28px' }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <hr className="border-gray-200 my-6" />

        {/* Severity Rating */}
        <Card className="border-none shadow-sm mobile-card">
          <CardContent className="p-4 space-y-3">
            <h2 className="font-bold" style={{ color: '#1B365D', fontSize: '18px' }}>
              ⚡ SEVERITY RATING:
            </h2>
            
            {Object.entries(SEVERITY_INFO).map(([level, info]) => (
              <label
                key={level}
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  severity === level ? 'border-current shadow-md' : 'border-gray-200'
                }`}
                style={severity === level ? { borderColor: info.color, backgroundColor: `${info.color}10`, minHeight: '56px' } : { minHeight: '56px' }}
              >
                <input
                  type="radio"
                  value={level}
                  checked={severity === level}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="mt-1"
                  style={{ minWidth: '18px', minHeight: '18px' }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{info.icon}</span>
                    <span className="font-bold" style={{ color: info.color, fontSize: '16px' }}>{level.toUpperCase()}</span>
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
          <Card className="border-2 mobile-card" style={{ borderColor: '#28A745', backgroundColor: '#F0FFF4' }}>
            <CardContent className="p-4 space-y-4">
              <h2 className="font-bold" style={{ color: '#1B365D', fontSize: '18px' }}>
                ⚡ CAN YOU FIX THIS IN 5 MINUTES OR LESS? *
              </h2>
              <p className="text-gray-700" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                Quick fixes (5 min or less) should be done immediately. Longer tasks go to your Priority Queue with AI-powered cascade analysis.
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={() => setIsQuickFix(true)}
                  className="w-full justify-start text-left p-4 h-auto"
                  variant="outline"
                  style={{ minHeight: '56px' }}
                >
                  <div>
                    <p className="font-semibold mb-1">○ Yes - I can fix this now</p>
                    <p className="text-sm text-gray-600">Filter replacement, tightening screws, testing detectors</p>
                  </div>
                </Button>
                
                <Button
                  onClick={() => setIsQuickFix(false)}
                  className="w-full justify-start text-left p-4 h-auto"
                  variant="outline"
                  style={{ minHeight: '56px' }}
                >
                  <div>
                    <p className="font-semibold mb-1 flex items-center gap-2">
                      ● No - Needs more time/help
                      <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Analysis
                      </Badge>
                    </p>
                    <p className="text-sm text-gray-600">Add to Priority Queue with smart risk & cost analysis</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estimated Cost & Who Will Fix - Only if not a quick fix */}
        {isQuickFix === false && (
          <>
            <Card className="border-none shadow-sm mobile-card">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6" style={{ color: '#1B365D' }} />
                  <h2 className="font-bold" style={{ color: '#1B365D', fontSize: '18px' }}>
                    💰 ESTIMATED COST: *
                  </h2>
                </div>
                
                <Select value={estimatedCost} onValueChange={setEstimatedCost}>
                  <SelectTrigger className="w-full" style={{ minHeight: '48px' }}>
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
                
                <p className="text-xs text-gray-600">
                  💡 This helps our AI provide more accurate delayed-cost estimates
                </p>
              </CardContent>
            </Card>

            <hr className="border-gray-200 my-6" />

            {/* Who Will Fix */}
            <Card className="border-none shadow-sm mobile-card">
              <CardContent className="p-4 space-y-4">
                <h2 className="font-bold" style={{ color: '#1B365D', fontSize: '18px' }}>
                  📋 ACTION PLAN:
                </h2>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Who will fix this?</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2" style={{ minHeight: '44px' }}>
                      <input
                        type="radio"
                        value="diy"
                        checked={whoWillFix === 'diy'}
                        onChange={(e) => setWhoWillFix(e.target.value)}
                        style={{ minWidth: '18px', minHeight: '18px' }}
                      />
                      <span>I'll do it myself (DIY)</span>
                    </label>
                    <label className="flex items-center gap-2" style={{ minHeight: '44px' }}>
                      <input
                        type="radio"
                        value="professional"
                        checked={whoWillFix === 'professional'}
                        onChange={(e) => setWhoWillFix(e.target.value)}
                        style={{ minWidth: '18px', minHeight: '18px' }}
                      />
                      <span>Hire a professional</span>
                    </label>
                    <label className="flex items-center gap-2" style={{ minHeight: '44px' }}>
                      <input
                        type="radio"
                        value="not_sure"
                        checked={whoWillFix === 'not_sure'}
                        onChange={(e) => setWhoWillFix(e.target.value)}
                        style={{ minWidth: '18px', minHeight: '18px' }}
                      />
                      <span>Not sure yet</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Validation Message */}
        {!isFormValid && (
          <Card className="border-2 mobile-card" style={{ borderColor: '#FF6B35', backgroundColor: '#FFF5F2' }}>
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#FF6B35' }} />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Complete Required Fields:</p>
                  <ul className="text-sm text-gray-700 space-y-1 pl-5 list-disc">
                    {!description.trim() && <li>Enter a description of the issue</li>}
                    {isQuickFix === null && <li>Answer if this is a quick fix (5 min or less)</li>}
                    {isQuickFix === false && !estimatedCost && <li>Select estimated cost range</li>}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-6 border-t">
          <Button
            onClick={handleSave}
            disabled={!isFormValid || createTaskMutation.isPending || isEstimating}
            className="w-full font-bold"
            style={{ 
              backgroundColor: isFormValid && !createTaskMutation.isPending && !isEstimating ? '#28A745' : '#CCCCCC',
              color: isFormValid && !createTaskMutation.isPending && !isEstimating ? '#FFFFFF' : '#666666',
              minHeight: '56px', 
              fontSize: '16px',
              cursor: isFormValid && !createTaskMutation.isPending && !isEstimating ? 'pointer' : 'not-allowed',
              opacity: isFormValid && !createTaskMutation.isPending && !isEstimating ? 1 : 0.6
            }}
          >
            {isEstimating ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-pulse" />
                AI Analyzing Cascade Risk...
              </span>
            ) : createTaskMutation.isPending ? (
              'Saving...'
            ) : (
              'Save Issue & Continue Inspection'
            )}
          </Button>

          {/* Professional Service Option */}
          {((severity === 'Urgent' || severity === 'Flag') && description && isQuickFix !== null) && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Can't or don't want to fix this yourself?
              </p>
              <Button
                onClick={() => setShowServiceDialog(true)}
                variant="outline"
                className="w-full"
                style={{ borderColor: '#28A745', color: '#28A745', minHeight: '48px' }}
              >
                Request Professional Service
              </Button>
            </div>
          )}

          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full"
            style={{ minHeight: '48px' }}
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