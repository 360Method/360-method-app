import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upgrade } from '@/api/supabaseClient';
import { CheckCircle2, Circle, Clock, Camera, MessageSquare, ChevronDown, ChevronRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MilestonesView({ project, onUpdate }) {
  const [expandedMilestone, setExpandedMilestone] = useState(null);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => Upgrade.update(project.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upgrade', project.id] });
      onUpdate?.();
    },
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed': 
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'In Progress': 
        return <Clock className="w-6 h-6 text-yellow-600 animate-pulse" />;
      case 'Skipped':
        return <Circle className="w-6 h-6 text-gray-400 opacity-50" />;
      default: 
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const handleStatusChange = async (milestoneId, newStatus) => {
    const updatedMilestones = project.milestones.map(m => 
      m.id === milestoneId 
        ? { 
            ...m, 
            status: newStatus,
            completed_date: newStatus === 'Completed' ? new Date().toISOString() : null
          }
        : m
    );

    // Calculate new progress percentage
    const completedCount = updatedMilestones.filter(m => m.status === 'Completed').length;
    const totalCount = updatedMilestones.filter(m => m.status !== 'Skipped').length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Find current milestone (first non-completed)
    const currentMilestone = updatedMilestones.find(m => 
      m.status !== 'Completed' && m.status !== 'Skipped'
    )?.title || 'All Complete';

    // Determine overall project status
    let projectStatus = project.status;
    if (progressPercent === 100) {
      projectStatus = 'Completed';
    } else if (progressPercent > 0) {
      projectStatus = 'In Progress';
    }

    updateMutation.mutate({
      milestones: updatedMilestones,
      progress_percentage: progressPercent,
      current_milestone: currentMilestone,
      status: projectStatus
    });
  };

  const handleNotesChange = (milestoneId, notes) => {
    const updatedMilestones = project.milestones.map(m =>
      m.id === milestoneId ? { ...m, notes } : m
    );
    
    updateMutation.mutate({ milestones: updatedMilestones });
  };

  if (!project.milestones || project.milestones.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Circle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Milestones Yet
          </h3>
          <p className="text-gray-600 mb-4">
            This project doesn't have milestones configured. You can track progress by updating the project status.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {project.milestones.map((milestone, index) => {
        const isExpanded = expandedMilestone === milestone.id;
        
        return (
          <Card
            key={milestone.id}
            className={`transition-all ${
              milestone.status === 'Completed' 
                ? 'bg-green-50 border-2 border-green-300'
                : milestone.status === 'In Progress'
                ? 'bg-yellow-50 border-2 border-yellow-300'
                : milestone.status === 'Skipped'
                ? 'bg-gray-50 border border-gray-200 opacity-60'
                : 'bg-white border-2 border-gray-200'
            }`}
          >
            <CardContent className="p-6">
              {/* Milestone Header */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(milestone.status)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">
                        {index + 1}. {milestone.title}
                      </h4>
                      {milestone.completed_date && (
                        <p className="text-sm text-gray-600">
                          ✓ Completed {new Date(milestone.completed_date).toLocaleDateString()}
                        </p>
                      )}
                      {milestone.typical_duration_days && milestone.status !== 'Completed' && (
                        <p className="text-xs text-gray-500">
                          Typical duration: {milestone.typical_duration_days} day{milestone.typical_duration_days !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      style={{ minHeight: '44px', minWidth: '44px' }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>

                  <p className="text-gray-700 mb-4">{milestone.description}</p>

                  {/* AI Guidance - Always visible for active/upcoming milestones */}
                  {milestone.ai_guidance && milestone.status !== 'Completed' && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-blue-900 mb-1">
                            💡 Expert Guidance
                          </p>
                          <p className="text-sm text-blue-800 leading-relaxed">{milestone.ai_guidance}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Actions */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {milestone.status === 'Not Started' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(milestone.id, 'In Progress')}
                          className="bg-blue-600 hover:bg-blue-700"
                          style={{ minHeight: '44px' }}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Start This Step
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(milestone.id, 'Skipped')}
                          style={{ minHeight: '44px' }}
                        >
                          Skip
                        </Button>
                      </>
                    )}
                    
                    {milestone.status === 'In Progress' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusChange(milestone.id, 'Completed')}
                        style={{ minHeight: '44px' }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                    
                    {milestone.status === 'Completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(milestone.id, 'In Progress')}
                        style={{ minHeight: '44px' }}
                      >
                        Reopen
                      </Button>
                    )}

                    {milestone.status === 'Skipped' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(milestone.id, 'Not Started')}
                        style={{ minHeight: '44px' }}
                      >
                        Un-skip
                      </Button>
                    )}
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="pt-4 border-t space-y-4">
                      
                      {/* Photos */}
                      {milestone.photos && milestone.photos.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Photos</p>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {milestone.photos.map((photo, i) => (
                              <img
                                key={i}
                                src={photo}
                                alt={`${milestone.title} photo ${i + 1}`}
                                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add Photos Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        style={{ minHeight: '44px' }}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Add Photos (Coming Soon)
                      </Button>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Notes
                        </label>
                        <Textarea
                          placeholder="Add any notes about this milestone..."
                          value={milestone.notes || ''}
                          onChange={(e) => handleNotesChange(milestone.id, e.target.value)}
                          rows={3}
                          style={{ minHeight: '100px' }}
                        />
                      </div>

                      {/* AI Guidance (repeated if expanded) */}
                      {milestone.ai_guidance && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <p className="text-xs font-semibold text-purple-900 mb-2">
                            🤖 AI Guidance for This Step
                          </p>
                          <p className="text-sm text-purple-800">{milestone.ai_guidance}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Completion Status */}
      {project.progress_percentage === 100 && project.status === 'Completed' && (
        <Card className="border-2 border-green-400 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-900 mb-2">
              🎉 Project Complete!
            </h3>
            <p className="text-green-800">
              All milestones completed. Great work on finishing this upgrade!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}