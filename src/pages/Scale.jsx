
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  Home,
  TrendingDown, // Kept from original
  TrendingUp,
  DollarSign,
  AlertTriangle, // Kept from original
  Users,
  Briefcase,
  Award,
  Plus,
  Lightbulb, // Added
  ChevronRight, // Added
  ChevronDown // Added
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import HealthScoreGauge from "../components/dashboard/HealthScoreGauge";
import StepNavigation from "../components/navigation/StepNavigation";

export default function Scale() {
  const [whyExpanded, setWhyExpanded] = React.useState(false);
  const [selectedProperty, setSelectedProperty] = React.useState('all'); // Added for StepNavigation prop

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['maintenanceTasks'],
    queryFn: () => base44.entities.MaintenanceTask.list('-created_date'),
  });

  // Portfolio metrics
  const totalSpent = properties.reduce((sum, p) => sum + (p.total_maintenance_spent || 0), 0);
  const totalPrevented = properties.reduce((sum, p) => sum + (p.estimated_disasters_prevented || 0), 0);
  const avgHealthScore = properties.length > 0
    ? Math.round(properties.reduce((sum, p) => sum + (p.health_score || 0), 0) / properties.length)
    : 0;

  // Calculate cost per sq ft
  const propertiesWithSqft = properties.map(p => ({
    ...p,
    costPerSqFt: p.square_footage > 0 ? (p.total_maintenance_spent || 0) / p.square_footage : 0
  }));

  const avgCostPerSqFt = propertiesWithSqft.length > 0
    ? propertiesWithSqft.reduce((sum, p) => sum + p.costPerSqFt, 0) / propertiesWithSqft.length
    : 0;

  // Find best and worst performers
  const sortedByHealth = [...properties].sort((a, b) => (b.health_score || 0) - (a.health_score || 0));
  const bestProperty = sortedByHealth[0];
  const worstProperty = sortedByHealth[sortedByHealth.length - 1];

  // Properties needing attention
  const propertiesNeedingAttention = properties.filter(p => (p.health_score || 0) < 70);

  // Preventive vs emergency ratio
  const preventiveTasks = allTasks.filter(t => t.priority === 'Routine' || t.priority === 'Low').length;
  const emergencyTasks = allTasks.filter(t => t.priority === 'High').length;
  const preventiveRatio = preventiveTasks + emergencyTasks > 0
    ? Math.round((preventiveTasks / (preventiveTasks + emergencyTasks)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pb-20">
      <div className="mobile-container md:max-w-7xl md:mx-auto">
        {/* Step Navigation */}
        <div className="mb-6">
          <StepNavigation currentStep={9} propertyId={selectedProperty !== 'all' ? selectedProperty : null} />
        </div>

        {/* Phase & Step Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className="bg-green-600 text-white text-sm px-3 py-1">
              Phase III - ADVANCE
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Step 9 of 9
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
            Scale
          </h1>
          <p className="text-gray-600 text-lg">
            Manage multiple properties with confidence and efficiency
          </p>
        </div>

        {/* Why This Step Matters - Educational Card */}
        <Card className="mb-6 border-2 border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <button
              onClick={() => setWhyExpanded(!whyExpanded)}
              className="w-full flex items-start gap-3 text-left hover:opacity-80 transition-opacity"
            >
              <Lightbulb className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">Why Scale Matters</h3>
                <p className="text-sm text-green-800">
                  Scale completes the 360° Method by enabling portfolio growth. Once you've mastered one property, this framework lets you confidently manage 2, 5, 10+ properties with the same rigor.
                </p>
              </div>
              {whyExpanded ? (
                <ChevronDown className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-green-600 flex-shrink-0" />
              )}
            </button>
          </CardHeader>
          {whyExpanded && (
            <CardContent className="pt-0">
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">🎯 In the 360° Method Framework:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Scale is Step 9 and the culmination of ADVANCE. It applies everything you've learned (AWARE → ACT → ADVANCE) across multiple properties. The 360° Method becomes your competitive advantage - enabling professional-grade property management at investor-friendly costs.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">💡 Portfolio Management Superpowers:</h4>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4">
                    <li>• <strong>Unified dashboard:</strong> See all properties, tasks, and costs in one place</li>
                    <li>• <strong>Comparative analytics:</strong> Which properties are most profitable? Most maintenance-intensive?</li>
                    <li>• <strong>Bulk operations:</strong> Schedule seasonal inspections across entire portfolio</li>
                    <li>• <strong>Proven playbooks:</strong> Replicate successful strategies property-to-property</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded p-3 border-l-4 border-green-600">
                  <p className="text-xs text-green-900">
                    <strong>Scaling Success:</strong> Investors using the 360° Method across 5+ properties report 60% lower maintenance costs per door and 85% fewer emergency repairs than industry averages.
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Portfolio Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Cost/Sq Ft</p>
                  <p className="text-2xl font-bold text-gray-900">${avgCostPerSqFt.toFixed(2)}</p>
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
                  <p className="text-sm text-gray-600">Need Attention</p>
                  <p className="text-2xl font-bold text-gray-900">{propertiesNeedingAttention.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Health */}
        <Card className="border-none shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 mb-6">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Health Score</h2>
                <p className="text-gray-600">Average across all properties</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Preventive Maintenance</p>
                    <p className="text-2xl font-bold text-green-600">{preventiveRatio}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Disasters Prevented</p>
                    <p className="text-2xl font-bold text-green-600">${totalPrevented.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <HealthScoreGauge score={avgHealthScore} size="large" />
            </div>
          </CardContent>
        </Card>

        {/* Best & Worst Performers */}
        {properties.length > 1 && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {bestProperty && (
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <TrendingUp className="w-5 h-5" />
                    Top Performer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{bestProperty.address}</h3>
                  <div className="flex items-center gap-4">
                    <HealthScoreGauge score={bestProperty.health_score || 0} size="small" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Health Score: {bestProperty.health_score || 0}</p>
                      <p className="text-sm text-gray-600">Baseline: {bestProperty.baseline_completion || 0}% complete</p>
                      <p className="text-sm text-green-700 font-medium mt-2">
                        This property is well-maintained and preventing future issues
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {worstProperty && worstProperty.health_score < 70 && (
              <Card className="border-2 border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-900">
                    <TrendingDown className="w-5 h-5" />
                    Needs Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{worstProperty.address}</h3>
                  <div className="flex items-center gap-4">
                    <HealthScoreGauge score={worstProperty.health_score || 0} size="small" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Health Score: {worstProperty.health_score || 0}</p>
                      <p className="text-sm text-gray-600">Baseline: {worstProperty.baseline_completion || 0}% complete</p>
                      <p className="text-sm text-orange-700 font-medium mt-2">
                        Focus maintenance efforts here to prevent costly repairs
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Property Comparison */}
        <Card className="border-none shadow-lg mb-6">
          <CardHeader>
            <CardTitle>Property Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {properties.map(property => (
                <Link
                  key={property.id}
                  to={createPageUrl("Baseline") + `?property=${property.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{property.address}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>{property.property_type}</span>
                        <span>{property.square_footage?.toLocaleString()} sq ft</span>
                        <span className="text-blue-600">${(property.total_maintenance_spent || 0).toLocaleString()} spent</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Cost/Sq Ft</p>
                        <p className="font-semibold text-gray-900">
                          ${((property.total_maintenance_spent || 0) / (property.square_footage || 1)).toFixed(2)}
                        </p>
                      </div>
                      <HealthScoreGauge score={property.health_score || 0} size="small" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
