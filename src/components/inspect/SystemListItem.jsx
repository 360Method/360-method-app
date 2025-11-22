import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin, Eye } from "lucide-react";
import { getSystemMetadata } from "../baseline/systemMetadata";

export default function SystemListItem({ system, onReportIssue }) {
  const metadata = getSystemMetadata(system.system_type);
  const [showDetails, setShowDetails] = React.useState(false);
  
  return (
    <li className="bg-white rounded-lg border hover:border-blue-300 transition-colors">
      <div className="flex items-center justify-between p-3">
        <div 
          className="flex items-start gap-2 flex-1 cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
        >
          <span className="text-xl">{metadata.emoji}</span>
          <div>
            <span className="font-medium">{system.nickname || system.system_type}</span>
            {system.brand_model && <span className="text-gray-600"> - {system.brand_model}</span>}
            {system.installation_year && (
              <span className="text-gray-600"> ({new Date().getFullYear() - system.installation_year} years old)</span>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onReportIssue(system);
          }}
          className="ml-2 whitespace-nowrap"
          style={{ minHeight: '36px' }}
        >
          <AlertTriangle className="w-4 h-4 mr-1" />
          Report Issue
        </Button>
      </div>
      
      {/* Expandable location helper */}
      {showDetails && (
        <div className="px-3 pb-3 pt-0">
          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
            <div className="flex items-start gap-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-blue-900">Where to find: </span>
                <span className="text-gray-700">{metadata.whereToFind}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Eye className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-green-900">Look for: </span>
                <span className="text-gray-700">{metadata.visualCues}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}