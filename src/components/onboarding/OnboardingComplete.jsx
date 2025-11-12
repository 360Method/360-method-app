import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Home,
  Target,
  Zap
} from "lucide-react";

export default function OnboardingComplete({ onComplete, data }) {
  const [celebrating, setCelebrating] = React.useState(true);

  React.useEffect(() => {
    // Confetti effect duration
    const timer = setTimeout(() => {
      setCelebrating(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    onComplete({
      onboarding_completed: true
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-700">
      {/* Celebration Hero */}
      <Card className="border-none shadow-2xl bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white overflow-hidden relative">
        {celebrating && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 animate-bounce text-4xl">🎉</div>
            <div className="absolute top-20 right-20 animate-bounce text-4xl delay-100">🏆</div>
            <div className="absolute bottom-20 left-20 animate-bounce text-4xl delay-200">✨</div>
            <div className="absolute bottom-10 right-10 animate-bounce text-4xl delay-300">🎊</div>
          </div>
        )}
        
        <CardContent className="p-12 text-center relative z-10">
          <div className="w-24 h-24 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 animate-pulse">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🎉 You're All Set!
          </h1>
          
          <p className="text-2xl text-green-100 mb-6">
            Your property is ready for the 360° Method
          </p>

          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Welcome to smarter property management</span>
          </div>
        </CardContent>
      </Card>

      {/* What Happens Next */}
      <Card className="border-2 border-blue-300">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold" style={{ color: '#1B365D' }}>
              What Happens Next
            </h2>
          </div>

          <div className="space-y-6">
            {data.selectedPath === 'wizard' && (
              <div className="p-6 bg-purple-50 rounded-lg border-2 border-purple-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-xl">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-purple-900 text-lg mb-2">
                      📋 Quick Start Wizard (10-15 minutes)
                    </h3>
                    <p className="text-gray-700 mb-3">
                      Our AI will guide you through documenting your 4 most critical systems. 
                      Take photos of data plates, and we'll extract key information automatically.
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-purple-600 text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI-Powered
                      </Badge>
                      <Badge className="bg-green-600 text-white">
                        Unlocks ACT Phase
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {data.selectedPath === 'walkthrough' && (
              <div className="p-6 bg-green-50 rounded-lg border-2 border-green-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-xl">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 text-lg mb-2">
                      🚶 Physical Walkthrough (30-45 minutes)
                    </h3>
                    <p className="text-gray-700 mb-3">
                      Follow our room-by-room route to document every system. Optimized for mobile, 
                      so you can walk through your property with your phone and capture everything efficiently.
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-green-600 text-white">
                        Complete Coverage
                      </Badge>
                      <Badge className="bg-blue-600 text-white">
                        Mobile Optimized
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {data.selectedPath === 'explore' && (
              <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-xl">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 text-lg mb-2">
                      🏠 Explore Your Dashboard
                    </h3>
                    <p className="text-gray-700 mb-3">
                      You'll land on your property dashboard where you can explore all 9 steps of the 
                      360° Method. Add systems manually whenever you're ready.
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-600 text-white">
                        Self-Guided
                      </Badge>
                      <Badge className="bg-purple-600 text-white">
                        Full Flexibility
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-xl">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                    📈 Watch Your Property Intelligence Grow
                  </h3>
                  <p className="text-gray-700">
                    As you document systems and complete steps, you'll unlock:
                  </p>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1 ml-4">
                    <li>• AI-powered maintenance prioritization</li>
                    <li>• Cost forecasts and budget planning</li>
                    <li>• Cascade risk prevention alerts</li>
                    <li>• Property health score tracking</li>
                    <li>• Strategic upgrade recommendations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Zap className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2 text-lg">
                💡 Quick Tips for Success
              </h3>
              <ul className="text-sm text-yellow-800 space-y-2">
                <li>• <strong>Take photos:</strong> Data plates, serial numbers, and system conditions help AI give better insights</li>
                <li>• <strong>Installation dates matter:</strong> Even approximate years help with lifecycle planning</li>
                <li>• <strong>Document as you go:</strong> Don't wait for a "perfect" time—add systems when you think of them</li>
                <li>• <strong>Use mobile:</strong> Walk around with your phone and document systems where they are</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Summary */}
      {data.property && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Home className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-green-900 mb-2">Your Property:</h3>
                <p className="text-gray-900 font-semibold">{data.property.address}</p>
                {data.property.operator_available ? (
                  <Badge className="bg-green-600 text-white mt-2">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    360° Operator Available
                  </Badge>
                ) : (
                  <Badge className="bg-orange-600 text-white mt-2">
                    DIY Mode - Full Features Available
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA Button */}
      <div className="text-center pt-4">
        <Button
          onClick={handleGetStarted}
          size="lg"
          className="gap-3 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all animate-pulse"
          style={{ 
            backgroundColor: '#28A745', 
            minHeight: '72px',
            paddingLeft: '48px',
            paddingRight: '48px'
          }}
        >
          <Sparkles className="w-7 h-7" />
          {data.selectedPath === 'wizard' && 'Start Quick Wizard'}
          {data.selectedPath === 'walkthrough' && 'Begin Walkthrough'}
          {data.selectedPath === 'explore' && 'Go to Dashboard'}
          <ArrowRight className="w-7 h-7" />
        </Button>
      </div>
    </div>
  );
}