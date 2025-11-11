import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, AlertTriangle, Calendar, DollarSign, TrendingUp, Lightbulb, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import SystemLifecycleCard from "../components/preserve/SystemLifecycleCard";
import ExpenseForecast from "../components/preserve/ExpenseForecast";
import { generatePreservationRecommendations, generateAIPreservationPlan } from "../components/shared/PreservationAnalyzer";
import ServiceRequestDialog from "../components/services/ServiceRequestDialog";

export default function Preserve() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdFromUrl = urlParams.get('property');
  
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || '');
  const [preservationData, setPreservationData] = React.useState(null);
  const [loadingPreservation, setLoadingPreservation] = React.useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = React.useState(null);
  const [aiPlan, setAiPlan] = React.useState(null);
  const [loadingAiPlan, setLoadingAiPlan] = React.useState(false);
  const [showServiceDialog, setShowServiceDialog] = React.useState(false);
  const [serviceRequestData, setServiceRequestData] = React.useState(null);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const { data: systems = [] } = useQuery({
    queryKey: ['systemBaselines', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.SystemBaseline.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['maintenanceTasks', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.MaintenanceTask.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  // Generate preservation recommendations when systems change
  React.useEffect(() => {
    const generatePreservation = async () => {
      if (systems.length === 0) {
        setPreservationData(null);
        return;
      }
      
      setLoadingPreservation(true);
      try {
        const data = await generatePreservationRecommendations(systems);
        setPreservationData(data);
      } catch (error) {
        console.error('Failed to generate preservation data:', error);
      } finally {
        setLoadingPreservation(false);
      }
    };

    generatePreservation();
  }, [systems]);

  const currentProperty = properties.find(p => p.id === selectedProperty);

  // Calculate existing metrics
  const systemsNeedingAttention = systems.filter(system => {
    if (!system.installation_year || !system.estimated_lifespan_years) return false;
    const age = new Date().getFullYear() - system.installation_year;
    return age >= system.estimated_lifespan_years * 0.8;
  });

  const systemsAtRisk = systems.filter(system => {
    if (!system.installation_year || !system.estimated_lifespan_years) return false;
    const age = new Date().getFullYear() - system.installation_year;
    return age >= system.estimated_lifespan_years;
  });

  const next12MonthsCost = systemsNeedingAttention
    .filter(s => {
      const age = new Date().getFullYear() - s.installation_year;
      return age >= s.estimated_lifespan_years * 0.9;
    })
    .reduce((sum, s) => sum + (s.replacement_cost_estimate || 0), 0);

  const next24MonthsCost = systemsNeedingAttention
    .reduce((sum, s) => sum + (s.replacement_cost_estimate || 0), 0);

  const totalSpent = currentProperty?.total_maintenance_spent || 0;
  const totalPrevented = currentProperty?.estimated_disasters_prevented || 0;
  const roi = totalSpent > 0 ? ((totalPrevented - totalSpent) / totalSpent * 100).toFixed(0) : 0;

  // Calculate preservation score
  const preservationScore = preservationData ? Math.min(10, 10 - (preservationData.opportunities.length * 1.5)).toFixed(1) : 0;

  const handleViewDetails = async (opportunity) => {
    setSelectedOpportunity(opportunity);
    setLoadingAiPlan(true);
    
    try {
      const plan = await generateAIPreservationPlan(opportunity.system, opportunity);
      setAiPlan(plan);
    } catch (error) {
      console.error('Failed to load AI plan:', error);
    } finally {
      setLoadingAiPlan(false);
    }
  };

  const handleRequestService = (opportunity) => {
    const strategiesText = opportunity.strategies.map(s => `- ${s.name} ($${s.cost})`).join('\n');
    
    setServiceRequestData({
      property_id: selectedProperty,
      service_type: `Preservation Service - ${opportunity.system.system_type}`,
      description: `I would like to preserve my ${opportunity.system.nickname || opportunity.system.system_type} (${opportunity.age} years old).

Recommended preservation strategies:
${strategiesText}

Total Investment: $${opportunity.investment}
Expected Extension: ${opportunity.extensionYears} years

Please provide a quote for these preservation services.`
    });
    setShowServiceDialog(true);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ADVANCE → Preserve</h1>
            <p className="text-gray-600 mt-1">AI-Powered Lifespan Extension & Preservation</p>
          </div>
        </div>

        {properties.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Select Property</label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-full md:w-96">
                      <SelectValue />
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

        {/* Preservation Score Banner */}
        {preservationData && (
          <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{preservationScore}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">YOUR PRESERVATION SCORE</h2>
                    <p className="text-gray-700">
                      {preservationScore >= 8 ? "Excellent! You're maximizing system lifespans." :
                       preservationScore >= 6 ? "Good! A few systems need attention." :
                       preservationScore >= 4 ? "Attention needed! Multiple preservation opportunities." :
                       "Critical! Act now to avoid expensive replacements."}
                    </p>
                  </div>
                </div>
                <Shield className="w-16 h-16 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ROI Summary */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Prevented</p>
                  <p className="text-2xl font-bold text-gray-900">${totalPrevented.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">ROI</p>
                  <p className="text-2xl font-bold text-gray-900">{roi}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">At Risk</p>
                  <p className="text-2xl font-bold text-gray-900">{systemsAtRisk.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preservation Opportunities */}
        {loadingPreservation ? (
          <Card className="border-2 border-purple-300 bg-purple-50">
            <CardContent className="p-12 text-center">
              <div className="animate-spin text-4xl mb-4">⚙️</div>
              <p className="text-lg font-medium text-purple-900">AI analyzing your systems for preservation opportunities...</p>
            </CardContent>
          </Card>
        ) : preservationData && preservationData.opportunities.length > 0 ? (
          <Card className="border-2 border-green-300 shadow-lg">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-700" />
                  <span>🛡️ SYSTEMS READY FOR PRESERVATION</span>
                </div>
                <Badge className="bg-green-600 text-white">
                  {preservationData.opportunities.length} Opportunities
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-700 mt-2">
                Extend system lifespans and avoid ${preservationData.totalSavings.toLocaleString()} in replacements
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {preservationData.opportunities.map((opp, idx) => (
                <Card key={idx} className={`border-2 ${
                  opp.priority === 'HIGH' ? 'border-red-300 bg-red-50' :
                  opp.priority === 'MEDIUM' ? 'border-orange-300 bg-orange-50' :
                  'border-blue-300 bg-blue-50'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            🛡️ {opp.system.nickname || opp.system.system_type}
                          </h3>
                          <Badge className={
                            opp.priority === 'HIGH' ? 'bg-red-600' :
                            opp.priority === 'MEDIUM' ? 'bg-orange-600' :
                            'bg-blue-600'
                          }>
                            {opp.priority} PRIORITY
                          </Badge>
                        </div>
                        <p className="text-gray-700">
                          Age: {opp.age} years ({opp.percentLifespan}% of {opp.lifespan}-year lifespan)
                        </p>
                        <p className="text-gray-700">
                          Condition: {opp.system.condition || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Next Failure Risk: <span className="font-bold text-red-700">{opp.failureRisk}%</span> in next 2 years
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold mb-3 text-gray-900">Preservation Plan:</h4>
                      <div className="space-y-2">
                        {opp.strategies.map((strategy, sidx) => (
                          <div key={sidx} className="flex items-start gap-2 bg-white p-3 rounded border">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{strategy.name} - ${strategy.cost}</p>
                              <p className="text-sm text-gray-600">{strategy.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-600">Total Investment</p>
                        <p className="text-xl font-bold text-green-700">${opp.investment}</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-600">Extends Life</p>
                        <p className="text-xl font-bold text-green-700">{opp.extensionYears} years</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-600">Replacement Avoided</p>
                        <p className="text-xl font-bold text-green-700">${opp.replacementCost.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-600">Annual Savings</p>
                        <p className="text-xl font-bold text-green-700">${Math.round(opp.annualSavings).toLocaleString()}/yr</p>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-300 rounded mb-4">
                      <p className="text-sm font-bold text-blue-900 mb-1">
                        💰 Your ROI: {opp.roi.toFixed(1)}:1
                      </p>
                      <p className="text-xs text-gray-700">
                        Invest ${opp.investment} now to avoid ${opp.replacementCost.toLocaleString()} replacement for {opp.extensionYears} more years
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleRequestService(opp)}
                        className="flex-1"
                        style={{ backgroundColor: '#28A745' }}
                      >
                        Request Service
                      </Button>
                      <Button
                        onClick={() => handleViewDetails(opp)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Total Summary */}
              <Card className="border-2 border-purple-300 bg-purple-50">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-center text-purple-900 flex items-center justify-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    TOTAL PRESERVATION OPPORTUNITY
                  </h3>
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-gray-700 mb-2">Invest This Year</p>
                      <p className="text-3xl font-bold text-purple-900">${preservationData.totalInvestment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 mb-2">Avoid Replacements</p>
                      <p className="text-3xl font-bold text-purple-900">${preservationData.totalSavings.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 mb-2">Your ROI</p>
                      <p className="text-3xl font-bold text-purple-900">{preservationData.totalROI.toFixed(1)}:1</p>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-700 mt-4">
                    Preserve all systems now and save ${(preservationData.totalSavings - preservationData.totalInvestment).toLocaleString()} over the next 2-4 years
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-green-300 bg-green-50">
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-2xl font-bold mb-2 text-green-900">
                🎉 No Preservation Needed Right Now!
              </h3>
              <p className="text-gray-700">
                Your systems are either too new or already well-maintained. 
                Check back when systems reach 50-90% of their expected lifespan.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Expense Forecast */}
        <ExpenseForecast
          next12Months={next12MonthsCost}
          next24Months={next24MonthsCost}
          next36Months={next24MonthsCost * 1.5}
        />

        {/* System Lifecycle Tracking */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              All Systems Lifecycle Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {systems.length > 0 ? (
              <div className="space-y-4">
                {systems
                  .sort((a, b) => {
                    const ageA = a.installation_year ? new Date().getFullYear() - a.installation_year : 0;
                    const ageB = b.installation_year ? new Date().getFullYear() - b.installation_year : 0;
                    const lifespanA = a.estimated_lifespan_years || 999;
                    const lifespanB = b.estimated_lifespan_years || 999;
                    return (ageB / lifespanB) - (ageA / lifespanA);
                  })
                  .map(system => (
                    <SystemLifecycleCard key={system.id} system={system} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No Systems Documented</h3>
                <p>Complete your baseline to start tracking system lifecycles and preservation opportunities</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Request Dialog */}
        <ServiceRequestDialog
          open={showServiceDialog}
          onClose={() => {
            setShowServiceDialog(false);
            setServiceRequestData(null);
          }}
          prefilledData={serviceRequestData}
        />

        {/* AI Plan Detail Dialog */}
        {selectedOpportunity && (
          <Dialog open={!!selectedOpportunity} onOpenChange={() => {
            setSelectedOpportunity(null);
            setAiPlan(null);
          }}>
            <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-blue-600" />
                  Preservation Plan Details
                </DialogTitle>
              </DialogHeader>
              
              {loadingAiPlan ? (
                <div className="p-12 text-center">
                  <div className="animate-spin text-4xl mb-4">⚙️</div>
                  <p className="text-gray-700">AI generating detailed plan...</p>
                </div>
              ) : aiPlan && (
                <div className="space-y-4 py-4">
                  <Card className="border-2 border-blue-300 bg-blue-50">
                    <CardContent className="p-4">
                      <h3 className="font-bold mb-2 text-blue-900">Why Preserve Now:</h3>
                      <p className="text-gray-800">{aiPlan.why_now}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-red-300 bg-red-50">
                    <CardContent className="p-4">
                      <h3 className="font-bold mb-2 text-red-900 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Consequences of Skipping:
                      </h3>
                      <p className="text-gray-800">{aiPlan.consequences_of_skipping}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-300 bg-green-50">
                    <CardContent className="p-4">
                      <h3 className="font-bold mb-2 text-green-900">Best Timing:</h3>
                      <p className="text-gray-800">{aiPlan.best_timing}</p>
                    </CardContent>
                  </Card>

                  {aiPlan.preventive_tips?.length > 0 && (
                    <Card className="border-2 border-purple-300 bg-purple-50">
                      <CardContent className="p-4">
                        <h3 className="font-bold mb-3 text-purple-900">Preventive Tips to Maximize Lifespan:</h3>
                        <ul className="space-y-2">
                          {aiPlan.preventive_tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-purple-700 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-800">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    onClick={() => {
                      setSelectedOpportunity(null);
                      setAiPlan(null);
                      handleRequestService(selectedOpportunity);
                    }}
                    className="w-full"
                    style={{ backgroundColor: '#28A745' }}
                  >
                    Request This Service
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}