import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Property, MaintenanceTask, Upgrade, SystemBaseline, Inspection, integrations } from '@/api/supabaseClient';
import { Link } from 'react-router-dom';
import { useAuth } from "@/lib/AuthContext";
import { 
  Trophy, TrendingUp, Calendar, Image as ImageIcon, Plus, Info
} from 'lucide-react';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Custom components
import WinsDashboard from '@/components/track/WinsDashboard';
import TimelineView from '@/components/track/TimelineView';
import PhotoGallery from '@/components/track/PhotoGallery';
import InsightsView from '@/components/track/InsightsView';
import ExportMenu from '@/components/track/ExportMenu';
import ManualTaskForm from '@/components/tasks/ManualTaskForm';
import { useDemo } from '../components/shared/DemoContext';
import StepEducationCard from '../components/shared/StepEducationCard';
import { STEP_EDUCATION } from '../components/shared/stepEducationContent';
import StepNavigation from '../components/navigation/StepNavigation';
import { Badge } from '@/components/ui/badge';
import DemoInfoTooltip from '../components/demo/DemoInfoTooltip';
import RegionalAdaptationBox from '../components/shared/RegionalAdaptationBox';
import DemoCTA from '../components/demo/DemoCTA';

export default function TrackPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const queryClient = useQueryClient();
  const { demoMode, demoData, isInvestor, markStepVisited } = useDemo();
  const { user } = useAuth();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (demoMode) markStepVisited(3);
  }, [demoMode, markStepVisited]);

  const [selectedProperty, setSelectedProperty] = useState(urlParams.get('property') || 'first');
  const [activeTab, setActiveTab] = useState('wins');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Fetch properties
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery({
    queryKey: ['properties', user?.id],
    queryFn: async () => {
      if (demoMode) {
        return isInvestor ? (demoData?.properties || []) : (demoData?.property ? [demoData.property] : []);
      }
      // Filter by user_id for security (Clerk auth with permissive RLS)
      return await Property.list('-created_date', user?.id);
    },
    enabled: demoMode || !!user?.id
  });

  // Auto-select first property
  useEffect(() => {
    if (properties.length > 0 && selectedProperty === 'first') {
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  // Fetch completed maintenance tasks
  const { data: realCompletedTasks = [] } = useQuery({
    queryKey: ['completed-tasks', selectedProperty],
    queryFn: async () => {
      if (demoMode) {
        if (isInvestor) {
          // Filter investor demo history by property
          if (!selectedProperty || selectedProperty === 'first') return [];
          return demoData?.maintenanceHistory?.filter(t => t.property_id === selectedProperty) || [];
        }
        return demoData?.maintenanceHistory || [];
      }
      
      if (!selectedProperty || selectedProperty === 'first') return [];
      return await MaintenanceTask.filter({ 
        property_id: selectedProperty, 
        status: 'Completed' 
      }, '-completion_date');
    },
    enabled: !!selectedProperty && selectedProperty !== 'first'
  });

  const completedTasks = realCompletedTasks;

  console.log('=== TRACK STATE ===');
  console.log('Demo mode:', demoMode);
  console.log('Completed tasks:', completedTasks);
  console.log('History count:', completedTasks?.length);

  // Fetch system baselines
  const { data: realSystems = [] } = useQuery({
    queryKey: ['systemBaselines', selectedProperty],
    queryFn: async () => {
      if (!selectedProperty || selectedProperty === 'first') return [];
      return await SystemBaseline.filter({ property_id: selectedProperty });
    },
    enabled: !demoMode && !!selectedProperty && selectedProperty !== 'first'
  });

  const systems = demoMode
    ? (demoData?.systems || [])
    : realSystems;

  // Fetch inspections
  const { data: realInspections = [] } = useQuery({
    queryKey: ['inspections', selectedProperty],
    queryFn: async () => {
      if (!selectedProperty || selectedProperty === 'first') return [];
      return await Inspection.filter({ 
        property_id: selectedProperty, 
        status: 'Completed' 
      }, '-inspection_date');
    },
    enabled: !demoMode && !!selectedProperty && selectedProperty !== 'first'
  });

  const inspections = demoMode
    ? (demoData?.inspections || [])
    : realInspections;

  // Fetch upgrades
  const { data: realUpgrades = [] } = useQuery({
    queryKey: ['upgrades', selectedProperty],
    queryFn: async () => {
      if (!selectedProperty || selectedProperty === 'first') return [];
      return await Upgrade.filter({ 
        property_id: selectedProperty, 
        status: 'Completed' 
      }, '-completion_date');
    },
    enabled: !demoMode && !!selectedProperty && selectedProperty !== 'first'
  });

  const upgrades = demoMode
    ? (demoData?.upgrades || []).filter(u => u.status === 'Completed')
    : realUpgrades;

  const canEdit = !demoMode;

  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    if (completedTasks.length === 0) return null;
    
    let totalSpent = 0;
    let totalHours = 0;
    let totalSavings = 0;
    let disastersPrevented = 0;
    let wouldHaveCost = 0;
    let diyTasks = 0;
    let diySavings = 0;
    let inspectionFixes = 0;
    let inspectionSavings = 0;
    
    completedTasks.forEach(task => {
      totalSpent += task.cost || task.actual_cost || 0;
      totalHours += task.time_spent_hours || task.actual_hours || 0;
      
      // Calculate prevented costs
      const preventedCost = task.prevented_cost || 0;
      totalSavings += preventedCost;
      
      // DIY savings
      if (task.completed_by === 'DIY' || task.execution_method === 'DIY') {
        diyTasks++;
        diySavings += preventedCost;
      }
      
      // Disaster prevention
      if (preventedCost > 1000) {
        disastersPrevented++;
        wouldHaveCost += preventedCost;
      }
      
      // Inspection efficiency
      if (task.resolved_during_inspection) {
        inspectionFixes++;
        inspectionSavings += 75;
      }
    });
    
    const roi = totalSpent > 0 ? Math.round(((totalSavings) / totalSpent) * 100) : 0;
    const effectiveRate = totalHours > 0 ? Math.round(totalSavings / totalHours) : 0;
    
    return {
      totalSpent,
      totalHours,
      totalSavings,
      roi,
      effectiveRate,
      disastersPrevented,
      wouldHaveCost,
      diyTasks,
      diySavings,
      inspectionFixes,
      inspectionSavings,
      tasksCompleted: completedTasks.length
    };
  }, [completedTasks]);

  // Build unified timeline
  const timelineItems = useMemo(() => {
    const items = [];
    
    completedTasks.forEach(task => {
      const date = task.date || task.completion_date;
      if (date) {
        items.push({
          type: 'task',
          date: new Date(date),
          title: task.title,
          category: task.system_type || task.type || 'General',
          cost: task.cost || task.actual_cost || 0,
          data: task
        });
      }
    });
    
    systems.forEach(system => {
      if (system.installation_year) {
        items.push({
          type: 'system',
          date: new Date(system.installation_year, 0, 1),
          title: `${system.system_type} Installed`,
          category: system.system_type,
          cost: null,
          data: system
        });
      }
    });
    
    inspections.forEach(inspection => {
      if (inspection.inspection_date) {
        items.push({
          type: 'inspection',
          date: new Date(inspection.inspection_date),
          title: `${inspection.season} ${inspection.year} Inspection`,
          category: 'Inspection',
          cost: null,
          data: inspection
        });
      }
    });
    
    upgrades.forEach(upgrade => {
      if (upgrade.completion_date) {
        items.push({
          type: 'upgrade',
          date: new Date(upgrade.completion_date),
          title: upgrade.title,
          category: upgrade.category || 'Upgrade',
          cost: upgrade.actual_cost || 0,
          data: upgrade
        });
      }
    });
    
    return items.sort((a, b) => b.date - a.date);
  }, [completedTasks, systems, inspections, upgrades]);

  // Get current property object for exports
  const currentProperty = useMemo(() => {
    return properties.find(p => p.id === selectedProperty);
  }, [properties, selectedProperty]);

  // Generate AI insights
  const handleGenerateInsights = async () => {
    if (demoMode) return;
    setGeneratingAI(true);
    
    try {
      const totalCost = timelineItems.reduce((sum, item) => sum + (item.cost || 0), 0);
      const avgMonthly = completedTasks.length > 0 ? totalCost / 12 : 0;
      
      const systemAges = systems
        .filter(s => s.installation_year)
        .map(s => ({
          system: s.system_type,
          age: new Date().getFullYear() - s.installation_year,
          lifespan: s.estimated_lifespan_years || 20,
          condition: s.condition
        }));
      
      const costsBySystem = {};
      completedTasks.forEach(task => {
        const system = task.system_type || 'General';
        costsBySystem[system] = (costsBySystem[system] || 0) + (task.actual_cost || 0);
      });
      
      const prompt = `You are a property maintenance AI advisor. Analyze this property's maintenance history and provide insights.

PROPERTY DATA:
- Total systems documented: ${systems.length}
- Total tasks completed: ${completedTasks.length}
- Total inspections: ${inspections.length}
- Total spent: $${totalCost.toFixed(0)}
- Average monthly spend: $${avgMonthly.toFixed(0)}

SYSTEMS WITH AGE DATA:
${systemAges.map(s => `- ${s.system}: ${s.age} years old (${Math.round((s.age / s.lifespan) * 100)}% of ${s.lifespan}-year lifespan), condition: ${s.condition || 'Unknown'}`).join('\n')}

SPENDING BY SYSTEM:
${Object.entries(costsBySystem).map(([sys, cost]) => `- ${sys}: $${cost.toFixed(0)}`).join('\n')}

Provide comprehensive analysis with this structure:
1. Overall Assessment (2-3 sentences)
2. Top 3 Risks with actions
3. Spending Forecast for next 12 months
4. Cost Optimization Tips
5. Proactive Actions for next 3-6 months
6. Pattern Insights`;

      const response = await integrations.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_assessment: { type: "string" },
            top_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  system: { type: "string" },
                  risk_level: { type: "string" },
                  reason: { type: "string" },
                  action: { type: "string" }
                }
              }
            },
            spending_forecast: {
              type: "object",
              properties: {
                next_12_months_estimate: { type: "number" },
                monthly_average_forecast: { type: "number" },
                explanation: { type: "string" },
                major_expenses_upcoming: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      item: { type: "string" },
                      timeframe: { type: "string" },
                      estimated_cost: { type: "number" }
                    }
                  }
                }
              }
            },
            cost_optimization: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tip: { type: "string" },
                  potential_savings: { type: "string" }
                }
              }
            },
            proactive_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  timeframe: { type: "string" },
                  prevents: { type: "string" }
                }
              }
            },
            pattern_insights: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      setAiInsights(response);
    } catch (error) {
      console.error('AI insights generation failed:', error);
    } finally {
      setGeneratingAI(false);
    }
  };

  // Auto-generate AI insights if enough data
  useEffect(() => {
    const shouldAutoGenerate = 
      completedTasks.length >= 3 && 
      systems.length >= 1 && 
      !aiInsights && 
      !generatingAI &&
      !demoMode;
    
    if (shouldAutoGenerate) {
      handleGenerateInsights();
    }
  }, [completedTasks.length, systems.length, demoMode, aiInsights, generatingAI]);

  // Manual task form takeover
  if (showTaskForm && canEdit) {
    return (
      <ManualTaskForm
        propertyId={selectedProperty}
        onComplete={() => {
          setShowTaskForm(false);
          queryClient.invalidateQueries({ queryKey: ['completed-tasks'] });
          queryClient.invalidateQueries({ queryKey: ['systemBaselines'] });
          queryClient.invalidateQueries({ queryKey: ['inspections'] });
          queryClient.invalidateQueries({ queryKey: ['upgrades'] });
        }}
        onCancel={() => setShowTaskForm(false)}
      />
    );
  }

  // Loading state
  if (isLoadingProperties) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  // Empty state: No properties
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <Trophy className="w-20 h-20 text-gray-400 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">No Properties Yet</h1>
        <p className="text-gray-600 text-center mb-6 max-w-md">
          Add your first property to start tracking your maintenance wins and see your savings grow!
        </p>
        <Link to="/properties">
          <Button className="bg-blue-600 hover:bg-blue-700" style={{ minHeight: '48px' }}>
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Property
          </Button>
        </Link>
      </div>
    );
  }

  // Empty state: No completed tasks
  if (selectedProperty !== 'first' && completedTasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        
        <div className="mb-4 md:mb-6">
          <StepNavigation currentStep={3} propertyId={selectedProperty !== 'first' ? selectedProperty : null} />
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className="bg-blue-600 text-white text-sm px-3 py-1">
              Phase I - AWARE
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Step 3 of 9
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Your Wins 🎉</h1>
          
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger style={{ minHeight: '48px' }}>
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map(prop => (
                <SelectItem key={prop.id} value={prop.id}>
                  {prop.address || 'Property'}
                  {prop.unit_number && ` (Unit ${prop.unit_number})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* NEW: Step Education Card */}
        <StepEducationCard 
          {...STEP_EDUCATION.track}
          defaultExpanded={false}
          className="mb-6"
        />

        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Completed Tasks Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Complete your first maintenance task to start seeing your wins and savings!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/execute">
                <Button className="bg-blue-600 hover:bg-blue-700" style={{ minHeight: '48px' }}>
                  Go to Execute Phase
                </Button>
              </Link>
              {canEdit && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowTaskForm(true)}
                  style={{ minHeight: '48px' }}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Log Past Maintenance
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const totalInvested = completedTasks.reduce((sum, h) => sum + (h.cost || h.actual_cost || 0), 0);
  const totalPrevented = completedTasks.reduce((sum, h) => sum + (h.prevented_cost || 0), 0);
  const netSavings = totalPrevented - totalInvested;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Header - Sticky */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="p-4">
          {/* Demo Banner */}
          {demoMode && (
            <Alert className="mb-4 border-yellow-400 bg-yellow-50">
              <Info className="w-4 h-4 text-yellow-600" />
              <AlertDescription className="text-yellow-900">
                <strong>Demo Mode:</strong> {completedTasks.length} maintenance records showing ${totalInvested.toLocaleString()} invested, 
                ${totalPrevented.toLocaleString()}+ in costs prevented. Read-only example.
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-4 md:mb-6">
            <StepNavigation currentStep={3} propertyId={selectedProperty !== 'first' ? selectedProperty : null} />
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className="bg-blue-600 text-white text-sm px-3 py-1">
              Phase I - AWARE
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Step 3 of 9
            </Badge>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Your Wins 🎉
              </h1>
              <DemoInfoTooltip 
                title="Step 3: Track"
                content="All completed maintenance automatically logs here with costs, photos, and dates. Your permanent record of care - great for insurance claims and resale."
              />
            </div>
            
            <div className="flex items-center gap-2">
              <ExportMenu
                timelineItems={timelineItems}
                metrics={metrics}
                systems={systems}
                property={currentProperty}
                aiInsights={aiInsights}
              />
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTaskForm(true)}
                  className="flex items-center gap-2"
                  style={{ minHeight: '44px' }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Task</span>
                </Button>
              )}
            </div>
          </div>
          
          {/* Property Selector */}
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-full" style={{ minHeight: '48px' }}>
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map(prop => (
                <SelectItem key={prop.id} value={prop.id}>
                  {prop.address || 'Property'}
                  {prop.unit_number && ` (Unit ${prop.unit_number})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Summary Stats */}
          {completedTasks.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {completedTasks.length}
                </p>
                <p className="text-xs text-gray-600">Maintenance Records</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  ${totalPrevented.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">Costs Prevented</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">
                  ${netSavings.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">Net Savings</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto rounded-none">
            <TabsTrigger 
              value="wins" 
              className="flex flex-col items-center gap-1 py-3 text-xs data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
              style={{ minHeight: '60px' }}
            >
              <Trophy className="w-5 h-5" />
              <span>Wins</span>
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="flex flex-col items-center gap-1 py-3 text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              style={{ minHeight: '60px' }}
            >
              <Calendar className="w-5 h-5" />
              <span>Timeline</span>
            </TabsTrigger>
            <TabsTrigger 
              value="photos" 
              className="flex flex-col items-center gap-1 py-3 text-xs data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
              style={{ minHeight: '60px' }}
            >
              <ImageIcon className="w-5 h-5" />
              <span>Photos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="flex flex-col items-center gap-1 py-3 text-xs data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
              style={{ minHeight: '60px' }}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Insights</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* NEW: Step Education Card (above tabs content) */}
        <StepEducationCard 
          {...STEP_EDUCATION.track}
          defaultExpanded={false}
          className="mb-6"
        />

        {demoMode && (
          <RegionalAdaptationBox
            step="maintenance logging"
            regionalAdaptations={{
              description: "Historical tracking captures regional patterns. Pacific NW properties log more moisture issues; Southwest logs more HVAC work.",
              howItWorks: "Analytics compare your maintenance patterns to regional benchmarks, flagging unusual trends that may indicate problems",
              examples: {
                'pacific-northwest': [
                  'Moisture events tracked separately',
                  'Gutter cleaning frequency monitored',
                  'Mold remediation costs flagged',
                  'Seasonal spend peaks in fall (pre-rain)'
                ],
                'southwest': [
                  'AC filter changes tracked weekly in summer',
                  'UV damage repairs categorized',
                  'Monsoon damage tracked separately',
                  'Seasonal spend peaks in spring (AC prep)'
                ],
                'midwest-northeast': [
                  'Freeze damage incidents tracked',
                  'Heating costs monitored by severity',
                  'Ice dam occurrences logged',
                  'Seasonal spend peaks in fall (winterization)'
                ],
                'southeast': [
                  'Hurricane prep/recovery costs separated',
                  'Termite treatment cycles tracked',
                  'Mold remediation frequency monitored',
                  'Seasonal spend peaks in spring (hurricane prep)'
                ]
              }
            }}
          />
        )}

        <Tabs value={activeTab}>
          
          <TabsContent value="wins" className="mt-0">
            <WinsDashboard 
              tasks={completedTasks}
              metrics={metrics}
              aiInsights={aiInsights}
              generatingAI={generatingAI}
              onRegenerateAI={handleGenerateInsights}
            />
          </TabsContent>

          <TabsContent value="timeline" className="mt-0">
            <TimelineView 
              timelineItems={timelineItems}
              isLoading={false}
            />
          </TabsContent>

          <TabsContent value="photos" className="mt-0">
            <PhotoGallery 
              tasks={completedTasks}
              isLoading={false}
            />
          </TabsContent>

          <TabsContent value="insights" className="mt-0">
            <InsightsView 
              tasks={completedTasks}
              systems={systems}
              timelineItems={timelineItems}
              metrics={metrics}
              aiInsights={aiInsights}
              generatingAI={generatingAI}
              onRegenerateAI={handleGenerateInsights}
              isLoading={false}
            />
          </TabsContent>

        </Tabs>

        <DemoCTA />

      </div>
    </div>
  );
}