import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign } from "lucide-react";

export default function PropertyWizardStep4({ data, onChange, onNext, onBack }) {
  const [formData, setFormData] = React.useState({
    property_use: data.property_use || "Primary Residence",
    purchase_date: data.purchase_date || "",
    purchase_price: data.purchase_price || "",
    current_value: data.current_value || "",
    monthly_rent: data.monthly_rent || "",
    property_manager: data.property_manager || "",
    property_manager_contact: data.property_manager_contact || "",
    insurance_provider: data.insurance_provider || "",
    insurance_policy: data.insurance_policy || ""
  });

  const updateField = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const recommendedBudget = formData.current_value
    ? {
        min: Math.round(formData.current_value * 0.01),
        max: Math.round(formData.current_value * 0.03)
      }
    : null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '24px' }}>
          Add New Property - Step 4 of 4
        </h2>
        <p className="text-gray-600 mb-4">
          Property: {data.street_address}, {data.city}, {data.state}
        </p>
        <div className="flex gap-2">
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
        </div>
      </div>

      <Card className="border-2 mobile-card mb-6" style={{ borderColor: '#28A745' }}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6" style={{ color: '#28A745' }} />
            <h3 className="font-bold" style={{ color: '#1B365D', fontSize: '20px' }}>
              OWNERSHIP & FINANCIAL INFO
            </h3>
          </div>

          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-sm text-gray-700">
                This section is <strong>optional</strong> but helps with:
              </p>
              <ul className="text-sm text-gray-700 mt-2 ml-4 space-y-1">
                <li>• Maintenance budget planning (% of property value)</li>
                <li>• ROI calculations for upgrades</li>
                <li>• Cost-per-door tracking for investors</li>
                <li>• Tax documentation</li>
              </ul>
              <p className="text-sm text-gray-700 mt-2">
                Skip this if you prefer - you can add it later in settings.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div>
              <Label className="font-semibold">Property Use</Label>
              <Select
                value={formData.property_use}
                onValueChange={(value) => updateField('property_use', value)}
              >
                <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Primary Residence">Primary Residence (I live here)</SelectItem>
                  <SelectItem value="Investment/Rental">Investment/Rental Property</SelectItem>
                  <SelectItem value="Mixed Use">Mixed Use (I live in part, rent other units)</SelectItem>
                  <SelectItem value="Vacation/Second Home">Vacation/Second Home</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">Purchase Date (optional)</Label>
                <Input
                  type="month"
                  value={formData.purchase_date}
                  onChange={(e) => updateField('purchase_date', e.target.value)}
                  className="mt-2"
                  style={{ minHeight: '48px' }}
                />
              </div>
              <div>
                <Label className="font-semibold">Purchase Price (optional)</Label>
                <Input
                  type="number"
                  value={formData.purchase_price}
                  onChange={(e) => updateField('purchase_price', e.target.value)}
                  placeholder="375000"
                  className="mt-2"
                  style={{ minHeight: '48px' }}
                />
              </div>
            </div>

            <div>
              <Label className="font-semibold">Current Estimated Value (optional)</Label>
              <Input
                type="number"
                value={formData.current_value}
                onChange={(e) => updateField('current_value', e.target.value)}
                placeholder="425000"
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
              {recommendedBudget && (
                <p className="text-sm text-gray-600 mt-2">
                  💡 Recommended maintenance budget: 1-3% of home value annually<br />
                  Your property: ${recommendedBudget.min.toLocaleString()}-${recommendedBudget.max.toLocaleString()}/year
                </p>
              )}
            </div>

            {(formData.property_use === "Investment/Rental" || formData.property_use === "Mixed Use") && (
              <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg space-y-4">
                <h4 className="font-bold" style={{ color: '#1B365D' }}>
                  FOR RENTAL PROPERTIES:
                </h4>

                <div>
                  <Label className="font-semibold">Monthly Rent (total all units)</Label>
                  <Input
                    type="number"
                    value={formData.monthly_rent}
                    onChange={(e) => updateField('monthly_rent', e.target.value)}
                    placeholder="2400"
                    className="mt-2"
                    style={{ minHeight: '48px' }}
                  />
                </div>

                <div>
                  <Label className="font-semibold">Property Manager (optional)</Label>
                  <Input
                    value={formData.property_manager}
                    onChange={(e) => updateField('property_manager', e.target.value)}
                    placeholder="Name or company"
                    className="mt-2"
                    style={{ minHeight: '48px' }}
                  />
                </div>

                <div>
                  <Label className="font-semibold">Property Manager Contact (optional)</Label>
                  <Input
                    value={formData.property_manager_contact}
                    onChange={(e) => updateField('property_manager_contact', e.target.value)}
                    placeholder="Email or phone"
                    className="mt-2"
                    style={{ minHeight: '48px' }}
                  />
                </div>
              </div>
            )}

            <div>
              <Label className="font-semibold">Insurance Provider (optional)</Label>
              <Input
                value={formData.insurance_provider}
                onChange={(e) => updateField('insurance_provider', e.target.value)}
                placeholder="Insurance company"
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
            </div>

            <div>
              <Label className="font-semibold">Insurance Policy # (optional)</Label>
              <Input
                value={formData.insurance_policy}
                onChange={(e) => updateField('insurance_policy', e.target.value)}
                placeholder="Policy number"
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1"
          style={{ minHeight: '56px' }}
        >
          ← Back
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 font-bold"
          style={{ backgroundColor: '#28A745', minHeight: '56px' }}
        >
          Save Property & Continue →
        </Button>
      </div>
    </div>
  );
}