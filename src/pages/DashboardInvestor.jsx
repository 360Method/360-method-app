import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Home, TrendingUp, DollarSign, AlertTriangle, CheckCircle,
  Building2, PieChart, Calendar, ArrowRight, Zap, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '../components/shared/DemoContext';
import { createPageUrl } from '@/utils';
import DemoCTA from '../components/demo/DemoCTA';

export default function DashboardInvestor() {
  const navigate = useNavigate();
  const { demoMode, demoData, markStepVisited } = useDemo();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (demoMode) markStepVisited(0);
  }, [demoMode, markStepVisited]);

  // Fetch real data
  const { data: realProperties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const allProps = await base44.entities.Property.list('-created_date');
      return allProps.filter(p => !p.is_draft);
    },
    enabled: !demoMode
  });

  const properties = demoMode ? (demoData?.properties || []) : realProperties;

  // Use demo portfolio stats or calculate from real data
  const portfolioStats = demoMode 
    ? demoData?.portfolioStats || {
        totalProperties: 3,
        totalUnits: 7,
        totalValue: 895000,
        totalEquity: 412000,
        monthlyRevenue: 5350,
        monthlyExpenses: 4150,
        netCashFlow: 1200,
        avgHealthScore: 81,
        portfolioROI: 18.5
      }
    : {
        totalProperties: properties.length,
        totalUnits: properties.reduce((sum, p) => sum + (p.door_count || 1), 0),
        totalValue: properties.reduce((sum, p) => sum + (p.current_value || 0), 0),
        totalEquity: properties.reduce((sum, p) => {
          const value = p.current_value || 0;
          const debt = p.mortgage_balance || 0;
          return sum + (value - debt);
        }, 0),
        monthlyRevenue: properties.reduce((sum, p) => sum + (p.monthly_rent || 0), 0),
        avgHealthScore: properties.reduce((sum, p) => sum + (p.health_score || 0), 0) / (properties.length || 1)
      };

  portfolioStats.netCashFlow = portfolioStats.monthlyRevenue - (portfolioStats.monthlyExpenses || 0);

  // Demo properties for cards
  const demoPropertyCards = demoMode ? [
    {
      id: 'prop-1',
      name: '742 Maple Street',
      type: 'Duplex',
      units: 2,
      healthScore: 86,
      monthlyRevenue: 3400,
      monthlyExpenses: 2650,
      netCashFlow: 750,
      urgentTasks: 0,
      upcomingTasks: 3
    },
    {
      id: 'prop-2',
      name: '1834 Oak Avenue',
      type: 'Single-Family',
      units: 1,
      healthScore: 92,
      monthlyRevenue: 2450,
      monthlyExpenses: 1680,
      netCashFlow: 770,
      urgentTasks: 0,
      upcomingTasks: 2
    },
    {
      id: 'prop-3',
      name: '2156 Pine Boulevard',
      type: '4-Plex',
      units: 4,
      healthScore: 78,
      monthlyRevenue: 6800,
      monthlyExpenses: 5120,
      netCashFlow: 1680,
      urgentTasks: 2,
      upcomingTasks: 8
    }
  ] : properties.slice(0, 3);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        {demoMode ? (
          <>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Dashboard
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-2">
              Your Command Center
            </p>
            <p className="text-sm text-gray-500">
              {portfolioStats.totalProperties} properties • {portfolioStats.totalUnits} {typeof portfolioStats.totalUnits === 'number' ? 'units' : ''} • Clark County, WA
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Portfolio Command Center 📊
            </h1>
            <p className="text-gray-600">
              {portfolioStats.totalProperties} properties • {typeof portfolioStats.totalUnits === 'number' ? portfolioStats.totalUnits : 0} units • Clark County, WA
            </p>
          </>
        )}
      </div>

      {/* SECTION 1: PORTFOLIO OVERVIEW (The Big 4) */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-sky-100 border-2 border-blue-300 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700 bg-blue-200 px-2 py-1 rounded-full">
              PORTFOLIO
            </span>
          </div>
          <div className="text-sm text-blue-800 mb-1">Total Value</div>
          <div className="text-3xl font-bold text-blue-900">
            ${(portfolioStats.totalValue / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-blue-700 mt-2">
            {portfolioStats.totalProperties} properties
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded-full">
              EQUITY
            </span>
          </div>
          <div className="text-sm text-green-800 mb-1">Total Equity</div>
          <div className="text-3xl font-bold text-green-900">
            ${(portfolioStats.totalEquity / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-green-700 mt-2">
            {((portfolioStats.totalEquity / portfolioStats.totalValue) * 100).toFixed(0)}% of value
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 border-2 border-purple-300 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <span className="text-xs font-semibold text-purple-700 bg-purple-200 px-2 py-1 rounded-full">
              CASH FLOW
            </span>
          </div>
          <div className="text-sm text-purple-800 mb-1">Net Monthly</div>
          <div className="text-3xl font-bold text-purple-900">
            ${portfolioStats.netCashFlow?.toLocaleString() || '0'}
          </div>
          <div className="text-xs text-purple-700 mt-2">
            ${((portfolioStats.netCashFlow || 0) * 12).toLocaleString()}/year
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-100 border-2 border-orange-300 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <PieChart className="w-8 h-8 text-orange-600" />
            <span className="text-xs font-semibold text-orange-700 bg-orange-200 px-2 py-1 rounded-full">
              ROI
            </span>
          </div>
          <div className="text-sm text-orange-800 mb-1">Portfolio ROI</div>
          <div className="text-3xl font-bold text-orange-900">
            {portfolioStats.portfolioROI?.toFixed(1) || '0.0'}%
          </div>
          <div className="text-xs text-orange-700 mt-2">
            Annualized return
          </div>
        </div>
      </div>

      {/* SECTION 2: PROPERTY CARDS */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Properties</h2>
          <button 
            onClick={() => navigate(createPageUrl('Properties'))}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div 
          data-tour="property-cards"
          className="grid md:grid-cols-3 gap-6"
        >
          {demoPropertyCards.map(prop => (
            <PropertyCard key={prop.id} property={prop} navigate={navigate} />
          ))}
        </div>
      </div>

      {/* SECTION 3: PORTFOLIO ALERTS & ACTIONS */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Portfolio Alerts */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Portfolio Alerts</h2>
              <p className="text-sm text-gray-600">Requires attention</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Pine 4-Plex: 2 Urgent Tasks
                </h3>
                <p className="text-sm text-gray-600">
                  HVAC filter replacement overdue (Unit 3), Deck railing loose (Unit 1)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Maple Duplex: Roof Replacement Due 2025
                </h3>
                <p className="text-sm text-gray-600">
                  Current roof 18 years old. Plan CapEx for summer 2025.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Winter Inspections Scheduled
                </h3>
                <p className="text-sm text-gray-600">
                  All 3 properties: Dec 10-20. Expect 6-8 action items.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-600">Portfolio management</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(createPageUrl('Scale'))}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl hover:shadow-md transition-all text-left"
              style={{ minHeight: '48px' }}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-semibold text-gray-900">Portfolio CFO</div>
                  <div className="text-xs text-gray-600">10-year projections & analysis</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-600" />
            </button>

            <button
              onClick={() => navigate(createPageUrl('Prioritize'))}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl hover:shadow-md transition-all text-left"
              style={{ minHeight: '48px' }}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-semibold text-gray-900">All Urgent Tasks</div>
                  <div className="text-xs text-gray-600">2 tasks across portfolio</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-red-600" />
            </button>

            <button
              onClick={() => navigate(createPageUrl('Preserve'))}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-xl hover:shadow-md transition-all text-left"
              style={{ minHeight: '48px' }}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-gray-900">CapEx Planning</div>
                  <div className="text-xs text-gray-600">Major replacements timeline</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-600" />
            </button>

            <button
              onClick={() => navigate(createPageUrl('Upgrade'))}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:shadow-md transition-all text-left"
              style={{ minHeight: '48px' }}
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-semibold text-gray-900">Portfolio Upgrades</div>
                  <div className="text-xs text-gray-600">5 projects in progress</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-green-600" />
            </button>
          </div>
        </div>
      </div>

      <DemoCTA />
    </div>
  );
}

// Property Card Component
function PropertyCard({ property, navigate }) {
  const healthColor = 
    property.healthScore >= 85 ? 'green' :
    property.healthScore >= 70 ? 'yellow' :
    'red';

  const healthColorClasses = {
    green: { bg: 'bg-green-100', text: 'text-green-700' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    red: { bg: 'bg-red-100', text: 'text-red-700' }
  };

  return (
    <div 
      className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => navigate(createPageUrl('Properties'))}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">{property.name || property.address}</h3>
          <p className="text-sm text-gray-600">{property.type || property.property_type} • {typeof property.units === 'number' ? property.units : property.door_count || 1} unit{(property.units > 1 || property.door_count > 1) ? 's' : ''}</p>
        </div>
        <div className={`w-12 h-12 ${healthColorClasses[healthColor].bg} rounded-full flex items-center justify-center`}>
          <span className={`text-lg font-bold ${healthColorClasses[healthColor].text}`}>
            {property.healthScore || property.health_score || 0}
          </span>
        </div>
      </div>

      {/* Cash Flow */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Revenue:</span>
          <span className="font-semibold text-gray-900">
            ${property.monthlyRevenue?.toLocaleString() || '0'}/mo
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Expenses:</span>
          <span className="font-semibold text-gray-900">
            ${property.monthlyExpenses?.toLocaleString() || '0'}/mo
          </span>
        </div>
        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
          <span className="font-semibold text-gray-900">Net Cash Flow:</span>
          <span className="font-bold text-green-600">
            +${property.netCashFlow?.toLocaleString() || '0'}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex items-center justify-between text-sm">
        {property.urgentTasks > 0 ? (
          <span className="flex items-center gap-1 text-red-600 font-semibold">
            <AlertTriangle className="w-4 h-4" />
            {property.urgentTasks} urgent
          </span>
        ) : (
          <span className="flex items-center gap-1 text-green-600 font-semibold">
            <CheckCircle className="w-4 h-4" />
            No urgent tasks
          </span>
        )}
        <span className="text-gray-500">
          {property.upcomingTasks} upcoming
        </span>
      </div>
    </div>
  );
}