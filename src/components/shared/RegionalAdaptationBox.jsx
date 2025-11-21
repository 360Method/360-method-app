import React, { useState } from 'react';
import { MapPin, Info, ChevronDown, ChevronUp, Droplet, Sun, Snowflake, Wind } from 'lucide-react';

const CLIMATE_EXAMPLES = {
  'pacific-northwest': {
    name: 'Pacific Northwest',
    icon: Droplet,
    color: 'blue',
    bgLight: 'bg-blue-50',
    bgMedium: 'bg-blue-100',
    bgDark: 'bg-blue-200',
    border: 'border-blue-300',
    text: 'text-blue-700',
    textDark: 'text-blue-800',
    textDarker: 'text-blue-900',
    description: 'Wet winters, mild summers'
  },
  'southwest': {
    name: 'Southwest Desert',
    icon: Sun,
    color: 'orange',
    bgLight: 'bg-orange-50',
    bgMedium: 'bg-orange-100',
    bgDark: 'bg-orange-200',
    border: 'border-orange-300',
    text: 'text-orange-700',
    textDark: 'text-orange-800',
    textDarker: 'text-orange-900',
    description: 'Extreme heat, low humidity, monsoons'
  },
  'midwest-northeast': {
    name: 'Midwest/Northeast',
    icon: Snowflake,
    color: 'purple',
    bgLight: 'bg-purple-50',
    bgMedium: 'bg-purple-100',
    bgDark: 'bg-purple-200',
    border: 'border-purple-300',
    text: 'text-purple-700',
    textDark: 'text-purple-800',
    textDarker: 'text-purple-900',
    description: 'Freezing winters, hot summers'
  },
  'southeast': {
    name: 'Southeast/Gulf Coast',
    icon: Wind,
    color: 'green',
    bgLight: 'bg-green-50',
    bgMedium: 'bg-green-100',
    bgDark: 'bg-green-200',
    border: 'border-green-300',
    text: 'text-green-700',
    textDark: 'text-green-800',
    textDarker: 'text-green-900',
    description: 'High humidity, hurricanes, heat'
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
    <div className={`${region.bgLight} border-2 ${region.border} rounded-xl p-6 mb-8`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 ${region.bgDark} rounded-full flex items-center justify-center flex-shrink-0`}>
          <MapPin className={`w-6 h-6 ${region.text}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <h3 className={`font-bold ${region.textDarker} text-lg flex items-center gap-2`}>
              <IconComponent className="w-5 h-5" />
              Regional Climate Adaptation
            </h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`${region.text} hover:opacity-80 flex items-center gap-1 text-sm font-semibold`}
            >
              <Info className="w-4 h-4" />
              {isExpanded ? 'Hide' : 'Learn More'}
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {!isExpanded ? (
            // Collapsed View
            <div>
              <p className={`${region.textDark} mb-2`}>
                <strong>Demo Location: {region.name}</strong> ({region.description})
              </p>
              <p className={`text-sm ${region.text}`}>
                This demo shows {step} adapted for {region.name} climate. 
                The real app automatically adjusts based on <strong>your property's zip code</strong>.
              </p>
            </div>
          ) : (
            // Expanded View
            <div className="space-y-4">
              <div>
                <p className={`${region.textDark} mb-2`}>
                  <strong>Demo Location: {region.name}</strong>
                </p>
                <p className={`text-sm ${region.text} mb-4`}>
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
                        isDemo ? climate.border : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <ClimateIcon className={`w-5 h-5 ${climate.text}`} />
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
              <div className={`${region.bgMedium} rounded-lg p-3 text-center`}>
                <p className={`text-xs ${region.textDarker} font-semibold`}>
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