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
  Archive,
  BookOpen,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PriorityTaskCard from "../components/prioritize/PriorityTaskCard";
import ManualTaskForm from "../components/tasks/ManualTaskForm";
import StepNavigation from "../components/navigation/StepNavigation";

const Label = ({ children, className = "", ...props }) => (
  <label className={`text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
);

// Helper to get current season
const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
};

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
  const [addingTemplateId, setAddingTemplateId] = React.useState(null);

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch properties - only for current user
  const { data: properties = [] } = useQuery({
    queryKey: ['properties', currentUser?.email],
    queryFn: async () => {
      const allProps = await base44.entities.Property.list('-created_date');
      return allProps.filter(p => !p.is_draft && p.created_by === currentUser?.email);
    },
    enabled: !!currentUser?.email
  });

  // Fetch seasonal maintenance templates
  const { data: allTemplates = [] } = useQuery({
    queryKey: ['maintenanceTemplates'],
    queryFn: () => base44.entities.MaintenanceTemplate.list(),
    initialData: []
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

  // Fetch tasks based on selected property - only for user's properties
  const { data: allTasks = [] } = useQuery({
    queryKey: ['maintenanceTasks', selectedProperty, currentUser?.email],
    queryFn: async () => {
      if (selectedProperty === 'all') {
        // Get all tasks but only for the user's properties
        const propertyIds = properties.map(p => p.id);
        if (propertyIds.length === 0) return [];
        
        const allTasks = await base44.entities.MaintenanceTask.list('-created_date');
        return allTasks.filter(task => propertyIds.includes(task.property_id));
      } else {
        // Verify the selected property belongs to the user
        const propertyBelongsToUser = properties.some(p => p.id === selectedProperty);
        if (!propertyBelongsToUser) return [];
        
        return await base44.entities.MaintenanceTask.filter({ property_id: selectedProperty }, '-created_date');
      }
    },
    enabled: properties.length > 0 && selectedProperty !== null && !!currentUser?.email
  });

  // Fetch system baselines for context - only for user's properties
  const { data: systemBaselines = [] } = useQuery({
    queryKey: ['systemBaselines', selectedProperty, currentUser?.email],
    queryFn: async () => {
      if (selectedProperty === 'all') {
        const propertyIds = properties.map(p => p.id);
        if (propertyIds.length === 0) return [];
        
        const allBaselines = await base44.entities.SystemBaseline.list();
        return allBaselines.filter(baseline => propertyIds.includes(baseline.property_id));
      } else {
        const propertyBelongsToUser = properties.some(p => p.id === selectedProperty);
        if (!propertyBelongsToUser) return [];
        
        return await base44.entities.SystemBaseline.filter({ property_id: selectedProperty });
      }
    },
    enabled: properties.length > 0 && selectedProperty !== null && !!currentUser?.email
  });

  // Fetch inspections for context - only for user's properties
  const { data: inspections = [] } = useQuery({
    queryKey: ['inspections', selectedProperty, currentUser?.email],
    queryFn: async () => {
      if (selectedProperty === 'all') {
        const propertyIds = properties.map(p => p.id);
        if (propertyIds.length === 0) return [];
        
        const allInspections = await base44.entities.Inspection.list('-created_date');
        return allInspections.filter(inspection => propertyIds.includes(inspection.property_id));
      } else {
        const propertyBelongsToUser = properties.some(p => p.id === selectedProperty);
        if (!propertyBelongsToUser) return [];
        
        return await base44.entities.Inspection.filter({ property_id: selectedProperty }, '-created_date');
      }
    },
    enabled: properties.length > 0 && selectedProperty !== null && !!currentUser?.email
  });

  // Create task from template mutation
  const createFromTemplateMutation = useMutation({
    mutationFn: async ({ template, propertyId }) => {
      return base44.entities.MaintenanceTask.create({
        property_id: propertyId,
        title: template.title,
        description: template.description,
        system_type: template.system_type,
        priority: template.priority,
        status: 'Identified',
        template_origin_id: template.id,
        recurring: true,
        recurrence_interval_days: template.suggested_interval_days || 365
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      setAddingTemplateId(null);
    }
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

  // Get climate zones for filtering templates
  const getPropertyClimateZones = () => {
    if (selectedProperty === 'all') {
      return [...new Set(properties.map(p => p.climate_zone).filter(Boolean))];
    } else {
      const property = properties.find(p => p.id === selectedProperty);
      return property?.climate_zone ? [property.climate_zone] : [];
    }
  };

  // Filter templates by current season and climate zone
  const currentSeason = getCurrentSeason();
  const climateZones = getPropertyClimateZones();
  
  const relevantTemplates = allTemplates.filter(template => {
    // Check if template matches current season or is year-round
    const seasonMatch = template.season === currentSeason || template.season === 'Year-Round';
    
    // Check if template matches property climate zones or is for all climates
    const climateMatch = template.climate_zone === 'All Climates' || 
                         climateZones.length === 0 || 
                         climateZones.includes(template.climate_zone);
    
    // Don't show if already added as a task
    const notAlreadyAdded = !allTasks.some(task => 
      task.template_origin_id === template.id && 
      (selectedProperty === 'all' || task.property_id === selectedProperty)
    );
    
    return seasonMatch && climateMatch && notAlreadyAdded;
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
    if (priorityFilter === 'routine') return task.priority === 'Routine';
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

  // Calculate statistics (including templates)
  const highPriorityCount = ticketQueueTasks.filter(t => t.priority === 'High').length;
  const highCascadeCount = ticketQueueTasks.filter(t => (t.cascade_risk_score || 0) >= 7).length;
  const routineCount = ticketQueueTasks.filter(t => t.priority === 'Routine').length + relevantTemplates.length;
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

  const handleAddTemplate = (template) => {
    if (selectedProperty === 'all' && properties.length > 1) {
      alert('Please select a specific property to add this task.');
      return;
    }
    
    const propertyId = selectedProperty !== 'all' ? selectedProperty : properties[0]?.id;
    if (!propertyId) return;
    
    setAddingTemplateId(template.id);
    createFromTemplateMutation.mutate({ template, propertyId });
  };

  // No properties fallback
  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 pb-20">
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 pt-6">
          <Card className="border-2 border-red-300 bg-white">
            <CardContent className="p-6 md:p-8 text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-red-600" />
              <h2 className="font-bold text-xl md:text-2xl mb-2" style={{ color: '#1B365D' }}>
                Add Your First Property
              </h2>
              <p className="text-gray-600 mb-6">
                Start by adding a property to begin prioritizing maintenance tasks.
              </p>
              <Button asChild className="bg-red-600 hover:bg-red-700" style={{ minHeight: '48px' }}>
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
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        {/* Step Navigation */}
        <div className="mb-4 md:mb-6">
          <StepNavigation currentStep={4} propertyId={selectedProperty !== 'all' ? selectedProperty : null} />
        </div>

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
                Central hub for all maintenance tasks - enrich, decide, then route through ACT
              </p>
            </div>
          </div>

          {/* ACT Phase 3-Step Flow - PROMINENT */}
          <Card className="border-2 border-red-400 bg-gradient-to-r from-red-100 via-yellow-100 to-green-100 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-red-700" />
                <h3 className="font-bold text-red-900">The ACT Phase 3-Step Workflow:</h3>
              </div>
              
              <div className="grid md:grid-cols-3 gap-3 mb-3">
                <div className="bg-red-50 rounded-lg p-3 border-2 border-red-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                    <span className="font-bold text-red-900">Prioritize (RED)</span>
                  </div>
                  <p className="text-xs text-gray-800 leading-relaxed">
                    Tickets arrive → AI analyzes costs & risks → You decide DIY or Pro → Tag by unit
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-3 border-2 border-yellow-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-yellow-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                    <span className="font-bold text-yellow-900">Schedule (YELLOW)</span>
                  </div>
                  <p className="text-xs text-gray-800 leading-relaxed">
                    Pick calendar dates → Plan timeline → Organize by system area
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border-2 border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                    <span className="font-bold text-green-900">Execute (GREEN)</span>
                  </div>
                  <p className="text-xs text-gray-800 leading-relaxed">
                    Follow AI how-to guides → Complete work → Auto-archives to Track
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border-l-4 border-blue-600">
                <p className="text-xs text-gray-800 leading-relaxed">
                  <strong>📚 Auto-Archive to Track:</strong> When you mark tasks complete in Execute (or here in Prioritize), 
                  they're <strong>automatically logged in Track</strong> with all costs, dates, and outcomes preserved forever. 
                  No manual logging needed!
                </p>
              </div>
            </CardContent>
          </Card>
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
                  <strong>This is Step 1 of ACT:</strong> Every task - whether discovered during inspections, flagged 
                  by Preserve analysis, planned upgrades, generated from seasonal maintenance templates, or manually 
                  entered - arrives in this Ticket Queue. Here you make the critical decisions that route work through 
                  the 3-step ACT workflow.
                </p>
                
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-red-200">
                    <p className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <Inbox className="w-4 h-4" />
                      Ticket Sources
                    </p>
                    <ul className="space-y-1 text-xs">
                      <li>• <strong>Seasonal Inspections</strong> - Issues discovered during quarterly walkthroughs</li>
                      <li>• <strong>Climate-Based Seasonal Maintenance</strong> - Routine tasks specific to your region (e.g., winterization, HVAC filter changes)</li>
                      <li>• <strong>Preserve Analysis</strong> - Lifecycle planning based on system age</li>
                      <li>• <strong>Upgrade Projects</strong> - Value-add improvement ideas</li>
                      <li>• <strong>Manual Entry</strong> - Ad-hoc discoveries you add yourself</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-red-200">
                    <p className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      What You Do Here
                    </p>
                    <ul className="space-y-1 text-xs">
                      <li>• Review AI cost & cascade analysis</li>
                      <li>• Set priority level (High/Medium/Low/Routine)</li>
                      <li>• Choose DIY or Professional service</li>
                      <li>• Tag by unit (for multi-unit properties)</li>
                      <li>• Add to cart OR send to Schedule</li>
                    </ul>
                  </div>
                </div>

                {/* Routine Seasonal Maintenance Card */}
                <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-300">
                  <p className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Routine Seasonal Maintenance
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed mb-2">
                    <strong>Climate-specific tasks</strong> are automatically suggested based on your property's region 
                    (set during property setup). These routine maintenance items appear here as <Badge className="bg-gray-600 text-white text-xs">Routine</Badge> priority 
                    tickets. Examples:
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li>• 🍂 <strong>Fall:</strong> Clean gutters, winterize irrigation, check heating system (cold climates)</li>
                    <li>• ❄️ <strong>Winter:</strong> Prevent frozen pipes, snow removal prep, inspect insulation</li>
                    <li>• 🌸 <strong>Spring:</strong> AC tune-up, roof inspection, exterior paint check</li>
                    <li>• ☀️ <strong>Summer:</strong> HVAC filter changes, pest control, deck maintenance</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-3 border-2 border-blue-300">
                  <p className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Archive className="w-4 h-4" />
                    Automatic Archiving to Track
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed mb-2">
                    <strong>You never manually log to Track.</strong> When tasks are marked complete (either here or in Execute), 
                    they're <strong>automatically archived</strong> with:
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li>• ✅ Completion date automatically recorded</li>
                    <li>• 💰 All costs preserved (current fix, actual cost)</li>
                    <li>• 🏷️ Unit tags maintained for filtering</li>
                    <li>• 📸 Photos, AI analysis, and notes intact</li>
                    <li>• 📊 Feeds into property health score & spending analytics</li>
                  </ul>
                </div>

                <p className="text-xs italic text-red-700 bg-red-100 border border-red-300 rounded p-2">
                  💡 <strong>Pro Tip:</strong> Always tag tickets by unit (for multi-unit properties) so you can later 
                  sort Track history by unit. This helps identify problem units and unit-specific maintenance patterns.
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

          <Card className="border-none shadow-md bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                {routineCount > 0 && (
                  <Badge className="bg-gray-600 text-white text-xs">
                    Routine
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-700">
                {routineCount}
              </p>
              <p className="text-xs text-gray-600">Seasonal + Routine</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
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
                    <SelectItem value="routine">Priority: Routine</SelectItem>
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
                className="bg-red-600 hover:bg-red-700 gap-2 w-full md:w-auto"
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

        {/* Seasonal Maintenance Suggestions */}
        {relevantTemplates.length > 0 && (
          <Card className="border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Seasonal Maintenance - {currentSeason}
                <Badge className="bg-blue-600 text-white ml-2">
                  {relevantTemplates.length} Suggested
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-700">
                Climate-specific routine maintenance for your area. Click "Add to Queue" to track these tasks.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {relevantTemplates.map(template => (
                  <Card key={template.id} className="border border-blue-200 bg-white hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{template.title}</h4>
                          <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge className="bg-gray-600 text-white text-xs">
                              {template.priority || 'Routine'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {template.system_type}
                            </Badge>
                            {template.estimated_time_minutes && (
                              <Badge variant="outline" className="text-xs">
                                ~{Math.round(template.estimated_time_minutes / 60)}h
                              </Badge>
                            )}
                          </div>
                          {template.why_important && (
                            <p className="text-xs text-gray-700 italic mt-2">
                              💡 {template.why_important}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddTemplate(template)}
                        disabled={addingTemplateId === template.id || (selectedProperty === 'all' && properties.length > 1)}
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
                        style={{ minHeight: '40px' }}
                      >
                        {addingTemplateId === template.id ? (
                          <>Adding...</>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Queue
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                  ? 'Add your first maintenance task, run an inspection, or check seasonal suggestions above.'
                  : 'Try adjusting your filters to see more tasks.'}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  onClick={() => setShowTaskForm(true)}
                  disabled={selectedProperty === 'all' && properties.length > 1}
                  className="bg-red-600 hover:bg-red-700 gap-2"
                  style={{ minHeight: '48px' }}
                >
                  <Plus className="w-4 h-4" />
                  Add Ticket
                </Button>
                {selectedProperty !== 'all' && (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                      style={{ minHeight: '48px' }}
                    >
                      <Link to={createPageUrl("Inspect") + `?property=${selectedProperty}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Run Inspection
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      style={{ minHeight: '48px' }}
                    >
                      <Link to={createPageUrl("Schedule") + `?property=${selectedProperty}`}>
                        <Calendar className="w-4 h-4 mr-2" />
                        View Seasonal Tasks
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps Guide */}
        <Card className="mt-6 border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 mb-3">Decision Points - What Happens Next:</h3>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-yellow-50 rounded-lg p-3 border-2 border-yellow-400">
                    <p className="font-semibold text-yellow-900 mb-1 flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send to Schedule
                    </p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Routes ticket to <strong>Schedule (Yellow)</strong> tab where you pick calendar dates and 
                      plan timeline → Then moves to Execute
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-400">
                    <p className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Bundle multiple service requests for professional quotes - stays in queue until submitted
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border-2 border-green-400">
                    <p className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Complete
                    </p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Skip Schedule/Execute - archives directly to <strong>Track</strong> with completion date & costs logged
                    </p>
                  </div>
                </div>

                <div className="mt-3 bg-white rounded-lg p-3 border-l-4 border-green-600">
                  <p className="text-xs text-gray-800 leading-relaxed">
                    <strong>📚 Remember:</strong> ALL completed work from ACT phase automatically appears in Track. 
                    Track is your permanent historical record - no manual entry needed. Just mark complete and it's logged!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Task Form */}
      {showTaskForm && (
        <ManualTaskForm
          propertyId={selectedProperty !== 'all' ? selectedProperty : properties[0]?.id}
          property={currentProperty || properties[0]}
          onComplete={() => setShowTaskForm(false)}
          onCancel={() => setShowTaskForm(false)}
          open={showTaskForm}
        />
      )}
    </div>
  );
}