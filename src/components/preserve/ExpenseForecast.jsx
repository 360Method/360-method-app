import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function ExpenseForecast({ next12Months, next24Months, next36Months }) {
  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Major Expense Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Next 12 Months</p>
            <p className="text-3xl font-bold text-blue-900">
              ${next12Months.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 mt-1">Expected replacements</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Next 24 Months</p>
            <p className="text-3xl font-bold text-blue-900">
              ${next24Months.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 mt-1">Based on system ages</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Next 36 Months</p>
            <p className="text-3xl font-bold text-blue-900">
              ${next36Months.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 mt-1">Long-term planning</p>
          </div>
        </div>
        <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">💡 Preservation Tip:</span> By staying proactive with maintenance, 
            you're preventing emergency replacements and saving money long-term. Keep up the great work!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}