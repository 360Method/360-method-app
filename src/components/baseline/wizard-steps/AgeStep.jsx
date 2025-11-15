import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Calendar } from "lucide-react";

export default function AgeStep({ 
  value, 
  onChange, 
  aiExtractedYear = null,
  systemType 
}) {
  const currentYear = new Date().getFullYear();
  const suggestedYears = [
    currentYear,
    currentYear - 5,
    currentYear - 10,
    currentYear - 15,
    currentYear - 20
  ];

  return (
    <div className="space-y-6">
      {/* AI Suggestion */}
      {aiExtractedYear && (
        <Card className="border-2 border-purple-300 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              <p className="font-semibold text-purple-900">AI detected from photo:</p>
            </div>
            <button
              type="button"
              onClick={() => onChange(aiExtractedYear)}
              className="w-full p-3 bg-white border-2 border-purple-500 rounded-lg hover:bg-purple-50 transition-colors"
              style={{ minHeight: '48px' }}
            >
              <p className="text-2xl font-bold text-purple-700">{aiExtractedYear}</p>
            </button>
          </CardContent>
        </Card>
      )}

      {/* Manual Entry */}
      <div>
        <Label className="text-lg font-semibold mb-3 block">Installation Year</Label>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., 2015"
          className="text-2xl text-center font-bold"
          style={{ minHeight: '64px', fontSize: '24px' }}
          min="1900"
          max={currentYear}
        />
        <p className="text-sm text-gray-600 mt-2 text-center">
          Best guess is fine - you can update later
        </p>
      </div>

      {/* Quick Select Buttons */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Or select approximate:</p>
        <div className="grid grid-cols-3 gap-2">
          {suggestedYears.map(year => (
            <button
              key={year}
              type="button"
              onClick={() => onChange(year)}
              className={`p-3 rounded-lg border-2 transition-all ${
                value == year
                  ? 'border-blue-500 bg-blue-50 font-bold'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
              style={{ minHeight: '48px' }}
            >
              {year}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {currentYear - (suggestedYears[4])} years ago → New
        </p>
      </div>

      {/* Help Text */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">How to find it:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check data plate on the unit</li>
                <li>• Look for installation stickers</li>
                <li>• Ask previous owner</li>
                <li>• Check home inspection report</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}