import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Home, Shield, TrendingUp, CheckCircle2 } from "lucide-react";

export default function PropertyWizardWelcome({ onContinue, onSkip }) {
  const [neverShowAgain, setNeverShowAgain] = useState(false);

  const handleContinue = () => {
    if (neverShowAgain) {
      localStorage.setItem('hidePropertyWelcome', 'true');
    }
    onContinue();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-2 border-blue-300">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 rounded-full bg-blue-600 mx-auto mb-4 flex items-center justify-center">
            <Home className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl" style={{ color: '#1B365D' }}>
            Welcome to Your Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-2">
              Your property is likely your <strong>largest financial asset</strong>.
            </p>
            <p className="text-gray-600">
              The 360° Method prevents small problems from becoming $10,000+ disasters.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
            <div className="text-center">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">$8,500</p>
              <p className="text-xs text-gray-600">Avg disaster prevented</p>
            </div>
            <div className="text-center">
              <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">5 min</p>
              <p className="text-xs text-gray-600">Avg time to setup</p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-700">94%</p>
              <p className="text-xs text-gray-600">Members sleep better</p>
            </div>
          </div>

          {/* Value Props */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Prevent Expensive Disasters</p>
                <p className="text-sm text-gray-600">Track 9 major systems that cause 87% of failures</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Build Wealth Through Maintenance</p>
                <p className="text-sm text-gray-600">Strategic preservation returns 3-10x ROI</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Sleep Better at Night</p>
                <p className="text-sm text-gray-600">Know exactly what needs attention and when</p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-700"
              style={{ minHeight: '56px', fontSize: '18px' }}
            >
              Get Started - Add My First Property
            </Button>
            
            <div className="flex items-center justify-center gap-2">
              <Checkbox
                id="never-show"
                checked={neverShowAgain}
                onCheckedChange={setNeverShowAgain}
              />
              <label htmlFor="never-show" className="text-sm text-gray-600 cursor-pointer">
                Don't show this welcome screen again
              </label>
            </div>

            {onSkip && (
              <Button
                variant="ghost"
                onClick={onSkip}
                className="w-full"
              >
                Skip - I've been here before
              </Button>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}