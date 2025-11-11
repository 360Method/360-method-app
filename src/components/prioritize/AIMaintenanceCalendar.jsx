
import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  Lightbulb
} from "lucide-react";
import { format, addMonths, differenceInMonths, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";

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

// Helper function to parse cost range and return midpoint
function parseCostRange(costRange) {
  if (!costRange) return 0;
  
  // Remove all dollar signs and spaces
  const cleaned = String(costRange).replace(/\$/g, '').replace(/\s/g, '');
  
  // Handle "free" or "0"
  if (cleaned.toLowerCase() === 'free' || cleaned === '0') return 0;
  
  // Handle "X+" format (e.g., "1500+")
  if (cleaned.includes('+')) {
    const base = parseInt(cleaned.replace('+', ''));
    return isNaN(base) ? 0 : base * 2; // Use 2X the base for "X+" ranges
  }
  
  // Handle "X-Y" format (e.g., "200-500")
  if (cleaned.includes('-')) {
    const [min, max] = cleaned.split('-').map(n => parseInt(n));
    if (!isNaN(min) && !isNaN(max)) {
      return Math.round((min + max) / 2);
    }
  }
  
  // Try to parse as single number
  const singleNum = parseInt(cleaned);
  if (!isNaN(singleNum)) return singleNum;
  
  // Default fallback if parsing fails
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

  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      return base44.entities.MaintenanceTask.create(taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
    },
  });

  // Generate AI-driven suggestions
  React.useEffect(() => {
    const generateSuggestions = async () => {
      if (!property || !systems || systems.length === 0) return;
      
      setLoadingSuggestions(true);
      try {
        // Build context about systems
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

        // Build context about recent inspections
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

        // Build context about existing tasks to avoid duplicates
        const existingTaskTitles = existingTasks
          .filter(t => t.status !== 'Completed')
          .map(t => t.title.toLowerCase());

        const currentMonth = new Date().getMonth();
        const currentSeason = currentMonth >= 2 && currentMonth <= 4 ? 'Spring' :
                             currentMonth >= 5 && currentMonth <= 7 ? 'Summer' :
                             currentMonth >= 8 && currentMonth <= 10 ? 'Fall' : 'Winter';

        const prompt = `You are an AI maintenance planner analyzing a property's systems and inspection history to generate proactive maintenance recommendations.

PROPERTY: ${property.address}
CLIMATE ZONE: ${property.climate_zone}
CURRENT SEASON: ${currentSeason}

DOCUMENTED SYSTEMS (${systems.length}):
${systemsContext.map(s => `- ${s.type}${s.nickname ? ` (${s.nickname})` : ''}: ${s.age} years old (${s.percentLife}% of ${s.lifespan}-year lifespan), Condition: ${s.condition}, Last service: ${s.lastService || 'unknown'}${s.warnings.length > 0 ? `, Warnings: ${s.warnings.join('; ')}` : ''}`).join('\n')}

RECENT INSPECTIONS:
${inspectionContext.length > 0 ? inspectionContext.map(i => `- ${i.season} ${i.year}: ${i.issuesFound} issues found (${i.urgentCount} urgent, ${i.flagCount} flags)`).join('\n') : 'No recent inspections'}

EXISTING ACTIVE TASKS (avoid duplicates):
${existingTaskTitles.length > 0 ? existingTaskTitles.join(', ') : 'None'}

TASK: Generate proactive maintenance suggestions for the next ${selectedTimeframe} months based on:
1. System age and approaching replacement timelines
2. Seasonal maintenance needs for ${currentSeason} and upcoming seasons
3. Condition ratings and warning signs
4. Last service dates
5. Climate zone requirements (${property.climate_zone})

For each suggestion, provide:
- title: Clear, specific task name
- description: Why it's needed (2-3 sentences), what happens if skipped
- system_type: Matching one from documented systems above
- priority: "High" | "Medium" | "Low" | "Routine"
- suggested_month: Number 0-${parseInt(selectedTimeframe) - 1} (0 = this month)
- estimated_cost_range: Use ONLY these formats: "0-50", "50-200", "200-500", "500-1000", "1000-2000", "2000-5000", "5000+" (NO dollar signs)
- urgency_reason: Why do it at this specific time (1-2 sentences)
- consequences: What happens if skipped for 6-12 months (1-2 sentences)

PRIORITIZATION GUIDELINES:
- Systems 80%+ of lifespan = "High" priority, plan replacement
- Systems 60-79% lifespan = "Medium" priority, preservation
- Recent inspection flags = "High" or "Medium" priority
- Seasonal maintenance = "Routine" priority
- Warning signs present = Upgrade to "High" priority

COST ESTIMATION GUIDELINES (professional service, not DIY):
- Filter changes, detector tests = "0-50"
- Minor repairs, tune-ups = "200-500"
- Component replacements, moderate repairs = "500-1000"
- Significant work, preservation services = "1000-2000"
- Major repairs, partial replacements = "2000-5000"
- Full system replacements = "5000+"

Generate 6-10 actionable suggestions. Be specific (use system nicknames/brands from baseline). Avoid suggesting tasks already in the active task list. Focus on preventing expensive failures.

CRITICAL: Use cost ranges WITHOUT dollar signs: "200-500" NOT "$200-500"

Return as JSON object with "suggestions" array.`;

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
                    estimated_cost_range: { type: "string" },
                    urgency_reason: { type: "string" },
                    consequences: { type: "string" }
                  },
                  required: ["title", "description", "system_type", "priority", "suggested_month"]
                }
              }
            },
            required: ["suggestions"]
          }
        });

        setAiSuggestions(result.suggestions || []);
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
      description: `🤖 AI-Recommended\n\n${suggestion.description}\n\n⚠️ If Skipped: ${suggestion.consequences || 'May lead to more expensive repairs later'}`,
      system_type: suggestion.system_type,
      priority: suggestion.priority,
      status: 'Identified',
      scheduled_date: format(suggestedDate, 'yyyy-MM-dd'),
      execution_type: 'Not Decided'
    };

    await createTaskMutation.mutateAsync(taskData);
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
          description: `🤖 AI-Recommended\n\n${suggestion.description}\n\n⚠️ If Skipped: ${suggestion.consequences || 'May lead to more expensive repairs later'}`,
          system_type: suggestion.system_type,
          priority: suggestion.priority,
          status: 'Identified',
          scheduled_date: format(suggestedDate, 'yyyy-MM-dd'),
          execution_type: 'Not Decided'
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

  // Calculate stats with improved cost parsing
  const totalSuggestions = aiSuggestions?.length || 0;
  const highPriority = aiSuggestions?.filter(s => s.priority === 'High').length || 0;
  const estimatedCost = React.useMemo(() => {
    if (!aiSuggestions) return 0;
    return aiSuggestions.reduce((sum, s) => {
      return sum + parseCostRange(s.estimated_cost_range);
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
    <Card className="border-2 border-purple-300 shadow-lg">
      <CardHeader className="bg-purple-50 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              🤖 AI Maintenance Calendar
            </CardTitle>
            <p className="text-sm text-gray-600">
              Proactive maintenance recommendations based on system age, condition, and inspection findings
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => {
                setSelectedTimeframe(e.target.value);
                setAiSuggestions(null); // Trigger regeneration
              }}
              className="px-3 py-2 border border-purple-300 rounded-lg bg-white text-sm"
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
              Reviewing {systems.length} systems, {inspections.length} inspections, and {existingTasks.length} active tasks
            </p>
          </div>
        ) : aiSuggestions && aiSuggestions.length > 0 ? (
          <>
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
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 mb-6">
              <Button
                onClick={handleScheduleAll}
                disabled={createTaskMutation.isPending}
                className="gap-2"
                style={{ backgroundColor: '#8B5CF6' }}
              >
                <CheckCircle className="w-4 h-4" />
                Add All High/Medium to Queue
              </Button>
              <Button
                variant="outline"
                onClick={() => setAiSuggestions(null)}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Regenerate Suggestions
              </Button>
            </div>

            {/* Timeline View */}
            <div className="space-y-6">
              {suggestionsByMonth.map((month, monthIdx) => (
                <div key={monthIdx}>
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-lg text-gray-900">{month.label}</h3>
                    <Badge variant="outline">{month.suggestions.length} tasks</Badge>
                  </div>

                  <div className="space-y-3 ml-8">
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
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
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
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {suggestion.title}
                              </h4>
                            </div>
                            <Button
                              onClick={() => handleAddToQueue(suggestion)}
                              disabled={createTaskMutation.isPending}
                              size="sm"
                              className="gap-1 ml-3"
                              style={{ backgroundColor: '#28A745' }}
                            >
                              <Plus className="w-4 h-4" />
                              Add
                            </Button>
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
                                <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded">
                                  <p className="text-xs font-semibold text-orange-900 mb-1">
                                    ⚠️ If Skipped:
                                  </p>
                                  <p className="text-xs text-gray-800">{suggestion.consequences}</p>
                                </div>
                              )}

                              <div className="flex items-center gap-4 text-sm flex-wrap">
                                {suggestion.estimated_cost_range && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4 text-gray-600" />
                                    <span className="font-medium">${suggestion.estimated_cost_range}</span>
                                  </div>
                                )}
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
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  {suggestion.estimated_cost_range && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="w-4 h-4" />
                                      <span className="font-medium">${suggestion.estimated_cost_range}</span>
                                    </div>
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
  );
}
