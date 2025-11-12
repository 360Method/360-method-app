import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  CheckCircle2, 
  Home, 
  TrendingUp,
  Edit,
  FileText,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PostOnboardingPrompt({ property, onDismiss }) {
  return (
    <Card className="border-4 border-green-400 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 shadow-2xl mb-6 animate-in fade-in-50 duration-700">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0 shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#1B365D' }}>
                🎉 Great Start! Let's Refine Your Property's Story
              </h2>
              <p className="text-gray-600">
                You've completed the initial setup—but there's more to unlock!
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="bg-white rounded-lg p-5 mb-6 border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-800 leading-relaxed mb-3">
                Filling out <strong>additional property details</strong> and documenting <strong>all your home's systems</strong> will 
                give you the most accurate insights, forecasts, and savings opportunities.
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-green-50 rounded p-3 border border-green-200">
                  <p className="text-xs font-semibold text-green-900 mb-1">✓ Better Forecasts</p>
                  <p className="text-xs text-green-800">Accurate lifecycle planning</p>
                </div>
                <div className="bg-blue-50 rounded p-3 border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-1">✓ Smarter Insights</p>
                  <p className="text-xs text-blue-800">AI-powered recommendations</p>
                </div>
                <div className="bg-purple-50 rounded p-3 border border-purple-200">
                  <p className="text-xs font-semibold text-purple-900 mb-1">✓ Maximum Value</p>
                  <p className="text-xs text-purple-800">Complete property history</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Complete Property Details */}
          <Card className="border-2 border-blue-300 hover:border-blue-500 hover:shadow-lg transition-all">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 text-lg">Property Details</h3>
                  <Badge className="bg-blue-600 text-white text-xs mt-1">
                    5-10 minutes
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Add missing details like year built, square footage, foundation type, and more for better analytics.
              </p>
              <Button
                asChild
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Link to={createPageUrl("Properties")}>
                  <Edit className="w-4 h-4" />
                  Complete Property Details
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Continue System Documentation */}
          <Card className="border-2 border-green-300 hover:border-green-500 hover:shadow-lg transition-all">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-green-900 text-lg">System Documentation</h3>
                  <Badge className="bg-green-600 text-white text-xs mt-1">
                    Continue where you left off
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Document appliances, safety systems, and all remaining home systems for complete protection.
              </p>
              <Button
                asChild
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
              >
                <Link to={createPageUrl("Baseline") + `?property=${property.id}`}>
                  <TrendingUp className="w-4 h-4" />
                  Continue Documenting Systems
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-900 text-center">
            💡 <strong>Pro Tip:</strong> Complete documentation unlocks the full power of the 360° Method—
            including cascade prevention alerts, expense forecasting, and portfolio analytics.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}