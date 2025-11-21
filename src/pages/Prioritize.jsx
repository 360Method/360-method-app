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
  Sparkles,
  Grid3x3,
  List,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PriorityTaskCard from "../components/prioritize/PriorityTaskCard";
import TaskGroupCard from "../components/prioritize/TaskGroupCard";
import BulkActionBar from "../components/prioritize/BulkActionBar";
import ManualTaskForm from "../components/tasks/ManualTaskForm";
import StepNavigation from "../components/navigation/StepNavigation";
import TaskCreationIntentModal from "../components/prioritize/TaskCreationIntentModal";
import EnhancedUnitSelectionModal from "../components/prioritize/EnhancedUnitSelectionModal";
import DualUnitSelectionModal from "../components/prioritize/DualUnitSelectionModal";
import { useDemo } from "../components/shared/DemoContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import StepEducationCard from "../components/shared/StepEducationCard";
import { STEP_EDUCATION } from "../components/shared/stepEducationContent";
import DemoInfoTooltip from '../components/demo/DemoInfoTooltip';
import RegionalAdaptationBox from '../components/shared/RegionalAdaptationBox';
import DontWantDIYBanner from '../components/demo/DontWantDIYBanner';


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

// Helper to check if template is inspection-related (to filter out)
const isInspectionTask = (template) => {
  const inspectionKeywords = ['inspect', 'inspection', 'check', 'review', 'examine', 'assess', 'evaluate', 'walkthrough', 'survey', 'audit'];
  const titleLower = (template.title || '').toLowerCase();
  const descLower = (template.description || '').toLowerCase();
  
  return inspectionKeywords.some(keyword => 
    titleLower.includes(keyword) || descLower.includes(keyword)
  );
};

