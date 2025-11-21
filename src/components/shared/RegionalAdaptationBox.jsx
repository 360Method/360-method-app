import React, { useState } from 'react';
import { MapPin, Info, ChevronDown, ChevronUp, Droplet, Sun, Snowflake, Wind } from 'lucide-react';

const CLIMATE_EXAMPLES = {
  'pacific-northwest': {
    name: 'Pacific Northwest',
    icon: Droplet,
    color: 'blue',
    description: 'Wet winters, mild summers',
    bgGradient: 'bg-gradient-to-r from-blue-50 to-blue-100',
    border: 'border-blue-300',
    iconBg: 'bg-blue-200',
    iconText: 'text-blue-700',
    textPrimary: 'text-blue-800',
    textSecondary: 'text-blue-700',
    titleText: 'text-blue-900',
    hoverText: 'hover:text-blue-800',
    bottomBg: 'bg-blue-100',
    bottomText: 'text-blue-900',
    cardBorder: 'border-blue-400'
  },
  'southwest': {
    name: 'Southwest Desert',
    icon: Sun,
    color: 'orange',
    description: 'Extreme heat, low humidity, monsoons',
    bgGradient: 'bg-gradient-to-r from-orange-50 to-orange-100',
    border: 'border-orange-300',
    iconBg: 'bg-orange-200',
    iconText: 'text-orange-700',
    textPrimary: 'text-orange-800',
    textSecondary: 'text-orange-700',
    titleText: 'text-orange-900',
    hoverText: 'hover:text-orange-800',
    bottomBg: 'bg-orange-100',
    bottomText: 'text-orange-900',
    cardBorder: 'border-orange-400'
  },
  'midwest-northeast': {
    name: 'Midwest/Northeast',
    icon: Snowflake,
    color: 'purple',
    description: 'Freezing winters, hot summers',
    bgGradient: 'bg-gradient-to-r from-purple-50 to-purple-100',
    border: 'border-purple-300',
    iconBg: 'bg-purple-200',
    iconText: 'text-purple-700',
    textPrimary: 'text-purple-800',
    textSecondary: 'text-purple-700',
    titleText: 'text-purple-900',
    hoverText: 'hover:text-purple-800',
    bottomBg: 'bg-purple-100',
    bottomText: 'text-purple-900',
    cardBorder: 'border-purple-400'
  },
  'southeast': {
    name: 'Southeast/Gulf Coast',
    icon: Wind,
    color: 'green',
    description: 'High humidity, hurricanes, heat',
    bgGradient: 'bg-gradient-to-r from-green-50 to-green-100',
    border: 'border-green-300',
    iconBg: 'bg-green-200',
    iconText: 'text-green-700',
    textPrimary: 'text-green-800',
    textSecondary: 'text-green-700',
    titleText: 'text-green-900',
    hoverText: 'hover:text-green-800',
    bottomBg: 'bg-green-100',
    bottomText: 'text-green-900',
    cardBorder: 'border-green-400'
  }
};

export default function RegionalAdaptationBox({ 
  step, 
  demoRegion = 'pacific-northwest',
  regionalAdaptations 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const region = CLIMATE_EXAMPLES[demoRegion];
  const IconComponent = region.icon;

  return (
    <div className={`${region.bgGradient} border-2 ${region.border} rounded-xl p-6 mb-8`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 ${region.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
          <MapPin className={`w-6 h-6 ${region.iconText}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <h3 className={`font-bold ${region.titleText} text-lg flex items-center gap-2`}>
              <IconComponent className="w-5 h-5" />
              Regional Climate Adaptation
            </h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`${region.textSecondary} ${region.hoverText} flex items-center gap-1 text-sm font-semibold flex-shrink-0`}
            >
              <Info className="w-4 h-4" />
              {isExpanded ? 'Hide' : 'Learn More'}
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {!isExpanded ? (
            // Collapsed View
            <div>
              <p className={`${region.textPrimary} mb-2`}>
                <strong>Demo Location: {region.name}</strong> ({region.description})
              </p>
              <p className={`text-sm ${region.textSecondary}`}>
                This demo shows {step} adapted for {region.name} climate. 
                The real app automatically adjusts based on <strong>your property's zip code</strong>.
              </p>
            </div>
          ) : (
            // Expanded View
            <div className="space-y-4">
              <div>
                <p className={`${region.textPrimary} mb-2`}>
                  <strong>Demo Location: {region.name}</strong>
                </p>
                <p className={`text-sm ${region.textSecondary} mb-4`}>
                  {regionalAdaptations.description}
                </p>
              </div>

              {/* Regional Comparisons Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(CLIMATE_EXAMPLES).map(([key, climate]) => {
                  const ClimateIcon = climate.icon;
                  const isDemo = key === demoRegion;
                  const adaptation = regionalAdaptations.examples[key];
                  
                  return (
                    <div 
                      key={key}
                      className={`bg-white border-2 rounded-lg p-4 ${
                        isDemo ? climate.cardBorder : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <ClimateIcon className={`w-5 h-5 ${climate.iconText}`} />
                        <h4 className="font-bold text-gray-900 text-sm">
                          {climate.name}
                          {isDemo && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">DEMO</span>}
                        </h4>
                      </div>
                      <div className="text-xs text-gray-700 space-y-1">
                        {adaptation && adaptation.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-1">
                            <span className="text-gray-400">•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* How It Works */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                  🎯 How Regional Adaptation Works
                </h4>
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">1.</span>
                    <span>Enter your property's zip code during onboarding</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">2.</span>
                    <span>AI maps to one of 12 climate zones (USDA + Köppen classification)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">3.</span>
                    <span>{regionalAdaptations.howItWorks}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">4.</span>
                    <span>Local cost data adjusts estimates for regional labor/material pricing</span>
                  </div>
                </div>
              </div>

              {/* Bottom Note */}
              <div className={`${region.bottomBg} rounded-lg p-3 text-center`}>
                <p className={`text-xs ${region.bottomText} font-semibold`}>
                  ✨ Your property gets {step} tailored to YOUR climate's specific challenges
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}