import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Home, Plus, MapPin, Calendar, Maximize, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import HealthScoreGauge from "../components/dashboard/HealthScoreGauge";
import { CLIMATE_ZONES, detectClimateZone } from "@/utils/climateZones";

export default function Properties() {
  const [showDialog, setShowDialog] = React.useState(false);
  const [formData, setFormData] = React.useState({
    address: "",
    property_type: "Single Family",
    year_built: new Date().getFullYear(),
    square_footage: "",
    occupancy_status: "Owner Occupied",
    climate_zone: "Pacific Northwest"
  });

  const queryClient = useQueryClient();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const createPropertyMutation = useMutation({
    mutationFn: (propertyData) => base44.entities.Property.create(propertyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setShowDialog(false);
      setFormData({
        address: "",
        property_type: "Single Family",
        year_built: new Date().getFullYear(),
        square_footage: "",
        occupancy_status: "Owner Occupied",
        climate_zone: "Pacific Northwest"
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPropertyMutation.mutate({
      ...formData,
      square_footage: parseInt(formData.square_footage),
      year_built: parseInt(formData.year_built),
      health_score: 50,
      baseline_completion: 0
    });
  };

  // Auto-detect climate zone from address when it changes
  React.useEffect(() => {
    if (formData.address) {
      const parts = formData.address.split(',');
      if (parts.length >= 2) {
        const stateZip = parts[parts.length - 1].trim();
        const detectedZone = detectClimateZone(stateZip);
        if (detectedZone !== formData.climate_zone) {
          setFormData(prev => ({ ...prev, climate_zone: detectedZone }));
        }
      }
    }
  }, [formData.address]);

  const selectedClimateZoneData = CLIMATE_ZONES[formData.climate_zone];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Properties</h1>
            <p className="text-gray-600 mt-1">Manage and monitor all your properties in one place</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2" style={{ backgroundColor: 'var(--primary)' }}>
                <Plus className="w-4 h-4" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Property</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="address">Property Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main St, City, State ZIP"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="property_type">Property Type</Label>
                    <Select
                      value={formData.property_type}
                      onValueChange={(value) => setFormData({ ...formData, property_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single Family">Single Family</SelectItem>
                        <SelectItem value="Condo">Condo</SelectItem>
                        <SelectItem value="Townhouse">Townhouse</SelectItem>
                        <SelectItem value="Multi-Family">Multi-Family</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="year_built">Year Built</Label>
                    <Input
                      id="year_built"
                      type="number"
                      value={formData.year_built}
                      onChange={(e) => setFormData({ ...formData, year_built: e.target.value })}
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="square_footage">Square Footage</Label>
                    <Input
                      id="square_footage"
                      type="number"
                      value={formData.square_footage}
                      onChange={(e) => setFormData({ ...formData, square_footage: e.target.value })}
                      placeholder="2000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="occupancy_status">Occupancy Status</Label>
                    <Select
                      value={formData.occupancy_status}
                      onValueChange={(value) => setFormData({ ...formData, occupancy_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Owner Occupied">Owner Occupied</SelectItem>
                        <SelectItem value="Tenant Occupied">Tenant Occupied</SelectItem>
                        <SelectItem value="Vacant">Vacant</SelectItem>
                        <SelectItem value="Under Renovation">Under Renovation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <hr className="border-gray-200 my-6" />
                
                {/* Climate Zone Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <Label className="text-lg font-semibold">Climate Zone</Label>
                  </div>
                  
                  {formData.address && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-2">
                        🌍 Auto-detected from your location
                      </p>
                      <p className="text-sm text-gray-700">
                        Based on your address, we've selected seasonal timing and maintenance tasks specific to your region's climate.
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="climate_zone">Climate Zone *</Label>
                    <Select
                      value={formData.climate_zone}
                      onValueChange={(value) => setFormData({ ...formData, climate_zone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {Object.entries(CLIMATE_ZONES).map(([key, zone]) => (
                          <SelectItem key={key} value={key}>
                            {zone.icon} {zone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedClimateZoneData && (
                    <Card className="border-2 border-blue-200 bg-blue-50">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{selectedClimateZoneData.icon}</span>
                          <h3 className="font-bold text-gray-900">{selectedClimateZoneData.name}</h3>
                        </div>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p><strong>Climate Profile:</strong></p>
                          <ul className="list-disc ml-5 space-y-1">
                            <li>{selectedClimateZoneData.profile.rainfall}</li>
                            <li>{selectedClimateZoneData.profile.winters}</li>
                            <li>{selectedClimateZoneData.profile.summers}</li>
                          </ul>
                          <p className="mt-3"><strong>Key Concerns:</strong></p>
                          <ul className="list-disc ml-5 space-y-1">
                            {selectedClimateZoneData.profile.keyConcerns.map((concern, idx) => (
                              <li key={idx}>{concern}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">💡 Why this matters:</p>
                    <p className="text-sm text-gray-700">
                      Seasonal timing and maintenance priorities vary dramatically by climate. 
                      Your inspection schedules and task lists will be tailored to {selectedClimateZoneData?.name || 'your'} conditions.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" style={{ backgroundColor: 'var(--primary)' }}>
                    Add Property
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {properties.length === 0 ? (
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No Properties Yet</h3>
              <p className="text-gray-600 mb-6">Add your first property to begin your proactive maintenance journey</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const climateZone = CLIMATE_ZONES[property.climate_zone];
              return (
                <Link key={property.id} to={createPageUrl("Baseline") + `?property=${property.id}`}>
                  <Card className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer h-full">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                      <CardTitle className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-normal text-gray-600">Address</span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">{property.address}</h3>
                        </div>
                        <HealthScoreGauge score={property.health_score || 0} size="small" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Home className="w-3 h-3" />
                          {property.property_type}
                        </Badge>
                        {climateZone && (
                          <Badge variant="outline" className="gap-1">
                            <span>{climateZone.icon}</span>
                            {climateZone.name.split('(')[0].trim()}
                          </Badge>
                        )}
                        {property.square_footage && (
                          <Badge variant="outline" className="gap-1">
                            <Maximize className="w-3 h-3" />
                            {property.square_footage.toLocaleString()} sq ft
                          </Badge>
                        )}
                        {property.year_built && (
                          <Badge variant="outline" className="gap-1">
                            <Calendar className="w-3 h-3" />
                            Built {property.year_built}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Baseline Progress</span>
                          <span className="font-semibold">{property.baseline_completion || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${property.baseline_completion || 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-xs text-gray-600">Spent</p>
                            <p className="font-semibold text-gray-900">${(property.total_maintenance_spent || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Saved</p>
                            <p className="font-semibold text-green-600">${(property.estimated_disasters_prevented || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}