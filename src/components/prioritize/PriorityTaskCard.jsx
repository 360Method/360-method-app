
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, DollarSign, Clock, TrendingDown, ChevronDown, ChevronUp, Info, ShoppingCart, Calendar } from "lucide-react";
import { format } from "date-fns";

import AddToCartDialog from "../cart/AddToCartDialog";

const PRIORITY_COLORS = {
  High: "bg-red-100 text-red-800 border-red-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Low: "bg-blue-100 text-blue-800 border-blue-200",
  Routine: "bg-gray-100 text-gray-800 border-gray-200"
};

// Generic cascade examples by system type
const GENERIC_CASCADE_EXAMPLES = {
  "HVAC": "Small refrigerant leak → Compressor works harder → Compressor burns out → Full system replacement ($5K-8K)",
  "Plumbing": "Small leak → Water damage → Mold growth → Structural damage → $8K-15K repair",
  "Electrical": "Loose connection → Arcing → Fire hazard → Electrical fire → $20K-50K+ damage",
  "Roof": "Small leak → Rotted deck → Interior damage → Mold growth → Structural issues → $30K+ disaster",
  "Foundation": "Small crack → Water intrusion → Foundation settling → Structural damage → $15K-40K repair",
  "Gutters": "Clog → Overflow → Foundation damage → Basement flooding → Landscaping erosion → $10K-30K damage",
  "Exterior": "Damaged siding → Water intrusion → Insulation damage → Mold → Interior damage → $8K-20K repair",
  "Windows/Doors": "Seal failure → Water intrusion → Frame rot → Wall damage → Mold → $5K-15K repair",
  "Appliances": "Worn hose → Burst → Flood → Water damage → Mold → $8K-15K cleanup",
  "Landscaping": "Poor grading → Water pools → Foundation damage → Basement issues → $10K-25K repair",
  "General": "Small issue → Secondary damage → Tertiary failures → Emergency repair at 3X cost"
};

