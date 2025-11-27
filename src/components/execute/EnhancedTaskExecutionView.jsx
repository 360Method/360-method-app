import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
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

export default function EnhancedTaskExecutionView({ task, open, onClose, onComplete }) {
  const queryClient = useQueryClient();
  
  // State for task execution
  const [stepCompletions, setStepCompletions] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [actualCost, setActualCost] = useState('');
  const [completionPhotos, setCompletionPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Collapsible sections
  const [whyExpanded, setWhyExpanded] = useState(true);
  const [systemExpanded, setSystemExpanded] = useState(false);
  
  // Fetch related data
  const { data: property } = useQuery({
    queryKey: ['property', task.property_id],
    queryFn: () => base44.entities.Property.filter({ id: task.property_id }).then(r => r[0]),
    enabled: !!task.property_id
  });
  
  const { data: systemBaseline } = useQuery({
    queryKey: ['system', task.property_id, task.system_type],
    queryFn: async () => {
      const systems = await base44.entities.SystemBaseline.filter({
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
      const inspections = await base44.entities.Inspection.filter({
        property_id: task.property_id
      }, '-created_date');
      return inspections[0];
    },
    enabled: task.source === 'INSPECTION' && !!task.property_id
  });

  const { data: preservationRec } = useQuery({
    queryKey: ['preservation', task.preservation_recommendation_id],
    queryFn: () => base44.entities.PreservationRecommendation.filter({
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

  // Parse AI-generated steps
  const aiSteps = task?.ai_sow ? 
    task.ai_sow.split('\n').filter(s => s.trim().length > 0 && !s.startsWith('#')).map(s => s.replace(/^\d+\.\s*/, '')) :
    [];

  const steps = aiSteps.length > 0 ? aiSteps : [
    "Gather all necessary tools and materials",
    "Follow the instructions carefully",
    "Complete the task safely",
    "Clean up work area"
  ];

  const handleStepToggle = (stepIndex) => {
    const existing = stepCompletions.find(s => s.stepIndex === stepIndex);
    if (existing) {
      setStepCompletions(stepCompletions.filter(s => s.stepIndex !== stepIndex));
    } else {
      setStepCompletions([...stepCompletions, {
        stepIndex,
        completedAt: new Date().toISOString(),
        notes: '',
        photos: []
      }]);
    }
  };

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
      setCompletionPhotos(prev => [...prev, ...urls]);
    } catch (error) {
      console.error('Photo upload failed:', error);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const completeTaskMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.MaintenanceTask.update(task.id, data);
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
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="gap-2"
            style={{ minHeight: '44px' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tasks
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-green-600 text-white">
              {task.execution_method || 'DIY'}
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Task Title & Meta */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2" style={{ color: '#1B365D' }}>
              <Wrench className="w-7 h-7 flex-shrink-0" />
              {task.title}
            </h1>
            <div className="flex items-center gap-3 flex-wrap text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {task.system_type}
              </span>
              {task.scheduled_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Scheduled: {new Date(task.scheduled_date).toLocaleDateString()}
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
          <Card className="border-2 border-gray-200">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-bold text-lg text-gray-900">WHAT YOU'LL NEED</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Tools */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-4 h-4 text-gray-600" />
                    <h4 className="font-semibold text-gray-700">Tools:</h4>
                  </div>
                  {task.ai_tools_needed && task.ai_tools_needed.length > 0 ? (
                    <ul className="space-y-1">
                      {task.ai_tools_needed.map((tool, idx) => (
                        <li key={idx} className="text-sm text-gray-800 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                          {tool}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No specific tools listed</p>
                  )}
                </div>

                {/* Materials */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-gray-600" />
                    <h4 className="font-semibold text-gray-700">Materials:</h4>
                  </div>
                  {task.ai_materials_needed && task.ai_materials_needed.length > 0 ? (
                    <ul className="space-y-1">
                      {task.ai_materials_needed.map((material, idx) => (
                        <li key={idx} className="text-sm text-gray-800 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                          {material}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No specific materials listed</p>
                  )}
                </div>
              </div>

              {/* Cost & Time Estimates */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-300">
                <div className="flex items-center justify-between text-sm">
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
          </Card>

          {/* TIMER & STEPS */}
          <Card className="border-2 border-green-200">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900">STEPS</h3>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-gray-600">Timer:</div>
                    <div className="text-lg font-mono font-bold text-gray-900">
                      {formatTime(elapsedSeconds)}
                    </div>
                  </div>
                  {!timerRunning ? (
                    <Button
                      onClick={() => setTimerRunning(true)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 gap-1"
                    >
                      <Play className="w-4 h-4" />
                      Start
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setTimerRunning(false)}
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700 gap-1"
                    >
                      <Pause className="w-4 h-4" />
                      Pause
                    </Button>
                  )}
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-2">
                {steps.map((step, idx) => {
                  const isCompleted = stepCompletions.some(s => s.stepIndex === idx);
                  return (
                    <div
                      key={idx}
                      className={`
                        border-2 rounded-lg p-4 transition-all
                        ${isCompleted ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200 hover:bg-gray-50'}
                      `}
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={() => handleStepToggle(idx)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className={`text-sm ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            <span className="font-semibold">{idx + 1}.</span> {step}
                          </p>
                          {isCompleted && (
                            <p className="text-xs text-green-700 mt-1">
                              ✓ Completed {new Date(stepCompletions.find(s => s.stepIndex === idx).completedAt).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>

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

          {/* Save & Exit */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
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