import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Building2, 
  ArrowRight, 
  ArrowLeft,
  Check
} from "lucide-react";

export default function OnboardingUserProfile({ onNext, onBack }) {
  const [selectedProfile, setSelectedProfile] = React.useState(null);

  const profiles = [
    {
      id: 'homeowner',
      title: 'Homeowner',
      icon: Home,
      subtitle: 'Managing my primary residence',
      description: 'I want to protect my home investment, avoid costly surprises, and maintain my property like a pro.',
      benefits: [
        'Complete baseline for your home',
        'Seasonal inspection checklists',
        'Maintenance cost tracking',
        'AI-powered insights and forecasts',
        'DIY task guidance with tutorials'
      ],
      color: 'blue'
    },
    {
      id: 'investor',
      title: 'Property Investor',
      icon: Building2,
      subtitle: 'Building or managing a portfolio',
      description: 'I need to maximize ROI, minimize operational costs, and scale my property management efficiently.',
      benefits: [
        'Multi-property dashboard',
        'Portfolio-level analytics',
        'Aggregate spending tracking',
        'Strategic upgrade planning',
        'Operator coordination tools'
      ],
      color: 'green'
    }
  ];

  const handleSelect = (profileId) => {
    setSelectedProfile(profileId);
  };

  const handleContinue = () => {
    if (selectedProfile) {
      onNext({
        userProfile: {
          type: selectedProfile,
          selected_date: new Date().toISOString()
        }
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl text-center" style={{ color: '#1B365D' }}>
            👋 Let's Personalize Your Experience
          </CardTitle>
          <p className="text-center text-gray-600 text-lg mt-2">
            This helps us show you the most relevant features and guidance
          </p>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {profiles.map((profile) => {
          const isSelected = selectedProfile === profile.id;
          const Icon = profile.icon;
          const borderColor = isSelected 
            ? profile.color === 'blue' ? 'border-blue-500' : 'border-green-500'
            : 'border-gray-300';
          const bgColor = isSelected
            ? profile.color === 'blue' ? 'bg-blue-50' : 'bg-green-50'
            : 'bg-white';

          return (
            <Card
              key={profile.id}
              className={`border-3 ${borderColor} ${bgColor} cursor-pointer hover:shadow-xl transition-all duration-300 ${
                isSelected ? 'shadow-2xl scale-105' : 'hover:scale-102'
              }`}
              onClick={() => handleSelect(profile.id)}
            >
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        profile.color === 'blue' 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-700' 
                          : 'bg-gradient-to-br from-green-500 to-green-700'
                      } shadow-lg`}
                    >
                      <Icon className="w-9 h-9 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                        {profile.title}
                      </h3>
                      <p className="text-sm text-gray-600">{profile.subtitle}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  {profile.description}
                </p>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    ✓ What You'll Get:
                  </p>
                  {profile.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        profile.color === 'blue' ? 'text-blue-600' : 'text-green-600'
                      }`} />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                {isSelected && (
                  <div className="mt-4 p-3 bg-white rounded-lg border-2 border-green-300">
                    <p className="text-sm font-semibold text-green-900 text-center">
                      ✓ Selected
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Educational Note */}
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="text-sm font-semibold text-purple-900 mb-2">
                Don't worry—you're not locked in!
              </p>
              <p className="text-sm text-purple-800">
                You can always access all features regardless of your selection. This just helps us show you the most relevant tips and examples as you get started.
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
          disabled={!selectedProfile}
          className="gap-2"
          style={{ 
            backgroundColor: selectedProfile ? '#28A745' : '#CCCCCC', 
            minHeight: '48px',
            cursor: selectedProfile ? 'pointer' : 'not-allowed'
          }}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}