import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";

export default function PreservationROIChart({ impacts, totalInvested, totalValueCreated, overallROI, totalYearsExtended }) {
  
  const completedImpacts = impacts.filter(i => i.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      
      {/* ROI Summary Dashboard */}
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-green-600" />
            Preservation ROI Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Invested</p>
              <p className="text-2xl font-bold text-blue-700">
                ${totalInvested.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Preservation interventions</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Value Created</p>
              <p className="text-2xl font-bold text-green-700">
                ${totalValueCreated.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Replacement costs avoided</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Overall ROI</p>
              <p className="text-2xl font-bold text-purple-700">
                {overallROI}x
              </p>
              <p className="text-xs text-gray-500 mt-1">Return on investment</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Years Extended</p>
              <p className="text-2xl font-bold text-orange-700">
                {totalYearsExtended}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total lifespan added</p>
            </div>
          </div>

          {totalInvested > 0 && (
            <div className="mt-6 p-4 bg-white rounded-lg border-2 border-green-300">
              <p className="text-center text-lg font-semibold text-green-900">
                💰 This Is Why Your Membership Pays for Itself
              </p>
              <p className="text-center text-sm text-gray-700 mt-2">
                Strategic preservation has saved you <strong>${(totalValueCreated - totalInvested).toLocaleString()}</strong> in avoided replacement costs.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Impact Stories */}
      {completedImpacts.length > 0 && (
        <div>
          <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            Preservation Success Stories ({completedImpacts.length})
          </h2>
          
          <div className="space-y-4">
            {completedImpacts.map(impact => (
              <Card key={impact.id} className="border-2 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-green-600 text-white">
                          {impact.roi_multiple.toFixed(1)}x ROI
                        </Badge>
                        <Badge variant="outline">
                          +{impact.years_extended} years
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-1">
                        {impact.value_statement || 'System Life Extended'}
                      </h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                        <div>
                          <p className="text-gray-600">Date</p>
                          <p className="font-medium">
                            {new Date(impact.intervention_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Cost</p>
                          <p className="font-medium text-blue-700">
                            ${impact.intervention_cost.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Value Created</p>
                          <p className="font-medium text-green-700">
                            ${impact.replacement_cost_avoided.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Net Savings</p>
                          <p className="font-medium text-green-700">
                            ${(impact.replacement_cost_avoided - impact.intervention_cost).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {impact.monitoring_until && (
                        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-blue-800">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Monitoring until: {new Date(impact.monitoring_until).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {impacts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Preservation Wins Yet</h3>
            <p className="text-gray-600 mb-4">
              Start approving preservation recommendations to track your ROI and see the value you're creating.
            </p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}