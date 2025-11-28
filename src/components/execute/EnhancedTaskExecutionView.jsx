import React, { useState, useEffect } from "react";
import { Property, SystemBaseline, Inspection, PreservationRecommendation, MaintenanceTask, storage } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, Play, Pause, CheckCircle2, Upload, Loader2, Clock, DollarSign,
  AlertTriangle, Camera, ChevronDown, ChevronUp, FileText, Video, Wrench,
  Package, Shield, Calendar, MapPin, Info, ExternalLink, Plus, GripVertical
} from "lucide-react";
import CompletionCelebration from "./CompletionCelebration";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import InteractiveStepItem from "./InteractiveStepItem";

export default function EnhancedTaskExecutionView({ task, open, onClose, onComplete }) {
  const queryClient = useQueryClient();
  
  // State for task execution
  const [stepCompletions, setStepCompletions] = useState(task?.step_progress || []);
  const [steps, setSteps] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(task?.actual_hours ? task.actual_hours * 3600 : 0);
  const [actualCost, setActualCost] = useState(task?.actual_cost?.toString() || '');
  const [completionPhotos, setCompletionPhotos] = useState(task?.completion_photos || []);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadingStepPhoto, setUploadingStepPhoto] = useState(false);
  const [completionNotes, setCompletionNotes] = useState(task?.completion_notes || '');
  const [showCelebration, setShowCelebration] = useState(false);
  const [toolsChecked, setToolsChecked] = useState(task?.tools_checklist || {});
  const [materialsChecked, setMaterialsChecked] = useState(task?.materials_checklist || {});
  const [customTools, setCustomTools] = useState(task?.custom_tools || []);
  const [customMaterials, setCustomMaterials] = useState(task?.custom_materials || []);
  const [addingTool, setAddingTool] = useState(false);
  const [addingMaterial, setAddingMaterial] = useState(false);
  const [newToolName, setNewToolName] = useState('');
  const [newMaterialName, setNewMaterialName] = useState('');
  
  // Collapsible sections
  const [whyExpanded, setWhyExpanded] = useState(true);
  const [systemExpanded, setSystemExpanded] = useState(false);
  const [needsExpanded, setNeedsExpanded] = useState(true);
  
  // Fetch related data
  const { data: property } = useQuery({
    queryKey: ['property', task.property_id],
    queryFn: () => Property.filter({ id: task.property_id }).then(r => r[0]),
    enabled: !!task.property_id
  });

  const { data: systemBaseline } = useQuery({
    queryKey: ['system', task.property_id, task.system_type],
    queryFn: async () => {
      const systems = await SystemBaseline.filter({
        property_id: task.property_id,
        system_type: task.system_type
      });
      return systems[0];
    },
    enabled: !!task.property_id && !!task.system_type
  });

  const { data: sourceInspection } = useQuery({
    queryKey: ['sourceInspection', task.property_id],
    queryFn: async () => {
      if (task.source !== 'INSPECTION') return null;
      const inspections = await Inspection.filter({
        property_id: task.property_id
      }, '-created_date');
      return inspections[0];
    },
    enabled: task.source === 'INSPECTION' && !!task.property_id
  });

  const { data: preservationRec } = useQuery({
    queryKey: ['preservation', task.preservation_recommendation_id],
    queryFn: () => PreservationRecommendation.filter({
      id: task.preservation_recommendation_id
    }).then(r => r[0]),
    enabled: !!task.preservation_recommendation_id
  });

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);
  
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize steps from task data
  useEffect(() => {
    const aiSteps = task?.ai_sow ? 
      task.ai_sow.split('\n').filter(s => s.trim().length > 0 && !s.startsWith('#')).map(s => s.replace(/^\d+\.\s*/, '')) :
      [];

    const defaultSteps = aiSteps.length > 0 ? aiSteps : [
      "Gather all necessary tools and materials",
      "Follow the instructions carefully",
      "Complete the task safely",
      "Clean up work area"
    ];

    // Merge with custom steps if any
    const customSteps = task?.custom_steps || [];
    const mergedSteps = [...defaultSteps];
    customSteps.forEach(cs => {
      if (cs.order < mergedSteps.length) {
        mergedSteps.splice(cs.order, 0, cs.text);
      } else {
        mergedSteps.push(cs.text);
      }
    });

    setSteps(mergedSteps);
  }, [task]);

  const handleStepToggle = (stepIndex) => {
    const existing = stepCompletions.find(s => s.stepIndex === stepIndex);
    if (existing) {
      const updated = stepCompletions.filter(s => s.stepIndex !== stepIndex);
      setStepCompletions(updated);
      saveProgress({ step_progress: updated });
    } else {
      const updated = [...stepCompletions, {
        stepIndex,
        stepText: steps[stepIndex],
        completedAt: new Date().toISOString(),
        timeSpentSeconds: 0,
        notes: '',
        photos: []
      }];
      setStepCompletions(updated);
      saveProgress({ step_progress: updated });
    }
  };

  const handleStepPhotoUpload = async (stepIndex, files) => {
    const fileArray = Array.from(files || []);
    if (fileArray.length === 0) return;

    setUploadingStepPhoto(true);
    try {
      const uploadPromises = fileArray.map(file =>
        storage.uploadFile(file)
      );
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      
      const updated = stepCompletions.map(s => {
        if (s.stepIndex === stepIndex) {
          return { ...s, photos: [...(s.photos || []), ...urls] };
        }
        return s;
      });
      
      // If step not completed yet, create entry with photos
      if (!updated.find(s => s.stepIndex === stepIndex)) {
        updated.push({
          stepIndex,
          stepText: steps[stepIndex],
          completedAt: null,
          timeSpentSeconds: 0,
          notes: '',
          photos: urls
        });
      }
      
      setStepCompletions(updated);
      saveProgress({ step_progress: updated });
    } catch (error) {
      console.error('Photo upload failed:', error);
    } finally {
      setUploadingStepPhoto(false);
    }
  };

  const handleStepNotesChange = (stepIndex, notes) => {
    const updated = stepCompletions.map(s => {
      if (s.stepIndex === stepIndex) {
        return { ...s, notes };
      }
      return s;
    });
    
    // If step not in completions yet, create entry
    if (!updated.find(s => s.stepIndex === stepIndex)) {
      updated.push({
        stepIndex,
        stepText: steps[stepIndex],
        completedAt: null,
        timeSpentSeconds: 0,
        notes,
        photos: []
      });
    }
    
    setStepCompletions(updated);
    saveProgress({ step_progress: updated });
  };

  const handleStepEdit = (stepIndex, newText) => {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex] = newText;
    setSteps(updatedSteps);
    saveProgress({ ai_sow: updatedSteps.join('\n') });
  };

  const handleStepDelete = (stepIndex) => {
    const updatedSteps = steps.filter((_, idx) => idx !== stepIndex);
    setSteps(updatedSteps);
    
    // Update step_progress indices
    const updatedProgress = stepCompletions
      .filter(s => s.stepIndex !== stepIndex)
      .map(s => ({
        ...s,
        stepIndex: s.stepIndex > stepIndex ? s.stepIndex - 1 : s.stepIndex
      }));
    
    setStepCompletions(updatedProgress);
    saveProgress({ 
      ai_sow: updatedSteps.join('\n'),
      step_progress: updatedProgress
    });
  };

  const handleStepMoveUp = (stepIndex) => {
    if (stepIndex === 0) return;
    const updatedSteps = [...steps];
    [updatedSteps[stepIndex - 1], updatedSteps[stepIndex]] = [updatedSteps[stepIndex], updatedSteps[stepIndex - 1]];
    setSteps(updatedSteps);
    
    // Update indices in completions
    const updatedProgress = stepCompletions.map(s => {
      if (s.stepIndex === stepIndex) return { ...s, stepIndex: stepIndex - 1 };
      if (s.stepIndex === stepIndex - 1) return { ...s, stepIndex: stepIndex };
      return s;
    });
    setStepCompletions(updatedProgress);
    
    saveProgress({ ai_sow: updatedSteps.join('\n'), step_progress: updatedProgress });
  };

  const handleStepMoveDown = (stepIndex) => {
    if (stepIndex === steps.length - 1) return;
    const updatedSteps = [...steps];
    [updatedSteps[stepIndex], updatedSteps[stepIndex + 1]] = [updatedSteps[stepIndex + 1], updatedSteps[stepIndex]];
    setSteps(updatedSteps);
    
    // Update indices in completions
    const updatedProgress = stepCompletions.map(s => {
      if (s.stepIndex === stepIndex) return { ...s, stepIndex: stepIndex + 1 };
      if (s.stepIndex === stepIndex + 1) return { ...s, stepIndex: stepIndex };
      return s;
    });
    setStepCompletions(updatedProgress);
    
    saveProgress({ ai_sow: updatedSteps.join('\n'), step_progress: updatedProgress });
  };

  const handleAddStep = () => {
    const newStep = "New step - click edit to customize";
    const updatedSteps = [...steps, newStep];
    setSteps(updatedSteps);
    saveProgress({ ai_sow: updatedSteps.join('\n') });
  };

  const saveProgress = async (updates) => {
    try {
      await MaintenanceTask.update(task.id, {
        ...updates,
        status: 'In Progress',
        actual_hours: elapsedSeconds / 3600
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const uploadPromises = files.map(file =>
        storage.uploadFile(file)
      );
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      setCompletionPhotos(prev => [...prev, ...urls]);
    } catch (error) {
      console.error('Photo upload failed:', error);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const completeTaskMutation = useMutation({
    mutationFn: async (data) => {
      return await MaintenanceTask.update(task.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const handleComplete = async () => {
    const actualHours = elapsedSeconds / 3600;
    const actualCostValue = actualCost ? parseFloat(actualCost) : 0;
    
    await completeTaskMutation.mutateAsync({
      status: 'Completed',
      actual_cost: actualCostValue,
      actual_hours: actualHours,
      completion_date: new Date().toISOString(),
      completion_photos: completionPhotos,
      completion_notes: completionNotes
    });
    
    setShowCelebration(true);
  };
  
  const progressPercentage = steps.length > 0 ? Math.round((stepCompletions.length / steps.length) * 100) : 0;
  const allStepsComplete = stepCompletions.length === steps.length && steps.length > 0;

  if (!task) return null;
  
  if (showCelebration) {
    const savings = (task.contractor_cost || 0) - (actualCost ? parseFloat(actualCost) : 0);
    return (
      <CompletionCelebration
        task={task}
        savings={savings}
        onClose={() => {
          setShowCelebration(false);
          onComplete();
          onClose();
        }}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        {/* Header with Back Button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10 flex items-center justify-between gap-3 flex-wrap">
          <Button
            variant="ghost"
            onClick={onClose}
            className="gap-2"
            style={{ minHeight: '48px' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Tasks</span>
            <span className="sm:hidden">Back</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-green-600 text-white text-sm px-3 py-1">
              {task.execution_method || 'DIY'}
            </Badge>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Task Title & Meta */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 flex items-start gap-2" style={{ color: '#1B365D' }}>
              <Wrench className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1" />
              <span className="flex-1">{task.title}</span>
            </h1>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {task.system_type}
              </span>
              {task.scheduled_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Scheduled: </span>
                  {new Date(task.scheduled_date).toLocaleDateString()}
                </span>
              )}
              <Badge className={
                task.priority === 'High' ? 'bg-red-600' :
                task.priority === 'Medium' ? 'bg-yellow-600' : 'bg-blue-600'
              }>
                {task.priority}
              </Badge>
            </div>
          </div>

          {/* WHY THIS MATTERS - Collapsible */}
          <Collapsible open={whyExpanded} onOpenChange={setWhyExpanded}>
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CollapsibleTrigger className="w-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <h3 className="font-bold text-orange-900">WHY THIS MATTERS</h3>
                    </div>
                    {whyExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </CardContent>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-4 pb-4 pt-0 space-y-3">
                  {task.cascade_risk_score && (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-600 text-white">
                        Cascade Risk: {task.cascade_risk_score}/10
                      </Badge>
                    </div>
                  )}
                  
                  {task.cascade_risk_reason && (
                    <p className="text-sm text-gray-800 italic">
                      "{task.cascade_risk_reason}"
                    </p>
                  )}
                  
                  {task.source === 'INSPECTION' && sourceInspection && (
                    <div className="bg-white rounded-lg p-3 border border-orange-300">
                      <p className="text-xs text-gray-600 mb-1">Found during:</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {sourceInspection.season} Inspection ({new Date(sourceInspection.inspection_date || sourceInspection.created_date).toLocaleDateString()})
                      </p>
                      {task.photo_urls && task.photo_urls.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {task.photo_urls.slice(0, 3).map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`Issue photo ${idx + 1}`}
                              className="w-16 h-16 object-cover rounded border"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {task.urgency_timeline && (
                    <div className="bg-white rounded-lg p-3 border border-orange-300">
                      <p className="text-xs text-gray-600 mb-1">Timeline:</p>
                      <p className="text-sm font-semibold text-orange-800">
                        {task.urgency_timeline}
                      </p>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* SYSTEM INFO - Collapsible */}
          {systemBaseline && (
            <Collapsible open={systemExpanded} onOpenChange={setSystemExpanded}>
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CollapsibleTrigger className="w-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-blue-900">SYSTEM INFO</h3>
                      </div>
                      {systemExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </CardContent>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="px-4 pb-4 pt-0 space-y-2">
                    <div className="bg-white rounded-lg p-3 border border-blue-300">
                      <p className="font-semibold text-gray-900 mb-2">
                        {task.system_type}: {systemBaseline.brand_model || 'Unknown Model'}
                        {systemBaseline.installation_year && ` (${systemBaseline.installation_year})`}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {systemBaseline.condition && (
                          <div>
                            <span className="text-gray-600">Condition:</span>
                            <span className="ml-2 font-semibold">{systemBaseline.condition}</span>
                          </div>
                        )}
                        {systemBaseline.warranty_info && (
                          <div>
                            <span className="text-gray-600">Warranty:</span>
                            <span className="ml-2 font-semibold">{systemBaseline.warranty_info}</span>
                          </div>
                        )}
                      </div>

                      {systemBaseline.manual_urls && systemBaseline.manual_urls.length > 0 && (
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(systemBaseline.manual_urls[0].url, '_blank')}
                            className="gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            View Manual
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* WHAT YOU'LL NEED */}
          <Collapsible open={needsExpanded} onOpenChange={setNeedsExpanded}>
            <Card className="border-2 border-gray-200">
              <CollapsibleTrigger className="w-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-gray-900">WHAT YOU'LL NEED</h3>
                    {needsExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </CardContent>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-4 pb-4 pt-0 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Tools */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-gray-600" />
                          <h4 className="font-semibold text-gray-700">Tools:</h4>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {/* AI Tools */}
                        {task.ai_tools_needed && task.ai_tools_needed.length > 0 && task.ai_tools_needed.map((tool, idx) => (
                          <label key={`ai-tool-${idx}`} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <Checkbox
                              checked={toolsChecked[tool] || false}
                              onCheckedChange={(checked) => {
                                const updated = { ...toolsChecked, [tool]: checked };
                                setToolsChecked(updated);
                                saveProgress({ tools_checklist: updated });
                              }}
                            />
                            <span className={toolsChecked[tool] ? 'line-through text-gray-500' : 'text-gray-800'}>
                              {tool}
                            </span>
                            {toolsChecked[tool] && <Badge variant="outline" className="ml-auto text-xs">✓ have it</Badge>}
                          </label>
                        ))}
                        
                        {/* Custom Tools */}
                        {customTools.map((tool, idx) => (
                          <label key={`custom-tool-${idx}`} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <Checkbox
                              checked={toolsChecked[tool] || false}
                              onCheckedChange={(checked) => {
                                const updated = { ...toolsChecked, [tool]: checked };
                                setToolsChecked(updated);
                                saveProgress({ tools_checklist: updated });
                              }}
                            />
                            <span className={toolsChecked[tool] ? 'line-through text-gray-500' : 'text-gray-800'}>
                              {tool}
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                const updated = customTools.filter((_, i) => i !== idx);
                                setCustomTools(updated);
                                saveProgress({ custom_tools: updated });
                              }}
                              className="ml-auto text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </label>
                        ))}
                        
                        {/* Add Tool */}
                        {addingTool ? (
                          <div className="flex gap-2">
                            <Input
                              value={newToolName}
                              onChange={(e) => setNewToolName(e.target.value)}
                              placeholder="Tool name"
                              className="text-sm"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                if (newToolName.trim()) {
                                  const updated = [...customTools, newToolName.trim()];
                                  setCustomTools(updated);
                                  saveProgress({ custom_tools: updated });
                                  setNewToolName('');
                                  setAddingTool(false);
                                }
                              }}
                            >
                              Add
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setAddingTool(false)}>Cancel</Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAddingTool(true)}
                            className="w-full gap-2"
                          >
                            <Plus className="w-3 h-3" />
                            Add Tool
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Materials */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-600" />
                          <h4 className="font-semibold text-gray-700">Materials:</h4>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {/* AI Materials */}
                        {task.ai_materials_needed && task.ai_materials_needed.length > 0 && task.ai_materials_needed.map((material, idx) => (
                          <label key={`ai-mat-${idx}`} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <Checkbox
                              checked={materialsChecked[material] || false}
                              onCheckedChange={(checked) => {
                                const updated = { ...materialsChecked, [material]: checked };
                                setMaterialsChecked(updated);
                                saveProgress({ materials_checklist: updated });
                              }}
                            />
                            <span className={materialsChecked[material] ? 'line-through text-gray-500' : 'text-gray-800'}>
                              {material}
                            </span>
                            {materialsChecked[material] && <Badge variant="outline" className="ml-auto text-xs">✓ have it</Badge>}
                          </label>
                        ))}
                        
                        {/* Custom Materials */}
                        {customMaterials.map((material, idx) => (
                          <label key={`custom-mat-${idx}`} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <Checkbox
                              checked={materialsChecked[material] || false}
                              onCheckedChange={(checked) => {
                                const updated = { ...materialsChecked, [material]: checked };
                                setMaterialsChecked(updated);
                                saveProgress({ materials_checklist: updated });
                              }}
                            />
                            <span className={materialsChecked[material] ? 'line-through text-gray-500' : 'text-gray-800'}>
                              {material}
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                const updated = customMaterials.filter((_, i) => i !== idx);
                                setCustomMaterials(updated);
                                saveProgress({ custom_materials: updated });
                              }}
                              className="ml-auto text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </label>
                        ))}
                        
                        {/* Add Material */}
                        {addingMaterial ? (
                          <div className="flex gap-2">
                            <Input
                              value={newMaterialName}
                              onChange={(e) => setNewMaterialName(e.target.value)}
                              placeholder="Material name (cost)"
                              className="text-sm"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                if (newMaterialName.trim()) {
                                  const updated = [...customMaterials, newMaterialName.trim()];
                                  setCustomMaterials(updated);
                                  saveProgress({ custom_materials: updated });
                                  setNewMaterialName('');
                                  setAddingMaterial(false);
                                }
                              }}
                            >
                              Add
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setAddingMaterial(false)}>Cancel</Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAddingMaterial(true)}
                            className="w-full gap-2"
                          >
                            <Plus className="w-3 h-3" />
                            Add Material
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cost & Time Estimates */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-300">
                    <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                      <div>
                        <span className="text-gray-600">Est. Cost:</span>
                        <span className="ml-2 font-bold text-gray-900">
                          ${task.diy_cost || 'Unknown'} DIY
                        </span>
                        {task.contractor_cost && (
                          <span className="ml-2 text-gray-600">
                            | ${task.contractor_cost} Contractor
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-600">Est. Time:</span>
                        <span className="ml-2 font-bold text-gray-900">
                          {task.diy_time_hours || task.estimated_hours || '?'} hours
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Video Tutorials */}
                  {task.ai_video_tutorials && task.ai_video_tutorials.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="w-4 h-4 text-red-600" />
                        <h4 className="font-semibold text-gray-700">Watch:</h4>
                      </div>
                      <div className="space-y-2">
                        {task.ai_video_tutorials.map((video, idx) => (
                          <a
                            key={idx}
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <Video className="w-4 h-4" />
                            {video.title}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* TIMER & STEPS */}
          <Card className="border-2 border-green-200">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="font-bold text-lg text-gray-900">STEPS</h3>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-right">
                    <div className="text-xs text-gray-600">Timer:</div>
                    <div className="text-xl sm:text-lg font-mono font-bold text-gray-900">
                      {formatTime(elapsedSeconds)}
                    </div>
                  </div>
                  {!timerRunning ? (
                    <Button
                      onClick={() => setTimerRunning(true)}
                      className="bg-green-600 hover:bg-green-700 gap-2"
                      style={{ minHeight: '48px' }}
                    >
                      <Play className="w-5 h-5" />
                      <span className="hidden sm:inline">Start</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setTimerRunning(false)}
                      className="bg-yellow-600 hover:bg-yellow-700 gap-2"
                      style={{ minHeight: '48px' }}
                    >
                      <Pause className="w-5 h-5" />
                      <span className="hidden sm:inline">Pause</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-2">
                {steps.map((step, idx) => {
                  const completion = stepCompletions.find(s => s.stepIndex === idx);
                  const isCompleted = completion && completion.completedAt;
                  
                  return (
                    <InteractiveStepItem
                      key={idx}
                      step={step}
                      stepIndex={idx}
                      isCompleted={isCompleted}
                      completion={completion}
                      onToggle={() => handleStepToggle(idx)}
                      onPhotoUpload={handleStepPhotoUpload}
                      onNotesChange={handleStepNotesChange}
                      onEdit={handleStepEdit}
                      onDelete={handleStepDelete}
                      onMoveUp={handleStepMoveUp}
                      onMoveDown={handleStepMoveDown}
                      canMoveUp={idx > 0}
                      canMoveDown={idx < steps.length - 1}
                      uploadingPhotos={uploadingStepPhoto}
                    />
                  );
                })}
              </div>

              {/* Add Step Button */}
              <Button
                variant="outline"
                onClick={handleAddStep}
                className="w-full gap-2 border-dashed"
                style={{ minHeight: '48px' }}
              >
                <Plus className="w-5 h-5" />
                Add Custom Step
              </Button>

              {/* Progress */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-gray-900">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {stepCompletions.length} of {steps.length} steps completed | {formatTime(elapsedSeconds)} elapsed
                </div>
              </div>
            </CardContent>
          </Card>

          {/* COMPLETION SECTION */}
          {allStepsComplete && (
            <Card className="border-2 border-green-300 bg-green-50">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <h3 className="font-bold text-green-900 text-lg">All Steps Complete! Document Results:</h3>
                </div>
                
                {/* Actual Cost */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Actual Cost Spent
                  </label>
                  <Input
                    type="number"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    placeholder="Enter actual cost"
                    className="bg-white"
                    style={{ minHeight: '48px' }}
                  />
                  <div className="text-xs text-gray-600 mt-1">
                    Estimated DIY cost: ${task.diy_cost || 'N/A'}
                    {task.contractor_cost && ` • You're saving ~$${Math.round(task.contractor_cost - (task.diy_cost || 0))}`}
                  </div>
                </div>
                
                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">
                    Completion Notes (optional)
                  </label>
                  <textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Any notes about how it went, lessons learned, etc."
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-white"
                    rows={3}
                    style={{ minHeight: '80px' }}
                  />
                </div>
                
                {/* Photos */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Upload Completion Photos
                  </label>
                  <div className="space-y-2">
                    {completionPhotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {completionPhotos.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Completion ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-green-300"
                          />
                        ))}
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('completion-photos').click()}
                      disabled={uploadingPhotos}
                      className="w-full gap-2 border-2 border-green-300 hover:bg-green-50"
                      style={{ minHeight: '48px' }}
                    >
                      {uploadingPhotos ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          {completionPhotos.length > 0 ? 'Add More Photos' : 'Upload Photos'}
                        </>
                      )}
                    </Button>
                    <input
                      id="completion-photos"
                      type="file"
                      multiple
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                
                {/* Complete Button */}
                <Button
                  onClick={handleComplete}
                  disabled={completeTaskMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 font-bold text-lg gap-2"
                  style={{ minHeight: '56px' }}
                >
                  {completeTaskMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Mark Complete & Celebrate
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Photo Gallery */}
          {(completionPhotos.length > 0 || stepCompletions.some(s => s.photos?.length > 0) || task.photo_urls?.length > 0) && (
            <Card className="border-2 border-gray-200">
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base sm:text-lg">
                  <Camera className="w-5 h-5" />
                  PHOTOS ({
                    (task.photo_urls?.length || 0) + 
                    (completionPhotos.length) + 
                    stepCompletions.reduce((sum, s) => sum + (s.photos?.length || 0), 0)
                  })
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {/* Before Photos */}
                  {task.photo_urls && task.photo_urls.map((url, idx) => (
                    <div key={`before-${idx}`} className="relative">
                      <img
                        src={url}
                        alt={`Before ${idx + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border-2 cursor-pointer hover:opacity-80"
                        onClick={() => window.open(url, '_blank')}
                      />
                      <Badge className="absolute bottom-2 left-2 text-xs bg-blue-600">Before</Badge>
                    </div>
                  ))}
                  
                  {/* Step Photos */}
                  {stepCompletions.filter(s => s.photos?.length > 0).map((completion) =>
                    completion.photos.map((url, photoIdx) => (
                      <div key={`step-${completion.stepIndex}-${photoIdx}`} className="relative">
                        <img
                          src={url}
                          alt={`Step ${completion.stepIndex + 1}`}
                          className="w-full aspect-square object-cover rounded-lg border-2 cursor-pointer hover:opacity-80"
                          onClick={() => window.open(url, '_blank')}
                        />
                        <Badge className="absolute bottom-2 left-2 text-xs bg-purple-600">
                          Step {completion.stepIndex + 1}
                        </Badge>
                      </div>
                    ))
                  )}
                  
                  {/* After Photos */}
                  {completionPhotos.map((url, idx) => (
                    <div key={`after-${idx}`} className="relative">
                      <img
                        src={url}
                        alt={`After ${idx + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border-2 cursor-pointer hover:opacity-80"
                        onClick={() => window.open(url, '_blank')}
                      />
                      <Badge className="absolute bottom-2 left-2 text-xs bg-green-600">After</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save & Exit */}
          <div className="flex gap-3">
            <Button
              onClick={() => {
                saveProgress({ actual_hours: elapsedSeconds / 3600 });
                onClose();
              }}
              variant="outline"
              className="flex-1"
              style={{ minHeight: '48px' }}
            >
              Save & Exit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}