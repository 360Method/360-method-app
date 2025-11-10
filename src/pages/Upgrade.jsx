import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function Upgrade() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ADVANCE → Upgrade</h1>
          <p className="text-gray-600 mt-1">Strategic improvement opportunities with ROI analysis</p>
        </div>
        
        <Card className="border-none shadow-lg">
          <CardContent className="p-12 text-center">
            <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-gray-600">
              Strategic upgrades with ROI calculations will be available here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}