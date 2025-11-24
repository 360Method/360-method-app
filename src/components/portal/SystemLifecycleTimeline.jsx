import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function SystemLifecycleTimeline({ systems }) {
  const calculateLifePercentage = (system) => {
    if (!system.installation_year || !system.estimated_lifespan_years) return 0;
    const currentYear = new Date().getFullYear();
    const age = currentYear - system.installation_year;
    return Math.min((age / system.estimated_lifespan_years) * 100, 100);
  };

  const getSystemStatus = (percentage) => {
    if (percentage >= 90) return { status: 'Critical', color: 'red', icon: AlertTriangle };
    if (percentage >= 70) return { status: 'Monitor', color: 'yellow', icon: Clock };
    return { status: 'Good', color: 'green', icon: CheckCircle };
  };

  return (
    <div className="space-y-4">
      {systems.map(system => {
        const lifePercentage = calculateLifePercentage(system);
        const statusInfo = getSystemStatus(lifePercentage);
        const StatusIcon = statusInfo.icon;
        const currentYear = new Date().getFullYear();
        const age = system.installation_year ? currentYear - system.installation_year : 0;
        const remainingYears = system.estimated_lifespan_years 
          ? Math.max(0, system.estimated_lifespan_years - age)
          : 0;

        return (
          <Card key={system.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">
                    {system.system_type}
                    {system.nickname && <span className="text-gray-500 ml-2">({system.nickname})</span>}
                  </div>
                  <div className="text-sm text-gray-600">
                    Installed: {system.installation_year || 'Unknown'} 
                    {age > 0 && ` • Age: ${age} years`}
                  </div>
                </div>
                <Badge className={`${
                  statusInfo.color === 'red' ? 'bg-red-100 text-red-700' :
                  statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                } gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusInfo.status}
                </Badge>
              </div>

              {/* Lifecycle Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>New</span>
                  <span>
                    {remainingYears > 0 
                      ? `${remainingYears} years remaining`
                      : 'Replacement due'
                    }
                  </span>
                  <span>End of Life</span>
                </div>
                <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      statusInfo.color === 'red' ? 'bg-red-500' :
                      statusInfo.color === 'yellow' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${lifePercentage}%` }}
                  />
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Expected Life:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {system.estimated_lifespan_years || 'Unknown'} years
                  </span>
                </div>
                {system.replacement_cost_estimate && (
                  <div>
                    <span className="text-gray-600">Replacement Cost:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      ${system.replacement_cost_estimate.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {system.last_service_date && (
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  Last serviced: {new Date(system.last_service_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </Card>
        );
      })}

      {systems.length === 0 && (
        <Card className="p-8 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <div className="font-semibold text-gray-900 mb-1">
            No Systems Tracked Yet
          </div>
          <div className="text-sm text-gray-600">
            Complete your baseline assessment to start tracking system lifecycles
          </div>
        </Card>
      )}
    </div>
  );
}