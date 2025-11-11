import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, DollarSign, Calendar, Clock, Edit, CheckCircle2, AlertCircle, Target, FileText } from "lucide-react";
import { calculateMemberDiscount } from "../shared/MemberDiscountCalculator";

export default function UpgradeProjectCard({ project, properties, memberDiscount, onEdit }) {
  const property = properties.find(p => p.id === project.property_id);
  
  const statusColors = {
    'Identified': 'bg-gray-100 text-gray-800',
    'Planned': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-orange-100 text-orange-800',
    'Completed': 'bg-green-100 text-green-800',
    'Deferred': 'bg-gray-100 text-gray-600'
  };

  const categoryColors = {
    'Energy Efficiency': 'bg-green-100 text-green-800',
    'Safety': 'bg-red-100 text-red-800',
    'Comfort': 'bg-blue-100 text-blue-800',
    'Property Value': 'bg-purple-100 text-purple-800',
    'Rental Appeal': 'bg-orange-100 text-orange-800'
  };

  const estimatedCost = project.actual_cost || project.investment_required || 0;
  
  // Use new discount calculation if memberDiscount is passed as string (tier name)
  const discountInfo = typeof memberDiscount === 'string' 
    ? calculateMemberDiscount(estimatedCost, memberDiscount)
    : null;
  const actualSavings = discountInfo?.actualSavings || (typeof memberDiscount === 'number' ? estimatedCost * memberDiscount : 0);
  const costWithDiscount = estimatedCost - actualSavings;
  
  const equityGain = project.property_value_impact || 0;
  const netCost = estimatedCost - equityGain;
  const roiPercent = estimatedCost > 0 ? ((equityGain / estimatedCost) * 100) : 0;

  const annualSavings = project.annual_savings || 0;
  const paybackMonths = project.roi_timeline_months || 0;

  const documentCount = project.quote_documents?.length || 0;

  return (
    <Card className="border-2 border-gray-200 mobile-card hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold" style={{ color: '#1B365D', fontSize: '20px' }}>
                {project.title}
              </h3>
              <Badge className={statusColors[project.status]}>
                {project.status}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={categoryColors[project.category]}>
                {project.category}
              </Badge>
              {property && (
                <Badge variant="outline" className="text-xs">
                  {property.address}
                </Badge>
              )}
            </div>

            {project.description && (
              <p className="text-gray-700 text-sm mb-3">
                {project.description}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <Edit className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        {/* Progress Bar for In Progress projects */}
        {project.status === 'In Progress' && project.completion_percentage > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold">Progress:</span>
              <span className="font-bold">{project.completion_percentage}%</span>
            </div>
            <Progress value={project.completion_percentage} className="h-3" />
          </div>
        )}

        {/* Financial Summary */}
        <div className="grid md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-gray-600">Investment</p>
            </div>
            <p className="font-bold" style={{ color: '#1B365D' }}>
              ${estimatedCost.toLocaleString()}
            </p>
            {actualSavings > 0 && project.status !== 'Completed' && (
              <p className="text-xs text-green-700">
                Save ${actualSavings.toLocaleString()}
                {discountInfo && ` (${discountInfo.percent}%)`}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-600">Equity Gain</p>
            </div>
            <p className="font-bold text-green-700">
              ${equityGain.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">
              {roiPercent.toFixed(0)}% ROI
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-purple-600" />
              <p className="text-xs text-gray-600">Net Cost</p>
            </div>
            <p className="font-bold" style={{ color: netCost > 0 ? '#1B365D' : '#28A745' }}>
              ${Math.abs(netCost).toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">
              {netCost > 0 ? 'True cost' : 'Net gain'}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-orange-600" />
              <p className="text-xs text-gray-600">
                {project.status === 'Completed' ? 'Completed' : 'Timeline'}
              </p>
            </div>
            {project.status === 'Completed' && project.completion_date ? (
              <p className="font-bold" style={{ color: '#1B365D' }}>
                {new Date(project.completion_date).toLocaleDateString()}
              </p>
            ) : project.planned_date ? (
              <p className="font-bold" style={{ color: '#1B365D' }}>
                {new Date(project.planned_date).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Not scheduled</p>
            )}
          </div>
        </div>

        {/* Energy Efficiency Specific Info */}
        {project.category === 'Energy Efficiency' && annualSavings > 0 && (
          <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="font-semibold text-green-900">Energy Savings</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Annual Savings</p>
                <p className="font-bold text-green-700">${annualSavings.toLocaleString()}/year</p>
              </div>
              {paybackMonths > 0 && (
                <div>
                  <p className="text-gray-600">Payback Period</p>
                  <p className="font-bold text-green-700">
                    {paybackMonths < 12 ? `${paybackMonths} months` : `${(paybackMonths / 12).toFixed(1)} years`}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current vs Upgraded State */}
        {project.current_state && project.upgraded_state && (
          <div className="mb-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-600 mb-1">Current State:</p>
                <p className="text-sm text-gray-800">{project.current_state}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-semibold text-blue-600 mb-1">After Upgrade:</p>
                <p className="text-sm text-blue-900">{project.upgraded_state}</p>
              </div>
            </div>
          </div>
        )}

        {/* Documents & Photos */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {documentCount > 0 && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {documentCount} Document{documentCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {project.before_photo_urls?.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {project.before_photo_urls.length} Before Photo{project.before_photo_urls.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {project.after_photo_urls?.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {project.after_photo_urls.length} After Photo{project.after_photo_urls.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {project.status !== 'Completed' && (
            <Button
              onClick={onEdit}
              variant="outline"
              style={{ minHeight: '48px' }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Project
            </Button>
          )}
          
          {project.status === 'Completed' && (
            <Button
              onClick={onEdit}
              variant="outline"
              style={{ minHeight: '48px' }}
            >
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}