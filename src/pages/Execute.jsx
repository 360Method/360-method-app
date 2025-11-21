import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2, Calendar, AlertTriangle, Plus, Eye, Building2, ArrowRight,
  PlayCircle, Wrench, HardHat, Star, Info
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, startOfDay, parseISO, isBefore, isSameDay } from "date-fns";
import ExecuteTaskCard from "../components/execute/ExecuteTaskCard";
import StepNavigation from "../components/navigation/StepNavigation";
import { useDemo } from "../components/shared/DemoContext";
import StepEducationCard from "../components/shared/StepEducationCard";
import { STEP_EDUCATION } from "../components/shared/stepEducationContent";
import DemoInfoTooltip from '../components/demo/DemoInfoTooltip';
import DontWantDIYBanner from '../components/demo/DontWantDIYBanner';
import RegionalAdaptationBox from '../components/shared/RegionalAdaptationBox';
import StepEducationCard from '../components/shared/StepEducationCard';
import { STEP_EDUCATION } from '../components/shared/stepEducationContent';

export default function ExecutePage() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const propertyIdFromUrl = urlParams.get('property');
  const { demoMode, demoData, isInvestor, markStepVisited } = useDemo();

  React.useEffect(() => {
    if (demoMode) markStepVisited(6);
  }, [demoMode]);

  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || 'all');

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      if (demoMode) {
        return isInvestor ? (demoData?.properties || []) : (demoData?.property ? [demoData.property] : []);
      }
      const allProps = await base44.entities.Property.list('-created_date');
      return allProps.filter(p => !p.is_draft);
    }
  });

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

  const { data: realTasks = [] } = useQuery({
    queryKey: ['tasks', 'execute', selectedProperty],
    queryFn: async () => {
      if (demoMode) {
        if (isInvestor) {
          // Filter investor demo tasks by property or show all
          if (selectedProperty === 'all') {
            return demoData?.tasks || [];
          }
          return demoData?.tasks?.filter(t => t.property_id === selectedProperty) || [];
        }
        return demoData?.tasks || [];
      }
      
      if (selectedProperty === 'all') {
        return await base44.entities.MaintenanceTask.list('-scheduled_date');
      } else {
        return await base44.entities.MaintenanceTask.filter({ property_id: selectedProperty }, '-scheduled_date');
      }
    },
    enabled: !demoMode && properties.length > 0 && selectedProperty !== null
  });

  const allTasks = realTasks;

  console.log('=== EXECUTE STATE ===');
  console.log('Demo mode:', demoMode);
  console.log('Tasks:', allTasks);
  console.log('Tasks count:', allTasks?.length);

  const canEdit = !demoMode;

  const today = startOfDay(new Date());

  // Show tasks that are Scheduled or In Progress, have a date, and are due today or overdue
  const tasksForDisplay = allTasks.filter(task => {
    if (task.status !== 'Scheduled' && task.status !== 'In Progress') return false;
    if (!task.scheduled_date) return false;
    
    try {
      const taskDate = startOfDay(parseISO(task.scheduled_date));
      return isSameDay(taskDate, today) || isBefore(taskDate, today);
    } catch {
      return false;
    }
  });

  const overdueCount = tasksForDisplay.filter(task => {
    try {
      const taskDate = startOfDay(parseISO(task.scheduled_date));
      return isBefore(taskDate, today);
    } catch {
      return false;
    }
  }).length;

  // Sort tasks
  const sortedTasks = tasksForDisplay.sort((a, b) => {
    const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3, 'Routine': 4 };
    const priorityDiff = (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
    
    if (priorityDiff !== 0) return priorityDiff;
    
    const aHours = a.estimated_hours || a.diy_time_hours || 999;
    const bHours = b.estimated_hours || b.diy_time_hours || 999;
    return aHours - bHours;
  });

  // Group by execution method
  const operatorTasks = sortedTasks.filter(t => t.execution_method === '360_Operator');
  const diyTasks = sortedTasks.filter(t => t.execution_method === 'DIY');
  const contractorTasks = sortedTasks.filter(t => t.execution_method === 'Contractor');

  // Progress calculation - these variables are still used for the "All Caught Up!" message.
  const completedToday = allTasks.filter(task => {
    if (task.status !== 'Completed') return false;
    if (!task.completion_date) return false;
    try {
      const completionDate = startOfDay(new Date(task.completion_date));
      return isSameDay(completionDate, today);
    } catch {
      return false;
    }
  }).length;

  const totalToday = tasksForDisplay.length + completedToday;
  // const completionPercentage = totalToday > 0 ? (completedToday / totalToday) * 100 : 0; // No longer rendered in the header.

  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pb-20">
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 pt-6">
          <Card className="border-2 border-green-300 bg-white">
            <CardContent className="p-6 md:p-8 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h2 className="font-bold text-xl md:text-2xl mb-2" style={{ color: '#1B365D' }}>
                Add Your First Property
              </h2>
              <p className="text-gray-600 mb-6">
                Start by adding a property to begin executing maintenance tasks.
              </p>
              <Button asChild className="bg-green-600 hover:bg-green-700" style={{ minHeight: '48px' }}>
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        
        {/* Step Navigation */}
        <div className="mb-4 md:mb-6">
          <StepNavigation currentStep={6} propertyId={selectedProperty !== 'all' ? selectedProperty : null} />
        </div>

        {/* Demo Mode Alert */}
        {demoMode && (
          <Alert className="mb-6 border-yellow-400 bg-yellow-50">
            <Info className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              <strong>Demo Mode:</strong> Task execution with AI guides and completion tracking. Read-only example.
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
              Step 6 of 9
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
              Execute
            </h1>
            <DemoInfoTooltip 
              title="Step 6: Execute"
              content="Get AI-powered how-to guides, track DIY work, or route to contractors. Everything logs to Track automatically when marked complete."
            />
          </div>
          <p className="text-gray-600 text-lg">
            Complete tasks with AI guidance
          </p>
        </div>

        {/* Don't Want DIY Banner */}
        <DontWantDIYBanner />

        {/* Step Education Card */}
        <StepEducationCard 
          {...STEP_EDUCATION.execute}
          defaultExpanded={false}
          className="mb-6"
        />

        {demoMode && (
          <RegionalAdaptationBox
            step="task execution guides"
            regionalAdaptations={{
              description: "How-to guides include climate-specific techniques. Roof repair in wet climates includes moisture barriers; desert climates focus on UV protection.",
              howItWorks: "Instructions, materials, and techniques adapt to your climate. Phoenix guides recommend reflective coatings; Seattle guides emphasize waterproofing",
              examples: {
                'pacific-northwest': [
                  'Roof: Moss prevention techniques included',
                  'Deck: Water-resistant stains recommended',
                  'Crawlspace: Vapor barrier installation guides',
                  'Paint: Mildew-resistant formulas specified'
                ],
                'southwest': [
                  'Roof: Cool roof coatings recommended',
                  'Exterior: UV-resistant materials specified',
                  'AC: Desert-specific maintenance tips',
                  'Irrigation: Drought-tolerant system guides'
                ],
                'midwest-northeast': [
                  'Winterization: Freeze protection detailed',
                  'Roof: Ice dam barrier installation',
                  'Foundation: Freeze/thaw repair techniques',
                  'Insulation: Cold climate R-values specified'
                ],
                'southeast': [
                  'Hurricane: Wind-resistant fasteners specified',
                  'Termite: Bait vs. barrier system guides',
                  'Mold: High-humidity prevention tactics',
                  'Roof: Hurricane strap installation'
                ]
              }
            }}
          />
        )}

        {properties.length > 1 && (
          <Card className="mb-6 border-2 border-green-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-green-600" />
                  <label className="text-base font-bold text-green-900">Filter by Property:</label>
                </div>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger className="flex-1 md:w-96 bg-white" style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties ({properties.length})</SelectItem>
                    {properties.map(prop => (
                      <SelectItem key={prop.id} value={prop.id}>
                        {prop.address || prop.street_address || 'Unnamed Property'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Simple Inline Count */}
        {sortedTasks.length > 0 && (
          <div className="flex items-baseline gap-2 mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''} to complete
            </h2>
            {overdueCount > 0 && (
              <span className="text-sm text-red-600 font-semibold animate-pulse">
                ({overdueCount} overdue)
              </span>
            )}
          </div>
        )}

        {/* OVERDUE ALERT */}
        {overdueCount > 0 && (
          <Card className="mb-4 border-2 border-red-400 bg-gradient-to-br from-red-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h3 className="font-bold text-red-900 mb-1 text-lg">
                    ⚠️ {overdueCount} Overdue Task{overdueCount !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-red-800">
                    These tasks were scheduled before today and need attention!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TASK LIST - Grouped by Execution Method */}
        {sortedTasks.length > 0 ? (
          <div className="space-y-6">
            
            {/* Operator Tasks Section */}
            {operatorTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">360° Operator Services</h3>
                  <Badge variant="outline" className="ml-auto border-blue-600 text-blue-600">
                    {operatorTasks.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {operatorTasks.map(task => {
                    const isOverdue = (() => {
                      try {
                        const taskDate = startOfDay(parseISO(task.scheduled_date));
                        return isBefore(taskDate, today);
                      } catch {
                        return false;
                      }
                    })();
                    
                    return (
                      <ExecuteTaskCard
                        key={task.id}
                        task={task}
                        urgency={isOverdue ? 'overdue' : 'today'}
                        properties={properties}
                        canEdit={canEdit}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* DIY Tasks Section */}
            {diyTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">DIY Tasks</h3>
                  <Badge variant="outline" className="ml-auto border-green-600 text-green-600">
                    {diyTasks.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {diyTasks.map(task => {
                    const isOverdue = (() => {
                      try {
                        const taskDate = startOfDay(parseISO(task.scheduled_date));
                        return isBefore(taskDate, today);
                      } catch {
                        return false;
                      }
                    })();
                    
                    return (
                      <ExecuteTaskCard
                        key={task.id}
                        task={task}
                        urgency={isOverdue ? 'overdue' : 'today'}
                        properties={properties}
                        canEdit={canEdit}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Contractor Tasks Section */}
            {contractorTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HardHat className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-bold text-gray-900">Contractor Services</h3>
                  <Badge variant="outline" className="ml-auto border-gray-600 text-gray-600">
                    {contractorTasks.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {contractorTasks.map(task => {
                    const isOverdue = (() => {
                      try {
                        const taskDate = startOfDay(parseISO(task.scheduled_date));
                        return isBefore(taskDate, today);
                      } catch {
                        return false;
                      }
                    })();
                    
                    return (
                      <ExecuteTaskCard
                        key={task.id}
                        task={task}
                        urgency={isOverdue ? 'overdue' : 'today'}
                        properties={properties}
                        canEdit={canEdit}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            
          </div>
        ) : (
          <Card className="border-2 border-green-200 bg-white">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="text-6xl md:text-7xl mb-4">✨</div>
              <h3 className="font-bold text-2xl md:text-3xl mb-2 text-green-900">
                All Caught Up!
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                No tasks scheduled for today. Great work!
              </p>
              
              {completedToday > 0 && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6 max-w-sm mx-auto">
                  <p className="text-green-800 font-semibold">
                    🎉 You completed {completedToday} task{completedToday !== 1 ? 's' : ''} today!
                  </p>
                </div>
              )}
              
              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  asChild
                  variant="outline"
                  className="border-yellow-600 text-yellow-600 hover:bg-yellow-50 gap-2"
                  style={{ minHeight: '48px' }}
                >
                  <Link to={createPageUrl("Schedule")}>
                    <Calendar className="w-4 h-4" />
                    View Schedule
                  </Link>
                </Button>
                <Button
                  asChild
                  className="bg-red-600 hover:bg-red-700 gap-2"
                  style={{ minHeight: '48px' }}
                >
                  <Link to={createPageUrl("Prioritize")}>
                    <Eye className="w-4 h-4" />
                    Add New Task
                  </Link>
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-6">
                Note: 360° Operator tasks will appear here on their scheduled date.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Completion Reminder */}
        <Card className="mt-6 border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-green-900 mb-2">💡 Quick Tip:</h3>
                <p className="text-sm text-gray-800 leading-relaxed">
                  Tasks under 30 minutes show a <strong>"Quick Complete"</strong> button for faster logging. 
                  Longer tasks open the full DIY guide with timer, checklist, and photo uploads. 
                  Completed tasks automatically archive to <strong>Track</strong> with all details saved!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}