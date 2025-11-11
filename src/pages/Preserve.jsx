import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Calendar, DollarSign, TrendingUp } from "lucide-react";
import SystemLifecycleCard from "../components/preserve/SystemLifecycleCard";
import ExpenseForecast from "../components/preserve/ExpenseForecast";

export default function Preserve() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdFromUrl = urlParams.get('property');
  
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || '');

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

  const currentProperty = properties.find(p => p.id === selectedProperty);

  // Analyze system lifecycles
  const systemsNeedingAttention = systems.filter(system => {
    if (!system.installation_year || !system.estimated_lifespan_years) return false;
    const age = new Date().getFullYear() - system.installation_year;
    return age >= system.estimated_lifespan_years * 0.8; // 80% of lifespan
  });

  const systemsAtRisk = systems.filter(system => {
    if (!system.installation_year || !system.estimated_lifespan_years) return false;
    const age = new Date().getFullYear() - system.installation_year;
    return age >= system.estimated_lifespan_years;
  });

  // Calculate forecast
  const next12MonthsCost = systemsNeedingAttention
    .filter(s => {
      const age = new Date().getFullYear() - s.installation_year;
      return age >= s.estimated_lifespan_years * 0.9;
    })
    .reduce((sum, s) => sum + (s.replacement_cost_estimate || 0), 0);

  const next24MonthsCost = systemsNeedingAttention
    .reduce((sum, s) => sum + (s.replacement_cost_estimate || 0), 0);

  // Calculate ROI
  const totalSpent = currentProperty?.total_maintenance_spent || 0;
  const totalPrevented = currentProperty?.estimated_disasters_prevented || 0;
  const roi = totalSpent > 0 ? ((totalPrevented - totalSpent) / totalSpent * 100).toFixed(0) : 0;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ADVANCE → Preserve</h1>
            <p className="text-gray-600 mt-1">Predictive maintenance and system lifecycle tracking</p>
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
              System Lifecycle Status
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
                <p>Complete your baseline to start tracking system lifecycles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}