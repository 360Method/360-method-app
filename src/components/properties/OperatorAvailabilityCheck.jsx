import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, MapPin, Building2 } from "lucide-react";

export default function OperatorAvailabilityCheck({ zipCode, onOperatorFound }) {
  const { data: operators = [], isLoading } = useQuery({
    queryKey: ['operators'],
    queryFn: () => base44.entities.Operator.list(),
    enabled: !!zipCode,
  });

  // Find operator that serves this zip code
  const matchedOperator = React.useMemo(() => {
    if (!zipCode || !operators.length) return null;
    
    return operators.find(operator => {
      if (!operator.service_areas || !operator.accepting_new_clients) return false;
      
      // Check if zip code is in operator's service areas
      return operator.service_areas.some(area => {
        // Area could be a zip code or city name
        const normalizedArea = area.trim().toLowerCase();
        const normalizedZip = zipCode.trim().toLowerCase();
        
        // Direct zip match
        if (normalizedArea === normalizedZip) return true;
        
        // Could also match by city if needed in the future
        return false;
      });
    });
  }, [zipCode, operators]);

  // Notify parent component when operator is found/not found
  React.useEffect(() => {
    if (!isLoading && zipCode) {
      onOperatorFound?.(matchedOperator);
    }
  }, [matchedOperator, isLoading, zipCode, onOperatorFound]);

  if (isLoading || !zipCode) {
    return null;
  }

  if (matchedOperator) {
    return (
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-blue-50 shadow-lg animate-in fade-in-50 duration-500">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0 shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-green-900">
                  🎉 Great News!
                </h3>
                <Badge className="bg-green-600 text-white">
                  Operator Available
                </Badge>
              </div>
              <p className="text-gray-700 mb-3 leading-relaxed">
                <strong>360° Method Operator services are available in your area!</strong> You'll be able to submit service requests directly through the app.
              </p>
              
              {/* Operator Info */}
              <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                <div className="flex items-start gap-3">
                  {matchedOperator.logo_url ? (
                    <img 
                      src={matchedOperator.logo_url} 
                      alt={matchedOperator.company_name}
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1">
                      {matchedOperator.company_name}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span>Serving your area</span>
                    </div>
                    {matchedOperator.rating > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-yellow-600 font-semibold">★ {matchedOperator.rating.toFixed(1)}</span>
                        {matchedOperator.review_count > 0 && (
                          <span className="text-gray-500">({matchedOperator.review_count} reviews)</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* What This Means */}
              <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-300">
                <p className="text-sm font-semibold text-green-900 mb-2">
                  ✓ What This Means For You:
                </p>
                <ul className="text-sm text-green-800 space-y-1 ml-4">
                  <li>• Direct service request submission through the app</li>
                  <li>• Professional quotes from a certified 360° Operator</li>
                  <li>• Seamless coordination for maintenance and repairs</li>
                  <li>• Priority scheduling based on your membership tier</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No operator available
  return (
    <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg animate-in fade-in-50 duration-500">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center flex-shrink-0 shadow-lg">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-orange-900">
                Operator Services Coming Soon
              </h3>
              <Badge className="bg-orange-600 text-white">
                Not Yet Available
              </Badge>
            </div>
            <p className="text-gray-700 mb-3 leading-relaxed">
              <strong>Currently, 360° Method Operator services are not yet available in your area.</strong> However, you can still use the full power of the app!
            </p>

            {/* What You Can Still Do */}
            <div className="bg-white rounded-lg p-4 border-2 border-orange-200 mb-3">
              <p className="text-sm font-semibold text-orange-900 mb-2">
                ✓ You Can Still:
              </p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• Access the complete 360° Method framework (all 9 steps)</li>
                <li>• Get AI-powered cost estimates for any maintenance or repair</li>
                <li>• Generate professional PDFs to share with local contractors</li>
                <li>• Track all your maintenance, spending, and property health</li>
                <li>• Plan upgrades and forecast future expenses</li>
              </ul>
            </div>

            {/* Waitlist CTA */}
            <div className="p-3 bg-orange-100 rounded-lg border border-orange-300">
              <p className="text-sm text-orange-900">
                <strong>💡 Want operator services in your area?</strong> We're actively expanding! Your property registration helps us identify high-demand markets for future operator partnerships.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}