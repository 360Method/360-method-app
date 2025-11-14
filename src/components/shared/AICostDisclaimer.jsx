import React from 'react';
import { AlertCircle, Info } from 'lucide-react';

export default function AICostDisclaimer({ variant = 'default', className = '' }) {
  const variants = {
    // Compact version for cards
    compact: (
      <div className={`flex items-start gap-2 text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-2 ${className}`}>
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p>
          <strong>AI Estimate:</strong> Costs are based on local trends and may vary. 
          Get a professional quote for accurate pricing.
        </p>
      </div>
    ),
    
    // Default version for detail views
    default: (
      <div className={`bg-amber-50 border-l-4 border-amber-400 p-4 rounded ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-900 mb-1">
              AI-Generated Cost Estimate
            </h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              These costs are AI-generated estimates based on local market trends and historical data. 
              Actual costs may vary significantly due to property-specific conditions, material choices, 
              labor rates, permit requirements, and unforeseen issues discovered during work.
            </p>
            <p className="text-sm text-amber-800 mt-2 font-medium">
              Always obtain professional estimates from licensed contractors before making decisions.
            </p>
          </div>
        </div>
      </div>
    ),
    
    // Prominent version for ROI calculators
    prominent: (
      <div className={`bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-700 flex-shrink-0" />
          <div>
            <h4 className="text-base font-bold text-yellow-900 mb-2">
              ⚠️ Important: AI-Generated Estimates Only
            </h4>
            <ul className="text-sm text-yellow-900 space-y-1 mb-3">
              <li>• Cost estimates are AI-generated from local market data</li>
              <li>• ROI calculations are projections, not guarantees</li>
              <li>• Actual results depend on property conditions, materials, and execution</li>
              <li>• Professional quotes may differ significantly from these estimates</li>
            </ul>
            <p className="text-sm font-semibold text-yellow-900 bg-yellow-200 rounded px-3 py-2">
              💡 These numbers help you plan—but always get multiple professional quotes before proceeding.
            </p>
          </div>
        </div>
      </div>
    )
  };

  return variants[variant] || variants.default;
}