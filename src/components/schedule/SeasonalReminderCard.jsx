import React from 'react';
import { AlertCircle, Calendar, Clock, DollarSign, Home, Building2, Send, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SeasonalReminderCard({ task, onSchedule, onSnooze, properties = [] }) {
  const property = properties.find(p => p.id === task.property_id);
  
  return (
    <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-base text-gray-900 break-words">{task.title}</h4>
          
          {/* Property Badge */}
          {property && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-orange-300 rounded text-xs mt-1">
              <Home className="w-3 h-3" />
              <span className="truncate max-w-[150px]">
                {property.address || property.street_address || 'Property'}
              </span>
            </div>
          )}
          
          {/* Completion Window */}
          {task.recommended_completion_window && (
            <div className="flex items-center gap-1 mt-2">
              <Calendar className="w-3 h-3 text-orange-600" />
              <span className="text-xs text-orange-700 font-medium">
                Best time: {task.recommended_completion_window}
              </span>
            </div>
          )}
        </div>
        
        {/* Priority & Unit Badges */}
        <div className="flex flex-col gap-1 items-end">
          {task.priority && (
            <Badge 
              className={
                task.priority === 'High' ? 'bg-red-600 text-white' :
                task.priority === 'Medium' ? 'bg-yellow-600 text-white' :
                'bg-blue-600 text-white'
              }
            >
              {task.priority}
            </Badge>
          )}
          
          {task.unit_tag && (
            <Badge className="bg-purple-600 text-white text-xs gap-1">
              <Building2 className="w-3 h-3" />
              {task.unit_tag}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {task.estimated_hours && (
          <div className="bg-white rounded border border-orange-200 p-2 text-center">
            <Clock className="w-4 h-4 text-gray-600 mx-auto mb-1" />
            <div className="text-xs text-gray-600">Time</div>
            <div className="text-sm font-bold text-gray-900">
              {task.estimated_hours}h
            </div>
          </div>
        )}
        
        {task.diy_cost && (
          <div className="bg-green-50 rounded border border-green-200 p-2 text-center">
            <DollarSign className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <div className="text-xs text-green-700">DIY</div>
            <div className="text-sm font-bold text-green-700">
              ${task.diy_cost}
            </div>
          </div>
        )}
        
        {task.contractor_cost && (
          <div className="bg-gray-50 rounded border border-gray-200 p-2 text-center">
            <DollarSign className="w-4 h-4 text-gray-600 mx-auto mb-1" />
            <div className="text-xs text-gray-700">Pro</div>
            <div className="text-sm font-bold text-gray-700">
              ${task.contractor_cost}
            </div>
          </div>
        )}
      </div>
      
      {/* Cascade risk warning */}
      {task.cascade_risk_score >= 7 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-3 rounded">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-900">High Risk if Delayed</p>
              {task.delayed_fix_cost && (
                <p className="text-xs text-red-700 mt-1">
                  Could become ${task.delayed_fix_cost} problem
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={() => onSchedule(task)}
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          style={{ minHeight: '48px' }}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Now
        </Button>
        
        <Button
          onClick={() => onSnooze(task)}
          variant="outline"
          className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50"
          style={{ minHeight: '48px' }}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </div>
      
    </Card>
  );
}