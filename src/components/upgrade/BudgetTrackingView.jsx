import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upgrade } from '@/api/supabaseClient';
import { DollarSign, TrendingUp, AlertTriangle, Edit, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AICostDisclaimer from '../shared/AICostDisclaimer';

export default function BudgetTrackingView({ project, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetData, setBudgetData] = useState({
    materials: project.actual_costs?.materials || 0,
    labor: project.actual_costs?.labor || 0,
    permits: project.actual_costs?.permits || 0,
    other: project.actual_costs?.other || 0
  });

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => Upgrade.update(project.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upgrade', project.id] });
      setIsEditing(false);
      onUpdate?.();
    },
  });

  const estimatedTotal = project.investment_required || 0;
  const actualTotal = Object.values(budgetData).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const variance = actualTotal - estimatedTotal;
  const variancePercent = estimatedTotal > 0 ? (variance / estimatedTotal) * 100 : 0;

  const estimatedBreakdown = project.budget_breakdown || {
    materials: estimatedTotal * 0.6,
    labor: estimatedTotal * 0.3,
    permits: estimatedTotal * 0.05,
    contingency: estimatedTotal * 0.05
  };

  const handleSave = () => {
    updateMutation.mutate({
      actual_costs: budgetData,
      actual_cost: actualTotal
    });
  };

  const handleCancel = () => {
    setBudgetData({
      materials: project.actual_costs?.materials || 0,
      labor: project.actual_costs?.labor || 0,
      permits: project.actual_costs?.permits || 0,
      other: project.actual_costs?.other || 0
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      
      {/* AI Disclaimer */}
      <AICostDisclaimer variant="default" />

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-2 border-blue-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-700 font-semibold">Estimated Budget</p>
            </div>
            <p className="text-3xl font-bold text-blue-900">
              ${estimatedTotal.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-2 border-purple-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-purple-700 font-semibold">Actual Spent</p>
            </div>
            <p className="text-3xl font-bold text-purple-900">
              ${actualTotal.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className={`border-2 ${
          variance > 0 
            ? 'bg-red-50 border-red-300' 
            : variance < 0
            ? 'bg-green-50 border-green-300'
            : 'bg-gray-50 border-gray-300'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`w-5 h-5 ${variance > 0 ? 'text-red-600' : 'text-green-600'}`} />
              <p className="text-sm font-semibold">
                {variance > 0 ? 'Over Budget' : variance < 0 ? 'Under Budget' : 'On Budget'}
              </p>
            </div>
            <p className={`text-3xl font-bold ${
              variance > 0 ? 'text-red-900' : variance < 0 ? 'text-green-900' : 'text-gray-900'
            }`}>
              {variance > 0 ? '+' : ''}${Math.abs(variance).toLocaleString()}
            </p>
            <p className="text-sm mt-1 text-gray-600">
              ({variancePercent > 0 ? '+' : ''}{variancePercent.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cost Breakdown</CardTitle>
            {!isEditing ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                style={{ minHeight: '40px' }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Update Costs
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  style={{ minHeight: '40px' }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={updateMutation.isPending}
                  style={{ minHeight: '40px' }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Category</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700">Estimated</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700">Actual</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700">Variance</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'materials', label: '🛠️ Materials' },
                  { key: 'labor', label: '👷 Labor' },
                  { key: 'permits', label: '📋 Permits & Fees' },
                  { key: 'other', label: '📦 Other' }
                ].map(({ key, label }) => {
                  const est = estimatedBreakdown[key] || 0;
                  const act = parseFloat(budgetData[key]) || 0;
                  const diff = act - est;
                  
                  return (
                    <tr key={key} className="border-b border-gray-100">
                      <td className="py-3 font-medium">{label}</td>
                      <td className="text-right text-gray-600">${est.toLocaleString()}</td>
                      <td className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={budgetData[key]}
                            onChange={(e) => setBudgetData({ ...budgetData, [key]: e.target.value })}
                            className="w-32 text-right ml-auto"
                            min="0"
                            step="100"
                          />
                        ) : (
                          <span className="font-semibold">${act.toLocaleString()}</span>
                        )}
                      </td>
                      <td className={`text-right font-semibold ${
                        diff > 0 ? 'text-red-600' : diff < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {diff > 0 ? '+' : ''}${diff.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
                
                {/* Total Row */}
                <tr className="border-t-2 border-gray-300 font-bold">
                  <td className="py-3">TOTAL</td>
                  <td className="text-right">${estimatedTotal.toLocaleString()}</td>
                  <td className="text-right">${actualTotal.toLocaleString()}</td>
                  <td className={`text-right ${
                    variance > 0 ? 'text-red-600' : variance < 0 ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {variance > 0 ? '+' : ''}${variance.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Budget Health Indicator */}
          <div className={`mt-6 p-4 rounded-lg border-2 ${
            Math.abs(variancePercent) < 5 
              ? 'bg-green-50 border-green-300'
              : Math.abs(variancePercent) < 15
              ? 'bg-yellow-50 border-yellow-300'
              : 'bg-red-50 border-red-300'
          }`}>
            <p className="text-sm font-semibold mb-1">
              {Math.abs(variancePercent) < 5 
                ? '✅ On Track: Budget variance within acceptable range'
                : Math.abs(variancePercent) < 15
                ? '⚠️ Watch: Budget variance increasing'
                : '🚨 Alert: Significant budget variance'}
            </p>
            <p className="text-xs text-gray-700">
              Industry standard allows for 10-15% variance on renovation projects.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}