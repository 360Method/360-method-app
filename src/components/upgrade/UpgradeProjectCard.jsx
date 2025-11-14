import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, TrendingUp, FileText, 
  Image as ImageIcon, ArrowRight, Hammer, 
  Building2, HardHat, CircleHelp, CheckCircle2, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { calculateMemberDiscount } from '../shared/MemberDiscountCalculator';
import EditProjectButton from './EditProjectButton';

export default function UpgradeProjectCard({ 
  project, 
  properties, 
  memberDiscount, 
  onEdit 
}) {
  const property = properties?.find(p => p.id === project.property_id);
  
  const statusColors = {
    'Identified': 'bg-blue-100 text-blue-800',
    'Planned': 'bg-purple-100 text-purple-800',
    'In Progress': 'bg-orange-100 text-orange-800',
    'Completed': 'bg-green-100 text-green-800',
    'Deferred': 'bg-gray-100 text-gray-800'
  };

  const categoryColors = {
    'High ROI Renovations': 'bg-yellow-100 text-yellow-800',
    'Energy Efficiency': 'bg-green-100 text-green-800',
    'Rental Income Boosters': 'bg-purple-100 text-purple-800',
    'Preventive Replacements': 'bg-blue-100 text-blue-800',
    'Curb Appeal': 'bg-pink-100 text-pink-800',
    'Interior Updates': 'bg-indigo-100 text-indigo-800',
    'Safety': 'bg-red-100 text-red-800',
    'Comfort': 'bg-teal-100 text-teal-800',
    'Property Value': 'bg-emerald-100 text-emerald-800',
    'Rental Appeal': 'bg-fuchsia-100 text-fuchsia-800'
  };

  const managerIcons = {
    'DIY': Hammer,
    'Operator': Building2,
    'Contractor': HardHat,
    'TBD': CircleHelp
  };
  
  const ManagerIcon = managerIcons[project.project_manager] || CircleHelp;

  // Calculate investment (use actual if completed, else estimated)
  const investment = project.status === 'Completed' && project.final_investment
    ? project.final_investment
    : project.investment_required || 0;

  // Calculate value added (use final if completed, else estimated)
  const valueAdded = project.status === 'Completed' && project.final_value_added
    ? project.final_value_added
    : project.property_value_impact || 0;

  // Net impact
  const netImpact = valueAdded - investment;

  // Timeline
  const roiMonths = project.roi_timeline_months || 0;

  // Member discount if applicable
  const discount = memberDiscount 
    ? calculateMemberDiscount(investment, memberDiscount)
    : null;

  // Milestone progress
  const completedMilestones = project.milestones?.filter(m => 
    m.status === 'Completed'
  ).length || 0;
  const totalMilestones = project.milestones?.length || 0;

  // Photo counts
  const photoCount = (project.before_photo_urls?.length || 0) + 
                     (project.after_photo_urls?.length || 0) +
                     (project.photo_timeline?.reduce((sum, entry) => 
                       sum + (entry.photos?.length || 0), 0) || 0);

  // Document count
  const documentCount = project.quote_documents?.length || 0;

  return (
    <Card className="border-2 hover:border-blue-300 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold" style={{ color: '#1B365D' }}>
                {project.title}
              </h3>
              <ManagerIcon className="w-4 h-4 text-gray-500" title={project.project_manager} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusColors[project.status]}>
                {project.status}
              </Badge>
              <Badge className={categoryColors[project.category]} variant="outline">
                {project.category}
              </Badge>
              {property && (
                <span className="text-xs text-gray-600">
                  📍 {property.address}
                </span>
              )}
            </div>
            {project.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          
          {/* Quick Edit Button - CONSISTENT STYLE */}
          <EditProjectButton
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="flex-shrink-0"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        
        {/* Milestone Progress */}
        {totalMilestones > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">
                Progress: {completedMilestones} / {totalMilestones} milestones
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {project.progress_percentage || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${project.progress_percentage || 0}%` }}
              />
            </div>
            {project.current_milestone && (
              <p className="text-xs text-gray-600 mt-1">
                Current: {project.current_milestone}
              </p>
            )}
          </div>
        )}

        {/* Financial Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Investment</p>
            <p className="text-lg font-bold text-blue-700">
              ${investment.toLocaleString()}
            </p>
            {discount && discount.savingsAmount > 0 && (
              <p className="text-xs text-purple-600 font-semibold">
                Save ${discount.savingsAmount.toLocaleString()}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Value Added</p>
            <p className="text-lg font-bold text-green-700">
              +${valueAdded.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Net Equity</p>
            <p className={`text-lg font-bold ${
              netImpact >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {netImpact >= 0 ? '+' : ''}${netImpact.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Timeline</p>
            <p className="text-lg font-bold text-gray-900">
              {roiMonths > 0 ? `${Math.round(roiMonths / 12)}y` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Energy Savings (if applicable) */}
        {project.annual_savings > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-900">
                  ${project.annual_savings.toLocaleString()}/year savings
                </p>
                <p className="text-xs text-green-700">
                  Energy efficiency or maintenance reduction
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          {documentCount > 0 && (
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{documentCount} doc{documentCount !== 1 ? 's' : ''}</span>
            </div>
          )}
          {photoCount > 0 && (
            <div className="flex items-center gap-1">
              <ImageIcon className="w-4 h-4" />
              <span>{photoCount} photo{photoCount !== 1 ? 's' : ''}</span>
            </div>
          )}
          {totalMilestones > 0 && (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{totalMilestones} milestone{totalMilestones !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t">
          <Button
            asChild
            className="flex-1"
            style={{ minHeight: '44px' }}
          >
            <Link to={createPageUrl("UpgradeProjectDetail") + `?id=${project.id}`}>
              View Full Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}