// Generate UUID for batch operations
const generateBatchId = () => {
  return 'batch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// NEW: Property flow type detector
function getPropertyFlowType(property) {
  if (!property) return null;
  
  const doorCount = property.door_count || 1;
  
  if (doorCount === 1) {
    return 'single_family';
  }
  
  if (doorCount === 2) {
    return 'dual_unit';
  }
  
  return 'multi_unit';
}

export default function PrioritizePage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdParam = urlParams.get('property');
  const { demoMode, demoData, isInvestor, markStepVisited } = useDemo();

  React.useEffect(() => {
    if (demoMode) markStepVisited(4);
  }, [demoMode]);

  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdParam || 'all');
  const [showTaskForm, setShowTaskForm] = React.useState(false);
  const [priorityFilter, setPriorityFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('cascade_risk');
  const [showEducation, setShowEducation] = React.useState(false); // This state will no longer control the main education card
  const [addingTemplateId, setAddingTemplateId] = React.useState(null);
  const [viewMode, setViewMode] = React.useState('grouped');
  const [selectedTasks, setSelectedTasks] = React.useState([]);
  const [unitFilter, setUnitFilter] = React.useState('all');
  
  const [intentModal, setIntentModal] = React.useState({ open: false, template: null, property: null });
  const [unitSelectionModal, setUnitSelectionModal] = React.useState({ open: false, template: null, property: null });
  const [dualUnitModal, setDualUnitModal] = React.useState({ open: false, template: null, property: null }); // NEW STATE

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch properties - only for current user
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => {
      if (demoMode) {
        return isInvestor ? (demoData?.properties || []) : (demoData?.property ? [demoData.property] : []);
      }
      return base44.entities.Property.list('-created_date');
    }
  });

  // Set initial selected property
  React.useEffect(() => {
    if (propertyIdParam && properties.length > 0) {
      const foundProperty = properties.find(p => p.id === propertyIdParam);
      if (foundProperty) {
        setSelectedProperty(propertyIdParam);
      }
    } else if (selectedProperty === 'all' && properties.length === 1) {
      setSelectedProperty(properties[0].id);
    }
  }, [propertyIdParam, properties, selectedProperty]);

  // Fetch tasks based on selected property - only for user's properties
  const { data: realTasks = [], isLoading: isLoadingTasks, refetch: refetchTasks } = useQuery({
    queryKey: ['maintenanceTasks', selectedProperty, demoMode],
    queryFn: async () => {
      if (demoMode) {
        if (isInvestor) {
          // Filter investor demo tasks by property or show all
          if (selectedProperty === 'all') {
            return demoData?.tasks || [];
          }
          return demoData?.tasks?.filter(t => t.property_id === selectedProperty) || [];
        }
        // Homeowner demo mode - return all demo tasks
        return demoData?.tasks || [];
      }
      
      if (selectedProperty === 'all') {
        return base44.entities.MaintenanceTask.list('-created_date');
      } else if (selectedProperty) {
        return base44.entities.MaintenanceTask.filter({ property_id: selectedProperty }, '-created_date');
      }
      return [];
    },
    enabled: demoMode ? true : !!selectedProperty,
    staleTime: 1 * 60 * 1000,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['maintenanceTemplates'],
    queryFn: () => {
      if (demoMode) {
        return [];
      }
      return base44.entities.MaintenanceTemplate.list();
    }
  });

  // Use demo tasks OR real tasks
  const allTasks = realTasks;

  console.log('=== PRIORITIZE STATE ===');
  console.log('Demo mode:', demoMode);
  console.log('Tasks:', allTasks);
  console.log('Tasks count:', allTasks?.length);

  const canEdit = !demoMode;

  // Mutations for task management
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => base44.entities.MaintenanceTask.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allMaintenanceTasks'] });
    }
  });

  // NEW: Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ taskIds, data }) => {
      const updatePromises = taskIds.map(id => 
        base44.entities.MaintenanceTask.update(id, data)
      );
      return await Promise.all(updatePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      setSelectedTasks([]); // Clear selection after bulk action
    }
  });

  // NEW: Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (taskIds) => {
      const deletePromises = taskIds.map(id => 
        base44.entities.MaintenanceTask.delete(id)
      );
      return await Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      setSelectedTasks([]); // Clear selection after bulk action
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

  // Filter templates by current season and climate zone (exclude inspections, include "All Climates")
  const currentSeason = getCurrentSeason();
  const climateZones = getPropertyClimateZones();
  
  const relevantTemplates = templates.filter(template => {
    if (isInspectionTask(template)) return false;
    const seasonMatch = template.season === currentSeason || template.season === 'Year-Round';
    const climateMatch = template.climate_zone === 'All Climates' || 
                         climateZones.length === 0 || 
                         climateZones.includes(template.climate_zone);
    const notAlreadyAdded = !allTasks.some(task => 
      task.template_origin_id === template.id && 
      (selectedProperty === 'all' || task.property_id === selectedProperty)
    );
    
    return seasonMatch && climateMatch && notAlreadyAdded;
  });

  // Filter tasks to only show those in the "Ticket Queue"
  const ticketQueueTasks = allTasks.filter(task => 
    task.status === 'Identified' || task.status === 'Deferred'
  );

  // NEW: Apply unit filter
  const unitFilteredTasks = unitFilter === 'all' 
    ? ticketQueueTasks
    : unitFilter === 'building_wide'
    ? ticketQueueTasks.filter(t => t.scope === 'building_wide' || t.unit_tag === 'Common Area')
    : ticketQueueTasks.filter(t => t.unit_tag === unitFilter);

  // Apply priority filters
  const filteredTasks = unitFilteredTasks.filter(task => {
    if (priorityFilter === 'all') return true;
    if (priorityFilter === 'high_cascade') return (task.cascade_risk_score || 0) >= 7;
    if (priorityFilter === 'high_priority') return task.priority === 'High';
    if (priorityFilter === 'routine') return task.priority === 'Routine';
    return task.priority === priorityFilter;
  });

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

  // NEW: Group tasks by batch_id for grouped view
  const taskGroups = React.useMemo(() => {
    const groups = {};
    const singles = [];
    
    sortedTasks.forEach(task => {
      if (task.batch_id) {
        if (!groups[task.batch_id]) {
          groups[task.batch_id] = [];
        }
        groups[task.batch_id].push(task);
      } else {
        singles.push(task);
      }
    });
    
    return { groups: Object.values(groups), singles };
  }, [sortedTasks]);

  // NEW: Get unique unit tags for filter
  const uniqueUnitTags = React.useMemo(() => {
    const tags = new Set();
    ticketQueueTasks.forEach(task => { // Use ticketQueueTasks to get all potential units, not just filtered ones.
      if (task.unit_tag && task.scope === 'per_unit') tags.add(task.unit_tag);
    });
    return Array.from(tags).sort();
  }, [ticketQueueTasks]);

  // Calculate statistics
  const highPriorityCount = ticketQueueTasks.filter(t => t.priority === 'High').length;
  const highCascadeCount = ticketQueueTasks.filter(t => (t.cascade_risk_score || 0) >= 7).length;
  const routineCount = ticketQueueTasks.filter(t => t.priority === 'Routine').length + relevantTemplates.length;
  const totalCurrentCost = ticketQueueTasks.reduce((sum, t) => sum + (t.current_fix_cost || 0), 0);
  const totalDelayedCost = ticketQueueTasks.reduce((sum, t) => sum + (t.delayed_fix_cost || 0), 0);
  const potentialSavings = totalDelayedCost - totalCurrentCost;

  // Handle task actions
  const handleSendToSchedule = (task) => {
    if (!canEdit) return;
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { status: 'Scheduled' }
    });
  };

  const handleMarkComplete = (task) => {
    if (!canEdit) return;
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { 
        status: 'Completed',
        completion_date: new Date().toISOString().split('T')[0]
      }
    });
  };

  const handleDeleteTask = (task) => {
    if (!canEdit) return;
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTaskMutation.mutate(task.id);
    }
  };

  // NEW: Bulk actions
  const handleScheduleAll = () => {
    if (!canEdit) return;
    bulkUpdateMutation.mutate({
      taskIds: selectedTasks,
      data: { status: 'Scheduled' }
    });
  };

  const handleCompleteAll = () => {
    if (!canEdit) return;
    if (confirm(`Mark ${selectedTasks.length} tasks as complete?`)) {
      bulkUpdateMutation.mutate({
        taskIds: selectedTasks,
        data: { 
          status: 'Completed',
          completion_date: new Date().toISOString().split('T')[0]
        }
      });
    }
  };

  const handleDeleteAll = () => {
    if (!canEdit) return;
    if (confirm(`Delete ${selectedTasks.length} tasks permanently?`)) {
      bulkDeleteMutation.mutate(selectedTasks);
    }
  };

  const handleChangePriority = (newPriority) => {
    if (!canEdit) return;
    bulkUpdateMutation.mutate({
      taskIds: selectedTasks,
      data: { priority: newPriority }
    });
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Helper to create a single task from template data - UPDATED
  const createTaskFromTemplate = async (template, propertyId, unitTag = undefined, scope = 'property_wide', appliesToUnitCount = undefined, batchId = undefined) => {
    if (!canEdit) return;
    try {
      const taskData = {
        property_id: propertyId,
        title: template.title,
        description: template.description,
        system_type: template.system_type,
        priority: template.priority || 'Routine',
        status: 'Identified',
        template_origin_id: template.id,
        recurring: true,
        recurrence_interval_days: template.suggested_interval_days || 365,
        unit_tag: unitTag, // Add unit_tag here
        scope: scope, // NEW
        applies_to_unit_count: appliesToUnitCount, // NEW
        batch_id: batchId // NEW
      };

      const newTask = await base44.entities.MaintenanceTask.create(taskData);
      return newTask;
    } catch (error) {
      console.error('❌ Error creating task:', error);
      throw new Error(`Failed to create task "${template.title}": ${error.message}`);
    }
  };

  // NEW: Simplified template addition with flow type detection
  const handleAddTemplate = async (template) => {
    if (!canEdit) return;
    if (selectedProperty === 'all' && properties.length > 1) {
      alert('Please select a specific property to add this task.');
      return;
    }
    
    const propertyId = selectedProperty !== 'all' ? selectedProperty : properties[0]?.id;
    if (!propertyId) {
      alert('No property selected. Please select a property first.');
      return;
    }
    
    const currentProperty = properties.find(p => p.id === propertyId);
    const flowType = getPropertyFlowType(currentProperty);
    const appliesToScope = template.applies_to_scope || 'property_wide';
    
    // SINGLE FAMILY HOME: Direct creation, no modal
    if (flowType === 'single_family') {
      setAddingTemplateId(template.id);
      try {
        await createTaskFromTemplate(
          template, 
          propertyId, 
          undefined, // No unit tag for SFH
          'property_wide', // Always property-wide for SFH
          1 // Single unit count
        );
        await refetchTasks();
      } catch (error) {
        alert(error.message);
      } finally {
        setAddingTemplateId(null);
      }
      return;
    }
    
    // Property-wide template on any property (except SFH which is already handled): Direct creation
    if (appliesToScope === 'property_wide') {
      setAddingTemplateId(template.id);
      try {
        const unitTag = (flowType === 'dual_unit' || flowType === 'multi_unit') ? 'Common Area' : undefined;
        await createTaskFromTemplate(template, propertyId, unitTag, 'building_wide');
        await refetchTasks();
      } catch (error) {
        alert(error.message);
      } finally {
        setAddingTemplateId(null);
      }
      return;
    }
    
    // DUAL UNIT: Simple 3-option modal
    if (flowType === 'dual_unit' && appliesToScope === 'per_unit') {
      setDualUnitModal({ open: true, template, property: currentProperty });
      return;
    }
    
    // MULTI UNIT + per_unit: Full intent modal
    if (flowType === 'multi_unit' && appliesToScope === 'per_unit') {
      setIntentModal({ open: true, template, property: currentProperty });
      return;
    }
  };

  // NEW: Handle dual unit modal confirmation
  const handleDualUnitConfirm = async (selection) => {
    if (!canEdit) return;
    const template = dualUnitModal.template;
    const property = dualUnitModal.property;
    
    if (!template || !property) {
      console.error("No template or property found in dual unit modal state.");
      setDualUnitModal({ open: false, template: null, property: null });
      return;
    }

    setAddingTemplateId(template.id);
    
    try {
      // Get all units from the property, fallback to door_count if 'units' array is missing
      const units = property.units || [];
      const unit1 = units[0] || { unit_id: 'Unit 1', nickname: 'Unit 1' }; 
      const unit2 = units[1] || { unit_id: 'Unit 2', nickname: 'Unit 2' };

      if (selection === 'unit1') {
        await createTaskFromTemplate(template, property.id, unit1.unit_id || unit1.nickname, 'per_unit');
      } else if (selection === 'unit2') {
        await createTaskFromTemplate(template, property.id, unit2.unit_id || unit2.nickname, 'per_unit');
      } else if (selection === 'both') {
        const batchId = generateBatchId();
        await Promise.all([
          createTaskFromTemplate(template, property.id, unit1.unit_id || unit1.nickname, 'per_unit', undefined, batchId),
          createTaskFromTemplate(template, property.id, unit2.unit_id || unit2.nickname, 'per_unit', undefined, batchId)
        ]);
      }
      
      await refetchTasks();
      setDualUnitModal({ open: false, template: null, property: null });
    } catch (error) {
      console.error('❌ Error creating tasks:', error);
      alert(error.message);
    } finally {
      setAddingTemplateId(null);
    }
  };

  // NEW: Handle intent modal selections
  const handleIntentSelection = {
    createBuildingWide: async () => {
      if (!canEdit) return;
      const template = intentModal.template;
      const property = intentModal.property;
      setAddingTemplateId(template.id);
      
      try {
        await createTaskFromTemplate(
          template, 
          property.id, 
          `All Units (${property.door_count})`, // Unit tag indicating all units
          'building_wide', // Explicitly building-wide scope
          property.door_count // Number of units it applies to
        );
        await refetchTasks();
        setIntentModal({ open: false, template: null, property: null });
      } catch (error) {
        alert(error.message);
      } finally {
        setAddingTemplateId(null);
      }
    },
    
    createPerUnit: async () => {
      if (!canEdit) return;
      const template = intentModal.template;
      const property = intentModal.property;
      const batchId = generateBatchId(); // Generate a batch ID for these tasks
      setAddingTemplateId(template.id);
      
      try {
        // Get all units from the property, fallback to door_count if 'units' array is missing
        const units = property.units || [];
        const allUnits = units.length > 0 
          ? units.map(u => u.unit_id || u.nickname || `Unit ${u.id}`)
          : Array.from({ length: property.door_count }, (_, i) => `Unit ${i + 1}`);
        
        const createPromises = allUnits.map(unitTag => 
          createTaskFromTemplate(
            template, 
            property.id, 
            unitTag,
            'per_unit', // Explicitly per-unit scope
            undefined, // Not applicable for per_unit count
            batchId // Assign the same batch ID to all
          )
        );
        
        await Promise.all(createPromises);
        await refetchTasks();
        setIntentModal({ open: false, template: null, property: null });
      } catch (error) {
        alert(error.message);
      } finally {
        setAddingTemplateId(null);
      }
    },
    
    chooseUnits: () => {
      if (!canEdit) return;
      setUnitSelectionModal({ 
        open: true, 
        template: intentModal.template, 
        property: intentModal.property 
      });
      setIntentModal({ open: false, template: null, property: null });
    }
  };

  // Handle unit selection modal confirmation - UPDATED
  const handleUnitSelectionConfirm = async (selectedUnitTags) => {
    if (!canEdit) return;
    const template = unitSelectionModal.template;
    const property = unitSelectionModal.property;
    
    if (!template || !property) {
      console.error("No template or property found in modal state.");
      setUnitSelectionModal({ open: false, template: null, property: null });
      return;
    }
    
    const batchId = generateBatchId(); // Generate a batch ID for these tasks
    setAddingTemplateId(template.id); // Set loading state for batch creation
    
    try {
      // Create a task for each selected unit
      const createPromises = selectedUnitTags.map(unitTag => 
        createTaskFromTemplate(template, property.id, unitTag, 'per_unit', undefined, batchId)
      );
      
      await Promise.all(createPromises);
      await refetchTasks(); // Refetch after all batch tasks are created
      setUnitSelectionModal({ open: false, template: null, property: null }); // Close modal
      
    } catch (error) {
      console.error('❌ Error creating tasks:', error);
      alert(`Failed to create some tasks: ${error.message}`); // Display a general error
    } finally {
      setAddingTemplateId(null); // Clear loading state
    }
  };

  // No properties fallback
  if (properties.length === 0 && !demoMode) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
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
  
  const flowType = getPropertyFlowType(currentProperty); // NEW: Check property flow type
  const isMultiUnitView = flowType === 'multi_unit' || flowType === 'dual_unit'; // NEW: Check if property is multi-unit (including dual)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        
        {/* Step Navigation */}
        <div className="mb-4 md:mb-6">
          <StepNavigation currentStep={4} propertyId={selectedProperty !== 'all' ? selectedProperty : null} />
        </div>

        {/* Demo Mode Alert */}
        {demoMode && (
          <Alert className="mb-6 border-yellow-400 bg-yellow-50">
            <Info className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              <strong>Demo Mode:</strong> 8 tasks with AI analysis, cascade risk scoring, and cost estimates. Read-only example.
            </AlertDescription>
          </Alert>
        )}

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
          <div className="flex items-center gap-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
              Prioritize
            </h1>
            <DemoInfoTooltip 
              title="Step 4: Prioritize"
              content="AI analyzes every task for cascade risk and cost impact. Focus on HIGH items first - they're the ones that prevent $5K+ disasters if you delay."
            />
          </div>
          <p className="text-gray-600 text-lg">
            Your maintenance queue with AI-powered risk analysis
          </p>
        </div>

        {/* Don't Want DIY Banner */}
        <DontWantDIYBanner />

        {/* Step Education Card */}
        <StepEducationCard 
          {...STEP_EDUCATION.prioritize}
          defaultExpanded={false}
          className="mb-6"
        />

        {demoMode && (
          <RegionalAdaptationBox
            step="task prioritization"
            regionalAdaptations={{
              description: "Cascade risk calculations adjust for climate. A clogged gutter in Seattle (URGENT) is less critical in Phoenix (MEDIUM).",
              howItWorks: "AI applies regional risk multipliers. Same task gets different urgency ratings based on your climate's specific failure modes",
              examples: {
                'pacific-northwest': [
                  'Gutter cleaning: URGENT (+40% risk multiplier)',
                  'Roof repairs: HIGH (+30% multiplier)',
                  'Crawlspace moisture: HIGH (+50% multiplier)',
                  'Deck sealing: MEDIUM (+40% multiplier)'
                ],
                'southwest': [
                  'AC maintenance: URGENT (+50% multiplier)',
                  'Roof UV damage: HIGH (+30% multiplier)',
                  'Seal replacement: MEDIUM (+40% multiplier)',
                  'Gutter cleaning: LOW (-30% multiplier)'
                ],
                'midwest-northeast': [
                  'Winterization: URGENT (+50% multiplier)',
                  'Furnace service: URGENT (+60% multiplier)',
                  'Ice dam prevention: HIGH (+40% multiplier)',
                  'Foundation cracks: HIGH (+30% multiplier)'
                ],
                'southeast': [
                  'Hurricane prep: URGENT (+60% multiplier)',
                  'Termite inspection: HIGH (+40% multiplier)',
                  'Mold prevention: HIGH (+50% multiplier)',
                  'Roof tie-downs: HIGH (+50% multiplier)'
                ]
              }
            }}
          />
        )}

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

        {/* Filters and Actions - UPDATED with View Mode */}
        <Card className="border-2 border-red-200 bg-white mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
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

                  {isMultiUnitView && ( // NEW: Conditionally render unit filter
                    <Select value={unitFilter} onValueChange={setUnitFilter}>
                      <SelectTrigger className="w-40" style={{ minHeight: '44px' }}>
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Units</SelectItem>
                        <SelectItem value="building_wide">Building Wide</SelectItem>
                        {uniqueUnitTags.map(tag => (
                          <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <div className="flex items-center gap-2">
                    <Label className="font-semibold text-red-900">Sort:</Label>
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
                  disabled={selectedProperty === 'all' && properties.length > 1 || !canEdit}
                  className="bg-red-600 hover:bg-red-700 gap-2 w-full md:w-auto"
                  style={{ minHeight: '44px' }}
                >
                  <Plus className="w-4 h-4" />
                  Add Ticket
                </Button>
              </div>

              {/* View Mode Toggle - Only for multi-unit */}
              {flowType === 'multi_unit' && (
                <div className="flex items-center gap-2">
                  <Label className="font-semibold text-red-900">View:</Label>
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('grouped')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                        viewMode === 'grouped' 
                          ? 'bg-white shadow-sm font-semibold' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      style={{ minHeight: '40px' }}
                    >
                      <Grid3x3 className="w-4 h-4" />
                      <span className="text-sm">Grouped</span>
                    </button>
                    <button
                      onClick={() => setViewMode('individual')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                        viewMode === 'individual' 
                          ? 'bg-white shadow-sm font-semibold' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      style={{ minHeight: '40px' }}
                    >
                      <List className="w-4 h-4" />
                      <span className="text-sm">Individual</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            {selectedProperty === 'all' && properties.length > 1 && (
              <p className="text-xs text-orange-600 mt-2">
                Select a specific property to add tasks.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Seasonal Tasks with Scope Indicators */}
        {relevantTemplates.length > 0 && (
          <div 
            className="mb-6 p-6 rounded-lg border-2 border-blue-400 bg-white shadow-lg"
            style={{ backgroundColor: '#FFFFFF', position: 'relative', zIndex: 1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-blue-900">
                {currentSeason} Maintenance Tasks
              </h2>
              <Badge className="bg-blue-600 text-white ml-2">
                {relevantTemplates.length} Suggested
              </Badge>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              {flowType === 'single_family' 
                ? 'Click "Add Task" to add these to your queue'
                : 'Click "Add to Queue" to add these to your priority list'
              }
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {relevantTemplates.map((template) => {
                const isAdding = addingTemplateId === template.id;
                const canAdd = selectedProperty !== 'all' || properties.length === 1;
                const appliesToScope = template.applies_to_scope || 'property_wide'; // Determine scope
                
                return (
                  <div
                    key={template.id}
                    className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50"
                    style={{ backgroundColor: '#EFF6FF' }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{template.title}</h3>
                      {flowType !== 'single_family' && ( // Don't show badge for SFH
                        <Badge 
                          className={appliesToScope === 'per_unit' ? 'bg-purple-600' : 'bg-gray-600'}
                          style={{ flexShrink: 0 }}
                        >
                          {appliesToScope === 'per_unit' ? '🏢 Per Unit' : '🏠 Building'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{template.description}</p>
                    
                    <div className="flex gap-2 mb-4">
                      <span className="text-xs px-2 py-1 bg-gray-600 text-white rounded">
                        {template.priority || 'Routine'}
                      </span>
                      <span className="text-xs px-2 py-1 border border-gray-300 rounded">
                        {template.system_type}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleAddTemplate(template);
                      }}
                      disabled={!canAdd || isAdding || !canEdit}
                      className="w-full py-3 rounded-lg font-bold text-white transition-all"
                      style={{
                        backgroundColor: (!canAdd || isAdding || !canEdit) ? '#9CA3AF' : '#2563EB',
                        cursor: (!canAdd || isAdding || !canEdit) ? 'not-allowed' : 'pointer',
                        minHeight: '48px',
                        border: 'none',
                        outline: 'none'
                      }}
                    >
                      {isAdding ? '⏳ Adding...' : flowType === 'single_family' ? '➕ Add Task' : '➕ Add to Queue'}
                    </button>

                    {!canAdd && (
                      <p className="text-xs text-orange-600 mt-2 text-center">
                        Select a specific property first
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Decision Points Guide - Moved above queue for demo */}
        {demoMode && (
          <Card className="mb-6 border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50">
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
        )}

        {/* Tasks Display - UPDATED with Grouped/Individual Views */}
        {sortedTasks.length > 0 ? (
          <div className="space-y-4">
            {viewMode === 'grouped' && flowType === 'multi_unit' ? ( // Only show grouped view for multi_unit
              <>
                {/* Grouped Tasks */}
                {taskGroups.groups.map((group, idx) => (
                  <TaskGroupCard
                    key={group[0].batch_id || `group-${idx}`}
                    tasks={group}
                    property={currentProperty || properties.find(p => p.id === group[0].property_id)}
                    onSendToSchedule={handleSendToSchedule}
                    onMarkComplete={handleMarkComplete}
                    onDelete={handleDeleteTask}
                    selectedTasks={selectedTasks}
                    onToggleTask={toggleTaskSelection}
                    canEdit={canEdit}
                  />
                ))}
                
                {/* Single Tasks (not part of a batch) */}
                {taskGroups.singles.map(task => (
                  <PriorityTaskCard
                    key={task.id}
                    task={task}
                    onSendToSchedule={handleSendToSchedule}
                    onMarkComplete={handleMarkComplete}
                    onDelete={handleDeleteTask}
                    property={currentProperty || properties.find(p => p.id === task.property_id)}
                    selectedTasks={selectedTasks}
                    onToggleTask={toggleTaskSelection}
                    canEdit={canEdit}
                  />
                ))}
              </>
            ) : (
              <>
                {/* Individual View - All tasks separately (including for SFH and Dual-Unit) */}
                {sortedTasks.map(task => (
                  <PriorityTaskCard
                    key={task.id}
                    task={task}
                    onSendToSchedule={handleSendToSchedule}
                    onMarkComplete={handleMarkComplete}
                    onDelete={handleDeleteTask}
                    property={currentProperty || properties.find(p => p.id === task.property_id)}
                    selectedTasks={selectedTasks}
                    onToggleTask={toggleTaskSelection}
                    canEdit={canEdit}
                  />
                ))}
              </>
            )}
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
                  ? 'Add tasks using the seasonal suggestions above or create a custom ticket.'
                  : 'Try adjusting your filters to see more tasks.'}
              </p>
            </CardContent>
          </Card>
        )}


      </div>

      {/* Manual Task Form */}
      {showTaskForm && (
        <ManualTaskForm
          propertyId={selectedProperty !== 'all' ? selectedProperty : properties[0]?.id}
          property={currentProperty || properties[0]}
          onComplete={() => setShowTaskForm(false)}
          onCancel={() => setShowTaskForm(false)}
          open={showTaskForm}
          canEdit={canEdit}
        />
      )}

      {/* Intent Modal - NEW */}
      <TaskCreationIntentModal
        open={intentModal.open}
        onClose={() => setIntentModal({ open: false, template: null, property: null })}
        template={intentModal.template}
        property={intentModal.property}
        onCreateBuildingWide={handleIntentSelection.createBuildingWide}
        onCreatePerUnit={handleIntentSelection.createPerUnit}
        onChooseUnits={handleIntentSelection.chooseUnits}
        isCreating={addingTemplateId === intentModal.template?.id}
        canEdit={canEdit}
      />

      {/* Dual Unit Selection Modal - NEW */}
      <DualUnitSelectionModal
        open={dualUnitModal.open}
        onClose={() => setDualUnitModal({ open: false, template: null, property: null })}
        template={dualUnitModal.template}
        property={dualUnitModal.property}
        onConfirm={handleDualUnitConfirm}
        isCreating={addingTemplateId === dualUnitModal.template?.id}
        canEdit={canEdit}
      />

      {/* Enhanced Unit Selection Modal - Renamed/Updated */}
      <EnhancedUnitSelectionModal
        open={unitSelectionModal.open}
        onClose={() => setUnitSelectionModal({ open: false, template: null, property: null })}
        template={unitSelectionModal.template}
        property={unitSelectionModal.property}
        onConfirm={handleUnitSelectionConfirm}
        isCreating={addingTemplateId === unitSelectionModal.template?.id}
        canEdit={canEdit}
      />

      {/* Bulk Action Bar - NEW */}
      <BulkActionBar
        selectedCount={selectedTasks.length}
        onScheduleAll={handleScheduleAll}
        onCompleteAll={handleCompleteAll}
        onDeleteAll={handleDeleteAll}
        onChangePriority={handleChangePriority}
        onClearSelection={() => setSelectedTasks([])}
        canEdit={canEdit}
      />
    </div>
  );
}