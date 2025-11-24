import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export default function BudgetTracking({ propertyValue, spending, capexPlanning }) {
  const annualBudget = propertyValue * 0.01; // 1% rule
  const ytdSpent = spending.reduce((sum, item) => sum + item.amount, 0);
  const percentUsed = (ytdSpent / annualBudget) * 100;

  const spendingByCategory = spending.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = 0;
    acc[item.category] += item.amount;
    return acc;
  }, {});

  const categoryColors = {
    preventive: 'bg-green-500',
    repairs: 'bg-yellow-500',
    upgrades: 'bg-blue-500',
    emergency: 'bg-red-500'
  };

  const monthlySpending = spending.reduce((acc, item) => {
    const month = new Date(item.date).toLocaleDateString('en-US', { month: 'short' });
    if (!acc[month]) acc[month] = 0;
    acc[month] += item.amount;
    return acc;
  }, {});

  const maxMonthly = Math.max(...Object.values(monthlySpending), 1);

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Annual Budget (1% Rule)</div>
            <div className="text-3xl font-bold text-gray-900">
              ${annualBudget.toLocaleString()}
            </div>
          </div>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            percentUsed > 90 ? 'bg-red-100' :
            percentUsed > 70 ? 'bg-yellow-100' :
            'bg-green-100'
          }`}>
            <DollarSign className={`w-8 h-8 ${
              percentUsed > 90 ? 'text-red-600' :
              percentUsed > 70 ? 'text-yellow-600' :
              'text-green-600'
            }`} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Year-to-Date Spending</span>
            <span className="font-bold text-gray-900">
              ${ytdSpent.toLocaleString()}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                percentUsed > 90 ? 'bg-red-500' :
                percentUsed > 70 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Remaining</span>
            <span className="font-semibold text-gray-900">
              ${Math.max(0, annualBudget - ytdSpent).toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Category Breakdown */}
      <Card className="p-6">
        <div className="font-semibold text-gray-900 mb-4">Spending by Category</div>
        <div className="space-y-3">
          {Object.entries(spendingByCategory).map(([category, amount]) => {
            const percentage = (amount / ytdSpent) * 100;
            return (
              <div key={category}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="capitalize text-gray-700">{category}</span>
                  <span className="font-semibold text-gray-900">
                    ${amount.toLocaleString()} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${categoryColors[category] || 'bg-gray-500'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Monthly Spending Chart */}
      <Card className="p-6">
        <div className="font-semibold text-gray-900 mb-4">Monthly Spending</div>
        <div className="flex items-end gap-2 h-48">
          {Object.entries(monthlySpending).map(([month, amount]) => {
            const height = (amount / maxMonthly) * 100;
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs font-medium text-gray-900">
                  ${(amount / 1000).toFixed(1)}k
                </div>
                <div 
                  className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                  style={{ height: `${height}%` }}
                />
                <div className="text-xs text-gray-600">{month}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* CapEx Planning */}
      {capexPlanning && capexPlanning.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <div className="font-semibold text-gray-900">Anticipated Major Expenses</div>
          </div>
          <div className="space-y-3">
            {capexPlanning.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.system}</div>
                  <div className="text-sm text-gray-600">
                    Expected: {new Date(item.expected_date).getFullYear()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    ${item.estimated_cost.toLocaleString()}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.years_away} years
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}