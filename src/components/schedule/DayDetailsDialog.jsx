import React, { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Calendar, DollarSign, AlertTriangle, Wrench, Edit } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function DayDetailsDialog({ date, tasks, open, onClose, onTaskClick }) {
  const queryClient = useQueryClient();
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [timeRange, setTimeRange] = useState('');

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => base44.entities.MaintenanceTask.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      setEditingTaskId(null);
    }
  });

  const handleSaveTime = (taskId) => {
    updateTaskMutation.mutate({
      taskId,
      data: { time_range: timeRange }
    });
  };

  const timeRanges = [
    { value: 'morning', label: '🌅 Morning (6am-12pm)', hours: '6am - 12pm' },
    { value: 'afternoon', label: '☀️ Afternoon (12pm-6pm)', hours: '12pm - 6pm' },
    { value: 'evening', label: '🌙 Evening (6pm-12am)', hours: '6pm - 12am' }
  ];

  const groupedTasks = {
    morning: tasks.filter(t => !t.time_range || t.time_range === 'morning'),
    afternoon: tasks.filter(t => t.time_range === 'afternoon'),
    evening: tasks.filter(t => t.time_range === 'evening')
  };

  const totalHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || t.diy_time_hours || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-600" />
            {format(date, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          
          {/* Day Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{tasks.length}</div>
              <div className="text-xs text-blue-600">Tasks</div>
            </div>
            <div className="bg-purple-50 border border-purple-300 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-700">{totalHours.toFixed(1)}h</div>
              <div className="text-xs text-purple-600">Total Time</div>
            </div>
            <div className="bg-green-50 border border-green-300 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{Math.max(0, 8 - totalHours).toFixed(1)}h</div>
              <div className="text-xs text-green-600">Available</div>
            </div>
          </div>

          {totalHours > 8 && (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <p className="text-sm text-orange-900 font-semibold">
                  This day is overloaded by {(totalHours - 8).toFixed(1)} hours
                </p>
              </div>
            </div>
          )}

          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No tasks scheduled for this day</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeRanges.map(range => {
                const rangeTasks = groupedTasks[range.value];
                
                return (
                  <div key={range.value} className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-base text-gray-900">{range.label}</h3>
                      <span className="text-xs text-gray-600">{range.hours}</span>
                    </div>

                    {rangeTasks.length > 0 ? (
                      <div className="space-y-2">
                        {rangeTasks.map(task => (
                          <div
                            key={task.id}
                            className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-yellow-400 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div 
                                className="flex-1 cursor-pointer"
                                onClick={() => onTaskClick && onTaskClick(task)}
                              >
                                <div className="font-semibold text-gray-900 mb-2">{task.title}</div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={
                                    task.priority === 'High' ? 'bg-red-600' :
                                    task.priority === 'Medium' ? 'bg-yellow-600' :
                                    task.priority === 'Low' ? 'bg-blue-600' : 'bg-gray-600'
                                  }>
                                    {task.priority}
                                  </Badge>
                                  {task.execution_method && (
                                    <Badge className="bg-blue-600">
                                      {task.execution_method === 'DIY' && '🔧 DIY'}
                                      {task.execution_method === 'Contractor' && '👷 Contractor'}
                                      {task.execution_method === '360_Operator' && '⭐ Operator'}
                                    </Badge>
                                  )}
                                  {(task.estimated_hours || task.diy_time_hours) && (
                                    <Badge variant="outline" className="gap-1">
                                      <Clock className="w-3 h-3" />
                                      {task.estimated_hours || task.diy_time_hours}h
                                    </Badge>
                                  )}
                                  {task.current_fix_cost > 0 && (
                                    <Badge variant="outline" className="gap-1">
                                      <DollarSign className="w-3 h-3" />
                                      ${task.current_fix_cost.toLocaleString()}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Time Range Editor */}
                              {editingTaskId === task.id ? (
                                <div className="flex items-center gap-2">
                                  <Select
                                    value={timeRange || task.time_range || 'morning'}
                                    onValueChange={setTimeRange}
                                  >
                                    <SelectTrigger className="w-32" style={{ minHeight: '36px' }}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="morning">🌅 Morning</SelectItem>
                                      <SelectItem value="afternoon">☀️ Afternoon</SelectItem>
                                      <SelectItem value="evening">🌙 Evening</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveTime(task.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Save
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingTaskId(task.id);
                                    setTimeRange(task.time_range || 'morning');
                                  }}
                                  className="gap-1"
                                >
                                  <Clock className="w-3 h-3" />
                                  Set Time
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-3">
                        No tasks for {range.value}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-4 border-t">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
              style={{ minHeight: '48px' }}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}