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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar as CalendarIcon, 
  Upload, 
  X, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  DollarSign, 
  AlertTriangle, 
  Building2,
  Wrench,
  HardHat,
  Star,
  TrendingDown,
  BookOpen,
  Clock
} from "lucide-react";
import { format } from "date-fns";

async function enrichTaskWithAI(taskId, taskData, photoUrls = []) {
  const { title, description, system_type, priority } = taskData;
  
  if (!title || !description || !system_type) {
    console.warn('Task missing required fields for AI enrichment');
    return;
  }

  try {
    const hasPhotos = photoUrls && photoUrls.length > 0;
    
    const cascadeAnalysisPrompt = `You are a property maintenance expert analyzing this maintenance issue.

Task Title: ${title}
Description: ${description || 'No description provided'}
System Type: ${system_type || 'General'}
Priority: ${priority || 'Medium'}
${hasPhotos ? `Photos: ${photoUrls.length} attached for analysis` : 'No photos provided'}

Please analyze and provide a JSON response with the following fields:

COST OPTIONS:
1. "diy_cost" (number): Materials-only cost if homeowner does this themselves. Example: $25 for a faucet washer replacement.

2. "diy_difficulty" (string): Rate the DIY difficulty as "Easy", "Medium", or "Hard". Consider skill level, tools needed, and risk.

3. "diy_time_hours" (number): Estimated hours for an average DIY homeowner to complete this task. Example: 0.5 for simple faucet repair, 4 for installing ceiling fan.

4. "contractor_cost" (number): Typical cost to hire a local handyman or contractor, including labor + materials + service call. IMPORTANT: Include typical service call minimum ($75-150) even for quick jobs.

5. "service_call_minimum" (number): Typical service call fee in this market. Usually $75-150.

6. "operator_cost" (number): Estimated cost through a professional maintenance membership service (typically 15-25% less than contractor due to no service call fee and efficiency of regular visits). Example: If contractor charges $150, operator would be ~$120.

CASCADE RISK ANALYSIS:
7. "current_fix_cost" (number): Use the contractor_cost as baseline for "fix it now" cost.

8. "cascade_risk_score" (number 1-10): How likely this issue will cause other problems if ignored.

9. "cascade_risk_reason" (string): Detailed explanation of what will fail next and how the damage cascades. Be specific about the domino effect.

10. "delayed_fix_cost" (number): Estimated cost if this issue is ignored for the urgency timeline, including all cascade damage. Example: $25 faucet washer becomes $800 (cabinet replacement + mold remediation + water waste).

11. "cost_impact_reason" (string): Detailed explanation of WHY delaying increases cost. Break down the cascade: "What starts as X becomes Y because Z." Be specific about each failure point.

12. "urgency_timeline" (string): Timeframe before issue worsens. Examples: "Immediate", "1-2 weeks", "1-3 months", "3-6 months", "6-12 months".

ADDITIONAL INSIGHTS:
13. "estimated_hours" (number): Same as diy_time_hours (for consistency with existing code).

14. "key_warning" (string): One-sentence warning about the most critical risk. Example: "Leaking water will rot cabinet wood and grow mold."

Respond ONLY with valid JSON. No markdown, no explanation, just the JSON object.`;

    const cascadeAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: cascadeAnalysisPrompt,
      file_urls: hasPhotos ? photoUrls : undefined,
      response_json_schema: {
        type: "object",
        properties: {
          diy_cost: { type: "number" },
          diy_difficulty: { type: "string" },
          diy_time_hours: { type: "number" },
          contractor_cost: { type: "number" },
          service_call_minimum: { type: "number" },
          operator_cost: { type: "number" },
          current_fix_cost: { type: "number" },
          cascade_risk_score: { type: "number" },
          cascade_risk_reason: { type: "string" },
          delayed_fix_cost: { type: "number" },
          cost_impact_reason: { type: "string" },
          urgency_timeline: { type: "string" },
          estimated_hours: { type: "number" },
          key_warning: { type: "string" }
        },
        required: ["diy_cost", "contractor_cost", "current_fix_cost", "cascade_risk_score", "cascade_risk_reason", "delayed_fix_cost", "cost_impact_reason", "urgency_timeline"]
      }
    }).catch(err => {
      console.error('Cascade analysis failed:', err);
      return null;
    });

    const [sowResult, toolsAndMaterials, videoResults] = await Promise.all([
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

    if (cascadeAnalysis) {
      if (cascadeAnalysis.diy_cost) updateData.diy_cost = cascadeAnalysis.diy_cost;
      if (cascadeAnalysis.diy_difficulty) updateData.diy_difficulty = cascadeAnalysis.diy_difficulty;
      if (cascadeAnalysis.diy_time_hours) updateData.diy_time_hours = cascadeAnalysis.diy_time_hours;
      if (cascadeAnalysis.contractor_cost) updateData.contractor_cost = cascadeAnalysis.contractor_cost;
      if (cascadeAnalysis.service_call_minimum) updateData.service_call_minimum = cascadeAnalysis.service_call_minimum;
      if (cascadeAnalysis.operator_cost) updateData.operator_cost = cascadeAnalysis.operator_cost;
      if (cascadeAnalysis.current_fix_cost) updateData.current_fix_cost = cascadeAnalysis.current_fix_cost;
      if (cascadeAnalysis.cascade_risk_score) updateData.cascade_risk_score = cascadeAnalysis.cascade_risk_score;
      if (cascadeAnalysis.cascade_risk_reason) updateData.cascade_risk_reason = cascadeAnalysis.cascade_risk_reason;
      if (cascadeAnalysis.delayed_fix_cost) updateData.delayed_fix_cost = cascadeAnalysis.delayed_fix_cost;
      if (cascadeAnalysis.cost_impact_reason) updateData.cost_impact_reason = cascadeAnalysis.cost_impact_reason;
      if (cascadeAnalysis.urgency_timeline) updateData.urgency_timeline = cascadeAnalysis.urgency_timeline;
      if (cascadeAnalysis.key_warning) updateData.key_warning = cascadeAnalysis.key_warning;
      
      if (cascadeAnalysis.estimated_hours && typeof cascadeAnalysis.estimated_hours === 'number') {
        updateData.estimated_hours = cascadeAnalysis.estimated_hours;
      } else if (cascadeAnalysis.diy_time_hours && typeof cascadeAnalysis.diy_time_hours === 'number') {
        updateData.estimated_hours = cascadeAnalysis.diy_time_hours;
      }
      
      if (cascadeAnalysis.cascade_risk_score >= 7) {
        updateData.has_cascade_alert = true;
      }
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
    
    return cascadeAnalysis;
  } catch (error) {
    console.error('Error enriching task with AI:', error);
    await base44.entities.MaintenanceTask.update(taskId, {
      ai_enrichment_completed: true
    }).catch(err => console.error('Failed to mark enrichment status:', err));
    return null;
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

function getPropertyFlowType(property) {
  if (!property) return null;
  const doorCount = property.door_count || 1;
  if (doorCount === 1) return 'single_family';
  if (doorCount === 2) return 'dual_unit';
  return 'multi_unit';
}

export default function ManualTaskForm({ propertyId, property, onComplete, onCancel, open = true, prefilledDate = null, editingTask = null }) {
  const queryClient = useQueryClient();
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState(editingTask || {
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
  const [selectedUnits, setSelectedUnits] = React.useState(
    editingTask?.unit_tag ? [editingTask.unit_tag] : []
  );
  const [photos, setPhotos] = React.useState(editingTask?.photo_urls || []);
  const [uploadingPhotos, setUploadingPhotos] = React.useState(false);
  const [aiEnriching, setAiEnriching] = React.useState(false);
  const [aiAnalysis, setAiAnalysis] = React.useState(null);
  const [showAiResults, setShowAiResults] = React.useState(false);

  const isEditing = !!editingTask?.id;
  const flowType = getPropertyFlowType(property);
  const isSingleFamily = flowType === 'single_family';
  const isMultiUnit = flowType === 'multi_unit' || flowType === 'dual_unit';
  
  const unitOptions = property?.units || [];
  const fallbackUnits = property?.door_count > 1 
    ? Array.from({ length: property.door_count }, (_, i) => ({
        unit_id: `Unit ${i + 1}`,
        nickname: `Unit ${i + 1}`
      }))
    : [];
  
  const allUnitOptions = unitOptions.length > 0 ? unitOptions : fallbackUnits;

  const createTaskMutation = useMutation({
    mutationFn: async (tasksData) => {
      if (isEditing) {
        return await base44.entities.MaintenanceTask.update(editingTask.id, tasksData[0]);
      } else {
        if (tasksData.length === 1) {
          return await base44.entities.MaintenanceTask.create(tasksData[0]);
        } else {
          const createPromises = tasksData.map(taskData => 
            base44.entities.MaintenanceTask.create(taskData)
          );
          return await Promise.all(createPromises);
        }
      }
    },
    onSuccess: async (savedTasks) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allMaintenanceTasks'] });
      
      const firstTask = Array.isArray(savedTasks) ? savedTasks[0] : savedTasks;
      
      setAiEnriching(true);
      const cascadeResult = await enrichTaskWithAI(firstTask.id, firstTask, photos);
      setAiEnriching(false);
      
      if (cascadeResult) {
        setAiAnalysis(cascadeResult);
        setShowAiResults(true);
      } else {
        setShowAiResults(true);
      }
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

  const handleToggleUnit = (unitId) => {
    setSelectedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleSelectAllUnits = () => {
    const allUnitIds = ['Common Area', ...allUnitOptions.map(u => u.unit_id || u.nickname)];
    if (selectedUnits.length === allUnitIds.length) { 
      setSelectedUnits([]);
    } else {
      setSelectedUnits(allUnitIds);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const baseTaskData = {
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

    let tasksToCreate = [];

    if (isEditing) {
      tasksToCreate.push({ 
        ...baseTaskData, 
        unit_tag: editingTask.unit_tag || undefined
      });
    } else if (isSingleFamily) {
      tasksToCreate.push({
        ...baseTaskData,
        unit_tag: undefined,
        scope: 'property_wide',
        applies_to_unit_count: 1
      });
    } else if (isMultiUnit && selectedUnits.length > 0) {
      tasksToCreate = selectedUnits.map(unitTag => ({
        ...baseTaskData,
        unit_tag: unitTag,
        scope: 'per_unit'
      }));
    } else {
      tasksToCreate.push({
        ...baseTaskData,
        unit_tag: isMultiUnit ? "Common Area" : undefined,
        scope: isMultiUnit ? 'building_wide' : 'property_wide'
      });
    }

    createTaskMutation.mutate(tasksToCreate);
  };

  const canGoNext = () => {
    if (step === 1) {
      const isBaseInfoValid = formData.title.trim().length > 0 && formData.description.trim().length > 0;
      if (!isEditing && isMultiUnit) {
        return isBaseInfoValid && selectedUnits.length > 0;
      }
      return isBaseInfoValid;
    }
    if (step === 2) return true;
    return true;
  };

  // AI Analysis Results Display
  if (showAiResults) {
    const taskCount = isEditing ? 1 : (isSingleFamily ? 1 : selectedUnits.length > 0 ? selectedUnits.length : 1);
    
    // Fallback values
    const diyCost = aiAnalysis?.diy_cost || null;
    const diyDifficulty = aiAnalysis?.diy_difficulty || 'Medium';
    const diyTimeHours = aiAnalysis?.diy_time_hours || aiAnalysis?.estimated_hours || null;
    const contractorCost = aiAnalysis?.contractor_cost || aiAnalysis?.current_fix_cost || 0;
    const serviceCallMin = aiAnalysis?.service_call_minimum || 100;
    const operatorCost = aiAnalysis?.operator_cost || Math.round(contractorCost * 0.8);
    
    return (
      <Dialog open={true} onOpenChange={(isOpen) => {
        if (!isOpen) {
          onComplete();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {aiAnalysis ? (
                <>
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  AI Cost & Risk Analysis
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  Task{taskCount > 1 ? 's' : ''} Saved Successfully
                </>
              )}
            </DialogTitle>
            {aiAnalysis ? (
              <DialogDescription>
                Here's what we found based on your description{photos.length > 0 ? ' and photos' : ''}
                {taskCount > 1 && ` • ${taskCount} tasks created (one per unit)`}
              </DialogDescription>
            ) : (
              <DialogDescription>
                {taskCount > 1 
                  ? `${taskCount} maintenance tasks have been created (one for each selected unit)`
                  : 'Your maintenance task has been saved to your priority queue'
                }
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-6 py-4">
            {aiAnalysis ? (
              <>
                {/* COST OPTIONS SECTION */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Cost to Fix This Issue</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* DIY OPTION */}
                    {diyCost !== null && (
                      <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50 relative">
                        <div className="absolute top-2 right-2">
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full font-semibold">
                            Lowest Cost
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Wrench className="w-5 h-5 text-green-700" />
                          <span className="font-semibold text-green-900">DIY</span>
                        </div>
                        
                        <div className="text-3xl font-bold text-green-700 mb-1">
                          ${diyCost.toLocaleString()}
                        </div>
                        
                        <div className="text-xs text-green-800 mb-3">
                          Materials only
                        </div>
                        
                        <div className="border-t border-green-300 pt-2 space-y-1">
                          {diyTimeHours && (
                            <div className="text-xs text-green-900">
                              <span className="font-semibold">Time:</span> {diyTimeHours} {diyTimeHours === 1 ? 'hour' : 'hours'}
                            </div>
                          )}
                          <div className="text-xs text-green-900">
                            <span className="font-semibold">Difficulty:</span> {diyDifficulty}
                          </div>
                        </div>
                        
                        {diyCost && contractorCost && (
                          <div className="mt-3 bg-green-100 rounded p-2">
                            <div className="flex items-center gap-1 text-green-800">
                              <DollarSign className="w-4 h-4" />
                              <span className="text-sm font-semibold">
                                Save ${(contractorCost - diyCost).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* CONTRACTOR OPTION */}
                    <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        <HardHat className="w-5 h-5 text-gray-700" />
                        <span className="font-semibold text-gray-900">Contractor</span>
                      </div>
                      
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        ${contractorCost.toLocaleString()}
                      </div>
                      
                      <div className="text-xs text-gray-600 mb-3">
                        Labor + materials
                      </div>
                      
                      <div className="border-t border-gray-300 pt-2">
                        {serviceCallMin && (
                          <div className="flex items-start gap-1 text-orange-600 text-xs">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>
                              Includes ~${serviceCallMin} service call minimum
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 360° OPERATOR OPTION */}
                    <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50 relative">
                      <div className="absolute top-2 right-2">
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-semibold">
                          Best Value
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-blue-700" />
                        <span className="font-semibold text-blue-900">360° Operator</span>
                      </div>
                      
                      <div className="text-3xl font-bold text-blue-700 mb-1">
                        ${operatorCost.toLocaleString()}
                      </div>
                      
                      <div className="text-xs text-blue-800 mb-3">
                        Professional service
                      </div>
                      
                      <div className="border-t border-blue-300 pt-2 space-y-1">
                        <div className="text-xs text-blue-900">
                          ✓ No service call fee
                        </div>
                        <div className="text-xs text-blue-900">
                          ✓ Included in membership
                        </div>
                      </div>
                    </div>
                    
                  </div>
                  
                  {/* DIY SAVINGS CALLOUT */}
                  {diyCost && contractorCost && (
                    <div className="mt-4 bg-green-50 border-l-4 border-green-600 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <TrendingDown className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-green-900 mb-1">
                            💡 DIY Savings Potential
                          </div>
                          <div className="text-sm text-green-800">
                            By doing this yourself, you'll save <strong>${(contractorCost - diyCost).toLocaleString()}</strong> compared to hiring a contractor.
                            {diyTimeHours && ` Time investment: ${diyTimeHours} ${diyTimeHours === 1 ? 'hour' : 'hours'}.`}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* DIVIDER */}
                <div className="border-t border-gray-200" />

                {/* CASCADE RISK SECTION */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">What Happens If You Wait?</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                      <div className="text-sm font-semibold text-green-700 mb-1">
                        ✓ Fix Now (Recommended)
                      </div>
                      <div className="text-2xl font-bold text-green-700">
                        ${(aiAnalysis.current_fix_cost || contractorCost).toLocaleString()}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        Address the issue today
                      </div>
                    </div>
                    
                    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                      <div className="text-sm font-semibold text-red-700 mb-1">
                        ⚠️ If You Wait
                      </div>
                      <div className="text-2xl font-bold text-red-700">
                        ${aiAnalysis.delayed_fix_cost?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        Potential cost in {aiAnalysis.urgency_timeline || '6-12 months'}
                      </div>
                    </div>
                  </div>

                  {/* Cascade Risk Details */}
                  {aiAnalysis.cascade_risk_reason && (
                    <div className={`p-4 rounded-lg border-2 ${
                      aiAnalysis.cascade_risk_score >= 7 
                        ? 'bg-red-50 border-red-300' 
                        : 'bg-orange-50 border-orange-300'
                    }`}>
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          aiAnalysis.cascade_risk_score >= 7 ? 'text-red-600' : 'text-orange-600'
                        }`} />
                        <div className="flex-1">
                          <div className="font-semibold mb-2 text-gray-900">
                            🔗 Cascade Risk: {aiAnalysis.cascade_risk_score}/10
                          </div>
                          <p className="text-sm mb-3 text-gray-800">{aiAnalysis.cascade_risk_reason}</p>
                          
                          {aiAnalysis.cascade_risk_score >= 7 && (
                            <div className="bg-red-100 rounded p-3 text-sm font-semibold text-red-800">
                              ⚠️ HIGH RISK: This issue will likely trigger expensive cascade failures if ignored!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expandable Cost Impact Reason */}
                  {aiAnalysis.cost_impact_reason && (
                    <details className="mt-4 border-2 border-gray-200 rounded-lg overflow-hidden">
                      <summary className="cursor-pointer p-3 hover:bg-gray-50 font-semibold text-sm bg-white">
                        Why does waiting cost ${((aiAnalysis.delayed_fix_cost || 0) - (aiAnalysis.current_fix_cost || contractorCost)).toLocaleString()} more?
                      </summary>
                      <div className="p-4 text-sm text-gray-700 border-t border-gray-200 bg-gray-50">
                        {aiAnalysis.cost_impact_reason}
                      </div>
                    </details>
                  )}

                  {/* Key Warning */}
                  {aiAnalysis.key_warning && (
                    <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-yellow-900 mb-1">⚡ Critical Warning</div>
                          <p className="text-sm text-yellow-800">{aiAnalysis.key_warning}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Savings Calculation */}
                  {aiAnalysis.delayed_fix_cost && aiAnalysis.current_fix_cost && (
                    <div className="mt-4 bg-green-50 border-2 border-green-300 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-900">
                          Potential Savings by Acting Now
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-green-700">
                        ${((aiAnalysis.delayed_fix_cost - aiAnalysis.current_fix_cost) * taskCount).toLocaleString()}
                      </div>
                      <div className="text-sm text-green-800 mt-1">
                        That's {Math.round(((aiAnalysis.delayed_fix_cost - aiAnalysis.current_fix_cost) / aiAnalysis.current_fix_cost) * 100)}% more expensive if you wait!
                        {taskCount > 1 && ` Across ${taskCount} units, that adds up fast!`}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-3" />
                <h3 className="font-bold text-green-900 text-xl mb-2">
                  {taskCount > 1 ? `${taskCount} Tasks Created!` : 'Task Created!'}
                </h3>
                <p className="text-sm text-gray-700">
                  {taskCount > 1 
                    ? `Created ${taskCount} separate tasks (one for each selected unit). You can find them in the Prioritize section.`
                    : 'Your maintenance task has been added to your priority queue.'
                  }
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => onComplete()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition-colors"
              style={{ minHeight: '48px', cursor: 'pointer' }}
            >
              <CheckCircle2 className="w-4 h-4 inline mr-2" />
              {aiAnalysis ? 'Got It - Close' : 'Close'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isEditing ? '✏️ Edit' : '➕ Add'} Maintenance Task
            {aiEnriching && (
              <Badge className="gap-1 bg-purple-600 text-white">
                <Sparkles className="w-3 h-3" />
                AI Analyzing...
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Step {step} of 3 • Fill in the details below
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-6">
          <div className={`flex-1 h-2 rounded-full transition-all ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-2 rounded-full transition-all ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-2 rounded-full transition-all ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <p className="text-sm text-blue-900 font-semibold mb-1">📝 What needs to be done?</p>
                <p className="text-xs text-blue-800">Be specific and add photos - AI will analyze everything to estimate costs and risks</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Task Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Replace HVAC air filter, Fix leaky faucet"
                  className="text-base"
                  style={{ minHeight: '48px' }}
                  autoFocus={!isEditing}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the issue, symptoms you've noticed, location, severity..."
                  rows={5}
                  className="text-base"
                  style={{ minHeight: '120px' }}
                />
              </div>

              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-purple-900">Add Photos (Recommended)</h3>
                </div>
                <p className="text-sm text-purple-800 mb-3">
                  Photos help AI provide more accurate cost estimates and identify cascade risks
                </p>
                
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {photos.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-purple-200"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-purple-400 text-purple-700 hover:bg-purple-100"
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
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
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

              {!isSingleFamily && isMultiUnit && isEditing && (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                  <label className="text-sm font-semibold text-blue-900 mb-2 block flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Tag by Unit (Multi-Unit Property)
                  </label>
                  <p className="text-xs text-blue-800 mb-2">
                    This task is currently assigned to:
                  </p>
                  <div className="bg-white border-2 border-blue-400 rounded-lg p-3">
                    <p className="text-base font-bold text-blue-900">
                      {editingTask?.unit_tag || 'Not assigned to a specific unit'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 italic">
                    💡 To change unit assignment, create a new task for the other unit instead
                  </p>
                </div>
              )}

              {!isSingleFamily && isMultiUnit && !isEditing && (
                <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                  <label className="text-sm font-semibold text-purple-900 mb-2 block flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Select Units (Multi-Unit Property)
                  </label>
                  <p className="text-xs text-purple-800 mb-3">
                    Select which units need this work. A separate task will be created for each unit you select.
                  </p>

                  <div className="flex items-center gap-3 p-2 bg-white rounded-lg mb-2">
                    <Checkbox
                      id="select-all-units"
                      checked={selectedUnits.length === allUnitOptions.length + 1}
                      onCheckedChange={handleSelectAllUnits}
                    />
                    <label 
                      htmlFor="select-all-units" 
                      className="text-sm font-bold text-gray-900 cursor-pointer flex-1"
                    >
                      Select All ({allUnitOptions.length + 1} options)
                    </label>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border">
                      <Checkbox
                        id="unit-common"
                        checked={selectedUnits.includes('Common Area')}
                        onCheckedChange={() => handleToggleUnit('Common Area')}
                      />
                      <label htmlFor="unit-common" className="text-sm font-semibold text-gray-700 cursor-pointer flex-1">
                        🏢 Common Area
                      </label>
                    </div>

                    {allUnitOptions.map((unit, idx) => {
                      const unitTagValue = unit.unit_id || unit.nickname || `Unit ${idx + 1}`;
                      return (
                        <div key={unitTagValue} className="flex items-center gap-3 p-2 bg-white rounded-lg border">
                          <Checkbox
                            id={`unit-${unitTagValue}`}
                            checked={selectedUnits.includes(unitTagValue)}
                            onCheckedChange={() => handleToggleUnit(unitTagValue)}
                          />
                          <label htmlFor={`unit-${unitTagValue}`} className="text-sm text-gray-900 cursor-pointer flex-1">
                            {unit.nickname || unitTagValue}
                            {unit.bedrooms && <span className="text-xs text-gray-500 ml-1">• {unit.bedrooms}bd</span>}
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  {selectedUnits.length > 0 && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-300 rounded">
                      <p className="text-xs text-green-900 font-semibold">
                        ✅ {selectedUnits.length} task{selectedUnits.length > 1 ? 's' : ''} will be created
                        {selectedUnits.length > 1 && ' (one per unit)'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Current Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger style={{ minHeight: '48px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Identified">Identified - Just discovered</SelectItem>
                    <SelectItem value="Scheduled">Scheduled - Date set</SelectItem>
                    <SelectItem value="In Progress">In Progress - Working on it</SelectItem>
                    <SelectItem value="Completed">Completed - Done</SelectItem>
                    <SelectItem value="Deferred">Deferred - Postponed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                <p className="text-sm text-green-900 font-semibold mb-1">✅ Review & Save</p>
                <p className="text-xs text-green-800">Double-check everything before submitting - AI will analyze after you click the button below</p>
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-gray-300 shadow-sm">
                <p className="font-semibold text-gray-900 mb-3 text-sm">📋 Task Summary:</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-600 font-medium">Title:</span>
                    <span className="font-semibold text-gray-900 text-right">{formData.title}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-600 font-medium">Description:</span>
                    <span className="text-gray-900 text-right text-xs">{formData.description.substring(0, 80)}{formData.description.length > 80 ? '...' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">System:</span>
                    <span className="font-semibold text-gray-900">{formData.system_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Priority:</span>
                    <Badge className={PRIORITY_LEVELS.find(p => p.value === formData.priority)?.color}>
                      {formData.priority}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Execution:</span>
                    <span className="font-semibold text-gray-900">{formData.execution_type}</span>
                  </div>
                  {!isSingleFamily && isMultiUnit && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">{isEditing || selectedUnits.length <= 1 ? 'Unit:' : 'Units:'}</span>
                      <span className="font-semibold text-purple-700">
                        {isEditing
                          ? (editingTask.unit_tag || 'N/A')
                          : selectedUnits.length > 1
                            ? `${selectedUnits.length} Selected`
                            : (selectedUnits.length === 1 ? selectedUnits[0] : 'Common Area')
                        }
                      </span>
                    </div>
                  )}
                  {formData.scheduled_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Scheduled:</span>
                      <span className="font-semibold text-gray-900">
                        {format(new Date(formData.scheduled_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {photos.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Photos:</span>
                      <span className="font-semibold text-gray-900">{photos.length} attached</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-purple-900 mb-1">
                      🤖 After You Submit, AI Will Analyze:
                    </p>
                    <ul className="text-xs text-purple-800 leading-relaxed space-y-1">
                      <li>• <strong>DIY vs. Contractor vs. 360° Operator costs</strong> - See all your options</li>
                      <li>• <strong>Cascade risk score (1-10)</strong> - What will fail next if ignored</li>
                      <li>• <strong>Delayed fix cost</strong> - What it costs if you wait 6-12 months</li>
                      <li>• <strong>Urgency timeline</strong> and why waiting costs more</li>
                      <li>• Time estimation, tools needed, & video tutorials</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded">
                <p className="text-xs text-yellow-900 font-semibold">
                  ⏱️ After clicking the button below, please wait for AI analysis results. This helps you understand the true cost and urgency of this maintenance item.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            {step > 1 && !createTaskMutation.isPending && !aiEnriching && (
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
                disabled={createTaskMutation.isPending || aiEnriching || !formData.title || !formData.description || (!isEditing && !isSingleFamily && isMultiUnit && selectedUnits.length === 0)}
                className="flex-1 bg-green-600 hover:bg-green-700 font-bold"
                style={{ minHeight: '48px' }}
              >
                {createTaskMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditing ? 'Saving Task...' : (isMultiUnit && selectedUnits.length > 1 ? 'Creating Tasks...' : 'Saving Task...')}
                  </>
                ) : aiEnriching ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    AI Analyzing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {isEditing ? 'Save Changes & Analyze' : 
                     (isMultiUnit && selectedUnits.length > 1 ? `Create ${selectedUnits.length} Tasks & Analyze` : 
                     'Create Task & Analyze')}
                  </>
                )}
              </Button>
            )}
            {step === 1 && !createTaskMutation.isPending && !aiEnriching && (
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