import React from "react";
import { MaintenanceTask } from "@/api/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Wrench,
  Package,
  PlayCircle,
  ExternalLink,
  FileText,
  AlertCircle,
  Calendar
} from "lucide-react";
import { format, parseISO } from "date-fns";
import ReactMarkdown from "react-markdown";

const PRIORITY_COLORS = {
  High: 'bg-red-600',
  Medium: 'bg-yellow-600',
  Low: 'bg-blue-600',
  Routine: 'bg-gray-600'
};

export default function TaskExecutionCard({ task, property, onComplete, isOverdue }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = React.useState(false);

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => MaintenanceTask.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allMaintenanceTasks'] });
    }
  });

  const handleStartTask = () => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { status: 'In Progress' }
    });
  };

  const handleCompleteTask = () => {
    if (window.confirm(`Mark "${task.title}" as complete?`)) {
      onComplete(task);
    }
  };

  const hasAIEnrichment = task.ai_sow || task.ai_tools_needed?.length > 0 || task.ai_video_tutorials?.length > 0;
  const estimatedHours = task.estimated_hours || 0;
  const currentCost = task.current_fix_cost || 0;

  return (
    <Card className={`border-2 transition-all ${
      isOverdue 
        ? 'border-orange-400 bg-orange-50' 
        : task.status === 'In Progress'
        ? 'border-blue-400 bg-blue-50'
        : 'border-green-200 bg-white'
    }`}>
      <CardContent className="p-4">
        {/* Task Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-bold text-lg text-gray-900 break-words">
                {task.title}
              </h3>
              {isOverdue && (
                <Badge className="bg-orange-600 text-white gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Overdue
                </Badge>
              )}
              {task.status === 'In Progress' && (
                <Badge className="bg-blue-600 text-white gap-1">
                  <PlayCircle className="w-3 h-3" />
                  In Progress
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={PRIORITY_COLORS[task.priority]}>
                {task.priority}
              </Badge>
              {task.scheduled_date && (
                <Badge variant="outline" className="gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(parseISO(task.scheduled_date), 'MMM d')}
                </Badge>
              )}
              {estimatedHours > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {estimatedHours}h
                </Badge>
              )}
              {currentCost > 0 && (
                <Badge variant="outline" className="gap-1">
                  <DollarSign className="w-3 h-3" />
                  ${currentCost.toLocaleString()}
                </Badge>
              )}
              {property && (
                <Badge variant="outline" className="text-xs">
                  {property.address || property.street_address || 'Property'}
                </Badge>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0"
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-green-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-green-600" />
            )}
          </Button>
        </div>

        {/* Quick Description */}
        {task.description && !expanded && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Action Buttons - Always Visible */}
        <div className="flex flex-wrap gap-2">
          {task.status === 'Scheduled' && (
            <Button
              onClick={handleStartTask}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
              size="sm"
              style={{ minHeight: '44px' }}
            >
              <PlayCircle className="w-4 h-4" />
              Start Task
            </Button>
          )}
          <Button
            onClick={handleCompleteTask}
            className="bg-green-600 hover:bg-green-700 gap-2"
            size="sm"
            style={{ minHeight: '44px' }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark Complete
          </Button>
          {!expanded && hasAIEnrichment && (
            <Button
              onClick={() => setExpanded(true)}
              variant="outline"
              size="sm"
              className="border-green-600 text-green-600 hover:bg-green-50 gap-2"
              style={{ minHeight: '44px' }}
            >
              <FileText className="w-4 h-4" />
              View How-To Guide
            </Button>
          )}
        </div>

        {/* Expanded Details - The "How To Manual" */}
        {expanded && (
          <div className="mt-4 space-y-4 border-t border-green-200 pt-4">
            {/* Full Description */}
            {task.description && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-green-600" />
                  Task Description:
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
              </div>
            )}

            {/* AI Scope of Work */}
            {task.ai_sow && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <p className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  AI-Generated Scope of Work:
                </p>
                <div className="text-sm text-gray-800 prose prose-sm max-w-none">
                  <ReactMarkdown>{task.ai_sow}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Time & Cost Summary */}
            <div className="grid md:grid-cols-2 gap-3">
              {estimatedHours > 0 && (
                <div className="bg-purple-50 border border-purple-300 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-900">Estimated Time</span>
                  </div>
                  <p className="text-xl font-bold text-purple-700">
                    {estimatedHours} hour{estimatedHours !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
              {currentCost > 0 && (
                <div className="bg-green-50 border border-green-300 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-900">Estimated Cost</span>
                  </div>
                  <p className="text-xl font-bold text-green-700">
                    ${currentCost.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Tools Needed */}
            {task.ai_tools_needed && task.ai_tools_needed.length > 0 && (
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                <p className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Tools Required:
                </p>
                <ul className="space-y-1">
                  {task.ai_tools_needed.map((tool, idx) => (
                    <li key={idx} className="text-sm text-gray-800 flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{tool}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Materials Needed */}
            {task.ai_materials_needed && task.ai_materials_needed.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                <p className="text-sm font-bold text-yellow-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Materials to Purchase:
                </p>
                <ul className="space-y-1">
                  {task.ai_materials_needed.map((material, idx) => (
                    <li key={idx} className="text-sm text-gray-800 flex items-start gap-2">
                      <span className="text-yellow-600 mt-0.5">•</span>
                      <span>{material}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Video Tutorials */}
            {task.ai_video_tutorials && task.ai_video_tutorials.length > 0 && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                <p className="text-sm font-bold text-red-900 mb-3 flex items-center gap-2">
                  <PlayCircle className="w-4 h-4" />
                  Watch-Along Video Tutorials:
                </p>
                <div className="space-y-2">
                  {task.ai_video_tutorials.map((video, idx) => (
                    <a
                      key={idx}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 p-2 bg-white rounded border border-red-200 hover:border-red-400 hover:bg-red-50 transition-colors"
                    >
                      <PlayCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-red-900 break-words">
                          {video.title}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-red-600 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Cascade Risk Warning */}
            {task.cascade_risk_reason && (task.cascade_risk_score || 0) >= 7 && (
              <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-bold text-orange-900">⚠️ High Cascade Risk - Complete Soon!</span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">{task.cascade_risk_reason}</p>
              </div>
            )}

            {/* Photos */}
            {task.photo_urls && task.photo_urls.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Reference Photos:</p>
                <div className="grid grid-cols-3 gap-2">
                  {task.photo_urls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Task photo ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No AI Enrichment Warning */}
            {!hasAIEnrichment && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                <p className="text-xs text-yellow-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    <strong>Note:</strong> This task doesn't have AI-generated instructions yet. 
                    Consider editing it in the Prioritize tab to add details and generate a complete how-to guide.
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}