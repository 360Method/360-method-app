import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle,
  Flame,
  Target,
  DollarSign,
  Calendar,
  Plus,
  ArrowRight,
  Filter,
  ChevronDown,
  ChevronUp,
  Wrench,
  ShoppingCart,
  Send,
  Eye,
  User,
  Building2,
  Inbox,
  Archive
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PriorityTaskCard from "../components/prioritize/PriorityTaskCard";
import ManualTaskForm from "../components/tasks/ManualTaskForm";

const Label = ({ children, className = "", ...props }) => (
  <label className={`text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
);

export default function PrioritizePage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(location.search);
  const propertyIdFromUrl = urlParams.get('property');

  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || 'all');
  const [showTaskForm, setShowTaskForm] = React.useState(false);
  const [priorityFilter, setPriorityFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('cascade_risk');
  const [showEducation, setShowEducation] = React.useState(false);

  // Fetch properties
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const allProps = await base44.entities.Property.list('-created_date');
      return allProps.filter(p => !p.is_draft);
    }
  });

  // Set initial selected property
  React.useEffect(() => {
    if (propertyIdFromUrl && properties.length > 0) {
      const foundProperty = properties.find(p => p.id === propertyIdFromUrl);
      if (foundProperty) {
        setSelectedProperty(propertyIdFromUrl);
      }
    } else if (selectedProperty === 'all' && properties.length === 1) {
      setSelectedProperty(properties[0].id);
    }
  }, [propertyIdFromUrl, properties, selectedProperty]);

  // Fetch tasks based on selected property
  const { data: allTasks = [] } = useQuery({
    queryKey: ['maintenanceTasks', selectedProperty],
    queryFn: async () => {
      if (selectedProperty === 'all') {
        return await base44.entities.MaintenanceTask.list('-created_date');
      } else {
        return await base44.entities.MaintenanceTask.filter({ property_id: selectedProperty }, '-created_date');
      }
    },
    enabled: properties.length > 0 && selectedProperty !== null
  });

  // Fetch system baselines for context
  const { data: systemBaselines = [] } = useQuery({
    queryKey: ['systemBaselines', selectedProperty],
    queryFn: async () => {
      if (selectedProperty === 'all') {
        return await base44.entities.SystemBaseline.list();
      } else {
        return await base44.entities.SystemBaseline.filter({ property_id: selectedProperty });
      }
    },
    enabled: properties.length > 0 && selectedProperty !== null
  });

  // Fetch inspections for context
  const { data: inspections = [] } = useQuery({
    queryKey: ['inspections', selectedProperty],
    queryFn: async () => {
      if (selectedProperty === 'all') {
        return await base44.entities.Inspection.list('-created_date');
      } else {
        return await base44.entities.Inspection.filter({ property_id: selectedProperty }, '-created_date');
      }
    },
    enabled: properties.length > 0 && selectedProperty !== null
  });

  // Mutations for task management
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => base44.entities.MaintenanceTask.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allMaintenanceTasks'] });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => base44.entities.MaintenanceTask.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allMaintenanceTasks'] });
    }
  });

  // Filter tasks to only show those in the "Ticket Queue" (NOT Completed, NOT Scheduled, NOT In Progress)
  const ticketQueueTasks = allTasks.filter(task => 
    task.status === 'Identified' || task.status === 'Deferred'
  );

  // Apply filters and sorting
  const filteredTasks = ticketQueueTasks.filter(task => {
    if (priorityFilter === 'all') return true;
    if (priorityFilter === 'high_cascade') return (task.cascade_risk_score || 0) >= 7;
    if (priorityFilter === 'high_priority') return task.priority === 'High';
    return task.priority === priorityFilter;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'cascade_risk') {
      return (b.cascade_risk_score || 0) - (a.cascade_risk_score || 0);
    } else if (sortBy === 'cost') {
      return (b.current_fix_cost || 0) - (a.current_fix_cost || 0);
    } else if (sortBy === 'priority') {
      const priorityOrder = { High: 3, Medium: 2, Low: 1, Routine: 0 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return 0;
  });

  // Calculate statistics
  const highPriorityCount = ticketQueueTasks.filter(t => t.priority === 'High').length;
  const highCascadeCount = ticketQueueTasks.filter(t => (t.cascade_risk_score || 0) >= 7).length;
  const totalCurrentCost = ticketQueueTasks.reduce((sum, t) => sum + (t.current_fix_cost || 0), 0);
  const totalDelayedCost = ticketQueueTasks.reduce((sum, t) => sum + (t.delayed_fix_cost || 0), 0);
  const potentialSavings = totalDelayedCost - totalCurrentCost;

  // Handle task actions
  const handleSendToSchedule = (task) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { status: 'Scheduled' }
    });
  };

  const handleMarkComplete = (task) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { 
        status: 'Completed',
        completion_date: new Date().toISOString().split('T')[0]
      }
    });
  };

  const handleDeleteTask = (task) => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTaskMutation.mutate(task.id);
    }
  };

  // No properties fallback
  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-red-300 bg-white">
            <CardContent className="p-8 text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-red-600" />
              <h2 className="font-bold text-2xl mb-2" style={{ color: '#1B365D' }}>
                Add Your First Property
              </h2>
              <p className="text-gray-600 mb-6">
                Start by adding a property to begin prioritizing maintenance tasks.
              </p>
              <Button asChild className="bg-red-600 hover:bg-red-700">
                <Link to={createPageUrl("Properties")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentProperty = selectedProperty !== 'all' 
    ? properties.find(p => p.id === selectedProperty)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 pb-20">
      <div className="mobile-container md:max-w-7xl md:mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
              <Inbox className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="font-bold" style={{ color: '#1B365D', fontSize: '28px', lineHeight: '1.2' }}>
                Step 4: Prioritize - Ticket Queue
              </h1>
              <p className="text-gray-600" style={{ fontSize: '16px' }}>
                Central hub for all maintenance tasks - enrich, decide, then route to Schedule or Track
              </p>
            </div>
          </div>

          {/* ACT Phase Workflow Indicator */}
          <div className="bg-white rounded-lg p-3 border-2 border-red-300 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-red-600 text-white">ACT Phase - Step 1 of 3</Badge>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <span className="font-bold text-red-600">→ Prioritize (Red)</span>
                <ArrowRight className="w-3 h-3" />
                <span className="text-gray-400">Schedule (Yellow)</span>
                <ArrowRight className="w-3 h-3" />
                <span className="text-gray-400">Execute (Green)</span>
                <ArrowRight className="w-3 h-3" />
                <span className="text-gray-400">Track (Archive)</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Ticket Flow:</strong> Tasks arrive here from Inspections, Preserve, Upgrades, or Manual Entry → 
              You enrich with AI → Choose DIY/Pro → Send to Schedule (yellow) or Mark Complete to archive in Track
            </p>
          </div>
        </div>

        {/* Educational Card - Expandable */}
        <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 mb-6">
          <CardContent className="p-4">
            <button
              onClick={() => setShowEducation(!showEducation)}
              className="w-full flex items-start gap-3 text-left hover:opacity-80 transition-opacity"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-1">
                  🎟️ Understanding the Ticket Queue
                </h3>
                <p className="text-sm text-red-800">
                  Click to learn how the central ticket system routes all maintenance work
                </p>
              </div>
              {showEducation ? (
                <ChevronUp className="w-5 h-5 text-red-600 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
            </button>

            {showEducation && (
              <div className="mt-4 space-y-3 text-sm text-gray-800 border-t border-red-200 pt-4">
                <p className="leading-relaxed">
                  <strong>This is your central command for ALL maintenance:</strong> Every task - whether discovered 
                  during inspections, flagged by Preserve analysis, planned upgrades, or manually entered - arrives 
                  in this Ticket Queue. Here you make the critical decisions that route work through your system.
                </p>
                
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-red-200">
                    <p className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <Inbox className="w-4 h-4" />
                      Ticket Sources
                    </p>
                    <ul className="space-y-1 text-xs">
                      <li>• Seasonal Inspections (issues found)</li>
                      <li>• Preserve Analysis (lifecycle planning)</li>
                      <li>• Upgrade Projects (improvement ideas)</li>
                      <li>• Manual Entry (ad-hoc discoveries)</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-red-200">
                    <p className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Decision Points
                    </p>
                    <ul className="space-y-1 text-xs">
                      <li>• Review AI cost & cascade analysis</li>
                      <li>• Set priority level (High/Medium/Low)</li>
                      <li>• Choose DIY or Professional service</li>
                      <li>• Add to cart OR send to Schedule</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border-2 border-yellow-300">
                  <p className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Exit Routes from Ticket Queue
                  </p>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-yellow-700">→ Schedule (Yellow):</span>
                      <span>Send here to plan when work will be done - moves to timeline view</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-700">→ Track (Archive):</span>
                      <span>Mark complete to archive - moves to historical record with costs tracked</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-blue-700">→ Cart (Bundle):</span>
                      <span>Add to cart to request professional service - submit multiple tasks together</span>
                    </li>
                  </ul>
                </div>

                <p className="text-xs italic text-red-700 bg-red-100 border border-red-300 rounded p-2">
                  💡 <strong>Pro Tip:</strong> Nothing leaves this queue until YOU decide. Tasks stay here until 
                  you send them to Schedule, mark complete (archive to Track), or delete them. This prevents 
                  work from slipping through the cracks.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Selector */}
        {properties.length > 1 && (
          <Card className="mb-6 border-2 border-red-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-red-600" />
                  <Label className="text-base font-bold text-red-900">Filter by Property:</Label>
                </div>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger className="flex-1 md:w-96 bg-white" style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span className="font-semibold">All Properties ({properties.length})</span>
                      </div>
                    </SelectItem>
                    {properties.map(prop => (
                      <SelectItem key={prop.id} value={prop.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{prop.address || prop.street_address || 'Unnamed Property'}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card className="border-none shadow-md bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Inbox className="w-5 h-5 text-red-600" />
                <Badge className="bg-red-600 text-white text-xs">
                  Tickets
                </Badge>
              </div>
              <p className="text-2xl font-bold text-red-700">
                {ticketQueueTasks.length}
              </p>
              <p className="text-xs text-gray-600">In Queue</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-5 h-5 text-orange-600" />
                {highCascadeCount > 0 && (
                  <Badge className="bg-orange-600 text-white text-xs animate-pulse">
                    Urgent
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold text-orange-700">
                {highCascadeCount}
              </p>
              <p className="text-xs text-gray-600">High Cascade Risk</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-700">
                ${(totalCurrentCost / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-gray-600">Fix Now Cost</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700">
                ${(potentialSavings / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-gray-600">Potential Savings</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="border-2 border-red-200 bg-white mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center flex-1">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-red-600" />
                  <Label className="font-semibold text-red-900">Filter:</Label>
                </div>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40" style={{ minHeight: '44px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="high_cascade">High Cascade Risk (7+)</SelectItem>
                    <SelectItem value="high_priority">High Priority</SelectItem>
                    <SelectItem value="High">Priority: High</SelectItem>
                    <SelectItem value="Medium">Priority: Medium</SelectItem>
                    <SelectItem value="Low">Priority: Low</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Label className="font-semibold text-red-900">Sort by:</Label>
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40" style={{ minHeight: '44px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cascade_risk">Cascade Risk</SelectItem>
                    <SelectItem value="cost">Cost to Fix</SelectItem>
                    <SelectItem value="priority">Priority Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => setShowTaskForm(true)}
                disabled={selectedProperty === 'all' && properties.length > 1}
                className="bg-red-600 hover:bg-red-700 gap-2"
                style={{ minHeight: '44px' }}
              >
                <Plus className="w-4 h-4" />
                Add Ticket
              </Button>
            </div>
            {selectedProperty === 'all' && properties.length > 1 && (
              <p className="text-xs text-orange-600 mt-2">
                Select a specific property to add tasks.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tasks Grid */}
        {sortedTasks.length > 0 ? (
          <div className="space-y-4">
            {sortedTasks.map(task => (
              <PriorityTaskCard
                key={task.id}
                task={task}
                onSendToSchedule={handleSendToSchedule}
                onMarkComplete={handleMarkComplete}
                onDelete={handleDeleteTask}
                property={currentProperty || properties.find(p => p.id === task.property_id)}
              />
            ))}
          </div>
        ) : (
          <Card className="border-2 border-red-200 bg-white">
            <CardContent className="p-8 text-center">
              <Inbox className="w-16 h-16 mx-auto mb-4 text-red-300" />
              <h3 className="font-bold text-xl mb-2 text-red-900">
                {ticketQueueTasks.length === 0 ? 'Ticket Queue is Empty' : 'No Tasks Match Filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {ticketQueueTasks.length === 0 
                  ? 'Add your first maintenance task or run an inspection to discover issues.'
                  : 'Try adjusting your filters to see more tasks.'}
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => setShowTaskForm(true)}
                  disabled={selectedProperty === 'all' && properties.length > 1}
                  className="bg-red-600 hover:bg-red-700 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Ticket
                </Button>
                {selectedProperty !== 'all' && (
                  <Button
                    asChild
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <Link to={createPageUrl("Inspect") + `?property=${selectedProperty}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      Run Inspection
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workflow Reminder */}
        <Card className="mt-6 border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Archive className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 mb-2">Ticket Routing - What Happens Next:</h3>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-yellow-50 rounded-lg p-3 border-2 border-yellow-400">
                    <p className="font-semibold text-yellow-900 mb-1 flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send to Schedule (Yellow)
                    </p>
                    <p className="text-xs text-gray-700">
                      Moves ticket to Schedule tab for timeline planning - changes status to "Scheduled"
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border-2 border-green-400">
                    <p className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                      <Archive className="w-4 h-4" />
                      Mark Complete
                    </p>
                    <p className="text-xs text-gray-700">
                      Archives ticket to Track (historical record) - changes status to "Completed"
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-400">
                    <p className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </p>
                    <p className="text-xs text-gray-700">
                      Bundle multiple service requests, then submit for professional quotes
                    </p>
                  </div>
                </div>
                <p className="text-xs italic text-red-700 mt-3 bg-red-100 border border-red-300 rounded p-2">
                  💡 <strong>Remember:</strong> All work in ACT phase (Prioritize → Schedule → Execute) eventually 
                  archives to Track. Track is your historical record with all costs, dates, and outcomes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Task Form */}
      {showTaskForm && (
        <ManualTaskForm
          propertyId={selectedProperty !== 'all' ? selectedProperty : properties[0]?.id}
          onComplete={() => setShowTaskForm(false)}
          onCancel={() => setShowTaskForm(false)}
          open={showTaskForm}
        />
      )}
    </div>
  );
}