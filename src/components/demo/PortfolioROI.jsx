import React from 'react';
import { DollarSign, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PortfolioROI({ investment, savings, totalAnnualValue, roi }) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-6 h-6 text-blue-600" />
          Portfolio Maintenance ROI
        </CardTitle>
        <p className="text-sm text-gray-600">Annual value from systematic maintenance</p>
      </CardHeader>
      <CardContent>
        {/* Investment */}
        <div className="mb-6 p-4 bg-white rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Investment to Fix Bottom 3</p>
              <p className="text-3xl font-bold text-gray-900">${investment.toLocaleString()}</p>
            </div>
            <DollarSign className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        {/* Annual Savings Breakdown */}
        <div className="space-y-3 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Annual Portfolio Benefits:</h4>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm text-gray-700">Better loan terms (lower rates)</span>
            <span className="font-bold text-green-700">${savings.loanTerms.toLocaleString()}/yr</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm text-gray-700">Insurance discounts (portfolio)</span>
            <span className="font-bold text-green-700">${savings.insurance.toLocaleString()}/yr</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm text-gray-700">Avoided emergency repairs</span>
            <span className="font-bold text-green-700">${savings.emergencies.toLocaleString()}/yr</span>
          </div>
        </div>

        {/* Total Value */}
        <div className="p-6 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm opacity-90">Total Annual Value</p>
              <p className="text-4xl font-bold">${totalAnnualValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-80" />
          </div>
          <div className="pt-3 border-t border-white/30">
            <p className="text-2xl font-bold">{roi}% ROI</p>
            <p className="text-sm opacity-90">Your ${investment.toLocaleString()} pays for itself 4x over in year one</p>
          </div>
        </div>

        {/* Portfolio Insurance Note */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Portfolio Advantage:</span> Insurance companies offer bigger discounts 
            for multi-property portfolios with systematic maintenance tracking.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}