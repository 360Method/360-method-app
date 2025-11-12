import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, MapPin, Loader2 } from "lucide-react";
import OperatorAvailabilityCheck from "../properties/OperatorAvailabilityCheck";

const Label = ({ children, className = "", ...props }) => (
  <label className={`text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
);

export default function OnboardingPropertySetup({ onNext, onBack, data }) {
  const [address, setAddress] = React.useState("");
  const [verifiedAddress, setVerifiedAddress] = React.useState(null);
  const [operatorData, setOperatorData] = React.useState(null);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const queryClient = useQueryClient();

  const createPropertyMutation = useMutation({
    mutationFn: (propertyData) => base44.entities.Property.create(propertyData),
    onSuccess: (newProperty) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      onNext({
        property: newProperty
      });
    },
  });

  const handleVerifyAddress = async () => {
    if (!address.trim()) return;

    setIsVerifying(true);
    
    try {
      // Use LLM to parse and verify address
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Parse and verify this address: "${address}". Return structured data with street_address, city, state, zip_code, county. If the address seems valid, mark it as verified. Use your knowledge to fill in missing information like county based on city/state.`,
        response_json_schema: {
          type: "object",
          properties: {
            street_address: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            zip_code: { type: "string" },
            county: { type: "string" },
            formatted_address: { type: "string" },
            is_valid: { type: "boolean" }
          }
        }
      });

      if (result.is_valid) {
        setVerifiedAddress({
          ...result,
          address: result.formatted_address || address,
          address_verified: true,
          verification_source: "manual_entry"
        });
      }
    } catch (error) {
      console.error("Address verification failed:", error);
      // Still allow user to continue with unverified address
      setVerifiedAddress({
        address: address,
        street_address: address,
        address_verified: false,
        verification_source: "manual_entry"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOperatorFound = (operator) => {
    setOperatorData({
      operator_id: operator?.id || null,
      operator_available: !!operator,
      operator_checked_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleContinue = async () => {
    if (!verifiedAddress) return;

    const propertyData = {
      ...verifiedAddress,
      ...operatorData,
      property_type: "Single-Family Home",
      door_count: 1,
      setup_completed: false,
      baseline_completion: 0
    };

    createPropertyMutation.mutate(propertyData);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl text-center" style={{ color: '#1B365D' }}>
            🏠 Add Your First Property
          </CardTitle>
          <p className="text-center text-gray-600 text-lg mt-2">
            Let's start with your property's address
          </p>
        </CardHeader>
      </Card>

      {/* Address Input */}
      {!verifiedAddress && (
        <Card className="border-2 border-green-300">
          <CardContent className="p-6 md:p-8">
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Property Address</Label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main St, Portland, OR 97201"
                      className="text-lg"
                      style={{ minHeight: '56px' }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleVerifyAddress();
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleVerifyAddress}
                    disabled={!address.trim() || isVerifying}
                    className="gap-2"
                    style={{ 
                      backgroundColor: '#28A745', 
                      minHeight: '56px',
                      minWidth: '120px'
                    }}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-5 h-5" />
                        Verify
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  💡 Include full address with city, state, and ZIP code for best results
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verified Address Display */}
      {verifiedAddress && !operatorData && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-green-900 mb-1">Address Verified</p>
                <p className="text-gray-900">{verifiedAddress.formatted_address || verifiedAddress.address}</p>
                {verifiedAddress.city && verifiedAddress.state && verifiedAddress.zip_code && (
                  <p className="text-sm text-gray-600 mt-1">
                    {verifiedAddress.city}, {verifiedAddress.state} {verifiedAddress.zip_code}
                  </p>
                )}
                <Button
                  onClick={() => {
                    setVerifiedAddress(null);
                    setOperatorData(null);
                  }}
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-green-700 hover:text-green-900"
                >
                  Change Address
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operator Availability Check */}
      {verifiedAddress && verifiedAddress.zip_code && (
        <OperatorAvailabilityCheck
          zipCode={verifiedAddress.zip_code}
          onOperatorFound={handleOperatorFound}
        />
      )}

      {/* Why This Matters */}
      {!verifiedAddress && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <h3 className="font-bold text-purple-900 mb-3 text-lg">
              🎯 Why Your Address Matters
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Your address unlocks:</strong>
              </p>
              <ul className="ml-6 space-y-1 list-disc">
                <li><strong>Local Climate Intelligence:</strong> Region-specific maintenance schedules and system recommendations</li>
                <li><strong>Operator Matching:</strong> We'll check if 360° Method certified operators serve your area</li>
                <li><strong>Accurate Cost Estimates:</strong> AI pricing based on your local market rates</li>
                <li><strong>Property Value Context:</strong> Market data for upgrade ROI calculations</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

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
          disabled={!verifiedAddress || !operatorData || createPropertyMutation.isPending}
          className="gap-2"
          style={{ 
            backgroundColor: (verifiedAddress && operatorData && !createPropertyMutation.isPending) ? '#28A745' : '#CCCCCC', 
            minHeight: '48px'
          }}
        >
          {createPropertyMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}