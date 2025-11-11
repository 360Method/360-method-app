
import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Sparkles, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Plus,
  Bell,
  TrendingUp,
  Lightbulb,
  FileText,
  CalendarCheck
} from "lucide-react";
import { format, addMonths } from "date-fns";
import ServiceRequestDialog from "../services/ServiceRequestDialog";

// Regional cost multipliers based on climate zone
const REGIONAL_MULTIPLIERS = {
  "Pacific Northwest": 1.15, // Seattle, Portland - higher labor costs
  "Northeast": 1.20, // NYC, Boston - highest costs
  "Southeast": 0.90, // Atlanta, Charlotte - lower costs
  "Midwest": 0.85, // Chicago, Minneapolis - lowest costs
  "Southwest": 0.95, // Phoenix, Las Vegas - moderate
  "Mountain West": 1.00, // Denver, Salt Lake - baseline
};

// Base costs for common maintenance tasks (professional service, not DIY)
// These are national averages, adjusted by regional multiplier
const BASE_COST_RANGES = {
  "HVAC System": {
    "Filter replacement": { min: 25, max: 75 },
    "Annual tune-up": { min: 150, max: 300 },
    "Deep cleaning": { min: 200, max: 400 },
    "Refrigerant recharge": { min: 300, max: 600 },
    "Component replacement": { min: 400, max: 1200 },
    "Duct cleaning": { min: 400, max: 800 },
    "System replacement": { min: 5000, max: 15000 }
  },
  "Plumbing System": {
    "Anode rod replacement": { min: 200, max: 350 },
    "Tank flush": { min: 100, max: 200 },
    "Water heater replacement": { min: 1200, max: 3500 },
    "Leak repair": { min: 150, max: 500 },
    "Pipe replacement": { min: 500, max: 2000 },
    "Drain cleaning": { min: 150, max: 300 }
  },
  "Roof System": {
    "Inspection": { min: 150, max: 350 },
    "Moss treatment": { min: 300, max: 600 },
    "Minor repairs": { min: 400, max: 1000 },
    "Flashing repair": { min: 500, max: 1200 },
    "Partial replacement": { min: 3000, max: 8000 },
    "Full replacement": { min: 8000, max: 25000 }
  },
  "Electrical System": {
    "Outlet repair": { min: 100, max: 250 },
    "Panel inspection": { min: 150, max: 300 },
    "Circuit addition": { min: 400, max: 800 },
    "Panel upgrade": { min: 1500, max: 3500 },
    "Rewiring": { min: 3000, max: 10000 }
  },
  "Gutters & Downspouts": {
    "Cleaning": { min: 150, max: 350 },
    "Minor repairs": { min: 200, max: 500 },
    "Replacement": { min: 1000, max: 2500 }
  },
  "Windows & Doors": {
    "Seal repair": { min: 100, max: 300 },
    "Window replacement": { min: 400, max: 1200 },
    "Door replacement": { min: 600, max: 2000 }
  },
  "Foundation & Structure": {
    "Inspection": { min: 300, max: 600 },
    "Sealing": { min: 1500, max: 4000 },
    "Major repair": { min: 5000, max: 25000 }
  },
  "Safety Systems": {
    "Detector test": { min: 0, max: 50 },
    "Detector replacement": { min: 50, max: 150 },
    "Extinguisher replacement": { min: 40, max: 100 }
  },
  "General": {
    "Routine maintenance": { min: 100, max: 300 },
    "Minor repair": { min: 150, max: 500 },
    "Moderate repair": { min: 500, max: 1500 },
    "Major repair": { min: 1500, max: 5000 }
  }
};

const SYSTEM_LIFESPANS = {
  "HVAC System": 20,
  "Plumbing System": 12,
  "Roof System": 25,
  "Electrical System": 40,
  "Water & Sewer/Septic": 40,
  "Foundation & Structure": 100,
  "Windows & Doors": 25,
  "Gutters & Downspouts": 20,
  "Exterior Siding & Envelope": 30,
  "Attic & Insulation": 30,
  "Refrigerator": 13,
  "Range/Oven": 15,
  "Dishwasher": 10,
  "Washing Machine": 10,
  "Dryer": 13
};

