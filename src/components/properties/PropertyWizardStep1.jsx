import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Home } from "lucide-react";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const PROPERTY_TYPES = [
  {
    value: "Single-Family Home",
    label: "Single-Family Home",
    description: "1 independent house"
  },
  {
    value: "Duplex",
    label: "Duplex",
    description: "2 separate units in one building"
  },
  {
    value: "Triplex",
    label: "Triplex",
    description: "3 separate units in one building"
  },
  {
    value: "Fourplex",
    label: "Fourplex",
    description: "4 separate units in one building"
  },
  {
    value: "Small Multi-Family (5-12 units)",
    label: "Small Multi-Family",
    description: "5-12 units"
  },
  {
    value: "Apartment Building (13+ units)",
    label: "Apartment Building",
    description: "13+ units"
  },
  {
    value: "Condo/Townhouse",
    label: "Condo/Townhouse",
    description: "You own one unit in larger complex"
  },
  {
    value: "Mobile/Manufactured Home",
    label: "Mobile/Manufactured Home",
    description: "Manufactured housing"
  }
];

export default function PropertyWizardStep1({ data, onChange, onNext, onCancel }) {
  const [formData, setFormData] = React.useState({
    street_address: data.street_address || "",
    unit_number: data.unit_number || "",
    city: data.city || "",
    state: data.state || "WA",
    zip_code: data.zip_code || "",
    property_type: data.property_type || ""
  });

  const updateField = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const handleNext = () => {
    if (!formData.street_address || !formData.city || !formData.state || !formData.zip_code || !formData.property_type) {
      alert("Please fill in all required fields");
      return;
    }
    onNext();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '24px' }}>
          Add New Property - Step 1 of 4
        </h2>
        <div className="flex gap-2 mt-4">
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
        </div>
      </div>

      {/* Property Address */}
      <Card className="border-2 mobile-card mb-6" style={{ borderColor: '#1B365D' }}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-6 h-6" style={{ color: '#FF6B35' }} />
            <h3 className="font-bold" style={{ color: '#1B365D', fontSize: '20px' }}>
              PROPERTY ADDRESS
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="font-semibold">Street Address *</Label>
              <Input
                value={formData.street_address}
                onChange={(e) => updateField('street_address', e.target.value)}
                placeholder="123 Main Street"
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
            </div>

            <div>
              <Label className="font-semibold">Unit/Apt # (if applicable)</Label>
              <Input
                value={formData.unit_number}
                onChange={(e) => updateField('unit_number', e.target.value)}
                placeholder="Leave blank for single-family homes"
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">City *</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Vancouver"
                  className="mt-2"
                  style={{ minHeight: '48px' }}
                />
              </div>

              <div>
                <Label className="font-semibold">State *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => updateField('state', value)}
                >
                  <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-60">
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="md:w-1/2">
              <Label className="font-semibold">ZIP Code *</Label>
              <Input
                value={formData.zip_code}
                onChange={(e) => updateField('zip_code', e.target.value)}
                placeholder="98660"
                className="mt-2"
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Type */}
      <Card className="border-2 mobile-card mb-6" style={{ borderColor: '#28A745' }}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Home className="w-6 h-6" style={{ color: '#28A745' }} />
            <h3 className="font-bold" style={{ color: '#1B365D', fontSize: '20px' }}>
              PROPERTY TYPE
            </h3>
          </div>

          <p className="text-gray-700 mb-4" style={{ fontSize: '16px' }}>
            What type of property is this? *
          </p>

          <div className="space-y-3">
            {PROPERTY_TYPES.map((type) => (
              <label
                key={type.value}
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.property_type === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="property_type"
                  value={type.value}
                  checked={formData.property_type === type.value}
                  onChange={(e) => updateField('property_type', e.target.value)}
                  className="mt-1"
                  style={{ minWidth: '18px', minHeight: '18px' }}
                />
                <div>
                  <p className="font-semibold" style={{ color: '#1B365D' }}>
                    {type.label}
                  </p>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </label>
            ))}
          </div>

          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-sm" style={{ color: '#1B365D' }}>
                <strong>💡 Not sure?</strong> Choose based on:
              </p>
              <ul className="text-sm text-gray-700 mt-2 ml-4 space-y-1">
                <li>• How many separate living spaces with their own entrances?</li>
                <li>• Do you own the entire building or just one unit?</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 mb-8">
        <Button
          type="button"
          onClick={handleCancel}
          variant="outline"
          className="flex-1"
          style={{ minHeight: '56px' }}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="flex-1"
          style={{ backgroundColor: '#FF6B35', minHeight: '56px' }}
        >
          Next: Property Details →
        </Button>
      </div>
    </div>
  );
}