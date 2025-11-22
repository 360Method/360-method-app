import React from 'react';
import { Award, CheckCircle, Shield } from 'lucide-react';

const LEVEL_CONFIG = {
  platinum: {
    gradient: 'linear-gradient(135deg, #E0B0FF 0%, #DDA0DD 100%)',
    textColor: '#FFFFFF',
    borderColor: '#9370DB',
    icon: '💎',
    label: 'PLATINUM'
  },
  gold: {
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    textColor: '#1A1A1A',
    borderColor: '#DAA520',
    icon: '🥇',
    label: 'GOLD'
  },
  silver: {
    gradient: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
    textColor: '#1A1A1A',
    borderColor: '#808080',
    icon: '🥈',
    label: 'SILVER'
  },
  bronze: {
    gradient: 'linear-gradient(135deg, #CD7F32 0%, #B8733C 100%)',
    textColor: '#FFFFFF',
    borderColor: '#8B4513',
    icon: '🥉',
    label: 'BRONZE'
  },
  participant: {
    gradient: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
    textColor: '#FFFFFF',
    borderColor: '#2E5C8A',
    icon: '✓',
    label: 'PARTICIPANT'
  },
  fair: {
    gradient: 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)',
    textColor: '#1A1A1A',
    borderColor: '#F57C00',
    icon: '⚠️',
    label: 'FAIR'
  },
  poor: {
    gradient: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
    textColor: '#FFFFFF',
    borderColor: '#B71C1C',
    icon: '❌',
    label: 'NEEDS WORK'
  }
};

export default function ScoreBadge({ 
  score, 
  level, 
  certified = false, 
  certifiedBy, 
  certificationDate,
  size = 'medium',
  showDetails = false,
  onClick
}) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.fair;
  
  if (size === 'small') {
    return (
      <div 
        onClick={onClick}
        className={`inline-flex flex-col items-center justify-center px-3 py-2 rounded-lg border-2 ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
        style={{ 
          background: config.gradient,
          borderColor: config.borderColor,
          minWidth: '80px'
        }}
      >
        <div className="text-2xl font-bold" style={{ color: config.textColor }}>
          {score}
        </div>
        <div className="text-xs font-semibold mt-0.5" style={{ color: config.textColor }}>
          {config.icon} {config.label}
        </div>
      </div>
    );
  }
  
  if (size === 'large') {
    return (
      <div 
        onClick={onClick}
        className={`bg-white rounded-xl border-2 p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
        style={{ borderColor: config.borderColor }}
      >
        <div className="text-center">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            360° CERTIFIED PROPERTY
          </div>
          
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-3"
            style={{ background: config.gradient }}
          >
            <span className="text-3xl">{config.icon}</span>
            <span className="text-2xl font-bold" style={{ color: config.textColor }}>
              {config.label}
            </span>
          </div>
          
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {score}<span className="text-2xl text-gray-500">/100</span>
          </div>
          
          {showDetails && certified && (
            <>
              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Last Certified: {new Date(certificationDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                {certifiedBy && (
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Certified by: {certifiedBy}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  
  // Medium (default)
  return (
    <div 
      onClick={onClick}
      className={`inline-flex flex-col items-center justify-center px-4 py-3 rounded-xl border-2 ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
      style={{ 
        background: config.gradient,
        borderColor: config.borderColor,
        minWidth: '120px'
      }}
    >
      <div className="text-3xl font-bold mb-1" style={{ color: config.textColor }}>
        {score}
      </div>
      <div className="text-sm font-semibold" style={{ color: config.textColor }}>
        {config.icon} {config.label}
      </div>
      {certified && (
        <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: config.textColor }}>
          <CheckCircle className="w-3 h-3" />
          <span>Certified</span>
        </div>
      )}
    </div>
  );
}