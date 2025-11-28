import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auth, Property, MaintenanceTask, Inspection } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Plus,
  ArrowRight,
  TrendingUp,
  Calendar,
  Camera,
  Menu as MenuIcon
} from 'lucide-react';
import HealthScoreGauge from '../components/portal/HealthScoreGauge';
import PropertySummaryCards from '../components/portal/PropertySummaryCards';
import ActionItemsTierView from '../components/portal/ActionItemsTierView';
import PortfolioOverview from '../components/portal/PortfolioOverview';
import { createPageUrl } from '@/utils';

export default function PortalDashboard() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => auth.me()
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => Property.list('-created_date')
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', selectedProperty?.id],
    queryFn: () => MaintenanceTask.filter({
      property_id: selectedProperty?.id,
      status: { $ne: 'Completed' }
    }),
    enabled: !!selectedProperty?.id
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ['inspections', selectedProperty?.id],
    queryFn: () => Inspection.filter({
      property_id: selectedProperty?.id
    }),
    enabled: !!selectedProperty?.id
  });

  // Auto-select first property if none selected
  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0]);
    }
  }, [properties, selectedProperty]);

  const isInvestor = properties.length > 1;

  // Calculate action items by tier
  const actionItems = tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    tier: task.priority === 'High' ? 'Safety/Urgent' :
          task.priority === 'Medium' ? 'Preventive/ROI' :
          'Comfort/Aesthetic',
    location: task.system_type,
    estimated_cost: task.estimated_cost_min,
    date_identified: task.created_date,
    status: task.status
  }));

  // Calculate budget info
  const budgetInfo = {
    annual: (selectedProperty?.current_value || 300000) * 0.01,
    spent: selectedProperty?.total_maintenance_spent || 0
  };

  // Get next task
  const upcomingInspections = inspections
    .filter(i => i.status !== 'Completed')
    .sort((a, b) => new Date(a.inspection_date) - new Date(b.inspection_date));

  const nextTask = upcomingInspections.length > 0 ? {
    title: `${upcomingInspections[0].season} Inspection`,
    type: 'Seasonal Inspection',
    date: upcomingInspections[0].inspection_date,
    daysUntil: Math.ceil((new Date(upcomingInspections[0].inspection_date) - new Date()) / (1000 * 60 * 60 * 24))
  } : {
    title: 'Schedule Your First Inspection',
    type: 'Get Started',
    date: new Date(),
    daysUntil: 0
  };

  const handleCompleteTask = (task) => {
    // Navigate to execute page or mark complete
    window.location.href = createPageUrl('Execute') + `?task=${task.id}`;
  };

  const handleScheduleTask = (task) => {
    window.location.href = createPageUrl('Schedule') + `?task=${task.id}`;
  };

  const handleRequestHelp = (task) => {
    window.location.href = createPageUrl('Services') + `?task=${task.id}`;
  };

  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Your Property Portal
          </h1>
          <p className="text-gray-600 mb-6">
            Add your first property to start managing maintenance, tracking health scores, and protecting your investment.
          </p>
          <Button
            onClick={() => window.location.href = createPageUrl('Properties')}
            className="w-full gap-2"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            Add Your First Property
          </Button>
        </Card>
      </div>
    );
  }

  // Show portfolio view for investors
  if (isInvestor && !selectedProperty) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                My Portfolio
              </h1>
              <p className="text-gray-600 mt-1">
                {properties.length} properties
              </p>
            </div>
            <Button
              onClick={() => window.location.href = createPageUrl('Properties')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Property
            </Button>
          </div>

          <PortfolioOverview
            properties={properties}
            onSelectProperty={(property) => setSelectedProperty(property)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Property Selector for Investors */}
        {isInvestor && (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedProperty(null)}
              className="gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Portfolio
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {selectedProperty?.address || 'Property Dashboard'}
              </h1>
              <p className="text-gray-600">
                {selectedProperty?.city}, {selectedProperty?.state}
              </p>
            </div>
            {isInvestor && (
              <select
                value={selectedProperty?.id || ''}
                onChange={(e) => {
                  const property = properties.find(p => p.id === e.target.value);
                  setSelectedProperty(property);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {properties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.address}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Health Score Section */}
        <div className="mb-8">
          <Card className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <HealthScoreGauge
                  score={selectedProperty?.health_score || 0}
                  previousScore={selectedProperty?.previous_health_score}
                  size="large"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Property Health Score
                </h2>
                <p className="text-gray-600 mb-4">
                  Based on baseline completion, system conditions, and maintenance history
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = createPageUrl('Baseline')}
                    className="gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Update Baseline
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = createPageUrl('Inspect')}
                    className="gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Run Inspection
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="mb-8">
          <PropertySummaryCards
            actionItems={actionItems}
            budget={budgetInfo}
            nextTask={nextTask}
          />
        </div>

        {/* Action Items Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Action Items</h2>
            <Button
              variant="outline"
              onClick={() => window.location.href = createPageUrl('Prioritize')}
            >
              View All
            </Button>
          </div>
          <ActionItemsTierView
            items={actionItems.slice(0, 5)}
            onComplete={handleCompleteTask}
            onSchedule={handleScheduleTask}
            onRequestHelp={handleRequestHelp}
          />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.location.href = createPageUrl('Track')}
          >
            <Camera className="w-8 h-8 text-blue-600 mb-3" />
            <div className="font-semibold text-gray-900">Photos</div>
            <div className="text-sm text-gray-600">View timeline</div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.location.href = createPageUrl('Schedule')}
          >
            <Calendar className="w-8 h-8 text-green-600 mb-3" />
            <div className="font-semibold text-gray-900">Calendar</div>
            <div className="text-sm text-gray-600">View schedule</div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.location.href = createPageUrl('Upgrade')}
          >
            <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
            <div className="font-semibold text-gray-900">Upgrades</div>
            <div className="text-sm text-gray-600">Plan projects</div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.location.href = createPageUrl('Services')}
          >
            <MenuIcon className="w-8 h-8 text-orange-600 mb-3" />
            <div className="font-semibold text-gray-900">Services</div>
            <div className="text-sm text-gray-600">Get help</div>
          </Card>
        </div>
      </div>
    </div>
  );
}