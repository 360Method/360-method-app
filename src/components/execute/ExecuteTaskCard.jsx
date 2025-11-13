import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  HardHat, 
  Star, 
  Calendar, 
  Clock, 
  AlertTriangle,
  DollarSign,
  Building2
} from "lucide-react";
import { format } from "date-fns";
import DIYExecutionModal from "./DIYExecutionModal";
import ContractorExecutionCard from "./ContractorExecutionCard";

const URGENCY_STYLES = {
  overdue: {
    border: 'border-red-400',
    bg: 'bg-gradient-to-br from-red-50 to-orange-50',
    badge: 'bg-red-600'
  },
  today: {
    border: 'border-yellow-400',
    bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    badge: 'bg-yellow-600'
  },
  upcoming: {
    border: 'border-blue-300',
    bg: 'bg-white',
    badge: 'bg-blue-600'
  }
};

const METHOD_ICONS = {
  DIY: Wrench,
  Contractor: HardHat,
  '360_Operator': Star
};

export default function ExecuteTaskCard({ task, urgency = 'upcoming' }) {
  const [showDIYModal, setShowDIYModal] = useState(false);
  
  const styles = URGENCY_STYLES[urgency];
  const MethodIcon = METHOD_ICONS[task.execution_method] || Wrench;

  // For contractor tasks, use the dedicated contractor card
  if (task.execution_method === 'Contractor') {
    return <ContractorExecutionCard task={task} />;
  }

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
                <Badge variant="outline" className="text-xs">
                  {task.system_type}
                </Badge>
                <Badge className="bg-gray-700 text-white text-xs">
                  {task.execution_method === '360_Operator' ? '360° Operator' : task.execution_method}
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
              {(task.diy_cost || task.contractor_cost || task.operator_cost) && (
                <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                  <DollarSign className="w-3 h-3" />
                  ~${task.diy_cost || task.operator_cost || task.contractor_cost}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {task.description && (
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}
          
          {task.execution_method === 'DIY' && (
            <Button
              onClick={() => setShowDIYModal(true)}
              className="w-full bg-green-600 hover:bg-green-700 gap-2"
              style={{ minHeight: '48px' }}
            >
              <Wrench className="w-4 h-4" />
              Start DIY Execution
            </Button>
          )}
          
          {task.execution_method === '360_Operator' && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-900">
                <Star className="w-4 h-4" />
                <span className="font-semibold">
                  360° Operator will contact you to schedule
                </span>
              </div>
              {task.operator_cost && (
                <div className="text-xs text-blue-700 mt-1">
                  Estimated cost: ${task.operator_cost}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showDIYModal && (
        <DIYExecutionModal
          task={task}
          open={showDIYModal}
          onClose={() => setShowDIYModal(false)}
          onComplete={() => {
            setShowDIYModal(false);
          }}
        />
      )}
    </>
  );
}