import React from 'react';
import { CheckCircle, Clock, Calendar, DollarSign, TrendingUp, AlertCircle, Trophy } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

export default function MyProjectsTab({ projects }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No upgrade projects yet</p>
        <p className="text-sm text-gray-600 mb-6">Browse ideas to get started building value</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-sm text-blue-700 mb-1">Total Budget</div>
          <div className="text-2xl font-bold text-blue-900">
            ${projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-sm text-green-700 mb-1">Annual Savings</div>
          <div className="text-2xl font-bold text-green-900">
            ${projects.reduce((sum, p) => sum + (p.estimatedAnnualSavings || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="text-sm text-purple-700 mb-1">In Progress</div>
          <div className="text-2xl font-bold text-purple-900">
            {projects.filter(p => p.status === 'In Progress').length}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-sm text-gray-700 mb-1">Completed</div>
          <div className="text-2xl font-bold text-gray-900">
            {projects.filter(p => p.status === 'Completed').length}
          </div>
        </div>
      </div>

      {/* Project Cards */}
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

function ProjectCard({ project }) {
  const progressPercent = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
  const milestonesComplete = project.milestones?.filter(m => m.status === 'completed').length || 0;
  const milestonesTotal = project.milestones?.length || 0;

  const statusColors = {
    'Completed': 'bg-green-100 text-green-800 border-green-300',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
    'Planned': 'bg-gray-100 text-gray-800 border-gray-300'
  };

  const categoryColors = {
    'Energy Efficiency': 'bg-blue-50 text-blue-700 border-blue-300',
    'Quality of Life': 'bg-purple-50 text-purple-700 border-purple-300',
    'High ROI Renovations': 'bg-green-50 text-green-700 border-green-300'
  };

  return (
    <Card className={`border-2 hover:shadow-lg transition-all ${
      project.category === 'Quality of Life' ? 'bg-purple-50/30' : ''
    }`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[project.status]}`}>
                {project.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className={`px-2 py-1 rounded border ${categoryColors[project.category]}`}>
                {project.category}
              </span>
              {project.status === 'In Progress' && project.daysRemaining && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {project.daysRemaining} days left
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Budget & ROI */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-600 mb-1">Budget</div>
            <div className="text-lg font-bold text-gray-900">
              ${project.budget.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 mt-2">
              Spent: ${project.spent.toLocaleString()} ({progressPercent.toFixed(0)}%)
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </div>

          {project.estimatedAnnualSavings > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-xs text-green-700 mb-1">Annual Savings</div>
              <div className="text-lg font-bold text-green-900">
                ${project.estimatedAnnualSavings.toLocaleString()}
              </div>
              <div className="text-xs text-green-700 mt-2">
                Payback: {project.paybackPeriod} years
              </div>
            </div>
          )}

          {project.resaleValueIncrease && (
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-xs text-purple-700 mb-1">Resale Value</div>
              <div className="text-lg font-bold text-purple-900">
                +${project.resaleValueIncrease.toLocaleString()}
              </div>
              <div className="text-xs text-purple-700 mt-2">
                ROI: {project.roi}
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-xs text-blue-700 mb-1">Progress</div>
            <div className="text-lg font-bold text-blue-900">
              {milestonesComplete}/{milestonesTotal}
            </div>
            <div className="text-xs text-blue-700 mt-2">
              Milestones complete
            </div>
          </div>
        </div>

        {/* Milestones */}
        {project.milestones && project.milestones.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Milestones</h4>
            <div className="space-y-2">
              {project.milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center gap-3 text-sm">
                  {milestone.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : milestone.status === 'in-progress' ? (
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  )}
                  <span className={milestone.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}>
                    {milestone.title}
                  </span>
                  {milestone.status === 'completed' && milestone.completedDate && (
                    <span className="text-xs text-gray-500 ml-auto">
                      {new Date(milestone.completedDate).toLocaleDateString()}
                    </span>
                  )}
                  {milestone.status === 'pending' && milestone.targetDate && (
                    <span className="text-xs text-gray-500 ml-auto">
                      Target: {new Date(milestone.targetDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Impact Metrics */}
        {project.impactMetrics && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Impact Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {Object.entries(project.impactMetrics).map(([key, value]) => (
                <div key={key}>
                  <div className="text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </div>
                  <div className="font-semibold text-gray-900">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quality of Life - Special Treatment */}
        {project.category === 'Quality of Life' && project.why_worth_it && (
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-purple-900 mb-2">
              💜 The Joy Factor
            </p>
            <div className="text-sm text-purple-800 whitespace-pre-line leading-relaxed">
              {project.why_worth_it}
            </div>
          </div>
        )}

        {/* Notes */}
        {project.notes && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-700 italic">"{project.notes}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}