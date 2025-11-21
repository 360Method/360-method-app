import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield, Calendar, TrendingUp, AlertTriangle, DollarSign, ChevronRight, ChevronDown,
  Calculator, Trophy, Lightbulb, Zap, AlertCircle, Info
} from "lucide-react";
import StepNavigation from "../components/navigation/StepNavigation";
import ReplacementForecastTimeline from "../components/preserve/ReplacementForecastTimeline";
import PreservationRecommendationCard from "../components/preserve/PreservationRecommendationCard";
import DecisionCalculator from "../components/preserve/DecisionCalculator";
import InvestmentMatrix from "../components/preserve/InvestmentMatrix";
import PreservationROIChart from "../components/preserve/PreservationROIChart";
import { useDemo } from "../components/shared/DemoContext";
import StepEducationCard from "../components/shared/StepEducationCard";
import { STEP_EDUCATION } from "../components/shared/stepEducationContent";
import DemoInfoTooltip from '../components/demo/DemoInfoTooltip';
import RegionalAdaptationBox from '../components/shared/RegionalAdaptationBox';

// The Big 7 system categories
const BIG_7_CATEGORIES = [
  'HVAC', 'Water Heater', 'Water Softener', 'Sump Pump',
  'Roof', 'Foundation', 'Drainage',
  'Deck', 'Driveway', 'Patio',
  'Siding', 'Windows', 'Exterior Doors', 'Garage Door',
  'Refrigerator', 'Dishwasher', 'Washer', 'Dryer', 'Range/Oven'
];

