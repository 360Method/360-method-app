import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Building2, TrendingUp } from "lucide-react";

export default function UserTypeSelector({ onSelect, onCancel }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px' }}>
          Add Your Property
        </h2>
        <p className="text-gray-600 mb-4" style={{ fontSize: '18px' }}>
          First, tell us about yourself
        </p>
        <div className="flex gap-2">
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
        </div>
      </div>

      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-2" style={{ color: '#1B365D' }}>
          Are you a homeowner or property investor?
        </h3>
        <p className="text-gray-600">
          This helps us show you the right options for your property
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {/* Homeowner Option */}
        <Card
          className="border-3 border-blue-300 hover:border-blue-500 transition-all hover:shadow-xl cursor-pointer group"
          onClick={() => onSelect('homeowner')}
        >
          <CardContent className="p-6 bg-blue-50">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-1" style={{ color: '#1B365D' }}>
                    🏠 I'm a Homeowner
                  </h3>
                  <p className="text-sm text-gray-700">
                    I live in this property (with or without renting part of it)
                  </p>
                  <p className="text-xs text-gray-600 mt-1 italic">
                    Managing my primary residence or house hacking
                  </p>
                </div>
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg group-hover:scale-105 transition-transform"
                style={{ minHeight: '48px', minWidth: '120px' }}
              >
                Select
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Investor Option */}
        <Card
          className="border-3 border-green-300 hover:border-green-500 transition-all hover:shadow-xl cursor-pointer group"
          onClick={() => onSelect('investor')}
        >
          <CardContent className="p-6 bg-green-50">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-1" style={{ color: '#1B365D' }}>
                    💼 I'm a Property Investor
                  </h3>
                  <p className="text-sm text-gray-700">
                    This is an investment property - I don't live here
                  </p>
                  <p className="text-xs text-gray-600 mt-1 italic">
                    Long-term rental, furnished rental, or vacation rental
                  </p>
                </div>
              </div>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg group-hover:scale-105 transition-transform"
                style={{ minHeight: '48px', minWidth: '120px' }}
              >
                Select
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="border-2 border-purple-300 bg-purple-50 mb-6">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-800 font-semibold mb-1">
                💡 Why we ask:
              </p>
              <p className="text-xs text-gray-700 leading-relaxed">
                Homeowners and investors have different needs. This helps us customize your experience, 
                show relevant features, and provide accurate maintenance recommendations based on how you use the property.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={onCancel}
          variant="ghost"
          style={{ minHeight: '48px' }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}