export default function PriorityTaskCard({ task, rank, onPriorityChange, onStatusChange, propertyId }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showCartDialog, setShowCartDialog] = React.useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = React.useState(false);
  const [scheduledDate, setScheduledDate] = React.useState(
    task.scheduled_date ? format(new Date(task.scheduled_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );

  const costSavings = (task.delayed_fix_cost || 0) - (task.current_fix_cost || 0);

  // Get cascade example - use custom reason if provided, otherwise generic
  const cascadeExample = task.cascade_risk_reason 
    || GENERIC_CASCADE_EXAMPLES[task.system_type] 
    || GENERIC_CASCADE_EXAMPLES["General"];

  const handleScheduleTask = () => {
    setShowScheduleDialog(true);
  };

  const handleConfirmSchedule = () => {
    // Update task with both status and scheduled date
    onStatusChange(task.id, 'Scheduled', scheduledDate);
    setShowScheduleDialog(false);
  };

  return (
    <>
      <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-700 flex-shrink-0">
                #{rank}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg mb-2">{task.title}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge className={PRIORITY_COLORS[task.priority]}>
                    {task.priority} Priority
                  </Badge>
                  {task.system_type && (
                    <Badge variant="outline">{task.system_type}</Badge>
                  )}
                  {task.has_cascade_alert && (
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                      ⚠️ Cascade Risk
                    </Badge>
                  )}
                  {task.scheduled_date && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      📅 {format(new Date(task.scheduled_date), 'MMM d, yyyy')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Quick Stats Row - Always Visible */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Risk Score</p>
                <p className="font-semibold">{task.cascade_risk_score || 0}/10</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Fix Now</p>
                <p className="font-semibold">${(task.current_fix_cost || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Timeline</p>
                <p className="font-semibold text-sm">{task.urgency_timeline || 'ASAP'}</p>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-6 space-y-4 pt-4 border-t">
              {task.description && (
                <div>
                  <p className="text-sm text-gray-700">{task.description}</p>
                </div>
              )}

              {/* Cascade Risk Explanation */}
              {task.has_cascade_alert && (
                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <TrendingDown className="w-6 h-6 text-orange-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                        💥 Cascade Risk: Why This Matters
                        {task.cascade_risk_score && (
                          <Badge className="bg-orange-600 text-white">
                            {task.cascade_risk_score}/10 Risk
                          </Badge>
                        )}
                      </h4>
                      <p className="text-sm text-gray-800 leading-relaxed mb-3">
                        This problem triggers a chain reaction of increasingly expensive damage if left unaddressed.
                      </p>
                      <div className="bg-white rounded-lg p-3 border border-orange-200">
                        <p className="text-xs font-semibold text-orange-900 mb-2 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Typical Cascade Pattern:
                        </p>
                        <p className="text-sm text-gray-800 font-mono leading-relaxed">
                          {cascadeExample}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cost Impact */}
              {(task.current_fix_cost || task.delayed_fix_cost) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Cost Impact: Why Acting Now Saves Money
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Fix Now:</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${(task.current_fix_cost || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Fix Later:</p>
                      <p className="text-2xl font-bold text-red-700">
                        ${(task.delayed_fix_cost || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {task.cost_impact_reason && (
                    <div className="bg-white rounded-lg p-3 border border-blue-200 mb-3">
                      <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Why Delaying Costs More:
                      </p>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {task.cost_impact_reason}
                      </p>
                    </div>
                  )}

                  {costSavings > 0 && (
                    <div className="pt-3 border-t border-blue-200">
                      <p className="text-sm font-medium text-gray-800">
                        ✅ Act now and save: <span className="text-green-700 font-bold">${costSavings.toLocaleString()}</span>
                      </p>
                      {task.urgency_timeline && (
                        <p className="text-xs text-gray-600 mt-1">
                          Timeline: {task.urgency_timeline}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <Button
                  onClick={() => setShowCartDialog(true)}
                  className="w-full gap-2"
                  style={{ backgroundColor: '#8B5CF6', minHeight: '48px' }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Service Cart
                </Button>

                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <Label className="text-xs text-gray-600 mb-1 block">Change Priority:</Label>
                    <Select
                      value={task.priority}
                      onValueChange={(value) => onPriorityChange(task.id, value)}
                    >
                      <SelectTrigger className="h-9" style={{ minHeight: '48px' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Routine">Routine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleScheduleTask}
                      className="gap-2"
                      style={{ minHeight: '48px' }}
                    >
                      <Calendar className="w-4 h-4" />
                      {task.scheduled_date ? 'Reschedule' : 'Schedule'}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onStatusChange(task.id, 'Completed')}
                      style={{ backgroundColor: 'var(--accent)', minHeight: '48px' }}
                    >
                      Mark Complete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Date Dialog */}
      {showScheduleDialog && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" style={{ backgroundColor: '#FFFFFF', opacity: 1 }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#1B365D' }}>
              Schedule Task
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Set a date to schedule this task on your calendar
            </p>
            
            <div className="mb-6">
              <Label className="mb-2 block">Scheduled Date</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                style={{ backgroundColor: '#FFFFFF', minHeight: '48px' }}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowScheduleDialog(false)}
                className="flex-1"
                style={{ minHeight: '48px' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSchedule}
                className="flex-1 gap-2"
                style={{ backgroundColor: '#3B82F6', minHeight: '48px' }}
              >
                <Calendar className="w-4 h-4" />
                Schedule Task
              </Button>
            </div>
          </div>
        </div>
      )}

      <AddToCartDialog
        open={showCartDialog}
        onClose={() => setShowCartDialog(false)}
        prefilledData={{
          property_id: task.property_id,
          source_type: "task",
          source_id: task.id,
          title: task.title,
          description: task.description,
          system_type: task.system_type,
          priority: task.priority,
          photo_urls: task.photo_urls || [],
          estimated_hours: Math.ceil((task.current_fix_cost || 500) / 150),
          estimated_cost_min: task.current_fix_cost,
          estimated_cost_max: task.delayed_fix_cost,
          customer_notes: task.cascade_risk_reason ? `⚠️ Cascade Risk: ${task.cascade_risk_reason}` : ''
        }}
      />
    </>
  );
}
