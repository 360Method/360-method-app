import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function PhaseProgressCard({ 
  phase, 
  icon: Icon, 
  color, 
  progress, 
  description, 
  action, 
  actionUrl 
}) {
  return (
    <Card className="border-2 mobile-card hover:shadow-lg transition-shadow" style={{ borderColor: color }}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold" style={{ color, fontSize: '18px' }}>
              {phase}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Progress</span>
            <span className="text-sm font-bold" style={{ color }}>
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
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
          className="w-full"
          style={{ 
            borderColor: color,
            color: color,
            minHeight: '44px'
          }}
        >
          <Link to={actionUrl}>
            {action}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}