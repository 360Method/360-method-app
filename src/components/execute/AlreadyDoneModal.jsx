import React, { useState } from 'react';
import { MaintenanceTask } from "@/api/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import CompletionCelebration from "./CompletionCelebration";

export default function AlreadyDoneModal({ task, open, onClose, onComplete }) {
  const queryClient = useQueryClient();
  const [completionDate, setCompletionDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [actualCost, setActualCost] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [completionSavings, setCompletionSavings] = useState(0);

  const completeTaskMutation = useMutation({
    mutationFn: async (data) => {
      return await MaintenanceTask.update(task.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
    }
  });

  const handleComplete = async () => {
    const actualCostValue = parseFloat(actualCost) || 0;
    
    await completeTaskMutation.mutateAsync({
      status: 'Completed',
      completion_date: completionDate + 'T12:00:00Z',
      actual_cost: actualCostValue
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
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Already Completed
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
            <h4 className="font-bold text-gray-900 mb-1">{task.title}</h4>
            <p className="text-sm text-blue-800">
              Great! Let's quickly document this completion.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">
              When did you complete this?
            </label>
            <Input
              type="date"
              max={format(new Date(), 'yyyy-MM-dd')}
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              className="bg-white"
              style={{ minHeight: '48px' }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">
              Actual cost (optional)
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
                Estimated: ${task.diy_cost}
              </p>
            )}
          </div>
          
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
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}