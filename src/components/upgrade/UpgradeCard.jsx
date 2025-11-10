import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Calendar, Edit, Lightbulb } from "lucide-react";

const CATEGORY_COLORS = {
  "Energy Efficiency": "bg-green-100 text-green-800",
  "Safety": "bg-red-100 text-red-800",
  "Comfort": "bg-blue-100 text-blue-800",
  "Property Value": "bg-purple-100 text-purple-800",
  "Rental Appeal": "bg-orange-100 text-orange-800"
};

const STATUS_COLORS = {
  "Identified": "bg-gray-100 text-gray-800",
  "Planned": "bg-blue-100 text-blue-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  "Completed": "bg-green-100 text-green-800",
  "Deferred": "bg-red-100 text-red-800"
};

const UPGRADE_IMPORTANCE = {
  "Energy Efficiency": "Reduces heating/cooling costs annually. In Pacific Northwest climate, proper insulation and efficient systems provide consistent savings. Payback through utility bill reduction, plus increased comfort and home value.",
  "Safety": "Protects family and increases insurability. Safety upgrades can reduce insurance premiums 5-20% and prevent catastrophic losses. Many buyers require modern safety features.",
  "Comfort": "Improves daily living quality and home enjoyment. Comfort upgrades increase tenant satisfaction in rentals and make homes more marketable. Quality of life improvements with financial benefits.",
  "Property Value": "Direct increase in resale value and marketability. These upgrades appeal to buyers and often return 70-100%+ of investment at sale. Make home competitive in market.",
  "Rental Appeal": "Increases rental income potential and tenant retention. Tenants pay premium for modern amenities. Reduces vacancy periods and attracts quality tenants."
};

export default function UpgradeCard({ upgrade, onEdit }) {
  const paybackMonths = upgrade.roi_timeline_months || 0;
  const paybackYears = (paybackMonths / 12).toFixed(1);

  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-xl">{upgrade.title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="text-gray-600 hover:text-gray-900"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Badge className={CATEGORY_COLORS[upgrade.category]}>
            {upgrade.category}
          </Badge>
          <Badge className={STATUS_COLORS[upgrade.status]}>
            {upgrade.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {upgrade.description && (
          <p className="text-sm text-gray-700">{upgrade.description}</p>
        )}

        {/* Why Upgrade Section */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-900 mb-2">💡 Why Upgrade:</h4>
              <p className="text-sm text-gray-800 leading-relaxed">
                {UPGRADE_IMPORTANCE[upgrade.category]}
              </p>
            </div>
          </div>
        </div>

        {(upgrade.current_state || upgrade.upgraded_state) && (
          <div className="grid md:grid-cols-2 gap-4">
            {upgrade.current_state && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Current:</p>
                <p className="text-sm font-medium text-gray-700">{upgrade.current_state}</p>
              </div>
            )}
            {upgrade.upgraded_state && (
              <div>
                <p className="text-xs text-gray-600 mb-1">After Upgrade:</p>
                <p className="text-sm font-medium text-green-700">{upgrade.upgraded_state}</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-xs text-gray-600">Investment</p>
              <p className="font-bold text-gray-900">
                ${(upgrade.investment_required || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Annual Savings</p>
              <p className="font-bold text-green-700">
                ${(upgrade.annual_savings || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {paybackMonths > 0 && upgrade.annual_savings > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Payback Period:</span>
              </div>
              <span className="text-lg font-bold text-purple-700">
                {paybackYears} years
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              ROI: {((upgrade.annual_savings / upgrade.investment_required) * 100).toFixed(1)}% per year
            </p>
          </div>
        )}

        {upgrade.property_value_impact > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Property Value Impact:</span>
            <span className="text-lg font-bold text-blue-700">
              +${upgrade.property_value_impact.toLocaleString()}
            </span>
          </div>
        )}

        {upgrade.status === 'Completed' && (
          <div className="space-y-3 pt-3 border-t">
            {upgrade.actual_cost && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Actual Cost:</span>
                <span className="font-semibold">${upgrade.actual_cost.toLocaleString()}</span>
              </div>
            )}
            {upgrade.completion_date && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed:</span>
                <span className="font-semibold">
                  {new Date(upgrade.completion_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}

        {(upgrade.before_photo_urls?.length > 0 || upgrade.after_photo_urls?.length > 0) && (
          <div className="grid grid-cols-2 gap-4 pt-3 border-t">
            {upgrade.before_photo_urls?.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-2">Before:</p>
                <img 
                  src={upgrade.before_photo_urls[0]} 
                  alt="Before" 
                  className="w-full h-32 object-cover rounded border"
                />
              </div>
            )}
            {upgrade.after_photo_urls?.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-2">After:</p>
                <img 
                  src={upgrade.after_photo_urls[0]} 
                  alt="After" 
                  className="w-full h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}