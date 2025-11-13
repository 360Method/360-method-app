import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Package, CheckCircle2, Clock, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PriorityTaskCard from "./PriorityTaskCard";

export default function TaskGroupCard({ 
  tasks, 
  property,
  onSendToSchedule,
  onMarkComplete,
  onDelete,
  selectedTasks,
  onToggleTask
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  if (!tasks || tasks.length === 0) return null;
  
  const firstTask = tasks[0];
  const batchId = firstTask.batch_id;
  
  // Calculate stats
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const scheduledCount = tasks.filter(t => t.status === 'Scheduled').length;
  const pendingCount = tasks.filter(t => t.status === 'Identified' || t.status === 'Deferred').length;
  
  // Check if all tasks in this group are selected
  const allSelected = tasks.every(t => selectedTasks.includes(t.id));
  const someSelected = tasks.some(t => selectedTasks.includes(t.id));
  
  const handleToggleAll = () => {
    if (allSelected) {
      // Deselect all
      tasks.forEach(t => {
        if (selectedTasks.includes(t.id)) {
          onToggleTask(t.id);
        }
      });
    } else {
      // Select all pending
      tasks.forEach(t => {
        if (t.status !== 'Completed' && !selectedTasks.includes(t.id)) {
          onToggleTask(t.id);
        }
      });
    }
  };

  return (
    <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardContent className="p-4">
        {/* Collapsed Group Header */}
        <div className="flex items-start gap-3">
          {/* Checkbox for group selection */}
          <Checkbox
            id={`group-${batchId}`}
            checked={allSelected}
            onCheckedChange={handleToggleAll}
            className="mt-1"
            ref={(el) => {
              if (el && someSelected && !allSelected) {
                el.indeterminate = true;
              }
            }}
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-lg text-gray-900">{firstTask.title}</h3>
                  <Badge className="bg-blue-600 text-white">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Property: {property?.address || 'Unknown Property'}
                </p>
                
                {/* Status Summary */}
                <div className="flex flex-wrap gap-2">
                  {completedCount > 0 && (
                    <Badge className="gap-1 bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3" />
                      {completedCount} Completed
                    </Badge>
                  )}
                  {scheduledCount > 0 && (
                    <Badge className="gap-1 bg-yellow-100 text-yellow-800">
                      <Calendar className="w-3 h-3" />
                      {scheduledCount} Scheduled
                    </Badge>
                  )}
                  {pendingCount > 0 && (
                    <Badge className="gap-1 bg-orange-100 text-orange-800">
                      <Clock className="w-3 h-3" />
                      {pendingCount} Pending
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="gap-2"
                style={{ minHeight: '44px' }}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Expand
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded Task List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-blue-300 space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-2">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={() => onToggleTask(task.id)}
                      disabled={task.status === 'Completed'}
                      className="mt-3"
                    />
                    <div className="flex-1">
                      <PriorityTaskCard
                        task={task}
                        property={property}
                        onSendToSchedule={onSendToSchedule}
                        onMarkComplete={onMarkComplete}
                        onDelete={onDelete}
                        compact={true}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Quick Actions */}
              {pendingCount > 0 && (
                <div className="mt-4 pt-4 border-t border-blue-300">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleAll}
                    className="text-xs"
                  >
                    {allSelected ? 'Deselect All' : `Select All Pending (${pendingCount})`}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}