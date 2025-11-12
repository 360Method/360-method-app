import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, CheckCircle2, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function TaskDialog({ open, onClose, selectedDate, propertyId, existingTasks, onAddTask }) {
  const queryClient = useQueryClient();

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => base44.entities.MaintenanceTask.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }) => 
      base44.entities.MaintenanceTask.update(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
    },
  });

  const handleCompleteTask = (taskId) => {
    updateTaskMutation.mutate({
      taskId,
      updates: {
        status: 'Completed',
        completion_date: format(new Date(), 'yyyy-MM-dd')
      }
    });
  };

  const handleUnscheduleTask = (taskId) => {
    updateTaskMutation.mutate({
      taskId,
      updates: {
        scheduled_date: null,
        status: 'Identified'
      }
    });
  };

  if (!selectedDate) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl" style={{ color: '#1B365D' }}>
            <Calendar className="w-6 h-6 text-blue-600" />
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {existingTasks.length > 0 ? (
            <>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-blue-900">
                  📋 {existingTasks.length} Task{existingTasks.length !== 1 ? 's' : ''} Scheduled
                </p>
              </div>

              <div className="space-y-3">
                {existingTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-4 border-2 rounded-lg bg-white hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2">{task.title}</h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge
                            className={
                              task.priority === 'High'
                                ? 'bg-red-600 text-white'
                                : task.priority === 'Medium'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-blue-600 text-white'
                            }
                          >
                            {task.priority} Priority
                          </Badge>
                          {task.system_type && (
                            <Badge variant="outline">
                              {task.system_type}
                            </Badge>
                          )}
                          <Badge className="bg-purple-100 text-purple-800">
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t">
                      <Button
                        onClick={() => handleCompleteTask(task.id)}
                        size="sm"
                        className="gap-2"
                        style={{ backgroundColor: '#28A745', minHeight: '40px' }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Complete
                      </Button>
                      <Button
                        onClick={() => handleUnscheduleTask(task.id)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        style={{ minHeight: '40px' }}
                      >
                        <Calendar className="w-4 h-4" />
                        Unschedule
                      </Button>
                      <Button
                        onClick={() => deleteTaskMutation.mutate(task.id)}
                        variant="outline"
                        size="sm"
                        className="gap-2 text-red-600 border-red-300 hover:bg-red-50"
                        style={{ minHeight: '40px' }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 pt-4">
                <Button
                  onClick={onAddTask}
                  variant="outline"
                  className="w-full gap-2 border-2 border-blue-400 text-blue-700 hover:bg-blue-50"
                  style={{ minHeight: '48px' }}
                >
                  <Plus className="w-5 h-5" />
                  Add Another Task for This Date
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-1 font-semibold">No tasks scheduled</p>
              <p className="text-sm text-gray-500 mb-6">
                Add a task to this date to start your schedule
              </p>
              <Button
                onClick={onAddTask}
                className="gap-2"
                style={{ backgroundColor: '#28A745', minHeight: '48px' }}
              >
                <Plus className="w-5 h-5" />
                Schedule Task for {format(selectedDate, 'MMM d')}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}