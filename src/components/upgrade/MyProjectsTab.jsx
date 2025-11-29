import React from 'react';
import { CheckCircle, Clock, Calendar, DollarSign, TrendingUp, AlertCircle, Trophy } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

// Stock images for project categories
const PROJECT_IMAGES = {
  'Energy Efficiency': 'https://images.unsplash.com/photo-1567789884554-0b844b597180?w=600&h=400&fit=crop', // Smart thermostat
  'Quality of Life': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop', // Modern kitchen
  'High ROI Renovations': 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop', // Home renovation
  'Rental Income Boosters': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop', // Apartment interior
  'Curb Appeal': 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600&h=400&fit=crop', // Landscaped yard
  'Health & Safety': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=400&fit=crop', // HVAC system
  default: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop' // Home improvement
};

// Specific images for common project titles
const TITLE_IMAGES = {
  'Smart Thermostat': 'https://images.unsplash.com/photo-1567789884554-0b844b597180?w=600&h=400&fit=crop', // Smart thermostat on wall
  'Attic Insulation': 'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=600&h=400&fit=crop', // Insulation work
  'LED Lighting': 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&h=400&fit=crop', // LED light bulbs
  'Kitchen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop', // Modern kitchen
  'Bathroom': 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop', // Modern bathroom
  'Outdoor': 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop', // Outdoor patio
  'Deck': 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop', // Deck patio
  'Water Heater': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=400&fit=crop', // Water heater
  'Solar': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop', // Solar panels
  'Smart Home': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=400&fit=crop', // Smart home devices
  'Window': 'https://images.unsplash.com/photo-1604079628040-94301bb21b91?w=600&h=400&fit=crop', // Window installation
  'HVAC': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=400&fit=crop', // HVAC system
  'Flooring': 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600&h=400&fit=crop', // Flooring installation
  'Landscaping': 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600&h=400&fit=crop', // Landscaping
  'Garage': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop', // Garage workshop
  'Roof': 'https://images.unsplash.com/photo-1632759145889-7b5b9c2e9d4a?w=600&h=400&fit=crop', // Roof work
  'Plumbing': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=400&fit=crop', // Plumbing work
  'Paint': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&h=400&fit=crop', // Painting walls
  'Electrical': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop', // Electrical work
  'Fence': 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600&h=400&fit=crop', // Fencing/yard
  'Washer': 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&h=400&fit=crop', // Laundry room
  'Dryer': 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&h=400&fit=crop', // Laundry room
  'Water Conservation': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop', // Irrigation
  'CO Detector': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop', // Smoke/CO detector
  'Smoke Detector': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop', // Smoke detector
  'Detector': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=400&fit=crop' // Safety detector
};

const getProjectImage = (project) => {
  // First try to match by title
  for (const [key, url] of Object.entries(TITLE_IMAGES)) {
    if (project.title?.toLowerCase().includes(key.toLowerCase())) {
      return url;
    }
  }
  // Then fall back to category
  return PROJECT_IMAGES[project.category] || PROJECT_IMAGES.default;
};

export default function MyProjectsTab({ projects, demoMode }) {
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
            ${projects.reduce((sum, p) => sum + (p.investment_required || p.budget || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-sm text-green-700 mb-1">Annual Savings</div>
          <div className="text-2xl font-bold text-green-900">
            ${projects.reduce((sum, p) => sum + (p.annual_savings || p.estimatedAnnualSavings || 0), 0).toLocaleString()}
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
  const budget = project.investment_required || project.budget || 0;
  const spent = project.actual_cost || project.spent || 0;
  const progressPercent = budget > 0 ? (spent / budget) * 100 : 0;
  const milestonesComplete = project.milestones?.filter(m => m.status === 'Completed').length || 0;
  const milestonesTotal = project.milestones?.length || 0;
  const annualSavings = project.annual_savings || project.estimatedAnnualSavings || 0;
  const valueIncrease = project.property_value_impact || project.resaleValueIncrease || 0;
  const payback = project.payback_period_years || project.paybackPeriod || 0;

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

  const projectImage = getProjectImage(project);

  return (
    <Card className={`border-2 hover:shadow-lg transition-all overflow-hidden ${
      project.category === 'Quality of Life' ? 'bg-purple-50/30' : ''
    }`}>
      {/* Project Image */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <img
          src={projectImage}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[project.status]} bg-white/90`}>
              {project.status}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[project.category]} bg-white/90`}>
              {project.category}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white drop-shadow-lg">{project.title}</h3>
        </div>
        {project.status === 'In Progress' && project.daysRemaining && (
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {project.daysRemaining} days left
          </div>
        )}
      </div>
      <CardContent className="p-6">

        {/* Budget & ROI */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-600 mb-1">Budget</div>
            <div className="text-lg font-bold text-gray-900">
              ${budget.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 mt-2">
              Spent: ${spent.toLocaleString()} ({progressPercent.toFixed(0)}%)
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </div>

          {annualSavings > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-xs text-green-700 mb-1">Annual Savings</div>
              <div className="text-lg font-bold text-green-900">
                ${annualSavings.toLocaleString()}
              </div>
              <div className="text-xs text-green-700 mt-2">
                Payback: {payback} years
              </div>
            </div>
          )}

          {valueIncrease > 0 && (
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-xs text-purple-700 mb-1">Resale Value</div>
              <div className="text-lg font-bold text-purple-900">
                +${valueIncrease.toLocaleString()}
              </div>
              <div className="text-xs text-purple-700 mt-2">
                ROI: {((valueIncrease / budget) * 100).toFixed(0)}%
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
              {project.milestones.map((milestone) => {
                const isCompleted = milestone.status === 'Completed' || milestone.status === 'completed';
                const isInProgress = milestone.status === 'In Progress' || milestone.status === 'in-progress';
                return (
                  <div key={milestone.id} className="flex items-center gap-3 text-sm">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : isInProgress ? (
                      <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                    <span className={isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}>
                      {milestone.title}
                    </span>
                    {isCompleted && milestone.completedDate && (
                      <span className="text-xs text-gray-500 ml-auto">
                        {new Date(milestone.completedDate).toLocaleDateString()}
                      </span>
                    )}
                    {!isCompleted && milestone.targetDate && (
                      <span className="text-xs text-gray-500 ml-auto">
                        Target: {new Date(milestone.targetDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                );
              })}
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