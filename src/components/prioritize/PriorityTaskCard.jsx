
import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Wrench,
  User,
  AlertCircle,
  Trash2,
  ShoppingCart,
  Send,
  Edit,
  CheckCircle2,
  TrendingUp,
  Building2 // Added Building2 import
} from "lucide-react";
import { format } from "date-fns";
import AddToCartDialog from "../cart/AddToCartDialog";
import ManualTaskForm from "../tasks/ManualTaskForm";

const PRIORITY_COLORS = {
  High: 'bg-red-600',
  Medium: 'bg-yellow-600',
  Low: 'bg-blue-600',
  Routine: 'bg-gray-600'
};

const PRIORITY_ICONS = {
  High: '🔥',
  Medium: '⚡',
  Low: '💡',
  Routine: '🔄'
};

const GENERIC_CASCADE_EXAMPLES = [
  "Small leaks lead to water damage → mold → structural issues",
  "Clogged gutters → foundation damage → basement flooding",
  "HVAC neglect → system failure during peak season → emergency costs",
  "Minor roof damage → water intrusion → ceiling/insulation replacement"
];

function safeFormatDate(dateString) {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return format(date, 'MMM d, yyyy');
  } catch {
    return null;
  }
}

export default function PriorityTaskCard({ 
  task, 
  onSendToSchedule, 
  onMarkComplete, 
  onDelete,
  property 
}) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = React.useState(false);
  const [showAddToCart, setShowAddToCart] = React.useState(false);
  const [showEditForm, setShowEditForm] = React.useState(false);

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => base44.entities.MaintenanceTask.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allMaintenanceTasks'] });
    }
  });

  const cascadeRiskScore = task.cascade_risk_score || 0;
  const hasCascadeAlert = cascadeRiskScore >= 7;
  const currentCost = task.current_fix_cost || 0;
  const delayedCost = task.delayed_fix_cost || 0;
  const potentialSavings = delayedCost - currentCost;
  const isMultiUnit = property && property.door_count > 1; // Added isMultiUnit

  const handleExecutionTypeChange = (newType) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { execution_type: newType }
    });
  };

  const handlePriorityChange = (newPriority) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { priority: newPriority }
    });
  };

  return (
    <>
      <Card className={`border-2 transition-all hover:shadow-lg ${
        hasCascadeAlert 
          ? 'border-red-400 bg-gradient-to-br from-red-50 to-orange-50' 
          : 'border-red-200 bg-white'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <CardTitle className="text-lg break-words">
                  {PRIORITY_ICONS[task.priority]} {task.title}
                </CardTitle>
                {hasCascadeAlert && (
                  <Badge className="bg-red-600 text-white animate-pulse gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    High Cascade Risk
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={PRIORITY_COLORS[task.priority]}>
                  {task.priority}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {task.system_type}
                </Badge>
                {cascadeRiskScore > 0 && (
                  <Badge className={
                    cascadeRiskScore >= 7 ? 'bg-red-600' :
                    cascadeRiskScore >= 4 ? 'bg-orange-600' :
                    'bg-blue-600'
                  }>
                    Risk: {cascadeRiskScore}/10
                  </Badge>
                )}
                {isMultiUnit && task.unit_tag && ( // Added unit_tag badge
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
                <ChevronUp className="w-5 h-5 text-red-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-red-600" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Cost Summary - Always Visible */}
          {(currentCost > 0 || delayedCost > 0) && (
            <div className="grid grid-cols-2 gap-3">
              {currentCost > 0 && (
                <div className="bg-green-50 border border-green-300 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-900">Fix Now</span>
                  </div>
                  <p className="text-xl font-bold text-green-700">
                    ${currentCost.toLocaleString()}
                  </p>
                </div>
              )}
              {delayedCost > 0 && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-semibold text-red-900">If You Wait</span>
                  </div>
                  <p className="text-xl font-bold text-red-700">
                    ${delayedCost.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {potentialSavings > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-3 rounded">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-bold text-yellow-900">
                  Save ${potentialSavings.toLocaleString()} by acting now
                </span>
              </div>
            </div>
          )}

          {/* Expanded Details */}
          {expanded && (
            <div className="space-y-4 border-t border-red-200 pt-4">
              {/* Description */}
              {task.description && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Description:</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
                </div>
              )}

              {/* Cascade Risk Explanation */}
              {task.cascade_risk_reason ? (
                <div className={`rounded-lg p-3 border-2 ${
                  hasCascadeAlert 
                    ? 'bg-red-50 border-red-400' 
                    : cascadeRiskScore >= 4 
                    ? 'bg-orange-50 border-orange-300' 
                    : 'bg-blue-50 border-blue-300'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`w-4 h-4 ${
                      hasCascadeAlert ? 'text-red-600' : 
                      cascadeRiskScore >= 4 ? 'text-orange-600' : 
                      'text-blue-600'
                    }`} />
                    <span className="text-sm font-bold text-gray-900">Cascade Risk Analysis:</span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">{task.cascade_risk_reason}</p>
                </div>
              ) : cascadeRiskScore > 0 && (
                <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
                  <p className="text-xs text-blue-800 italic">
                    <strong>Example cascade scenarios:</strong> {GENERIC_CASCADE_EXAMPLES[Math.floor(Math.random() * GENERIC_CASCADE_EXAMPLES.length)]}
                  </p>
                </div>
              )}

              {/* Cost Impact */}
              {task.cost_impact_reason && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-bold text-gray-900">Why Waiting Costs More:</span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">{task.cost_impact_reason}</p>
                </div>
              )}

              {/* Urgency Timeline */}
              {task.urgency_timeline && (
                <div className="flex items-center gap-2 bg-purple-50 border border-purple-300 rounded-lg p-3">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-900">Timeline to Critical:</span>
                  <span className="text-sm font-bold text-purple-700">{task.urgency_timeline}</span>
                </div>
              )}

              {/* Photos */}
              {task.photo_urls && task.photo_urls.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Photos:</p>
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

              {/* Decision Controls */}
              <div className="grid md:grid-cols-2 gap-4 bg-red-50 rounded-lg p-4 border-2 border-red-300">
                <div>
                  <label className="text-sm font-semibold text-red-900 mb-2 block">
                    🔧 Execution Type
                  </label>
                  <Select 
                    value={task.execution_type || 'Not Decided'} 
                    onValueChange={handleExecutionTypeChange}
                  >
                    <SelectTrigger className="bg-white" style={{ minHeight: '44px' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DIY">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4" />
                          <span>DIY - I'll do it myself</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Professional">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Professional - Hire a pro</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Not Decided">
                        <span>Not Decided</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-red-900 mb-2 block">
                    🎯 Priority Level
                  </label>
                  <Select 
                    value={task.priority} 
                    onValueChange={handlePriorityChange}
                  >
                    <SelectTrigger className="bg-white" style={{ minHeight: '44px' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">🔥 High - Urgent</SelectItem>
                      <SelectItem value="Medium">⚡ Medium - Important</SelectItem>
                      <SelectItem value="Low">💡 Low - Can Wait</SelectItem>
                      <SelectItem value="Routine">🔄 Routine - Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-red-200">
            <Button
              onClick={() => setShowAddToCart(true)}
              variant="outline"
              size="sm"
              className="gap-2 border-red-600 text-red-600 hover:bg-red-50"
              style={{ minHeight: '44px' }}
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </Button>

            <Button
              onClick={() => onSendToSchedule(task)}
              className="gap-2 bg-yellow-600 hover:bg-yellow-700"
              size="sm"
              style={{ minHeight: '44px' }}
            >
              <Send className="w-4 h-4" />
              Send to Schedule
            </Button>

            <Button
              onClick={() => setShowEditForm(true)}
              variant="outline"
              size="sm"
              className="gap-2"
              style={{ minHeight: '44px' }}
            >
              <Edit className="w-4 h-4" />
              Edit Details
            </Button>

            <Button
              onClick={() => onMarkComplete(task)}
              variant="outline"
              size="sm"
              className="gap-2 border-green-600 text-green-600 hover:bg-green-50"
              style={{ minHeight: '44px' }}
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark Complete
            </Button>

            <Button
              onClick={() => onDelete(task)}
              variant="outline"
              size="sm"
              className="gap-2 border-gray-600 text-gray-600 hover:bg-gray-50"
              style={{ minHeight: '44px' }}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add to Cart Dialog */}
      {showAddToCart && (
        <AddToCartDialog
          open={showAddToCart}
          onClose={() => setShowAddToCart(false)}
          task={task}
          propertyId={task.property_id}
        />
      )}

      {/* Edit Task Form */}
      {showEditForm && (
        <ManualTaskForm
          propertyId={task.property_id}
          property={property} // Added property prop
          editingTask={task}
          onComplete={() => setShowEditForm(false)}
          onCancel={() => setShowEditForm(false)}
          open={showEditForm}
        />
      )}
    </>
  );
}
