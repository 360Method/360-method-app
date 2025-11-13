import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HardHat, Phone, CheckCircle2, Calendar, Star } from "lucide-react";
import { format } from "date-fns";

export default function ContractorExecutionCard({ task }) {
  const queryClient = useQueryClient();
  const [contractorArrived, setContractorArrived] = useState(task.status === 'In Progress');
  const [rating, setRating] = useState(task.contractor_rating || 0);

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => base44.entities.MaintenanceTask.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const handleArrival = () => {
    setContractorArrived(true);
    updateTaskMutation.mutate({
      taskId: task.id,
      data: {
        status: 'In Progress',
        actual_start_time: new Date().toISOString()
      }
    });
  };

  const handleComplete = () => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: {
        status: 'Completed',
        completion_date: new Date().toISOString(),
        contractor_rating: rating > 0 ? rating : null
      }
    });
  };

  return (
    <Card className="border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-white">
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-2 flex items-center gap-2">
              <HardHat className="w-5 h-5 text-gray-600 flex-shrink-0" />
              <span className="break-words">{task.title}</span>
            </CardTitle>
            <div className="space-y-1">
              <div className="text-sm text-gray-700 font-semibold">
                {task.contractor_name || 'Contractor not assigned'}
              </div>
              {task.contractor_phone && (
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {task.contractor_phone}
                </div>
              )}
              {task.contractor_email && (
                <div className="text-xs text-gray-500">
                  {task.contractor_email}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <Badge variant="outline" className="mb-1">
              <Calendar className="w-3 h-3 mr-1" />
              Scheduled
            </Badge>
            <div className="text-sm font-semibold text-gray-900">
              {task.scheduled_date ? format(new Date(task.scheduled_date), 'MMM d, yyyy') : 'Not scheduled'}
            </div>
            {task.contractor_cost && (
              <div className="text-xs text-gray-600 mt-1">
                Est: ${task.contractor_cost}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {!contractorArrived ? (
          <div className="space-y-2">
            <Button
              onClick={handleArrival}
              className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
              style={{ minHeight: '48px' }}
              disabled={updateTaskMutation.isPending}
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark Contractor Arrived
            </Button>
            
            {task.contractor_phone && (
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = `tel:${task.contractor_phone}`;
                }}
                className="w-full gap-2 border-2"
                style={{ minHeight: '48px' }}
              >
                <Phone className="w-4 h-4" />
                Call Contractor
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 text-center">
              <div className="text-blue-800 font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Contractor working on site
              </div>
              {task.actual_start_time && (
                <div className="text-xs text-blue-600 mt-1">
                  Started: {format(new Date(task.actual_start_time), 'h:mm a')}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                Rate this contractor (1-5 stars):
              </label>
              <div className="flex gap-2 justify-center mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-4xl transition-all ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:scale-110`}
                    style={{ minHeight: '44px', minWidth: '44px' }}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <div className="text-center text-sm text-gray-600">
                  {rating === 5 && '⭐ Excellent!'}
                  {rating === 4 && '👍 Very Good'}
                  {rating === 3 && '👌 Good'}
                  {rating === 2 && '😐 Fair'}
                  {rating === 1 && '👎 Poor'}
                </div>
              )}
            </div>
            
            <Button
              onClick={handleComplete}
              disabled={updateTaskMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700 font-bold gap-2"
              style={{ minHeight: '56px' }}
            >
              <CheckCircle2 className="w-5 h-5" />
              Mark Work Complete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}