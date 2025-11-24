import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  TrendingUp, 
  Sparkles,
  CheckCircle,
  Calendar,
  Wrench,
  ChevronRight
} from 'lucide-react';

const TIER_CONFIG = {
  'Safety/Urgent': {
    icon: AlertCircle,
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-100 text-red-700'
  },
  'Preventive/ROI': {
    icon: TrendingUp,
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    badgeColor: 'bg-yellow-100 text-yellow-700'
  },
  'Comfort/Aesthetic': {
    icon: Sparkles,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-100 text-blue-700'
  }
};

export default function ActionItemsTierView({ items, onComplete, onSchedule, onRequestHelp }) {
  const [filter, setFilter] = useState('all');
  const [expandedTiers, setExpandedTiers] = useState({
    'Safety/Urgent': true,
    'Preventive/ROI': true,
    'Comfort/Aesthetic': true
  });

  const groupedItems = items.reduce((acc, item) => {
    const tier = item.tier || 'Preventive/ROI';
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(item);
    return acc;
  }, {});

  const toggleTier = (tier) => {
    setExpandedTiers(prev => ({ ...prev, [tier]: !prev[tier] }));
  };

  const tierOrder = ['Safety/Urgent', 'Preventive/ROI', 'Comfort/Aesthetic'];

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({items.length})
        </Button>
        {tierOrder.map(tier => {
          const count = groupedItems[tier]?.length || 0;
          const config = TIER_CONFIG[tier];
          return (
            <Button
              key={tier}
              variant={filter === tier ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(tier)}
              className={filter === tier ? config.badgeColor : ''}
            >
              {tier.split('/')[0]} ({count})
            </Button>
          );
        })}
      </div>

      {/* Tier Sections */}
      {tierOrder.map(tier => {
        const tierItems = groupedItems[tier] || [];
        if (tierItems.length === 0 || (filter !== 'all' && filter !== tier)) return null;

        const config = TIER_CONFIG[tier];
        const TierIcon = config.icon;

        return (
          <div key={tier} className="space-y-2">
            <button
              onClick={() => toggleTier(tier)}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 ${config.borderColor} ${config.bgColor} transition-colors hover:opacity-80`}
            >
              <div className="flex items-center gap-3">
                <TierIcon className={`w-5 h-5 ${config.textColor}`} />
                <div>
                  <div className={`font-bold ${config.textColor}`}>
                    {tier}
                  </div>
                  <div className="text-sm text-gray-600">
                    {tierItems.length} {tierItems.length === 1 ? 'item' : 'items'}
                  </div>
                </div>
              </div>
              <ChevronRight 
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedTiers[tier] ? 'rotate-90' : ''
                }`} 
              />
            </button>

            {expandedTiers[tier] && (
              <div className="space-y-2 pl-2">
                {tierItems.map(item => (
                  <Card key={item.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">
                            {item.title}
                          </div>
                          {item.description && (
                            <div className="text-sm text-gray-600 line-clamp-2">
                              {item.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {item.location && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {item.location}
                              </span>
                            )}
                            {item.estimated_cost && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                ${item.estimated_cost}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              Added {new Date(item.date_identified).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge className={config.badgeColor}>
                          {tier.split('/')[0]}
                        </Badge>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onComplete(item)}
                          className="gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSchedule(item)}
                          className="gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          Schedule
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRequestHelp(item)}
                          className="gap-2"
                        >
                          <Wrench className="w-4 h-4" />
                          Get Help
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {items.length === 0 && (
        <Card className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <div className="font-semibold text-gray-900 mb-1">
            All Clear!
          </div>
          <div className="text-sm text-gray-600">
            No action items at this time. Keep up the great work!
          </div>
        </Card>
      )}
    </div>
  );
}