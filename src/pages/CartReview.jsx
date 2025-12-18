import React from "react";
import { CartItem, Property, ServicePackage, auth, storage, supabase } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ShoppingCart, 
  Trash2, 
  Sparkles, 
  Crown,
  CheckCircle2,
  FileText,
  CreditCard,
  Download,
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Gift,
  X,
  Clock,
  DollarSign,
  Edit,
  Save
} from "lucide-react";
import { estimateCartItems } from "../components/cart/AIEstimator";
import { createPageUrl } from "@/utils";
import { checkServiceAvailability } from "../components/shared/ServiceAreaChecker";

export default function CartReview() {
  const [aiEstimating, setAiEstimating] = React.useState(false);
  const [aiEstimates, setAiEstimates] = React.useState(null);
  const [packageName, setPackageName] = React.useState('');
  const [customerNotes, setCustomerNotes] = React.useState('');
  const [preferredStartDate, setPreferredStartDate] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState({});
  const [operatorInfo, setOperatorInfo] = React.useState(null);
  const [generatingPDF, setGeneratingPDF] = React.useState(false);
  const [estimatingItems, setEstimatingItems] = React.useState({});
  const [itemEstimates, setItemEstimates] = React.useState({});
  const [editingItemId, setEditingItemId] = React.useState(null);
  const [editFormData, setEditFormData] = React.useState({});

  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => auth.me(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties', authUser?.id],
    queryFn: () => Property.list('-created_date', authUser?.id),
    enabled: !!authUser?.id
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cartItems'],
    queryFn: async () => {
      if (!user) return [];
      return CartItem.filter({
        created_by: user.email,
        status: 'in_cart'
      }, '-created_date');
    },
    enabled: !!user,
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId) => CartItem.delete(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, updates }) => CartItem.update(itemId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    },
  });

  // Check for operator availability
  React.useEffect(() => {
    if (cartItems.length > 0 && properties.length > 0) {
      const property = properties.find(p => p.id === cartItems[0].property_id);
      if (property?.zip_code) {
        const serviceCheck = checkServiceAvailability(property.zip_code);
        setOperatorInfo(serviceCheck);
      }
    }
  }, [cartItems, properties]);

  // Auto-estimate cart
  React.useEffect(() => {
    if (cartItems.length > 0 && properties.length > 0 && !aiEstimates) {
      const property = properties.find(p => p.id === cartItems[0].property_id);
      if (property) {
        setAiEstimating(true);
        estimateCartItems(cartItems, property).then(estimates => {
          setAiEstimates(estimates);
          
          const updatePromises = cartItems.map((item, idx) => {
            const estimate = estimates.estimates[idx];
            if (estimate) {
              return updateItemMutation.mutateAsync({
                itemId: item.id,
                updates: {
                  estimated_hours: estimate.estimated_hours,
                  estimated_cost_min: estimate.cost_min,
                  estimated_cost_max: estimate.cost_max
                }
              });
            }
            return Promise.resolve();
          });

          Promise.all(updatePromises).finally(() => {
            setAiEstimating(false);
          });
        }).catch(error => {
          console.error('AI estimation failed:', error);
          setAiEstimating(false);
        });
      }
    }
  }, [cartItems, properties, aiEstimates]);

  const isMember = user && (
    user.subscription_tier?.includes('homecare') || 
    user.subscription_tier?.includes('propertycare')
  );

  const memberDiscountPercent = user?.subscription_tier?.includes('elite') ? 20 :
                                 user?.subscription_tier?.includes('premium') ? 15 :
                                 user?.subscription_tier?.includes('essential') ? 10 : 0;

  const hourBucket = user?.hour_bucket || { total: 0, used: 0, remaining: 0 };

  const totalHours = cartItems.reduce((sum, item) => sum + (item.estimated_hours || 0), 0);
  const totalCostMin = cartItems.reduce((sum, item) => sum + (item.estimated_cost_min || 0), 0);
  const totalCostMax = cartItems.reduce((sum, item) => sum + (item.estimated_cost_max || 0), 0);
  
  const memberDiscountAmount = isMember ? (totalCostMin + totalCostMax) / 2 * (memberDiscountPercent / 100) : 0;
  
  const hoursFromBucket = isMember ? Math.min(totalHours, hourBucket.remaining || 0) : 0;
  const hourBucketSavings = hoursFromBucket * 150;
  
  const finalCostMin = Math.max(0, totalCostMin - memberDiscountAmount - hourBucketSavings);
  const finalCostMax = Math.max(0, totalCostMax - memberDiscountAmount - hourBucketSavings);

  const toggleItemExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleGetItemEstimate = async (item) => {
    setEstimatingItems(prev => ({ ...prev, [item.id]: true }));
    
    try {
      const property = properties.find(p => p.id === item.property_id);
      if (!property) {
        throw new Error('Property not found');
      }

      // Check if this is a baseline assessment or inspection (fixed costs)
      const isBaselineAssessment = item.title.toLowerCase().includes('baseline') || 
                                    item.source_type === 'baseline_assessment';
      const isInspection = item.title.toLowerCase().includes('inspection') ||
                          item.source_type === 'inspection';

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

        setItemEstimates(prev => ({
          ...prev,
          [item.id]: {
            estimated_hours: baselineHours,
            cost_min: baselineCost,
            cost_max: baselineCost,
            detailed_scope: isMultiUnit 
              ? `Complete professional baseline documentation for ${doorCount}-unit property. Technician will document all major systems, common areas, and individual units. Includes photos, age/condition records, and comprehensive digital baseline for entire property.`
              : "Complete professional baseline system documentation service. Technician will document all major systems, take photos, record ages/conditions, and create comprehensive digital baseline.",
            materials_note: "All documentation tools and reports included",
            is_fixed_price: true,
            estimated_timeline: isMultiUnit ? `${Math.ceil(baselineHours)} hours on-site` : "2-3 hours on-site",
            pricing_note: isMultiUnit ? `$299 base + $50 per additional unit (${doorCount} units)` : "Fixed price for single-family home"
          }
        }));
        setEstimatingItems(prev => ({ ...prev, [item.id]: false }));
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

        setItemEstimates(prev => ({
          ...prev,
          [item.id]: {
            estimated_hours: inspectionHours,
            cost_min: inspectionCost,
            cost_max: inspectionCost,
            detailed_scope: isMultiUnit
              ? `Professional seasonal inspection for ${doorCount}-unit property. Comprehensive checklist covering all systems, common areas, and units. Identifies issues, documents conditions, and provides actionable recommendations.`
              : "Professional seasonal inspection with comprehensive checklist. Covers all major systems, identifies issues, documents conditions, and provides actionable recommendations.",
            materials_note: "All inspection tools and reporting included",
            is_fixed_price: true,
            estimated_timeline: isMultiUnit ? `${Math.ceil(inspectionHours)} hours on-site` : "1-2 hours on-site",
            pricing_note: isMultiUnit ? `$199 base + $35 per additional unit (${doorCount} units)` : "Fixed price for single-family home"
          }
        }));
        setEstimatingItems(prev => ({ ...prev, [item.id]: false }));
        return;
      }

      const estimationPrompt = `You are estimating a home service request for Handy Pioneers (internal rate: $150/hour, not shown to customer).

PROPERTY CONTEXT:
Address: ${property.address}
Type: ${property.property_type || 'Not specified'}
Climate: ${property.climate_zone || 'Pacific Northwest'}

SERVICE REQUEST:
Title: ${item.title}
System: ${item.system_type || 'General'}
Priority: ${item.priority}

DETAILED DESCRIPTION:
${item.description}

${item.customer_notes ? `CUSTOMER NOTES:\n${item.customer_notes}` : ''}

${item.photo_urls?.length > 0 ? `PHOTOS PROVIDED: ${item.photo_urls.length} (analyze for scope accuracy)` : 'NO PHOTOS - estimate conservatively'}

${item.preferred_timeline ? `CUSTOMER TIMELINE: ${item.preferred_timeline}` : ''}

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

      const result = await storage.invokeLLM({
        prompt: estimationPrompt,
        add_context_from_internet: false,
        file_urls: item.photo_urls?.length > 0 ? item.photo_urls : undefined,
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

      setItemEstimates(prev => ({ ...prev, [item.id]: result }));
      
      // Update cart item with new estimates
      await updateItemMutation.mutateAsync({
        itemId: item.id,
        updates: {
          estimated_hours: result.estimated_hours,
          estimated_cost_min: result.cost_min,
          estimated_cost_max: result.cost_max
        }
      });

    } catch (error) {
      console.error('AI estimation failed:', error);
      console.error('Error details:', error.message, error.response?.data);
      
      // Provide fallback estimate
      const fallbackHours = item.priority === 'Emergency' ? 3 : 
                           item.priority === 'High' ? 4 : 5;
      const urgencyMultiplier = item.priority === 'Emergency' ? 1.5 : 
                               item.priority === 'High' ? 1.25 : 1.0;
      
      const fallbackEstimate = {
        estimated_hours: fallbackHours * urgencyMultiplier,
        cost_min: Math.round(fallbackHours * 150 * urgencyMultiplier),
        cost_max: Math.round(fallbackHours * 150 * urgencyMultiplier * 1.4),
        detailed_scope: `Professional ${item.system_type || 'service'} - detailed scope will be determined during site assessment.`,
        materials_list: ['Materials to be determined on-site'],
        estimated_timeline: `${fallbackHours}-${fallbackHours + 2} hours`,
        risk_factors: ['Final scope may vary based on actual conditions'],
        is_fallback: true
      };
      
      setItemEstimates(prev => ({ ...prev, [item.id]: fallbackEstimate }));
      
      await updateItemMutation.mutateAsync({
        itemId: item.id,
        updates: {
          estimated_hours: fallbackEstimate.estimated_hours,
          estimated_cost_min: fallbackEstimate.cost_min,
          estimated_cost_max: fallbackEstimate.cost_max
        }
      });
      
      // Show improved message
      alert(`💡 Basic Estimate Generated\n\nWe've created a preliminary estimate based on typical ${item.system_type || 'service'} work.\n\n⚠️ IMPORTANT: This AI estimate is NOT a final quote. Your operator will provide official pricing after reviewing your request.\n\nFor a MORE ACCURATE AI estimate:\n• Click "Edit details" and add specific information\n• Include access instructions and exact locations\n• Upload photos of the issue/area\n• Describe any complications or special requirements\n• Then click "Refresh Estimate" to regenerate\n\nThe more details you provide, the better the AI can estimate the true scope and cost!`);
    } finally {
      setEstimatingItems(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const handleStartEditItem = (item) => {
    setEditingItemId(item.id);
    setEditFormData({
      title: item.title,
      description: item.description,
      customer_notes: item.customer_notes || '',
      priority: item.priority,
      preferred_timeline: item.preferred_timeline || ''
    });
  };

  const handleSaveItemEdit = async (itemId) => {
    try {
      await updateItemMutation.mutateAsync({
        itemId,
        updates: editFormData
      });
      setEditingItemId(null);
      setEditFormData({});
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleCancelItemEdit = () => {
    setEditingItemId(null);
    setEditFormData({});
  };

  const handleGeneratePDF = async () => {
    setGeneratingPDF(true);
    try {
      const property = properties.find(p => p.id === cartItems[0].property_id);
      
      const pdfContent = `
SERVICE REQUEST ESTIMATE
========================

Property: ${property?.address || 'N/A'}
Customer: ${user?.full_name} (${user?.email})
Date: ${new Date().toLocaleDateString()}

${operatorInfo?.available ? 
`360° Method Operator: ${operatorInfo.operator}
Contact: ${operatorInfo.contact?.phone}
Email: ${operatorInfo.contact?.email}` : 
`No 360° Method Operator in area - use with your preferred contractor`}

SERVICES REQUESTED
------------------

${cartItems.map((item, idx) => `
${idx + 1}. ${item.title}
   System: ${item.system_type || 'General'}
   Priority: ${item.priority}
   
   Description:
   ${item.description}
   
   ${item.customer_notes ? `Notes: ${item.customer_notes}\n` : ''}
   Estimated Time: ${item.estimated_hours?.toFixed(1) || '?'} hours
   Estimated Cost: $${item.estimated_cost_min?.toLocaleString() || '?'} - $${item.estimated_cost_max?.toLocaleString() || '?'}
   ${item.preferred_timeline ? `Timeline: ${item.preferred_timeline}` : ''}
   ${item.photo_urls?.length ? `Photos: ${item.photo_urls.length} attached` : ''}
`).join('\n---\n')}

COST SUMMARY
------------
Total Estimated Hours: ${totalHours.toFixed(1)}
Base Cost Range: $${totalCostMin.toLocaleString()} - $${totalCostMax.toLocaleString()}

${isMember ? `
MEMBER BENEFITS APPLIED:
- ${memberDiscountPercent}% Discount: -$${Math.round(memberDiscountAmount).toLocaleString()}
${hoursFromBucket > 0 ? `- Hour Bucket (${hoursFromBucket.toFixed(1)} hrs): -$${hourBucketSavings.toLocaleString()}` : ''}
- Total Savings: $${Math.round(memberDiscountAmount + hourBucketSavings).toLocaleString()}

YOUR FINAL COST: $${Math.round(finalCostMin).toLocaleString()} - $${Math.round(finalCostMax).toLocaleString()}
` : `
ESTIMATED TOTAL: $${Math.round((totalCostMin + totalCostMax) / 2).toLocaleString()}
`}

${preferredStartDate ? `Preferred Start Date: ${preferredStartDate}` : ''}

${customerNotes ? `
ADDITIONAL NOTES:
${customerNotes}
` : ''}

---

⚠️ IMPORTANT DISCLAIMERS:
- These are AI-generated estimates based on typical project costs
- Final pricing will vary based on actual site conditions, materials, and scope
- Not a binding quote - contractor will provide final pricing after inspection
${operatorInfo?.available ? '' : `
- This estimate can be used with any licensed contractor
- Learn more about becoming a 360° Method Operator: www.360method.com/operators
`}

Generated by 360° Method Command Center
www.360method.com
      `.trim();

      // Create a blob and download
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Service-Estimate-${property?.address?.replace(/[^a-z0-9]/gi, '-')}-${new Date().getTime()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate estimate file. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleSubmit = async () => {
    if (!packageName.trim()) {
      alert('Please enter a package name');
      return;
    }

    if (!operatorInfo?.available) {
      alert('No 360° Method Operator available in your area. Download the estimate to use with your own contractor.');
      return;
    }

    setSubmitting(true);

    try {
      const property = properties.find(p => p.id === cartItems[0].property_id);

      // Build line items for the checkout
      const lineItems = cartItems.map(item => ({
        id: item.id,
        title: item.task_title || item.title,
        description: item.description,
        hours: item.estimated_hours || 1,
        cost: item.estimated_cost || 0
      }));

      // Call the Stripe checkout edge function
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'createServicePaymentCheckout',
        {
          body: {
            user_id: authUser?.id,
            user_email: authUser?.email || user?.email,
            user_name: user?.full_name || authUser?.firstName,
            property_id: cartItems[0].property_id,
            package_name: packageName,
            line_items: lineItems,
            total_amount: finalCostMin, // Use the discounted price
            total_hours: totalHours,
            customer_notes: customerNotes,
            preferred_start_date: preferredStartDate,
            success_url: `${window.location.origin}${createPageUrl('Dashboard')}?payment=success`,
            cancel_url: `${window.location.origin}${createPageUrl('CartReview')}?payment=cancelled`
          }
        }
      );

      if (checkoutError) {
        throw new Error(checkoutError.message || 'Failed to create checkout session');
      }

      if (!checkoutData?.success || !checkoutData?.checkout_url) {
        throw new Error(checkoutData?.error || 'Failed to create checkout session');
      }

      // Update cart items with the package ID
      if (checkoutData.package_id) {
        const updatePromises = cartItems.map(item =>
          CartItem.update(item.id, {
            status: 'pending_payment',
            package_id: checkoutData.package_id
          })
        );
        await Promise.all(updatePromises);
      }

      // Redirect to Stripe Checkout
      window.location.href = checkoutData.checkout_url;

    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to proceed to payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle payment success/cancel from URL params
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const packageId = urlParams.get('package_id');

    if (paymentStatus === 'success') {
      // Clear cart and show success message
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      alert('Payment successful! Your service package has been submitted.');
      // Clean URL
      window.history.replaceState({}, '', createPageUrl('CartReview'));
    } else if (paymentStatus === 'cancelled' && packageId) {
      // Optionally handle cancelled payment - mark package as cancelled
      console.log('Payment cancelled for package:', packageId);
      alert('Payment was cancelled. Your cart items are still saved.');
      // Clean URL
      window.history.replaceState({}, '', createPageUrl('CartReview'));
    }
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#1B365D' }}>
              Your Cart is Empty
            </h2>
            <p className="text-gray-600 mb-6">
              Add services to get started
            </p>
            <Button
              asChild
              style={{ backgroundColor: '#8B5CF6', minHeight: '48px' }}
            >
              <a href={createPageUrl('Prioritize')}>Browse Services</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const property = properties.find(p => p.id === cartItems[0].property_id);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B365D' }}>
            Review Your Cart
          </h1>
          <p className="text-gray-600">
            {cartItems.length} service{cartItems.length !== 1 ? 's' : ''} • {property?.address || 'Property'}
          </p>
        </div>

        {/* AI Estimating Banner */}
        {aiEstimating && (
          <Card className="border-2 border-purple-300 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                <div>
                  <h3 className="font-bold text-purple-900">AI Estimating Your Cart...</h3>
                  <p className="text-sm text-gray-700">Calculating accurate time and cost estimates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Package Details - Moved to Top */}
        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-6 h-6 text-blue-600" />
              Service Request Information
            </CardTitle>
            <p className="text-sm text-gray-600">
              Help us serve you better by providing details about your request
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-bold text-gray-700 mb-2 block">
                  Package Name *
                </Label>
                <Input
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="e.g., Spring Maintenance, Emergency Repairs"
                  style={{ backgroundColor: '#FFFFFF', minHeight: '48px' }}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Give this request a memorable name
                </p>
              </div>
              <div>
                <Label className="text-sm font-bold text-gray-700 mb-2 block">
                  Preferred Start Date
                </Label>
                <Input
                  type="date"
                  value={preferredStartDate}
                  onChange={(e) => setPreferredStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ backgroundColor: '#FFFFFF', minHeight: '48px' }}
                />
                <p className="text-xs text-gray-600 mt-1">
                  When would you like work to begin?
                </p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-2 block">
                Additional Information for Our Team
              </Label>
              <Textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Examples:&#10;• Gate code: 1234, park in driveway&#10;• Tenant occupied - call 24hrs ahead: (555) 123-4567&#10;• Dog in backyard - needs to be secured&#10;• Work can only be done on weekdays 9am-3pm&#10;• Prefer eco-friendly materials when possible"
                rows={5}
                style={{ backgroundColor: '#FFFFFF', minHeight: '120px' }}
              />
              <div className="mt-2 space-y-2">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-yellow-900 mb-1">
                    💡 Pro Tip: The more specific, the better!
                  </p>
                  <ul className="text-xs text-gray-700 space-y-0.5 ml-3">
                    <li>• Access codes, parking, keys</li>
                    <li>• Tenant/occupancy information</li>
                    <li>• Scheduling constraints</li>
                    <li>• Special requirements or preferences</li>
                    <li>• Anything that helps us do the job right</li>
                  </ul>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-orange-900 mb-1">
                    ⚠️ Important: AI Estimates Are Preliminary
                  </p>
                  <p className="text-xs text-gray-700">
                    All estimates shown are AI-generated and may not reflect actual costs. Your operator will provide an official quote after reviewing your request and may need to visit the site for accurate pricing.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Operator Info Bubble */}
            {operatorInfo && (
              <Card className={`border-2 ${operatorInfo.available ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'}`}>
                <CardContent className="p-4">
                  {operatorInfo.available ? (
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-green-900 mb-1">
                          ✓ {operatorInfo.operator} Services Your Area
                        </h3>
                        <p className="text-sm text-gray-700 mb-2">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {operatorInfo.area}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="flex items-center gap-1 text-gray-700">
                            <Phone className="w-3 h-3" />
                            {operatorInfo.contact?.phone}
                          </span>
                          <span className="flex items-center gap-1 text-gray-700">
                            <Mail className="w-3 h-3" />
                            {operatorInfo.contact?.email}
                          </span>
                        </div>
                        {!isMember && (
                          <div className="mt-3 p-2 bg-white rounded border border-green-200">
                            <p className="text-xs font-semibold text-green-900 mb-1">
                              💡 Become a Member & Save
                            </p>
                            <p className="text-xs text-gray-700 mb-2">
                              Get 10-20% off + included hours. This cart: save ${Math.round((totalCostMin + totalCostMax) / 2 * 0.15).toLocaleString()}
                            </p>
                            <Button asChild size="sm" variant="outline" className="w-full">
                              <a href={createPageUrl('Pricing')}>View Plans</a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-bold text-orange-900 mb-2">
                        No 360° Operator in {property?.city || 'Your Area'} Yet
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        Download your estimate below to use with any contractor. Want 360° Method service? Get notified when we're in your area!
                      </p>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline" className="flex-1">
                          <a href={createPageUrl('FindOperator')}>Notify Me</a>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="flex-1">
                          <a href="https://360method.com/operators" target="_blank">Become an Operator</a>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Cart Items - Compact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Your Services ({cartItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cartItems.map((item, idx) => {
                  const estimate = itemEstimates[item.id];
                  const isEstimating = estimatingItems[item.id];
                  const isEditing = editingItemId === item.id;
                  const isExpanded = expandedItems[item.id];

                  return (
                    <div
                      key={item.id}
                      className="border-2 rounded-lg p-4 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex gap-3">
                        {/* Icon/Image */}
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.photo_urls && item.photo_urls.length > 0 ? (
                            <img 
                              src={item.photo_urls[0]} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">
                              {item.system_type === 'HVAC System' ? '❄️' :
                               item.system_type === 'Plumbing System' ? '🚰' :
                               item.system_type === 'Electrical System' ? '⚡' :
                               item.system_type === 'Roof System' ? '🏠' :
                               item.priority === 'Emergency' || item.priority === 'High' ? '⚠️' : '🔧'}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold">{item.title}</h3>
                            <button
                              onClick={() => deleteItemMutation.mutate(item.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0 ml-2"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {item.priority && (
                              <Badge className={
                                item.priority === 'Emergency' ? 'bg-red-600' :
                                item.priority === 'High' ? 'bg-orange-600' :
                                'bg-blue-600'
                              }>
                                {item.priority}
                              </Badge>
                            )}
                            {(item.estimated_cost_min && item.estimated_cost_max) && (
                              <span className="text-sm font-semibold text-purple-700">
                                ${item.estimated_cost_min.toLocaleString()} - ${item.estimated_cost_max.toLocaleString()}
                              </span>
                            )}
                            {item.estimated_hours && (
                              <span className="text-xs text-gray-600">
                                {item.estimated_hours.toFixed(1)} hrs
                              </span>
                            )}
                          </div>

                          {/* Expandable Details */}
                          <button
                            onClick={() => toggleItemExpand(item.id)}
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                Hide details
                              </>
                            ) : (
                              <>
                                <ChevronRight className="w-4 h-4" />
                                View & edit details
                              </>
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t space-y-4">
                              {isEditing ? (
                                <>
                                  {/* Editing Mode */}
                                  <div className="space-y-3">
                                    <div>
                                      <Label className="text-xs font-semibold">Title</Label>
                                      <Input
                                        value={editFormData.title}
                                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                        style={{ minHeight: '40px' }}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs font-semibold">Description</Label>
                                      <Textarea
                                        value={editFormData.description}
                                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                        rows={3}
                                        style={{ minHeight: '72px' }}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs font-semibold">Additional Details</Label>
                                      <Textarea
                                        value={editFormData.customer_notes}
                                        onChange={(e) => setEditFormData({ ...editFormData, customer_notes: e.target.value })}
                                        placeholder="Gate codes, access instructions, specific requirements..."
                                        rows={3}
                                        style={{ minHeight: '72px' }}
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleSaveItemEdit(item.id)}
                                        size="sm"
                                        className="gap-1"
                                        style={{ backgroundColor: '#28A745' }}
                                      >
                                        <Save className="w-4 h-4" />
                                        Save
                                      </Button>
                                      <Button
                                        onClick={handleCancelItemEdit}
                                        size="sm"
                                        variant="outline"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  {/* View Mode */}
                                  <div>
                                    <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                                    {item.system_type && (
                                      <p className="text-xs text-gray-600 mb-1">System: {item.system_type}</p>
                                    )}
                                    {item.customer_notes && (
                                      <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                                        <p className="text-xs font-semibold text-blue-900">Your Notes:</p>
                                        <p className="text-xs text-gray-800">{item.customer_notes}</p>
                                      </div>
                                    )}
                                    {item.preferred_timeline && (
                                      <p className="text-xs text-gray-600 mb-2">Timeline: {item.preferred_timeline}</p>
                                    )}
                                    <Button
                                      onClick={() => handleStartEditItem(item)}
                                      size="sm"
                                      variant="outline"
                                      className="gap-1 mb-3"
                                    >
                                      <Edit className="w-3 h-3" />
                                      Edit details
                                    </Button>
                                  </div>

                                  {item.photo_urls && item.photo_urls.length > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                      {item.photo_urls.map((url, photoIdx) => (
                                        <img
                                          key={photoIdx}
                                          src={url}
                                          alt={`Photo ${photoIdx + 1}`}
                                          className="w-20 h-20 object-cover rounded border-2 border-gray-200 cursor-pointer hover:border-purple-400"
                                          onClick={() => window.open(url, '_blank')}
                                        />
                                      ))}
                                    </div>
                                  )}

                                  {/* AI Estimate Button */}
                                  <div className="border-t pt-3">
                                    <Button
                                      onClick={() => handleGetItemEstimate(item)}
                                      disabled={isEstimating}
                                      className="w-full gap-2"
                                      style={{ backgroundColor: '#FF6B35', minHeight: '48px' }}
                                    >
                                      {isEstimating ? (
                                        <>
                                          <Sparkles className="w-5 h-5 animate-spin" />
                                          AI Analyzing...
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-5 h-5" />
                                          {estimate ? 'Refresh Estimate' : 'Get Detailed Estimate'}
                                        </>
                                      )}
                                    </Button>
                                  </div>

                                  {/* AI Estimate Results */}
                                  {estimate && (
                                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 space-y-3">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="w-5 h-5 text-blue-600" />
                                        <h4 className="font-bold text-blue-900">Detailed Estimate</h4>
                                        {estimate.is_fixed_price && (
                                          <Badge className="bg-green-600 text-white text-xs">Fixed Price</Badge>
                                        )}
                                        {estimate.pricing_note && (
                                          <p className="text-xs text-gray-600 italic">{estimate.pricing_note}</p>
                                        )}
                                      </div>

                                      {/* Time & Cost */}
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-white rounded p-2">
                                          <div className="flex items-center gap-1 mb-1">
                                            <Clock className="w-3 h-3 text-gray-600" />
                                            <span className="text-xs font-semibold text-gray-600">Time</span>
                                          </div>
                                          <p className="text-xl font-bold text-gray-900">{estimate.estimated_hours.toFixed(1)} hrs</p>
                                        </div>
                                        <div className="bg-white rounded p-2">
                                          <div className="flex items-center gap-1 mb-1">
                                            <DollarSign className="w-3 h-3 text-gray-600" />
                                            <span className="text-xs font-semibold text-gray-600">Cost</span>
                                          </div>
                                          <p className="text-base font-bold text-gray-900">
                                            ${estimate.cost_min.toLocaleString()} - ${estimate.cost_max.toLocaleString()}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Member Benefits */}
                                      {isMember && !estimate.is_fixed_price && (
                                        <div className="bg-green-50 border border-green-300 rounded p-2">
                                          <div className="flex items-center gap-1 mb-1">
                                            <Crown className="w-3 h-3 text-green-700" />
                                            <span className="text-xs font-bold text-green-900">Your Member Benefits</span>
                                          </div>
                                          <div className="space-y-1 text-xs">
                                            <div className="flex justify-between">
                                              <span>Discount ({memberDiscountPercent}%):</span>
                                              <span className="font-semibold text-green-700">
                                                -${Math.round(((estimate.cost_min + estimate.cost_max) / 2) * (memberDiscountPercent / 100)).toLocaleString()}
                                              </span>
                                            </div>
                                            {hourBucket.remaining > 0 && (
                                              <div className="flex justify-between">
                                                <span>Available Hours:</span>
                                                <span className="font-semibold text-green-700">
                                                  {hourBucket.remaining.toFixed(1)} / {hourBucket.total} hrs
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Scope */}
                                      {estimate.detailed_scope && (
                                        <div className="bg-white rounded p-2">
                                          <p className="text-xs font-semibold text-gray-700 mb-1">Scope of Work:</p>
                                          <p className="text-xs text-gray-800">{estimate.detailed_scope}</p>
                                        </div>
                                      )}

                                      {/* Materials */}
                                      {estimate.materials_list && estimate.materials_list.length > 0 && (
                                        <div className="bg-white rounded p-2">
                                          <p className="text-xs font-semibold text-gray-700 mb-1">Materials:</p>
                                          <ul className="text-xs text-gray-800 space-y-0.5">
                                            {estimate.materials_list.slice(0, 3).map((material, idx) => (
                                              <li key={idx}>• {material}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      {/* Risk Factors */}
                                      {estimate.risk_factors && estimate.risk_factors.length > 0 && (
                                        <div className="bg-orange-50 border border-orange-200 rounded p-2">
                                          <p className="text-xs font-semibold text-orange-900 mb-1">⚠️ Potential Issues:</p>
                                          <ul className="text-xs text-gray-800 space-y-0.5">
                                            {estimate.risk_factors.slice(0, 2).map((risk, idx) => (
                                              <li key={idx}>• {risk}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      {estimate.estimated_timeline && (
                                        <p className="text-xs text-gray-600">Timeline: {estimate.estimated_timeline}</p>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>


          </div>

          {/* Right Column - Summary & Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* AI Disclaimer at Top */}
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-900 mb-1">
                      AI Estimates - Not Final Quotes
                    </p>
                    <p className="text-xs text-red-800 leading-relaxed">
                      All estimates are AI-generated for planning. Your operator provides official pricing after reviewing conditions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cost Summary */}
              <Card className="border-2 border-purple-300">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-semibold">{cartItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Est. Hours:</span>
                      <span className="font-semibold">{totalHours.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span>Base Cost:</span>
                      <span className="font-semibold">
                        ${totalCostMin.toLocaleString()} - ${totalCostMax.toLocaleString()}
                      </span>
                    </div>
                    {isMember && (
                      <>
                        <div className="flex justify-between text-green-700">
                          <span>Discount ({memberDiscountPercent}%):</span>
                          <span className="font-semibold">-${Math.round(memberDiscountAmount).toLocaleString()}</span>
                        </div>
                        {hoursFromBucket > 0 && (
                          <div className="flex justify-between text-green-700">
                            <span>Hour Bucket:</span>
                            <span className="font-semibold">-${hourBucketSavings.toLocaleString()}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t" style={{ color: '#8B5CF6' }}>
                    <span>Est. Total:</span>
                    <span>${Math.round((finalCostMin + finalCostMax) / 2).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-orange-600 font-semibold italic">
                    * AI estimate - not a binding quote
                  </p>
                  {isMember && (memberDiscountAmount + hourBucketSavings) > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
                      <p className="text-sm font-semibold text-green-900">You Save</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${Math.round(memberDiscountAmount + hourBucketSavings).toLocaleString()}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 text-center pt-2">
                    ⚠️ Preliminary estimate. Final quote after review.
                  </p>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                {operatorInfo?.available ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !packageName.trim()}
                    className="w-full gap-2"
                    style={{ backgroundColor: '#28A745', minHeight: '56px' }}
                  >
                    {submitting ? (
                      <>
                        <Sparkles className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Submit to {operatorInfo.operator}
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                    <p className="text-sm font-semibold text-orange-900 mb-2">
                      No operator in your area
                    </p>
                    <p className="text-xs text-gray-700 mb-3">
                      Download estimate to use with your contractor
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleGeneratePDF}
                  disabled={generatingPDF}
                  variant="outline"
                  className="w-full gap-2"
                  style={{ minHeight: '48px' }}
                >
                  {generatingPDF ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Estimate
                    </>
                  )}
                </Button>

                {user?.saved_payment_method ? (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <div className="text-xs">
                      <p className="font-semibold text-blue-900">Card on file</p>
                      <p className="text-gray-600">•••• {user.saved_payment_method.last4}</p>
                    </div>
                  </div>
                ) : !operatorInfo?.available && (
                  <p className="text-xs text-center text-gray-600">
                    No payment needed - use estimate with any contractor
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}