import React from "react";
import { auth, Property, CartItem, MaintenanceTask, storage, integrations } from "@/api/supabaseClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, X, CheckCircle2, Edit, Sparkles, Clock, DollarSign, AlertCircle, Crown } from "lucide-react";

export default function EditCartItemDialog({ open, onClose, item }) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    system_type: "",
    priority: "Medium",
    customer_notes: "",
    preferred_timeline: "",
    photo_urls: []
  });

  const [photos, setPhotos] = React.useState([]);
  const [uploading, setUploading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [estimating, setEstimating] = React.useState(false);
  const [aiEstimate, setAiEstimate] = React.useState(null);

  // Get user for membership info
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => auth.me(),
  });

  // Get property for estimation context
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => Property.list(),
  });

  const isMember = user && (
    user.subscription_tier?.includes('homecare') || 
    user.subscription_tier?.includes('propertycare')
  );

  const memberDiscountPercent = user?.subscription_tier?.includes('elite') ? 20 :
                                 user?.subscription_tier?.includes('premium') ? 15 :
                                 user?.subscription_tier?.includes('essential') ? 10 : 0;

  const hourBucket = user?.hour_bucket || { total: 0, used: 0, remaining: 0 };

  React.useEffect(() => {
    if (open && item) {
      setFormData({
        title: item.title || "",
        description: item.description || "",
        system_type: item.system_type || "",
        priority: item.priority || "Medium",
        customer_notes: item.customer_notes || "",
        preferred_timeline: item.preferred_timeline || "",
        photo_urls: item.photo_urls || []
      });
      setPhotos(item.photo_urls || []);
      setSuccess(false);
    }
  }, [open, item]);

  const updateCartItemMutation = useMutation({
    mutationFn: async (updates) => {
      return CartItem.update(item.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });

      // Update original source if applicable
      if (item.source_type && item.source_id) {
        if (item.source_type === 'task') {
          MaintenanceTask.update(item.source_id, {
            title: formData.title,
            description: formData.description,
            priority: formData.priority
          }).catch(err => console.error('Failed to update source task:', err));
        }
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    },
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const uploadPromises = files.map(file =>
        storage.uploadFile(file)
      );
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.file_url);
      setPhotos(prev => [...prev, ...newUrls]);
      setFormData(prev => ({
        ...prev,
        photo_urls: [...prev.photo_urls, ...newUrls]
      }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      photo_urls: prev.photo_urls.filter((_, i) => i !== index)
    }));
  };

  const handleGetAIEstimate = async () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in title and description first');
      return;
    }

    setEstimating(true);
    try {
      const property = properties.find(p => p.id === item.property_id);
      if (!property) {
        throw new Error('Property not found');
      }

      // Check if this is a baseline assessment or inspection (fixed costs)
      const isBaselineAssessment = formData.title.toLowerCase().includes('baseline') || 
                                    formData.source_type === 'baseline_assessment';
      const isInspection = formData.title.toLowerCase().includes('inspection') ||
                          formData.source_type === 'inspection';

      // Determine if multi-unit property
      const doorCount = property.door_count || 1;
      const isMultiUnit = doorCount > 1;

      if (isBaselineAssessment) {
        let baselineHours, baselineCost;
        
        if (isMultiUnit) {
          // Multi-unit: $299 base + $50 per additional door
          baselineHours = 2.5 + ((doorCount - 1) * 0.5);
          baselineCost = 299 + ((doorCount - 1) * 50);
        } else {
          // Single-family: Fixed $299
          baselineHours = 2.5;
          baselineCost = 299;
        }

        setAiEstimate({
          estimated_hours: baselineHours,
          cost_min: baselineCost,
          cost_max: baselineCost,
          detailed_scope: isMultiUnit 
            ? `Complete professional baseline documentation for ${doorCount}-unit property. Technician will document all major systems, common areas, and individual units.`
            : "Complete professional baseline system documentation service",
          materials_list: ["All documentation tools and reports included"],
          is_fixed_price: true,
          estimated_timeline: isMultiUnit ? `${Math.ceil(baselineHours)} hours on-site` : "2-3 hours on-site",
          pricing_note: isMultiUnit ? `$299 base + $50 per additional unit (${doorCount} units)` : "Fixed price for single-family home"
        });
        setEstimating(false);
        return;
      }

      if (isInspection) {
        let inspectionHours, inspectionCost;
        
        if (isMultiUnit) {
          // Multi-unit: $199 base + $35 per additional door
          inspectionHours = 1.5 + ((doorCount - 1) * 0.3);
          inspectionCost = 199 + ((doorCount - 1) * 35);
        } else {
          // Single-family: Fixed $199
          inspectionHours = 1.5;
          inspectionCost = 199;
        }

        setAiEstimate({
          estimated_hours: inspectionHours,
          cost_min: inspectionCost,
          cost_max: inspectionCost,
          detailed_scope: isMultiUnit
            ? `Professional seasonal inspection for ${doorCount}-unit property. Comprehensive checklist covering all systems, common areas, and units.`
            : "Professional seasonal inspection with comprehensive checklist covering all major systems.",
          materials_list: ["All inspection tools and reporting included"],
          is_fixed_price: true,
          estimated_timeline: isMultiUnit ? `${Math.ceil(inspectionHours)} hours on-site` : "1-2 hours on-site",
          pricing_note: isMultiUnit ? `$199 base + $35 per additional unit (${doorCount} units)` : "Fixed price for single-family home"
        });
        setEstimating(false);
        return;
      }

      const estimationPrompt = `You are estimating a home service request for Handy Pioneers (internal rate: $150/hour, not shown to customer).

PROPERTY CONTEXT:
Address: ${property.address}
Type: ${property.property_type || 'Not specified'}
Climate: ${property.climate_zone || 'Pacific Northwest'}

SERVICE REQUEST:
Title: ${formData.title}
System: ${formData.system_type || 'General'}
Priority: ${formData.priority}

DETAILED DESCRIPTION:
${formData.description}

${formData.customer_notes ? `CUSTOMER NOTES:\n${formData.customer_notes}` : ''}

${formData.photo_urls?.length > 0 ? `PHOTOS PROVIDED: ${formData.photo_urls.length} (analyze for scope accuracy)` : 'NO PHOTOS - estimate conservatively'}

ESTIMATION REQUIREMENTS:

1. ESTIMATED_HOURS: Total professional time including:
   - Travel to/from site (0.5 hrs standard)
   - Setup and preparation
   - Actual work time
   - Cleanup and documentation
   - Buffer for typical complications (15-20%)

2. COST_MIN: Best case scenario
   - Hours × $150 base rate
   - Basic materials estimate
   - Minimal complications assumed

3. COST_MAX: With typical complications
   - Hours × $150 base rate
   - Materials + 20% buffer
   - Common issue discoveries
   - Weather/access delays

4. DETAILED_SCOPE: Professional statement of work (2-3 sentences)
   - What will be inspected/repaired/replaced
   - Method and approach
   - Quality standards

5. MATERIALS_LIST: Key materials needed (list 3-5 items)

6. TOOLS_REQUIRED: Specialized tools needed (if any)

7. PERMIT_REQUIRED: Does this need permits? (yes/no)

8. TIMELINE: Estimated completion time once started

9. RISK_FACTORS: Potential complications that could increase cost

10. RECOMMENDATIONS: Any prep work customer should do before service

PRICING MODIFIERS:
- Emergency priority: +50% urgency fee
- High priority: +25% urgency fee
- Multiple floors: +0.5 hours per additional floor
- Difficult access: +1-2 hours
- Aged systems (15+ years): +20% for complications

Provide realistic, professional estimates. Be conservative - better to over-estimate slightly than under-deliver.`;

      const result = await integrations.InvokeLLM({
        prompt: estimationPrompt,
        add_context_from_internet: false,
        file_urls: formData.photo_urls?.length > 0 ? formData.photo_urls : undefined,
        response_json_schema: {
          type: "object",
          properties: {
            estimated_hours: { type: "number" },
            cost_min: { type: "number" },
            cost_max: { type: "number" },
            detailed_scope: { type: "string" },
            materials_list: { 
              type: "array", 
              items: { type: "string" },
              description: "List of materials needed"
            },
            tools_required: { 
              type: "array", 
              items: { type: "string" },
              description: "List of tools needed"
            },
            permit_required: { 
              type: "boolean",
              description: "Whether permits are needed"
            },
            estimated_timeline: { 
              type: "string",
              description: "How long to complete"
            },
            risk_factors: { 
              type: "array", 
              items: { type: "string" },
              description: "Potential complications"
            },
            recommendations: { 
              type: "array", 
              items: { type: "string" },
              description: "Prep work suggestions"
            }
          },
          required: ["estimated_hours", "cost_min", "cost_max", "detailed_scope"]
        }
      });

      console.log('AI Estimation Result:', result);
      setAiEstimate(result);
      
    } catch (error) {
      console.error('AI estimation failed:', error);
      console.error('Error details:', error.message, error.response?.data);
      
      // Provide fallback estimate
      const fallbackHours = formData.priority === 'Emergency' ? 3 : 
                           formData.priority === 'High' ? 4 : 5;
      const urgencyMultiplier = formData.priority === 'Emergency' ? 1.5 : 
                               formData.priority === 'High' ? 1.25 : 1.0;
      
      const fallbackEstimate = {
        estimated_hours: fallbackHours * urgencyMultiplier,
        cost_min: Math.round(fallbackHours * 150 * urgencyMultiplier),
        cost_max: Math.round(fallbackHours * 150 * urgencyMultiplier * 1.4),
        detailed_scope: `Professional ${formData.system_type || 'service'} - detailed scope will be determined during site assessment.`,
        materials_list: ['Materials to be determined on-site'],
        estimated_timeline: `${fallbackHours}-${fallbackHours + 2} hours`,
        risk_factors: ['Final scope may vary based on actual conditions'],
        is_fallback: true
      };
      
      setAiEstimate(fallbackEstimate);
      alert(`💡 Basic Estimate Generated\n\nWe've created a preliminary estimate based on typical ${formData.system_type || 'service'} work.\n\n⚠️ IMPORTANT: This AI estimate is NOT a final quote. Your operator will provide official pricing after reviewing your request.\n\nFor a MORE ACCURATE AI estimate:\n• Add specific details in "Additional Notes"\n• Include exact locations and access info\n• Upload photos of the issue/area\n• Describe any complications or special requirements\n• Click "Get AI Estimate" again to regenerate\n\nThe more details you provide, the better the AI can estimate!`);
      
    } finally {
      setEstimating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updates = {
      ...formData,
      estimated_hours: aiEstimate?.estimated_hours || item.estimated_hours,
      estimated_cost_min: aiEstimate?.cost_min || item.estimated_cost_min,
      estimated_cost_max: aiEstimate?.cost_max || item.estimated_cost_max
    };
    
    updateCartItemMutation.mutate(updates);
  };

  if (!item) return null;

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogOverlay className="bg-black/75" />
        <DialogContent className="max-w-md bg-white" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-bold text-green-900 mb-2">Updated!</h3>
            <p className="text-gray-600">Cart item has been updated</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/75" />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white" style={{ backgroundColor: '#FFFFFF', opacity: 1 }}>
        <DialogHeader style={{ backgroundColor: '#FFFFFF', opacity: 1 }}>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2" style={{ color: '#1B365D', backgroundColor: 'transparent' }}>
            <Edit className="w-6 h-6" />
            Edit Cart Item
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" style={{ backgroundColor: '#FFFFFF', opacity: 1 }}>
          {/* Title */}
          <div>
            <Label>Service Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., HVAC Tune-Up, Gutter Cleaning"
              required
              style={{ backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', minHeight: '48px' }}
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what needs to be done..."
              rows={4}
              required
              style={{ backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', minHeight: '96px' }}
            />
          </div>

          {/* System Type */}
          <div>
            <Label>System Type</Label>
            <Select
              value={formData.system_type}
              onValueChange={(value) => setFormData({ ...formData, system_type: value })}
            >
              <SelectTrigger style={{ backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', minHeight: '48px' }}>
                <SelectValue placeholder="Select system type..." />
              </SelectTrigger>
              <SelectContent className="bg-white" style={{ backgroundColor: '#FFFFFF', opacity: 1 }}>
                <SelectItem value="HVAC System">HVAC System</SelectItem>
                <SelectItem value="Plumbing System">Plumbing System</SelectItem>
                <SelectItem value="Electrical System">Electrical System</SelectItem>
                <SelectItem value="Roof System">Roof System</SelectItem>
                <SelectItem value="Foundation & Structure">Foundation & Structure</SelectItem>
                <SelectItem value="Gutters & Downspouts">Gutters & Downspouts</SelectItem>
                <SelectItem value="Exterior Siding & Envelope">Exterior</SelectItem>
                <SelectItem value="Windows & Doors">Windows & Doors</SelectItem>
                <SelectItem value="Appliances">Appliances</SelectItem>
                <SelectItem value="Landscaping & Grading">Landscaping</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div>
            <Label>Priority Level</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger style={{ backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', minHeight: '48px' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white" style={{ backgroundColor: '#FFFFFF', opacity: 1 }}>
                <SelectItem value="Emergency">🚨 Emergency - Fix ASAP</SelectItem>
                <SelectItem value="High">⚠️ High - Within 1 week</SelectItem>
                <SelectItem value="Medium">📋 Medium - Within 2-4 weeks</SelectItem>
                <SelectItem value="Low">📝 Low - When convenient</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Timeline */}
          <div>
            <Label>When do you want this done?</Label>
            <Select
              value={formData.preferred_timeline}
              onValueChange={(value) => setFormData({ ...formData, preferred_timeline: value })}
            >
              <SelectTrigger style={{ backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', minHeight: '48px' }}>
                <SelectValue placeholder="Select timeline..." />
              </SelectTrigger>
              <SelectContent className="bg-white" style={{ backgroundColor: '#FFFFFF', opacity: 1 }}>
                <SelectItem value="ASAP - This is urgent">ASAP - This is urgent</SelectItem>
                <SelectItem value="Within 1 week">Within 1 week</SelectItem>
                <SelectItem value="Within 2-4 weeks">Within 2-4 weeks</SelectItem>
                <SelectItem value="Within 1-2 months">Within 1-2 months</SelectItem>
                <SelectItem value="Flexible - When you have availability">Flexible - When available</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Photos */}
          <div>
            <Label>Photos</Label>
            <div className="flex items-center gap-3 mb-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  className="gap-2"
                  style={{ minHeight: '48px' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.currentTarget.previousElementSibling.click();
                  }}
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Add More Photos'}
                </Button>
              </label>
            </div>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative">
                    <img 
                      src={url} 
                      alt={`Photo ${idx + 1}`} 
                      className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm" 
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                      style={{ minHeight: '24px', minWidth: '24px' }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Notes - Emphasized */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <Label className="text-base font-bold text-yellow-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Be As Detailed As Possible
            </Label>
            <p className="text-sm text-gray-700 mb-3">
              💡 The more details you provide, the more accurate your estimate will be. Include:
            </p>
            <ul className="text-xs text-gray-700 space-y-1 mb-3 ml-4">
              <li>• Access instructions (gate codes, parking, entry points)</li>
              <li>• Exact location of issue (room, floor, specific area)</li>
              <li>• Any known complications or special considerations</li>
              <li>• Preferred materials, brands, or quality levels</li>
              <li>• Timeline flexibility and scheduling constraints</li>
            </ul>
            <Textarea
              value={formData.customer_notes}
              onChange={(e) => setFormData({ ...formData, customer_notes: e.target.value })}
              placeholder="Example: Gate code 1234, issue is in main floor master bathroom. Water is shut off at main. Prefer OEM parts if available. Can't do work on weekends due to tenant schedule."
              rows={4}
              style={{ backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', minHeight: '96px' }}
            />
          </div>

          {/* AI Estimate Button */}
          <div className="border-t pt-4">
            <Button
              type="button"
              onClick={handleGetAIEstimate}
              disabled={estimating || !formData.title || !formData.description}
              className="w-full gap-2 mb-4"
              style={{ backgroundColor: '#FF6B35', minHeight: '56px' }}
            >
              {estimating ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  AI Analyzing Your Request...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Get AI Estimate
                </>
              )}
            </Button>
            <p className="text-xs text-center text-gray-600 mb-4">
              Click to analyze your request and get estimated hours, costs, and scope
            </p>
          </div>

          {/* AI Estimate Results */}
          {aiEstimate && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-blue-900">AI Estimate Results</h3>
                {aiEstimate.is_fixed_price && (
                  <Badge className="bg-green-600 text-white">Fixed Price</Badge>
                )}
              </div>
              {aiEstimate.pricing_note && (
                <div className="bg-green-50 border border-green-200 rounded p-2 mb-3">
                  <p className="text-xs font-semibold text-green-900">{aiEstimate.pricing_note}</p>
                </div>
              )}
              
              {/* AI Disclaimer */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                <p className="text-xs font-bold text-yellow-900 mb-1">
                  ⚠️ AI Estimate - Not a Final Quote
                </p>
                <p className="text-xs text-yellow-800">
                  This is a preliminary estimate for planning purposes. Actual scope and costs will be determined by your operator after professional assessment. Add more details for improved accuracy.
                </p>
              </div>

              {/* Time & Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-semibold text-gray-600">Estimated Time</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{aiEstimate.estimated_hours.toFixed(1)} hrs</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-semibold text-gray-600">Cost Range</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    ${aiEstimate.cost_min.toLocaleString()} - ${aiEstimate.cost_max.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Member Benefits */}
              {isMember && !aiEstimate.is_fixed_price && (
                <div className="bg-green-50 border border-green-300 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-green-700" />
                    <span className="text-sm font-bold text-green-900">Your Member Benefits</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Discount ({memberDiscountPercent}%):</span>
                      <span className="font-semibold text-green-700">
                        -${Math.round(((aiEstimate.cost_min + aiEstimate.cost_max) / 2) * (memberDiscountPercent / 100)).toLocaleString()}
                      </span>
                    </div>
                    {hourBucket.remaining > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Available Hours:</span>
                          <span className="font-semibold text-green-700">{hourBucket.remaining.toFixed(1)} / {hourBucket.total} hrs</span>
                        </div>
                        {aiEstimate.estimated_hours <= hourBucket.remaining && (
                          <div className="bg-green-100 border border-green-300 rounded p-2 mt-2">
                            <p className="text-xs font-bold text-green-900">
                              ✓ Fully covered by your hour bucket!
                            </p>
                            <p className="text-xs text-gray-700">You only pay for materials</p>
                          </div>
                        )}
                      </>
                    )}
                    <Progress 
                      value={(hourBucket.remaining / hourBucket.total) * 100} 
                      className="h-2 mt-2"
                    />
                  </div>
                </div>
              )}

              {/* Scope of Work */}
              {aiEstimate.detailed_scope && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Scope of Work:</p>
                  <p className="text-sm text-gray-800">{aiEstimate.detailed_scope}</p>
                </div>
              )}

              {/* Materials */}
              {aiEstimate.materials_list && aiEstimate.materials_list.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Materials Needed:</p>
                  <ul className="text-xs text-gray-800 space-y-1">
                    {aiEstimate.materials_list.map((material, idx) => (
                      <li key={idx}>• {material}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Factors */}
              {aiEstimate.risk_factors && aiEstimate.risk_factors.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded p-2">
                  <p className="text-xs font-semibold text-orange-900 mb-1">⚠️ Potential Complications:</p>
                  <ul className="text-xs text-gray-800 space-y-1">
                    {aiEstimate.risk_factors.map((risk, idx) => (
                      <li key={idx}>• {risk}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiEstimate.permit_required && (
                <div className="bg-yellow-50 border border-yellow-300 rounded p-2">
                  <p className="text-xs font-bold text-yellow-900">🏛️ Permit may be required for this work</p>
                </div>
              )}

              <p className="text-xs text-gray-600 italic">
                ⚠️ AI-generated estimate. Final pricing after operator site assessment.
              </p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#1B365D', color: '#1B365D', minHeight: '48px' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateCartItemMutation.isPending || !formData.title || !formData.description}
              className="flex-1"
              style={{ backgroundColor: '#8B5CF6', color: '#FFFFFF', minHeight: '48px' }}
            >
              {updateCartItemMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}