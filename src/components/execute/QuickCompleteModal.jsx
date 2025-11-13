import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Upload, Loader2, Zap } from "lucide-react";
import CompletionCelebration from "./CompletionCelebration";

export default function QuickCompleteModal({ task, open, onClose, onComplete }) {
  const queryClient = useQueryClient();
  const [actualCost, setActualCost] = useState('');
  const [completionPhoto, setCompletionPhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completionSavings, setCompletionSavings] = useState(0);

  const completeTaskMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.MaintenanceTask.update(task.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
    }
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setCompletionPhoto(result.file_url);
    } catch (error) {
      console.error('Photo upload failed:', error);
      alert('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };
  
  const handleComplete = async () => {
    const actualCostValue = parseFloat(actualCost) || 0;
    
    await completeTaskMutation.mutateAsync({
      status: 'Completed',
      completion_date: new Date().toISOString(),
      actual_cost: actualCostValue,
      actual_hours: 0.25,
      completion_photos: completionPhoto ? [completionPhoto] : []
    });
    
    // Calculate savings
    const estimatedCost = task.contractor_cost || task.operator_cost || 0;
    const savings = estimatedCost - actualCostValue;
    
    setCompletionSavings(savings);
    setShowCelebration(true);
  };
  
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Complete
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          
          {/* Task Info */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
            <h4 className="font-bold text-gray-900 mb-1">{task.title}</h4>
            <p className="text-sm text-green-800">
              ✓ Mark this task as done with minimal details
            </p>
          </div>
          
          {/* Actual cost (optional) */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">
              What did it cost? (optional)
            </label>
            <Input
              type="number"
              value={actualCost}
              onChange={(e) => setActualCost(e.target.value)}
              placeholder="0"
              className="bg-white"
              style={{ minHeight: '48px' }}
            />
            {task.diy_cost && (
              <p className="text-xs text-gray-600 mt-1">
                Estimated: ${task.diy_cost} • You'll save ~${Math.round((task.contractor_cost || 0) - (task.diy_cost || 0))}
              </p>
            )}
          </div>
          
          {/* Quick photo (optional) */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">
              Upload completion photo (optional)
            </label>
            <div className="space-y-2">
              {completionPhoto && (
                <img
                  src={completionPhoto}
                  alt="Completion"
                  className="w-full h-32 object-cover rounded-lg border-2 border-green-300"
                />
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('quick-complete-photo').click()}
                disabled={uploadingPhoto}
                className="w-full gap-2 border-2"
                style={{ minHeight: '48px' }}
              >
                {uploadingPhoto ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {completionPhoto ? 'Change Photo' : 'Upload Photo'}
                  </>
                )}
              </Button>
              <input
                id="quick-complete-photo"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              style={{ minHeight: '48px' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              disabled={completeTaskMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 font-semibold gap-2"
              style={{ minHeight: '48px' }}
            >
              {completeTaskMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Complete
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}