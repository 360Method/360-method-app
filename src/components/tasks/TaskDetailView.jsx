import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Wrench, Package, Video, FileText, Sparkles, ExternalLink } from "lucide-react";

export default function TaskDetailView({ task, onClose }) {
  const hasAIData = task.ai_enrichment_completed && (
    task.estimated_hours ||
    task.ai_sow ||
    (task.ai_tools_needed && task.ai_tools_needed.length > 0) ||
    (task.ai_materials_needed && task.ai_materials_needed.length > 0) ||
    (task.ai_video_tutorials && task.ai_video_tutorials.length > 0)
  );

  const formatTime = (hours) => {
    if (!hours || hours === 0) return null;
    
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minutes`;
    } else if (hours === 1) {
      return '1 hour';
    } else if (hours < 8) {
      return `${hours.toFixed(1)} hours`;
    } else {
      const days = Math.ceil(hours / 8);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{task.title}</span>
            <Badge className={
              task.priority === 'High' ? 'bg-red-600 text-white' :
              task.priority === 'Medium' ? 'bg-yellow-600 text-white' :
              'bg-blue-600 text-white'
            }>
              {task.priority}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
            <p className="text-sm text-gray-600">{task.description || 'No description provided'}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {task.system_type && (
              <Badge variant="outline">{task.system_type}</Badge>
            )}
            {task.status && (
              <Badge variant="outline">{task.status}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI-Generated Data */}
      {hasAIData && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI-Generated Task Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Time Estimate */}
            {task.estimated_hours && (
              <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Estimated Time</h3>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatTime(task.estimated_hours)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  For an average DIY homeowner with basic-to-intermediate skills
                </p>
              </div>
            )}

            {/* Statement of Work */}
            {task.ai_sow && (
              <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-gray-900">Statement of Work</h3>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {task.ai_sow.split('\n').map((line, idx) => (
                    <p key={idx} className="mb-2">{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Tools Needed */}
            {task.ai_tools_needed && task.ai_tools_needed.length > 0 && (
              <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="w-5 h-5 text-orange-600" />
                  <h3 className="font-bold text-gray-900">Tools Needed</h3>
                </div>
                <ul className="space-y-2">
                  {task.ai_tools_needed.map((tool, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-orange-600 font-bold mt-0.5">•</span>
                      <span>{tool}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Materials Needed */}
            {task.ai_materials_needed && task.ai_materials_needed.length > 0 && (
              <div className="bg-white rounded-lg p-4 border-2 border-indigo-200">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-gray-900">Materials Needed</h3>
                </div>
                <ul className="space-y-2">
                  {task.ai_materials_needed.map((material, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-indigo-600 font-bold mt-0.5">•</span>
                      <span>{material}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Video Tutorials */}
            {task.ai_video_tutorials && task.ai_video_tutorials.length > 0 && (
              <div className="bg-white rounded-lg p-4 border-2 border-red-200">
                <div className="flex items-center gap-2 mb-3">
                  <Video className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-gray-900">Video Tutorials</h3>
                </div>
                <div className="space-y-2">
                  {task.ai_video_tutorials.map((video, idx) => (
                    <a
                      key={idx}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {video.title}
                          </p>
                          <p className="text-xs text-gray-500">Watch on YouTube</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-red-600 flex-shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No AI Data Yet */}
      {!hasAIData && task.ai_enrichment_completed && (
        <Card className="border-2 border-gray-200">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">
              AI enrichment was attempted but no additional details were generated.
            </p>
          </CardContent>
        </Card>
      )}

      {!task.ai_enrichment_completed && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-pulse" />
            <p className="text-purple-900 font-semibold mb-2">
              AI enrichment in progress...
            </p>
            <p className="text-sm text-purple-700">
              Generating time estimates, tools list, and video tutorials for this task.
            </p>
          </CardContent>
        </Card>
      )}

      {onClose && (
        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      )}
    </div>
  );
}