// Helper function to get regional cost estimate
function getRegionalCost(systemType, taskKeywords, climateZone) {
  const multiplier = REGIONAL_MULTIPLIERS[climateZone] || 1.0;
  const systemCosts = BASE_COST_RANGES[systemType] || BASE_COST_RANGES["General"];
  
  // Find best matching cost range based on task keywords
  let bestMatch = systemCosts["Routine maintenance"] || { min: 100, max: 300 };
  
  for (const [key, range] of Object.entries(systemCosts)) {
    const keywords = key.toLowerCase().split(' ');
    const taskLower = taskKeywords.toLowerCase();
    
    // Check if any keyword matches
    if (keywords.some(keyword => taskLower.includes(keyword))) {
      bestMatch = range;
      break;
    }
  }
  
  const adjustedMin = Math.round(bestMatch.min * multiplier);
  const adjustedMax = Math.round(bestMatch.max * multiplier);
  
  return { min: adjustedMin, max: adjustedMax, midpoint: Math.round((adjustedMin + adjustedMax) / 2) };
}

// Calculate delayed cost based on priority and cascade risk
function calculateDelayedCost(currentCost, priority, systemType, taskCategory) {
  let multiplier = 1.5; // Default 50% increase
  
  // Higher multipliers for high-risk scenarios
  if (priority === "High") {
    multiplier = 3.5; // 3.5X for high priority
  } else if (priority === "Medium") {
    multiplier = 2.5; // 2.5X for medium priority
  } else if (priority === "Low") {
    multiplier = 1.5; // 1.5X for low priority
  } else if (priority === "Routine") {
    multiplier = 1.2; // 1.2X for routine
  }
  
  // Additional multipliers for cascade-prone systems
  const cascadeSystems = ["HVAC System", "Plumbing System", "Roof System", "Foundation & Structure"];
  if (cascadeSystems.includes(systemType)) {
    multiplier += 1.0; // Add 1X for cascade risk
  }
  
  // Replacement tasks have emergency premium
  if (taskCategory?.includes("replacement") || taskCategory?.includes("major")) {
    multiplier += 0.5; // Emergency replacement premium
  }
  
  const delayedMin = Math.round(currentCost.min * multiplier);
  const delayedMax = Math.round(currentCost.max * multiplier);
  
  return {
    min: delayedMin,
    max: delayedMax,
    midpoint: Math.round((delayedMin + delayedMax) / 2),
    multiplier: multiplier
  };
}

// Helper function to format cost range
function formatCostRange(min, max) {
  if (min === 0 && max <= 50) return "0-50";
  if (min < 200) return `${min}-${max}`;
  if (min < 1000) return `${min}-${max}`;
  if (min < 5000) return `${Math.round(min/100)*100}-${Math.round(max/100)*100}`;
  return `${Math.round(min/1000)}000-${Math.round(max/1000)}000`;
}

// Helper function to parse cost range and return midpoint
function parseCostRange(costRange) {
  if (!costRange) return 0;
  
  const cleaned = costRange.replace(/\$/g, '').replace(/\s/g, '');
  
  if (cleaned.toLowerCase() === 'free' || cleaned === '0') return 0;
  
  if (cleaned.includes('+')) {
    const base = parseInt(cleaned.replace('+', ''));
    return base * 2;
  }
  
  if (cleaned.includes('-')) {
    const [min, max] = cleaned.split('-').map(n => parseInt(n));
    if (!isNaN(min) && !isNaN(max)) {
      return Math.round((min + max) / 2);
    }
  }
  
  const singleNum = parseInt(cleaned);
  if (!isNaN(singleNum)) return singleNum;
  
  return 500;
}

