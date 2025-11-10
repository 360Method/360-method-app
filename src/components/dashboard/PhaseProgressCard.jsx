import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

export default function PhaseProgressCard({ phase, icon: Icon, color, metrics, action }) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700"
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: "text-orange-600",
      button: "bg-orange-600 hover:bg-orange-700"
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-600",
      button: "bg-green-600 hover:bg-green-700"
    }
  };

  const colors = colorClasses[color];

  return (
    <Card className={`border-2 ${colors.border} shadow-lg hover:shadow-xl transition-shadow`}>
      <CardHeader className={`${colors.bg} border-b-2 ${colors.border}`}>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`w-6 h-6 ${colors.icon}`} />
          <span className="text-xl font-bold">{phase}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {metrics.map((metric, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">{metric.label}</span>
              <span className={`font-semibold ${metric.urgent ? 'text-red-600' : 'text-gray-900'}`}>
                {metric.value}
              </span>
            </div>
            {metric.progress !== undefined && (
              <Progress value={metric.progress} className="h-2" />
            )}
          </div>
        ))}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link to={action.url} className="w-full">
          <Button className={`w-full gap-2 ${colors.button}`}>
            {action.label}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}