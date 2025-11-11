import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Plus, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PropertyWizard from "../components/properties/PropertyWizard";

export default function Properties() {
  const [showWizard, setShowWizard] = React.useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const handleWizardComplete = () => {
    setShowWizard(false);
  };

  if (showWizard) {
    return (
      <div className="min-h-screen bg-white p-4">
        <PropertyWizard
          onComplete={handleWizardComplete}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-6xl md:mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px', lineHeight: '1.2' }}>
            MY PROPERTIES
          </h1>
          <p className="text-gray-600" style={{ fontSize: '16px' }}>
            Manage and track all your properties
          </p>
        </div>

        {/* Add Property Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowWizard(true)}
            className="w-full md:w-auto font-bold"
            style={{ backgroundColor: '#FF6B35', minHeight: '56px' }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Property
          </Button>
        </div>

        {properties.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-12 text-center">
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No Properties Yet</h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first property to begin protecting your investment
              </p>
              <Button
                onClick={() => setShowWizard(true)}
                style={{ backgroundColor: '#FF6B35', minHeight: '56px' }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Property
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => {
              const setupProgress = property.baseline_completion || 0;
              const isSetupComplete = setupProgress >= 66; // 4 of 6 required systems
              const needsAttention = setupProgress < 66;

              return (
                <Card
                  key={property.id}
                  className={`border-2 mobile-card hover:shadow-lg transition-shadow ${
                    needsAttention ? 'border-orange-300' : 'border-gray-200'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                          {property.address}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {property.property_type || "Property"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {property.door_count || 1} door{property.door_count > 1 ? 's' : ''}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {property.climate_zone || "Climate"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Setup Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">Setup Progress:</span>
                        <span className="text-sm font-bold" style={{ color: needsAttention ? '#FF6B35' : '#28A745' }}>
                          {setupProgress}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all"
                          style={{
                            width: `${setupProgress}%`,
                            backgroundColor: needsAttention ? '#FF6B35' : '#28A745'
                          }}
                        />
                      </div>
                      {needsAttention && (
                        <div className="flex items-center gap-2 mt-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-orange-700">
                            Baseline not started - unlock full features
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Property Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Health Score</p>
                        <p className="font-bold" style={{ color: '#1B365D' }}>
                          {isSetupComplete ? `${property.health_score || 0}/100` : '--'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Year Built</p>
                        <p className="font-bold" style={{ color: '#1B365D' }}>
                          {property.year_built || '--'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Square Footage</p>
                        <p className="font-bold" style={{ color: '#1B365D' }}>
                          {property.square_footage ? `${property.square_footage.toLocaleString()} sq ft` : '--'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Maintenance Spent</p>
                        <p className="font-bold text-green-700">
                          ${(property.total_maintenance_spent || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row gap-3">
                      {needsAttention ? (
                        <Button
                          asChild
                          className="flex-1"
                          style={{ backgroundColor: '#FF6B35', minHeight: '48px' }}
                        >
                          <Link to={createPageUrl("Baseline") + `?property=${property.id}`}>
                            Continue Setup →
                          </Link>
                        </Button>
                      ) : (
                        <>
                          <Button
                            asChild
                            className="flex-1"
                            style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                          >
                            <Link to={createPageUrl("Inspect") + `?property=${property.id}`}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Start Inspection
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            className="flex-1"
                            style={{ minHeight: '48px' }}
                          >
                            <Link to={createPageUrl("Dashboard")}>
                              View Details
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Portfolio Summary (for multi-property users) */}
        {properties.length > 1 && (
          <Card className="border-2 border-blue-200 mt-6">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
                📊 PORTFOLIO SUMMARY
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                    {properties.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Doors</p>
                  <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                    {properties.reduce((sum, p) => sum + (p.door_count || 1), 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-green-700">
                    ${properties.reduce((sum, p) => sum + (p.total_maintenance_spent || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Health Score</p>
                  <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                    {Math.round(properties.reduce((sum, p) => sum + (p.health_score || 0), 0) / properties.length)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}