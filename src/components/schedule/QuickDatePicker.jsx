import React, { useState } from 'react';
import { format, addDays, startOfWeek, addWeeks, startOfDay, nextSaturday } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle2, Sparkles, ArrowLeft, DollarSign, AlertTriangle, Building2, BookOpen, Wrench } from "lucide-react";

export default function QuickDatePicker({ task, property, onSchedule, onClose, onSnooze }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const today = startOfDay(new Date());
  
  const quickOptions = [
    { 
      label: 'Today', 
      date: today,
      subtitle: format(today, 'EEEE, MMM d')
    },
    { 
      label: 'Tomorrow', 
      date: addDays(today, 1),
      subtitle: format(addDays(today, 1), 'EEEE, MMM d')
    },
    { 
      label: 'This Weekend', 
      date: nextSaturday(today),
      subtitle: format(nextSaturday(today), 'EEEE, MMM d')
    },
    { 
      label: 'Next Monday', 
      date: addWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1),
      subtitle: format(addWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1), 'EEEE, MMM d')
    },
    { 
      label: 'Next Week', 
      date: addWeeks(today, 1),
      subtitle: format(addWeeks(today, 1), 'EEEE, MMM d')
    }
  ];
  
  const handleSchedule = () => {
    if (selectedDate) {
      onSchedule(task, selectedDate);
      onClose();
    }
  };

  const isMultiUnit = property && property.door_count > 1;
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-yellow-600" />
            Schedule Task
          </DialogTitle>
          <DialogDescription>
            Pick a date for this task or view full details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Task Summary */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="font-bold text-gray-900 flex-1">{task.title}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-yellow-700"
              >
                {showDetails ? 'Hide' : 'View'} Details
              </Button>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-sm">
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
                  ~{task.estimated_hours || task.diy_time_hours}h
                </Badge>
              )}
              {task.current_fix_cost > 0 && (
                <Badge variant="outline" className="gap-1">
                  <DollarSign className="w-3 h-3" />
                  ${task.current_fix_cost.toLocaleString()}
                </Badge>
              )}
              {isMultiUnit && task.unit_tag && (
                <Badge className="bg-purple-600 text-white gap-1">
                  <Building2 className="w-3 h-3" />
                  {task.unit_tag}
                </Badge>
              )}
            </div>
          </div>

          {/* Expanded Details */}
          {showDetails && (
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {task.description && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Description:</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
                </div>
              )}

              {task.cascade_risk_score >= 7 && task.cascade_risk_reason && (
                <div className="bg-red-50 border-2 border-red-400 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-bold text-red-900">High Cascade Risk</span>
                  </div>
                  <p className="text-xs text-gray-800 leading-relaxed">{task.cascade_risk_reason}</p>
                </div>
              )}

              {task.ai_sow && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Steps to Complete:
                  </h4>
                  <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {task.ai_sow}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* QUICK OPTIONS */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Options:</h4>
            <div className="space-y-2">
              {quickOptions.map(option => {
                const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
                const optionStr = format(option.date, 'yyyy-MM-dd');
                const isSelected = dateStr === optionStr;
                
                return (
                  <button
                    key={option.label}
                    onClick={() => setSelectedDate(option.date)}
                    className={`
                      w-full px-4 py-3 rounded-lg border-2 text-left transition-all
                      ${isSelected
                        ? 'border-yellow-500 bg-yellow-50 shadow-sm'
                        : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                      }
                    `}
                    style={{ minHeight: '60px' }}
                  >
                    <div className="font-semibold text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600">
                      {option.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* CUSTOM DATE */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Or pick a custom date:</h4>
            <Input
              type="date"
              min={format(today, 'yyyy-MM-dd')}
              value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(startOfDay(new Date(e.target.value + 'T00:00:00')));
                }
              }}
              className="text-base"
              style={{ minHeight: '48px' }}
            />
          </div>
          
          {/* ACTION BUTTONS */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              style={{ minHeight: '48px' }}
            >
              Cancel
            </Button>
            {onSnooze && (
              <Button
                variant="outline"
                onClick={() => {
                  onSnooze(task);
                  onClose();
                }}
                className="flex-1 border-red-600 text-red-700 hover:bg-red-50"
                style={{ minHeight: '48px' }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Prioritize
              </Button>
            )}
            <Button
              onClick={handleSchedule}
              disabled={!selectedDate}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 font-semibold"
              style={{ minHeight: '48px' }}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}