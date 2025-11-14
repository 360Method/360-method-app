import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Home, Building2, TrendingUp, DollarSign } from "lucide-react";

export default function PropertyEquityCard({ equity, property, isExpanded, onToggle }) {
  const isPrimary = property?.property_use === 'Primary Residence' || property?.property_use_type === 'primary';
  
  return (
    <Card className="border-2 border-gray-200 hover:border-purple-300 transition-colors">
      <CardContent className="p-4">
        <button
          onClick={onToggle}
          className="w-full flex items-start justify-between gap-3 text-left"
        >
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              {isPrimary ? (
                <Home className="w-5 h-5 text-purple-600" />
              ) : (
                <Building2 className="w-5 h-5 text-purple-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-semibold text-gray-900">{property?.address || 'Unknown Property'}</p>
                {isPrimary && (
                  <Badge className="bg-blue-600 text-white text-xs">Primary</Badge>
                )}
                {equity.is_rental && (
                  <Badge className="bg-orange-600 text-white text-xs">Rental</Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                <div>
                  <p className="text-xs text-gray-600">Value</p>
                  <p className="font-bold text-sm">${(equity.current_market_value || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Debt</p>
                  <p className="font-bold text-sm text-red-700">${(equity.total_debt || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Equity</p>
                  <p className="font-bold text-sm text-green-700">${(equity.equity_dollars || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Equity %</p>
                  <p className="font-bold text-sm">{(equity.equity_percentage || 0).toFixed(1)}%</p>
                </div>
              </div>

              {equity.is_rental && equity.monthly_noi && (
                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    NOI: ${equity.monthly_noi.toLocaleString()}/mo
                  </Badge>
                  {equity.cap_rate && (
                    <Badge variant="outline" className="text-xs">
                      Cap Rate: {equity.cap_rate.toFixed(1)}%
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
        </button>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-3">
            
            {/* Equity Progress Bar */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Equity Position</p>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 h-4 rounded-full flex items-center justify-center"
                  style={{ width: `${Math.min(equity.equity_percentage || 0, 100)}%` }}
                >
                  <span className="text-xs font-bold text-white">
                    {(equity.equity_percentage || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* 5-Year Growth */}
            {equity.equity_gain_5yr && (
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-600">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <p className="text-xs font-semibold text-green-900">5-Year Growth</p>
                </div>
                <p className="text-sm text-green-800">
                  +${equity.equity_gain_5yr.toLocaleString()} 
                  {equity.equity_5yr_ago > 0 && (
                    <span> (+{((equity.equity_gain_5yr / equity.equity_5yr_ago) * 100).toFixed(0)}%)</span>
                  )}
                </p>
              </div>
            )}

            {/* Rental Metrics */}
            {equity.is_rental && (
              <div className="grid grid-cols-2 gap-3">
                {equity.monthly_rent_income && (
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs text-gray-600">Monthly Rent</p>
                    <p className="font-bold text-sm">${equity.monthly_rent_income.toLocaleString()}</p>
                  </div>
                )}
                {equity.monthly_noi && (
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs text-gray-600">Monthly NOI</p>
                    <p className="font-bold text-sm text-green-700">${equity.monthly_noi.toLocaleString()}</p>
                  </div>
                )}
                {equity.cap_rate && (
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs text-gray-600">Cap Rate</p>
                    <p className="font-bold text-sm">
                      {equity.cap_rate.toFixed(1)}%
                      {equity.cap_rate > 6.5 && (
                        <Badge className="ml-2 bg-green-600 text-white text-xs">Excellent</Badge>
                      )}
                    </p>
                  </div>
                )}
                {equity.cash_on_cash_return && (
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs text-gray-600">Cash-on-Cash</p>
                    <p className="font-bold text-sm">{equity.cash_on_cash_return.toFixed(1)}%</p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </CardContent>
    </Card>
  );
}