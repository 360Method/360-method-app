import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, Clock, DollarSign, Lightbulb } from "lucide-react";

export default function SystemLifecycleCard({ system }) {
  if (!system.installation_year || !system.estimated_lifespan_years) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{system.system_type}</h3>
              <p className="text-sm text-gray-600">Installation year unknown</p>
            </div>
            <Badge variant="outline">Unknown Age</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentYear = new Date().getFullYear();
  const age = currentYear - system.installation_year;
  const yearsRemaining = Math.max(0, system.estimated_lifespan_years - age);
  const lifecycleProgress = (age / system.estimated_lifespan_years) * 100;

  let status = 'good';
  let statusColor = 'green';
  let statusIcon = CheckCircle2;
  let statusMessage = 'System is in good condition';

  if (lifecycleProgress >= 100) {
    status = 'critical';
    statusColor = 'red';
    statusIcon = AlertTriangle;
    statusMessage = 'System has exceeded expected lifespan - plan replacement immediately';
  } else if (lifecycleProgress >= 80) {
    status = 'warning';
    statusColor = 'orange';
    statusIcon = Clock;
    statusMessage = 'System is approaching end of life - budget for replacement soon';
  }

  const StatusIcon = statusIcon;

  return (
    <Card className={`border-2 ${status === 'critical' ? 'border-red-300 bg-red-50' : status === 'warning' ? 'border-orange-300 bg-orange-50' : 'border-green-200'}`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              {system.nickname || system.system_type}
            </h3>
            {system.brand_model && (
              <p className="text-sm text-gray-600">{system.brand_model}</p>
            )}
          </div>
          <Badge 
            className={
              status === 'critical' ? 'bg-red-600 text-white' :
              status === 'warning' ? 'bg-orange-600 text-white' :
              'bg-green-600 text-white'
            }
          >
            {status === 'critical' ? 'CRITICAL' : status === 'warning' ? 'WARNING' : 'GOOD'}
          </Badge>
        </div>

        {/* Why This Matters Section */}
        {status !== 'good' && (
          <div className={`border-2 rounded-lg p-4 ${
            status === 'critical' ? 'bg-red-100 border-red-300' : 'bg-orange-100 border-orange-300'
          }`}>
            <div className="flex items-start gap-3">
              <Lightbulb className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                status === 'critical' ? 'text-red-700' : 'text-orange-700'
              }`} />
              <div>
                <h4 className={`font-bold mb-2 ${
                  status === 'critical' ? 'text-red-900' : 'text-orange-900'
                }`}>
                  📊 Why This Matters:
                </h4>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {system.system_type === "HVAC System" && 
                    "HVAC failures during peak seasons mean 2+ week waits for service at premium prices. Failed systems in summer heat or winter cold mean no availability and 3X normal costs. Planning replacement now prevents emergency disaster."}
                  {system.system_type === "Plumbing System" && 
                    "Water heaters fail suddenly without warning. When they fail, 40-80 gallons flood your home causing $8,000+ damage. Planning replacement now prevents emergency disaster and gets you better pricing with time to research options."}
                  {system.system_type === "Roof System" && 
                    "Roofs that exceed their lifespan develop leaks that rot decking, damage interior, and create mold. Small leaks escalate into $20,000-40,000 disasters. Planning replacement now prevents emergency repairs at premium pricing."}
                  {!["HVAC System", "Plumbing System", "Roof System"].includes(system.system_type) && 
                    `This system has exceeded or is approaching its expected lifespan. Planning replacement now prevents emergency failures at premium pricing and allows time to research best options.`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Age</p>
            <p className="text-xl font-bold text-gray-900">{age} years</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Expected Life</p>
            <p className="text-xl font-bold text-gray-900">{system.estimated_lifespan_years} years</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Years Left</p>
            <p className={`text-xl font-bold ${
              yearsRemaining === 0 ? 'text-red-700' : yearsRemaining < 3 ? 'text-orange-700' : 'text-green-700'
            }`}>
              {yearsRemaining}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Lifecycle Status</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(lifecycleProgress)}%</span>
          </div>
          <Progress 
            value={Math.min(lifecycleProgress, 100)} 
            className={`h-3 ${
              status === 'critical' ? '[&>div]:bg-red-600' :
              status === 'warning' ? '[&>div]:bg-orange-600' :
              '[&>div]:bg-green-600'
            }`}
          />
        </div>

        {status !== 'good' && (
          <div className={`flex items-start gap-3 p-3 rounded-lg border ${
            status === 'critical' ? 'bg-red-100 border-red-300' : 'bg-orange-100 border-orange-300'
          }`}>
            <StatusIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              status === 'critical' ? 'text-red-700' : 'text-orange-700'
            }`} />
            <p className={`text-sm font-medium ${
              status === 'critical' ? 'text-red-900' : 'text-orange-900'
            }`}>
              {statusMessage}
            </p>
          </div>
        )}

        {system.replacement_cost_estimate && status !== 'good' && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Estimated Replacement Cost:</span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              ${system.replacement_cost_estimate.toLocaleString()}
            </span>
          </div>
        )}

        {system.warranty_info && (
          <div className="text-sm text-gray-600 border-t pt-3">
            <strong>Warranty:</strong> {system.warranty_info}
          </div>
        )}
      </CardContent>
    </Card>
  );
}