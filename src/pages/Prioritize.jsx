
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListOrdered, DollarSign, AlertTriangle, TrendingUp, Plus, BookOpen, Video, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PriorityTaskCard from "../components/prioritize/PriorityTaskCard";
import ManualTaskForm from "../components/tasks/ManualTaskForm";
import AIMaintenanceCalendar from "../components/prioritize/AIMaintenanceCalendar";

export default function Prioritize() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdFromUrl = urlParams.get('property');
  
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || '');
  const [priorityFilter, setPriorityFilter] = React.useState('all');
  const [showTaskForm, setShowTaskForm] = React.useState(false);
  const [showAICalendar, setShowAICalendar] = React.useState(true);

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

  // Filter out completed tasks, sort by cascade risk then priority
  const activeTasks = tasks
    .filter(t => t.status !== 'Completed')
    .sort((a, b) => {
      // Sort by cascade risk score first (higher is more urgent)
      if (b.cascade_risk_score !== a.cascade_risk_score) {
        return (b.cascade_risk_score || 0) - (a.cascade_risk_score || 0);
      }
      // Then by priority
      const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2, 'Routine': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  // Apply priority filter
  const filteredTasks = priorityFilter === 'all' 
    ? activeTasks 
    : activeTasks.filter(t => t.priority === priorityFilter);

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
    
    // If scheduling, include the scheduled_date
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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ACT → Prioritize</h1>
            <p className="text-gray-600 mt-1">Strategic task ranking + AI maintenance planning</p>
          </div>
          <Button
            onClick={() => setShowTaskForm(true)}
            className="gap-2"
            style={{ backgroundColor: '#28A745', minHeight: '48px' }}
          >
            <Plus className="w-5 h-5" />
            Add Task
          </Button>
        </div>

        {/* Educational section for first-time users */}
        {activeTasks.length === 0 && baselineSystems.length === 0 && (
          <Card className="border-2 border-blue-300 bg-blue-50">
            <CardContent className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                <BookOpen className="w-6 h-6 text-blue-600" />
                Why Strategic Prioritization Matters
              </h3>
              <p className="text-gray-800 mb-4" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                Not all maintenance is equal. Some tasks, if ignored, trigger chain reactions costing 5-10X more. 
                Prioritize strategically = prevent disasters.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold mb-2 text-red-600">❌ Random Prioritization</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Fix what breaks when it breaks</li>
                    <li>• Ignore cascade risks until disaster</li>
                    <li>• Emergency replacements at 3X cost</li>
                    <li>• Always reactive, never strategic</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold mb-2 text-green-600">✅ Strategic Prioritization</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Prevent cascade failures ($20K-50K+)</li>
                    <li>• Fix high-risk items before they spread</li>
                    <li>• Budget accurately based on urgency</li>
                    <li>• Control = peace of mind</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-blue-300 pt-4">
                <p className="font-semibold mb-3" style={{ color: '#1B365D' }}>
                  📚 Learn More:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="justify-start"
                  >
                    <Link to={createPageUrl("ResourceGuides") + "?category=ACT Phase"}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Smart Prioritization Guide
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="justify-start"
                  >
                    <Link to={createPageUrl("VideoTutorials") + "?category=ACT Phase"}>
                      <Video className="w-4 h-4 mr-2" />
                      Cascade Risk Explained (12 min)
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {properties.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Select Property</label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-full md:w-96">
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
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Filter Priority</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="High">High Only</SelectItem>
                      <SelectItem value="Medium">Medium Only</SelectItem>
                      <SelectItem value="Low">Low Only</SelectItem>
                      <SelectItem value="Routine">Routine Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-2 border-red-300 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <p className="text-3xl font-bold text-red-700">{highPriorityCount}</p>
              </div>
              <p className="text-sm font-semibold text-gray-700">High Priority Tasks</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-300 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <p className="text-3xl font-bold text-orange-700">{cascadeRiskCount}</p>
              </div>
              <p className="text-sm font-semibold text-gray-700">Cascade Risks</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-300 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-blue-600" />
                <p className="text-2xl font-bold text-blue-700">${currentCost.toLocaleString()}</p>
              </div>
              <p className="text-sm font-semibold text-gray-700">Current Fix Cost</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-300 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-purple-600" />
                <p className="text-2xl font-bold text-purple-700">${potentialCost.toLocaleString()}</p>
              </div>
              <p className="text-sm font-semibold text-gray-700">If Delayed Cost</p>
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
            onScheduleTask={handleStatusChange} // Pass the updated handler
          />
        )}

        {/* Priority Queue */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListOrdered className="w-5 h-5" />
              Priority Queue ({filteredTasks.length} tasks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTasks.length > 0 ? (
              <div className="space-y-4">
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
                <h3 className="text-xl font-semibold mb-2">No Tasks in Queue</h3>
                <p className="mb-4">
                  {priorityFilter !== 'all' 
                    ? 'Try changing the priority filter or add a new task'
                    : 'Check the AI Maintenance Calendar above for proactive suggestions, or add a task manually'
                  }
                </p>
                <Button
                  onClick={() => setShowTaskForm(true)}
                  style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                >
                  <Plus className="w-5 h-5 mr-2" />
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