export default function AIMaintenanceCalendar({ 
  propertyId, 
  property, 
  systems = [], 
  inspections = [],
  existingTasks = []
}) {
  const [aiSuggestions, setAiSuggestions] = React.useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = React.useState('6');
  const [expandedCard, setExpandedCard] = React.useState(null);
  const [showServiceDialog, setShowServiceDialog] = React.useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = React.useState(null);

  const queryClient = useQueryClient();

  // Fetch current user to check membership tier
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      return base44.entities.MaintenanceTask.create(taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
    },
  });

  const isMember = user && (
    user.subscription_tier?.includes('homecare') || 
    user.subscription_tier?.includes('propertycare')
  );

  // Generate AI-driven suggestions with regional pricing
  React.useEffect(() => {
    const generateSuggestions = async () => {
      if (!property || !systems || systems.length === 0) return;
      
      setLoadingSuggestions(true);
      try {
        const systemsContext = systems.map(sys => {
          const age = sys.installation_year ? new Date().getFullYear() - sys.installation_year : 'unknown';
          const lifespan = SYSTEM_LIFESPANS[sys.system_type] || 20;
          const percentLife = age !== 'unknown' ? Math.round((age / lifespan) * 100) : 'unknown';
          
          return {
            type: sys.system_type,
            nickname: sys.nickname,
            age: age,
            lifespan: lifespan,
            percentLife: percentLife,
            condition: sys.condition,
            lastService: sys.last_service_date,
            brand: sys.brand_model,
            warnings: sys.warning_signs_present || []
          };
        });

        const recentInspections = inspections
          .filter(i => i.status === 'Completed')
          .sort((a, b) => new Date(b.inspection_date || b.created_date) - new Date(a.inspection_date || a.created_date))
          .slice(0, 2);

        const inspectionContext = recentInspections.map(i => ({
          season: i.season,
          year: i.year,
          issuesFound: i.issues_found || 0,
          urgentCount: i.urgent_count || 0,
          flagCount: i.flag_count || 0
        }));

        const existingTaskTitles = existingTasks
          .filter(t => t.status !== 'Completed')
          .map(t => t.title.toLowerCase());

        const currentMonth = new Date().getMonth();
        const currentSeason = currentMonth >= 2 && currentMonth <= 4 ? 'Spring' :
                             currentMonth >= 5 && currentMonth <= 7 ? 'Summer' :
                             currentMonth >= 8 && currentMonth <= 10 ? 'Fall' : 'Winter';

        const climateZone = property.climate_zone || "Mountain West";
        const regionalMultiplier = REGIONAL_MULTIPLIERS[climateZone] || 1.0;

        const prompt = `You are an AI maintenance planner analyzing a property's systems and inspection history to generate proactive maintenance recommendations with accurate regional pricing.

PROPERTY: ${property.address}
CLIMATE ZONE: ${climateZone}
REGIONAL COST ADJUSTMENT: ${regionalMultiplier}x (${climateZone === "Pacific Northwest" ? "15% higher" : climateZone === "Northeast" ? "20% higher" : climateZone === "Southeast" ? "10% lower" : climateZone === "Midwest" ? "15% lower" : climateZone === "Southwest" ? "5% lower" : "baseline"} than national average)
CURRENT SEASON: ${currentSeason}

DOCUMENTED SYSTEMS (${systems.length}):
${systemsContext.map(s => `- ${s.type}${s.nickname ? ` (${s.nickname})` : ''}: ${s.age} years old (${s.percentLife}% of ${s.lifespan}-year lifespan), Condition: ${s.condition}, Last service: ${s.lastService || 'unknown'}${s.warnings.length > 0 ? `, Warnings: ${s.warnings.join('; ')}` : ''}`).join('\n')}

RECENT INSPECTIONS:
${inspectionContext.length > 0 ? inspectionContext.map(i => `- ${i.season} ${i.year}: ${i.issuesFound} issues found (${i.urgentCount} urgent, ${i.flagCount} flags)`).join('\n') : 'No recent inspections'}

EXISTING ACTIVE TASKS (avoid duplicates):
${existingTaskTitles.length > 0 ? existingTaskTitles.join(', ') : 'None'}

TASK: Generate proactive maintenance suggestions for the next ${selectedTimeframe} months.

For each suggestion:
- title: Clear, specific task name
- description: Why needed (2-3 sentences), what happens if skipped
- system_type: Match documented systems above
- priority: "High" | "Medium" | "Low" | "Routine"
- suggested_month: 0-${parseInt(selectedTimeframe) - 1} (0 = this month)
- task_category: One of: "filter_replacement", "tune_up", "deep_cleaning", "component_replacement", "inspection", "minor_repair", "major_repair", "replacement", "cleaning", "routine_maintenance"
- urgency_reason: Why do it at this time (1-2 sentences)
- consequences: What specific problems happen if skipped - be detailed about cascade failures, damage progression (2-3 sentences)

PRIORITIZATION:
- Systems 80%+ lifespan = "High", plan replacement
- Systems 60-79% lifespan = "Medium", preservation
- Recent inspection flags = "High"/"Medium"
- Seasonal maintenance = "Routine"
- Warning signs = "High"

Generate 6-10 suggestions. Be specific. Avoid duplicates with existing tasks. Focus on SPECIFIC consequences with dollar impacts.

Return JSON with "suggestions" array.`;

        const result = await base44.integrations.Core.InvokeLLM({
          prompt: prompt,
          response_json_schema: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    system_type: { type: "string" },
                    priority: { type: "string", enum: ["High", "Medium", "Low", "Routine"] },
                    suggested_month: { type: "number" },
                    task_category: { type: "string" },
                    urgency_reason: { type: "string" },
                    consequences: { type: "string" }
                  },
                  required: ["title", "description", "system_type", "priority", "suggested_month", "task_category"]
                }
              }
            },
            required: ["suggestions"]
          }
        });

        // Add regional cost estimates to each suggestion
        const suggestionsWithCosts = (result.suggestions || []).map(suggestion => {
          const costEstimate = getRegionalCost(
            suggestion.system_type,
            `${suggestion.title} ${suggestion.task_category}`,
            climateZone
          );

          const delayedCost = calculateDelayedCost(
            costEstimate,
            suggestion.priority,
            suggestion.system_type,
            suggestion.task_category
          );
          
          return {
            ...suggestion,
            estimated_cost_range: formatCostRange(costEstimate.min, costEstimate.max),
            cost_min: costEstimate.min,
            cost_max: costEstimate.max,
            cost_midpoint: costEstimate.midpoint,
            delayed_cost_min: delayedCost.min,
            delayed_cost_max: delayedCost.max,
            delayed_cost_midpoint: delayedCost.midpoint,
            cost_increase: delayedCost.midpoint - costEstimate.midpoint,
            cost_multiplier: delayedCost.multiplier
          };
        });

        setAiSuggestions(suggestionsWithCosts);
      } catch (error) {
        console.error('Failed to generate AI suggestions:', error);
        setAiSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    if (systems.length > 0 && !aiSuggestions) {
      generateSuggestions();
    }
  }, [systems, inspections, property, selectedTimeframe, aiSuggestions, existingTasks]);

  const handleAddToQueue = async (suggestion) => {
    const suggestedDate = addMonths(new Date(), suggestion.suggested_month || 0);
    
    const taskData = {
      property_id: propertyId,
      title: suggestion.title,
      description: `🤖 AI-Recommended\n\n${suggestion.description}\n\n⚠️ If Skipped: ${suggestion.consequences || 'May lead to more expensive repairs later'}\n\n💰 Cost Now: $${suggestion.estimated_cost_range}\n💰 Cost If Delayed: $${formatCostRange(suggestion.delayed_cost_min, suggestion.delayed_cost_max)} (${suggestion.cost_multiplier.toFixed(1)}X increase)\n\n⚠️ Note: Cost estimates are regional averages. Actual costs may vary based on property condition, scope of work, contractor rates, and unforeseen complications.`,
      system_type: suggestion.system_type,
      priority: suggestion.priority,
      status: 'Identified',
      scheduled_date: format(suggestedDate, 'yyyy-MM-dd'),
      execution_type: 'Not Decided',
      current_fix_cost: suggestion.cost_midpoint || parseCostRange(suggestion.estimated_cost_range),
      delayed_fix_cost: suggestion.delayed_cost_midpoint,
      has_cascade_alert: suggestion.cost_increase > 1000
    };

    await createTaskMutation.mutateAsync(taskData);
  };

  const handleRequestEstimate = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setShowServiceDialog(true);
  };

  const handleScheduleService = async (suggestion) => {
    // For members, add to queue AND create service request
    await handleAddToQueue(suggestion);
    setSelectedSuggestion(suggestion);
    setShowServiceDialog(true);
  };

  const handleScheduleAll = async () => {
    if (!aiSuggestions) return;
    
    const createPromises = aiSuggestions
      .filter(s => s.priority === 'High' || s.priority === 'Medium')
      .map(suggestion => {
        const suggestedDate = addMonths(new Date(), suggestion.suggested_month || 0);
        return {
          property_id: propertyId,
          title: suggestion.title,
          description: `🤖 AI-Recommended\n\n${suggestion.description}\n\n⚠️ If Skipped: ${suggestion.consequences || 'May lead to more expensive repairs later'}\n\n💰 Cost Now: $${suggestion.estimated_cost_range}\n💰 Cost If Delayed: $${formatCostRange(suggestion.delayed_cost_min, suggestion.delayed_cost_max)} (${suggestion.cost_multiplier.toFixed(1)}X increase)\n\n⚠️ Note: Cost estimates are regional averages. Actual costs may vary based on property condition, scope of work, contractor rates, and unforeseen complications.`,
          system_type: suggestion.system_type,
          priority: suggestion.priority,
          status: 'Identified',
          scheduled_date: format(suggestedDate, 'yyyy-MM-dd'),
          execution_type: 'Not Decided',
          current_fix_cost: suggestion.cost_midpoint || parseCostRange(suggestion.estimated_cost_range),
          delayed_fix_cost: suggestion.delayed_cost_midpoint,
          has_cascade_alert: suggestion.cost_increase > 1000
        };
      });

    for (const taskData of createPromises) {
      await createTaskMutation.mutateAsync(taskData);
    }
  };

  // Group suggestions by month
  const suggestionsByMonth = React.useMemo(() => {
    if (!aiSuggestions) return [];
    
    const months = [];
    for (let i = 0; i < parseInt(selectedTimeframe); i++) {
      const monthDate = addMonths(new Date(), i);
      const monthSuggestions = aiSuggestions.filter(s => s.suggested_month === i);
      
      if (monthSuggestions.length > 0) {
        months.push({
          date: monthDate,
          label: format(monthDate, 'MMMM yyyy'),
          suggestions: monthSuggestions
        });
      }
    }
    return months;
  }, [aiSuggestions, selectedTimeframe]);

  // Calculate stats
  const totalSuggestions = aiSuggestions?.length || 0;
  const highPriority = aiSuggestions?.filter(s => s.priority === 'High').length || 0;
  const estimatedCost = React.useMemo(() => {
    if (!aiSuggestions) return 0;
    return aiSuggestions.reduce((sum, s) => {
      return sum + (s.cost_midpoint || parseCostRange(s.estimated_cost_range));
    }, 0);
  }, [aiSuggestions]);

  if (!property || !systems || systems.length === 0) {
    return (
      <Card className="border-2 border-purple-300 bg-purple-50">
        <CardContent className="p-6 text-center">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 text-purple-600" />
          <h3 className="font-bold text-purple-900 mb-2">AI Maintenance Calendar</h3>
          <p className="text-sm text-gray-700 mb-4">
            Document your systems in Baseline to unlock AI-powered maintenance planning
          </p>
          <Button
            asChild
            variant="outline"
            className="border-purple-600 text-purple-700"
          >
            <a href="/pages/Baseline">Go to Baseline</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-2 border-purple-300 shadow-lg">
        <CardHeader className="bg-purple-50 pb-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                🤖 AI Maintenance Calendar
                {property.climate_zone && (
                  <Badge variant="outline" className="ml-2">
                    {property.climate_zone} Pricing
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600">
                Proactive maintenance with regional pricing for {property.climate_zone || "your area"}
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedTimeframe}
                onChange={(e) => {
                  setSelectedTimeframe(e.target.value);
                  setAiSuggestions(null);
                }}
                className="px-3 py-2 border border-purple-300 rounded-lg bg-white text-sm"
                style={{ minHeight: '44px' }}
              >
                <option value="3">Next 3 Months</option>
                <option value="6">Next 6 Months</option>
                <option value="12">Next 12 Months</option>
              </select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {loadingSuggestions ? (
            <div className="text-center py-12">
              <div className="animate-spin text-5xl mb-4">⚙️</div>
              <p className="font-medium text-gray-700 mb-2">AI analyzing your property...</p>
              <p className="text-sm text-gray-600">
                Reviewing {systems.length} systems, {inspections.length} inspections, and calculating {property.climate_zone} pricing
              </p>
            </div>
          ) : aiSuggestions && aiSuggestions.length > 0 ? (
            <>
              {/* Cost Disclaimer Banner */}
              <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900 mb-1">
                      💡 About Cost Estimates
                    </p>
                    <p className="text-xs text-yellow-800 leading-relaxed">
                      All cost estimates are AI-generated regional averages based on {property.climate_zone} market data. 
                      Actual costs may vary significantly based on property condition, scope of work, contractor rates, 
                      accessibility, materials required, and unforeseen complications. Get professional estimates for accurate pricing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Suggested Tasks</p>
                  <p className="text-2xl font-bold text-purple-900">{totalSuggestions}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-gray-600 mb-1">High Priority</p>
                  <p className="text-2xl font-bold text-red-700">{highPriority}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Est. Total Cost</p>
                  <p className="text-xl font-bold text-blue-700">${estimatedCost.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 mt-1">Avg. estimate</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 mb-6 flex-wrap">
                <Button
                  onClick={handleScheduleAll}
                  disabled={createTaskMutation.isPending}
                  className="gap-2"
                  style={{ backgroundColor: '#8B5CF6', minHeight: '48px' }}
                >
                  <CheckCircle className="w-4 h-4" />
                  Add All High/Medium to Queue
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAiSuggestions(null)}
                  className="gap-2"
                  style={{ minHeight: '48px' }}
                >
                  <Sparkles className="w-4 h-4" />
                  Regenerate Suggestions
                </Button>
              </div>

              {/* Timeline View */}
              <div className="space-y-6">
                {suggestionsByMonth.map((month, monthIdx) => (
                  <div key={monthIdx}>
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <h3 className="font-bold text-lg text-gray-900">{month.label}</h3>
                      <Badge variant="outline">{month.suggestions.length} tasks</Badge>
                    </div>

                    <div className="space-y-3 ml-0 md:ml-8">
                      {month.suggestions.map((suggestion, idx) => (
                        <Card
                          key={idx}
                          className={`border-2 transition-all ${
                            expandedCard === `${monthIdx}-${idx}` ? 'shadow-lg' : ''
                          } ${
                            suggestion.priority === 'High'
                              ? 'border-red-300 bg-red-50'
                              : suggestion.priority === 'Medium'
                              ? 'border-orange-300 bg-orange-50'
                              : suggestion.priority === 'Routine'
                              ? 'border-green-300 bg-green-50'
                              : 'border-blue-300 bg-blue-50'
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2 gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <Badge
                                    className={
                                      suggestion.priority === 'High'
                                        ? 'bg-red-600 text-white'
                                        : suggestion.priority === 'Medium'
                                        ? 'bg-orange-600 text-white'
                                        : suggestion.priority === 'Routine'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-blue-600 text-white'
                                    }
                                  >
                                    {suggestion.priority}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {suggestion.system_type}
                                  </Badge>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-1 break-words">
                                  {suggestion.title}
                                </h4>
                              </div>
                              <div className="flex flex-col gap-2 flex-shrink-0">
                                {isMember ? (
                                  <Button
                                    onClick={() => handleScheduleService(suggestion)}
                                    disabled={createTaskMutation.isPending}
                                    size="sm"
                                    className="gap-1 whitespace-nowrap"
                                    style={{ backgroundColor: '#28A745', minHeight: '44px' }}
                                  >
                                    <CalendarCheck className="w-4 h-4" />
                                    Schedule
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => handleRequestEstimate(suggestion)}
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 whitespace-nowrap"
                                    style={{ minHeight: '44px' }}
                                  >
                                    <FileText className="w-4 h-4" />
                                    Get Estimate
                                  </Button>
                                )}
                                <Button
                                  onClick={() => handleAddToQueue(suggestion)}
                                  disabled={createTaskMutation.isPending}
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 whitespace-nowrap"
                                  style={{ minHeight: '44px' }}
                                >
                                  <Plus className="w-4 h-4" />
                                  Add to Queue
                                </Button>
                              </div>
                            </div>

                            {expandedCard === `${monthIdx}-${idx}` ? (
                              <>
                                <p className="text-sm text-gray-700 mb-3">
                                  {suggestion.description}
                                </p>

                                {suggestion.urgency_reason && (
                                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                    <p className="text-xs font-semibold text-blue-900 mb-1">
                                      ⏰ Why Now:
                                    </p>
                                    <p className="text-xs text-gray-800">{suggestion.urgency_reason}</p>
                                  </div>
                                )}

                                {suggestion.consequences && (
                                  <div className="mb-3 p-3 bg-red-50 border-2 border-red-300 rounded">
                                    <p className="text-xs font-semibold text-red-900 mb-2 flex items-center gap-1">
                                      <AlertTriangle className="w-4 h-4" />
                                      ⚠️ If Skipped (6-12 months):
                                    </p>
                                    <p className="text-xs text-gray-800 mb-3">{suggestion.consequences}</p>
                                    
                                    <div className="bg-white p-3 rounded border border-red-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-gray-600">Fix Now:</span>
                                        <span className="font-bold text-green-700">${suggestion.estimated_cost_range}</span>
                                      </div>
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-gray-600">Fix Later:</span>
                                        <span className="font-bold text-red-700">${formatCostRange(suggestion.delayed_cost_min, suggestion.delayed_cost_max)}</span>
                                      </div>
                                      <div className="pt-2 border-t border-red-200 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-red-900">Cost Increase:</span>
                                        <span className="font-bold text-red-900">
                                          +${suggestion.cost_increase.toLocaleString()} ({Math.round((suggestion.cost_multiplier - 1) * 100)}% more)
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-600 mt-2 italic">
                                        * Estimates based on regional averages. Actual costs vary.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center gap-4 text-sm flex-wrap">
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4 text-gray-600" />
                                    <span className="font-medium">${suggestion.estimated_cost_range}</span>
                                    <span className="text-xs text-gray-500">
                                      ({property.climate_zone} avg)
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-gray-600" />
                                    <span>{format(addMonths(new Date(), suggestion.suggested_month), 'MMM d, yyyy')}</span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => setExpandedCard(null)}
                                  className="text-xs text-purple-600 mt-2 hover:underline"
                                >
                                  Show less
                                </button>
                              </>
                            ) : (
                              <>
                                <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                                  {suggestion.description}
                                </p>
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center gap-1 text-sm">
                                    <DollarSign className="w-4 h-4 text-gray-600" />
                                    <span className="font-medium">${suggestion.estimated_cost_range}</span>
                                    <span className="text-xs text-gray-500">(avg)</span>
                                    {suggestion.cost_increase > 500 && (
                                      <Badge className="ml-2 bg-red-100 text-red-800 text-xs">
                                        +${Math.round(suggestion.cost_increase/100)*100} if delayed
                                      </Badge>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => setExpandedCard(`${monthIdx}-${idx}`)}
                                    className="text-xs text-purple-600 hover:underline"
                                  >
                                    Show more
                                  </button>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium mb-2">No AI suggestions yet</p>
              <p className="text-sm">
                Complete baseline documentation and inspections to unlock proactive recommendations
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Request Dialog */}
      {selectedSuggestion && (
        <ServiceRequestDialog
          open={showServiceDialog}
          onClose={() => {
            setShowServiceDialog(false);
            setSelectedSuggestion(null);
          }}
          prefilledData={{
            property_id: propertyId,
            service_type: "AI Calendar Suggestion",
            description: `${selectedSuggestion.title}\n\n${selectedSuggestion.description}\n\nEstimated Cost Range: $${selectedSuggestion.estimated_cost_range}\n\nNote: This is an AI-generated estimate based on ${property.climate_zone} regional averages. Actual costs may vary based on property specifics, scope of work, and contractor rates.\n\nSuggested Timeline: ${format(addMonths(new Date(), selectedSuggestion.suggested_month || 0), 'MMMM yyyy')}`
          }}
        />
      )}
    </>
  );
}
