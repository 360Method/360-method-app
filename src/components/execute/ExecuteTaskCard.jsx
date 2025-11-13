import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Wrench, 
  HardHat, 
  Star, 
  Calendar, 
  Clock, 
  AlertTriangle,
  DollarSign,
  Building2,
  Home,
  Zap,
  CheckCircle2
} from "lucide-react";
import { format, addDays } from "date-fns";
import DIYExecutionModal from "./DIYExecutionModal";
import ContractorExecutionCard from "./ContractorExecutionCard";
import OperatorTaskCard from "./OperatorTaskCard";
import QuickCompleteModal from "./QuickCompleteModal";
import AlreadyDoneModal from "./AlreadyDoneModal";

const URGENCY_STYLES = {
  overdue: {
    border: 'border-red-400',
    bg: 'bg-gradient-to-br from-red-50 to-orange-50',
    badge: 'bg-red-600'
  },
  today: {
    border: 'border-green-300',
    bg: 'bg-white',
    badge: 'bg-green-600'
  }
};

const METHOD_ICONS = {
  DIY: Wrench,
  Contractor: HardHat,
  '360_Operator': Star
};

export default function ExecuteTaskCard({ task, urgency = 'today', properties = [] }) {
  const queryClient = useQueryClient();
  const [showDIYModal, setShowDIYModal] = useState(false);
  const [showQuickComplete, setShowQuickComplete] = useState(false);
  const [showAlreadyDone, setShowAlreadyDone] = useState(false);
  
  // Route to specialized card for Operator tasks
  if (task.execution_method === '360_Operator') {
    return <OperatorTaskCard task={task} urgency={urgency} properties={properties} />;
  }
  
  // Route to specialized card for Contractor tasks
  if (task.execution_method === 'Contractor') {
    return <ContractorExecutionCard task={task} />;
  }
  
  // DIY tasks continue below
  const styles = URGENCY_STYLES[urgency];
  const MethodIcon = METHOD_ICONS[task.execution_method] || Wrench;
  const isSimpleTask = (task.estimated_hours || task.diy_time_hours || 2) < 0.5;
  const property = properties.find(p => p.id === task.property_id);

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => base44.entities.MaintenanceTask.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
    }
  });

  const handlePostpone = (days) => {
    const newDate = format(addDays(new Date(), days), 'yyyy-MM-dd');
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { scheduled_date: newDate }
    });
  };

  const handleDelete = () => {
    if (confirm(`Delete "${task.title}"?`)) {
      updateTaskMutation.mutate({
        taskId: task.id,
        data: { status: 'Deferred' }
      });
    }
  };

  return (
    <>
      <Card className={`border-2 ${styles.border} ${styles.bg} transition-all hover:shadow-lg`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base md:text-lg mb-2 flex items-center gap-2 flex-wrap">
                <MethodIcon className="w-5 h-5 flex-shrink-0" />
                <span className="break-words">{task.title}</span>
                {urgency === 'overdue' && (
                  <Badge className={`${styles.badge} text-white animate-pulse gap-1`}>
                    <AlertTriangle className="w-3 h-3" />
                    OVERDUE
                  </Badge>
                )}
              </CardTitle>
              
              <div className="flex items-center gap-2 flex-wrap">
                {property && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
                    <Home className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">
                      {property.address || property.street_address || 'Property'}
                    </span>
                  </div>
                )}
                
                <Badge variant="outline" className="text-xs">
                  {task.system_type}
                </Badge>
                
                {task.unit_tag && (
                  <Badge className="bg-purple-600 text-white text-xs gap-1">
                    <Building2 className="w-3 h-3" />
                    {task.unit_tag}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="text-right">
              {task.scheduled_date && (
                <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(task.scheduled_date), 'MMM d')}
                </div>
              )}
              {(task.diy_time_hours || task.estimated_hours) && (
                <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                  <Clock className="w-3 h-3" />
                  ~{task.diy_time_hours || task.estimated_hours}h
                </div>
              )}
              {(task.diy_cost || task.contractor_cost) && (
                <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                  <DollarSign className="w-3 h-3" />
                  ~${task.diy_cost || task.contractor_cost}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {task.description && (
            <p className="text-sm text-gray-700 line-clamp-2">
              {task.description}
            </p>
          )}
          
          {task.key_warning && task.cascade_risk_score >= 7 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 font-semibold">
                  {task.key_warning}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setShowDIYModal(true)}
              className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
              style={{ minHeight: '48px' }}
            >
              <Wrench className="w-4 h-4" />
              Start DIY Guide
            </Button>
            
            {isSimpleTask && (
              <Button
                onClick={() => setShowQuickComplete(true)}
                variant="outline"
                className="flex-1 border-2 border-green-300 gap-2"
                style={{ minHeight: '48px' }}
              >
                <Zap className="w-4 h-4" />
                Quick Complete
              </Button>
            )}
            
            <Button
              onClick={() => setShowAlreadyDone(true)}
              variant="ghost"
              className="text-gray-600 hover:text-gray-800"
              style={{ minHeight: '48px' }}
            >
              Already Done?
            </Button>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  style={{ minHeight: '44px' }}
                >
                  Can't do today? Postpone →
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handlePostpone(1)}>
                  Tomorrow
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePostpone(3)}>
                  In 3 Days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePostpone(7)}>
                  Next Week
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <button
              onClick={handleDelete}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
              style={{ minHeight: '44px' }}
            >
              Delete
            </button>
          </div>
        </CardContent>
      </Card>

      {showDIYModal && (
        <DIYExecutionModal
          task={task}
          open={showDIYModal}
          onClose={() => setShowDIYModal(false)}
          onComplete={() => setShowDIYModal(false)}
        />
      )}
      
      {showQuickComplete && (
        <QuickCompleteModal
          task={task}
          open={showQuickComplete}
          onClose={() => setShowQuickComplete(false)}
          onComplete={() => setShowQuickComplete(false)}
        />
      )}
      
      {showAlreadyDone && (
        <AlreadyDoneModal
          task={task}
          open={showAlreadyDone}
          onClose={() => setShowAlreadyDone(false)}
          onComplete={() => setShowAlreadyDone(false)}
        />
      )}
    </>
  );
}