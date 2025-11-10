import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Calendar, AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";

const getSystemIcon = (type) => {
  const icons = {
    "HVAC System": "🌡️",
    "Plumbing System": "🚰",
    "Electrical System": "⚡",
    "Roof System": "🏠",
    "Foundation & Structure": "🏗️",
    "Water & Sewer/Septic": "💧",
    "Exterior Siding & Envelope": "🏡",
    "Windows & Doors": "🚪",
    "Gutters & Downspouts": "🌧️",
    "Landscaping & Grading": "🌳",
    "Major Appliances": "🔌",
    "Attic & Insulation": "⬆️",
    "Basement/Crawlspace": "⬇️",
    "Garage & Overhead Door": "🚗",
    "Safety Systems": "🚨"
  };
  return icons[type] || "📋";
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

export default function SystemCard({ systemType, system, description, isRequired, onEdit, onAdd }) {
  if (!system) {
    return (
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer" onClick={onAdd}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-3xl">{getSystemIcon(systemType)}</div>
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
          {description && (
            <div className="mb-4 space-y-2">
              <p className="text-xs text-gray-600">{description.what}</p>
              <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                {description.why}
              </div>
            </div>
          )}
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Document System
          </Button>
        </CardContent>
      </Card>
    );
  }

  const age = system.installation_year ? new Date().getFullYear() - system.installation_year : null;

  return (
    <Card className={`border-2 shadow-lg hover:shadow-xl transition-shadow ${
      isRequired ? 'border-red-200' : 'border-blue-200'
    }`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getSystemIcon(systemType)}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">{systemType}</span>
                {isRequired && (
                  <Badge className="bg-red-600 text-white text-xs">ESSENTIAL</Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEdit(system)}>
            <Edit className="w-4 h-4" />
          </Button>
        </CardTitle>
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
        
        {system.last_service_date && (
          <div>
            <p className="text-xs text-gray-600">Last Serviced</p>
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