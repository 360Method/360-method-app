import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, Play } from "lucide-react";

const SEASON_COLORS = {
  Spring: "bg-green-100 text-green-800 border-green-200",
  Summer: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Fall: "bg-orange-100 text-orange-800 border-orange-200",
  Winter: "bg-blue-100 text-blue-800 border-blue-200"
};

const SEASON_ICONS = {
  Spring: "🌸",
  Summer: "☀️",
  Fall: "🍂",
  Winter: "❄️"
};

export default function InspectionCard({ season, inspection, climateZone, onStart, onEdit }) {
  if (!inspection) {
    return (
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{SEASON_ICONS[season]}</span>
            <span>{season} Inspection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Climate-specific checklist for {climateZone}
          </p>
          <Button onClick={onStart} className="w-full gap-2" style={{ backgroundColor: 'var(--primary)' }}>
            <Play className="w-4 h-4" />
            Start Inspection
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    'Not Started': 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800'
  };

  const statusIcons = {
    'Not Started': <Clock className="w-4 h-4" />,
    'In Progress': <Clock className="w-4 h-4" />,
    'Completed': <CheckCircle2 className="w-4 h-4" />
  };

  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{SEASON_ICONS[season]}</span>
            <span>{season} {inspection.year}</span>
          </div>
          <Badge className={`${SEASON_COLORS[season]} border`}>
            {season}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={statusColors[inspection.status]}>
            {statusIcons[inspection.status]}
            <span className="ml-1">{inspection.status}</span>
          </Badge>
          {inspection.status === 'Completed' && inspection.inspection_date && (
            <span className="text-sm text-gray-600">
              {new Date(inspection.inspection_date).toLocaleDateString()}
            </span>
          )}
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold">{inspection.completion_percentage || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${inspection.completion_percentage || 0}%` }}
            />
          </div>
        </div>

        {inspection.issues_found > 0 && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded border border-orange-200">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <p className="text-sm text-orange-800">
              {inspection.issues_found} issue{inspection.issues_found > 1 ? 's' : ''} requiring attention
            </p>
          </div>
        )}

        <Button onClick={onEdit} variant="outline" className="w-full">
          {inspection.status === 'Completed' ? 'View Details' : 'Continue Inspection'}
        </Button>
      </CardContent>
    </Card>
  );
}