export default function Preserve() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('forecast');
  // `whyExpanded` state was related to the old "Why Preserve Matters" card.
  // Since that card is being replaced by `StepEducationCard`, this state is no longer needed.
  // const [whyExpanded, setWhyExpanded] = useState(false);
  const { demoMode, demoData, isInvestor, markStepVisited } = useDemo();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (demoMode) markStepVisited(7);
  }, [demoMode, markStepVisited]);

  // Fetch data
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      console.log('🔵 PRESERVE: Fetching properties, demoMode:', demoMode);
      if (demoMode) {
        const demoProps = isInvestor ? (demoData?.properties || []) : (demoData?.property ? [demoData.property] : []);
        console.log('🔵 PRESERVE: Demo properties:', demoProps);
        return demoProps;
      }
      const realProps = await base44.entities.Property.list();
      console.log('🔵 PRESERVE: Real properties:', realProps);
      return realProps;
    },
    enabled: true,
    staleTime: 0 // Force fresh data
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: realSystems = [] } = useQuery({
    queryKey: ['systems', selectedProperty],
    queryFn: async () => {
      console.log('🔵 PRESERVE: Fetching systems for property:', selectedProperty, 'demoMode:', demoMode);
      if (demoMode) {
        if (isInvestor) {
          if (!selectedProperty) return [];
          const filtered = demoData?.systems?.filter(s => s.property_id === selectedProperty) || [];
          console.log('🔵 PRESERVE: Demo investor systems:', filtered);
          return filtered;
        }
        const demoSystems = demoData?.systems || [];
        console.log('🔵 PRESERVE: Demo homeowner systems:', demoSystems);
        return demoSystems;
      }
      const realSystems = await base44.entities.SystemBaseline.filter({ property_id: selectedProperty });
      console.log('🔵 PRESERVE: Real systems:', realSystems);
      return realSystems;
    },
    enabled: !!selectedProperty,
    staleTime: 0
  });

  const allSystems = realSystems;

  // Filter to Big 7 systems only with min replacement cost
  const systems = allSystems.filter(s => {
    const systemCategory = s.system_type?.split(' - ')[0] || s.system_type;
    const isBig7 = BIG_7_CATEGORIES.some(cat => systemCategory?.includes(cat));
    const meetsMinCost = (s.replacement_cost_estimate || 0) >= 1500;
    return isBig7 && meetsMinCost;
  });

  const { data: realRecommendations = [] } = useQuery({
    queryKey: ['preservation-recommendations', selectedProperty],
    queryFn: () => base44.entities.PreservationRecommendation.filter({ property_id: selectedProperty }),
    enabled: !demoMode && !!selectedProperty
  });

  const recommendations = demoMode
    ? [] // Demo doesn't use PreservationRecommendation entity, it uses preserveSchedules
    : realRecommendations;

  const { data: realImpacts = [] } = useQuery({
    queryKey: ['preservation-impacts', selectedProperty],
    queryFn: () => base44.entities.PreservationImpact.filter({ property_id: selectedProperty }),
    enabled: !demoMode && !!selectedProperty
  });

  const impacts = demoMode
    ? [] // Demo doesn't use PreservationImpact entity
    : realImpacts;

  const preserveSchedules = demoMode
    ? (isInvestor ? (demoData?.preserveSchedules || []) : (demoData?.preserveSchedules || []))
    : [];

  const canEdit = !demoMode;

  // Auto-select first property
  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  // Filter recommendations by priority
  const urgentRecommendations = recommendations.filter(r => r.priority === 'URGENT' && r.status === 'PENDING');
  const recommendedItems = recommendations.filter(r => r.priority === 'RECOMMENDED' && r.status === 'PENDING');
  const optionalItems = recommendations.filter(r => r.priority === 'OPTIONAL' && r.status === 'PENDING');

  // Calculate ROI metrics
  const totalInvested = impacts.reduce((sum, i) => sum + (i.intervention_cost || 0), 0);
  const totalValueCreated = impacts.reduce((sum, i) => sum + (i.replacement_cost_avoided || 0), 0);
  const overallROI = totalInvested > 0 ? (totalValueCreated / totalInvested).toFixed(1) : 0;
  const totalYearsExtended = impacts.reduce((sum, i) => sum + (i.years_extended || 0), 0);

  // Calculate systems at different risk levels
  const currentYear = new Date().getFullYear();
  const systemsByUrgency = systems.reduce((acc, s) => {
    if (!s.installation_year || !s.estimated_lifespan_years) return acc;
    const age = currentYear - s.installation_year;
    const totalLifespan = s.estimated_lifespan_years + (s.lifespan_extension_total_years || 0);
    const yearsRemaining = totalLifespan - age;

    if (yearsRemaining <= 2 || s.condition === 'Poor') {
      acc.urgent++;
    } else if (yearsRemaining <= 5) {
      acc.planAhead++;
    } else {
      acc.healthy++;
    }
    return acc;
  }, { urgent: 0, planAhead: 0, healthy: 0 });

  // Calculate total capital at risk
  const totalCapitalAtRisk = systems.reduce((sum, s) => sum + (s.replacement_cost_estimate || 0), 0);

  // Get demo interventions if in demo mode
  const demoInterventions = (demoMode && preserveSchedules[0]?.interventions) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">

        {/* Step Navigation */}
        <div className="mb-4 md:mb-6">
          <StepNavigation currentStep={7} propertyId={selectedProperty !== 'all' ? selectedProperty : null} />
        </div>

        {/* Demo Banner */}
        {demoMode && (
          <Alert className="mb-6 border-yellow-400 bg-yellow-50">
            <Info className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              <strong>Demo Mode:</strong> 4 strategic interventions with 3x+ ROI
              (NOT routine maintenance). Total investment: ${preserveSchedules[0]?.total_investment?.toLocaleString()} to avoid ${preserveSchedules[0]?.total_replacement_costs_avoided?.toLocaleString()} in replacements.
              Read-only example.
            </AlertDescription>
          </Alert>
        )}

        {/* Phase & Step Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className="bg-green-600 text-white text-sm px-3 py-1">
              Phase III - ADVANCE
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Step 7 of 9
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
              Preserve
            </h1>
            <DemoInfoTooltip
              title="Step 7: Preserve"
              content="Strategic interventions that extend system life 3-15 years. NOT routine maintenance (that's ACT). These are high-ROI investments (3×-11× return)."
            />
          </div>
          <p className="text-gray-600 text-lg">
            Strategic intelligence for your Big 7 capital systems - extend life, avoid emergencies, protect investment
          </p>
        </div>

        {/* NEW: Step Education Card */}
        <StepEducationCard
          {...STEP_EDUCATION.preserve}
          defaultExpanded={false}
          className="mb-6"
          demoMode={demoMode} // Pass demoMode to the card if it needs to adjust content based on it
        />

        {/* Property Selector */}
        {properties.length > 0 && (
          <Card className="border-none shadow-lg mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Property</label>
                  <Select value={selectedProperty || ''} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-full" style={{ minHeight: '48px' }}>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demo Interventions Display */}
        {demoMode && demoInterventions.length > 0 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#1B365D' }}>
              <Lightbulb className="w-7 h-7 text-blue-600" />
              Strategic Life Extension Interventions ({demoInterventions.length})
            </h2>

            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600 mb-1">Total Investment</p>
                    <p className="text-2xl font-bold text-blue-700">
                      ${preserveSchedules[0]?.total_investment?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 mb-1">Replacement Costs Avoided</p>
                    <p className="text-2xl font-bold text-green-700">
                      ${preserveSchedules[0]?.total_replacement_costs_avoided?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 mb-1">Average ROI</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {preserveSchedules[0]?.average_roi}x
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 mb-1">Total Years Extended</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {demoInterventions.reduce((sum, i) => sum + (i.years_extended || 0), 0)} years
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {demoInterventions.map((intervention, index) => (
                <Card key={intervention.id} className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2" style={{ color: '#1B365D' }}>
                          {intervention.intervention}
                        </h3>
                        <Badge className="bg-blue-600 text-white mb-2">
                          {intervention.system_name}
                        </Badge>
                        <p className="text-gray-700 text-sm mb-3">
                          {intervention.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {intervention.roi_multiplier}x ROI
                        </div>
                        <Badge className={
                          intervention.status === 'Recommended' ? 'bg-orange-600' :
                          intervention.status === 'Planned' ? 'bg-blue-600' :
                          'bg-gray-600'
                        }>
                          {intervention.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500">Investment</p>
                        <p className="font-semibold">${intervention.investment_cost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Replacement Avoided</p>
                        <p className="font-semibold text-green-600">
                          ${intervention.replacement_cost_avoided.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Life Extension</p>
                        <p className="font-semibold text-blue-600">
                          +{intervention.years_extended} years
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Frequency</p>
                        <p className="font-semibold">{intervention.frequency}</p>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 mb-3">
                      <p className="text-sm font-semibold text-green-900 mb-2">
                        💡 Why Worth It:
                      </p>
                      <p className="text-sm text-green-800">
                        {intervention.why_worth_it}
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-600">
                      <p className="text-xs text-blue-900">
                        <strong>Not Routine Because:</strong> {intervention.not_routine_because}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Overview Summary */}
        {!demoMode && selectedProperty && systems.length > 0 && (
          <Card className="mb-6 border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-600" />
                Portfolio Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Systems Tracked: <strong>{systems.length} major systems</strong></p>
                  <div className="flex flex-wrap gap-2">
                    {systemsByUrgency.urgent > 0 && (
                      <Badge className="bg-red-600 text-white">
                        🔴 URGENT: {systemsByUrgency.urgent} system{systemsByUrgency.urgent !== 1 ? 's' : ''}
                      </Badge>
                    )}
                    {systemsByUrgency.planAhead > 0 && (
                      <Badge className="bg-yellow-600 text-white">
                        🟡 PLAN AHEAD: {systemsByUrgency.planAhead} system{systemsByUrgency.planAhead !== 1 ? 's' : ''}
                      </Badge>
                    )}
                    {systemsByUrgency.healthy > 0 && (
                      <Badge className="bg-green-600 text-white">
                        🟢 HEALTHY: {systemsByUrgency.healthy} system{systemsByUrgency.healthy !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border-2 border-red-200">
                    <p className="text-sm text-gray-600 mb-1">💰 Total Capital at Risk</p>
                    <p className="text-2xl font-bold text-red-700">
                      ${totalCapitalAtRisk.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">If all systems replaced today</p>
                  </div>

                  {totalValueCreated > 0 && (
                    <div className="p-4 bg-white rounded-lg border-2 border-green-200">
                      <p className="text-sm text-gray-600 mb-1">🛡️ Preservation Value Created</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${totalValueCreated.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Lifetime avoided costs</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs - Only show for non-demo */}
        {!demoMode && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
              <TabsTrigger
                value="forecast"
                className="flex items-center gap-2 py-3"
                style={{ minHeight: '56px' }}
              >
                <Calendar className="w-5 h-5" />
                <span className="hidden md:inline">Forecast</span>
              </TabsTrigger>
              <TabsTrigger
                value="opportunities"
                className="flex items-center gap-2 py-3"
                style={{ minHeight: '56px' }}
              >
                <Lightbulb className="w-5 h-5" />
                <span className="hidden md:inline">Opportunities</span>
              </TabsTrigger>
              <TabsTrigger
                value="calculator"
                className="flex items-center gap-2 py-3"
                style={{ minHeight: '56px' }}
              >
                <Calculator className="w-5 h-5" />
                <span className="hidden md:inline">Calculator</span>
              </TabsTrigger>
              <TabsTrigger
                value="priorities"
                className="flex items-center gap-2 py-3"
                style={{ minHeight: '56px' }}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="hidden md:inline">Priorities</span>
              </TabsTrigger>
              <TabsTrigger
                value="roi"
                className="flex items-center gap-2 py-3"
                style={{ minHeight: '56px' }}
              >
                <Trophy className="w-5 h-5" />
                <span className="hidden md:inline">ROI</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Replacement Forecast */}
            <TabsContent value="forecast" className="mt-6 space-y-6">
              <ReplacementForecastTimeline
                systems={systems}
                property={properties.find(p => p.id === selectedProperty)}
              />
            </TabsContent>

            {/* Tab 2: Life-Extension Opportunities */}
            <TabsContent value="opportunities" className="mt-6 space-y-6">

              {/* Info Banner */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 text-sm mb-1">Strategic Interventions Only</p>
                      <p className="text-sm text-blue-800">
                        Showing Big 7 systems with ROI 3x+ and intervention costs $500-5,000. Routine maintenance tasks are in the ACT module.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Urgent Section */}
              {urgentRecommendations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h2 className="font-bold text-xl text-gray-900">
                      🔥 URGENT - Do Within 6 Months ({urgentRecommendations.length})
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {urgentRecommendations.map(rec => (
                      <PreservationRecommendationCard
                        key={rec.id}
                        recommendation={rec}
                        systems={systems}
                        property={properties.find(p => p.id === selectedProperty)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Section */}
              {recommendedItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-6 h-6 text-orange-600" />
                    <h2 className="font-bold text-xl text-gray-900">
                      ⚡ RECOMMENDED - Plan Within 12 Months ({recommendedItems.length})
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {recommendedItems.map(rec => (
                      <PreservationRecommendationCard
                        key={rec.id}
                        recommendation={rec}
                        systems={systems}
                        property={properties.find(p => p.id === selectedProperty)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Section */}
              {optionalItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                    <h2 className="font-bold text-xl text-gray-900">
                      💰 OPTIONAL - Consider for Optimization ({optionalItems.length})
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {optionalItems.map(rec => (
                      <PreservationRecommendationCard
                        key={rec.id}
                        recommendation={rec}
                        systems={systems}
                        property={properties.find(p => p.id === selectedProperty)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {recommendations.filter(r => r.status === 'PENDING').length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">All Systems Looking Good!</h3>
                    <p className="text-gray-600 mb-4">
                      No strategic preservation recommendations at this time. Your Big 7 systems are either:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 text-left max-w-md mx-auto">
                      <li>• Too new (less than 75% of lifespan)</li>
                      <li>• Too old (better to replace than intervene)</li>
                      <li>• In excellent condition</li>
                      <li>• Not cost-effective to intervene (ROI below 3x)</li>
                    </ul>
                    <p className="text-sm text-gray-500 mt-4">
                      Check back as systems age. PRESERVE monitors your Big 7 daily.
                    </p>
                  </CardContent>
                </Card>
              )}

            </TabsContent>

            {/* Tab 3: Decision Calculator */}
            <TabsContent value="calculator" className="mt-6">
              <DecisionCalculator
                systems={systems}
                recommendations={recommendations}
                property={properties.find(p => p.id === selectedProperty)}
              />
            </TabsContent>

            {/* Tab 4: Investment Priorities */}
            <TabsContent value="priorities" className="mt-6">
              <InvestmentMatrix
                recommendations={recommendations.filter(r => r.status === 'PENDING')}
                systems={systems}
              />
            </TabsContent>

            {/* Tab 5: Preservation ROI */}
            <TabsContent value="roi" className="mt-6 space-y-6">
              <PreservationROIChart
                impacts={impacts}
                totalInvested={totalInvested}
                totalValueCreated={totalValueCreated}
                overallROI={overallROI}
                totalYearsExtended={totalYearsExtended}
              />
            </TabsContent>

          </Tabs>
        )}

        {/* Empty State - No Big 7 Systems */}
        {!demoMode && selectedProperty && systems.length === 0 && (
          <Card className="border-2 border-gray-200">
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Big 7 Systems Found</h3>
              <p className="text-gray-600 mb-4">
                PRESERVE tracks major capital systems with replacement costs $1,500+. Complete your system baseline in the AWARE phase to see preservation forecasts.
              </p>
              <p className="text-sm text-gray-500">
                The Big 7: HVAC, Water Heater, Roof, Foundation, Major Appliances, Exterior Envelope, Major Structures
              </p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}