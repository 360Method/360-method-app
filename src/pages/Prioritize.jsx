
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  AlertTriangle,
  TrendingDown,
  ListOrdered,
  Filter,
  Home,
  Calendar,
  DollarSign,
  Zap,
  TrendingUp,
  ArrowUpDown,
  Lightbulb,
  ChevronRight,
  ChevronDown
} from "lucide-react";

import PriorityTaskCard from "../components/prioritize/PriorityTaskCard";
import ManualTaskForm from "../components/tasks/ManualTaskForm";
import AIMaintenanceCalendar from "../components/prioritize/AIMaintenanceCalendar";

const Label = ({ children, className = "", ...props }) => (
  <label className={`text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
);

export default function PrioritizePage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const propertyIdFromUrl = searchParams.get('property');

  const [selectedProperty, setSelectedProperty] = React.useState(null);
  const [priorityFilter, setPriorityFilter] = React.useState("all");
  const [showTaskForm, setShowTaskForm] = React.useState(false);
  const [sortBy, setSortBy] = React.useState("smart"); // 'smart', 'cost', 'date'
  const [whyExpanded, setWhyExpanded] = React.useState(false); // New state for the educational card

  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const allProps = await base44.entities.Property.list();
      return allProps.filter(p => !p.is_draft);
    },
    initialData: [],
  });

  const { data: maintenanceTasks = [] } = useQuery({
    queryKey: ['maintenanceTasks', selectedProperty?.id],
    queryFn: () => selectedProperty?.id 
      ? base44.entities.MaintenanceTask.filter({ property_id: selectedProperty.id })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
    initialData: [],
  });

  const { data: systemBaselines = [] } = useQuery({
    queryKey: ['systemBaselines', selectedProperty?.id],
    queryFn: () => selectedProperty?.id
      ? base44.entities.SystemBaseline.filter({ property_id: selectedProperty.id })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
    initialData: [],
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ['inspections', selectedProperty?.id],
    queryFn: () => selectedProperty?.id
      ? base44.entities.Inspection.filter({ property_id: selectedProperty.id })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
    initialData: [],
  });

  // Initialize selected property from URL or first available property
  React.useEffect(() => {
    if (properties.length > 0 && !selectedProperty) {
      if (propertyIdFromUrl) {
        const propertyFromUrl = properties.find(p => p.id === propertyIdFromUrl);
        if (propertyFromUrl) {
          setSelectedProperty(propertyFromUrl);
        } else {
          setSelectedProperty(properties[0]);
        }
      } else {
        setSelectedProperty(properties[0]);
      }
    }
  }, [properties, selectedProperty, propertyIdFromUrl]);

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }) =>
      base44.entities.MaintenanceTask.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => base44.entities.MaintenanceTask.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
    },
  });

  // Filter out completed tasks
  const activeTasks = maintenanceTasks.filter(t => t.status !== 'Completed');

  // Apply priority filter
  let filteredTasks = activeTasks;
  if (priorityFilter !== "all") {
    filteredTasks = activeTasks.filter(t => t.priority === priorityFilter);
  }

  // Apply sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'smart') {
      // Smart prioritization: cascade risk + priority. Higher score is higher priority.
      // Cascade risk 1-10 (multiply by 10 for weight), priority: High=3, Medium=2, Low=1, Routine=0
      const priorityValueA = a.priority === 'High' ? 3 : a.priority === 'Medium' ? 2 : a.priority === 'Low' ? 1 : 0;
      const priorityValueB = b.priority === 'High' ? 3 : b.priority === 'Medium' ? 2 : b.priority === 'Low' ? 1 : 0;
      
      const scoreA = (a.cascade_risk_score || 0) * 10 + priorityValueA;
      const scoreB = (b.cascade_risk_score || 0) * 10 + priorityValueB;
      
      return scoreB - scoreA; // Descending score
    } else if (sortBy === 'cost') {
      // Sort by potential savings (delayed - current), descending
      const savingsA = (a.delayed_fix_cost || 0) - (a.current_fix_cost || 0);
      const savingsB = (b.delayed_fix_cost || 0) - (b.current_fix_cost || 0);
      return savingsB - savingsA;
    } else if (sortBy === 'date') {
      // Sort by scheduled date (null dates last)
      if (!a.scheduled_date && !b.scheduled_date) return 0;
      if (!a.scheduled_date) return 1;
      if (!b.scheduled_date) return -1;
      return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
    }
    return 0;
  });

  const handlePriorityChange = (taskId, newPriority) => {
    updateTaskMutation.mutate({ id: taskId, updates: { priority: newPriority } });
  };

  const handleStatusChange = (taskId, newStatus, scheduledDate = null) => {
    const updates = { status: newStatus };
    if (newStatus === 'Scheduled' && scheduledDate) {
      updates.scheduled_date = scheduledDate;
    }
    if (newStatus === 'Completed') {
      updates.completion_date = new Date().toISOString().split('T')[0];
    }
    updateTaskMutation.mutate({ id: taskId, updates });
  };

  const handleDeleteTask = (taskId) => {
    deleteTaskMutation.mutate(taskId);
  };

  // Calculate stats
  const stats = {
    highPriority: activeTasks.filter(t => t.priority === 'High').length,
    cascadeRisks: activeTasks.filter(t => t.has_cascade_alert).length,
    totalCurrentCost: activeTasks.reduce((sum, t) => sum + (t.current_fix_cost || 0), 0),
    totalPotentialSavings: activeTasks.reduce((sum, t) => {
      const savings = (t.delayed_fix_cost || 0) - (t.current_fix_cost || 0);
      return sum + savings;
    }, 0)
  };

  const workflowStats = {
    unscheduled: activeTasks.filter(t => t.status === 'Identified' || !t.scheduled_date).length,
    scheduled: activeTasks.filter(t => t.status === 'Scheduled' && t.scheduled_date).length,
    readyToExecute: activeTasks.filter(t => {
      if (t.status !== 'Scheduled') return false;
      if (!t.scheduled_date) return false;
      const taskDate = new Date(t.scheduled_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return taskDate <= today;
    }).length
  };

  if (showTaskForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <ManualTaskForm
            propertyId={selectedProperty?.id}
            onComplete={() => {
              setShowTaskForm(false);
              queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
            }}
            onCancel={() => setShowTaskForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 pb-20">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Phase & Step Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className="bg-orange-600 text-white text-sm px-3 py-1">
              Phase II - ACT
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Step 4 of 9
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
            Prioritize
          </h1>
          <p className="text-gray-600 text-lg">
            Smart task ranking based on cascade risk and cost impact
          </p>
        </div>

        {/* Why This Step Matters - Educational Card */}
        <Card className="mb-6 border-2 border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <button
              onClick={() => setWhyExpanded(!whyExpanded)}
              className="w-full flex items-start gap-3 text-left hover:opacity-80 transition-opacity"
            >
              <Lightbulb className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-1">Why Prioritize Matters</h3>
                <p className="text-sm text-orange-800">
                  Prioritize launches the ACT phase. It transforms your awareness into action by ranking tasks based on cascade risk, cost impact, and urgency - ensuring you tackle the right problems first.
                </p>
              </div>
              {whyExpanded ? (
                <ChevronDown className="w-5 h-5 text-orange-600 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-orange-600 flex-shrink-0" />
              )}
            </button>
          </CardHeader>
          {whyExpanded && (
            <CardContent className="pt-0">
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">🎯 In the 360° Method Framework:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Prioritize is Step 4 and begins the ACT phase. It takes everything you learned in AWARE (your baseline, inspection findings, and historical patterns) and uses AI to create an intelligent task queue. This prevents you from wasting time on low-impact work while critical issues grow.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">💡 The Smart Ranking Algorithm:</h4>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                    <li>• <strong>Cascade Risk Score (1-10):</strong> How likely is this to trigger chain failures?</li>
                    <li>• <strong>Cost Impact:</strong> Current fix cost vs. delayed fix cost</li>
                    <li>• <strong>Urgency Timeline:</strong> How much time before this becomes critical?</li>
                    <li>• <strong>System Dependencies:</strong> What else could this affect?</li>
                  </ul>
                </div>
                <div className="bg-orange-50 rounded p-3 border-l-4 border-orange-600">
                  <p className="text-xs text-orange-900">
                    <strong>Key Insight:</strong> Tasks with cascade risk scores of 7+ should be addressed immediately - they can trigger $10K-50K+ in additional damage if delayed.
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {properties.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Properties Yet</h2>
              <p className="text-gray-600">Add a property to start prioritizing maintenance tasks.</p>
              <Button
                onClick={() => setShowTaskForm(true)}
                className="mt-6 gap-2"
                style={{ backgroundColor: '#28A745', minHeight: '48px' }}
              >
                <Plus className="w-5 h-5" />
                Add Your First Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6"> {/* Added margin bottom for spacing */}
              <Label className="mb-2 block">Select Property:</Label>
              <Select
                value={selectedProperty?.id || ""}
                onValueChange={(id) => setSelectedProperty(properties.find(p => p.id === id))}
              >
                <SelectTrigger className="w-full md:w-96" style={{ minHeight: '48px' }}>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(prop => (
                    <SelectItem key={prop.id} value={prop.id}>
                      {prop.address || prop.street_address || 'Unnamed Property'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProperty && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6"> {/* Added margin bottom */}
                  <Card className="border-2 border-red-200 bg-red-50">
                    <CardContent className="p-3 md:p-4 text-center">
                      <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-red-600 mx-auto mb-2" />
                      <p className="text-xs md:text-sm text-gray-600 mb-1">High Priority</p>
                      <p className="text-xl md:text-3xl font-bold text-red-700">{stats.highPriority}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-orange-200 bg-orange-50">
                    <CardContent className="p-3 md:p-4 text-center">
                      <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-xs md:text-sm text-gray-600 mb-1">Cascade Risks</p>
                      <p className="text-xl md:text-3xl font-bold text-orange-700">{stats.cascadeRisks}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardContent className="p-3 md:p-4 text-center">
                      <Zap className="w-6 h-6 md:w-8 md:h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-xs md:text-sm text-gray-600 mb-1">Current Cost</p>
                      <p className="text-xl md:text-3xl font-bold text-green-700">
                        ${(stats.totalCurrentCost / 1000).toFixed(1)}K
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardContent className="p-3 md:p-4 text-center">
                      <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-xs md:text-sm text-gray-600 mb-1">Potential Savings</p>
                      <p className="text-xl md:text-3xl font-bold text-blue-700">
                        ${(stats.totalPotentialSavings / 1000).toFixed(1)}K
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-2 border-blue-300 bg-blue-50 mb-6"> {/* Added margin bottom */}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                      Workflow Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                      <div className="text-center p-3 md:p-4 bg-white rounded-lg border-2 border-yellow-200">
                        <p className="text-xs md:text-sm text-gray-600 mb-1">📋 Unscheduled</p>
                        <p className="text-2xl md:text-3xl font-bold text-yellow-700">{workflowStats.unscheduled}</p>
                      </div>
                      <div className="text-center p-3 md:p-4 bg-white rounded-lg border-2 border-blue-200">
                        <p className="text-xs md:text-sm text-gray-600 mb-1">📅 Scheduled</p>
                        <p className="text-2xl md:text-3xl font-bold text-blue-700">{workflowStats.scheduled}</p>
                      </div>
                      <div className="text-center p-3 md:p-4 bg-white rounded-lg border-2 border-green-200">
                        <p className="text-xs md:text-sm text-gray-600 mb-1">✅ Ready</p>
                        <p className="text-2xl md:text-3xl font-bold text-green-700">{workflowStats.readyToExecute}</p>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 text-center italic mt-4">
                      Move tasks from Unscheduled → Scheduled → Ready to Execute
                    </p>
                  </CardContent>
                </Card>

                <AIMaintenanceCalendar
                  propertyId={selectedProperty.id}
                  systems={systemBaselines}
                  inspections={inspections}
                />

                <Card className="border-2 border-purple-300">
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <CardTitle className="text-lg md:text-xl" style={{ color: '#1B365D' }}>
                        Priority Queue ({sortedTasks.length} tasks)
                      </CardTitle>
                      <Button
                        onClick={() => setShowTaskForm(true)}
                        className="gap-2"
                        style={{ backgroundColor: '#8B5CF6', minHeight: '44px' }}
                      >
                        <Plus className="w-4 h-4" />
                        Add Task
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                      <div className="flex-1">
                        <Label className="mb-2 block text-xs md:text-sm">Filter by Priority:</Label>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                          <SelectTrigger className="w-full md:w-64" style={{ minHeight: '48px' }}>
                            <div className="flex items-center gap-2">
                              <Filter className="w-4 h-4" />
                              <SelectValue placeholder="All Priorities" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="High">🔴 High Priority</SelectItem>
                            <SelectItem value="Medium">🟡 Medium Priority</SelectItem>
                            <SelectItem value="Low">🔵 Low Priority</SelectItem>
                            <SelectItem value="Routine">⚪ Routine</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1">
                        <Label className="mb-2 block text-xs md:text-sm">Sort by:</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-full md:w-64" style={{ minHeight: '48px' }}>
                            <div className="flex items-center gap-2">
                              <ArrowUpDown className="w-4 h-4" />
                              <SelectValue placeholder="Smart Priority (AI)" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="smart">🎯 Smart Priority (AI)</SelectItem>
                            <SelectItem value="cost">💰 Cost Savings</SelectItem>
                            <SelectItem value="date">📅 Scheduled Date</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {sortedTasks.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-600 mb-4">No tasks in your priority queue yet.</p>
                        <Button
                          onClick={() => setShowTaskForm(true)}
                          className="gap-2"
                          style={{ backgroundColor: '#8B5CF6', minHeight: '48px' }}
                        >
                          <Plus className="w-4 h-4" />
                          Add Your First Task
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sortedTasks.map((task, index) => (
                          <PriorityTaskCard
                            key={task.id}
                            task={task}
                            rank={index + 1}
                            onPriorityChange={handlePriorityChange}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDeleteTask}
                            propertyId={selectedProperty.id}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
