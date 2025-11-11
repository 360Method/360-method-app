import React from "react";
import { Shield, AlertTriangle, TrendingUp } from "lucide-react";

export default function HealthScoreGauge({ score = 0 }) {
  const getScoreColor = (s) => {
    if (s >= 80) return '#28A745'; // Green
    if (s >= 60) return '#FFC107'; // Yellow
    if (s >= 40) return '#FF9800'; // Orange
    return '#DC3545'; // Red
  };

  const getScoreStatus = (s) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const getIcon = (s) => {
    if (s >= 80) return Shield;
    if (s >= 60) return TrendingUp;
    return AlertTriangle;
  };

  const color = getScoreColor(score);
  const status = getScoreStatus(score);
  const Icon = getIcon(score);
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center py-6">
      {/* Circular Gauge */}
      <div className="relative w-48 h-48 mb-4">
        <svg className="transform -rotate-90 w-48 h-48">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r="70"
            stroke="#E5E7EB"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="96"
            cy="96"
            r="70"
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out'
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-8 h-8 mb-2" style={{ color }} />
          <span className="text-4xl font-bold" style={{ color }}>
            {score}
          </span>
          <span className="text-sm text-gray-600">/ 100</span>
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        <p className="font-bold text-xl mb-1" style={{ color }}>
          {status}
        </p>
        <p className="text-sm text-gray-600">
          {score >= 80 && 'Your properties are in great shape!'}
          {score >= 60 && score < 80 && 'Doing well, but room for improvement.'}
          {score >= 40 && score < 60 && 'Address priority items soon.'}
          {score < 40 && 'Take action on high-priority items now.'}
        </p>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-4 w-full mt-6">
        <div className="text-center">
          <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: '#28A745' }}></div>
          <p className="text-xs text-gray-600">80-100</p>
          <p className="text-xs font-semibold">Excellent</p>
        </div>
        <div className="text-center">
          <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: '#FFC107' }}></div>
          <p className="text-xs text-gray-600">60-79</p>
          <p className="text-xs font-semibold">Good</p>
        </div>
        <div className="text-center">
          <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: '#DC3545' }}></div>
          <p className="text-xs text-gray-600">0-59</p>
          <p className="text-xs font-semibold">At Risk</p>
        </div>
      </div>
    </div>
  );
}