import React from 'react';
import { Award, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const CERTIFICATION_LEVELS = {
  platinum: { label: 'Platinum', color: 'bg-gradient-to-r from-gray-300 to-gray-400', textColor: 'text-white', minScore: 95 },
  gold: { label: 'Gold', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', textColor: 'text-white', minScore: 90 },
  silver: { label: 'Silver', color: 'bg-gradient-to-r from-gray-400 to-gray-500', textColor: 'text-white', minScore: 85 },
  bronze: { label: 'Bronze', color: 'bg-gradient-to-r from-amber-700 to-amber-900', textColor: 'text-white', minScore: 75 },
  fair: { label: 'Fair', color: 'bg-gray-200', textColor: 'text-gray-700', minScore: 0 }
};

function getPercentile(score) {
  if (score >= 96) return 99;
  if (score >= 90) return 95;
  if (score >= 85) return 85;
  if (score >= 75) return 65;
  if (score >= 65) return 50;
  return 30;
}

function getPercentileLabel(percentile) {
  if (percentile >= 95) return { text: `Top ${100 - percentile}%`, color: 'text-green-600' };
  if (percentile >= 75) return { text: `Top ${100 - percentile}%`, color: 'text-blue-600' };
  if (percentile >= 50) return { text: 'Above average', color: 'text-gray-700' };
  return { text: `Bottom ${percentile}%`, color: 'text-orange-600' };
}

export default function ScoreBadge({ score, certificationLevel, size = 'md', onClick, showTrend = false, showPercentile = false }) {
  const level = CERTIFICATION_LEVELS[certificationLevel] || CERTIFICATION_LEVELS.fair;
  const isCertified = certificationLevel !== 'fair';
  const percentile = getPercentile(score);
  const percentileInfo = getPercentileLabel(percentile);
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
    xl: 'w-32 h-32 text-5xl'
  };
  
  const containerClasses = onClick ? 'cursor-pointer hover:scale-105 transition-transform' : '';
  
  return (
    <div 
      className={`flex flex-col items-center gap-2 ${containerClasses}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={`${sizeClasses[size]} ${level.color} rounded-full flex items-center justify-center font-bold ${level.textColor} shadow-lg`}>
        {score}
      </div>
      
      {isCertified && (
        <div className="flex items-center gap-1">
          <Award className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-semibold text-gray-700">{level.label} Certified</span>
        </div>
      )}
      
      {!isCertified && (
        <Badge variant="outline" className="text-xs">
          Not Certified
        </Badge>
      )}
      
      {showTrend && (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="w-3 h-3" />
          <span className="text-xs font-semibold">+3 this month</span>
        </div>
      )}
      
      {showPercentile && (
        <div className="text-center">
          <p className={`text-sm font-semibold ${percentileInfo.color}`}>
            {percentileInfo.text}
          </p>
          <p className="text-xs text-gray-500">
            Better than {percentile}% of similar homes
          </p>
        </div>
      )}
    </div>
  );
}