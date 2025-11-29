import React, { useState } from 'react';
import { Zap, Home, Leaf, Sparkles, X, CheckCircle, Shield, Droplet, Wind, Lightbulb, Palette } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useDemo } from '../shared/DemoContext';

const HOMEOWNER_UPGRADE_IDEAS = [
  {
    id: 'home-1',
    title: 'Smart Home Energy System',
    category: 'Energy Efficiency',
    icon: Lightbulb,
    color: 'yellow',
    image: 'https://images.unsplash.com/photo-1567789884554-0b844b597180?w=600&h=400&fit=crop', // Smart thermostat on wall

    typicalCost: { min: 1500, max: 3000 },
    annualSavings: { min: 450, max: 750 },
    paybackPeriod: { min: 2.0, max: 6.7 },
    roi10Year: '150-500%',
    
    benefits: [
      'Smart thermostats + LED conversion bundle',
      'Reduce energy bills 20-30% year-round',
      'Remote control from phone',
      'Track usage patterns and optimize',
      'Increase home value $2K-$3K'
    ],
    
    considerations: [
      'Smart thermostats: $250-500 each',
      'LED conversion: $350-600 for whole home',
      'DIY-friendly installation',
      'Immediate comfort improvement'
    ],
    
    difficulty: 'Easy DIY',
    timeframe: '1 weekend',
    tags: ['Energy Savings', 'DIY-Friendly', 'Quick Payback']
  },
  {
    id: 'home-2',
    title: 'Attic Insulation Upgrade',
    category: 'Energy Efficiency',
    icon: Home,
    color: 'orange',
    image: 'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=600&h=400&fit=crop', // Attic insulation installation

    typicalCost: { min: 1800, max: 2800 },
    annualSavings: { min: 350, max: 600 },
    paybackPeriod: { min: 3.0, max: 8.0 },
    roi10Year: '125-333%',
    
    benefits: [
      'Reduce heating/cooling costs 25-35%',
      'Even temperature throughout home',
      'Less HVAC strain = longer equipment life',
      'Quieter home (sound dampening)',
      'Increase home value $1,500-$2,000'
    ],
    
    considerations: [
      'Boost from R-30 to R-49 (Pacific NW)',
      'Professional blown-in installation',
      'One-time investment, lifetime benefit',
      'Eligible for tax credits'
    ],
    
    difficulty: 'Professional Recommended',
    timeframe: '1 day',
    tags: ['Energy Savings', 'Comfort', 'Tax Credit']
  },
  {
    id: 'home-3',
    title: 'Kitchen Refresh Package',
    category: 'Quality of Life',
    icon: Palette,
    color: 'purple',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop', // Modern kitchen renovation

    typicalCost: { min: 3500, max: 6500 },
    annualSavings: { min: 0, max: 0 },
    resaleValueIncrease: { min: 5000, max: 9000 },
    roi: '140-180%',
    
    benefits: [
      'Subway tile backsplash + cabinet refresh',
      'Modern look without full remodel',
      'Easier to clean and maintain',
      'Start every day in a space you love',
      'Increase home value $5K-$9K'
    ],
    
    considerations: [
      'DIY backsplash: Save $1,200 in labor',
      'Paint cabinets vs replace (10x cheaper)',
      'New hardware makes huge impact',
      'Weekend project with big visual impact'
    ],
    
    difficulty: 'Moderate DIY',
    timeframe: '2-3 weekends',
    tags: ['Quality of Life', 'DIY Option', 'High Impact']
  },
  {
    id: 'home-4',
    title: 'Water Conservation System',
    category: 'Energy Efficiency',
    icon: Droplet,
    color: 'blue',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop', // Smart irrigation sprinkler system

    typicalCost: { min: 800, max: 1500 },
    annualSavings: { min: 200, max: 400 },
    paybackPeriod: { min: 2.0, max: 7.5 },
    roi10Year: '133-500%',
    
    benefits: [
      'Low-flow fixtures + smart irrigation',
      'Reduce water bills 30-40%',
      'Drought-resistant landscaping',
      'Smart sprinkler controller saves water',
      'Eco-friendly + lower utility costs'
    ],
    
    considerations: [
      'Low-flow showerheads/faucets: $200-400',
      'Smart irrigation controller: $150-300',
      'Native plants reduce water needs',
      'Fast DIY installation'
    ],
    
    difficulty: 'Easy DIY',
    timeframe: '1 day',
    tags: ['Water Savings', 'Eco-Friendly', 'DIY-Friendly']
  },
  {
    id: 'home-5',
    title: 'Outdoor Living Space',
    category: 'Quality of Life',
    icon: Leaf,
    color: 'green',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop', // Outdoor patio deck with furniture

    typicalCost: { min: 2500, max: 5000 },
    annualSavings: { min: 0, max: 0 },
    resaleValueIncrease: { min: 4000, max: 7500 },
    roi: '150-200%',
    
    benefits: [
      'Deck refresh + patio upgrade',
      'Extend living space outdoors',
      'Perfect for entertaining guests',
      'Enjoy Pacific NW summers',
      'Increase home value $4K-$7.5K'
    ],
    
    considerations: [
      'Deck staining/sealing: $800-1,500',
      'Patio furniture + fire pit: $1,200-2,500',
      'String lights + landscaping: $500-1,000',
      'Creates outdoor room for enjoyment'
    ],
    
    difficulty: 'DIY or Professional',
    timeframe: '1-2 weekends',
    tags: ['Quality of Life', 'Entertaining', 'Resale Value']
  },
  {
    id: 'home-6',
    title: 'Bathroom Modernization',
    category: 'Quality of Life',
    icon: Sparkles,
    color: 'blue',
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop', // Modern bathroom with vanity

    typicalCost: { min: 3000, max: 5500 },
    annualSavings: { min: 0, max: 0 },
    resaleValueIncrease: { min: 5500, max: 9000 },
    roi: '164-250%',
    
    benefits: [
      'New vanity, fixtures, and lighting',
      'Spa-like experience at home',
      'Modern, clean aesthetic',
      'Improved functionality',
      'Increase home value $5.5K-$9K'
    ],
    
    considerations: [
      'Focus on high-impact updates',
      'Paint, fixtures, hardware = biggest impact',
      'Skip full gut remodel',
      'Can DIY many components'
    ],
    
    difficulty: 'Moderate DIY or Professional',
    timeframe: '1-2 weekends',
    tags: ['Quality of Life', 'High ROI', 'Daily Use']
  },
  {
    id: 'home-7',
    title: 'Whole-Home Air Quality',
    category: 'Health & Safety',
    icon: Wind,
    color: 'purple',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=400&fit=crop', // HVAC air quality system

    typicalCost: { min: 1200, max: 2200 },
    annualSavings: { min: 0, max: 0 },
    healthBenefit: 'Significant',
    
    benefits: [
      'HEPA filtration + ventilation upgrade',
      'Reduce allergens and pollutants',
      'Better sleep quality',
      'Healthier indoor environment',
      'Especially valuable for families with allergies'
    ],
    
    considerations: [
      'Whole-home HEPA: $800-1,500',
      'Smart air quality monitors: $150-300',
      'ERV/HRV ventilation: $1,500-3,000',
      'Health investment, not just financial ROI'
    ],
    
    difficulty: 'Professional Required',
    timeframe: '1 day',
    tags: ['Health', 'Quality of Life', 'Family Friendly']
  },
  {
    id: 'home-8',
    title: 'Garage Workshop Setup',
    category: 'Quality of Life',
    icon: Home,
    color: 'orange',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop', // Organized garage workshop

    typicalCost: { min: 1500, max: 3000 },
    annualSavings: { min: 0, max: 0 },
    diySavings: 'High',
    
    benefits: [
      'Workbench + tool storage + lighting',
      'Enable more DIY projects',
      'Save on contractor costs long-term',
      'Functional workspace for hobbies',
      'Organized, efficient storage'
    ],
    
    considerations: [
      'Quality workbench: $400-800',
      'Tool storage system: $600-1,200',
      'LED lighting upgrade: $200-400',
      'Enables DIY for future projects'
    ],
    
    difficulty: 'Easy DIY',
    timeframe: '2-3 days',
    tags: ['DIY Enabler', 'Organization', 'Hobby Space']
  }
];

