import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListOrdered, DollarSign, AlertTriangle, TrendingUp, Plus, Lightbulb, ArrowUpDown, Filter, Shield, Target, TrendingDown } from "lucide-react";
import PriorityTaskCard from "../components/prioritize/PriorityTaskCard";
import ManualTaskForm from "../components/tasks/ManualTaskForm";
import AIMaintenanceCalendar from "../components/prioritize/AIMaintenanceCalendar";

export default function Prioritize() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdFromUrl = urlParams.get('property');
  
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || '');
  const [priorityFilter, setPriorityFilter] = React.useState('all');
  const [showTaskForm, setShowTaskForm] = React.useState(false);
  const [sortBy, setSortBy] = React.useState('smart'); // 'smart', 'cost', 'date'

  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['maintenanceTasks', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.MaintenanceTask.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  const { data: baselineSystems = [] } = useQuery({
    queryKey: ['systemBaselines', selectedProperty],
    queryFn: () => selectedProperty
      ? base44.entities.SystemBaseline.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ['inspections', selectedProperty],
    queryFn: () => selectedProperty
      ? base44.entities.Inspection.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  // Filter out completed tasks
  const activeTasks = tasks.filter(t => t.status !== 'Completed');

  // Apply priority filter
  const filteredByPriority = priorityFilter === 'all' 
    ? activeTasks 
    : activeTasks.filter(t => t.priority === priorityFilter);

  // Apply sorting
  const filteredTasks = [...filteredByPriority].sort((a, b) => {
    if (sortBy === 'smart') {
      // Smart prioritization: cascade risk + priority
      if (b.cascade_risk_score !== a.cascade_risk_score) {
        return (b.cascade_risk_score || 0) - (a.cascade_risk_score || 0);
      }
      const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2, 'Routine': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortBy === 'cost') {
      // Sort by potential savings (delayed - current)
      const savingsA = (a.delayed_fix_cost || 0) - (a.current_fix_cost || 0);
      const savingsB = (b.delayed_fix_cost || 0) - (b.current_fix_cost || 0);
      return savingsB - savingsA;
    } else if (sortBy === 'date') {
      // Sort by scheduled date (null dates last)
      if (!a.scheduled_date && !b.scheduled_date) return 0;
      if (!a.scheduled_date) return 1;
      if (!b.scheduled_date) return -1;
      return new Date(a.scheduled_date) - new Date(b.scheduled_date);
    }
    return 0;
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }) => 
      base44.entities.MaintenanceTask.update(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
    },
  });

  const handlePriorityChange = (taskId, newPriority) => {
    updateTaskMutation.mutate({ taskId, updates: { priority: newPriority } });
  };

  const handleStatusChange = (taskId, newStatus, scheduledDate = null) => {
    const updates = { status: newStatus };
    if (newStatus === 'Scheduled' && scheduledDate) {
      updates.scheduled_date = scheduledDate;
    }
    updateTaskMutation.mutate({ taskId, updates });
  };

  // Calculate stats
  const highPriorityCount = activeTasks.filter(t => t.priority === 'High').length;
  const cascadeRiskCount = activeTasks.filter(t => t.has_cascade_alert).length;
  const currentCost = activeTasks.reduce((sum, t) => sum + (t.current_fix_cost || 0), 0);
  const potentialCost = activeTasks.reduce((sum, t) => sum + (t.delayed_fix_cost || t.current_fix_cost || 0), 0);
  const potentialSavings = potentialCost - currentCost;

  const currentProperty = properties.find(p => p.id === selectedProperty);

  if (showTaskForm) {
    return (
      <ManualTaskForm
        propertyId={selectedProperty}
        onComplete={() => setShowTaskForm(false)}
        onCancel={() => setShowTaskForm(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Mobile-Optimized Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#1B365D' }}>
                ACT → Prioritize
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Strategic task ranking
              </p>
            </div>
            <Button
              onClick={() => setShowTaskForm(true)}
              className="gap-2 shadow-lg"
              style={{ backgroundColor: '#28A745', minHeight: '48px' }}
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          </div>
        </div>

        {/* Why Prioritization Matters - PROMINENT */}
        <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl" style={{ color: '#1B365D' }}>
              <Lightbulb className="w-6 h-6 text-orange-600" />
              Why Strategic Prioritization Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm md:text-base text-gray-800 leading-relaxed">
              <strong>Not all maintenance is equal.</strong> Some tasks, if ignored, trigger chain reactions costing 5-10X more. 
              Your priority queue is automatically ranked by <strong>cascade risk + cost impact.</strong>
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border-2 border-red-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-red-900">Cascade Risk</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  One problem triggers multiple failures. Small leak → $30K+ disaster in months.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-green-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-green-900">Cost Impact</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  Delaying makes it exponentially more expensive. Emergency pricing = 3X normal cost.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-blue-900">Timeline</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  Act before critical failure point. Budget and plan replacements strategically.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
              <p className="text-sm font-semibold text-orange-900 mb-2">
                💡 How Your Queue Works:
              </p>
              <ul className="text-xs md:text-sm text-gray-800 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold mt-0.5">1.</span>
                  <span><strong>Tasks auto-rank</strong> by cascade risk score (1-10) + priority level</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold mt-0.5">2.</span>
                  <span><strong>High cascade risk = top</strong> - these prevent $20K-50K disasters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold mt-0.5">3.</span>
                  <span><strong>Adjust priority</strong> to move tasks up/down the queue manually</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Property Selector - Mobile First */}
        {properties.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Property</Label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-full" style={{ minHeight: '48px' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="border-2 border-red-300 bg-red-50 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-red-600 mb-2" />
                <p className="text-2xl md:text-3xl font-bold text-red-700">{highPriorityCount}</p>
                <p className="text-xs md:text-sm font-semibold text-gray-700 mt-1">High Priority</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-300 bg-orange-50 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <TrendingDown className="w-8 h-8 md:w-10 md:h-10 text-orange-600 mb-2" />
                <p className="text-2xl md:text-3xl font-bold text-orange-700">{cascadeRiskCount}</p>
                <p className="text-xs md:text-sm font-semibold text-gray-700 mt-1">Cascade Risks</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-300 bg-blue-50 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-blue-600 mb-2" />
                <p className="text-lg md:text-2xl font-bold text-blue-700">${(currentCost/1000).toFixed(1)}K</p>
                <p className="text-xs md:text-sm font-semibold text-gray-700 mt-1">Fix Now Cost</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-300 bg-purple-50 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <Shield className="w-8 h-8 md:w-10 md:h-10 text-purple-600 mb-2" />
                <p className="text-lg md:text-2xl font-bold text-purple-700">${(potentialSavings/1000).toFixed(1)}K</p>
                <p className="text-xs md:text-sm font-semibold text-gray-700 mt-1">Potential Savings</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Maintenance Calendar */}
        {selectedProperty && (
          <AIMaintenanceCalendar
            propertyId={selectedProperty}
            property={currentProperty}
            systems={baselineSystems}
            inspections={inspections}
            existingTasks={activeTasks}
          />
        )}

        {/* Priority Queue */}
        <Card className="border-2 border-gray-300 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b-2 border-orange-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-orange-600" />
                <span style={{ color: '#1B365D' }}>
                  Priority Queue ({filteredTasks.length})
                </span>
              </CardTitle>

              {/* Mobile-First Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 sm:w-auto">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-40 bg-white" style={{ minHeight: '44px' }}>
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smart">🎯 Smart Rank</SelectItem>
                      <SelectItem value="cost">💰 By Savings</SelectItem>
                      <SelectItem value="date">📅 By Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 sm:w-auto">
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full sm:w-40 bg-white" style={{ minHeight: '44px' }}>
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="High">🔴 High Only</SelectItem>
                      <SelectItem value="Medium">🟡 Medium Only</SelectItem>
                      <SelectItem value="Low">🔵 Low Only</SelectItem>
                      <SelectItem value="Routine">⚪ Routine Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-3 md:p-6">
            {filteredTasks.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {filteredTasks.map((task, index) => (
                  <PriorityTaskCard
                    key={task.id}
                    task={task}
                    rank={index + 1}
                    onPriorityChange={handlePriorityChange}
                    onStatusChange={handleStatusChange}
                    propertyId={selectedProperty}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ListOrdered className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  {priorityFilter !== 'all' ? 'No Tasks Match Filter' : 'No Tasks in Queue'}
                </h3>
                <p className="text-sm md:text-base mb-4 px-4">
                  {priorityFilter !== 'all' 
                    ? 'Try changing the filter or add a new task'
                    : 'Check the AI Maintenance Calendar above for proactive suggestions'
                  }
                </p>
                <Button
                  onClick={() => setShowTaskForm(true)}
                  className="gap-2"
                  style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                >
                  <Plus className="w-5 h-5" />
                  Add First Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Label({ children, className = "", ...props }) {
  return (
    <label className={`text-sm font-medium text-gray-700 ${className}`} {...props}>
      {children}
    </label>
  );
}