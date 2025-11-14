import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, 
  TrendingUp, 
  Home, 
  ChevronDown, 
  ChevronRight,
  RefreshCw,
  Edit,
  Building2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import PropertyEquityCard from "./PropertyEquityCard";
import DisclaimerBox from "./DisclaimerBox";

export default function EquityPositionCard({ equityData, properties, selectedProperty }) {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [expandedProperty, setExpandedProperty] = useState(null);
  const queryClient = useQueryClient();

  // For portfolio view
  const isPortfolioView = selectedProperty === 'all';
  const singleEquity = !isPortfolioView && equityData.length > 0 ? equityData[0] : null;
  const singleProperty = !isPortfolioView ? properties.find(p => p.id === selectedProperty) : null;

  // Calculate portfolio totals
  const totalValue = equityData.reduce((sum, e) => sum + (e.current_market_value || 0), 0);
  const totalDebt = equityData.reduce((sum, e) => sum + (e.total_debt || 0), 0);
  const totalEquity = totalValue - totalDebt;
  const avgEquityPct = totalValue > 0 ? (totalEquity / totalValue * 100) : 0;
  const total5YrGain = equityData.reduce((sum, e) => sum + (e.equity_gain_5yr || 0), 0);

  // Single property 5-year chart data
  const chartData = singleEquity?.equity_5yr_ago ? [
    { year: '5 years ago', equity: singleEquity.equity_5yr_ago },
    { year: 'Today', equity: singleEquity.equity_dollars }
  ] : [];

  // Empty state
  if (equityData.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Equity Data Yet</h3>
          <p className="text-gray-600 mb-6">
            Set up your property's financial position to unlock wealth tracking and strategic analysis.
          </p>
          <Button onClick={() => setShowUpdateDialog(true)} className="bg-purple-600 hover:bg-purple-700">
            <DollarSign className="w-5 h-5 mr-2" />
            Add Equity Data
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Single Property View
  if (!isPortfolioView && singleEquity) {
    const equity5yrGainPct = singleEquity.equity_5yr_ago > 0 
      ? ((singleEquity.equity_dollars - singleEquity.equity_5yr_ago) / singleEquity.equity_5yr_ago * 100)
      : 0;

    return (
      <div className="space-y-6">
        <Card className="border-2 border-purple-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-purple-600" />
              Your Equity Position
            </CardTitle>
            {singleProperty && (
              <p className="text-sm text-gray-600">{singleProperty.address}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Current Market Value */}
            <div>
              <p className="text-sm text-gray-600 mb-1">CURRENT MARKET VALUE</p>
              <p className="text-4xl font-bold text-gray-900">
                ${singleEquity.current_market_value?.toLocaleString() || '0'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {singleEquity.valuation_source || 'Not set'}
                </Badge>
                {singleEquity.valuation_date && (
                  <Badge variant="outline" className="text-xs">
                    Updated {new Date(singleEquity.valuation_date).toLocaleDateString()}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => setShowUpdateDialog(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Manually
                </Button>
              </div>
            </div>

            {/* Mortgage Balance */}
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-1">MORTGAGE BALANCE</p>
              <p className="text-3xl font-bold text-gray-900">
                ${singleEquity.mortgage_balance?.toLocaleString() || '0'}
              </p>
              {singleEquity.mortgage_interest_rate && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-700">
                    Rate: <strong>{singleEquity.mortgage_interest_rate}%</strong>
                    {singleEquity.mortgage_interest_rate < 4 && (
                      <Badge className="ml-2 bg-green-600 text-white text-xs">Excellent Rate</Badge>
                    )}
                  </p>
                  {singleEquity.mortgage_payment_monthly && (
                    <p className="text-sm text-gray-700">
                      Payment: <strong>${singleEquity.mortgage_payment_monthly.toLocaleString()}/mo</strong>
                    </p>
                  )}
                  {singleEquity.mortgage_payoff_date && (
                    <p className="text-sm text-gray-700">
                      Payoff: <strong>{new Date(singleEquity.mortgage_payoff_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Net Equity */}
            <div className="pt-4 border-t bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
              <p className="text-sm text-gray-600 mb-1">NET EQUITY</p>
              <p className="text-4xl font-bold text-green-700">
                ${singleEquity.equity_dollars?.toLocaleString() || '0'}
              </p>
              <div className="mt-2">
                <p className="text-sm text-gray-700 mb-2">
                  Equity Position: <strong>{singleEquity.equity_percentage?.toFixed(1)}%</strong>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(singleEquity.equity_percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 5-Year Growth */}
            {singleEquity.equity_5yr_ago && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">5-Year Equity Growth</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">2020</p>
                    <p className="text-lg font-bold text-gray-700">
                      ${singleEquity.equity_5yr_ago.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">2025</p>
                    <p className="text-lg font-bold text-green-700">
                      ${singleEquity.equity_dollars.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                  <p className="text-sm font-semibold text-green-900">
                    Gain: +${singleEquity.equity_gain_5yr?.toLocaleString() || '0'} 
                    {equity5yrGainPct > 0 && ` (+${equity5yrGainPct.toFixed(0)}%)`}
                  </p>
                  <p className="text-xs text-green-800 mt-1">
                    Annual growth rate: {singleEquity.annual_appreciation_rate?.toFixed(1) || 'N/A'}%
                  </p>
                </div>

                {chartData.length > 0 && (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Area type="monotone" dataKey="equity" stroke="#10b981" fill="#d1fae5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* Quick Insights */}
            <div className="pt-4 border-t">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Quick Insights
              </h4>
              <div className="space-y-2">
                {singleEquity.mortgage_interest_rate && singleEquity.mortgage_interest_rate < 4 && (
                  <div className="p-3 bg-green-50 rounded border-l-4 border-green-600">
                    <p className="text-sm text-green-900">
                      ✓ Excellent interest rate ({singleEquity.mortgage_interest_rate}%) - Don't refinance at current market rates
                    </p>
                  </div>
                )}
                {singleEquity.equity_percentage >= 35 && (
                  <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-600">
                    <p className="text-sm text-blue-900">
                      ✓ Healthy equity position ({singleEquity.equity_percentage.toFixed(1)}%) - Good cushion against market downturns
                    </p>
                  </div>
                )}
                {singleEquity.is_rental && singleEquity.cap_rate && singleEquity.cap_rate > 6 && (
                  <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-600">
                    <p className="text-sm text-purple-900">
                      ✓ Strong cap rate ({singleEquity.cap_rate.toFixed(1)}%) - Above market average
                    </p>
                  </div>
                )}
              </div>
            </div>

          </CardContent>
        </Card>

        <DisclaimerBox />
      </div>
    );
  }

  // Portfolio View (Multiple Properties)
  if (isPortfolioView && equityData.length > 1) {
    return (
      <div className="space-y-6">
        
        {/* Portfolio Overview */}
        <Card className="border-2 border-purple-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-purple-600" />
              Portfolio Equity Position
            </CardTitle>
            <p className="text-sm text-gray-600">{equityData.length} Properties</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">TOTAL PORTFOLIO VALUE</p>
                <p className="text-3xl font-bold text-blue-700">${totalValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">TOTAL DEBT</p>
                <p className="text-3xl font-bold text-red-700">${totalDebt.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
              <p className="text-sm text-gray-600 mb-1">NET EQUITY</p>
              <p className="text-4xl font-bold text-green-700">${totalEquity.toLocaleString()}</p>
              <p className="text-sm text-gray-700 mt-2">
                Equity Position: <strong>{avgEquityPct.toFixed(1)}%</strong>
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div 
                  className="bg-green-600 h-3 rounded-full"
                  style={{ width: `${Math.min(avgEquityPct, 100)}%` }}
                />
              </div>
            </div>

            {total5YrGain > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded border-l-4 border-blue-600">
                <p className="text-sm font-semibold text-blue-900">
                  📈 5-YEAR GAIN: +${total5YrGain.toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Individual Property Cards */}
        <div>
          <h3 className="font-bold text-lg mb-4" style={{ color: '#1B365D' }}>
            📊 Properties Breakdown
          </h3>
          <div className="space-y-4">
            {equityData.map((equity) => {
              const property = properties.find(p => p.id === equity.property_id);
              return (
                <PropertyEquityCard
                  key={equity.id}
                  equity={equity}
                  property={property}
                  isExpanded={expandedProperty === equity.id}
                  onToggle={() => setExpandedProperty(expandedProperty === equity.id ? null : equity.id)}
                />
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowUpdateDialog(true)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Update All Values
          </Button>
        </div>

        <DisclaimerBox />
      </div>
    );
  }

  return null;
}