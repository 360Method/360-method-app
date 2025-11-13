import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, Pause, CheckCircle2, Upload, Loader2, Clock, DollarSign } from "lucide-react";
import CompletionCelebration from "./CompletionCelebration";

export default function DIYExecutionModal({ task, open, onClose, onComplete }) {
  const queryClient = useQueryClient();
  const [checkedSteps, setCheckedSteps] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [actualCost, setActualCost] = useState('');
  const [completionPhotos, setCompletionPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [completionSavings, setCompletionSavings] = useState(0);
  
  const steps = task?.ai_sow?.split('\n').filter(s => s.trim().length > 0) || [
    "Gather all necessary tools and materials",
    "Follow the instructions carefully",
    "Complete the task safely",
    "Clean up work area"
  ];
  
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
      alert('Failed to upload photos. Please try again.');
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
    
    // Calculate savings
    const estimatedCost = task.contractor_cost || 0;
    const savings = estimatedCost - actualCostValue;
    
    setCompletionSavings(savings);
    setShowCelebration(true);
  };
  
  const progressPercentage = steps.length > 0 ? Math.round((checkedSteps.length / steps.length) * 100) : 0;
  const allStepsComplete = checkedSteps.length === steps.length && steps.length > 0;

  if (!task) return null;
  
  if (showCelebration) {
    return (
      <CompletionCelebration
        task={task}
        savings={completionSavings}
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            Executing: {task.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          
          {/* TIMER */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-sm text-blue-700 mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time Elapsed
                </div>
                <div className="text-3xl md:text-4xl font-mono font-bold text-blue-900">
                  {formatTime(elapsedSeconds)}
                </div>
                {task.diy_time_hours && (
                  <div className="text-xs text-blue-600 mt-1">
                    Estimated: {task.diy_time_hours}h
                  </div>
                )}
              </div>
              <div>
                {!timerRunning ? (
                  <Button
                    onClick={() => setTimerRunning(true)}
                    className="bg-green-600 hover:bg-green-700 gap-2"
                    style={{ minHeight: '48px' }}
                  >
                    <Play className="w-4 h-4" />
                    Start Timer
                  </Button>
                ) : (
                  <Button
                    onClick={() => setTimerRunning(false)}
                    className="bg-yellow-600 hover:bg-yellow-700 gap-2"
                    style={{ minHeight: '48px' }}
                  >
                    <Pause className="w-4 h-4" />
                    Pause Timer
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* PROGRESS BAR */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
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
              {checkedSteps.length} of {steps.length} steps completed
            </div>
          </div>
          
          {/* CHECKLIST */}
          <div>
            <h3 className="font-bold mb-3 text-gray-900">Steps to Complete:</h3>
            <div className="space-y-2">
              {steps.map((step, idx) => {
                const isChecked = checkedSteps.includes(idx);
                return (
                  <label 
                    key={idx}
                    className={`
                      flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${isChecked ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200 hover:bg-gray-50'}
                    `}
                    style={{ minHeight: '44px' }}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCheckedSteps([...checkedSteps, idx]);
                        } else {
                          setCheckedSteps(checkedSteps.filter(i => i !== idx));
                        }
                      }}
                      className="mt-1"
                    />
                    <span className={`text-sm flex-1 ${isChecked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {step}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
          
          {/* COMPLETION FORM (shown when all steps checked) */}
          {allStepsComplete && (
            <div className="border-t-2 border-green-300 pt-4 space-y-4 bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-green-900 text-lg">All Steps Complete! Document Results:</h3>
              </div>
              
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
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
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
                    Mark Task Complete
                  </>
                )}
              </Button>
            </div>
          )}
          
        </div>
      </DialogContent>
    </Dialog>
  );
}