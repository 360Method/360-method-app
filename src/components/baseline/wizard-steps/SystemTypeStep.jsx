import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export default function SystemTypeStep({ 
  value, 
  onChange, 
  systemTypes,
  documentedTypes = []
}) {
  return (
    <div className="space-y-4">
      {systemTypes.map(system => {
        const isDocumented = documentedTypes.includes(system.type);
        
        return (
          <Card
            key={system.type}
            onClick={() => !isDocumented && onChange(system.type)}
            className={`border-2 cursor-pointer transition-all ${
              value === system.type 
                ? 'border-blue-500 bg-blue-50 shadow-lg' 
                : isDocumented
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
            }`}
            style={{ minHeight: '80px' }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{system.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{system.name}</h3>
                    {system.description && (
                      <p className="text-xs text-gray-600">{system.description}</p>
                    )}
                  </div>
                </div>
                {isDocumented && (
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Done
                  </Badge>
                )}
                {value === system.type && !isDocumented && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}