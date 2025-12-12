import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Home, ArrowRight, Plus, LayoutDashboard } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function PropertySuccessScreen({ property, onAddAnother, onGoToDashboard, onCompleteProfile }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      // Simple confetti effect
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'][Math.floor(Math.random() * 4)]};
        top: 50%;
        left: ${Math.random() * 100}%;
        opacity: 1;
        border-radius: 50%;
        pointer-events: none;
        animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
        z-index: 9999;
      `;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 4000);
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <style>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
      
      <Card className="max-w-2xl w-full border-2 border-green-300 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 rounded-full bg-green-600 mx-auto mb-4 flex items-center justify-center animate-pulse">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <CardTitle className="text-3xl" style={{ color: '#1B365D' }}>
            🎉 Property Added!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Property Summary */}
          <div className="p-6 bg-white rounded-lg border-2 border-green-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <Home className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-xl text-gray-900 mb-1">{property.address}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{property.property_type}</Badge>
                  {property.year_built && (
                    <Badge variant="outline">Built {property.year_built}</Badge>
                  )}
                  <Badge className="bg-green-600 text-white">
                    {property.property_use_type === 'primary' ? 'Primary' : 'Rental'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div>
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: '#1B365D' }}>
              <ArrowRight className="w-5 h-5" />
              ✨ What's Next?
            </h3>

            <div className="space-y-3">
              {/* Primary CTA: AWARE Phase */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1">AWARE Phase - Step 1: Baseline (Recommended - 5 min)</p>
                    <p className="text-sm text-gray-700">
                      Add your major systems (HVAC, roof, water heater) so we can prevent disasters and save you thousands.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(createPageUrl('Baseline') + `?property=${property.id}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  style={{ minHeight: '48px' }}
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Add Your Major Systems
                </Button>
              </div>

              {/* Secondary Actions */}
              <div className="grid md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={onAddAnother}
                  style={{ minHeight: '48px' }}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Another Property
                </Button>
                <Button
                  variant="outline"
                  onClick={onGoToDashboard}
                  style={{ minHeight: '48px' }}
                >
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Button>
              </div>

              {/* Complete Full Profile */}
              <div className="text-center pt-2">
                <button
                  onClick={() => onCompleteProfile ? onCompleteProfile(property) : navigate(createPageUrl('Properties') + `?complete=${property.id}`)}
                  className="text-gray-600 hover:text-gray-900 text-sm underline"
                >
                  Or complete full property profile →
                </button>
              </div>
            </div>
          </div>

          {/* 360° Method Structure (3×3) */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
            <p className="text-sm font-bold text-purple-900 mb-3">📚 The 360° Method (3×3 Structure):</p>
            
            <div className="space-y-3">
              {/* AWARE Phase */}
              <div className="bg-white rounded-lg p-3 border-l-4 border-blue-600">
                <p className="font-bold text-blue-900 text-sm mb-1">
                  <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center mr-2">1</span>
                  AWARE
                </p>
                <p className="text-xs text-gray-700 ml-8">
                  1. Baseline • 2. Inspect • 3. Track
                </p>
                <p className="text-xs text-gray-600 ml-8 mt-1">
                  Document systems, inspect regularly, monitor health
                </p>
              </div>

              {/* ACT Phase */}
              <div className="bg-white rounded-lg p-3 border-l-4 border-orange-600">
                <p className="font-bold text-orange-900 text-sm mb-1">
                  <span className="inline-block w-6 h-6 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center mr-2">2</span>
                  ACT
                </p>
                <p className="text-xs text-gray-700 ml-8">
                  1. Prioritize • 2. Schedule • 3. Execute
                </p>
                <p className="text-xs text-gray-600 ml-8 mt-1">
                  Rank tasks, plan maintenance, complete work
                </p>
              </div>

              {/* ADVANCE Phase */}
              <div className="bg-white rounded-lg p-3 border-l-4 border-green-600">
                <p className="font-bold text-green-900 text-sm mb-1">
                  <span className="inline-block w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center mr-2">3</span>
                  ADVANCE
                </p>
                <p className="text-xs text-gray-700 ml-8">
                  1. Preserve • 2. Upgrade • 3. SCALE
                </p>
                <p className="text-xs text-gray-600 ml-8 mt-1">
                  Extend life, improve value, optimize portfolio
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-purple-200">
              <p className="text-xs text-purple-800 text-center">
                ⚡ 3 Phases × 3 Steps = 9 Total Steps
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-sm font-semibold text-gray-900 mb-2">🎯 Your Progress:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <p className="text-sm text-gray-700">Property added (Foundation Layer)</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                <p className="text-sm text-gray-500">AWARE: Baseline (Step 1 of 9)</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                <p className="text-sm text-gray-500">ACT: Prioritize (Step 4 of 9)</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                <p className="text-sm text-gray-500">ADVANCE: Preserve (Step 7 of 9)</p>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}