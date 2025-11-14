import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Download, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export default function ReplacementForecastTimeline({ systems, property }) {
  const currentYear = new Date().getFullYear();

  // Calculate forecast for each system
  const forecasts = systems
    .filter(s => s.installation_year && s.estimated_lifespan_years)
    .map(system => {
      const age = currentYear - system.installation_year;
      const lifespan = system.estimated_lifespan_years + (system.lifespan_extension_total_years || 0);
      const yearsRemaining = lifespan - age;
      const replacementYear = currentYear + yearsRemaining;
      const agePercentage = age / lifespan;

      let urgency = 'good';
      if (yearsRemaining < 2) urgency = 'urgent';
      else if (yearsRemaining < 5) urgency = 'warning';

      return {
        system,
        age,
        yearsRemaining,
        replacementYear,
        agePercentage,
        urgency
      };
    })
    .sort((a, b) => a.replacementYear - b.replacementYear);

  // Group by year
  const forecastByYear = forecasts.reduce((acc, f) => {
    const year = f.replacementYear;
    if (!acc[year]) acc[year] = [];
    acc[year].push(f);
    return acc;
  }, {});

  // Calculate yearly totals
  const yearlyTotals = Object.entries(forecastByYear).map(([year, items]) => ({
    year: parseInt(year),
    count: items.length,
    totalCost: items.reduce((sum, i) => sum + (i.system.replacement_cost_estimate || 0), 0),
    items
  })).sort((a, b) => a.year - b.year);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 border-red-300 text-red-800';
      case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-green-100 border-green-300 text-green-800';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <Clock className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const totalForecasted = yearlyTotals.reduce((sum, y) => sum + y.totalCost, 0);

  return (
    <div className="space-y-6">
      
      {/* Summary Card */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Replacement Forecast Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Systems Tracked</p>
              <p className="text-2xl font-bold text-gray-900">{forecasts.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Forecasted Spend (15 years)</p>
              <p className="text-2xl font-bold text-blue-700">${totalForecasted.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Annual Budget</p>
              <p className="text-2xl font-bold text-gray-900">${Math.round(totalForecasted / 15).toLocaleString()}</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export to PDF
          </Button>
        </CardContent>
      </Card>

      {/* Timeline by Year */}
      <div className="space-y-4">
        {yearlyTotals.filter(y => y.year <= currentYear + 15).map(yearData => (
          <Card key={yearData.year} className={yearData.year <= currentYear + 2 ? 'border-2 border-red-300' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {yearData.year} {yearData.year === currentYear && '(This Year)'}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {yearData.count} system{yearData.count !== 1 ? 's' : ''} reaching end of life
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Estimated Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${yearData.totalCost.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {yearData.items.map(forecast => (
                  <div
                    key={forecast.system.id}
                    className={`p-3 rounded-lg border-2 ${getUrgencyColor(forecast.urgency)}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1">
                        {getUrgencyIcon(forecast.urgency)}
                        <div>
                          <p className="font-semibold">
                            {forecast.system.system_type}
                            {forecast.system.nickname && ` - ${forecast.system.nickname}`}
                          </p>
                          <p className="text-sm mt-1">
                            Age: {forecast.age} years | Remaining: {forecast.yearsRemaining} years | 
                            Condition: {forecast.system.condition}
                          </p>
                          {forecast.system.lifespan_extension_total_years > 0 && (
                            <Badge className="mt-2 bg-green-600 text-white">
                              +{forecast.system.lifespan_extension_total_years} years extended
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Est. Cost</p>
                        <p className="font-bold">
                          ${(forecast.system.replacement_cost_estimate || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {forecasts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No System Data Available</h3>
            <p className="text-gray-600 mb-4">
              Complete your system baseline in the AWARE phase to see replacement forecasts.
            </p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}