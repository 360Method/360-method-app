import React, { useState } from 'react';
import { format, addDays, startOfWeek, addWeeks, startOfDay, nextSaturday } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";

export default function QuickDatePicker({ task, onSchedule, onClose }) {
  const [selectedDate, setSelectedDate] = useState(null);
  
  const today = startOfDay(new Date());
  
  // Generate quick options
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
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-yellow-600" />
            Schedule Task
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Task Info */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
            <h4 className="font-bold text-gray-900 mb-1">{task.title}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {task.execution_method && (
                <span>
                  {task.execution_method === 'DIY' && '🔧 DIY'}
                  {task.execution_method === 'Contractor' && '👷 Contractor'}
                  {task.execution_method === '360_Operator' && '⭐ 360° Operator'}
                </span>
              )}
              {(task.estimated_hours || task.diy_time_hours) && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  ~{task.estimated_hours || task.diy_time_hours}h
                </span>
              )}
            </div>
          </div>
          
          {/* QUICK OPTIONS */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Options:</h4>
            <div className="space-y-2">
              {quickOptions.map(option => {
                const dateStr = format(option.date, 'yyyy-MM-dd');
                const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateStr;
                
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
            <input
              type="date"
              min={format(today, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none bg-white"
              style={{ minHeight: '48px' }}
            />
          </div>
          
          {/* ACTION BUTTONS */}
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
              onClick={handleSchedule}
              disabled={!selectedDate}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 font-semibold"
              style={{ minHeight: '48px' }}
            >
              Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}