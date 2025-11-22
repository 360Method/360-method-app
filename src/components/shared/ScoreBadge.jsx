import React from 'react';
import { Shield, Award } from 'lucide-react';

const LEVEL_CONFIG = {
  platinum: {
    gradient: 'linear-gradient(135deg, #E0B0FF 0%, #DDA0DD 100%)',
    text: '#FFFFFF',
    border: '#9370DB',
    emoji: '💎',
    label: 'PLATINUM'
  },
  gold: {
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    text: '#1A1A1A',
    border: '#DAA520',
    emoji: '🥇',
    label: 'GOLD'
  },
  silver: {
    gradient: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
    text: '#1A1A1A',
    border: '#808080',
    emoji: '🥈',
    label: 'SILVER'
  },
  bronze: {
    gradient: 'linear-gradient(135deg, #CD7F32 0%, #B8733C 100%)',
    text: '#FFFFFF',
    border: '#8B4513',
    emoji: '🥉',
    label: 'BRONZE'
  },
  participant: {
    gradient: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
    text: '#FFFFFF',
    border: '#2E5C8A',
    emoji: '✓',
    label: 'PARTICIPANT'
  },
  fair: {
    gradient: 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)',
    text: '#1A1A1A',
    border: '#F57C00',
    emoji: '⚠️',
    label: 'FAIR'
  },
  poor: {
    gradient: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
    text: '#FFFFFF',
    border: '#B71C1C',
    emoji: '❗',
    label: 'NEEDS WORK'
  }
};

export default function ScoreBadge({ 
  score, 
  level, 
  certified = false, 
  certifiedBy = null,
  size = 'medium',
  onClick = null
}) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.fair;
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  if (isSmall) {
    return (
      <div
        onClick={onClick}
        className={`inline-flex flex-col items-center justify-center rounded-lg shadow-md ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}`}
        style={{
          background: config.gradient,
          border: `2px solid ${config.border}`,
          padding: '12px 16px',
          minWidth: '100px'
        }}
      >
        <div className="text-3xl font-bold" style={{ color: config.text }}>
          {score}
        </div>
        <div className="text-xs font-semibold mt-1" style={{ color: config.text }}>
          {config.emoji} {config.label}
        </div>
      </div>
    );
  }

  if (isLarge) {
    return (
      <div
        onClick={onClick}
        className={`rounded-xl shadow-lg ${onClick ? 'cursor-pointer hover:shadow-xl' : ''}`}
        style={{
          background: config.gradient,
          border: `3px solid ${config.border}`,
          padding: '24px'
        }}
      >
        <div className="text-center mb-4">
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: config.text, opacity: 0.9 }}>
            360° CERTIFIED PROPERTY
          </div>
          <div className="text-5xl mb-3" style={{ color: config.text }}>
            {config.emoji}
          </div>
          <div className="text-2xl font-bold mb-1" style={{ color: config.text }}>
            {config.label}
          </div>
        </div>

        <div className="border-t pt-4 space-y-2" style={{ borderColor: config.border }}>
          <div className="text-center">
            <div className="text-sm font-semibold mb-1" style={{ color: config.text }}>
              Score: {score}/100
            </div>
          </div>
          
          {certified && certifiedBy && (
            <>
              <div className="text-center text-xs" style={{ color: config.text, opacity: 0.9 }}>
                Certified by: {certifiedBy}
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
      className={`rounded-lg shadow-md ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}`}
      style={{
        background: config.gradient,
        border: `2px solid ${config.border}`,
        padding: '16px',
        minWidth: '140px'
      }}
    >
      <div className="flex items-center gap-3">
        <div className="text-4xl font-bold" style={{ color: config.text }}>
          {score}
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold" style={{ color: config.text, opacity: 0.9 }}>
            360° Score
          </div>
          <div className="text-sm font-bold" style={{ color: config.text }}>
            {config.emoji} {config.label}
          </div>
        </div>
      </div>
      
      {certified && (
        <div className="mt-2 pt-2 border-t text-xs text-center" style={{ borderColor: config.border, color: config.text, opacity: 0.9 }}>
          ✓ Certified
        </div>
      )}
    </div>
  );
}