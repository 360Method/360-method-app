import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';

export default function PortfolioDistribution({ properties, visualization = 'bars' }) {
  const navigate = useNavigate();
  
  const getTierBadge = (tier) => {
    const configs = {
      'Platinum': { color: 'bg-purple-600', stars: '👑' },
      'Gold': { color: 'bg-yellow-500', stars: '⭐⭐⭐' },
      'Silver': { color: 'bg-gray-500', stars: '⭐⭐' },
      'Bronze': { color: 'bg-amber-600', stars: '⭐' },
      'Participant': { color: 'bg-blue-600', stars: '' },
      'Fair': { color: 'bg-gray-400', stars: '' }
    };
    return configs[tier] || configs['Fair'];
  };

  const getScoreColor = (score) => {
    if (score >= 92) return 'bg-yellow-500';
    if (score >= 88) return 'bg-gray-500';
    if (score >= 75) return 'bg-amber-600';
    if (score >= 65) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const sortedProperties = [...properties].sort((a, b) => b.score - a.score);

  if (visualization === 'bars') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Property Distribution</CardTitle>
          <p className="text-sm text-gray-600">All properties ranked by score</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedProperties.map((property, idx) => {
              const tierConfig = getTierBadge(property.tier);
              return (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-12 h-12 rounded-full ${getScoreColor(property.score)} flex items-center justify-center text-white font-bold`}>
                        {property.score}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{property.name}</p>
                        <Badge className={`${tierConfig.color} text-white text-xs`}>
                          {tierConfig.stars} {property.tier}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Progress value={property.score} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}