import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function PhaseProgressCard({ 
  phase, 
  icon: Icon, 
  color, 
  progress, 
  description, 
  action, 
  actionUrl,
  compact = false 
}) {
  const getProgressStatus = () => {
    if (progress >= 80) return { label: "Excellent", color: "text-green-700" };
    if (progress >= 60) return { label: "Good Progress", color: "text-blue-700" };
    if (progress >= 40) return { label: "In Progress", color: "text-orange-700" };
    return { label: "Just Started", color: "text-gray-700" };
  };

  const status = getProgressStatus();

  if (compact) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm" style={{ color: '#1B365D' }}>
              Phase: {phase}
            </h3>
            <p className="text-xs text-gray-600">{description}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs mb-1">
            <span className={`font-semibold ${status.color}`}>{status.label}</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{ 
                width: `${progress}%`,
                backgroundColor: color
              }}
            />
          </div>
        </div>
        
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full mt-3 gap-2"
        >
          <Link to={actionUrl}>
            {action}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
            style={{ backgroundColor: color }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg" style={{ color: '#1B365D' }}>
              {phase}
            </h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className={`font-semibold ${status.color}`}>{status.label}</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all"
              style={{ 
                width: `${progress}%`,
                backgroundColor: color
              }}
            />
          </div>
        </div>
        
        <Button
          asChild
          variant="outline"
          className="w-full gap-2"
          style={{ minHeight: '44px' }}
        >
          <Link to={actionUrl}>
            {action}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}