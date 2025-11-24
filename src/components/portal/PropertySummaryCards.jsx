import React from 'react';
import { AlertTriangle, DollarSign, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function PropertySummaryCards({ actionItems, budget, nextTask }) {
  const getTierCounts = () => {
    const counts = {
      urgent: actionItems.filter(t => t.tier === 'Safety/Urgent').length,
      preventive: actionItems.filter(t => t.tier === 'Preventive/ROI').length,
      comfort: actionItems.filter(t => t.tier === 'Comfort/Aesthetic').length
    };
    return counts;
  };

  const tierCounts = getTierCounts();
  const budgetUsedPercent = budget.annual > 0 ? (budget.spent / budget.annual) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Action Items Card */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{actionItems.length}</div>
            <div className="text-sm text-gray-500">Action Items</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Safety/Urgent</span>
            <span className="font-semibold text-red-600">{tierCounts.urgent}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Preventive/ROI</span>
            <span className="font-semibold text-yellow-600">{tierCounts.preventive}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Comfort/Aesthetic</span>
            <span className="font-semibold text-blue-600">{tierCounts.comfort}</span>
          </div>
        </div>
      </Card>

      {/* Budget Card */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              ${budget.spent.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Budget Status</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Annual Budget</span>
            <span className="font-semibold text-gray-900">
              ${budget.annual.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                budgetUsedPercent > 90 ? 'bg-red-500' : 
                budgetUsedPercent > 70 ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-right">
            {budgetUsedPercent.toFixed(0)}% used
          </div>
        </div>
      </Card>

      {/* Next Task Card */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {nextTask.daysUntil}
            </div>
            <div className="text-sm text-gray-500">Days Until</div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="font-semibold text-gray-900 line-clamp-2">
            {nextTask.title}
          </div>
          <div className="text-sm text-gray-500">
            {nextTask.type}
          </div>
          <div className="text-xs text-gray-400">
            {new Date(nextTask.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}