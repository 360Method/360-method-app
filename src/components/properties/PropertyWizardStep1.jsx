import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2, Sparkles, Home, CheckCircle2, Building2, Wrench, AlertCircle } from "lucide-react";
import AddressAutocomplete from "./AddressAutocomplete";
import AddressVerificationMap from "./AddressVerificationMap";
import { base44 } from "@/api/base44Client";
import { checkServiceAvailability } from "../shared/ServiceAreaChecker";

// Climate zone mapping function
const getClimateZone = (state) => {
  const climateMap = {
    // Pacific Northwest
    'WA': 'Pacific Northwest', 'OR': 'Pacific Northwest', 'ID': 'Pacific Northwest',
    // Northeast
    'ME': 'Northeast', 'NH': 'Northeast', 'VT': 'Northeast', 'MA': 'Northeast',
    'RI': 'Northeast', 'CT': 'Northeast', 'NY': 'Northeast', 'NJ': 'Northeast',
    'PA': 'Northeast', 'DE': 'Northeast', 'MD': 'Northeast',
    // Southeast
    'VA': 'Southeast', 'WV': 'Southeast', 'KY': 'Southeast', 'TN': 'Southeast',
    'NC': 'Southeast', 'SC': 'Southeast', 'GA': 'Southeast', 'FL': 'Southeast',
    'AL': 'Southeast', 'MS': 'Southeast', 'LA': 'Southeast', 'AR': 'Southeast',
    // Midwest
    'OH': 'Midwest', 'MI': 'Midwest', 'IN': 'Midwest', 'IL': 'Midwest',
    'WI': 'Midwest', 'MN': 'Midwest', 'IA': 'Midwest', 'MO': 'Midwest',
    'ND': 'Midwest', 'SD': 'Midwest', 'NE': 'Midwest', 'KS': 'Midwest',
    // Southwest
    'TX': 'Southwest', 'OK': 'Southwest', 'NM': 'Southwest', 'AZ': 'Southwest',
    'NV': 'Southwest', 'CA': 'Southwest',
    // Mountain West
    'MT': 'Mountain West', 'WY': 'Mountain West', 'CO': 'Mountain West', 'UT': 'Mountain West'
  };
  
  return climateMap[state] || 'Midwest';
};

