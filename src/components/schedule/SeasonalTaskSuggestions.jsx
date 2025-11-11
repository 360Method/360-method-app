import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, DollarSign, Plus, CheckCircle2, BookOpen, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const SEASON_ICONS = {
  Spring: "🌸",
  Summer: "☀️",
  Fall: "🍂",
  Winter: "❄️",
  "Year-Round": "📅"
};

const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
};

export default function SeasonalTaskSuggestions({ propertyId, property, compact = false }) {
  const [dismissed, setDismissed] = React.useState(false);
  
  const queryClient = useQueryClient();
  const currentSeason = getCurrentSeason();

  const { data: templates = [] } = useQuery({
    queryKey: ['maintenance-templates', currentSeason, property?.climate_zone],
    queryFn: async () => {
      if (!property) return [];
      
      // Fetch templates matching current season and property climate
      const allTemplates = await base44.entities.MaintenanceTemplate.list('sort_order');
      
      return allTemplates.filter(t => 
        (t.season === currentSeason || t.season === "Year-Round") &&
        (t.climate_zone === property.climate_zone || t.climate_zone === "All Climates")
      );
    },
    enabled: !!property && !dismissed,
  });

  const { data: existingTasks = [] } = useQuery({
    queryKey: ['maintenanceTasks', propertyId],
    queryFn: () => propertyId 
      ? base44.entities.MaintenanceTask.filter({ property_id: propertyId })
      : Promise.resolve([]),
    enabled: !!propertyId,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      return base44.entities.MaintenanceTask.create(taskData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      
      // Update template usage count
      if (variables.template_origin_id) {
        const template = templates.find(t => t.id === variables.template_origin_id);
        if (template) {
          base44.entities.MaintenanceTemplate.update(variables.template_origin_id, {
            usage_count: (template.usage_count || 0) + 1
          });
        }
      }
    },
  });

  const handleAddTemplate = async (template) => {
    const taskData = {
      property_id: propertyId,
      title: template.title,
      description: template.description,
      system_type: template.system_type,
      priority: template.priority,
      status: "Identified",
      execution_type: template.is_diy_friendly ? "DIY" : "Not Decided",
      template_origin_id: template.id
    };

    createTaskMutation.mutate(taskData);
  };

  // Filter out templates that have already been converted to tasks
  // Check if any existing MaintenanceTask has a template_origin_id matching this template's id
  const availableTemplates = templates.filter(template => {
    // Check if any existing task was created from this template
    const taskFromTemplate = existingTasks.find(task => 
      task.template_origin_id === template.id
    );
    
    // Only show template if no task exists from it
    return !taskFromTemplate;
  });

  if (dismissed || !property || availableTemplates.length === 0) {
    return null;
  }

  // Featured templates (top 3-4 for the season)
  const featuredTemplates = availableTemplates
    .filter(t => t.featured)
    .slice(0, compact ? 2 : 4);
  
  const displayTemplates = featuredTemplates.length > 0 
    ? featuredTemplates 
    : availableTemplates.slice(0, compact ? 2 : 4);

  // Calculate remaining templates count
  const remainingCount = availableTemplates.length - displayTemplates.length;

  if (compact) {
    return (
      <Card className="border-2 border-green-300 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              <h4 className="font-bold text-green-900">
                {SEASON_ICONS[currentSeason]} {currentSeason} Tasks
              </h4>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-green-700 hover:text-green-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-green-800 mb-3">
            {availableTemplates.length} seasonal maintenance recommendation{availableTemplates.length !== 1 ? 's' : ''}
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full border-green-600 text-green-700"
          >
            <Link to={createPageUrl("Schedule") + `?property=${propertyId}`}>
              View Seasonal Tasks
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-green-300 shadow-lg">
      <CardHeader className="bg-green-50 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D', fontSize: '20px' }}>
            <Sparkles className="w-6 h-6 text-green-600" />
            {SEASON_ICONS[currentSeason]} {currentSeason} Maintenance Checklist
          </CardTitle>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-800">
            <strong>🎯 Smart Suggestions:</strong> These tasks are recommended for {currentSeason.toLowerCase()} in the <strong>{property.climate_zone}</strong> region. 
            Complete them to prevent seasonal damage and maintain peak performance.
          </p>
        </div>

        <div className="space-y-4">
          {displayTemplates.map((template) => {
            // Check if this template has been converted to a task
            const convertedTask = existingTasks.find(task => task.template_origin_id === template.id);
            const isConverted = !!convertedTask;
            
            return (
              <div
                key={template.id}
                className={`p-4 border-2 rounded-lg transition-all ${
                  isConverted 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-gray-900">{template.title}</h4>
                      <Badge
                        className={
                          template.priority === 'High'
                            ? 'bg-red-600 text-white'
                            : template.priority === 'Medium'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-blue-600 text-white'
                        }
                      >
                        {template.priority}
                      </Badge>
                      {template.is_diy_friendly && (
                        <Badge variant="outline" className="text-xs">
                          DIY Friendly
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">
                      {template.description}
                    </p>

                    {template.why_important && (
                      <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded">
                        <p className="text-xs font-semibold text-orange-900 mb-1">
                          💡 Why This Matters:
                        </p>
                        <p className="text-xs text-orange-800">
                          {template.why_important}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      {template.estimated_time_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {template.estimated_time_minutes < 60 
                            ? `${template.estimated_time_minutes} min`
                            : `${Math.round(template.estimated_time_minutes / 60)}h`
                          }
                        </div>
                      )}
                      {template.estimated_cost_range && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {template.estimated_cost_range}
                        </div>
                      )}
                      {template.system_type && (
                        <Badge variant="outline" className="text-xs">
                          {template.system_type}
                        </Badge>
                      )}
                    </div>

                    {template.tools_needed && template.tools_needed.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          Tools needed:
                        </p>
                        <p className="text-xs text-gray-600">
                          {template.tools_needed.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  {isConverted ? (
                    <div className="flex-1">
                      <Button
                        disabled
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-green-100 border-green-400 w-full"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        In Your Task List
                      </Button>
                      {convertedTask && (
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Status: <span className="font-semibold">{convertedTask.status}</span>
                          {convertedTask.scheduled_date && (
                            <> • Scheduled: {new Date(convertedTask.scheduled_date).toLocaleDateString()}</>
                          )}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleAddTemplate(template)}
                      disabled={createTaskMutation.isPending}
                      size="sm"
                      className="gap-2"
                      style={{ backgroundColor: '#28A745' }}
                    >
                      <Plus className="w-4 h-4" />
                      Add to My Tasks
                    </Button>
                  )}
                  
                  {template.resource_guide_id && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Link to={createPageUrl("GuideDetail") + `?id=${template.resource_guide_id}`}>
                        <BookOpen className="w-4 h-4" />
                        How-To Guide
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {remainingCount > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-700 mb-2">
              <strong>{remainingCount}</strong> more {currentSeason.toLowerCase()} task{remainingCount !== 1 ? 's' : ''} available
            </p>
            <p className="text-xs text-gray-600">
              Add these first, then we'll show you more seasonal recommendations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}