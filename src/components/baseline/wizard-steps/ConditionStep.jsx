import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const CONDITIONS = [
  { 
    value: 'Excellent', 
    icon: '✨', 
    label: 'Excellent', 
    color: 'green',
    description: 'Like new, perfect condition'
  },
  { 
    value: 'Good', 
    icon: '✅', 
    label: 'Good', 
    color: 'blue',
    description: 'Working fine, normal wear'
  },
  { 
    value: 'Fair', 
    icon: '⚠️', 
    label: 'Fair', 
    color: 'yellow',
    description: 'Works but aging, needs attention'
  },
  { 
    value: 'Poor', 
    icon: '🔧', 
    label: 'Poor', 
    color: 'orange',
    description: 'Frequent issues, plan replacement'
  },
  { 
    value: 'Urgent', 
    icon: '🚨', 
    label: 'Urgent', 
    color: 'red',
    description: 'Needs immediate attention'
  }
];

export default function ConditionStep({ value, onChange }) {
  return (
    <div className="space-y-3">
      {CONDITIONS.map(condition => {
        const isSelected = value === condition.value;
        const colorClasses = {
          green: 'border-green-500 bg-green-50',
          blue: 'border-blue-500 bg-blue-50',
          yellow: 'border-yellow-500 bg-yellow-50',
          orange: 'border-orange-500 bg-orange-50',
          red: 'border-red-500 bg-red-50'
        };

        return (
          <Card
            key={condition.value}
            onClick={() => onChange(condition.value)}
            className={`border-2 cursor-pointer transition-all ${
              isSelected 
                ? `${colorClasses[condition.color]} shadow-lg scale-[1.02]` 
                : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
            }`}
            style={{ minHeight: '80px' }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{condition.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{condition.label}</h3>
                    <p className="text-sm text-gray-600">{condition.description}</p>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}