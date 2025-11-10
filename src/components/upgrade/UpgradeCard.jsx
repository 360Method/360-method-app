import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, Edit } from "lucide-react";

const CATEGORY_COLORS = {
  "Energy Efficiency": "bg-green-100 text-green-800 border-green-200",
  "Safety": "bg-red-100 text-red-800 border-red-200",
  "Comfort": "bg-blue-100 text-blue-800 border-blue-200",
  "Property Value": "bg-purple-100 text-purple-800 border-purple-200",
  "Rental Appeal": "bg-orange-100 text-orange-800 border-orange-200"
};

const STATUS_COLORS = {
  Identified: "bg-blue-100 text-blue-800",
  Planned: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-orange-100 text-orange-800",
  Completed: "bg-green-100 text-green-800",
  Deferred: "bg-gray-100 text-gray-800"
};

export default function UpgradeCard({ upgrade, onEdit }) {
  const roi = upgrade.roi_timeline_months 
    ? `${Math.round(upgrade.roi_timeline_months / 12)} years`
    : 'TBD';

  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${CATEGORY_COLORS[upgrade.category]} border`}>
                {upgrade.category}
              </Badge>
              <Badge className={STATUS_COLORS[upgrade.status]}>
                {upgrade.status}
              </Badge>
            </div>
            <h3 className="font-bold text-lg text-gray-900">{upgrade.title}</h3>
            {upgrade.description && (
              <p className="text-sm text-gray-600 mt-1">{upgrade.description}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        {/* Current vs Upgraded State */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 mb-1">Current State</p>
            <p className="text-sm font-medium text-gray-900">{upgrade.current_state || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">After Upgrade</p>
            <p className="text-sm font-medium text-green-700">{upgrade.upgraded_state || 'Not specified'}</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-600">Investment</p>
              <p className="font-semibold text-gray-900">
                ${(upgrade.investment_required || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-600">Annual Savings</p>
              <p className="font-semibold text-green-600">
                ${(upgrade.annual_savings || 0).toLocaleString()}/yr
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-600">ROI Timeline</p>
              <p className="font-semibold text-gray-900">{roi}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-600">Value Impact</p>
              <p className="font-semibold text-purple-600">
                +${(upgrade.property_value_impact || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* ROI Calculation */}
        {upgrade.annual_savings > 0 && upgrade.investment_required > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-900">
              <span className="font-semibold">Payback:</span> This upgrade will pay for itself in{' '}
              <span className="font-bold">{roi}</span> through energy/maintenance savings
            </p>
          </div>
        )}

        {/* Before/After Photos */}
        {(upgrade.before_photo_urls?.length > 0 || upgrade.after_photo_urls?.length > 0) && (
          <div className="grid grid-cols-2 gap-2">
            {upgrade.before_photo_urls?.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Before</p>
                <img 
                  src={upgrade.before_photo_urls[0]} 
                  alt="Before" 
                  className="w-full h-24 object-cover rounded border"
                />
              </div>
            )}
            {upgrade.after_photo_urls?.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-1">After</p>
                <img 
                  src={upgrade.after_photo_urls[0]} 
                  alt="After" 
                  className="w-full h-24 object-cover rounded border"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}