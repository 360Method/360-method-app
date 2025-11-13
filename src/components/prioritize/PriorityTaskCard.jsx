
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AlertTriangle, DollarSign, Clock, TrendingDown, ChevronDown, ChevronUp, Info, ShoppingCart, Calendar as CalendarIcon, CheckCircle2, Trash2 } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";

import AddToCartDialog from "../cart/AddToCartDialog";
import ManualTaskForm from "../tasks/ManualTaskForm";
import TaskDetailView from "../tasks/TaskDetailView";

const PRIORITY_COLORS = {
  High: "bg-red-100 text-red-800 border-red-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Low: "bg-blue-100 text-blue-800 border-blue-200",
  Routine: "bg-gray-100 text-gray-800 border-gray-200"
};

const PRIORITY_ICONS = {
  High: "🔴",
  Medium: "🟡",
  Low: "🔵",
  Routine: "⚪"
};

// Generic cascade examples by system type
const GENERIC_CASCADE_EXAMPLES = {
  "HVAC System": "Small refrigerant leak → Compressor works harder → Compressor burns out → Full system replacement ($5K-8K)",
  "Plumbing System": "Small leak → Water damage → Mold growth → Structural damage → $8K-15K repair",
  "Electrical System": "Loose connection → Arcing → Fire hazard → Electrical fire → $20K-50K+ damage",
  "Roof System": "Small leak → Rotted deck → Interior damage → Mold growth → Structural issues → $30K+ disaster",
  "Foundation & Structure": "Small crack → Water intrusion → Foundation settling → Structural damage → $15K-40K repair",
  "Gutters & Downspouts": "Clog → Overflow → Foundation damage → Basement flooding → Landscaping erosion → $10K-30K damage",
  "Exterior Siding & Envelope": "Damaged siding → Water intrusion → Insulation damage → Mold → Interior damage → $8K-20K repair",
  "Windows & Doors": "Seal failure → Water intrusion → Frame rot → Wall damage → Mold → $5K-15K repair",
  "Appliances": "Worn hose → Burst → Flood → Water damage → Mold → $8K-15K cleanup",
  "Landscaping & Grading": "Poor grading → Water pools → Foundation damage → Basement issues → $10K-25K repair",
  "General": "Small issue → Secondary damage → Tertiary failures → Emergency repair at 3X cost"
};

// Safe date formatting
const safeFormatDate = (dateValue, formatString) => {
  if (!dateValue) return null;
  
  try {
    const date = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue);
    return isValid(date) ? format(date, formatString) : null;
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

export default function PriorityTaskCard({ task, rank, property, onUpdate, onDelete }) {
  const [showDetails, setShowDetails] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showCartDialog, setShowCartDialog] = React.useState(false);
  const [schedulePopoverOpen, setSchedulePopoverOpen] = React.useState(false);

  const costSavings = (task.delayed_fix_cost || 0) - (task.current_fix_cost || 0);

  // Get cascade example (this is used in TaskDetailView, which this card will open)
  const cascadeExample = task.cascade_risk_reason 
    || GENERIC_CASCADE_EXAMPLES[task.system_type] 
    || GENERIC_CASCADE_EXAMPLES["General"];

  const handleDateSelect = (date) => {
    if (!date) return;
    
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      // Call onUpdate with the task ID and the new scheduled_date, and possibly status
      onUpdate(task.id, { scheduled_date: formattedDate, status: 'Scheduled' });
      setSchedulePopoverOpen(false);
    } catch (error) {
      console.error('Error selecting date:', error);
    }
  };

  const scheduledDateDisplay = safeFormatDate(task.scheduled_date, 'MMM d');
  const borderColor = showDetails ? "border-orange-300" : "border-gray-200";

  return (
    <>
      <Card 
        className={`hover:shadow-lg transition-all cursor-pointer border-2 ${borderColor}`}
        onClick={() => setShowDetails(true)}
      >
        <CardHeader className="pb-3 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Rank Badge */}
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0 text-sm md:text-base">
                #{rank}
              </div>
              
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base md:text-lg mb-2 break-words">
                  {task.title}
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${PRIORITY_COLORS[task.priority]} text-xs`}>
                    {PRIORITY_ICONS[task.priority]} {task.priority}
                  </Badge>
                  {task.system_type && (
                    <Badge variant="outline" className="text-xs">{task.system_type}</Badge>
                  )}
                  {task.has_cascade_alert && (
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                      ⚠️ Cascade
                    </Badge>
                  )}
                  {task.scheduled_date && scheduledDateDisplay && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                      📅 {scheduledDateDisplay}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* The expand/collapse button is removed as the whole card is now clickable */}
          </div>
        </CardHeader>

        <CardContent className="p-3 md:p-4">
          {/* Quick Stats Row - Always Visible - Mobile Optimized */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-3">
            <div className="bg-orange-50 rounded-lg p-2 md:p-3 text-center border border-orange-200">
              <AlertTriangle className="w-4 h-4 md:w-5 md::h-5 text-orange-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Risk</p>
              <p className="font-bold text-sm md:text-base text-orange-700">{task.cascade_risk_score || 0}/10</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2 md:p-3 text-center border border-green-200">
              <DollarSign className="w-4 h-4 md:w-5 md::h-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Fix Now</p>
              <p className="font-bold text-sm md:text-base text-green-700">${((task.current_fix_cost || 0)/1000).toFixed(1)}K</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 md:p-3 text-center border border-blue-200">
              <Clock className="w-4 h-4 md:w-5 md::h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Timeline</p>
              <p className="font-bold text-xs md:text-sm text-blue-700">{task.urgency_timeline || 'ASAP'}</p>
            </div>
          </div>

          {/* Primary Action Buttons - Always Visible */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setShowCartDialog(true)}
              className="gap-2 w-full"
              style={{ backgroundColor: '#8B5CF6', minHeight: '48px' }}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm">Add to Cart</span>
            </Button>
            
            <Popover open={schedulePopoverOpen} onOpenChange={setSchedulePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 w-full border-2 border-blue-400 text-blue-700 hover:bg-blue-50"
                  style={{ minHeight: '48px' }}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span className="text-sm">{task.scheduled_date ? 'Reschedule' : 'Schedule'}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={task.scheduled_date ? parseISO(task.scheduled_date) : new Date()}
                  onSelect={handleDateSelect}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Expanded Details are now handled by TaskDetailView */}
        </CardContent>
      </Card>

      {/* Task Details Dialog */}
      {showDetails && (
        <TaskDetailView 
          task={task}
          property={property}
          onClose={() => setShowDetails(false)}
          onEdit={() => {
            setShowDetails(false);
            setShowEditDialog(true);
          }}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}

      {/* Edit Task Dialog */}
      {showEditDialog && (
        <ManualTaskForm
          propertyId={task.property_id}
          editingTask={task}
          onComplete={() => {
            setShowEditDialog(false);
            onUpdate(); // Call onUpdate to trigger a refresh in the parent component
          }}
          onCancel={() => setShowEditDialog(false)}
          open={showEditDialog}
        />
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
