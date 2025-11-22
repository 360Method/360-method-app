import React from 'react';
import { Building2, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PortfolioScoreHero({ portfolioScore, propertyCount, certification, message }) {
  const getColor = () => {
    if (portfolioScore >= 96) return 'from-purple-500 to-pink-500';
    if (portfolioScore >= 92) return 'from-yellow-400 to-yellow-600';
    if (portfolioScore >= 88) return 'from-gray-400 to-gray-600';
    if (portfolioScore >= 75) return 'from-amber-600 to-amber-800';
    return 'from-blue-400 to-blue-600';
  };

  const getCertBadge = () => {
    if (portfolioScore >= 96) return { text: '⭐⭐⭐⭐ Platinum Portfolio', color: 'bg-purple-600' };
    if (portfolioScore >= 92) return { text: '⭐⭐⭐ Gold Portfolio', color: 'bg-yellow-500' };
    if (portfolioScore >= 88) return { text: '⭐⭐ Silver Portfolio', color: 'bg-gray-500' };
    if (portfolioScore >= 75) return { text: '⭐ Bronze Portfolio', color: 'bg-amber-600' };
    return { text: 'Portfolio in Progress', color: 'bg-blue-600' };
  };

  const badge = getCertBadge();

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Portfolio Score</h1>
                <p className="text-gray-600">Across {propertyCount} properties</p>
              </div>
            </div>
          </div>
          
          {/* Large Score Display */}
          <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getColor()} flex items-center justify-center shadow-xl`}>
            <div className="text-center text-white">
              <div className="text-4xl font-bold">{portfolioScore}</div>
              <div className="text-sm opacity-90">/100</div>
            </div>
          </div>
        </div>

        <Badge className={`${badge.color} text-white text-lg px-4 py-1 mb-4`}>
          {badge.text}
        </Badge>

        <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
          <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <p className="text-gray-900 font-semibold mb-1">What this means:</p>
            <p className="text-gray-700">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}