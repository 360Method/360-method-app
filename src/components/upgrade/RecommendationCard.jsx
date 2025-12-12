import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Zap,
  Home,
  Droplet,
  Wind,
  Lightbulb,
  Wrench
} from 'lucide-react';
import { EquityGainSummary } from './EquityGainBadge';

// Icons for different system types
const SYSTEM_ICONS = {
  'HVAC': Wind,
  'Furnace': Wind,
  'Air Conditioner': Wind,
  'Heat Pump': Wind,
  'Roof': Home,
  'Water Heater': Droplet,
  'Windows': Home,
  'Siding': Home,
  'Kitchen': Home,
  'Bathroom': Droplet,
  'Electrical Panel': Zap,
  'Plumbing': Droplet,
  'Insulation': Home,
  'Flooring': Home,
  'Deck': Home,
  'Fence': Home,
  'Garage Door': Home,
  'Gutters': Droplet,
  'Appliances': Lightbulb,
};

// Stock images for recommendations
const RECOMMENDATION_IMAGES = {
  'HVAC': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=400&fit=crop',
  'Furnace': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=400&fit=crop',
  'Air Conditioner': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=400&fit=crop',
  'Heat Pump': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=400&fit=crop',
  'Roof': 'https://images.unsplash.com/photo-1632759145889-7b5b9c2e9d4a?w=600&h=400&fit=crop',
  'Water Heater': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=400&fit=crop',
  'Windows': 'https://images.unsplash.com/photo-1604079628040-94301bb21b91?w=600&h=400&fit=crop',
  'Siding': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
  'Kitchen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop',
  'Bathroom': 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop',
  'Electrical Panel': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop',
  'Plumbing': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=400&fit=crop',
  'Insulation': 'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=600&h=400&fit=crop',
  'Flooring': 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600&h=400&fit=crop',
  'Deck': 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop',
  'Fence': 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600&h=400&fit=crop',
  'Garage Door': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
  'Gutters': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
  'Appliances': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop',
  default: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop',
};

/**
 * RecommendationCard - Displays a personalized upgrade recommendation
 * with "WHY" explanation and equity math
 */
export default function RecommendationCard({
  recommendation,
  onStartProject,
  compact = false,
  className = ''
}) {
  const {
    title,
    systemType,
    whyText,
    category,
    estimatedCost,
    valueImpact,
    netGain,
    priority,
    annual_savings,
    urgencyScore,
  } = recommendation;

  const Icon = SYSTEM_ICONS[systemType] || Wrench;
  const imageUrl = RECOMMENDATION_IMAGES[systemType] || RECOMMENDATION_IMAGES.default;

  // Priority badge styling
  const priorityConfig = {
    urgent: {
      label: 'Urgent',
      className: 'bg-red-600 text-white',
      icon: AlertTriangle,
    },
    soon: {
      label: 'Plan Soon',
      className: 'bg-amber-500 text-white',
      icon: Clock,
    },
    consider: {
      label: 'Consider',
      className: 'bg-blue-600 text-white',
      icon: CheckCircle,
    },
  };

  const priorityInfo = priorityConfig[priority] || priorityConfig.consider;
  const PriorityIcon = priorityInfo.icon;

  if (compact) {
    return (
      <Card className={`border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer ${className}`}
            onClick={() => onStartProject?.(recommendation)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="w-5 h-5 text-blue-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`text-xs ${priorityInfo.className}`}>
                  {priorityInfo.label}
                </Badge>
                <Badge variant="outline" className="text-xs bg-blue-50">
                  <Sparkles className="w-3 h-3 mr-1" />
                  For You
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{whyText}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-gray-600">
                  ${estimatedCost?.toLocaleString()}
                </span>
                <span className={netGain >= 0 ? 'text-green-700 font-semibold' : 'text-amber-700 font-semibold'}>
                  {netGain >= 0 ? '+' : ''}{netGain?.toLocaleString()} equity
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden hover:shadow-lg transition-all ${className}`}>
      {/* Image Header */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge className="bg-blue-600 text-white shadow-lg">
            <Sparkles className="w-3 h-3 mr-1" />
            For You
          </Badge>
          <Badge className={`shadow-lg ${priorityInfo.className}`}>
            <PriorityIcon className="w-3 h-3 mr-1" />
            {priorityInfo.label}
          </Badge>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white drop-shadow-lg">{title}</h3>
          <p className="text-sm text-white/90">{category}</p>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* WHY Banner - The "aha moment" */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800 mb-1">Why Now</p>
              <p className="text-sm text-amber-900 leading-relaxed">{whyText}</p>
            </div>
          </div>
        </div>

        {/* Simple Equity Math */}
        <EquityGainSummary
          investment={estimatedCost}
          valueAdded={valueImpact}
          annualSavings={annual_savings}
        />

        {/* Annual Savings (if applicable) */}
        {annual_savings > 0 && (
          <div className="flex items-center justify-center gap-2 py-2 bg-green-50 rounded-lg">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">
              <strong>${annual_savings.toLocaleString()}</strong> annual energy savings
            </span>
          </div>
        )}

        {/* CTA Button */}
        <Button
          onClick={() => onStartProject?.(recommendation)}
          className="w-full bg-blue-600 hover:bg-blue-700"
          style={{ minHeight: '44px' }}
        >
          Start This Project
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * RecommendationCardSkeleton - Loading state
 */
export function RecommendationCardSkeleton() {
  return (
    <Card className="border-2 border-gray-200 overflow-hidden animate-pulse">
      <div className="h-36 bg-gray-200" />
      <CardContent className="p-4 space-y-4">
        <div className="h-20 bg-gray-100 rounded-lg" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 bg-gray-100 rounded-lg" />
          <div className="h-16 bg-gray-100 rounded-lg" />
          <div className="h-16 bg-gray-100 rounded-lg" />
        </div>
        <div className="h-11 bg-gray-200 rounded-lg" />
      </CardContent>
    </Card>
  );
}
