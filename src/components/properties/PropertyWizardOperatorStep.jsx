import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import OperatorAvailabilityCheck from "./OperatorAvailabilityCheck";

export default function PropertyWizardOperatorStep({
  propertyData,
  onOperatorData,
  onNext,
  onBack
}) {
  const [operatorData, setOperatorData] = React.useState({
    operator_id: null,
    operator_available: false,
    operator_checked_date: new Date().toISOString().split('T')[0]
  });

  const handleOperatorFound = (operator) => {
    const newData = {
      operator_id: operator?.id || null,
      operator_available: !!operator,
      operator_checked_date: new Date().toISOString().split('T')[0]
    };
    
    setOperatorData(newData);
    onOperatorData?.(newData);
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="text-2xl" style={{ color: '#1B365D' }}>
            Checking Operator Availability
          </CardTitle>
          <p className="text-gray-600">
            Let's see if 360° Method Operator services are available in your property's area.
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <div className="text-2xl">📍</div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  Property Location:
                </p>
                <p className="text-sm text-gray-700">
                  {propertyData.address || propertyData.formatted_address}
                </p>
                {propertyData.zip_code && (
                  <p className="text-sm text-gray-600 mt-1">
                    ZIP: <strong>{propertyData.zip_code}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          {propertyData.zip_code && (
            <OperatorAvailabilityCheck
              zipCode={propertyData.zip_code}
              onOperatorFound={handleOperatorFound}
            />
          )}

          {!propertyData.zip_code && (
            <Card className="border-2 border-gray-300 bg-gray-50">
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">
                  ⚠️ Unable to check operator availability without a ZIP code.
                  <br />
                  Please go back and ensure your property address includes a valid ZIP code.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Educational Context */}
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardContent className="p-6">
          <h3 className="font-bold text-purple-900 mb-3 text-lg">
            💡 About 360° Method Operators
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>360° Method Operators</strong> are certified service providers who understand the full lifecycle approach to property maintenance. They're trained to work seamlessly with the app's insights and recommendations.
            </p>
            <p>
              <strong>Whether you have an operator or not,</strong> the 360° Method framework will help you:
            </p>
            <ul className="ml-6 space-y-1 list-disc">
              <li>Document every system in your property</li>
              <li>Catch issues before they become disasters</li>
              <li>Plan and budget 2-5 years ahead</li>
              <li>Track all maintenance and spending</li>
              <li>Maximize your property value</li>
            </ul>
            <p className="text-xs text-purple-700 italic mt-3">
              We're actively expanding our operator network. Your registration helps us identify where to expand next!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="gap-2"
          style={{ minHeight: '48px' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={handleContinue}
          className="gap-2"
          style={{ backgroundColor: '#28A745', minHeight: '48px' }}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}