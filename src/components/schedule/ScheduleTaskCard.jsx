import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  ArrowLeft,
  PlayCircle,
  AlertTriangle,
  Building2
} from "lucide-react";
import { format, parseISO } from "date-fns";

const PRIORITY_COLORS = {
  High: 'bg-red-600',
  Medium: 'bg-yellow-600',
  Low: 'bg-blue-600',
  Routine: 'bg-gray-600'
};

export default function ScheduleTaskCard({ 
  task, 
  property, 
  onSetDate, 
  onSendBack,
  onSendToExecute,
  showDateFirst = false 
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(
    task.scheduled_date ? parseISO(task.scheduled_date) : undefined
  );

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    onSetDate(task, date);
  };

  const hasDate = !!task.scheduled_date;
  const cascadeRiskScore = task.cascade_risk_score || 0;
  const hasCascadeAlert = cascadeRiskScore >= 7;
  const estimatedHours = task.estimated_hours || 0;
  const currentCost = task.current_fix_cost || 0;
  const isMultiUnit = property && property.door_count > 1;

  return (
    <Card className={`border-2 transition-all ${
      hasCascadeAlert 
        ? 'border-orange-400 bg-orange-50' 
        : hasDate
        ? 'border-green-200 bg-green-50'
        : 'border-yellow-200 bg-white'
    }`}>
      <CardContent className="p-4">
        {/* Task Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-bold text-lg text-gray-900 break-words">
                {task.title}
              </h3>
              {hasCascadeAlert && (
                <Badge className="bg-red-600 text-white gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  High Risk
                </Badge>
              )}
              {hasDate && (
                <Badge className="bg-green-600 text-white">
                  ✓ Has Date
                </Badge>
              )}
            </div>

            {/* Date Display - Prominent if showing */}
            {showDateFirst && hasDate && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-2 mb-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-green-700" />
                  <span className="font-bold text-green-900">
                    Scheduled: {format(parseISO(task.scheduled_date), 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={PRIORITY_COLORS[task.priority]}>
                {task.priority}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {task.system_type}
              </Badge>
              {task.execution_type && task.execution_type !== 'Not Decided' && (
                <Badge className="bg-blue-600">
                  {task.execution_type}
                </Badge>
              )}
              {estimatedHours > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {estimatedHours}h
                </Badge>
              )}
              {currentCost > 0 && (
                <Badge variant="outline" className="gap-1">
                  <DollarSign className="w-3 h-3" />
                  ${currentCost.toLocaleString()}
                </Badge>
              )}
              {isMultiUnit && task.unit_tag && (
                <Badge className="bg-purple-600 text-white gap-1">
                  <Building2 className="w-3 h-3" />
                  {task.unit_tag}
                </Badge>
              )}
              {property && (
                <Badge variant="outline" className="text-xs">
                  {property.address || property.street_address || 'Property'}
                </Badge>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0"
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-yellow-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-yellow-600" />
            )}
          </Button>
        </div>

        {/* Quick Description */}
        {task.description && !expanded && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Date Picker - Always Visible */}
        <div className="mb-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={`w-full justify-start text-left font-semibold ${
                  hasDate 
                    ? 'border-green-600 text-green-700 hover:bg-green-50' 
                    : 'border-orange-600 text-orange-700 hover:bg-orange-50'
                }`}
                style={{ minHeight: '48px' }}
              >
                <CalendarIcon className="mr-2 h-5 w-5" />
                {selectedDate
                  ? format(selectedDate, 'PPP')
                  : 'Click to Set Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="space-y-3 border-t border-yellow-200 pt-3">
            {/* Full Description */}
            {task.description && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Description:</p>
                <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
              </div>
            )}

            {/* Cascade Risk Warning */}
            {task.cascade_risk_reason && hasCascadeAlert && (
              <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-bold text-orange-900">⚠️ High Cascade Risk</span>
                </div>
                <p className="text-xs text-gray-800 leading-relaxed">{task.cascade_risk_reason}</p>
              </div>
            )}

            {/* Urgency Timeline */}
            {task.urgency_timeline && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                <p className="text-xs text-gray-700">
                  <strong>Timeline to Critical:</strong> {task.urgency_timeline}
                </p>
              </div>
            )}

            {/* Photos */}
            {task.photo_urls && task.photo_urls.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Reference Photos:</p>
                <div className="grid grid-cols-3 gap-2">
                  {task.photo_urls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Task photo ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-yellow-200">
          <Button
            onClick={() => onSendBack(task)}
            variant="outline"
            size="sm"
            className="gap-2 border-red-600 text-red-600 hover:bg-red-50"
            style={{ minHeight: '44px' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Prioritize
          </Button>

          {hasDate && (
            <Button
              onClick={() => onSendToExecute(task)}
              className="gap-2 bg-green-600 hover:bg-green-700"
              size="sm"
              style={{ minHeight: '44px' }}
            >
              <PlayCircle className="w-4 h-4" />
              Confirm Ready
            </Button>
          )}
        </div>

        {/* Helpful Info */}
        {hasDate && (
          <div className="mt-3 bg-blue-50 border border-blue-300 rounded-lg p-2">
            <p className="text-xs text-blue-900 leading-relaxed">
              <strong>💡 What's Next:</strong> This task will automatically appear in <strong>Execute</strong> on {format(parseISO(task.scheduled_date), 'MMM d')} 
              {' '}with complete AI how-to guides, tools list, and video tutorials. No further action needed!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}