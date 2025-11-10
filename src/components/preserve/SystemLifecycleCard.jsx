import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export default function SystemLifecycleCard({ system }) {
  if (!system.installation_year) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{system.system_type}</h4>
              <p className="text-sm text-gray-600 mt-1">Installation year not recorded</p>
            </div>
            <Badge variant="outline">Unknown Age</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const age = new Date().getFullYear() - system.installation_year;
  const lifespan = system.estimated_lifespan_years || 20;
  const lifespanPercent = Math.min((age / lifespan) * 100, 100);
  const yearsRemaining = Math.max(lifespan - age, 0);

  let status = 'good';
  let statusColor = 'text-green-600';
  let statusBg = 'bg-green-100';
  let statusBorder = 'border-green-200';
  let Icon = CheckCircle2;

  if (lifespanPercent >= 100) {
    status = 'critical';
    statusColor = 'text-red-600';
    statusBg = 'bg-red-100';
    statusBorder = 'border-red-200';
    Icon = AlertTriangle;
  } else if (lifespanPercent >= 80) {
    status = 'warning';
    statusColor = 'text-orange-600';
    statusBg = 'bg-orange-100';
    statusBorder = 'border-orange-200';
    Icon = AlertTriangle;
  } else if (lifespanPercent >= 60) {
    status = 'monitor';
    statusColor = 'text-yellow-600';
    statusBg = 'bg-yellow-100';
    statusBorder = 'border-yellow-200';
    Icon = Clock;
  }

  return (
    <Card className={`border-2 ${statusBorder}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{system.system_type}</h4>
              {system.brand_model && (
                <p className="text-sm text-gray-600">{system.brand_model}</p>
              )}
            </div>
            <div className={`w-10 h-10 rounded-full ${statusBg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${statusColor}`} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600">Age</p>
              <p className="font-bold text-gray-900">{age} years</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Lifespan</p>
              <p className="font-bold text-gray-900">{lifespan} years</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Remaining</p>
              <p className={`font-bold ${statusColor}`}>
                {yearsRemaining} years
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Lifecycle Progress</span>
              <span className={`font-semibold ${statusColor}`}>{Math.round(lifespanPercent)}%</span>
            </div>
            <Progress 
              value={lifespanPercent} 
              className="h-2"
            />
          </div>

          {status === 'critical' && (
            <div className={`p-3 ${statusBg} border ${statusBorder} rounded`}>
              <p className={`text-sm ${statusColor} font-medium`}>
                ⚠️ Past typical lifespan - Start planning replacement
              </p>
              {system.replacement_cost_estimate && (
                <p className="text-sm text-gray-700 mt-1">
                  Estimated replacement: ${system.replacement_cost_estimate.toLocaleString()}
                </p>
              )}
            </div>
          )}

          {status === 'warning' && (
            <div className={`p-3 ${statusBg} border ${statusBorder} rounded`}>
              <p className={`text-sm ${statusColor} font-medium`}>
                Approaching end of lifespan - Budget for replacement
              </p>
              {system.replacement_cost_estimate && (
                <p className="text-sm text-gray-700 mt-1">
                  Estimated cost: ${system.replacement_cost_estimate.toLocaleString()}
                </p>
              )}
            </div>
          )}

          {system.warranty_info && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Warranty:</span> {system.warranty_info}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}