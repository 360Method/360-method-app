import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Wrench, ClipboardCheck, Lightbulb, Layers } from "lucide-react";

const TYPE_CONFIG = {
  task: {
    icon: Wrench,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Maintenance"
  },
  inspection: {
    icon: ClipboardCheck,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    label: "Inspection"
  },
  upgrade: {
    icon: Lightbulb,
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Upgrade"
  },
  system: {
    icon: Layers,
    color: "bg-gray-100 text-gray-800 border-gray-200",
    label: "System"
  }
};

export default function TimelineItem({ item }) {
  const config = TYPE_CONFIG[item.type];
  const Icon = config.icon;

  return (
    <div className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${config.color} border-2`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="font-semibold text-gray-900">{item.title}</h4>
            <p className="text-sm text-gray-600 mt-1">
              {item.date.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-right">
            <Badge className={`${config.color} border mb-2`}>
              {config.label}
            </Badge>
            {item.cost && (
              <p className="text-lg font-bold text-gray-900">
                ${item.cost.toLocaleString()}
              </p>
            )}
          </div>
        </div>
        {item.category && (
          <Badge variant="outline" className="mt-2">
            {item.category}
          </Badge>
        )}
      </div>
    </div>
  );
}