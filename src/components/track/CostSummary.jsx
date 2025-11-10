import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const COLOR_CLASSES = {
  blue: "bg-blue-100 text-blue-800",
  purple: "bg-purple-100 text-purple-800",
  green: "bg-green-100 text-green-800",
  orange: "bg-orange-100 text-orange-800"
};

export default function CostSummary({ title, amount, icon: Icon, color, isCount = false }) {
  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {isCount ? amount : `$${amount.toLocaleString()}`}
            </p>
          </div>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${COLOR_CLASSES[color]}`}>
            <Icon className="w-8 h-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}