const INVESTOR_UPGRADE_IDEAS = [
  {
    id: 'idea-1',
    title: 'In-Unit Washer/Dryer Hookups',
    category: 'Rental Income Boosters',
    icon: Sparkles,
    color: 'purple',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&h=400&fit=crop', // Washer dryer laundry room

    typicalCost: { min: 2500, max: 3500 },
    rentIncrease: { min: 75, max: 125 },
    annualIncome: { min: 900, max: 1500 },
    paybackPeriod: { min: 1.7, max: 3.9 },
    roi10Year: '257-600%',
    
    benefits: [
      'Increase rent $75-$125/month per unit',
      'Appeal to premium tenants (families, professionals)',
      'Reduce tenant turnover',
      'Competitive advantage in rental market',
      'Tenants cover water/electricity for W/D'
    ],
    
    considerations: [
      'Requires 120V outlet + water supply + drain',
      'May need electrical panel upgrade',
      'Cost per unit: $2,500-$3,500',
      'Consider stackable units for small spaces'
    ],
    
    difficulty: 'Professional Required',
    timeframe: '1-2 days per unit',
    tags: ['Rent Boost', 'Tenant Retention', 'High ROI']
  },
  {
    id: 'idea-2',
    title: 'Unit Refresh Package',
    category: 'Rental Income Boosters',
    icon: Home,
    color: 'green',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop', // Modern apartment living room

    typicalCost: { min: 3500, max: 5500 },
    rentIncrease: { min: 100, max: 200 },
    annualIncome: { min: 1200, max: 2400 },
    paybackPeriod: { min: 1.5, max: 4.6 },
    roi10Year: '218-686%',
    
    benefits: [
      'Justify $100-$200/month rent increase',
      'New flooring, paint, fixtures, hardware',
      'Attract quality tenants faster',
      'Reduce vacancy time by 7-14 days',
      'Compete with new construction rentals'
    ],
    
    considerations: [
      'Schedule during turnover (no tenant disruption)',
      'LVP flooring is durable + renter-friendly',
      'Fresh paint = instant transformation',
      'Modern fixtures signal "well-maintained"'
    ],
    
    difficulty: 'Professional Recommended',
    timeframe: '3-5 days',
    tags: ['Rent Boost', 'Fast Lease', 'Premium Tenants']
  },
  {
    id: 'idea-3',
    title: 'Energy-Efficient Windows',
    category: 'Energy Efficiency',
    icon: Home,
    color: 'blue',
    image: 'https://images.unsplash.com/photo-1604079628040-94301bb21b91?w=600&h=400&fit=crop', // Window installation

    typicalCost: { min: 2500, max: 3500 },
    annualSavings: { min: 150, max: 300 },
    paybackPeriod: { min: 8.3, max: 23.3 },
    roi10Year: '43-120%',
    
    benefits: [
      'Reduce tenant utility complaints',
      'Cut heating/cooling costs 15-25%',
      'Justify premium rent ($30-50/mo)',
      'Improve tenant comfort = retention',
      'Reduce maintenance calls (no drafts)'
    ],
    
    considerations: [
      'Cost per unit: $2,500-$3,500 for typical rental',
      'Double-pane minimum for rental market',
      'Schedule during turnover if possible',
      'Tenants appreciate lower utility bills'
    ],
    
    difficulty: 'Professional Required',
    timeframe: '1-2 days per unit',
    tags: ['Tenant Comfort', 'Energy Savings', 'Rent Boost']
  },
  {
    id: 'idea-4',
    title: 'Smart Home Package',
    category: 'Rental Income Boosters',
    icon: Shield,
    color: 'purple',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=400&fit=crop', // Smart home devices

    typicalCost: { min: 800, max: 1500 },
    rentIncrease: { min: 50, max: 75 },
    annualIncome: { min: 600, max: 900 },
    paybackPeriod: { min: 0.9, max: 2.5 },
    roi10Year: '400-1125%',
    
    benefits: [
      'Justify $50-$75/month rent premium',
      'Smart locks = remote access (no keys)',
      'Smart thermostat = energy monitoring',
      'Video doorbell = tenant safety',
      'Appeal to tech-savvy renters'
    ],
    
    considerations: [
      'One-time purchase, no monthly fees',
      'Remote property access for emergencies',
      'Energy monitoring helps catch HVAC abuse',
      'Market as "Smart Home Rental"'
    ],
    
    difficulty: 'Moderate DIY',
    timeframe: '4-6 hours',
    tags: ['Rent Boost', 'Remote Access', 'Premium Appeal']
  },
  {
    id: 'idea-5',
    title: 'Landscaping & Curb Appeal',
    category: 'Curb Appeal',
    icon: Leaf,
    color: 'green',
    image: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600&h=400&fit=crop', // Professional landscaping yard

    typicalCost: { min: 1500, max: 3500 },
    annualIncome: { min: 0, max: 0 },
    resaleValueIncrease: { min: 3000, max: 6000 },
    roi: '133-400%',
    
    benefits: [
      'Reduce vacancy time 5-10 days',
      'First impressions = faster lease',
      'Justify higher rent tier',
      'Fewer tenant complaints about "curb appeal"',
      'Property value boost: $3K-$6K'
    ],
    
    considerations: [
      'Low-maintenance landscaping = less cost',
      'Native plants reduce water usage',
      'Bark mulch + clean beds = instant upgrade',
      'Good lighting = safety + visual appeal'
    ],
    
    difficulty: 'DIY or Professional',
    timeframe: '2-3 days',
    tags: ['Fast Lease', 'Property Value', 'Tenant Appeal']
  },
  {
    id: 'idea-6',
    title: 'Durable Flooring (LVP)',
    category: 'Rental Income Boosters',
    icon: Home,
    color: 'orange',
    image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600&h=400&fit=crop', // Luxury vinyl plank flooring

    typicalCost: { min: 2500, max: 4500 },
    rentIncrease: { min: 50, max: 100 },
    annualIncome: { min: 600, max: 1200 },
    paybackPeriod: { min: 2.1, max: 7.5 },
    roi10Year: '133-480%',
    
    benefits: [
      'Luxury Vinyl Plank = waterproof + durable',
      'Withstands tenant wear (pets, kids)',
      'Looks like hardwood, costs less',
      'Easy to clean = lower turnover costs',
      'Justify $50-$100/mo rent increase'
    ],
    
    considerations: [
      'LVP > carpet for rentals (longevity)',
      'Cost per sqft: $2.50-$4.50 installed',
      'Schedule during turnover',
      'Saves on carpet replacement every 3-5 years'
    ],
    
    difficulty: 'Professional Recommended',
    timeframe: '2-3 days',
    tags: ['Durable', 'Rent Boost', 'Low Maintenance']
  },
  {
    id: 'idea-7',
    title: 'LED Lighting Conversion',
    category: 'Energy Efficiency',
    icon: Zap,
    color: 'yellow',
    image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&h=400&fit=crop', // LED lighting installation

    typicalCost: { min: 200, max: 500 },
    annualSavings: { min: 120, max: 300 },
    paybackPeriod: { min: 0.7, max: 4.2 },
    roi10Year: '240-1500%',
    
    benefits: [
      'Reduce electric bill 50-75%',
      'LEDs last 10+ years (no bulb replacements)',
      'Brighter, better tenant experience',
      'Minimal investment, fast payback',
      'Landlord or tenant pays less on utilities'
    ],
    
    considerations: [
      'Cost per unit: $200-$500 for full conversion',
      'DIY-friendly installation',
      'Instant upgrade feel',
      'Great for turnover prep'
    ],
    
    difficulty: 'Easy DIY',
    timeframe: '2-4 hours per unit',
    tags: ['Quick Win', 'Energy Savings', 'DIY-Friendly']
  },
  {
    id: 'idea-8',
    title: 'Parking Lot Improvements',
    category: 'Curb Appeal',
    icon: Home,
    color: 'red',
    image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&h=400&fit=crop', // Parking lot with striping

    typicalCost: { min: 1500, max: 3500 },
    annualIncome: { min: 0, max: 0 },
    resaleValueIncrease: { min: 2500, max: 5000 },
    roi: '100-333%',
    
    benefits: [
      'Defined spaces = fewer tenant disputes',
      'LED security lighting = safety perception',
      'Seal coating extends asphalt life 5+ years',
      'Professional appearance = tenant retention',
      'Property value boost'
    ],
    
    considerations: [
      'Multi-unit properties only',
      'Striping: $500-$1,200',
      'LED lighting: $800-$1,500',
      'Seal coating: $600-$1,200'
    ],
    
    difficulty: 'Professional Required',
    timeframe: '2-3 days',
    tags: ['Safety', 'Tenant Satisfaction', 'Property Value']
  }
];

