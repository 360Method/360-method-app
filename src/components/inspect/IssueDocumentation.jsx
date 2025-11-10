import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, X, Lightbulb, AlertTriangle, Clock, DollarSign } from "lucide-react";

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
  const [showQuickFixDialog, setShowQuickFixDialog] = React.useState(false);

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

  const handleSave = async () => {
    const system = relevantSystems.find(s => s.id === selectedSystem);
    
    const issueData = {
      area: area.name,
      area_id: area.id,
      system_name: system?.nickname || system?.system_type || area.name,
      system_id: selectedSystem || null,
      description,
      photo_urls: photos,
      severity,
      is_quick_fix: isQuickFix,
      estimated_cost: estimatedCost,
      who_will_fix: whoWillFix,
      found_date: new Date().toISOString().split('T')[0],
      status: isQuickFix && showQuickFixDialog === 'fixed' ? 'Completed' : 'Identified'
    };

    // If not a quick fix or user chose to add to priority queue, create maintenance task
    if (!isQuickFix || showQuickFixDialog !== 'fixed') {
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

      const costs = costEstimates[estimatedCost] || { current: 200, delayed: 2000 };

      await createTaskMutation.mutateAsync({
        property_id: property.id,
        title: `${area.name}: ${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`,
        description: `Issue found during ${inspection.season} ${inspection.year} inspection.\n\n${description}`,
        system_type: system?.system_type || 'General',
        priority: severity === 'Urgent' ? 'High' : severity === 'Flag' ? 'Medium' : 'Low',
        status: 'Identified',
        cascade_risk_score: cascadeRiskScores[severity],
        current_fix_cost: costs.current,
        delayed_fix_cost: costs.delayed,
        urgency_timeline: severity === 'Urgent' ? 'Immediate' : severity === 'Flag' ? '30-90 days' : 'Next inspection',
        has_cascade_alert: severity === 'Urgent',
        photo_urls: photos,
        execution_type: whoWillFix === 'diy' ? 'DIY' : whoWillFix === 'professional' ? 'Professional' : 'Not Decided'
      });
    }

    onSave(issueData);
  };

  // Quick fix decision handling
  if (isQuickFix && showQuickFixDialog) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto p-4 md:p-8 flex items-center justify-center min-h-screen">
          <Card className="border-2 shadow-lg w-full" style={{ borderColor: '#28A745' }}>
            <CardContent className="p-8 text-center space-y-6">
              <div className="text-5xl">⚡</div>
              <h1 className="text-3xl font-bold" style={{ color: '#1B365D' }}>QUICK FIX IDENTIFIED</h1>
              <p className="text-gray-700 leading-relaxed">
                This can be done in 5 minutes or less.
              </p>
              <p className="font-semibold text-lg" style={{ color: '#1B365D' }}>
                RECOMMENDED: Fix it right now during your inspection walkthrough. Small tasks done immediately prevent them from being forgotten.
              </p>
              
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={() => setShowQuickFixDialog('fixed')}
                  className="w-full h-14 text-lg font-bold"
                  style={{ backgroundColor: '#28A745' }}
                >
                  ✓ I Fixed It Right Now
                </Button>
                <Button
                  onClick={() => setShowQuickFixDialog('queue')}
                  variant="outline"
                  className="w-full h-12"
                >
                  Add to Priority Queue Instead
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isQuickFix !== null && showQuickFixDialog) {
    if (showQuickFixDialog === 'fixed' || showQuickFixDialog === 'queue') {
      handleSave();
      return null;
    }
  }

  const selectedSystemData = relevantSystems.find(s => s.id === selectedSystem);

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
              <Upload className="w-5 h-5 mr-2 text-gray-500" />
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

        {/* Estimated Cost */}
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

        {/* Save Button */}
        <Button
          onClick={() => {
            if (isQuickFix === true) {
              setShowQuickFixDialog('prompt');
            } else {
              handleSave();
            }
          }}
          disabled={!description || !severity || isQuickFix === null || (isQuickFix === false && !estimatedCost)}
          className="w-full h-14 text-lg font-bold"
          style={{ backgroundColor: '#28A745' }}
        >
          Save Issue
        </Button>
      </div>
    </div>
  );
}