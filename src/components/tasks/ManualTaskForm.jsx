import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, DollarSign, AlertCircle, Calendar, Sparkles, Info } from "lucide-react";
import { estimateCascadeRisk } from "../shared/CascadeEstimator";

const SYSTEM_TYPES = [
  "HVAC",
  "Plumbing",
  "Electrical",
  "Roof",
  "Foundation",
  "Gutters",
  "Exterior",
  "Windows/Doors",
  "Appliances",
  "Landscaping",
  "General"
];

const PRIORITY_LEVELS = [
  { value: "High", label: "High Priority", color: "red" },
  { value: "Medium", label: "Medium Priority", color: "yellow" },
  { value: "Low", label: "Low Priority", color: "blue" },
  { value: "Routine", label: "Routine Maintenance", color: "green" }
];

const EXECUTION_TYPES = [
  { value: "Not Decided", label: "Haven't decided yet" },
  { value: "DIY", label: "I'll do it myself (DIY)" },
  { value: "Professional", label: "Hire a professional" }
];

export default function ManualTaskForm({ propertyId, onComplete, onCancel, editingTask, prefilledDate }) {
  const [formData, setFormData] = React.useState(editingTask || {
    title: "",
    description: "",
    system_type: "General",
    priority: "Medium",
    status: prefilledDate ? "Scheduled" : "Identified",
    scheduled_date: prefilledDate ? new Date(prefilledDate).toISOString().split('T')[0] : "",
    execution_type: "Not Decided",
    current_fix_cost: "",
    photo_urls: []
  });

  const [photos, setPhotos] = React.useState(editingTask?.photo_urls || []);
  const [uploading, setUploading] = React.useState(false);
  const [isEstimating, setIsEstimating] = React.useState(false);

  const queryClient = useQueryClient();

  const { data: systems = [] } = useQuery({
    queryKey: ['systemBaselines', propertyId],
    queryFn: () => propertyId 
      ? base44.entities.SystemBaseline.filter({ property_id: propertyId })
      : Promise.resolve([]),
    enabled: !!propertyId,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      if (editingTask) {
        return base44.entities.MaintenanceTask.update(editingTask.id, taskData);
      } else {
        return base44.entities.MaintenanceTask.create(taskData);
      }
    },
    onSuccess: () => {
      // Invalidate all maintenance task queries to ensure calendar updates
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allMaintenanceTasks'] });
      onComplete();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const taskData = {
      property_id: propertyId,
      ...formData,
      photo_urls: photos,
      current_fix_cost: formData.current_fix_cost ? parseFloat(formData.current_fix_cost) : undefined
    };

    // If high priority, use AI to estimate cascade risk
    if (formData.priority === "High" && formData.description) {
      setIsEstimating(true);
      try {
        const aiEstimates = await estimateCascadeRisk({
          description: formData.description,
          system_type: formData.system_type,
          severity: "Flag",
          area: formData.system_type,
          estimated_cost: formData.current_fix_cost
        });

        taskData.cascade_risk_score = aiEstimates.cascade_risk_score;
        taskData.cascade_risk_reason = aiEstimates.cascade_risk_reason;
        taskData.current_fix_cost = aiEstimates.current_fix_cost;
        taskData.delayed_fix_cost = aiEstimates.delayed_fix_cost;
        taskData.cost_impact_reason = aiEstimates.cost_impact_reason;
        taskData.has_cascade_alert = aiEstimates.cascade_risk_score >= 7;
      } catch (error) {
        console.error("AI estimation error:", error);
      } finally {
        setIsEstimating(false);
      }
    }

    createTaskMutation.mutate(taskData);
  };

  const isFormValid = formData.title.trim() && formData.description.trim();

  // Relevant systems for selection
  const relevantSystems = systems.filter(s => 
    formData.system_type === 'General' || s.system_type.includes(formData.system_type)
  );

  return (
    <div className="bg-white pb-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '24px' }}>
            {editingTask ? 'Edit Task' : 'Create Maintenance Task'}
          </h1>
          <p className="text-gray-600">
            {prefilledDate 
              ? `Scheduled for ${new Date(prefilledDate).toLocaleDateString()}`
              : 'Add a maintenance task, repair, or improvement project'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Task Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Replace HVAC filter, Fix leaky faucet, Paint exterior trim"
                className="w-full"
                style={{ minHeight: '48px' }}
              />
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Description *</label>
              <p className="text-sm text-gray-600 mb-3">
                Provide details about what needs to be done. The more specific you are, the better AI can help estimate costs and risks.
              </p>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the task, what's wrong, what needs to be done, any relevant details..."
                rows={4}
                className="w-full"
                style={{ minHeight: '120px' }}
              />
            </CardContent>
          </Card>

          {/* System Type & Related System */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">System Type</label>
                <Select 
                  value={formData.system_type} 
                  onValueChange={(value) => setFormData({...formData, system_type: value})}
                >
                  <SelectTrigger className="w-full" style={{ minHeight: '48px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {SYSTEM_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {relevantSystems.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Related System (Optional)
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    Link this task to a specific system from your baseline
                  </p>
                  <Select 
                    value={formData.system_id || "none"} 
                    onValueChange={(value) => setFormData({...formData, system_id: value === "none" ? undefined : value})}
                  >
                    <SelectTrigger className="w-full" style={{ minHeight: '48px' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="none">None - General task</SelectItem>
                      {relevantSystems.map(system => (
                        <SelectItem key={system.id} value={system.id}>
                          {system.nickname || system.system_type}
                          {system.brand_model && ` - ${system.brand_model}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Priority & When */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Priority Level</label>
                <div className="grid grid-cols-2 gap-3">
                  {PRIORITY_LEVELS.map(priority => (
                    <Button
                      key={priority.value}
                      type="button"
                      variant="outline"
                      onClick={() => setFormData({...formData, priority: priority.value})}
                      className={`justify-start h-auto p-4 ${
                        formData.priority === priority.value ? 'border-2 shadow-md' : ''
                      }`}
                      style={{
                        borderColor: formData.priority === priority.value 
                          ? priority.color === 'red' ? '#DC3545'
                          : priority.color === 'yellow' ? '#FF6B35'
                          : priority.color === 'blue' ? '#3B82F6'
                          : '#28A745'
                          : undefined
                      }}
                    >
                      <div className="text-left">
                        <p className="font-semibold">{priority.label}</p>
                        {priority.value === "High" && (
                          <Badge className="mt-1 bg-purple-100 text-purple-800 border-purple-300">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Analysis
                          </Badge>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
                {formData.priority === "High" && (
                  <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-xs text-purple-800 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      High priority tasks get AI-powered cascade risk and cost analysis
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger className="w-full" style={{ minHeight: '48px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Identified">Identified - Not scheduled yet</SelectItem>
                    <SelectItem value="Scheduled">Scheduled - Has a date</SelectItem>
                    <SelectItem value="In Progress">In Progress - Currently working on it</SelectItem>
                    <SelectItem value="Completed">Completed - Already done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.status === "Scheduled" || formData.status === "In Progress" || formData.status === "Completed") && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formData.status === "Completed" ? "Completion Date" : "Scheduled Date"}
                  </label>
                  <Input
                    type="date"
                    value={formData.status === "Completed" ? (formData.completion_date || "") : (formData.scheduled_date || "")}
                    onChange={(e) => setFormData({
                      ...formData, 
                      ...(formData.status === "Completed" 
                        ? { completion_date: e.target.value }
                        : { scheduled_date: e.target.value }
                      )
                    })}
                    className="w-full"
                    style={{ minHeight: '48px' }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cost & Who Will Fix */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {formData.status === "Completed" ? "Actual Cost" : "Estimated Cost"}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.status === "Completed" ? (formData.actual_cost || "") : (formData.current_fix_cost || "")}
                  onChange={(e) => setFormData({
                    ...formData,
                    ...(formData.status === "Completed" 
                      ? { actual_cost: e.target.value }
                      : { current_fix_cost: e.target.value }
                    )
                  })}
                  placeholder="0.00"
                  className="w-full"
                  style={{ minHeight: '48px' }}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Who will fix this?</label>
                <Select 
                  value={formData.execution_type} 
                  onValueChange={(value) => setFormData({...formData, execution_type: value})}
                >
                  <SelectTrigger className="w-full" style={{ minHeight: '48px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {EXECUTION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                📷 Add Photos (Optional)
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
                <Upload className="w-5 h-5 mr-2 text-gray-600" />
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
                        <span className="sr-only">Remove</span>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completion Notes (if completed) */}
          {formData.status === "Completed" && (
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Completion Notes</label>
                <Textarea
                  value={formData.completion_notes || ""}
                  onChange={(e) => setFormData({...formData, completion_notes: e.target.value})}
                  placeholder="What was done? Any lessons learned? Parts used?"
                  rows={3}
                  className="w-full"
                />
              </CardContent>
            </Card>
          )}

          {/* Validation Message */}
          {!isFormValid && (
            <Card className="border-2 border-orange-300 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-600" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Complete Required Fields:</p>
                    <ul className="text-sm text-gray-700 space-y-1 pl-5 list-disc">
                      {!formData.title.trim() && <li>Enter a task title</li>}
                      {!formData.description.trim() && <li>Enter a description</li>}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-6 border-t">
            <Button
              type="submit"
              disabled={!isFormValid || createTaskMutation.isPending || isEstimating}
              className="w-full font-bold"
              style={{ 
                backgroundColor: isFormValid && !createTaskMutation.isPending && !isEstimating ? '#28A745' : '#CCCCCC',
                color: isFormValid && !createTaskMutation.isPending && !isEstimating ? '#FFFFFF' : '#666666',
                minHeight: '56px'
              }}
            >
              {isEstimating ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  AI Analyzing Task...
                </span>
              ) : createTaskMutation.isPending ? (
                'Saving...'
              ) : editingTask ? (
                'Update Task'
              ) : (
                'Create Task'
              )}
            </Button>

            <Button
              type="button"
              onClick={onCancel}
              variant="ghost"
              className="w-full"
              style={{ minHeight: '48px' }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}