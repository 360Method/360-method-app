import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";

export default function PhaseProgressCard({ phase, icon: Icon, color, progress, description, linkText, linkUrl }) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
      progress: "[&>div]:bg-blue-600"
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: "text-orange-600",
      button: "bg-orange-600 hover:bg-orange-700",
      progress: "[&>div]:bg-orange-600"
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-600",
      button: "bg-green-600 hover:bg-green-700",
      progress: "[&>div]:bg-green-600"
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
        <p className="text-gray-600 text-sm">{description}</p>
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="font-semibold text-gray-900">{progress}%</span>
          </div>
          <Progress value={progress} className={`h-2 ${colors.progress}`} />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link to={linkUrl} className="w-full">
          <Button className={`w-full gap-2 ${colors.button}`}>
            {linkText}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}