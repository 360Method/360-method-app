import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function TaskDialog({ open, onClose, selectedDate, propertyId, existingTasks, onAddTask }) {
  if (!selectedDate) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {format(selectedDate, 'MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {existingTasks.length > 0 ? (
            <>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Scheduled Tasks ({existingTasks.length})
                </p>
                <div className="space-y-2">
                  {existingTasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{task.title}</h4>
                        <Badge
                          className={
                            task.priority === 'High'
                              ? 'bg-red-600 text-white'
                              : task.priority === 'Medium'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-blue-600 text-white'
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{task.description}</p>
                      {task.system_type && (
                        <p className="text-xs text-gray-500 mt-2">
                          System: {task.system_type}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <Button
                  onClick={onAddTask}
                  variant="outline"
                  className="w-full gap-2"
                  style={{ minHeight: '48px' }}
                >
                  <Plus className="w-4 h-4" />
                  Add Another Task for This Date
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No tasks scheduled for this date</p>
              <Button
                onClick={onAddTask}
                className="gap-2"
                style={{ backgroundColor: '#28A745', minHeight: '48px' }}
              >
                <Plus className="w-4 h-4" />
                Add Task for {format(selectedDate, 'MMM d')}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}