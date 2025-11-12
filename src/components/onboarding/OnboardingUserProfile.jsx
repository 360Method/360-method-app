import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Building2, TrendingUp, ArrowRight, ArrowLeft } from "lucide-react";

export default function OnboardingUserProfile({ onNext, onBack }) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl text-center" style={{ color: '#1B365D' }}>
            Tell Us About Yourself
          </CardTitle>
          <p className="text-center text-gray-600 text-lg mt-2">
            Are you a homeowner or property investor?
          </p>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {/* Homeowner Option */}
        <Card
          className="border-3 border-blue-300 hover:border-blue-500 transition-all hover:shadow-xl cursor-pointer group"
          onClick={() => onNext({ userType: 'homeowner' })}
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
          onClick={() => onNext({ userType: 'investor' })}
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
      <Card className="border-2 border-purple-300 bg-purple-50">
        <CardContent className="p-4 md:p-6">
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

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="gap-2"
          style={{ minHeight: '48px' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
    </div>
  );
}