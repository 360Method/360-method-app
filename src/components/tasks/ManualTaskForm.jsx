import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Upload, X, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

async function enrichTaskWithAI(taskId, taskData) {
  const { title, description, system_type, priority } = taskData;
  
  if (!title || !description || !system_type) {
    console.warn('Task missing required fields for AI enrichment');
    return;
  }

  try {
    const [timeEstimate, sowResult, toolsAndMaterials, videoResults] = await Promise.all([
      base44.integrations.Core.InvokeLLM({
        prompt: `Given the maintenance task:
Title: "${title}"
Description: "${description}"
System Type: "${system_type}"
Priority: "${priority}"

Estimate the time required for an average DIY homeowner to complete this task. Consider standard tools and basic to intermediate skill level.

Output ONLY a single numeric value representing hours (e.g., 0.5, 1, 2.5, 8). No other text.`,
        response_json_schema: {
          type: "object",
          properties: { hours: { type: "number" } }
        }
      }).catch(err => ({ hours: null })),

      base44.integrations.Core.InvokeLLM({
        prompt: `Generate a concise Statement of Work (SOW) for this maintenance task:

Title: "${title}"
Description: "${description}"
System Type: "${system_type}"
Priority: "${priority}"

Include:
1. **Objective**: Clear goal of the task
2. **Scope of Work**: What will be done
3. **Expected Outcome**: What success looks like

Format as markdown. Be concise (3-5 sentences total).`,
        response_json_schema: {
          type: "object",
          properties: { sow: { type: "string" } }
        }
      }).catch(err => ({ sow: null })),

      base44.integrations.Core.InvokeLLM({
        prompt: `List the essential tools and materials needed for this maintenance task:

Title: "${title}"
Description: "${description}"
System Type: "${system_type}"

Provide two separate arrays: Tools (equipment) and Materials (consumables). Be specific but concise.`,
        response_json_schema: {
          type: "object",
          properties: {
            tools: { type: "array", items: { type: "string" } },
            materials: { type: "array", items: { type: "string" } }
          }
        }
      }).catch(err => ({ tools: [], materials: [] })),

      base44.integrations.Core.InvokeLLM({
        prompt: `Find helpful YouTube video tutorials for this maintenance task:

Title: "${title}"
Description: "${description}"
System Type: "${system_type}"

Search the web and find 2-3 high-quality YouTube tutorial videos. Return the video title and URL for each.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            videos: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  url: { type: "string" }
                }
              }
            }
          }
        }
      }).catch(err => ({ videos: [] }))
    ]);

    const updateData = { ai_enrichment_completed: true };

    if (timeEstimate?.hours && typeof timeEstimate.hours === 'number') {
      updateData.estimated_hours = timeEstimate.hours;
    }
    if (sowResult?.sow) updateData.ai_sow = sowResult.sow;
    if (toolsAndMaterials?.tools && Array.isArray(toolsAndMaterials.tools)) {
      updateData.ai_tools_needed = toolsAndMaterials.tools;
    }
    if (toolsAndMaterials?.materials && Array.isArray(toolsAndMaterials.materials)) {
      updateData.ai_materials_needed = toolsAndMaterials.materials;
    }
    if (videoResults?.videos && Array.isArray(videoResults.videos)) {
      updateData.ai_video_tutorials = videoResults.videos.filter(v => v.title && v.url);
    }

    await base44.entities.MaintenanceTask.update(taskId, updateData);
    console.log(`Task ${taskId} successfully enriched with AI insights`);
  } catch (error) {
    console.error('Error enriching task with AI:', error);
    await base44.entities.MaintenanceTask.update(taskId, {
      ai_enrichment_completed: true
    }).catch(err => console.error('Failed to mark enrichment status:', err));
  }
}

const SYSTEM_TYPES = [
  "HVAC", "Plumbing", "Electrical", "Roof", "Foundation",
  "Gutters", "Exterior", "Windows/Doors", "Appliances", "Landscaping", "General"
];

const PRIORITY_LEVELS = [
  { value: "High", color: "bg-red-600", label: "🔥 High - Urgent", description: "Needs immediate attention" },
  { value: "Medium", color: "bg-yellow-600", label: "⚡ Medium - Important", description: "Should be done soon" },
  { value: "Low", color: "bg-blue-600", label: "💡 Low - Can Wait", description: "Not urgent" },
  { value: "Routine", color: "bg-gray-600", label: "🔄 Routine - Scheduled", description: "Regular maintenance" }
];

const EXECUTION_TYPES = [
  { value: "DIY", label: "🔧 DIY - I'll do it myself" },
  { value: "Professional", label: "👷 Professional - Hire a pro" },
  { value: "Not Decided", label: "🤔 Not Decided - I'll decide later" }
];

export default function ManualTaskForm({ propertyId, onComplete, onCancel, open = true, prefilledDate = null }) {
  const queryClient = useQueryClient();
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    system_type: "General",
    priority: "Medium",
    status: "Identified",
    scheduled_date: prefilledDate || null,
    execution_type: "Not Decided",
    current_fix_cost: "",
    urgency_timeline: ""
  });
  const [photos, setPhotos] = React.useState([]);
  const [uploadingPhotos, setUploadingPhotos] = React.useState(false);
  const [aiEnriching, setAiEnriching] = React.useState(false);

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const task = await base44.entities.MaintenanceTask.create(taskData);
      
      setAiEnriching(true);
      enrichTaskWithAI(task.id, taskData)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
          setAiEnriching(false);
        })
        .catch(err => {
          console.error('AI enrichment failed:', err);
          setAiEnriching(false);
        });
      
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allMaintenanceTasks'] });
      onComplete();
    }
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const uploadPromises = files.map(file =>
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      setPhotos(prev => [...prev, ...urls]);
    } catch (error) {
      console.error('Photo upload failed:', error);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const taskData = {
      property_id: propertyId,
      title: formData.title,
      description: formData.description,
      system_type: formData.system_type,
      priority: formData.priority,
      status: formData.status,
      execution_type: formData.execution_type,
      photo_urls: photos,
      current_fix_cost: formData.current_fix_cost ? parseFloat(formData.current_fix_cost) : undefined,
      urgency_timeline: formData.urgency_timeline || undefined,
      scheduled_date: formData.scheduled_date ? format(new Date(formData.scheduled_date), 'yyyy-MM-dd') : undefined
    };

    createTaskMutation.mutate(taskData);
  };

  const canGoNext = () => {
    if (step === 1) return formData.title.trim().length > 0 && formData.description.trim().length > 0;
    if (step === 2) return true;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            ➕ Add New Maintenance Task
            {aiEnriching && (
              <Badge className="gap-1 bg-purple-600 text-white">
                <Sparkles className="w-3 h-3" />
                AI Enriching...
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Step {step} of 3 • Fill in the details below
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-6">
          <div className={`flex-1 h-2 rounded-full transition-all ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-2 rounded-full transition-all ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-2 rounded-full transition-all ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <p className="text-sm text-blue-900 font-semibold mb-1">📝 What needs to be done?</p>
                <p className="text-xs text-blue-800">Be specific - this helps AI provide better recommendations</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Task Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Replace HVAC air filter"
                  className="text-base"
                  style={{ minHeight: '48px' }}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what needs to be done, any symptoms you've noticed, or why this is needed..."
                  rows={5}
                  className="text-base"
                  style={{ minHeight: '120px' }}
                />
                <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                  <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5 text-purple-600" />
                  <span>The more detail you provide, the better AI can estimate time, tools, and materials needed.</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    System Type *
                  </label>
                  <Select
                    value={formData.system_type}
                    onValueChange={(value) => setFormData({ ...formData, system_type: value })}
                  >
                    <SelectTrigger style={{ minHeight: '48px' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SYSTEM_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Priority *
                  </label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger style={{ minHeight: '48px' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex flex-col items-start">
                            <span className="font-semibold">{level.label}</span>
                            <span className="text-xs text-gray-500">{level.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Planning & Timeline */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded">
                <p className="text-sm text-orange-900 font-semibold mb-1">📅 When and how?</p>
                <p className="text-xs text-orange-800">Set timeline expectations and execution approach</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  How will this be done?
                </label>
                <Select
                  value={formData.execution_type}
                  onValueChange={(value) => setFormData({ ...formData, execution_type: value })}
                >
                  <SelectTrigger style={{ minHeight: '48px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXECUTION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="text-sm">{type.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Scheduled Date (optional)
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left" style={{ minHeight: '48px' }}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduled_date
                        ? format(new Date(formData.scheduled_date), 'PPP')
                        : 'Pick a date...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.scheduled_date ? new Date(formData.scheduled_date) : undefined}
                      onSelect={(date) => setFormData({ ...formData, scheduled_date: date })}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500 mt-1">When do you plan to complete this?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Urgency Timeline (optional)
                  </label>
                  <Input
                    value={formData.urgency_timeline}
                    onChange={(e) => setFormData({ ...formData, urgency_timeline: e.target.value })}
                    placeholder="e.g., 30 days, ASAP"
                    style={{ minHeight: '48px' }}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Estimated Cost (optional)
                  </label>
                  <Input
                    type="number"
                    value={formData.current_fix_cost}
                    onChange={(e) => setFormData({ ...formData, current_fix_cost: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    style={{ minHeight: '48px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Photos & Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                <p className="text-sm text-green-900 font-semibold mb-1">📸 Add photos (optional)</p>
                <p className="text-xs text-green-800">Visual documentation helps track progress and get better quotes</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Photos
                </label>
                <div className="space-y-3">
                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {photos.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Task photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('photo-upload-task').click()}
                    disabled={uploadingPhotos}
                    style={{ minHeight: '48px' }}
                  >
                    {uploadingPhotos ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {photos.length > 0 ? 'Add More Photos' : 'Add Photos'}
                      </>
                    )}
                  </Button>
                  <input
                    id="photo-upload-task"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Review Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <p className="font-semibold text-gray-900 mb-3 text-sm">📋 Review Your Task:</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Title:</span>
                    <span className="font-semibold text-gray-900">{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">System:</span>
                    <span className="font-semibold text-gray-900">{formData.system_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <Badge className={PRIORITY_LEVELS.find(p => p.value === formData.priority)?.color}>
                      {formData.priority}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Execution:</span>
                    <span className="font-semibold text-gray-900">{formData.execution_type}</span>
                  </div>
                  {formData.scheduled_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Scheduled:</span>
                      <span className="font-semibold text-gray-900">
                        {format(new Date(formData.scheduled_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {photos.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Photos:</span>
                      <span className="font-semibold text-gray-900">{photos.length} attached</span>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Enrichment Notice */}
              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-purple-900 mb-1">
                      🤖 AI Will Automatically Generate:
                    </p>
                    <ul className="text-xs text-purple-800 leading-relaxed space-y-1">
                      <li>• Time estimation for planning</li>
                      <li>• Statement of Work (SOW)</li>
                      <li>• Tools & materials checklist</li>
                      <li>• Video tutorial links</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
                style={{ minHeight: '48px' }}
              >
                ← Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canGoNext()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                style={{ minHeight: '48px' }}
              >
                Next Step →
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createTaskMutation.isPending || !formData.title || !formData.description}
                className="flex-1 bg-green-600 hover:bg-green-700 font-bold"
                style={{ minHeight: '48px' }}
              >
                {createTaskMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Task...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Create Task
                  </>
                )}
              </Button>
            )}
            {step === 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="flex-1"
                style={{ minHeight: '48px' }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}