export default function PropertyWizardStep1({ data, onChange, onNext, onCancel }) {
  const [formData, setFormData] = React.useState({
    street_address: data.street_address || "",
    unit_number: data.unit_number || "",
    city: data.city || "",
    state: data.state || "",
    zip_code: data.zip_code || "",
    county: data.county || "",
    formatted_address: data.formatted_address || "",
    place_id: data.place_id || "",
    coordinates: data.coordinates || null,
    address_verified: data.address_verified || false,
    verification_source: data.verification_source || "manual_entry",
    property_type: data.property_type || "",
    climate_zone: data.climate_zone || "",
    operator_available: data.operator_available || false,
    operator_id: data.operator_id || null
  });

  const [loadingPropertyData, setLoadingPropertyData] = React.useState(false);
  const [propertyDataFetched, setPropertyDataFetched] = React.useState(false);
  const [aiPropertyData, setAiPropertyData] = React.useState(null);
  const [appliedFields, setAppliedFields] = React.useState({});
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [operatorInfo, setOperatorInfo] = React.useState(null);
  const [checkingOperator, setCheckingOperator] = React.useState(false);

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Reset AI property data state when returning to this step
  React.useEffect(() => {
    if (data.address_verified && !propertyDataFetched && !loadingPropertyData && data.formatted_address) {
      // Automatically fetch property data if address is already verified
      fetchPropertyData({
        street_address: data.street_address,
        unit_number: data.unit_number,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code
      });
      // Check operator availability
      checkOperatorAvailability(data.zip_code);
    }
  }, []);

  const checkOperatorAvailability = (zipCode) => {
    if (!zipCode) return;
    
    setCheckingOperator(true);
    const availability = checkServiceAvailability(zipCode);
    setOperatorInfo(availability);
    setCheckingOperator(false);

    // Update form data with operator info
    const operatorData = {
      operator_available: availability.available || false,
      operator_id: availability.operatorId || null,
      operator_checked_date: new Date().toISOString().split('T')[0]
    };
    
    onChange(operatorData);
  };

  const handleAddressSelect = async (addressData) => {
    const climateZone = getClimateZone(addressData.state);
    
    const updated = {
      ...formData,
      ...addressData,
      climate_zone: climateZone
    };
    
    setFormData(updated);
    onChange(updated);

    // Check operator availability
    if (addressData.zip_code) {
      checkOperatorAvailability(addressData.zip_code);
    }

    // Automatically fetch property data after address is verified
    if (addressData.address_verified) {
      await fetchPropertyData(addressData);
    }
  };

  const fetchPropertyData = async (addressData) => {
    setLoadingPropertyData(true);
    setPropertyDataFetched(false);
    
    try {
      const fullAddress = `${addressData.street_address}${addressData.unit_number ? ` #${addressData.unit_number}` : ''}, ${addressData.city}, ${addressData.state} ${addressData.zip_code}`;
      
      const prompt = `Look up public property records for: ${fullAddress}

Search for this specific property on Zillow, Redfin, public tax records, or county assessor websites.

Extract the following details if available:
1. Year Built
2. Square Footage (living area)
3. Number of Bedrooms
4. Number of Bathrooms
5. Property Type (Single-Family Home, Duplex, Triplex, Fourplex, Condo/Townhouse, etc.)
6. Number of Stories (1-story, 2-story, 3+ story, split-level, etc.)
7. Foundation Type (Concrete Slab, Crawlspace, Full Basement, Partial Basement, Pier & Beam)
8. Garage Type (None, Attached 1-car, Attached 2-car, Attached 3+ car, Detached, Carport)
9. Lot Size
10. Last Sale Date
11. Last Sale Price
12. Estimated Current Value

For foundation type, look for keywords like:
- "Slab", "Slab on grade" → Concrete Slab
- "Crawl", "Crawlspace" → Crawlspace
- "Full basement", "Basement" → Full Basement
- "Partial basement" → Partial Basement
- "Pier and beam", "Raised foundation" → Pier & Beam

For garage, look for:
- "No garage", "None" → None
- "1-car garage attached", "Single car" → Attached 1-car
- "2-car garage attached", "Double garage" → Attached 2-car
- "3-car garage" → Attached 3+ car
- "Detached garage" → Detached
- "Carport" → Carport

Return ONLY the data you can confirm from reliable sources. Use null for missing data.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            year_built: { type: ["number", "null"] },
            square_footage: { type: ["number", "null"] },
            bedrooms: { type: ["number", "null"] },
            bathrooms: { type: ["number", "null"] },
            property_type: { type: ["string", "null"] },
            stories: { type: ["string", "null"] },
            foundation_type: { type: ["string", "null"] },
            garage_type: { type: ["string", "null"] },
            lot_size: { type: ["string", "null"] },
            last_sale_date: { type: ["string", "null"] },
            last_sale_price: { type: ["number", "null"] },
            estimated_value: { type: ["number", "null"] },
            data_source: { type: "string" },
            confidence: { type: "string" }
          }
        }
      });

      console.log("AI Property Data Response:", response);
      
      if (response) {
        setAiPropertyData(response);
        setPropertyDataFetched(true);
        
        // Auto-apply high-confidence data
        if (response.confidence === "high") {
          const updates = {};
          if (response.year_built) updates.year_built = response.year_built;
          if (response.square_footage) updates.square_footage = response.square_footage;
          if (response.bedrooms) updates.bedrooms = response.bedrooms;
          if (response.bathrooms) updates.bathrooms = response.bathrooms;
          
          // Map stories
          if (response.stories) {
            const storiesMap = {
              '1': 'Single-Story',
              'one': 'Single-Story',
              'single': 'Single-Story',
              '2': 'Two-Story',
              'two': 'Two-Story',
              '3': 'Three+ Story',
              'three': 'Three+ Story',
              'split': 'Split-Level',
              'tri-level': 'Tri-Level',
              'trilevel': 'Tri-Level'
            };
            const lowerStories = response.stories.toLowerCase();
            for (const [key, value] of Object.entries(storiesMap)) {
              if (lowerStories.includes(key)) {
                updates.stories = value;
                break;
              }
            }
          }
          
          // Map foundation type
          if (response.foundation_type) {
            const foundationMap = {
              'slab': 'Concrete Slab',
              'concrete slab': 'Concrete Slab',
              'crawl': 'Crawlspace',
              'crawlspace': 'Crawlspace',
              'full basement': 'Full Basement',
              'basement': 'Full Basement',
              'partial basement': 'Partial Basement',
              'pier': 'Pier & Beam',
              'beam': 'Pier & Beam',
              'raised': 'Pier & Beam',
              'mixed': 'Mixed'
            };
            const lowerFoundation = response.foundation_type.toLowerCase();
            for (const [key, value] of Object.entries(foundationMap)) {
              if (lowerFoundation.includes(key)) {
                updates.foundation_type = value;
                break;
              }
            }
          }
          
          // Map garage type
          if (response.garage_type) {
            const garageMap = {
              'none': 'None',
              'no garage': 'None',
              'attached 1': 'Attached 1-car',
              '1-car attached': 'Attached 1-car',
              'single car': 'Attached 1-car',
              'attached 2': 'Attached 2-car',
              '2-car attached': 'Attached 2-car',
              'double garage': 'Attached 2-car',
              'attached 3': 'Attached 3+ car',
              '3-car': 'Attached 3+ car',
              'detached': 'Detached',
              'carport': 'Carport'
            };
            const lowerGarage = response.garage_type.toLowerCase();
            for (const [key, value] of Object.entries(garageMap)) {
              if (lowerGarage.includes(key)) {
                updates.garage_type = value;
                break;
              }
            }
          }
          
          if (response.property_type) {
            // Map to our property types
            const typeMap = {
              'single family': 'Single-Family Home',
              'single-family': 'Single-Family Home',
              'sfr': 'Single-Family Home',
              'duplex': 'Duplex',
              'triplex': 'Triplex',
              'fourplex': 'Fourplex',
              'condo': 'Condo/Townhouse',
              'townhouse': 'Condo/Townhouse',
              'mobile': 'Mobile/Manufactured Home',
              'manufactured': 'Mobile/Manufactured Home'
            };
            const lowerType = response.property_type.toLowerCase();
            for (const [key, value] of Object.entries(typeMap)) {
              if (lowerType.includes(key)) {
                updates.property_type = value;
                break;
              }
            }
          }
          if (response.last_sale_price) updates.purchase_price = response.last_sale_price;
          if (response.estimated_value) updates.current_value = response.estimated_value;
          
          onChange(updates);
        }
      }
    } catch (error) {
      console.error("Error fetching property data:", error);
    } finally {
      setLoadingPropertyData(false);
    }
  };

  const updateField = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const handleNext = () => {
    if (!formData.street_address || !formData.city || !formData.state || !formData.zip_code) {
      alert("Please complete the address information");
      return;
    }
    if (!formData.property_type) {
      alert("Please select a property type");
      return;
    }
    onNext();
  };

  const applyAiData = (field, value) => {
    onChange({ [field]: value });
    setAppliedFields(prev => ({ ...prev, [field]: true }));
    
    // Show success message for fields that won't be visible until later steps
    if (field === 'current_value' || field === 'purchase_price') {
      const fieldLabel = field === 'current_value' ? 'Estimated value' : 'Purchase price';
      setSuccessMessage(`${fieldLabel} of $${value.toLocaleString()} saved! You'll see it in Step 4.`);
      
      // Auto-hide after 4 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-blue-600 text-white">Step 1 of 5</Badge>
          <span className="text-sm text-gray-600">Let's get started!</span>
        </div>
        <h2 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px' }}>
          Property Address
        </h2>
        <p className="text-gray-600 mb-4">
          Let's start with your property's address
        </p>
        <div className="flex gap-2">
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
        </div>
      </div>

      {/* Address Input */}
      <Card className="border-2 mobile-card mb-6" style={{ borderColor: '#FF6B35' }}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6" style={{ color: '#FF6B35' }} />
            <h3 className="font-bold" style={{ color: '#1B365D', fontSize: '20px' }}>
              PROPERTY ADDRESS
            </h3>
          </div>

          <AddressAutocomplete
            onAddressSelect={handleAddressSelect}
            initialValue={formData.street_address}
          />

          {formData.address_verified && (
            <Card className="mt-4 bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-900 mb-1">✓ Address Verified</p>
                    <p className="text-sm text-gray-700 mb-2">
                      {formData.formatted_address}
                    </p>
                    {formData.county && (
                      <p className="text-sm text-gray-700">
                        📍 {formData.county} County
                      </p>
                    )}
                    <p className="text-sm text-gray-700">
                      🌡️ Climate Zone: <strong>{formData.climate_zone}</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {formData.coordinates && (
            <div className="mt-4">
              <AddressVerificationMap 
                coordinates={formData.coordinates} 
                address={formData.formatted_address}
                onConfirm={() => {
                  // Optional: Handle map confirmation if needed
                  console.log('Map location confirmed');
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operator Availability Check */}
      {formData.address_verified && (
        <Card className="border-2 mobile-card mb-6" style={{ borderColor: operatorInfo?.available ? '#28A745' : '#FFA500' }}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {checkingOperator ? (
                <>
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Checking service availability...</p>
                    <p className="text-sm text-gray-600 mt-1">Looking for certified operators in your area</p>
                  </div>
                </>
              ) : operatorInfo?.available ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-2" style={{ color: '#28A745', fontSize: '20px' }}>
                      🎉 Great News!
                    </h3>
                    <p className="text-gray-900 mb-3">
                      <strong>A Certified 360° Method Operator is available in your area!</strong>
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-green-200 mb-3">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        <Building2 className="w-4 h-4 inline mr-2" />
                        {operatorInfo.operator}
                      </p>
                      <p className="text-sm text-gray-600">
                        Serving {operatorInfo.area}
                      </p>
                      {operatorInfo.contact && (
                        <div className="mt-2 text-sm text-gray-700">
                          <p>📞 {operatorInfo.contact.phone}</p>
                          <p>✉️ {operatorInfo.contact.email}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 inline text-green-600 mr-1" />
                      Professional maintenance, repairs, and inspections available
                    </p>
                    <p className="text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 inline text-green-600 mr-1" />
                      Priority scheduling for emergencies
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      💡 You can request services after setting up your property!
                    </p>
                  </div>
                </>
              ) : operatorInfo?.comingSoon ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-2" style={{ color: '#FF6B35', fontSize: '20px' }}>
                      We're Expanding to Your Area!
                    </h3>
                    <p className="text-gray-900 mb-3">
                      Professional services are coming soon to <strong>{operatorInfo.area}</strong>
                    </p>
                    {operatorInfo.launchDate && operatorInfo.launchDate !== 'TBD' && (
                      <p className="text-sm text-gray-700 mb-3">
                        🗓️ Expected launch: <strong>{operatorInfo.launchDate}</strong>
                      </p>
                    )}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-3">
                      <p className="text-sm font-semibold text-blue-900 mb-2">
                        ✨ You can still use all features now:
                      </p>
                      <p className="text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 inline text-blue-600 mr-1" />
                        Track maintenance and inspections
                      </p>
                      <p className="text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 inline text-blue-600 mr-1" />
                        Get AI-powered insights and recommendations
                      </p>
                      <p className="text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 inline text-blue-600 mr-1" />
                        Manage DIY projects
                      </p>
                      <p className="text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 inline text-blue-600 mr-1" />
                        Work with your own contractors
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Home className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                      Full Software Access Available
                    </h3>
                    <p className="text-gray-900 mb-3">
                      Professional operator services aren't available in your area yet, but you have complete access to our platform!
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900 mb-2">
                        ✨ Everything you need for property management:
                      </p>
                      <p className="text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 inline text-blue-600 mr-1" />
                        Complete maintenance tracking system
                      </p>
                      <p className="text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 inline text-blue-600 mr-1" />
                        AI-powered recommendations
                      </p>
                      <p className="text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 inline text-blue-600 mr-1" />
                        DIY guides and resources
                      </p>
                      <p className="text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 inline text-blue-600 mr-1" />
                        Coordinate with your own contractors
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message Toast */}
      {successMessage && (
        <Card className="border-2 border-green-300 bg-green-50 shadow-lg mb-6 animate-in fade-in-50 slide-in-from-top-5 duration-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-green-900">✓ Saved Successfully!</p>
                <p className="text-sm text-gray-700">{successMessage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Property Data Loading/Display */}
      {formData.address_verified && (
        <Card className="border-2 mobile-card mb-6" style={{ borderColor: '#8B5CF6' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h3 className="font-bold" style={{ color: '#1B365D', fontSize: '20px' }}>
                AI-POWERED PROPERTY LOOKUP
              </h3>
            </div>

            {loadingPropertyData && (
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                <div>
                  <p className="font-semibold text-purple-900">Searching public records...</p>
                  <p className="text-sm text-gray-700">Looking up Zillow, Redfin, and county assessor data</p>
                </div>
              </div>
            )}

            {!loadingPropertyData && !aiPropertyData && propertyDataFetched && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-semibold text-yellow-900 mb-2">
                  ⚠️ No AI Property Data Found
                </p>
                <p className="text-sm text-gray-700">
                  We couldn't find public records for this address at the moment. You can manually enter details in the next steps.
                </p>
              </div>
            )}

            {propertyDataFetched && aiPropertyData && (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-semibold text-green-900 mb-2">
                    ✨ Found Property Data!
                  </p>
                  <p className="text-sm text-gray-700">
                    Source: {aiPropertyData.data_source}
                  </p>
                  <Badge className={`mt-2 ${
                    aiPropertyData.confidence === 'high' ? 'bg-green-600' :
                    aiPropertyData.confidence === 'medium' ? 'bg-yellow-600' :
                    'bg-gray-600'
                  } text-white`}>
                    {aiPropertyData.confidence} confidence
                  </Badge>
                </div>

                {/* Display found data with apply buttons */}
                <div className="grid md:grid-cols-2 gap-3">
                  {aiPropertyData.year_built && (
                    <div className="p-3 bg-white border-2 border-purple-200 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Year Built</p>
                      <p className="font-bold text-lg">{aiPropertyData.year_built}</p>
                      {appliedFields.year_built ? (
                        <Badge className="mt-2 bg-green-600 text-white">
                          ✓ Applied
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => applyAiData('year_built', aiPropertyData.year_built)}
                          className="mt-2 bg-purple-600 hover:bg-purple-700"
                        >
                          Use This Value
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {aiPropertyData.square_footage && (
                    <div className="p-3 bg-white border-2 border-purple-200 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Square Footage</p>
                      <p className="font-bold text-lg">{aiPropertyData.square_footage.toLocaleString()} sq ft</p>
                      {appliedFields.square_footage ? (
                        <Badge className="mt-2 bg-green-600 text-white">
                          ✓ Applied
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => applyAiData('square_footage', aiPropertyData.square_footage)}
                          className="mt-2 bg-purple-600 hover:bg-purple-700"
                        >
                          Use This Value
                        </Button>
                      )}
                    </div>
                  )}

                  {aiPropertyData.bedrooms && (
                    <div className="p-3 bg-white border-2 border-purple-200 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Bedrooms</p>
                      <p className="font-bold text-lg">{aiPropertyData.bedrooms}</p>
                      {appliedFields.bedrooms ? (
                        <Badge className="mt-2 bg-green-600 text-white">
                          ✓ Applied
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => applyAiData('bedrooms', aiPropertyData.bedrooms)}
                          className="mt-2 bg-purple-600 hover:bg-purple-700"
                        >
                          Use This Value
                        </Button>
                      )}
                    </div>
                  )}

                  {aiPropertyData.bathrooms && (
                    <div className="p-3 bg-white border-2 border-purple-200 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Bathrooms</p>
                      <p className="font-bold text-lg">{aiPropertyData.bathrooms}</p>
                      {appliedFields.bathrooms ? (
                        <Badge className="mt-2 bg-green-600 text-white">
                          ✓ Applied
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => applyAiData('bathrooms', aiPropertyData.bathrooms)}
                          className="mt-2 bg-purple-600 hover:bg-purple-700"
                        >
                          Use This Value
                        </Button>
                      )}
                    </div>
                  )}

                  {aiPropertyData.stories && (
                    <div className="p-3 bg-white border-2 border-purple-200 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Stories</p>
                      <p className="font-bold text-lg">{aiPropertyData.stories}</p>
                      {appliedFields.stories ? (
                        <Badge className="mt-2 bg-green-600 text-white">
                          ✓ Applied
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => applyAiData('stories', aiPropertyData.stories)}
                          className="mt-2 bg-purple-600 hover:bg-purple-700"
                        >
                          Use This Value
                        </Button>
                      )}
                    </div>
                  )}

                  {aiPropertyData.foundation_type && (
                    <div className="p-3 bg-white border-2 border-purple-200 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Foundation Type</p>
                      <p className="font-bold text-lg">{aiPropertyData.foundation_type}</p>
                      {appliedFields.foundation_type ? (
                        <Badge className="mt-2 bg-green-600 text-white">
                          ✓ Applied
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => applyAiData('foundation_type', aiPropertyData.foundation_type)}
                          className="mt-2 bg-purple-600 hover:bg-purple-700"
                        >
                          Use This Value
                        </Button>
                      )}
                    </div>
                  )}

                  {aiPropertyData.garage_type && (
                    <div className="p-3 bg-white border-2 border-purple-200 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Garage Type</p>
                      <p className="font-bold text-lg">{aiPropertyData.garage_type}</p>
                      {appliedFields.garage_type ? (
                        <Badge className="mt-2 bg-green-600 text-white">
                          ✓ Applied
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => applyAiData('garage_type', aiPropertyData.garage_type)}
                          className="mt-2 bg-purple-600 hover:bg-purple-700"
                        >
                          Use This Value
                        </Button>
                      )}
                    </div>
                  )}

                  {aiPropertyData.estimated_value && (
                    <div className="p-3 bg-white border-2 border-purple-200 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Estimated Value</p>
                      <p className="font-bold text-lg">${aiPropertyData.estimated_value.toLocaleString()}</p>
                      {appliedFields.current_value ? (
                        <Badge className="mt-2 bg-green-600 text-white">
                          ✓ Saved for Step 4
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => applyAiData('current_value', aiPropertyData.estimated_value)}
                          className="mt-2 bg-purple-600 hover:bg-purple-700"
                        >
                          Use This Value
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-gray-700">
                    💡 <strong>Tip:</strong> This data comes from public records and may not be 100% accurate. 
                    You can adjust any values in the next steps.
                  </p>
                </div>
              </div>
            )}

            {!loadingPropertyData && !propertyDataFetched && (
              <div className="text-center p-6">
                <Home className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                <p className="text-sm text-gray-600 mb-3">
                  We'll automatically search for property data after you verify the address above.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Property Type */}
      <Card className="border-2 mobile-card mb-6" style={{ borderColor: '#1B365D' }}>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
            🏠 PROPERTY TYPE
          </h3>

          <Select
            value={formData.property_type}
            onValueChange={(value) => updateField('property_type', value)}
          >
            <SelectTrigger style={{ minHeight: '48px' }}>
              <SelectValue placeholder="Select property type..." />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="Single-Family Home">Single-Family Home (detached house)</SelectItem>
              <SelectItem value="Duplex">Duplex (2 units)</SelectItem>
              <SelectItem value="Triplex">Triplex (3 units)</SelectItem>
              <SelectItem value="Fourplex">Fourplex (4 units)</SelectItem>
              <SelectItem value="Small Multi-Family (5-12 units)">Small Multi-Family (5-12 units)</SelectItem>
              <SelectItem value="Apartment Building (13+ units)">Apartment Building (13+ units)</SelectItem>
              <SelectItem value="Condo/Townhouse">Condo/Townhouse</SelectItem>
              <SelectItem value="Mobile/Manufactured Home">Mobile/Manufactured Home</SelectItem>
            </SelectContent>
          </Select>

          {formData.property_type && (
            <Card className="mt-4 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <p className="text-sm text-gray-700">
                  {formData.property_type === "Single-Family Home" && "Most common type. You'll document all systems as a single property."}
                  {formData.property_type === "Duplex" && "2 separate units. You'll track maintenance for each unit individually."}
                  {formData.property_type === "Triplex" && "3 separate units. You'll track maintenance for each unit individually."}
                  {formData.property_type === "Fourplex" && "4 separate units. You'll track maintenance for each unit individually."}
                  {formData.property_type === "Condo/Townhouse" && "You own the interior. HOA typically handles exterior/common areas."}
                  {formData.property_type === "Mobile/Manufactured Home" && "Special systems and foundation considerations."}
                  {(formData.property_type === "Small Multi-Family (5-12 units)" || formData.property_type === "Apartment Building (13+ units)") && "For multi-family properties, you'll manage common area systems and systems specific to each unit."}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 mb-8">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1"
          style={{ minHeight: '56px' }}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={!formData.property_type || !formData.address_verified}
          className="flex-1"
          style={{ backgroundColor: '#FF6B35', minHeight: '56px' }}
        >
          Next: Property Details →
        </Button>
      </div>
    </div>
  );
}