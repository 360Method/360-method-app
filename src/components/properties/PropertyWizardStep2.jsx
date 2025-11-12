import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DoorOpen, Home, Plus, Trash2, Sparkles } from "lucide-react";

export default function PropertyWizardStep2({ data, onChange, onNext, onBack }) {
  const isMultiFamily = data.property_type && ![
    "Single-Family Home",
    "Condo/Townhouse",
    "Mobile/Manufactured Home"
  ].includes(data.property_type);

  const defaultDoorCount = () => {
    if (data.property_type === "Duplex") return 2;
    if (data.property_type === "Triplex") return 3;
    if (data.property_type === "Fourplex") return 4;
    return 1;
  };

  const [formData, setFormData] = React.useState({
    door_count: data.door_count || defaultDoorCount(),
    year_built: data.year_built || "",
    square_footage: data.square_footage || "",
    bedrooms: data.bedrooms || "",
    bathrooms: data.bathrooms || "",
    stories: data.stories || "",
    foundation_type: data.foundation_type || "",
    basement_status: data.basement_status || "N/A",
    garage_type: data.garage_type || "None",
    units: data.units || []
  });

  // Track which fields were pre-filled by AI
  const aiPrefilled = {
    year_built: !!data.year_built,
    square_footage: !!data.square_footage,
    bedrooms: !!data.bedrooms,
    bathrooms: !!data.bathrooms,
    stories: !!data.stories,
    foundation_type: !!data.foundation_type,
    garage_type: !!data.garage_type
  };

  React.useEffect(() => {
    // Initialize units array if multi-family
    if (isMultiFamily && formData.units.length === 0) {
      const initialUnits = [];
      for (let i = 0; i < formData.door_count; i++) {
        initialUnits.push({
          unit_id: `unit-${i + 1}`,
          nickname: `Unit ${String.fromCharCode(65 + i)}`,
          square_footage: "",
          bedrooms: "",
          bathrooms: "",
          occupancy_status: "Vacant",
          tenant_name: "",
          tenant_email: "",
          tenant_phone: ""
        });
      }
      const updated = { ...formData, units: initialUnits };
      setFormData(updated);
      onChange(updated);
    }
  }, [isMultiFamily]);

  const updateField = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const updateUnit = (index, field, value) => {
    const updatedUnits = [...formData.units];
    updatedUnits[index] = { ...updatedUnits[index], [field]: value };
    const updated = { ...formData, units: updatedUnits };
    setFormData(updated);
    onChange(updated);
  };

  const handleNext = () => {
    if (!formData.year_built || !formData.square_footage) {
      alert("Please fill in year built and square footage");
      return;
    }
    if (!isMultiFamily && (formData.bedrooms === "" || formData.bedrooms === null || formData.bedrooms === undefined || formData.bathrooms === "" || formData.bathrooms === null || formData.bathrooms === undefined)) {
      alert("Please fill in bedrooms and bathrooms");
      return;
    }
    onNext();
  };

  const handleBack = () => {
    onBack();
  };

  const hasAiData = Object.values(aiPrefilled).some(v => v);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '24px' }}>
          Add New Property - Step 2 of 4
        </h2>
        <p className="text-gray-600 mb-4">
          Property: {data.street_address}, {data.city}, {data.state}<br />
          Type: {data.property_type}
        </p>
        <div className="flex gap-2">
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
        </div>
      </div>

      {/* AI Pre-fill Notice */}
      {hasAiData && (
        <Card className="border-2 border-purple-300 bg-purple-50 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-purple-900 mb-1">
                  ✨ AI Pre-filled Some Details
                </p>
                <p className="text-sm text-gray-700">
                  We found public records for this property and pre-filled some fields. 
                  Please verify accuracy and adjust as needed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Door Count */}
      <Card className="border-2 mobile-card mb-6" style={{ borderColor: '#FF6B35' }}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <DoorOpen className="w-6 h-6" style={{ color: '#FF6B35' }} />
            <h3 className="font-bold" style={{ color: '#1B365D', fontSize: '20px' }}>
              NUMBER OF DOORS
            </h3>
          </div>

          <p className="text-gray-700 mb-4" style={{ fontSize: '16px' }}>
            {isMultiFamily
              ? `For ${data.property_type?.toLowerCase()}, this is typically ${defaultDoorCount()} doors.`
              : "For single-family homes, this is almost always 1."}
          </p>

          <div className="mb-4">
            <Label className="font-semibold">Number of doors</Label>
            <Select
              value={String(formData.door_count)}
              onValueChange={(value) => updateField('door_count', parseInt(value))}
            >
              <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map((num) => (
                  <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-2" style={{ color: '#1B365D' }}>
                💡 What is a "door"?
              </p>
              <p className="text-sm text-gray-700 mb-2">
                A door = one rental unit or living space with separate entrance.
              </p>
              {!isMultiFamily && (
                <>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Only count MORE than 1 door if:</strong>
                  </p>
                  <ul className="text-sm text-gray-700 ml-4 space-y-1">
                    <li>• You have a legal ADU (Accessory Dwelling Unit)</li>
                    <li>• You have a separate in-law suite you rent out</li>
                    <li>• You have a detached guest house that's a rental unit</li>
                  </ul>
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Examples:</strong> Regular single-family home = 1 door | Home + basement apartment = 2 doors
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Unit Details for Multi-Family */}
      {isMultiFamily && formData.units.length > 0 && (
        <Card className="border-2 mobile-card mb-6" style={{ borderColor: '#28A745' }}>
          <CardContent className="p-6">
            <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
              📋 UNIT DETAILS
            </h3>
            <p className="text-gray-700 mb-6" style={{ fontSize: '14px' }}>
              We'll set up tracking for each unit. This helps organize inspections, maintenance, and costs separately.
            </p>

            {formData.units.map((unit, index) => (
              <div key={unit.unit_id} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '18px' }}>
                  UNIT {index + 1}:
                </h4>

                <div className="space-y-4">
                  <div>
                    <Label className="font-semibold">Unit Nickname/ID</Label>
                    <Input
                      value={unit.nickname}
                      onChange={(e) => updateUnit(index, 'nickname', e.target.value)}
                      placeholder="Unit A, Upper, Left Side"
                      className="mt-2"
                      style={{ minHeight: '48px' }}
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Choose a name that makes sense: Letter/number, Location, or Floor
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="font-semibold">Square Footage</Label>
                      <Input
                        type="number"
                        value={unit.square_footage}
                        onChange={(e) => updateUnit(index, 'square_footage', e.target.value)}
                        placeholder="900"
                        className="mt-2"
                        style={{ minHeight: '48px' }}
                      />
                    </div>
                    <div>
                      <Label className="font-semibold">Bedrooms</Label>
                      <Input
                        type="number"
                        value={unit.bedrooms}
                        onChange={(e) => updateUnit(index, 'bedrooms', e.target.value)}
                        placeholder="2"
                        className="mt-2"
                        style={{ minHeight: '48px' }}
                      />
                    </div>
                    <div>
                      <Label className="font-semibold">Bathrooms</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={unit.bathrooms}
                        onChange={(e) => updateUnit(index, 'bathrooms', e.target.value)}
                        placeholder="1"
                        className="mt-2"
                        style={{ minHeight: '48px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="font-semibold">Current Occupancy</Label>
                    <Select
                      value={unit.occupancy_status}
                      onValueChange={(value) => updateUnit(index, 'occupancy_status', value)}
                    >
                      <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Owner-Occupied">Owner-Occupied (I live here)</SelectItem>
                        <SelectItem value="Tenant-Occupied">Tenant-Occupied</SelectItem>
                        <SelectItem value="Vacant">Vacant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {unit.occupancy_status === "Tenant-Occupied" && (
                    <div className="space-y-3 p-3 bg-white rounded border">
                      <p className="text-sm font-semibold text-gray-700">Tenant Information (optional)</p>
                      <Input
                        value={unit.tenant_name}
                        onChange={(e) => updateUnit(index, 'tenant_name', e.target.value)}
                        placeholder="Tenant Name"
                        style={{ minHeight: '48px' }}
                      />
                      <Input
                        value={unit.tenant_email}
                        onChange={(e) => updateUnit(index, 'tenant_email', e.target.value)}
                        placeholder="tenant@email.com"
                        type="email"
                        style={{ minHeight: '48px' }}
                      />
                      <Input
                        value={unit.tenant_phone}
                        onChange={(e) => updateUnit(index, 'tenant_phone', e.target.value)}
                        placeholder="(360) 555-1234"
                        type="tel"
                        style={{ minHeight: '48px' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Property Details */}
      <Card className="border-2 mobile-card mb-6" style={{ borderColor: '#1B365D' }}>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
            🏡 PROPERTY DETAILS
          </h3>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold flex items-center gap-2">
                  Year Built *
                  {aiPrefilled.year_built && (
                    <Badge className="bg-purple-600 text-white text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI
                    </Badge>
                  )}
                </Label>
                <Input
                  type="number"
                  value={formData.year_built}
                  onChange={(e) => updateField('year_built', e.target.value)}
                  placeholder="1985"
                  className="mt-2"
                  style={{ minHeight: '48px' }}
                />
              </div>
              <div>
                <Label className="font-semibold flex items-center gap-2">
                  Square Footage *
                  {aiPrefilled.square_footage && (
                    <Badge className="bg-purple-600 text-white text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI
                    </Badge>
                  )}
                </Label>
                <Input
                  type="number"
                  value={formData.square_footage}
                  onChange={(e) => updateField('square_footage', e.target.value)}
                  placeholder="2400"
                  className="mt-2"
                  style={{ minHeight: '48px' }}
                />
              </div>
            </div>

            {!isMultiFamily && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold flex items-center gap-2">
                    Bedrooms *
                    {aiPrefilled.bedrooms && (
                      <Badge className="bg-purple-600 text-white text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </Label>
                  <Select
                    value={formData.bedrooms ? String(formData.bedrooms) : ""}
                    onValueChange={(value) => updateField('bedrooms', value === "studio" ? 0 : parseInt(value))}
                  >
                    <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="studio">Studio (0 bedrooms)</SelectItem>
                      <SelectItem value="1">1 Bedroom</SelectItem>
                      <SelectItem value="2">2 Bedrooms</SelectItem>
                      <SelectItem value="3">3 Bedrooms</SelectItem>
                      <SelectItem value="4">4 Bedrooms</SelectItem>
                      <SelectItem value="5">5 Bedrooms</SelectItem>
                      <SelectItem value="6">6+ Bedrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-semibold flex items-center gap-2">
                    Bathrooms *
                    {aiPrefilled.bathrooms && (
                      <Badge className="bg-purple-600 text-white text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </Label>
                  <Select
                    value={formData.bathrooms ? String(formData.bathrooms) : ""}
                    onValueChange={(value) => updateField('bathrooms', parseFloat(value))}
                  >
                    <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="1">1 Bathroom</SelectItem>
                      <SelectItem value="1.5">1.5 Bathrooms</SelectItem>
                      <SelectItem value="2">2 Bathrooms</SelectItem>
                      <SelectItem value="2.5">2.5 Bathrooms</SelectItem>
                      <SelectItem value="3">3 Bathrooms</SelectItem>
                      <SelectItem value="3.5">3.5 Bathrooms</SelectItem>
                      <SelectItem value="4">4 Bathrooms</SelectItem>
                      <SelectItem value="4.5">4.5 Bathrooms</SelectItem>
                      <SelectItem value="5">5+ Bathrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div>
              <Label className="font-semibold flex items-center gap-2">
                Stories/Levels
                {aiPrefilled.stories && (
                  <Badge className="bg-purple-600 text-white text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI
                  </Badge>
                )}
              </Label>
              <Select
                value={formData.stories}
                onValueChange={(value) => updateField('stories', value)}
              >
                <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Single-Story">Single-Story (Ranch, Rambler)</SelectItem>
                  <SelectItem value="Two-Story">Two-Story</SelectItem>
                  <SelectItem value="Three+ Story">Three+ Story</SelectItem>
                  <SelectItem value="Split-Level">Split-Level</SelectItem>
                  <SelectItem value="Tri-Level">Tri-Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-semibold flex items-center gap-2">
                Foundation Type
                {aiPrefilled.foundation_type && (
                  <Badge className="bg-purple-600 text-white text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI
                  </Badge>
                )}
              </Label>
              <Select
                value={formData.foundation_type}
                onValueChange={(value) => updateField('foundation_type', value)}
              >
                <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Concrete Slab">Concrete Slab (no basement/crawlspace)</SelectItem>
                  <SelectItem value="Crawlspace">Crawlspace (accessible space under home)</SelectItem>
                  <SelectItem value="Full Basement">Full Basement (finished or unfinished)</SelectItem>
                  <SelectItem value="Partial Basement">Partial Basement (basement under part of home)</SelectItem>
                  <SelectItem value="Pier & Beam">Pier & Beam (home elevated on posts)</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.foundation_type === "Full Basement" || formData.foundation_type === "Partial Basement") && (
              <div>
                <Label className="font-semibold">Basement Status</Label>
                <Select
                  value={formData.basement_status}
                  onValueChange={(value) => updateField('basement_status', value)}
                >
                  <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Unfinished">Unfinished</SelectItem>
                    <SelectItem value="Finished">Finished (living space)</SelectItem>
                    <SelectItem value="Partially Finished">Partially Finished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="font-semibold flex items-center gap-2">
                Garage
                {aiPrefilled.garage_type && (
                  <Badge className="bg-purple-600 text-white text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI
                  </Badge>
                )}
              </Label>
              <Select
                value={formData.garage_type}
                onValueChange={(value) => updateField('garage_type', value)}
              >
                <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Attached 1-car">Attached Garage (1-car)</SelectItem>
                  <SelectItem value="Attached 2-car">Attached Garage (2-car)</SelectItem>
                  <SelectItem value="Attached 3+ car">Attached Garage (3+ car)</SelectItem>
                  <SelectItem value="Detached">Detached Garage</SelectItem>
                  <SelectItem value="Carport">Carport</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 mb-8">
        <Button
          type="button"
          onClick={handleBack}
          variant="outline"
          className="flex-1"
          style={{ minHeight: '56px' }}
        >
          ← Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="flex-1"
          style={{ backgroundColor: '#FF6B35', minHeight: '56px' }}
        >
          Next: Climate & Systems →
        </Button>
      </div>
    </div>
  );
}