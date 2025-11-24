import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function HealthScoreGauge({ score, previousScore, size = 'large' }) {
  const getScoreColor = (score) => {
    if (score >= 75) return { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-700', stroke: '#22c55e' };
    if (score >= 60) return { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-700', stroke: '#eab308' };
    return { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-700', stroke: '#ef4444' };
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Needs Attention';
    return 'Critical';
  };

  const colors = getScoreColor(score);
  const radius = size === 'large' ? 80 : 60;
  const strokeWidth = size === 'large' ? 12 : 10;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const trend = previousScore ? score - previousScore : 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          width={radius * 2 + strokeWidth * 2}
          height={radius * 2 + strokeWidth * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Score in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-5xl font-bold ${colors.text}`}>
            {score}
          </div>
          <div className="text-sm text-gray-500 font-medium">
            {getScoreLabel(score)}
          </div>
        </div>
      </div>

      {/* Trend indicator */}
      {trend !== 0 && (
        <div className={`mt-3 flex items-center gap-1 text-sm font-medium ${
          trend > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend > 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{Math.abs(trend)} points</span>
        </div>
      )}
    </div>
  );
}