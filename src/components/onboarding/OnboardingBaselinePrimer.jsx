import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  Shield,
  Target,
  Zap
} from "lucide-react";

export default function OnboardingBaselinePrimer({ onNext, onBack, data }) {
  const [selectedPath, setSelectedPath] = React.useState(null);

  const paths = [
    {
      id: 'wizard',
      title: 'Quick Start Wizard',
      icon: Sparkles,
      time: '10-15 minutes',
      difficulty: 'Easiest',
      description: 'AI-guided setup for your 4 most critical systems. Perfect for getting started fast.',
      bestFor: [
        'First-time users',
        'Want to see value immediately',
        'Prefer guided step-by-step',
        'Unlock ACT phase quickly'
      ],
      color: 'purple'
    },
    {
      id: 'walkthrough',
      title: 'Physical Walkthrough',
      icon: MapPin,
      time: '30-45 minutes',
      difficulty: 'Thorough',
      description: 'Room-by-room route through your property. Document everything with optimal zone-based navigation.',
      bestFor: [
        'Complete documentation',
        'Physical inspection mindset',
        'Mobile on-site use',
        'Maximum coverage'
      ],
      color: 'green'
    },
    {
      id: 'explore',
      title: 'Explore on My Own',
      icon: CheckCircle2,
      time: 'At your pace',
      difficulty: 'Flexible',
      description: 'Browse the dashboard and add systems as you discover them. Full freedom to explore.',
      bestFor: [
        'Experienced users',
        'Want to explore features',
        'Prefer self-guided',
        'No rush to complete'
      ],
      color: 'blue'
    }
  ];

  const handleContinue = () => {
    if (selectedPath) {
      onNext({
        selectedPath: selectedPath
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Hero Explanation */}
      <Card className="border-none shadow-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <CardContent className="p-8 md:p-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Understanding Your Baseline
            </h1>
          </div>
          
          <p className="text-xl text-blue-100 mb-6 leading-relaxed">
            Your <strong>baseline</strong> is a complete inventory of every major system in your property—
            from HVAC to plumbing to appliances. This is the foundation that powers everything else.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Shield className="w-6 h-6 mb-2 text-green-300" />
              <p className="font-bold mb-1">Prevents Disasters</p>
              <p className="text-sm text-blue-100">Know when systems will fail before they do</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Zap className="w-6 h-6 mb-2 text-yellow-300" />
              <p className="font-bold mb-1">Smart Planning</p>
              <p className="text-sm text-blue-100">Budget 2-5 years ahead with confidence</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Target className="w-6 h-6 mb-2 text-blue-300" />
              <p className="font-bold mb-1">Unlocks AI</p>
              <p className="text-sm text-blue-100">Powers prioritization and forecasting</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Choose Your Path */}
      <Card className="border-2 border-green-300">
        <CardHeader>
          <CardTitle className="text-2xl text-center" style={{ color: '#1B365D' }}>
            Choose Your Documentation Path
          </CardTitle>
          <p className="text-center text-gray-600 mt-2">
            All paths lead to the same goal—pick what feels right for you today
          </p>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {paths.map((path) => {
          const isSelected = selectedPath === path.id;
          const Icon = path.icon;
          const borderColor = isSelected 
            ? path.color === 'purple' ? 'border-purple-500' 
            : path.color === 'green' ? 'border-green-500' 
            : 'border-blue-500'
            : 'border-gray-300';
          const bgColor = isSelected
            ? path.color === 'purple' ? 'bg-purple-50' 
            : path.color === 'green' ? 'bg-green-50' 
            : 'bg-blue-50'
            : 'bg-white';

          return (
            <Card
              key={path.id}
              className={`border-3 ${borderColor} ${bgColor} cursor-pointer hover:shadow-xl transition-all duration-300 ${
                isSelected ? 'shadow-2xl' : ''
              }`}
              onClick={() => setSelectedPath(path.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div 
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      path.color === 'purple' 
                        ? 'bg-gradient-to-br from-purple-500 to-purple-700' 
                        : path.color === 'green'
                        ? 'bg-gradient-to-br from-green-500 to-green-700'
                        : 'bg-gradient-to-br from-blue-500 to-blue-700'
                    } shadow-lg`}
                  >
                    <Icon className="w-9 h-9 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: '#1B365D' }}>
                          {path.title}
                        </h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {path.time}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {path.difficulty}
                          </Badge>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {path.description}
                    </p>

                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        ✓ Best for:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {path.bestFor.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reassurance */}
      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="text-sm font-semibold text-yellow-900 mb-2">
                You can always switch paths or add more systems later
              </p>
              <p className="text-sm text-yellow-800">
                There's no "wrong" choice here. Even if you start with the Quick Wizard, you can always 
                come back and add more systems using the Physical Walkthrough or manual entry. 
                Your baseline grows with you!
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
        <Button
          onClick={handleContinue}
          disabled={!selectedPath}
          className="gap-2"
          style={{ 
            backgroundColor: selectedPath ? '#28A745' : '#CCCCCC', 
            minHeight: '48px'
          }}
        >
          {selectedPath === 'wizard' && 'Start Quick Wizard'}
          {selectedPath === 'walkthrough' && 'Start Walkthrough'}
          {selectedPath === 'explore' && 'Go to Dashboard'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}