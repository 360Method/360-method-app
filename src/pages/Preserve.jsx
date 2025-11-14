import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Shield,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronDown,
  Download,
  Calculator,
  Trophy,
  Lightbulb,
  Zap
} from "lucide-react";
import StepNavigation from "../components/navigation/StepNavigation";
import ReplacementForecastTimeline from "../components/preserve/ReplacementForecastTimeline";
import PreservationRecommendationCard from "../components/preserve/PreservationRecommendationCard";
import DecisionCalculator from "../components/preserve/DecisionCalculator";
import InvestmentMatrix from "../components/preserve/InvestmentMatrix";
import PreservationROIChart from "../components/preserve/PreservationROIChart";

export default function Preserve() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('forecast');
  const [whyExpanded, setWhyExpanded] = useState(false);
  const queryClient = useQueryClient();

  // Fetch data
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list()
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: systems = [] } = useQuery({
    queryKey: ['systems', selectedProperty],
    queryFn: () => base44.entities.SystemBaseline.filter({ property_id: selectedProperty }),
    enabled: !!selectedProperty
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['preservation-recommendations', selectedProperty],
    queryFn: () => base44.entities.PreservationRecommendation.filter({ property_id: selectedProperty }),
    enabled: !!selectedProperty
  });

  const { data: impacts = [] } = useQuery({
    queryKey: ['preservation-impacts', selectedProperty],
    queryFn: () => base44.entities.PreservationImpact.filter({ property_id: selectedProperty }),
    enabled: !!selectedProperty
  });

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

  // Calculate systems needing attention
  const systemsNeedingAttention = systems.filter(s => {
    if (!s.installation_year || !s.estimated_lifespan_years) return false;
    const currentYear = new Date().getFullYear();
    const age = currentYear - s.installation_year;
    const agePercentage = age / s.estimated_lifespan_years;
    return agePercentage >= 0.75 && s.condition !== 'Excellent';
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        
        {/* Step Navigation */}
        <div className="mb-4 md:mb-6">
          <StepNavigation currentStep={7} propertyId={selectedProperty !== 'all' ? selectedProperty : null} />
        </div>

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
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
            Preserve
          </h1>
          <p className="text-gray-600 text-lg">
            Strategic preservation intelligence to extend system life and protect your investment
          </p>
        </div>

        {/* Why This Step Matters */}
        <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <button
              onClick={() => setWhyExpanded(!whyExpanded)}
              className="w-full flex items-start gap-3 text-left hover:opacity-80 transition-opacity"
            >
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Why Preserve Matters</h3>
                <p className="text-sm text-blue-800">
                  Preserve analyzes your system data to identify opportunities for life extension, preventing costly emergency replacements and protecting your investment.
                </p>
              </div>
              {whyExpanded ? (
                <ChevronDown className="w-5 h-5 text-blue-600 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0" />
              )}
            </button>
          </CardHeader>
          {whyExpanded && (
            <CardContent className="pt-0">
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">🎯 In the 360° Method Framework:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Preserve is Step 7 in ADVANCE. It uses your baseline data from AWARE to forecast replacement timelines, identify life-extension opportunities, and calculate strategic intervention ROI.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">💡 Key Benefits:</h4>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4">
                    <li>• <strong>Avoid Emergency Replacements:</strong> Plan proactively instead of reacting to failures</li>
                    <li>• <strong>Extend System Life:</strong> Strategic interventions add 3-7 years on average</li>
                    <li>• <strong>ROI Focus:</strong> Typical preservation ROI is 3-5x the investment</li>
                    <li>• <strong>Budget Planning:</strong> Forecast expenses 2-15 years out</li>
                  </ul>
                </div>
                <div className="bg-blue-50 rounded p-3 border-l-4 border-blue-600">
                  <p className="text-xs text-blue-900">
                    <strong>Smart Strategy:</strong> Spending $2,000 today to extend a system 5 years beats a $10,000 emergency replacement tomorrow.
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

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

        {/* Quick Stats */}
        {selectedProperty && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <p className="text-xs text-gray-600">Systems at Risk</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{systemsNeedingAttention.length}</p>
                <p className="text-xs text-gray-500">Approaching end of life</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-gray-600">Opportunities</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{recommendations.filter(r => r.status === 'PENDING').length}</p>
                <p className="text-xs text-gray-500">Life-extension options</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-gray-600">Value Created</p>
                </div>
                <p className="text-2xl font-bold text-green-700">${totalValueCreated.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Lifetime savings</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <p className="text-xs text-gray-600">Overall ROI</p>
                </div>
                <p className="text-2xl font-bold text-purple-700">{overallROI}x</p>
                <p className="text-xs text-gray-500">Return on investment</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
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
                      onApprove={() => queryClient.invalidateQueries(['preservation-recommendations'])}
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
                      onApprove={() => queryClient.invalidateQueries(['preservation-recommendations'])}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Optional Section */}
            {optionalItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
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
                      onApprove={() => queryClient.invalidateQueries(['preservation-recommendations'])}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {recommendations.filter(r => r.status === 'PENDING').length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">All Systems Looking Good!</h3>
                  <p className="text-gray-600 mb-4">
                    No preservation recommendations at this time. Check back as systems age.
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

      </div>
    </div>
  );
}