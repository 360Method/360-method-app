import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function Schedule() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ACT → Schedule</h1>
          <p className="text-gray-600 mt-1">Calendar view of all scheduled maintenance</p>
        </div>
        
        <Card className="border-none shadow-lg">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-gray-600">
              Maintenance calendar and scheduling will be available here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}