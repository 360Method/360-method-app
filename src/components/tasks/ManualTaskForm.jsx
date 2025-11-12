import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Upload, X, Loader2, Sparkles } from "lucide-react";
import { format } from "date-fns";

/**
 * Enriches a MaintenanceTask with AI-generated insights
 * This function runs parallel AI calls to generate:
 * - Time estimation (estimated_hours)
 * - Statement of Work (ai_sow)
 * - Tools and Materials needed
 * - Video tutorial links
 */
async function enrichTaskWithAI(taskId, taskData) {
  const { title, description, system_type, priority } = taskData;
  
  // Skip enrichment if task doesn't have sufficient data
  if (!title || !description || !system_type) {
    console.warn('Task missing required fields for AI enrichment');
    return;
  }

  try {
    // Execute all AI calls in parallel for efficiency
    const [
      timeEstimate,
      sowResult,
      toolsAndMaterials,
      videoResults
    ] = await Promise.all([
      // 1. Estimate time required
      base44.integrations.Core.InvokeLLM({
        prompt: `Given the maintenance task:
Title: "${title}"
Description: "${description}"
System Type: "${system_type}"
Priority: "${priority}"

Estimate the time required for an average DIY homeowner to complete this task. Consider:
- Standard tools and common access conditions
- Typical residential property
- Basic to intermediate skill level

Output ONLY a single numeric value representing hours (e.g., 0.5, 1, 2.5, 8). No other text.`,
        response_json_schema: {
          type: "object",
          properties: {
            hours: { type: "number" }
          }
        }
      }).catch(err => {
        console.error('Time estimation failed:', err);
        return { hours: null };
      }),

      // 2. Generate Statement of Work
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
          properties: {
            sow: { type: "string" }
          }
        }
      }).catch(err => {
        console.error('SOW generation failed:', err);
        return { sow: null };
      }),

      // 3. Generate Tools and Materials list
      base44.integrations.Core.InvokeLLM({
        prompt: `List the essential tools and materials needed for this maintenance task:

Title: "${title}"
Description: "${description}"
System Type: "${system_type}"

Provide two separate arrays:
1. Tools (equipment used, like hammer, wrench, ladder)
2. Materials (consumables, like screws, paint, caulk)

Be specific but concise. List only essentials, not optional items.`,
        response_json_schema: {
          type: "object",
          properties: {
            tools: {
              type: "array",
              items: { type: "string" }
            },
            materials: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      }).catch(err => {
        console.error('Tools/materials generation failed:', err);
        return { tools: [], materials: [] };
      }),

      // 4. Find YouTube tutorial videos
      base44.integrations.Core.InvokeLLM({
        prompt: `Find helpful YouTube video tutorials for this maintenance task:

Title: "${title}"
Description: "${description}"
System Type: "${system_type}"

Search the web and find 2-3 high-quality YouTube tutorial videos that would help someone complete this task. 
Return the video title and URL for each.`,
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
      }).catch(err => {
        console.error('Video search failed:', err);
        return { videos: [] };
      })
    ]);

    // Prepare update data
    const updateData = {
      ai_enrichment_completed: true
    };

    // Add time estimate if available
    if (timeEstimate?.hours && typeof timeEstimate.hours === 'number') {
      updateData.estimated_hours = timeEstimate.hours;
    }

    // Add SOW if available
    if (sowResult?.sow) {
      updateData.ai_sow = sowResult.sow;
    }

    // Add tools and materials if available
    if (toolsAndMaterials?.tools && Array.isArray(toolsAndMaterials.tools)) {
      updateData.ai_tools_needed = toolsAndMaterials.tools;
    }
    if (toolsAndMaterials?.materials && Array.isArray(toolsAndMaterials.materials)) {
      updateData.ai_materials_needed = toolsAndMaterials.materials;
    }

    // Add video tutorials if available
    if (videoResults?.videos && Array.isArray(videoResults.videos)) {
      updateData.ai_video_tutorials = videoResults.videos.filter(v => v.title && v.url);
    }

    // Update the task with all AI-generated data
    await base44.entities.MaintenanceTask.update(taskId, updateData);

    console.log(`Task ${taskId} successfully enriched with AI insights`);
  } catch (error) {
    console.error('Error enriching task with AI:', error);
    // Mark enrichment as attempted even if it failed
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
  { value: "High", color: "bg-red-600 text-white" },
  { value: "Medium", color: "bg-yellow-600 text-white" },
  { value: "Low", color: "bg-blue-600 text-white" },
  { value: "Routine", color: "bg-gray-600 text-white" }
];

const EXECUTION_TYPES = ["DIY", "Professional", "Not Decided"];

export default function ManualTaskForm({ propertyId, onComplete, onCancel, prefilledDate = null }) {
  const queryClient = useQueryClient();
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
      
      // Trigger AI enrichment in background (non-blocking)
      setAiEnriching(true);
      enrichTaskWithAI(task.id, taskData)
        .then(() => {
          // Refresh task list to show enriched data
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

  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <CardTitle className="flex items-center gap-2">
          Add New Maintenance Task
          {aiEnriching && (
            <Badge className="gap-1 bg-purple-600 text-white">
              <Sparkles className="w-3 h-3" />
              AI Enriching...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Task Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Replace HVAC air filter"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Description *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide detailed description of what needs to be done..."
              rows={4}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 The more detail you provide, the better AI can estimate time, tools, and materials needed.
            </p>
          </div>

          {/* System Type & Priority */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                System Type *
              </label>
              <Select
                value={formData.system_type}
                onValueChange={(value) => setFormData({ ...formData, system_type: value })}
              >
                <SelectTrigger>
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Priority *
              </label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={level.color}>{level.value}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status & Execution Type */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Identified">Identified</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Deferred">Deferred</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Execution Type
              </label>
              <Select
                value={formData.execution_type}
                onValueChange={(value) => setFormData({ ...formData, execution_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXECUTION_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Scheduled Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.scheduled_date
                    ? format(new Date(formData.scheduled_date), 'PPP')
                    : 'Select date...'}
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
          </div>

          {/* Urgency Timeline & Cost */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Urgency Timeline
              </label>
              <Input
                value={formData.urgency_timeline}
                onChange={(e) => setFormData({ ...formData, urgency_timeline: e.target.value })}
                placeholder="e.g., 30 days, 3 months, ASAP"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Estimated Cost
              </label>
              <Input
                type="number"
                value={formData.current_fix_cost}
                onChange={(e) => setFormData({ ...formData, current_fix_cost: e.target.value })}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Photos
            </label>
            <div className="space-y-3">
              {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                onClick={() => document.getElementById('photo-upload').click()}
                disabled={uploadingPhotos}
              >
                {uploadingPhotos ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Add Photos
                  </>
                )}
              </Button>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* AI Enrichment Notice */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-purple-900 mb-1">
                  AI-Powered Task Enrichment
                </p>
                <p className="text-xs text-purple-800 leading-relaxed">
                  After saving, AI will automatically generate: time estimation, statement of work, 
                  tools & materials list, and video tutorials. This helps you plan and execute more effectively.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTaskMutation.isPending || !formData.title || !formData.description}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {createTaskMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}