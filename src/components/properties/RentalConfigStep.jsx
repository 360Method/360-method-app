
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Building2, Home } from "lucide-react";

export default function RentalConfigStep({ data, propertyUseType, onChange, onNext, onBack }) {
  // Detect if this is a multi-unit property (Duplex, Triplex, Fourplex, etc.)
  const isMultiUnitProperty = data.property_type && [
    "Duplex", "Triplex", "Fourplex", 
    "Small Multi-Family (5-12 units)", 
    "Apartment Building (13+ units)"
  ].includes(data.property_type) && (data.door_count || 0) > 1;

  // For multi-unit primary_with_rental, use unit-by-unit configuration
  const useUnitBasedConfig = propertyUseType === 'primary_with_rental' && isMultiUnitProperty;

  const [formData, setFormData] = React.useState({
    rental_config: data.rental_config || {
      rental_type: '',
      rental_type_other: '',
      number_of_rental_units: propertyUseType !== 'primary_with_rental' ? (data.door_count || 1) : 1,
      rental_square_footage: '',
      is_furnished: false,
      furnishing_level: 'unfurnished',
      included_items: [],
      rental_duration: '',
      annual_turnovers: '',
      shared_areas: [],
      separate_systems: [],
      current_status: '',
      platforms: [],
      average_stay_length: '',
      bookings_per_year: '',
      management_type: '',
      monthly_rent: '',
      nightly_rate: ''
    },
    units: data.units || []
  });

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Initialize units array for multi-unit configuration - ONLY ONCE
  React.useEffect(() => {
    if (useUnitBasedConfig && formData.units.length === 0 && data.door_count) {
      const initialUnits = [];
      for (let i = 0; i < data.door_count; i++) {
        const existingUnit = data.units?.[i];
        initialUnits.push({
          unit_id: existingUnit?.unit_id || `unit-${i + 1}`,
          nickname: existingUnit?.nickname || `Unit ${String.fromCharCode(65 + i)}`,
          square_footage: existingUnit?.square_footage || "",
          bedrooms: existingUnit?.bedrooms || "",
          bathrooms: existingUnit?.bathrooms || "",
          occupancy_status: existingUnit?.occupancy_status || "Vacant",
          is_furnished: existingUnit?.is_furnished ?? false,
          furnishing_level: existingUnit?.furnishing_level || "unfurnished",
          tenant_name: existingUnit?.tenant_name || "",
          tenant_email: existingUnit?.tenant_email || "",
          tenant_phone: existingUnit?.tenant_phone || "",
          monthly_rent: existingUnit?.monthly_rent || ""
        });
      }
      setFormData(prev => ({ ...prev, units: initialUnits }));
    }
  }, []);

  // For full rental properties, sync number_of_rental_units with door_count
  React.useEffect(() => {
    if (propertyUseType !== 'primary_with_rental' && data.door_count) {
      setFormData(prev => ({
        ...prev,
        rental_config: {
          ...prev.rental_config,
          number_of_rental_units: data.door_count
        }
      }));
    }
  }, [data.door_count, propertyUseType]);

  const updateRentalConfig = (field, value) => {
    const updated = {
      ...formData,
      rental_config: {
        ...formData.rental_config,
        [field]: value
      }
    };
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

  const toggleArrayItem = (field, item) => {
    const currentArray = formData.rental_config[field] || [];
    const updated = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateRentalConfig(field, updated);
  };

  const toggleUnitArrayItem = (unitIndex, field, item) => {
    const unit = formData.units[unitIndex];
    const currentArray = unit[field] || [];
    const updated = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateUnit(unitIndex, field, updated);
  };

  const handleNext = () => {
    if (useUnitBasedConfig) {
      // Validate unit configuration
      const hasOwnerUnit = formData.units.some(u => u.occupancy_status === 'Owner-Occupied');
      
      if (!hasOwnerUnit) {
        alert("Please mark at least one unit as Owner-Occupied (the unit you live in)");
        return;
      }
    } else {
      const config = formData.rental_config;
      
      // Validation based on property type
      if (propertyUseType === 'primary_with_rental') {
        if (!config.rental_type) {
          alert("Please specify what you're renting out");
          return;
        }
        if (!config.number_of_rental_units || !config.rental_square_footage) {
          alert("Please provide rental units and square footage");
          return;
        }
      }
      
      if (propertyUseType === 'vacation_rental') {
        if (!config.platforms || config.platforms.length === 0) {
          alert("Please select at least one platform");
          return;
        }
        if (!config.average_stay_length || !config.bookings_per_year) {
          alert("Please provide booking patterns information");
          return;
        }
      }
    }
    
    onNext();
  };

  // Determine if this is a primary_with_rental (needs extra questions)
  const isPrimaryWithRental = propertyUseType === 'primary_with_rental';

  // Render based on property type
  const renderContent = () => {
    // Multi-unit primary with rental (Triplex example: owner lives in one, rents others)
    if (useUnitBasedConfig) {
      return (
        <>
          <Card className="border-2 border-blue-300 bg-blue-50 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Building2 className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '18px' }}>
                    Multi-Unit Property Configuration
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Your <strong>{data.property_type}</strong> has <strong>{data.door_count} independent units</strong>. 
                    Let's configure each one - mark which unit you live in and which ones are rentals.
                  </p>
                  <p className="text-xs text-gray-600">
                    💡 This helps us track maintenance, costs, and turnovers separately for each unit.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unit-by-unit configuration */}
          {formData.units.map((unit, index) => (
            <Card key={unit.unit_id} className="border-2 border-purple-300 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: '#1B365D', fontSize: '20px' }}>
                      {unit.nickname || `Unit ${index + 1}`}
                    </h3>
                    {unit.square_footage && unit.bedrooms && (
                      <p className="text-sm text-gray-600">
                        {unit.square_footage} sq ft • {unit.bedrooms} bed • {unit.bathrooms} bath
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Occupancy Status */}
                  <div>
                    <Label className="font-semibold mb-3 block">How is this unit used?</Label>
                    <div className="space-y-2">
                      {[
                        { value: 'Owner-Occupied', label: 'Owner-Occupied', sub: 'I live in this unit', icon: '🏠' },
                        { value: 'Tenant-Occupied', label: 'Tenant-Occupied', sub: 'Currently rented to a tenant', icon: '👥' },
                        { value: 'Vacant', label: 'Vacant', sub: 'Available for rent', icon: '🔓' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateUnit(index, 'occupancy_status', option.value)}
                          className={`w-full flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all text-left ${
                            unit.occupancy_status === option.value
                              ? 'border-purple-600 bg-purple-50 shadow-md'
                              : 'border-gray-300 hover:border-purple-400 bg-white'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            unit.occupancy_status === option.value
                              ? 'border-purple-600 bg-purple-600'
                              : 'border-gray-400 bg-white'
                          }`}>
                            {unit.occupancy_status === option.value && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {option.icon} {option.label}
                            </p>
                            <p className="text-sm text-gray-600">{option.sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* If tenant-occupied or vacant, show rental details */}
                  {(unit.occupancy_status === 'Tenant-Occupied' || unit.occupancy_status === 'Vacant') && (
                    <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg space-y-4">
                      <h4 className="font-bold text-orange-900 text-sm">
                        🏘️ Rental Details for this Unit
                      </h4>

                      {/* Furnishing */}
                      <div>
                        <Label className="font-semibold mb-2 block text-sm">Is this unit furnished?</Label>
                        <div className="space-y-2">
                          {[
                            { value: 'fully_furnished', label: 'Fully Furnished', sub: 'All furniture & housewares' },
                            { value: 'partially_furnished', label: 'Partially Furnished', sub: 'Major furniture only' },
                            { value: 'unfurnished', label: 'Unfurnished', sub: 'Tenant brings everything' }
                          ].map((option) => (
                            <button
                              key={`${unit.unit_id}-${option.value}`}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Furnishing button clicked:', option.value, 'for unit', index);
                                const updatedUnits = [...formData.units];
                                updatedUnits[index] = { 
                                  ...updatedUnits[index], 
                                  furnishing_level: option.value,
                                  is_furnished: option.value !== 'unfurnished'
                                };
                                const updated = { ...formData, units: updatedUnits };
                                setFormData(updated);
                                onChange(updated);
                              }}
                              className={`w-full flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all text-left ${
                                unit.furnishing_level === option.value
                                  ? 'border-orange-600 bg-white shadow-md'
                                  : 'border-gray-300 hover:border-orange-400 bg-white'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                unit.furnishing_level === option.value
                                  ? 'border-orange-600 bg-orange-600'
                                  : 'border-gray-400 bg-white'
                              }`}>
                                {unit.furnishing_level === option.value && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{option.label}</p>
                                <p className="text-xs text-gray-600">{option.sub}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Monthly rent */}
                      <div>
                        <Label className="font-semibold text-sm">Monthly Rent (optional)</Label>
                        <Input
                          type="number"
                          value={unit.monthly_rent || ""}
                          onChange={(e) => updateUnit(index, 'monthly_rent', e.target.value)}
                          placeholder="1800"
                          className="mt-2"
                          style={{ minHeight: '48px' }}
                        />
                      </div>

                      {/* Tenant info if occupied */}
                      {unit.occupancy_status === 'Tenant-Occupied' && (
                        <div className="space-y-3 p-3 bg-white rounded border">
                          <p className="text-sm font-semibold text-gray-700">Tenant Information (optional)</p>
                          <Input
                            value={unit.tenant_name || ""}
                            onChange={(e) => updateUnit(index, 'tenant_name', e.target.value)}
                            placeholder="Tenant Name"
                            style={{ minHeight: '48px' }}
                          />
                          <Input
                            value={unit.tenant_email || ""}
                            onChange={(e) => updateUnit(index, 'tenant_email', e.target.value)}
                            placeholder="tenant@email.com"
                            type="email"
                            style={{ minHeight: '48px' }}
                          />
                          <Input
                            value={unit.tenant_phone || ""}
                            onChange={(e) => updateUnit(index, 'tenant_phone', e.target.value)}
                            placeholder="(360) 555-1234"
                            type="tel"
                            style={{ minHeight: '48px' }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Overall rental management */}
          <Card className="border-2 border-green-300 bg-green-50 mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '18px' }}>
                📅 Overall Rental Management
              </h3>

              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">Typical rental duration</Label>
                  <Select
                    value={formData.rental_config.rental_duration || ""}
                    onValueChange={(value) => updateRentalConfig('rental_duration', value)}
                  >
                    <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                      <SelectValue placeholder="Select duration..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="long_term">Long-term (12+ months lease)</SelectItem>
                      <SelectItem value="medium_term">Medium-term (1-6 months)</SelectItem>
                      <SelectItem value="short_term">Short-term (High turnover)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="font-semibold flex items-center gap-2">
                    Estimated turnovers per year (across all rental units)
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                      <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg w-48 z-10">
                        How many times per year do tenants move out across all units?
                      </div>
                    </div>
                  </Label>
                  <Select
                    value={String(formData.rental_config.annual_turnovers || "")}
                    onValueChange={(value) => updateRentalConfig('annual_turnovers', parseInt(value))}
                  >
                    <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="1">1-2 times</SelectItem>
                      <SelectItem value="3">3-5 times</SelectItem>
                      <SelectItem value="6">6-10 times</SelectItem>
                      <SelectItem value="12">12+ times</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="font-semibold">Property management</Label>
                  <Select
                    value={formData.rental_config.management_type || ""}
                    onValueChange={(value) => updateRentalConfig('management_type', value)}
                  >
                    <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="self_managed">Self-managed (I handle everything)</SelectItem>
                      <SelectItem value="property_manager">Property manager</SelectItem>
                      <SelectItem value="cleaning_service">Cleaning service only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      );
    }

    // Single-family home with rental component
    if (propertyUseType === 'primary_with_rental' && !useUnitBasedConfig) {
      return (
        <>
          <Card className="border-2 border-purple-300 bg-purple-50 mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
                🏠 What are you renting out?
              </h3>

              <div className="space-y-3">
                {[
                  { value: 'room', label: 'Room(s) in main house', sub: 'Shared common areas with tenant' },
                  { value: 'separate_unit', label: 'Separate unit in main house', sub: 'Private entrance, but attached' },
                  { value: 'adu', label: 'ADU / Guest house', sub: 'Detached, separate structure' },
                  { value: 'basement', label: 'Basement apartment', sub: 'Separate entrance' },
                  { value: 'garage_conversion', label: 'Garage conversion', sub: '' },
                  { value: 'other', label: 'Other', sub: '' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.rental_config.rental_type === option.value
                        ? 'border-purple-600 bg-white shadow-md'
                        : 'border-gray-300 hover:border-purple-400 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rental_type"
                      value={option.value}
                      checked={formData.rental_config.rental_type === option.value}
                      onChange={(e) => updateRentalConfig('rental_type', e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{option.label}</p>
                      {option.sub && <p className="text-sm text-gray-600">{option.sub}</p>}
                    </div>
                  </label>
                ))}
              </div>

              {formData.rental_config.rental_type === 'other' && (
                <Input
                  value={formData.rental_config.rental_type_other || ""}
                  onChange={(e) => updateRentalConfig('rental_type_other', e.target.value)}
                  placeholder="Describe what you're renting..."
                  className="mt-3"
                  style={{ minHeight: '48px' }}
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-300 mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '18px' }}>
                📏 Rental Details
              </h3>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="font-semibold">How many rental units/rooms?</Label>
                  <Select
                    value={String(formData.rental_config.number_of_rental_units || "")}
                    onValueChange={(value) => updateRentalConfig('number_of_rental_units', parseInt(value))}
                  >
                    <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {[1, 2, 3, 4, 5].map(num => (
                        <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="font-semibold">Rental square footage</Label>
                  <Input
                    type="number"
                    value={formData.rental_config.rental_square_footage || ""}
                    onChange={(e) => updateRentalConfig('rental_square_footage', parseInt(e.target.value))}
                    placeholder="400"
                    className="mt-2"
                    style={{ minHeight: '48px' }}
                  />
                  <p className="text-xs text-gray-600 mt-1">Approximate size of rental portion</p>
                </div>
              </div>

              <div className="mb-4">
                <Label className="font-semibold mb-3 block">Is the rental furnished?</Label>
                <div className="space-y-2">
                  {[
                    { value: true, level: 'fully_furnished', label: 'Yes - Fully furnished', sub: 'All furniture, housewares, linens, everything' },
                    { value: true, level: 'partially_furnished', label: 'Yes - Partially furnished', sub: 'Major furniture only, tenant brings housewares' },
                    { value: false, level: 'unfurnished', label: 'No - Unfurnished', sub: 'Tenant brings all furniture' }
                  ].map((option) => (
                    <label
                      key={option.level}
                      className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.rental_config.furnishing_level === option.level
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="furnished"
                        checked={formData.rental_config.furnishing_level === option.level}
                        onChange={() => {
                          updateRentalConfig('is_furnished', option.value);
                          updateRentalConfig('furnishing_level', option.level);
                        }}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{option.label}</p>
                        <p className="text-xs text-gray-600">{option.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {formData.rental_config.is_furnished && (
                <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  <Label className="font-semibold mb-3 block">What's included in the rental?</Label>
                  <div className="grid md:grid-cols-2 gap-2">
                    {[
                      'all_furniture',
                      'kitchen_housewares',
                      'bedding_linens',
                      'towels',
                      'tvs_electronics',
                      'small_appliances',
                      'decor_artwork'
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <Checkbox
                          id={item}
                          checked={formData.rental_config.included_items?.includes(item)}
                          onCheckedChange={() => toggleArrayItem('included_items', item)}
                        />
                        <Label htmlFor={item} className="cursor-pointer font-normal text-sm">
                          {item.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-green-300 mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '18px' }}>
                📅 Rental Duration & Turnover
              </h3>

              <div className="mb-4">
                <Label className="font-semibold">Rental duration type</Label>
                <Select
                  value={formData.rental_config.rental_duration || ""}
                  onValueChange={(value) => updateRentalConfig('rental_duration', value)}
                >
                  <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Select duration..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="long_term">Long-term (12+ months lease)</SelectItem>
                    <SelectItem value="medium_term">Medium-term (1-6 months)</SelectItem>
                    <SelectItem value="short_term">Short-term (Airbnb, roommates, high turnover)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-semibold flex items-center gap-2">
                  Estimated turnovers per year
                  <div className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg w-48 z-10">
                      How many times per year does a tenant move out and a new one moves in?
                    </div>
                  </div>
                </Label>
                <Select
                  value={String(formData.rental_config.annual_turnovers || "")}
                  onValueChange={(value) => updateRentalConfig('annual_turnovers', parseInt(value))}
                >
                  <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="1">1-2 times</SelectItem>
                    <SelectItem value="3">3-5 times</SelectItem>
                    <SelectItem value="6">6-10 times</SelectItem>
                    <SelectItem value="12">12-20 times</SelectItem>
                    <SelectItem value="20">20+ times</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-300 mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '18px' }}>
                🔧 Shared vs. Separate
              </h3>

              <div className="mb-6">
                <Label className="font-semibold mb-3 block">Which areas are shared with tenant(s)?</Label>
                <div className="grid md:grid-cols-2 gap-2">
                  {['kitchen', 'laundry_room', 'living_room', 'backyard_patio', 'garage', 'driveway_parking', 'none'].map((area) => (
                    <div key={area} className="flex items-center gap-2">
                      <Checkbox
                        id={`shared-${area}`}
                        checked={formData.rental_config.shared_areas?.includes(area)}
                        onCheckedChange={() => toggleArrayItem('shared_areas', area)}
                      />
                      <Label htmlFor={`shared-${area}`} className="cursor-pointer font-normal text-sm">
                        {area.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="font-semibold mb-3 block">Which systems are separate for the rental?</Label>
                <div className="grid md:grid-cols-2 gap-2">
                  {['separate_hvac', 'separate_water_heater', 'separate_electrical', 'separate_entrance', 'none'].map((system) => (
                    <div key={system} className="flex items-center gap-2">
                      <Checkbox
                        id={`system-${system}`}
                        checked={formData.rental_config.separate_systems?.includes(system)}
                        onCheckedChange={() => toggleArrayItem('separate_systems', system)}
                      />
                      <Label htmlFor={`system-${system}`} className="cursor-pointer font-normal text-sm">
                        {system.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      );
    }

    if (propertyUseType === 'rental_unfurnished') {
      return (
        <>
          {/* Auto-populated door count notice for full rental properties */}
          <Card className="border-2 border-blue-300 bg-blue-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm">
                    📋 Number of Units: {data.door_count || 1}
                  </p>
                  <p className="text-xs text-gray-700">
                    Based on property details from previous step
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-300 bg-green-50 mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
                📋 Rental Status
              </h3>

              <div className="mb-4">
                <Label className="font-semibold mb-3 block">Current Status</Label>
                <div className="space-y-2">
                  {[
                    { value: 'occupied', label: 'Occupied', sub: 'Tenant in place' },
                    { value: 'vacant', label: 'Vacant', sub: 'Available for rent' },
                    { value: 'preparing', label: 'Preparing for tenant', sub: '' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.rental_config.current_status === option.value
                          ? 'border-green-600 bg-white'
                          : 'border-gray-300 hover:border-green-400 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="current_status"
                        value={option.value}
                        checked={formData.rental_config.current_status === option.value}
                        onChange={(e) => updateRentalConfig('current_status', e.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{option.label}</p>
                        {option.sub && <p className="text-sm text-gray-600">{option.sub}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <Label className="font-semibold">Rental Type</Label>
                <Select
                  value={formData.rental_config.rental_duration || ""}
                  onValueChange={(value) => updateRentalConfig('rental_duration', value)}
                >
                  <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="long_term">Long-term rental (12+ months lease)</SelectItem>
                    <SelectItem value="medium_term">Medium-term rental (1-6 months)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <Label className="font-semibold">Estimated turnovers per year</Label>
                <Select
                  value={String(formData.rental_config.annual_turnovers || "")}
                  onValueChange={(value) => updateRentalConfig('annual_turnovers', parseInt(value))}
                >
                  <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="1">1-2 times</SelectItem>
                    <SelectItem value="3">3-5 times</SelectItem>
                    <SelectItem value="6">6-10 times</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-semibold">Monthly Rent (optional)</Label>
                <Input
                  type="number"
                  value={formData.rental_config.monthly_rent || ""}
                  onChange={(e) => updateRentalConfig('monthly_rent', parseFloat(e.target.value))}
                  placeholder="2500"
                  className="mt-2"
                  style={{ minHeight: '48px' }}
                />
              </div>
            </CardContent>
          </Card>
        </>
      );
    }

    if (propertyUseType === 'rental_furnished') {
      return (
        <>
          {/* Auto-populated door count notice */}
          <Card className="border-2 border-blue-300 bg-blue-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm">
                    📋 Number of Units: {data.door_count || 1}
                  </p>
                  <p className="text-xs text-gray-700">
                    Based on property details from previous step
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-300 bg-orange-50 mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
                🛋️ Furnishing Level
              </h3>

              <div className="space-y-2 mb-4">
                {[
                  { value: 'fully_furnished', label: 'Fully Furnished', sub: 'All furniture, housewares, linens, everything' },
                  { value: 'partially_furnished', label: 'Partially Furnished', sub: 'Major furniture only, tenant brings housewares' },
                  { value: 'corporate_furnished', label: 'Corporate Furnished', sub: 'Premium furniture package for executives' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      updateRentalConfig('furnishing_level', option.value);
                      updateRentalConfig('is_furnished', true);
                    }}
                    className={`w-full flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all text-left ${
                      formData.rental_config.furnishing_level === option.value
                        ? 'border-orange-600 bg-white shadow-md'
                        : 'border-gray-300 hover:border-orange-400 bg-white'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      formData.rental_config.furnishing_level === option.value
                        ? 'border-orange-600 bg-orange-600'
                        : 'border-gray-400 bg-white'
                    }`}>
                      {formData.rental_config.furnishing_level === option.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-600">{option.sub}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 bg-white border-2 border-orange-300 rounded-lg">
                <Label className="font-semibold mb-3 block">What's included with this property?</Label>
                <div className="grid md:grid-cols-2 gap-2">
                  {[
                    'all_furniture',
                    'kitchen_housewares',
                    'bedding_linens',
                    'towels',
                    'tvs_electronics',
                    'washer_dryer',
                    'small_appliances',
                    'outdoor_furniture',
                    'decor_artwork'
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Checkbox
                        id={item}
                        checked={formData.rental_config.included_items?.includes(item)}
                        onCheckedChange={() => toggleArrayItem('included_items', item)}
                      />
                      <Label htmlFor={item} className="cursor-pointer font-normal text-sm">
                        {item.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-300 mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '18px' }}>
                📅 Rental Duration
              </h3>

              <div className="mb-4">
                <Label className="font-semibold">Rental Duration Type</Label>
                <Select
                  value={formData.rental_config.rental_duration || ""}
                  onValueChange={(value) => updateRentalConfig('rental_duration', value)}
                >
                  <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="short_term">Short-term (1-30 days - Airbnb/VRBO)</SelectItem>
                    <SelectItem value="medium_term">Medium-term (1-6 months - Corporate, travel nurses)</SelectItem>
                    <SelectItem value="long_term">Long-term (6-12 months - Students, relocating)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <Label className="font-semibold">Estimated turnovers per year</Label>
                <Select
                  value={String(formData.rental_config.annual_turnovers || "")}
                  onValueChange={(value) => updateRentalConfig('annual_turnovers', parseInt(value))}
                >
                  <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="1">1-2 times</SelectItem>
                    <SelectItem value="3">3-5 times</SelectItem>
                    <SelectItem value="6">6-10 times</SelectItem>
                    <SelectItem value="12">12-20 times</SelectItem>
                    <SelectItem value="20">20+ times</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <Label className="font-semibold">Current Status</Label>
                <Select
                  value={formData.rental_config.current_status || ""}
                  onValueChange={(value) => updateRentalConfig('current_status', value)}
                >
                  <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="active_rental">Active rental (accepting bookings)</SelectItem>
                    <SelectItem value="preparing">Preparing to launch</SelectItem>
                    <SelectItem value="seasonal">Seasonal (only rent certain months)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-semibold">Monthly Rent (optional)</Label>
                <Input
                  type="number"
                  value={formData.rental_config.monthly_rent || ""}
                  onChange={(e) => updateRentalConfig('monthly_rent', parseFloat(e.target.value))}
                  placeholder="3500"
                  className="mt-2"
                  style={{ minHeight: '48px' }}
                />
              </div>
            </CardContent>
          </Card>
        </>
      );
    }

    if (propertyUseType === 'vacation_rental') {
      return (
        <>
          {/* Auto-populated door count notice */}
          <Card className="border-2 border-blue-300 bg-blue-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm">
                    📋 Number of Units: {data.door_count || 1}
                  </p>
                  <p className="text-xs text-gray-700">
                    Based on property details from previous step
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-teal-300 bg-teal-50 mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
                🏖️ Vacation Rental Platforms
              </h3>

              <Label className="font-semibold mb-3 block">Platform(s) you use:</Label>
              <div className="grid md:grid-cols-2 gap-2">
                {['airbnb', 'vrbo', 'booking_com', 'direct_bookings', 'other'].map((platform) => (
                  <div key={platform} className="flex items-center gap-2">
                    <Checkbox
                      id={platform}
                      checked={formData.rental_config.platforms?.includes(platform)}
                      onCheckedChange={() => toggleArrayItem('platforms', platform)}
                    />
                    <Label htmlFor={platform} className="cursor-pointer font-normal text-sm">
                      {platform === 'airbnb' ? 'Airbnb' :
                       platform === 'vrbo' ? 'VRBO' :
                       platform === 'booking_com' ? 'Booking.com' :
                       platform === 'direct_bookings' ? 'Direct Bookings' :
                       'Other'}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-300 mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '18px' }}>
                🛋️ Furnishings & Amenities
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                All vacation rentals are furnished. What's included?
              </p>

              <div className="grid md:grid-cols-2 gap-2">
                {[
                  'all_furniture',
                  'kitchen_housewares',
                  'bedding_linens',
                  'towels',
                  'tvs_streaming',
                  'washer_dryer',
                  'coffee_maker',
                  'outdoor_furniture',
                  'wifi_smart_home',
                  'welcome_basket'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Checkbox
                      id={item}
                      checked={formData.rental_config.included_items?.includes(item)}
                      onCheckedChange={() => toggleArrayItem('included_items', item)}
                    />
                    <Label htmlFor={item} className="cursor-pointer font-normal text-sm">
                      {item === 'tvs_streaming' ? 'TVs & streaming services' :
                       item === 'wifi_smart_home' ? 'WiFi & smart home devices' :
                       item === 'coffee_maker' ? 'Coffee maker, toaster, microwave' :
                       item === 'welcome_basket' ? 'Welcome basket / amenities' :
                       item.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-300 mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '18px' }}>
                📊 Booking Patterns
              </h3>

              <div className="mb-4">
                <Label className="font-semibold">Average length of stay</Label>
                <Select
                  value={formData.rental_config.average_stay_length || ""}
                  onValueChange={(value) => updateRentalConfig('average_stay_length', value)}
                >
                  <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="1-3 nights">1-3 nights (weekend getaway)</SelectItem>
                    <SelectItem value="4-7 nights">4-7 nights (week-long stays)</SelectItem>
                    <SelectItem value="7-14 nights">7-14 nights (extended vacation)</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <Label className="font-semibold">Estimated bookings per year</Label>
                <Select
                  value={String(formData.rental_config.bookings_per_year || "")}
                  onValueChange={(value) => updateRentalConfig('bookings_per_year', parseInt(value))}
                >
                  <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="15">12-20 bookings</SelectItem>
                    <SelectItem value="25">20-30 bookings</SelectItem>
                    <SelectItem value="40">30-50 bookings</SelectItem>
                    <SelectItem value="50">50+ bookings</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <Label className="font-semibold">Who manages turnovers?</Label>
                <Select
                  value={formData.rental_config.management_type || ""}
                  onValueChange={(value) => updateRentalConfig('management_type', value)}
                >
                  <SelectTrigger className="mt-2" style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="self_managed">I do (self-managed)</SelectItem>
                    <SelectItem value="property_manager">Property manager / co-host</SelectItem>
                    <SelectItem value="cleaning_service">Cleaning service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-semibold">Average nightly rate (optional)</Label>
                <Input
                  type="number"
                  value={formData.rental_config.nightly_rate || ""}
                  onChange={(e) => updateRentalConfig('nightly_rate', parseFloat(e.target.value))}
                  placeholder="150"
                  className="mt-2"
                  style={{ minHeight: '48px' }}
                />
              </div>
            </CardContent>
          </Card>
        </>
      );
    }

    return null;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header with Step Progress */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-orange-600 text-white">Step 3 of 5</Badge>
          <span className="text-sm text-gray-600">Almost there!</span>
        </div>
        <h2 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px' }}>
          Rental Configuration
        </h2>
        <p className="text-gray-600 mb-4">
          {useUnitBasedConfig
            ? `Configure each of your ${data.door_count} units`
            : isPrimaryWithRental 
              ? "Tell us about the rental portion of your property"
              : `Configure your ${data.door_count || 1}-unit rental property`}
        </p>
        <div className="flex gap-2">
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
        </div>
      </div>

      {renderContent()}

      {/* Navigation */}
      <div className="flex gap-3 mb-8">
        <Button
          type="button"
          onClick={onBack}
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
          Next: Financial Details →
        </Button>
      </div>
    </div>
  );
}
