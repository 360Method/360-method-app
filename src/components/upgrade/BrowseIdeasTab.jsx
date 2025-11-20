import React, { useState } from 'react';
import { Zap, Droplet, Home, Shield, Leaf, Sparkles, X, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

const UPGRADE_IDEAS = [
  {
    id: 'idea-1',
    title: 'Solar Panel Installation',
    category: 'Energy Efficiency',
    icon: Zap,
    color: 'yellow',
    
    typicalCost: { min: 15000, max: 25000 },
    annualSavings: { min: 1200, max: 2000 },
    paybackPeriod: { min: 7.5, max: 12.5 },
    roi10Year: '160-220%',
    
    benefits: [
      'Eliminate or drastically reduce electric bills',
      'Federal tax credit: 30% of installation cost',
      'Increase home value $15K-$30K',
      'Environmental impact: -7 tons CO2/year'
    ],
    
    considerations: [
      'Requires good roof condition (replace roof first if needed)',
      'Best with south-facing roof',
      'Check local incentives and net metering policies',
      'Typical installation: 2-3 days'
    ],
    
    difficulty: 'Professional Required',
    timeframe: '3-5 days installation',
    tags: ['High ROI', 'Tax Credit', 'Eco-Friendly']
  },
  {
    id: 'idea-2',
    title: 'Low-Flow Fixtures',
    category: 'Water Efficiency',
    icon: Droplet,
    color: 'blue',
    
    typicalCost: { min: 400, max: 1200 },
    annualSavings: { min: 150, max: 300 },
    paybackPeriod: { min: 1.3, max: 4 },
    roi10Year: '125-375%',
    
    benefits: [
      'Reduce water usage 20-40%',
      'Lower water & sewer bills',
      'Qualify for utility rebates ($50-$200)',
      'Easy DIY installation'
    ],
    
    considerations: [
      'WaterSense certified products recommended',
      'Check local rebate programs',
      'Minimal disruption to daily routine'
    ],
    
    difficulty: 'Easy DIY',
    timeframe: '2-4 hours',
    tags: ['Quick Win', 'DIY-Friendly', 'Rebates']
  },
  {
    id: 'idea-3',
    title: 'Energy-Efficient Windows',
    category: 'Energy Efficiency',
    icon: Home,
    color: 'purple',
    
    typicalCost: { min: 5000, max: 15000 },
    annualSavings: { min: 300, max: 600 },
    paybackPeriod: { min: 8.3, max: 25 },
    roi10Year: '40-120%',
    
    benefits: [
      'Reduce heating/cooling costs 15-25%',
      'Increase home value $5K-$10K',
      'Improve comfort (eliminate drafts)',
      'Noise reduction',
      'Federal tax credit available'
    ],
    
    considerations: [
      'Focus on worst-performing windows first',
      'Look for ENERGY STAR certified',
      'Consider climate zone ratings',
      'Professional installation recommended'
    ],
    
    difficulty: 'Professional Recommended',
    timeframe: '1-3 days',
    tags: ['High Impact', 'Tax Credit', 'Comfort']
  },
  {
    id: 'idea-4',
    title: 'Smart Security System',
    category: 'Security',
    icon: Shield,
    color: 'red',
    
    typicalCost: { min: 400, max: 1500 },
    annualSavings: { min: 100, max: 300 },
    paybackPeriod: { min: 1.3, max: 7.5 },
    roi10Year: '67-375%',
    
    benefits: [
      'Homeowners insurance discount (5-20%)',
      'Deter break-ins (visible cameras)',
      'Remote monitoring from phone',
      'Increase home value $1K-$2K'
    ],
    
    considerations: [
      'Monthly monitoring fee: $10-$50/month',
      'Wi-Fi required for smart features',
      'DIY systems (Ring, SimpliSafe) vs professional (ADT)',
      'Check insurance discount eligibility'
    ],
    
    difficulty: 'Easy DIY',
    timeframe: '2-6 hours',
    tags: ['Insurance Discount', 'DIY-Friendly', 'Peace of Mind']
  },
  {
    id: 'idea-5',
    title: 'Tankless Water Heater',
    category: 'Energy Efficiency',
    icon: Droplet,
    color: 'orange',
    
    typicalCost: { min: 1500, max: 3500 },
    annualSavings: { min: 100, max: 200 },
    paybackPeriod: { min: 7.5, max: 17.5 },
    roi10Year: '57-133%',
    
    benefits: [
      'Endless hot water (no running out)',
      '20-30% energy savings vs tank',
      'Lasts 20+ years (vs 10-15 for tank)',
      'Space-saving (wall-mounted)',
      'Federal tax credit available'
    ],
    
    considerations: [
      'Higher upfront cost than tank',
      'May require electrical/gas upgrades',
      'Size carefully for household demand',
      'Professional installation required'
    ],
    
    difficulty: 'Professional Required',
    timeframe: '4-8 hours',
    tags: ['Long Lifespan', 'Tax Credit', 'Comfort']
  },
  {
    id: 'idea-6',
    title: 'Landscaping for Curb Appeal',
    category: 'Quality of Life',
    icon: Leaf,
    color: 'green',
    
    typicalCost: { min: 2000, max: 8000 },
    annualSavings: { min: 0, max: 0 },
    resaleValueIncrease: { min: 5000, max: 15000 },
    roi: '150-250%',
    
    benefits: [
      'Increase home value $5K-$15K',
      'Improve neighborhood standing',
      'Personal enjoyment',
      'Potential HOA compliance'
    ],
    
    considerations: [
      'Native plants = lower water usage',
      'Professional design vs DIY',
      'Consider maintenance requirements',
      'Phased approach can spread cost'
    ],
    
    difficulty: 'Moderate DIY or Professional',
    timeframe: '1-5 days',
    tags: ['High ROI', 'Curb Appeal', 'Personal Joy']
  },
  {
    id: 'idea-7',
    title: 'Cabinet Refresh (Paint/Hardware)',
    category: 'Quality of Life',
    icon: Sparkles,
    color: 'pink',
    
    typicalCost: { min: 800, max: 2500 },
    annualSavings: { min: 0, max: 0 },
    resaleValueIncrease: { min: 3000, max: 8000 },
    roi: '200-400%',
    
    benefits: [
      'Dramatic visual impact for low cost',
      'Increase home value $3K-$8K',
      'Avoid full remodel ($15K-$40K)',
      'DIY-friendly project'
    ],
    
    considerations: [
      'Quality prep work is critical',
      'Use cabinet-specific paint/primer',
      'New hardware: $3-$15 per knob/pull',
      'Weekend project (2-4 days)'
    ],
    
    difficulty: 'Moderate DIY',
    timeframe: '2-4 days',
    tags: ['High ROI', 'DIY-Friendly', 'Visual Impact']
  },
  {
    id: 'idea-8',
    title: 'Smart Irrigation System',
    category: 'Water Efficiency',
    icon: Droplet,
    color: 'blue',
    
    typicalCost: { min: 600, max: 2000 },
    annualSavings: { min: 150, max: 400 },
    paybackPeriod: { min: 1.5, max: 6.7 },
    roi10Year: '75-333%',
    
    benefits: [
      'Reduce water usage 20-50%',
      'Healthier lawn/plants (optimal watering)',
      'Convenience (weather-based adjustments)',
      'Utility rebates available ($100-$500)'
    ],
    
    considerations: [
      'Smart controllers: $150-$400',
      'Professional installation vs DIY',
      'Check for local rebates',
      'Zone system = better efficiency'
    ],
    
    difficulty: 'Moderate DIY or Professional',
    timeframe: '1-2 days',
    tags: ['Water Savings', 'Rebates', 'Convenience']
  }
];

export default function BrowseIdeasTab() {
  const [filter, setFilter] = useState('all');
  const [selectedIdea, setSelectedIdea] = useState(null);

  const categories = ['all', 'Energy Efficiency', 'Water Efficiency', 'Security', 'Quality of Life'];

  const filteredIdeas = filter === 'all' 
    ? UPGRADE_IDEAS 
    : UPGRADE_IDEAS.filter(idea => idea.category === filter);

  return (
    <div>
      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              filter === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{ minHeight: '44px' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Ideas Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIdeas.map(idea => (
          <IdeaCard 
            key={idea.id} 
            idea={idea}
            onClick={() => setSelectedIdea(idea)}
          />
        ))}
      </div>

      {/* Detail Modal */}
      {selectedIdea && (
        <IdeaDetailModal 
          idea={selectedIdea}
          onClose={() => setSelectedIdea(null)}
        />
      )}
    </div>
  );
}

function IdeaCard({ idea, onClick }) {
  const colorClasses = {
    yellow: 'from-yellow-50 to-yellow-100 border-yellow-300 text-yellow-700',
    blue: 'from-blue-50 to-blue-100 border-blue-300 text-blue-700',
    purple: 'from-purple-50 to-purple-100 border-purple-300 text-purple-700',
    red: 'from-red-50 to-red-100 border-red-300 text-red-700',
    orange: 'from-orange-50 to-orange-100 border-orange-300 text-orange-700',
    green: 'from-green-50 to-green-100 border-green-300 text-green-700',
    pink: 'from-pink-50 to-pink-100 border-pink-300 text-pink-700'
  };

  const Icon = idea.icon;

  return (
    <Card 
      onClick={onClick}
      className={`bg-gradient-to-br ${colorClasses[idea.color].split(' ')[0]} ${colorClasses[idea.color].split(' ')[1]} border-2 ${colorClasses[idea.color].split(' ')[2]} cursor-pointer hover:shadow-lg transition-all`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 bg-${idea.color}-200 rounded-full flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${colorClasses[idea.color].split(' ')[3]}`} />
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {idea.tags.slice(0, 2).map(tag => (
              <span key={tag} className={`px-2 py-1 bg-${idea.color}-200 text-${idea.color}-800 text-xs rounded-full font-semibold`}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <h3 className="font-bold text-gray-900 text-lg mb-2">{idea.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{idea.category}</p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Cost:</span>
            <span className="font-semibold">
              ${(idea.typicalCost.min / 1000).toFixed(1)}K-${(idea.typicalCost.max / 1000).toFixed(1)}K
            </span>
          </div>

          {idea.annualSavings.max > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Savings:</span>
                <span className="font-semibold text-green-600">
                  ${idea.annualSavings.min}-${idea.annualSavings.max}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payback:</span>
                <span className="font-semibold">
                  {idea.paybackPeriod.min.toFixed(1)}-{idea.paybackPeriod.max.toFixed(1)} years
                </span>
              </div>
            </>
          )}

          {idea.resaleValueIncrease && (
            <div className="flex justify-between">
              <span className="text-gray-600">Resale Value:</span>
              <span className="font-semibold text-purple-600">
                +${(idea.resaleValueIncrease.min / 1000).toFixed(0)}K-${(idea.resaleValueIncrease.max / 1000).toFixed(0)}K
              </span>
            </div>
          )}
        </div>

        <button className="mt-4 w-full px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 font-semibold text-sm transition-colors">
          View Details →
        </button>
      </CardContent>
    </Card>
  );
}

function IdeaDetailModal({ idea, onClose }) {
  const Icon = idea.icon;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-16 h-16 bg-${idea.color}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-8 h-8 text-${idea.color}-600`} />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{idea.title}</h2>
              <p className="text-gray-600">{idea.category}</p>
              <div className="flex gap-2 mt-2">
                {idea.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cost & ROI */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Typical Cost</div>
              <div className="text-2xl font-bold text-gray-900">
                ${(idea.typicalCost.min / 1000).toFixed(1)}K-${(idea.typicalCost.max / 1000).toFixed(1)}K
              </div>
            </div>

            {idea.annualSavings.max > 0 && (
              <>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-700 mb-1">Annual Savings</div>
                  <div className="text-2xl font-bold text-green-900">
                    ${idea.annualSavings.min}-${idea.annualSavings.max}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-700 mb-1">10-Year ROI</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {idea.roi10Year}
                  </div>
                </div>
              </>
            )}

            {idea.resaleValueIncrease && (
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-700 mb-1">Resale Value</div>
                <div className="text-2xl font-bold text-purple-900">
                  +${(idea.resaleValueIncrease.min / 1000).toFixed(0)}K-${(idea.resaleValueIncrease.max / 1000).toFixed(0)}K
                </div>
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Benefits</h3>
            <ul className="space-y-2">
              {idea.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Considerations */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Considerations</h3>
            <ul className="space-y-2">
              {idea.considerations.map((consideration, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <div className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600 font-bold">•</div>
                  <span>{consideration}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Implementation */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Implementation</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Difficulty:</div>
                <div className="font-semibold text-gray-900">{idea.difficulty}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Timeframe:</div>
                <div className="font-semibold text-gray-900">{idea.timeframe}</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={() => {}}
            className="w-full bg-blue-600 hover:bg-blue-700"
            style={{ minHeight: '48px' }}
          >
            Add to My Projects
          </Button>
        </div>
      </div>
    </div>
  );
}