export default function BrowseIdeasTab() {
  const { demoMode, isInvestor } = useDemo();
  const [filter, setFilter] = useState('all');
  const [selectedIdea, setSelectedIdea] = useState(null);

  // Use homeowner ideas in homeowner demo mode, investor ideas otherwise
  const UPGRADE_IDEAS = (demoMode && !isInvestor) ? HOMEOWNER_UPGRADE_IDEAS : INVESTOR_UPGRADE_IDEAS;

  const categories = (demoMode && !isInvestor) 
    ? ['all', 'Energy Efficiency', 'Quality of Life', 'Health & Safety']
    : ['all', 'Rental Income Boosters', 'Energy Efficiency', 'Curb Appeal'];

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
    yellow: 'border-yellow-300 text-yellow-700 bg-yellow-100',
    blue: 'border-blue-300 text-blue-700 bg-blue-100',
    purple: 'border-purple-300 text-purple-700 bg-purple-100',
    red: 'border-red-300 text-red-700 bg-red-100',
    orange: 'border-orange-300 text-orange-700 bg-orange-100',
    green: 'border-green-300 text-green-700 bg-green-100',
    pink: 'border-pink-300 text-pink-700 bg-pink-100'
  };

  const Icon = idea.icon;

  return (
    <Card
      onClick={onClick}
      className="border-2 border-gray-200 cursor-pointer hover:shadow-xl transition-all overflow-hidden group"
    >
      {/* Image Header */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={idea.image}
          alt={idea.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-bold text-white text-lg drop-shadow-lg">{idea.title}</h3>
          <p className="text-sm text-white/90">{idea.category}</p>
        </div>
        <div className="absolute top-3 right-3 flex gap-1">
          {idea.tags.slice(0, 1).map(tag => (
            <span key={tag} className="px-2 py-1 bg-white/90 text-gray-800 text-xs rounded-full font-semibold shadow">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <CardContent className="p-4">

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Cost:</span>
            <span className="font-semibold">
              ${(idea.typicalCost.min / 1000).toFixed(1)}K-${(idea.typicalCost.max / 1000).toFixed(1)}K
            </span>
          </div>

          {idea.rentIncrease && (
            <div className="flex justify-between">
              <span className="text-gray-600">Rent Increase:</span>
              <span className="font-semibold text-green-600">
                +${idea.rentIncrease.min}-${idea.rentIncrease.max}/mo
              </span>
            </div>
          )}

          {idea.annualSavings && idea.annualSavings.max > 0 && (
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

          {idea.annualIncome && (
            <div className="flex justify-between">
              <span className="text-gray-600">Annual Income:</span>
              <span className="font-semibold text-green-600">
                +${idea.annualIncome.min}-${idea.annualIncome.max}
              </span>
            </div>
          )}

          {idea.resaleValueIncrease && (
            <div className="flex justify-between">
              <span className="text-gray-600">Value Added:</span>
              <span className="font-semibold text-purple-600">
                +${(idea.resaleValueIncrease.min / 1000).toFixed(1)}K-${(idea.resaleValueIncrease.max / 1000).toFixed(1)}K
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
        {/* Hero Image */}
        <div className="relative h-56 md:h-64 overflow-hidden rounded-t-2xl">
          <img
            src={idea.image}
            alt={idea.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex gap-2 mb-2">
              {idea.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-white/90 text-gray-800 text-xs rounded-full font-semibold">
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">{idea.title}</h2>
            <p className="text-white/90">{idea.category}</p>
          </div>
        </div>

        <div className="p-6 md:p-8">

          {/* Cost & ROI */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Typical Cost</div>
              <div className="text-2xl font-bold text-gray-900">
                ${(idea.typicalCost.min / 1000).toFixed(1)}K-${(idea.typicalCost.max / 1000).toFixed(1)}K
              </div>
            </div>

            {idea.rentIncrease && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-700 mb-1">Monthly Rent Boost</div>
                <div className="text-2xl font-bold text-green-900">
                  +${idea.rentIncrease.min}-${idea.rentIncrease.max}
                </div>
              </div>
            )}

            {idea.annualIncome && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-700 mb-1">Annual Income</div>
                <div className="text-2xl font-bold text-blue-900">
                  +${idea.annualIncome.min.toLocaleString()}-${idea.annualIncome.max.toLocaleString()}
                </div>
              </div>
            )}

            {idea.annualSavings && idea.annualSavings.max > 0 && (
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
                <div className="text-sm text-purple-700 mb-1">Property Value</div>
                <div className="text-2xl font-bold text-purple-900">
                  +${(idea.resaleValueIncrease.min / 1000).toFixed(1)}K-${(idea.resaleValueIncrease.max / 1000).toFixed(1)}K
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