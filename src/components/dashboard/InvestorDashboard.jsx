import React from 'react';
import { TrendingUp, DollarSign, Home, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DemoBanner } from '@/components/demo/DemoBanner';

export default function InvestorDashboard({ data }) {
  const { portfolioStats, properties, tasks } = data;
  const [showMobileTip, setShowMobileTip] = React.useState(true);

  const urgentTasks = tasks?.filter(t => t.priority === 'High' || t.priority === 'Urgent') || [];
  const scheduledTasks = tasks?.filter(t => t.status === 'Scheduled') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoBanner />
      
      <div className="p-6">
        {/* Mobile Navigation Tip - Demo Only */}
        {showMobileTip && (
          <div className="md:hidden bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-xl shadow-lg relative animate-pulse mb-6">
            <button
              onClick={() => setShowMobileTip(false)}
              className="absolute top-2 right-2 text-white/80 hover:text-white"
              style={{ minHeight: '32px', minWidth: '32px' }}
            >
              ✕
            </button>
            <div className="pr-6">
              <p className="font-bold text-lg mb-2">👋 Portfolio Command Center</p>
              <p className="text-sm mb-3">
                Tap the <strong>☰ menu button</strong> in the top-left to navigate through all features and manage your 3-property portfolio.
              </p>
              <p className="text-xs opacity-90">
                💡 Tip: All cards are clickable. Explore freely!
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Command Center</h1>
          <p className="text-gray-600">
            Manage {portfolioStats.totalProperties} properties, {portfolioStats.totalUnits} units
          </p>
        </div>
        
        {/* Portfolio Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                ${(portfolioStats.totalValue / 1000).toFixed(0)}K
              </div>
              <p className="text-sm text-gray-600 mt-1">
                ${(portfolioStats.totalEquity / 1000).toFixed(0)}K equity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${portfolioStats.netCashFlow.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {portfolioStats.portfolioROI}% portfolio ROI
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {portfolioStats.averageHealthScore}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Portfolio-wide
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Prevented Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                ${(portfolioStats.preventedCosts / 1000).toFixed(1)}K
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Year to date
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Properties Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Properties</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {properties.map(property => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{property.nickname}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {property.city}, {property.state}
                      </p>
                    </div>
                    <Badge variant={property.health_score >= 85 ? 'default' : property.health_score >= 75 ? 'secondary' : 'destructive'}>
                      {property.health_score}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Value</span>
                      <span className="font-semibold">${(property.current_value / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Equity</span>
                      <span className="font-semibold text-green-600">${(property.equity / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cash Flow</span>
                      <span className="font-semibold">
                        ${(property.monthly_rent - property.monthly_mortgage).toLocaleString()}/mo
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600">{property.occupancy_status}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Items */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Urgent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Urgent Tasks ({urgentTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {urgentTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="border-l-4 border-red-500 pl-3 py-2">
                    <div className="font-semibold text-sm">{task.title}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {properties.find(p => p.id === task.property_id)?.nickname}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Est: ${task.current_fix_cost?.toLocaleString()}
                    </div>
                  </div>
                ))}
                {urgentTasks.length === 0 && (
                  <p className="text-sm text-gray-500">No urgent tasks</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Scheduled */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Coming Up ({scheduledTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduledTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="border-l-4 border-blue-500 pl-3 py-2">
                    <div className="font-semibold text-sm">{task.title}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {properties.find(p => p.id === task.property_id)?.nickname}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {task.scheduled_date}
                    </div>
                  </div>
                ))}
                {scheduledTasks.length === 0 && (
                  <p className="text-sm text-gray-500">No scheduled tasks</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}