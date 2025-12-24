import React from "react";
import { MaintenanceTask, supabase } from "@/api/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  Building2,
  HardHat,
  Star,
  BookOpen,
  X,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import AddToCartDialog from "../cart/AddToCartDialog";
import ManualTaskForm from "../tasks/ManualTaskForm";
import { useDemo } from "../shared/DemoContext";

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

function getPropertyFlowType(property) {
  if (!property) return null;
  const doorCount = property.door_count || 1;
  if (doorCount === 1) return 'single_family';
  if (doorCount === 2) return 'dual_unit';
  return 'multi_unit';
}

function checkOperatorAvailability(property) {
  if (!property?.zip_code) return false;
  
  const CLARK_COUNTY_ZIPS = [
    '98604', '98606', '98607', '98629', '98642',
    '98660', '98661', '98662', '98663', '98664',
    '98665', '98666', '98671', '98674', '98675',
    '98682', '98683', '98684', '98685', '98686'
  ];
  
  return CLARK_COUNTY_ZIPS.includes(property.zip_code);
}

export default function PriorityTaskCard({
  task,
  onSendToSchedule,
  onMarkComplete,
  onDelete,
  property,
  compact = false,
  canEdit = true,
  regionalCostMultipliers = null
}) {
  const queryClient = useQueryClient();
  const { demoMode } = useDemo();
  const { user } = useAuth();
  const [expanded, setExpanded] = React.useState(false);
  const [showAddToCart, setShowAddToCart] = React.useState(false);
  const [showEditForm, setShowEditForm] = React.useState(false);
  const [showDIYModal, setShowDIYModal] = React.useState(false);
  const [showScheduleDateModal, setShowScheduleDateModal] = React.useState(false);
  const [scheduleDate, setScheduleDate] = React.useState('');
  const [showContractorModal, setShowContractorModal] = React.useState(false);
  const [showOperatorModal, setShowOperatorModal] = React.useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = React.useState(false);
  const [contractorForm, setContractorForm] = React.useState({
    name: '',
    phone: '',
    email: '',
    cost: '',
    date: ''
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => MaintenanceTask.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allMaintenanceTasks'] });
    },
    onError: (error) => {
      console.error('Task update failed:', error);
      alert(`Failed to update task: ${error.message}`);
    }
  });

  const cascadeRiskScore = task.cascade_risk_score || 0;
  const hasCascadeAlert = cascadeRiskScore >= 7;

  // Apply regional cost multipliers if available
  const hasRegionalData = regionalCostMultipliers?.hasData;
  const multiplier = hasRegionalData ? (regionalCostMultipliers.overall || 1.0) : 1.0;

  const baseCost = task.current_fix_cost || 0;
  const baseDelayedCost = task.delayed_fix_cost || 0;

  // Adjust costs based on region
  const currentCost = hasRegionalData ? Math.round(baseCost * multiplier) : baseCost;
  const delayedCost = hasRegionalData ? Math.round(baseDelayedCost * multiplier) : baseDelayedCost;
  const potentialSavings = delayedCost - currentCost;
  
  const flowType = getPropertyFlowType(property);
  const isSingleFamily = flowType === 'single_family';

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

  const handleExecutionMethod = (method) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { execution_method: method }
    });

    if (method === 'DIY') {
      setShowDIYModal(true);
    } else if (method === 'Contractor') {
      setShowContractorModal(true);
    } else if (method === '360_Operator') {
      const operatorAvailable = checkOperatorAvailability(property);
      if (operatorAvailable) {
        setShowOperatorModal(true);
      } else {
        setShowWaitlistModal(true);
      }
    }
  };

  const handleDIYScheduleNow = () => {
    setShowDIYModal(false);
    setScheduleDate('');
    setShowScheduleDateModal(true);
  };

  const handleScheduleDateSubmit = () => {
    if (scheduleDate) {
      updateTaskMutation.mutate(
        {
          taskId: task.id,
          data: {
            status: 'Scheduled',
            scheduled_date: scheduleDate,
            execution_method: 'DIY'
          }
        },
        {
          onSuccess: () => {
            setShowScheduleDateModal(false);
            setScheduleDate('');
          }
        }
      );
    }
  };

  const handleDIYSendToSchedule = () => {
    updateTaskMutation.mutate(
      {
        taskId: task.id,
        data: {
          status: 'Scheduled',
          execution_method: 'DIY'
        }
      },
      {
        onSuccess: () => setShowDIYModal(false),
        onError: (error) => {
          console.error('Failed to send to schedule:', error);
          // Error already shown by mutation's onError handler
        }
      }
    );
  };

  const handleContractorSubmit = (e) => {
    e.preventDefault();
    updateTaskMutation.mutate(
      {
        taskId: task.id,
        data: {
          contractor_name: contractorForm.name,
          contractor_phone: contractorForm.phone,
          contractor_email: contractorForm.email,
          current_fix_cost: contractorForm.cost ? parseFloat(contractorForm.cost) : task.contractor_cost,
          scheduled_date: contractorForm.date,
          status: 'Scheduled',
          execution_method: 'Contractor'
        }
      },
      {
        onSuccess: () => {
          setShowContractorModal(false);
          setContractorForm({ name: '', phone: '', email: '', cost: '', date: '' });
        }
      }
    );
  };

  const handleOperatorRequest = async () => {
    try {
      // Create service request for 360 Operator
      if (!demoMode && user?.id) {
        const { error: serviceRequestError } = await supabase
          .from('service_requests')
          .insert({
            user_id: user.id,
            property_id: task.property_id,
            task_id: task.id,
            service_type: task.system_type || 'General',
            description: `${task.title}: ${task.description || 'No additional details'}`,
            urgency: task.priority === 'High' ? 'High' : task.priority === 'Emergency' ? 'Emergency' : 'Medium',
            status: 'Submitted'
          });

        if (serviceRequestError) {
          console.error('Error creating service request:', serviceRequestError);
          alert(`Failed to create service request: ${serviceRequestError.message}`);
          return;
        }
      }

      // Update task status
      updateTaskMutation.mutate(
        {
          taskId: task.id,
          data: {
            status: 'Scheduled',
            execution_method: '360_Operator'
          }
        },
        {
          onSuccess: () => setShowOperatorModal(false)
        }
      );
    } catch (error) {
      console.error('Error in handleOperatorRequest:', error);
      alert(`Failed to request operator: ${error.message}`);
    }
  };

  if (compact) {
    return (
      <Card className="border border-gray-300 bg-white">
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              {!isSingleFamily && task.unit_tag && (
                <Badge className="bg-purple-600 text-white shrink-0">
                  🚪 {task.unit_tag}
                </Badge>
              )}
              <div className="flex items-center gap-2">
                {task.status === 'Completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : task.status === 'Scheduled' ? (
                  <Calendar className="w-5 h-5 text-yellow-600" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm font-semibold text-gray-900">
                  {task.title} - {task.status}
                </span>
              </div>
            </div>
            
            {task.status !== 'Completed' && (
              <div className="flex gap-2">
                <Button
                  onClick={() => onSendToSchedule(task)}
                  size="sm"
                  variant="outline"
                  className="text-xs h-8"
                >
                  Schedule
                </Button>
                <Button
                  onClick={() => onMarkComplete(task)}
                  size="sm"
                  variant="outline"
                  className="text-xs text-green-600 h-8"
                >
                  Complete
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

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
                {!isSingleFamily && task.scope === 'building_wide' && (
                  <Badge className="bg-blue-600 text-white gap-1">
                    <Building2 className="w-3 h-3" />
                    Building Wide
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
                {!isSingleFamily && task.unit_tag && (
                  <Badge className="bg-purple-600 text-white gap-1">
                    <Building2 className="w-3 h-3" />
                    {task.unit_tag}
                  </Badge>
                )}
                {!isSingleFamily && task.applies_to_unit_count && (
                  <Badge variant="outline" className="text-xs">
                    Covers {task.applies_to_unit_count} units
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
                  {!isSingleFamily && task.applies_to_unit_count && task.applies_to_unit_count > 1 && (
                    <p className="text-xs text-gray-600 mt-1">
                      (${Math.round(currentCost / task.applies_to_unit_count).toLocaleString()}/unit)
                    </p>
                  )}
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
                  {!isSingleFamily && task.applies_to_unit_count && task.applies_to_unit_count > 1 && (
                    <p className="text-xs text-gray-600 mt-1">
                      (${Math.round(delayedCost / task.applies_to_unit_count).toLocaleString()}/unit)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Regional Cost Adjustment Indicator */}
          {hasRegionalData && (currentCost > 0 || delayedCost > 0) && multiplier !== 1.0 && (
            <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>
                Costs adjusted for <strong>{regionalCostMultipliers.region || regionalCostMultipliers.state || 'your region'}</strong>
                {multiplier > 1 ? ` (+${Math.round((multiplier - 1) * 100)}% vs national avg)` :
                 multiplier < 1 ? ` (${Math.round((multiplier - 1) * 100)}% vs national avg)` : ''}
              </span>
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

          {expanded && (
            <div className="space-y-4 border-t border-red-200 pt-4">
              {task.description && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Description:</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
                </div>
              )}

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

              {task.cost_impact_reason && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-bold text-gray-900">Why Waiting Costs More:</span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">{task.cost_impact_reason}</p>
                </div>
              )}

              {task.urgency_timeline && (
                <div className="flex items-center gap-2 bg-purple-50 border border-purple-300 rounded-lg p-3">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-900">Timeline to Critical:</span>
                  <span className="text-sm font-bold text-purple-700">{task.urgency_timeline}</span>
                </div>
              )}

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

              <div className="grid md:grid-cols-2 gap-4 bg-red-50 rounded-lg p-4 border-2 border-red-300">
                <div>
                  <label className="text-sm font-semibold text-red-900 mb-2 block">
                    🔧 Execution Type
                  </label>
                  <Select 
                    value={task.execution_type || 'Not Decided'} 
                    onValueChange={handleExecutionTypeChange}
                    disabled={!canEdit}
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
                    disabled={!canEdit}
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

          {/* Intent-Based Action Buttons */}
          <div className="pt-4 border-t border-red-200">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              How will you handle this?
            </div>
            {demoMode && (
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                Choose your execution path. Each option routes differently through the workflow.
              </p>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <button
                onClick={() => canEdit && handleExecutionMethod('DIY')}
                disabled={!canEdit}
                className="flex flex-col items-center justify-center gap-1 px-3 py-3 border-2 border-green-300 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 hover:border-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '80px' }}
              >
                <Wrench className="w-5 h-5" />
                <span className="text-sm font-semibold">I'll DIY</span>
                {task.diy_cost ? (
                  <span className="text-xs text-green-600 font-semibold">~${task.diy_cost}</span>
                ) : demoMode && (
                  <span className="text-xs text-green-600">Do it yourself</span>
                )}
              </button>
              
              <button
                onClick={() => canEdit && handleExecutionMethod('Contractor')}
                disabled={!canEdit}
                className="flex flex-col items-center justify-center gap-1 px-3 py-3 border-2 border-gray-300 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '80px' }}
              >
                <HardHat className="w-5 h-5" />
                <span className="text-sm font-semibold">{demoMode ? 'Find Your Own Pro' : 'Hire Pro'}</span>
                {task.contractor_cost ? (
                  <span className="text-xs text-gray-600 font-semibold">~${task.contractor_cost}</span>
                ) : demoMode && (
                  <span className="text-xs text-gray-600">Track contractor</span>
                )}
              </button>
              
              <button
                onClick={() => canEdit && handleExecutionMethod('360_Operator')}
                disabled={!canEdit}
                className="flex flex-col items-center justify-center gap-1 px-3 py-3 border-2 border-blue-300 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 hover:border-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '80px' }}
              >
                <Star className="w-5 h-5" />
                <span className="text-sm font-semibold">{demoMode ? '360° Service' : 'Get Quote'}</span>
                {task.operator_cost ? (
                  <span className="text-xs text-blue-600 font-semibold">~${task.operator_cost}</span>
                ) : demoMode && (
                  <span className="text-xs text-blue-600">Full service</span>
                )}
              </button>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-600 mb-2">
                Or bundle with other tasks:
              </div>
              
              <button
                onClick={() => canEdit && setShowAddToCart(true)}
                disabled={!canEdit}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-orange-300 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 hover:border-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '48px' }}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm font-semibold">Add to Cart</span>
                <span className="text-xs text-orange-600">(Get bundled quote)</span>
              </button>
            </div>

            {canEdit && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => updateTaskMutation.mutate({ taskId: task.id, data: { status: 'Deferred' }})}
                  className="text-sm text-gray-500 hover:text-gray-700 transition"
                >
                  Skip for now
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditForm(true)}
                    className="text-sm text-gray-500 hover:text-gray-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(task)}
                    className="text-sm text-red-500 hover:text-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* DIY Modal */}
      {showDIYModal && (
        <Dialog open={showDIYModal} onOpenChange={setShowDIYModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wrench className="w-6 h-6 text-green-600" />
                DIY Guide: {task.title}
              </DialogTitle>
              <DialogDescription>
                High-level AI estimated materials cost, time, and skill level
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-green-900">AI Estimated Overview</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center border border-green-200">
                    <div className="text-xs text-gray-600 mb-1">💰 Materials Cost</div>
                    <div className="text-2xl font-bold text-green-700">
                      ${task.diy_cost || task.current_fix_cost || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-green-200">
                    <div className="text-xs text-gray-600 mb-1">⏱️ Time Required</div>
                    <div className="text-2xl font-bold text-green-700">
                      {task.diy_time_hours || task.estimated_hours || '?'}h
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-green-200">
                    <div className="text-xs text-gray-600 mb-1">🎯 Skill Level</div>
                    <div className="text-lg font-bold text-green-700">
                      {task.diy_difficulty || 'Medium'}
                    </div>
                  </div>
                </div>
              </div>

              {task.ai_sow && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Steps:
                  </h4>
                  <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {task.ai_sow}
                  </div>
                </div>
              )}

              {task.ai_tools_needed && task.ai_tools_needed.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Tools Needed:</h4>
                  <div className="flex flex-wrap gap-2">
                    {task.ai_tools_needed.map((tool, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 border border-gray-200 px-2 py-1 rounded">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {task.ai_materials_needed && task.ai_materials_needed.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Materials Needed:</h4>
                  <div className="flex flex-wrap gap-2">
                    {task.ai_materials_needed.map((mat, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 border border-gray-200 px-2 py-1 rounded">
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {task.ai_video_tutorials && task.ai_video_tutorials.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">📺 Video Tutorials:</h4>
                  <div className="space-y-2">
                    {task.ai_video_tutorials.map((video, idx) => (
                      <a 
                        key={idx}
                        href={video.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        → {video.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDIYModal(false)}
                className="flex-1"
                style={{ minHeight: '48px' }}
              >
                Close
              </Button>
              <Button
                onClick={handleDIYSendToSchedule}
                variant="outline"
                className="flex-1 border-yellow-600 text-yellow-700 hover:bg-yellow-50"
                style={{ minHeight: '48px' }}
              >
                <Send className="w-4 h-4 mr-2" />
                Send to Schedule Tab
              </Button>
              <Button
                onClick={handleDIYScheduleNow}
                className="flex-1 bg-green-600 hover:bg-green-700"
                style={{ minHeight: '48px' }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Now
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* NEW: Schedule Date Modal */}
      {showScheduleDateModal && (
        <Dialog open={showScheduleDateModal} onOpenChange={setShowScheduleDateModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-green-600" />
                Schedule DIY Task
              </DialogTitle>
              <DialogDescription>
                When will you complete this task?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-900 mb-1">
                  {task.title}
                </p>
                <div className="flex items-center gap-3 text-xs text-green-800">
                  <span>💰 ${task.diy_cost || task.current_fix_cost || 'TBD'}</span>
                  <span>⏱️ {task.diy_time_hours || task.estimated_hours || '?'}h</span>
                  <span>🎯 {task.diy_difficulty || 'Medium'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Target Date *
                </label>
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="text-base"
                  style={{ minHeight: '48px' }}
                  autoFocus
                />
                <p className="text-xs text-gray-600 mt-2">
                  Pick a realistic date when you'll have time to complete this DIY project
                </p>
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowScheduleDateModal(false)}
                  className="flex-1"
                  style={{ minHeight: '48px' }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleScheduleDateSubmit}
                  disabled={!scheduleDate}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  style={{ minHeight: '48px' }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Schedule Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Contractor Modal */}
      {showContractorModal && (
        <Dialog open={showContractorModal} onOpenChange={setShowContractorModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HardHat className="w-6 h-6 text-gray-600" />
                Track Contractor: {task.title}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleContractorSubmit} className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Contractor Name *
                </label>
                <Input
                  value={contractorForm.name}
                  onChange={(e) => setContractorForm({...contractorForm, name: e.target.value})}
                  required
                  placeholder="John's Handyman Service"
                  style={{ minHeight: '48px' }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={contractorForm.phone}
                    onChange={(e) => setContractorForm({...contractorForm, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                    style={{ minHeight: '48px' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Estimated Cost
                  </label>
                  <Input
                    type="number"
                    value={contractorForm.cost}
                    onChange={(e) => setContractorForm({...contractorForm, cost: e.target.value})}
                    placeholder={task.contractor_cost || "150"}
                    style={{ minHeight: '48px' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  value={contractorForm.email}
                  onChange={(e) => setContractorForm({...contractorForm, email: e.target.value})}
                  placeholder="contractor@example.com"
                  style={{ minHeight: '48px' }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Scheduled Date *
                </label>
                <Input
                  type="date"
                  value={contractorForm.date}
                  onChange={(e) => setContractorForm({...contractorForm, date: e.target.value})}
                  required
                  style={{ minHeight: '48px' }}
                />
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowContractorModal(false)}
                  className="flex-1"
                  style={{ minHeight: '48px' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gray-700 hover:bg-gray-800"
                  style={{ minHeight: '48px' }}
                >
                  Save & Schedule
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* 360° Operator Modal */}
      {showOperatorModal && (
        <Dialog open={showOperatorModal} onOpenChange={setShowOperatorModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star className="w-6 h-6 text-blue-600" />
                Request 360° Operator
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-1">
                  <strong>Task:</strong> {task.title}
                </p>
                <p className="text-sm text-blue-900 mb-2">
                  <strong>Est. Cost:</strong> ${task.operator_cost || task.contractor_cost || 'TBD'}
                </p>
                <div className="text-xs text-blue-800">
                  ✓ No service call fee<br/>
                  ✓ Included in HomeCare membership
                </div>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                <p className="text-sm text-yellow-900">
                  A 360° Method operator will contact you within 24 hours to schedule this service.
                </p>
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowOperatorModal(false)}
                  className="flex-1"
                  style={{ minHeight: '48px' }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleOperatorRequest}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  style={{ minHeight: '48px' }}
                >
                  Submit Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Waitlist Modal */}
      {showWaitlistModal && (
        <Dialog open={showWaitlistModal} onOpenChange={setShowWaitlistModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Not Available Yet</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <p className="text-gray-700">
                360° Operators aren't serving your area yet, but we're expanding soon!
              </p>
              
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Current Service:</strong> Clark County, WA<br/>
                  <strong>Coming 2026:</strong> Portland, Seattle/Tacoma
                </p>
              </div>
              
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>In the meantime:</strong>
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use "Hire Pro" to track your own contractor</li>
                  <li>• Or "Add to Cart" for bundled service quotes</li>
                </ul>
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowWaitlistModal(false)}
                  className="flex-1"
                  style={{ minHeight: '48px' }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowWaitlistModal(false);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  style={{ minHeight: '48px' }}
                >
                  Notify Me When Available
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showAddToCart && (
        <AddToCartDialog
          open={showAddToCart}
          onClose={() => setShowAddToCart(false)}
          task={task}
          propertyId={task.property_id}
        />
      )}

      {showEditForm && (
        <ManualTaskForm
          propertyId={task.property_id}
          property={property}
          editingTask={task}
          onComplete={() => setShowEditForm(false)}
          onCancel={() => setShowEditForm(false)}
          open={showEditForm}
        />
      )}
    </>
  );
}