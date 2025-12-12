import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * EquityGainBadge - Displays the net equity gain/loss from an upgrade
 *
 * Simple equity math: Net Gain = Value Added - Investment
 */
export default function EquityGainBadge({
  investment,
  valueAdded,
  size = 'default', // 'small', 'default', 'large'
  showIcon = true,
  showLabel = true,
  className = ''
}) {
  const netGain = (valueAdded || 0) - (investment || 0);
  const isPositive = netGain > 0;
  const isNeutral = netGain === 0;
  const isNegative = netGain < 0;

  // Calculate ROI percentage
  const roiPercent = investment > 0 ? Math.round((valueAdded / investment) * 100) : 0;

  // Size variants
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    default: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    small: 'w-3 h-3',
    default: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  // Color variants
  let colorClasses = '';
  let Icon = Minus;

  if (isPositive) {
    colorClasses = 'bg-green-100 text-green-800 border border-green-300';
    Icon = TrendingUp;
  } else if (isNegative) {
    // Still show amber for costs that add value (ROI > 50%)
    if (roiPercent >= 50) {
      colorClasses = 'bg-amber-100 text-amber-800 border border-amber-300';
    } else {
      colorClasses = 'bg-red-100 text-red-800 border border-red-300';
    }
    Icon = TrendingDown;
  } else {
    colorClasses = 'bg-gray-100 text-gray-700 border border-gray-300';
    Icon = Minus;
  }

  const formatCurrency = (amount) => {
    const absAmount = Math.abs(amount);
    if (absAmount >= 1000) {
      return `$${(absAmount / 1000).toFixed(1)}K`;
    }
    return `$${absAmount.toLocaleString()}`;
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-semibold
        ${sizeClasses[size]}
        ${colorClasses}
        ${className}
      `}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>
        {isPositive ? '+' : isNegative ? '-' : ''}
        {formatCurrency(netGain)}
        {showLabel && ' equity'}
      </span>
    </span>
  );
}

/**
 * EquityGainSummary - Shows full breakdown of investment vs value
 */
export function EquityGainSummary({
  investment,
  valueAdded,
  annualSavings = 0,
  className = ''
}) {
  const netGain = (valueAdded || 0) - (investment || 0);
  const roiPercent = investment > 0 ? Math.round((valueAdded / investment) * 100) : 0;
  const paybackYears = annualSavings > 0 ? (investment / annualSavings).toFixed(1) : null;

  return (
    <div className={`grid grid-cols-3 gap-3 ${className}`}>
      {/* Investment */}
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-600 mb-1">Investment</p>
        <p className="text-lg font-bold text-gray-900">
          ${(investment || 0).toLocaleString()}
        </p>
      </div>

      {/* Value Added */}
      <div className="bg-green-50 rounded-lg p-3 text-center">
        <p className="text-xs text-green-700 mb-1">Value Added</p>
        <p className="text-lg font-bold text-green-800">
          +${(valueAdded || 0).toLocaleString()}
        </p>
        {roiPercent > 0 && (
          <p className="text-xs text-green-600">{roiPercent}% ROI</p>
        )}
      </div>

      {/* Net Gain */}
      <div className={`rounded-lg p-3 text-center ${
        netGain >= 0 ? 'bg-green-100' : 'bg-amber-50'
      }`}>
        <p className={`text-xs mb-1 ${
          netGain >= 0 ? 'text-green-700' : 'text-amber-700'
        }`}>
          Net Gain
        </p>
        <p className={`text-lg font-bold ${
          netGain >= 0 ? 'text-green-800' : 'text-amber-800'
        }`}>
          {netGain >= 0 ? '+' : ''}{netGain.toLocaleString()}
        </p>
        {paybackYears && (
          <p className={`text-xs ${netGain >= 0 ? 'text-green-600' : 'text-amber-600'}`}>
            {paybackYears}yr payback
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * EquityImpactBar - Visual bar showing investment vs value
 */
export function EquityImpactBar({
  investment,
  valueAdded,
  className = ''
}) {
  const total = Math.max(investment || 0, valueAdded || 0);
  const investmentPercent = total > 0 ? ((investment || 0) / total) * 100 : 0;
  const valuePercent = total > 0 ? ((valueAdded || 0) / total) * 100 : 0;
  const netGain = (valueAdded || 0) - (investment || 0);

  return (
    <div className={className}>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>Investment: ${(investment || 0).toLocaleString()}</span>
        <span>Value: ${(valueAdded || 0).toLocaleString()}</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
        <div
          className="bg-blue-500 transition-all"
          style={{ width: `${investmentPercent}%` }}
        />
        {netGain > 0 && (
          <div
            className="bg-green-500 transition-all"
            style={{ width: `${valuePercent - investmentPercent}%` }}
          />
        )}
      </div>
      <div className="text-center mt-1">
        <span className={`text-xs font-semibold ${
          netGain >= 0 ? 'text-green-700' : 'text-amber-700'
        }`}>
          Net: {netGain >= 0 ? '+' : ''}${netGain.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
