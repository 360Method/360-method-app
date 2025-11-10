import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, DollarSign, Clock, CheckCircle2, Calendar } from "lucide-react";

const PRIORITY_COLORS = {
  High: "bg-red-100 text-red-800 border-red-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Low: "bg-blue-100 text-blue-800 border-blue-200",
  Routine: "bg-gray-100 text-gray-800 border-gray-200"
};

export default function PriorityTaskCard({ task, rank, onPriorityChange, onStatusChange }) {
  const costSavings = (task.delayed_fix_cost || 0) - (task.current_fix_cost || 0);

  return (
    <Card className={`border-2 ${task.has_cascade_alert ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Rank Badge */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
            rank <= 3 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
          }`}>
            #{rank}
          </div>

          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{task.title}</h3>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                )}
              </div>
              <Badge className={`${PRIORITY_COLORS[task.priority]} border`}>
                {task.priority}
              </Badge>
            </div>

            {/* Cascade Alert */}
            {task.has_cascade_alert && (
              <div className="flex items-start gap-2 p-3 bg-red-100 border border-red-300 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 text-sm">Cascade Prevention Alert</p>
                  <p className="text-xs text-red-700 mt-1">
                    This issue could trigger a chain reaction if left unaddressed. Immediate action recommended.
                  </p>
                </div>
              </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {task.cascade_risk_score && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-600">Risk Score</p>
                    <p className="font-semibold text-gray-900">{task.cascade_risk_score}/10</p>
                  </div>
                </div>
              )}

              {task.current_fix_cost && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Fix Now</p>
                    <p className="font-semibold text-gray-900">${task.current_fix_cost.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {task.delayed_fix_cost && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="text-xs text-gray-600">If Delayed</p>
                    <p className="font-semibold text-gray-900">${task.delayed_fix_cost.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {task.urgency_timeline && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Urgency</p>
                    <p className="font-semibold text-gray-900">{task.urgency_timeline}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Cost Comparison */}
            {costSavings > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-900">
                  <span className="font-semibold">Fix now for ${task.current_fix_cost?.toLocaleString()}</span>
                  {' '}or risk <span className="font-semibold">${task.delayed_fix_cost?.toLocaleString()}</span> later
                  {' '}— Save <span className="font-bold">${costSavings.toLocaleString()}</span> by acting now
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Priority:</span>
                <Select value={task.priority} onValueChange={(value) => onPriorityChange(task.id, value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Routine">Routine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="sm"
                onClick={() => onStatusChange(task.id, 'Scheduled')}
                className="gap-2"
                style={{ backgroundColor: 'var(--secondary)' }}
              >
                <Calendar className="w-4 h-4" />
                Schedule Task
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(task.id, 'Completed')}
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark Complete
              </Button>
            </div>

            {/* System Type Badge */}
            {task.system_type && (
              <Badge variant="outline">{task.system_type}</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}