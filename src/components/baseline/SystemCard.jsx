import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Calendar, AlertCircle, AlertTriangle, CheckCircle, ClipboardCheck, MapPin, Lightbulb } from "lucide-react";
import { getSystemMetadata } from "./systemMetadata";

const getSystemIcon = (type) => {
  return getSystemMetadata(type).emoji;
};

const getConditionColor = (condition) => {
  const colors = {
    Excellent: "bg-green-100 text-green-800 border-green-200",
    Good: "bg-blue-100 text-blue-800 border-blue-200",
    Fair: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Poor: "bg-orange-100 text-orange-800 border-orange-200",
    Urgent: "bg-red-100 text-red-800 border-red-200"
  };
  return colors[condition] || "bg-gray-100 text-gray-800 border-gray-200";
};

export default function SystemCard({ systemType, system, description, isRequired, onEdit, onAdd, propertyId }) {
  // Fetch recent inspections for this property to show last inspected date
  const { data: recentInspections = [] } = useQuery({
    queryKey: ['recent-inspections', propertyId],
    queryFn: () => base44.entities.Inspection.filter(
      { property_id: propertyId, status: 'Completed' }, 
      '-inspection_date', 
      3
    ),
    enabled: !!propertyId && !!system,
    initialData: [],
  });

  // Find when this system was last mentioned in an inspection
  const lastInspectedDate = React.useMemo(() => {
    if (!system || recentInspections.length === 0) return null;
    
    for (const inspection of recentInspections) {
      const issues = inspection.checklist_items || [];
      const systemIssue = issues.find(issue => issue.system_id === system.id);
      if (systemIssue || inspection.checklist_items?.length > 0) {
        return inspection.inspection_date || inspection.created_date;
      }
    }
    return null;
  }, [system, recentInspections]);

  const metadata = getSystemMetadata(systemType);
  const [showHelper, setShowHelper] = React.useState(false);

  if (!system) {
    return (
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer" onClick={onAdd}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-3xl">{metadata.emoji}</div>
            {isRequired ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-blue-500" />
            )}
          </div>
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            {systemType}
            {isRequired && <span className="text-red-600 text-xs">*REQUIRED</span>}
          </h3>
          
          {/* Where to Find It Helper */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowHelper(!showHelper);
            }}
            className="w-full mb-3 p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-xs text-left transition-colors"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="font-semibold text-blue-900">📍 Where to find it</span>
            </div>
            {showHelper && (
              <div className="mt-2 text-gray-700">
                {metadata.whereToFind}
              </div>
            )}
          </button>

          {/* Quick Tip */}
          <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-amber-900 mb-1">💡 Why it matters:</div>
                <div className="text-amber-800">{metadata.quickTip}</div>
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Document System
          </Button>
        </CardContent>
      </Card>
    );
  }

  const age = system.installation_year ? new Date().getFullYear() - system.installation_year : null;

  const [showLocationHelper, setShowLocationHelper] = React.useState(false);

  return (
    <Card className={`border-2 shadow-lg hover:shadow-xl transition-shadow ${
      isRequired ? 'border-red-200' : 'border-blue-200'
    }`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{metadata.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">{systemType}</span>
                {isRequired && (
                  <Badge className="bg-red-600 text-white text-xs">ESSENTIAL</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowLocationHelper(!showLocationHelper)}
              title="Where to find it"
            >
              <MapPin className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(system)}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
        
        {/* Location Helper - Collapsible */}
        {showLocationHelper && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
            <div className="flex items-start gap-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-blue-900 mb-1">📍 Where to find it:</div>
                <div className="text-gray-700">{metadata.whereToFind}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-amber-900 mb-1">Visual cues:</div>
                <div className="text-gray-700">{metadata.visualCues}</div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge className={`${getConditionColor(system.condition)} border`}>
          {system.condition}
        </Badge>
        
        {system.brand_model && (
          <div>
            <p className="text-xs text-gray-600">Brand/Model</p>
            <p className="text-sm font-medium text-gray-900">{system.brand_model}</p>
          </div>
        )}
        
        {age !== null && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{age} years old ({system.installation_year})</span>
          </div>
        )}
        
        {/* Last Inspection Info */}
        {lastInspectedDate && (
          <div className="bg-blue-50 border border-blue-200 rounded p-2">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-blue-900 font-medium">Last Inspected</p>
                <p className="text-xs text-blue-700">
                  {new Date(lastInspectedDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {system.last_service_date && (
          <div>
            <p className="text-xs text-gray-600">Last Professional Service</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(system.last_service_date).toLocaleDateString()}
            </p>
          </div>
        )}

        {system.estimated_lifespan_years && age && age >= system.estimated_lifespan_years * 0.8 && (
          <div className="flex items-start gap-2 p-2 bg-orange-50 rounded border border-orange-200">
            <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-orange-800">
              Approaching end of typical lifespan ({system.estimated_lifespan_years} years)
            </p>
          </div>
        )}

        {system.warning_signs_present && system.warning_signs_present.length > 0 && (
          <div className="p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-xs font-semibold text-red-900 mb-1">
              ⚠️ Warning Signs Detected:
            </p>
            <ul className="text-xs text-red-800 space-y-1">
              {system.warning_signs_present.slice(0, 2).map((sign, idx) => (
                <li key={idx}>• {sign}</li>
              ))}
              {system.warning_signs_present.length > 2 && (
                <li>• +{system.warning_signs_present.length - 2} more</li>
              )}
            </ul>
          </div>
        )}

        {system.photo_urls && system.photo_urls.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {system.photo_urls.slice(0, 3).map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`${systemType} photo ${idx + 1}`}
                className="w-16 h-16 object-cover rounded border"
              />
            ))}
            {system.photo_urls.length > 3 && (
              <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-sm text-gray-600">
                +{system.photo_urls.length - 3}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}