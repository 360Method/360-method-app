
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingDown, TrendingUp, DollarSign, AlertTriangle, BookOpen, Video, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import HealthScoreGauge from "../components/dashboard/HealthScoreGauge";

export default function Scale() {
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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ADVANCE → Scale</h1>
          <p className="text-gray-600 mt-1">Multi-property portfolio management for investors</p>
        </div>

        {/* Why Portfolio Management Matters - Educational Section */}
        {properties.length > 1 && (
          <Card className="border-2 border-purple-300 bg-purple-50">
            <CardContent className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                <Building2 className="w-6 h-6 text-purple-600" />
                Why Portfolio Management Matters
              </h3>
              <p className="text-gray-800 mb-4" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                One property = manageable. Multiple properties = chaos without systems. Track every asset, 
                benchmark performance, identify underperformers. Professional investors scale through data.
              </p>
              <div className="border-t border-purple-300 pt-4">
                <p className="font-semibold mb-3" style={{ color: '#1B365D' }}>
                  📚 Learn More:
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="justify-start"
                  >
                    <Link to={createPageUrl("ResourceGuides") + "?category=For Investors"}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Portfolio Management Guide
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="justify-start"
                  >
                    <Link to={createPageUrl("VideoTutorials") + "?category=For Investors"}>
                      <Video className="w-4 h-4 mr-2" />
                      Scaling Your Portfolio (22 min)
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="justify-start"
                  >
                    <Link to={createPageUrl("ROICalculators")}>
                      <Calculator className="w-4 h-4 mr-2" />
                      Portfolio Analyzer
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Overview */}
        <div className="grid md:grid-cols-4 gap-4">
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
        <Card className="border-none shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
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
          <div className="grid md:grid-cols-2 gap-6">
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
        <Card className="border-none shadow-lg">
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
