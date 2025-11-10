import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function PhaseProgressCard({ phase, icon: Icon, color, progress, description, action, actionUrl }) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2" style={{ fontSize: '18px' }}>
          <Icon className="w-5 h-5" style={{ color }} />
          <span>{phase}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4" style={{ fontSize: '14px', lineHeight: '1.4' }}>
          {description}
        </p>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="font-semibold text-gray-900">{progress}%</span>
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
          className="w-full"
          style={{ backgroundColor: color, minHeight: '44px' }}
        >
          <Link to={actionUrl} className="flex items-center justify-center gap-2">
            {action}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}