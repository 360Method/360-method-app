import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, DollarSign, Clock, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";

const PRIORITY_COLORS = {
  High: "bg-red-100 text-red-800 border-red-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Low: "bg-blue-100 text-blue-800 border-blue-200",
  Routine: "bg-gray-100 text-gray-800 border-gray-200"
};

export default function PriorityTaskCard({ task, rank, onPriorityChange, onStatusChange }) {
  const [expanded, setExpanded] = React.useState(false);

  const costSavings = (task.delayed_fix_cost || 0) - (task.current_fix_cost || 0);

  return (
    <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-700 flex-shrink-0">
              #{rank}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg mb-2">{task.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className={PRIORITY_COLORS[task.priority]}>
                  {task.priority} Priority
                </Badge>
                {task.system_type && (
                  <Badge variant="outline">{task.system_type}</Badge>
                )}
                {task.has_cascade_alert && (
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                    ⚠️ Cascade Risk
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Stats Row - Always Visible */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <div>
              <p className="text-xs text-gray-600">Risk Score</p>
              <p className="font-semibold">{task.cascade_risk_score || 0}/10</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Fix Now</p>
              <p className="font-semibold">${(task.current_fix_cost || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Timeline</p>
              <p className="font-semibold text-sm">{task.urgency_timeline || 'ASAP'}</p>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="space-y-4 pt-4 border-t">
            {task.description && (
              <div>
                <p className="text-sm text-gray-700">{task.description}</p>
              </div>
            )}

            {/* Cascade Risk Explanation */}
            {task.has_cascade_alert && (
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-6 h-6 text-orange-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-orange-900 mb-2">💥 Cascade Risk:</h4>
                    <p className="text-sm text-gray-800 leading-relaxed mb-3">
                      This problem triggers a chain reaction of increasingly expensive damage if left unaddressed.
                    </p>
                    {task.system_type === "Plumbing System" && task.title.toLowerCase().includes("hose") && (
                      <p className="text-sm text-gray-800 leading-relaxed">
                        <strong>Example:</strong> Burst rubber hose → Flood damage (200+ gallons) → Water damage to floors/walls → Mold growth → $8,000-15,000 repair
                      </p>
                    )}
                    {task.system_type === "Gutters" && (
                      <p className="text-sm text-gray-800 leading-relaxed">
                        <strong>Example:</strong> Clogged gutter → Water overflow → Foundation damage → Basement flooding → Landscaping erosion → $10,000-30,000 damage
                      </p>
                    )}
                    {task.system_type === "Roof" && (
                      <p className="text-sm text-gray-800 leading-relaxed">
                        <strong>Example:</strong> Small leak → Rotted deck → Interior damage → Mold growth → Structural issues → $30,000+ disaster
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Cost Impact */}
            {(task.current_fix_cost || task.delayed_fix_cost) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Cost Impact:
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Fix Now:</p>
                    <p className="text-2xl font-bold text-green-700">
                      ${(task.current_fix_cost || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Fix Later:</p>
                    <p className="text-2xl font-bold text-red-700">
                      ${(task.delayed_fix_cost || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                {costSavings > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm font-medium text-gray-800">
                      ✅ Act now and save: <span className="text-green-700 font-bold">${costSavings.toLocaleString()}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs text-gray-600 mb-1 block">Change Priority:</label>
                <Select
                  value={task.priority}
                  onValueChange={(value) => onPriorityChange(task.id, value)}
                >
                  <SelectTrigger className="h-9">
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

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusChange(task.id, 'Scheduled')}
                  className="h-9"
                >
                  Schedule
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onStatusChange(task.id, 'Completed')}
                  style={{ backgroundColor: 'var(--accent)' }}
                  className="h-9"
                >
                  Mark Complete
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}