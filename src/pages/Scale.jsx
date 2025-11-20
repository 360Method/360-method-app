import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DollarSign,
  TrendingUp,
  Calculator,
  Trophy,
  Target,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  Info,
  Building2 // Added Building2 for the locked view
} from "lucide-react";
import StepNavigation from "../components/navigation/StepNavigation";
import EquityPositionCard from "../components/scale/EquityPositionCard";
import StrategicAnalysisCard from "../components/scale/StrategicAnalysisCard";
import WealthProjectionChart from "../components/scale/WealthProjectionChart";
import CapitalAllocationRanker from "../components/scale/CapitalAllocationRanker";
import BenchmarkComparison from "../components/scale/BenchmarkComparison";
import ScaleInvestorView from '../components/scale/ScaleInvestorView'; // Added ScaleInvestorView import
import { useDemo } from "../components/shared/DemoContext";
import StepEducationCard from "../components/shared/StepEducationCard";
import { STEP_EDUCATION } from "../components/shared/stepEducationContent";
import DemoInfoTooltip from '../components/demo/DemoInfoTooltip';

export default function Scale() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('equity-position');
  // const [whyExpanded, setWhyExpanded] = useState(false); // This state is no longer needed for the new StepEducationCard
  const { demoMode, demoData, isInvestor, isHomeowner } = useDemo(); // Updated useDemo destructuring

  // Fetch data
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      console.log('🔵 SCALE: Fetching properties, demoMode:', demoMode);
      if (demoMode) {
        const demoProps = isInvestor 
          ? (demoData?.properties || [])
          : (demoData?.property ? [demoData.property] : []);
        console.log('🔵 SCALE: Demo properties:', demoProps);
        return demoProps;
      }
      const realProps = await base44.entities.Property.list();
      console.log('🔵 SCALE: Real properties:', realProps);
      return realProps;
    },
    enabled: true,
    staleTime: 0
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: realEquityData = [] } = useQuery({
    queryKey: ['portfolio-equity', selectedProperty],
    queryFn: async () => {
      console.log('🔵 SCALE: Fetching equity for property:', selectedProperty);
      const equity = selectedProperty === 'all'
        ? await base44.entities.PortfolioEquity.list()
        : await base44.entities.PortfolioEquity.filter({ property_id: selectedProperty });
      console.log('🔵 SCALE: Equity data:', equity);
      return equity;
    },
    enabled: !demoMode && !!selectedProperty,
    staleTime: 0
  });

  const equityData = demoMode
    ? []
    : realEquityData;

  const portfolioMetrics = demoMode
    ? demoData?.portfolioMetrics
    : null;

  console.log('=== SCALE STATE ===');
  console.log('Demo mode:', demoMode);
  console.log('Portfolio metrics:', portfolioMetrics);

  const canEdit = !demoMode;

  const { data: recommendations = [] } = useQuery({
    queryKey: ['strategic-recommendations', selectedProperty],
    queryFn: () => selectedProperty === 'all'
      ? base44.entities.StrategicRecommendation.list()
      : base44.entities.StrategicRecommendation.filter({ property_id: selectedProperty }),
    enabled: !demoMode && !!selectedProperty
  });

  const { data: projections = [] } = useQuery({
    queryKey: ['wealth-projections'],
    queryFn: () => base44.entities.WealthProjection.list(),
    enabled: !demoMode
  });

  const { data: capitalAllocations = [] } = useQuery({
    queryKey: ['capital-allocations'],
    queryFn: () => base44.entities.CapitalAllocation.list(),
    enabled: !demoMode
  });

  const { data: benchmarks = [] } = useQuery({
    queryKey: ['portfolio-benchmarks'],
    queryFn: () => base44.entities.PortfolioBenchmark.list(),
    enabled: !demoMode
  });

  // Auto-select property
  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      if (properties.length === 1) {
        setSelectedProperty(properties[0].id);
      } else {
        setSelectedProperty('all');
      }
    }
  }, [properties, selectedProperty]);

  // Calculate portfolio totals
  const totalValue = equityData.reduce((sum, e) => sum + (e.current_market_value || 0), 0);
  const totalDebt = equityData.reduce((sum, e) => sum + (e.total_debt || 0), 0);
  const totalEquity = totalValue - totalDebt;
  const avgEquityPct = totalValue > 0 ? (totalEquity / totalValue * 100) : 0;

  // Show investor view if in investor demo mode
  if (isInvestor && demoMode && demoData?.scaleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 pb-20">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="mb-4 md:mb-6">
            <StepNavigation currentStep={9} propertyId={null} />
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="bg-green-600 text-white text-sm px-3 py-1">
                Phase III - ADVANCE
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1">
                Step 9 of 9
              </Badge>
              <Badge className="bg-purple-600 text-white text-sm px-3 py-1">
                🍒 UNLOCKED - Portfolio View
              </Badge>
            </div>
          </div>

          <ScaleInvestorView data={demoData.scaleData} />
        </div>
      </div>
    );
  }

  // Show locked view for homeowners with 1 property
  if (isHomeowner && demoMode && properties.length === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 pb-20">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="mb-4 md:mb-6">
            <StepNavigation currentStep={9} propertyId={properties[0]?.id} />
          </div>

          <Card className="border-2 border-blue-400 bg-blue-50 max-w-3xl mx-auto mt-12">
            <CardContent className="p-8 text-center">
              <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                🔒 SCALE Unlocks with 2+ Properties
              </h2>
              <p className="text-blue-800 mb-6">
                This demo shows a single property. The SCALE module provides portfolio CFO intelligence
                including equity tracking, wealth projections, and strategic recommendations across multiple properties.
              </p>
              <div className="bg-white rounded-lg p-4 text-left text-sm text-gray-700 mb-6">
                <p className="font-semibold mb-2">With SCALE, you get:</p>
                <ul className="space-y-1">
                  <li>• Portfolio-wide equity and value tracking</li>
                  <li>• 10-year wealth projections</li>
                  <li>• Hold/sell/refinance recommendations</li>
                  <li>• Capital allocation optimization</li>
                  <li>• Performance benchmarking</li>
                </ul>
              </div>
              <Badge className="bg-blue-600 text-white text-lg px-6 py-2">
                Add a 2nd property to unlock
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 pb-20">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">

        {/* Step Navigation */}
        <div className="mb-4 md:mb-6">
          <StepNavigation currentStep={9} propertyId={selectedProperty !== 'all' ? selectedProperty : null} />
        </div>

        {/* Demo Banner */}
        {demoMode && (
          <Alert className="mb-6 border-yellow-400 bg-yellow-50">
            <Info className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              <strong>Demo Mode:</strong> Single property portfolio showing $250K current equity,
              $520K projected in 10 years. Full SCALE features unlock with 2+ properties.
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
              Step 9 of 9
            </Badge>
            <Badge className="bg-purple-600 text-white text-sm px-3 py-1">
              🍒 FINAL STEP
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
              Scale
            </h1>
            <DemoInfoTooltip
              title="Step 9: SCALE"
              content="Your portfolio CFO - equity tracking, wealth projections, hold/sell/refinance recommendations. Unlocks with 2+ properties."
            />
          </div>
          <p className="text-gray-600 text-lg">
            Portfolio CFO Intelligence - strategic wealth command center for your real estate
          </p>
        </div>

        {/* NEW: Step Education Card */}
        <StepEducationCard
          {...STEP_EDUCATION.scale}
          defaultExpanded={false}
          className="mb-6"
        />

        {/* Why Scale Matters - Demo Content */}
        {demoMode && portfolioMetrics?.why_scale_matters && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 mb-6 border-2 border-purple-300">
            <h3 className="font-semibold text-lg mb-3 text-purple-900">Why Scale Matters</h3>
            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {portfolioMetrics.why_scale_matters}
            </div>
          </div>
        )}

        {/* Property Selector */}
        {properties.length > 0 && (
          <Card className="border-none shadow-lg mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Property View</label>
                  <Select value={selectedProperty || ''} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-full" style={{ minHeight: '48px' }}>
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.length > 1 && (
                        <SelectItem value="all">
                          💰 All Properties (Portfolio View)
                        </SelectItem>
                      )}
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

        {/* Demo Portfolio Metrics */}
        {demoMode && portfolioMetrics && (
          <div className="space-y-6">
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-purple-600" />
                  Current Equity Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Current Value</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${portfolioMetrics.current_property_value?.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Current Equity</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${portfolioMetrics.current_equity?.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">10-Year Projection</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${portfolioMetrics.projected_equity_10yr?.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Projected Growth</p>
                    <p className="text-2xl font-bold text-orange-600">
                      +${portfolioMetrics.equity_growth_10yr?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {portfolioMetrics.recommendation && (
              <Card className="border-2 border-green-300 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                      Recommendation: {portfolioMetrics.recommendation}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {portfolioMetrics.recommendation_reasoning}
                  </p>
                </CardContent>
              </Card>
            )}

            {portfolioMetrics.total_properties === 1 && portfolioMetrics.scale_message && (
              <Card className="border-2 border-blue-400 bg-blue-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-blue-900 mb-3 text-lg">
                    🔓 Unlock Full SCALE Features
                  </h3>
                  <p className="text-sm text-blue-800 mb-4 whitespace-pre-line leading-relaxed">
                    {portfolioMetrics.scale_message}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Portfolio Summary (when viewing all) - Non-demo */}
        {!demoMode && selectedProperty === 'all' && equityData.length > 1 && (
          <Card className="mb-6 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-purple-600" />
                Portfolio Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ${totalValue.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Total Debt</p>
                  <p className="text-2xl font-bold text-red-700">
                    ${totalDebt.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Net Equity</p>
                  <p className="text-2xl font-bold text-green-700">
                    ${totalEquity.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Equity %</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {avgEquityPct.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs - Non-demo */}
        {!demoMode && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
              <TabsTrigger
                value="equity-position"
                className="flex items-center gap-2 py-3"
                style={{ minHeight: '56px' }}
              >
                <DollarSign className="w-5 h-5" />
                <span className="hidden md:inline">Equity</span>
              </TabsTrigger>
              <TabsTrigger
                value="strategic-analysis"
                className="flex items-center gap-2 py-3"
                style={{ minHeight: '56px' }}
              >
                <Target className="w-5 h-5" />
                <span className="hidden md:inline">Strategy</span>
              </TabsTrigger>
              <TabsTrigger
                value="wealth-projections"
                className="flex items-center gap-2 py-3"
                style={{ minHeight: '56px' }}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="hidden md:inline">Projections</span>
              </TabsTrigger>
              <TabsTrigger
                value="capital-optimizer"
                className="flex items-center gap-2 py-3"
                style={{ minHeight: '56px' }}
              >
                <Calculator className="w-5 h-5" />
                <span className="hidden md:inline">Capital</span>
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="flex items-center gap-2 py-3"
                style={{ minHeight: '56px' }}
              >
                <Trophy className="w-5 h-5" />
                <span className="hidden md:inline">Performance</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="equity-position" className="mt-6 space-y-6">
              <EquityPositionCard
                equityData={equityData}
                properties={properties}
                selectedProperty={selectedProperty}
              />
            </TabsContent>

            <TabsContent value="strategic-analysis" className="mt-6 space-y-6">
              <StrategicAnalysisCard
                recommendations={recommendations}
                equityData={equityData}
                properties={properties}
                selectedProperty={selectedProperty}
              />
            </TabsContent>

            <TabsContent value="wealth-projections" className="mt-6 space-y-6">
              <WealthProjectionChart
                projections={projections}
                equityData={equityData}
                properties={properties}
              />
            </TabsContent>

            <TabsContent value="capital-optimizer" className="mt-6 space-y-6">
              <CapitalAllocationRanker
                capitalAllocations={capitalAllocations}
                properties={properties}
              />
            </TabsContent>

            <TabsContent value="performance" className="mt-6 space-y-6">
              <BenchmarkComparison
                benchmarks={benchmarks}
                equityData={equityData}
                properties={properties}
              />
            </TabsContent>

          </Tabs>
        )}

      </div>
    </div>
  );
}