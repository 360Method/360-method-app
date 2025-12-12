import React from 'react';
import { cn } from '@/lib/utils';

/**
 * AreaIcon - Reusable area icon component with selection state
 * Mobile-first with large tap targets (minimum 80x80px)
 */
export default function AreaIcon({
  area,
  selected = false,
  completed = false,
  issueCount = 0,
  onClick,
  size = 'default', // 'default' | 'small' | 'large'
  showLabel = true,
  disabled = false
}) {
  const sizeClasses = {
    small: 'w-16 h-16 min-w-[64px] min-h-[64px]',
    default: 'w-20 h-20 min-w-[80px] min-h-[80px]',
    large: 'w-24 h-24 min-w-[96px] min-h-[96px]'
  };

  const iconSizes = {
    small: 'text-2xl',
    default: 'text-3xl',
    large: 'text-4xl'
  };

  const labelSizes = {
    small: 'text-[10px]',
    default: 'text-xs',
    large: 'text-sm'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        'active:scale-95',
        sizeClasses[size],
        selected && !completed && 'border-blue-500 bg-blue-50 shadow-md',
        completed && 'border-green-500 bg-green-50',
        !selected && !completed && 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      style={{
        borderColor: selected && !completed ? area.color : undefined
      }}
    >
      {/* Completed checkmark overlay */}
      {completed && (
        <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Issue count badge */}
      {issueCount > 0 && !completed && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">{issueCount}</span>
        </div>
      )}

      {/* Selection indicator */}
      {selected && !completed && (
        <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Icon */}
      <span className={cn(iconSizes[size], 'leading-none')}>
        {area.icon}
      </span>

      {/* Label */}
      {showLabel && (
        <span className={cn(
          labelSizes[size],
          'font-medium text-center leading-tight px-1',
          selected ? 'text-blue-700' : completed ? 'text-green-700' : 'text-gray-700'
        )}>
          {area.name.split(' ')[0]}
        </span>
      )}
    </button>
  );
}

/**
 * AreaIconGrid - Grid layout for area icons
 * Responsive: 2 columns on mobile, 3 on tablet, 4 on desktop
 */
export function AreaIconGrid({ children, className }) {
  return (
    <div className={cn(
      'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4',
      className
    )}>
      {children}
    </div>
  );
}

/**
 * AreaCard - Larger card format for area display
 * Used when you need more info than just icon
 */
export function AreaCard({
  area,
  selected = false,
  completed = false,
  issueCount = 0,
  onClick,
  showTime = false,
  timeMode = 'quick',
  disabled = false
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 w-full text-left',
        'min-h-[72px]', // Minimum touch target
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        'active:scale-[0.98]',
        selected && !completed && 'border-blue-500 bg-blue-50 shadow-md',
        completed && 'border-green-500 bg-green-50',
        !selected && !completed && 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Status indicator */}
      {(completed || selected) && (
        <div className={cn(
          'absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center',
          completed ? 'bg-green-500' : 'bg-blue-500'
        )}>
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Issue badge */}
      {issueCount > 0 && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-orange-500 rounded-full">
          <span className="text-xs font-bold text-white">
            {issueCount} issue{issueCount > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Icon */}
      <div
        className="flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${area.color}20` }}
      >
        <span className="text-3xl">{area.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          'font-semibold text-base',
          completed ? 'text-green-700' : selected ? 'text-blue-700' : 'text-gray-900'
        )}>
          {area.name}
        </h3>
        {showTime && area.estimatedMinutes && (
          <p className="text-sm text-gray-500">
            ~{area.estimatedMinutes[timeMode]} min
          </p>
        )}
        {area.whatToCheck && !showTime && (
          <p className="text-sm text-gray-500 truncate">
            {area.whatToCheck}
          </p>
        )}
      </div>

      {/* Chevron */}
      {!completed && !selected && (
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}
