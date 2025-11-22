import React from 'react';
import { Award, TrendingUp } from 'lucide-react';

const CERTIFICATION_LEVELS = {
  platinum: { label: 'Platinum', color: 'from-gray-300 to-gray-400', textColor: 'text-white', minScore: 96 },
  gold: { label: 'Gold', color: 'from-yellow-400 to-yellow-600', textColor: 'text-white', minScore: 90 },
  silver: { label: 'Silver', color: 'from-gray-400 to-gray-500', textColor: 'text-white', minScore: 85 },
  bronze: { label: 'Bronze', color: 'from-amber-600 to-amber-800', textColor: 'text-white', minScore: 75 },
  fair: { label: 'Fair', color: 'from-gray-200 to-gray-300', textColor: 'text-gray-700', minScore: 0 }
};

function getCertificationLevel(score) {
  if (score >= 96) return 'platinum';
  if (score >= 90) return 'gold';
  if (score >= 85) return 'silver';
  if (score >= 75) return 'bronze';
  return 'fair';
}

export default function ScoreBadgeDemo({ 
  score, 
  maxScore = 100, 
  size = 'large',
  showLabel = true,
  showPercentile = true,
  animated = true
}) {
  const certLevel = getCertificationLevel(score);
  const level = CERTIFICATION_LEVELS[certLevel];
  const isCertified = certLevel !== 'fair';
  
  const percentile = score >= 96 ? 99 : 
                    score >= 90 ? 95 : 
                    score >= 85 ? 85 : 
                    score >= 75 ? 65 : 
                    score >= 65 ? 50 : 30;
  
  const sizeClasses = {
    small: 'w-16 h-16 text-xl',
    medium: 'w-24 h-24 text-3xl',
    large: 'w-32 h-32 text-5xl'
  };
  
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizeClasses[size]} bg-gradient-to-br ${level.color} rounded-full flex items-center justify-center font-bold ${level.textColor} shadow-xl ${animated ? 'animate-pulse-ring' : ''}`}>
        {score}
      </div>
      
      {showLabel && isCertified && (
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          <span className="text-lg font-bold text-gray-800">{level.label} Certified</span>
        </div>
      )}
      
      {showLabel && !isCertified && (
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-600">Not Certified Yet</p>
          <p className="text-xs text-gray-500">Need {75 - score} more points</p>
        </div>
      )}
      
      {showPercentile && (
        <div className="text-center">
          <p className="text-sm font-bold text-blue-600">
            Top {100 - percentile}%
          </p>
          <p className="text-xs text-gray-600">
            Better than {percentile}% of homes
          </p>
        </div>
      )}
    </div>
  );
}