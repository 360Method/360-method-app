import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, Clock, TrendingUp } from "lucide-react";

export default function SystemHealthCard({ system }) {
  const age = system.installation_year 
    ? new Date().getFullYear() - system.installation_year 
    : null;
  
  const lifespan = system.estimated_lifespan_years;
  const lifespanPercent = age && lifespan ? Math.min((age / lifespan) * 100, 100) : null;
  const remainingYears = age && lifespan ? Math.max(lifespan - age, 0) : null;
  
  const getHealthStatus = () => {
    if (!lifespanPercent) return { color: 'bg-gray-300', text: 'Unknown', icon: Clock };
    if (lifespanPercent >= 100) return { color: 'bg-red-600', text: 'Replace Now', icon: AlertTriangle };
    if (lifespanPercent >= 80) return { color: 'bg-orange-600', text: 'Aging', icon: AlertTriangle };
    if (lifespanPercent >= 50) return { color: 'bg-yellow-500', text: 'Mid-Life', icon: Clock };
    return { color: 'bg-green-600', text: 'Good', icon: CheckCircle2 };
  };

  const health = getHealthStatus();
  const HealthIcon = health.icon;

  return (
    <Card className="border-2 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-gray-900">
              {system.nickname || system.system_type}
            </h4>
            {system.brand_model && (
              <p className="text-xs text-gray-600">{system.brand_model}</p>
            )}
          </div>
          <Badge className={`${health.color} text-white flex items-center gap-1`}>
            <HealthIcon className="w-3 h-3" />
            {health.text}
          </Badge>
        </div>

        {lifespanPercent !== null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Lifespan Progress</span>
              <span>{age} of {lifespan} years</span>
            </div>
            <Progress 
              value={lifespanPercent} 
              className={`h-2 ${
                lifespanPercent >= 80 ? 'bg-red-100' :
                lifespanPercent >= 50 ? 'bg-yellow-100' :
                'bg-green-100'
              }`}
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">
                {remainingYears > 0 ? `~${remainingYears} years remaining` : 'Replacement due'}
              </span>
              {system.replacement_cost_estimate && (
                <span className="font-semibold text-gray-900">
                  ${system.replacement_cost_estimate.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}

        {system.condition && system.condition !== 'Good' && (
          <div className="mt-3 pt-3 border-t">
            <Badge className={
              system.condition === 'Urgent' ? 'bg-red-600 text-white' :
              system.condition === 'Poor' ? 'bg-orange-600 text-white' :
              'bg-yellow-600 text-white'
            }>
              Condition: {system.condition}
            </Badge>
          </div>
        )}

        {system.warning_signs_present && system.warning_signs_present.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs font-semibold text-orange-900 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Warning Signs:
            </p>
            <ul className="text-xs text-gray-700 space-y-1">
              {system.warning_signs_present.slice(0, 2).map((sign, idx) => (
                <li key={idx}>• {sign.substring(0, 40)}...</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}