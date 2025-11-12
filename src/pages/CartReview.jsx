import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tantml:react-query";
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
  X
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

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cartItems'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.CartItem.filter({ 
        created_by: user.email,
        status: 'in_cart'
      }, '-created_date');
    },
    enabled: !!user,
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId) => base44.entities.CartItem.delete(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, updates }) => base44.entities.CartItem.update(itemId, updates),
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

      const packageData = {
        property_id: cartItems[0].property_id,
        package_name: packageName,
        item_count: cartItems.length,
        total_estimated_hours: totalHours,
        total_estimated_cost_min: totalCostMin,
        total_estimated_cost_max: totalCostMax,
        member_discount_percent: memberDiscountPercent,
        member_discount_amount: memberDiscountAmount,
        hours_from_bucket: hoursFromBucket,
        final_cost_min: finalCostMin,
        final_cost_max: finalCostMax,
        customer_notes: customerNotes,
        preferred_start_date: preferredStartDate,
        status: 'submitted',
        operator_id: user?.assigned_operator_id
      };

      const servicePackage = await base44.entities.ServicePackage.create(packageData);

      const updatePromises = cartItems.map(item =>
        base44.entities.CartItem.update(item.id, {
          status: 'submitted',
          package_id: servicePackage.id
        })
      );
      await Promise.all(updatePromises);

      if (isMember && hoursFromBucket > 0) {
        await base44.auth.updateMe({
          hour_bucket: {
            ...hourBucket,
            used: (hourBucket.used || 0) + hoursFromBucket,
            remaining: (hourBucket.remaining || 0) - hoursFromBucket
          }
        });
      }

      await base44.integrations.Core.SendEmail({
        to: operatorInfo.contact?.email || 'operator@example.com',
        subject: `New Service Package Request - ${packageName}`,
        body: `Service package #${servicePackage.id} submitted by ${user.full_name}`
      });

      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      alert('✅ Service package submitted successfully! Your operator will contact you soon.');
      window.location.href = createPageUrl('Dashboard');

    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit package. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
                        Download your estimate below to use with any contractor. Want 360° Method service? Join the waitlist!
                      </p>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline" className="flex-1">
                          <a href={createPageUrl('FindOperator')}>Join Waitlist</a>
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
                {cartItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="border-2 rounded-lg p-3 hover:border-purple-300 transition-colors"
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
                          {expandedItems[item.id] ? (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Hide details
                            </>
                          ) : (
                            <>
                              <ChevronRight className="w-4 h-4" />
                              View details
                            </>
                          )}
                        </button>

                        {expandedItems[item.id] && (
                          <div className="mt-3 pt-3 border-t space-y-2">
                            <p className="text-sm text-gray-700">{item.description}</p>
                            {item.system_type && (
                              <p className="text-xs text-gray-600">System: {item.system_type}</p>
                            )}
                            {item.customer_notes && (
                              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                                <p className="text-xs font-semibold text-blue-900">Your Notes:</p>
                                <p className="text-xs text-gray-800">{item.customer_notes}</p>
                              </div>
                            )}
                            {item.preferred_timeline && (
                              <p className="text-xs text-gray-600">Timeline: {item.preferred_timeline}</p>
                            )}
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
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Package Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Package Name *</Label>
                  <Input
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="e.g., Spring Maintenance, Emergency Repairs"
                    style={{ backgroundColor: '#FFFFFF', minHeight: '48px' }}
                  />
                </div>
                <div>
                  <Label>Preferred Start Date</Label>
                  <Input
                    type="date"
                    value={preferredStartDate}
                    onChange={(e) => setPreferredStartDate(e.target.value)}
                    style={{ backgroundColor: '#FFFFFF', minHeight: '48px' }}
                  />
                </div>
                <div>
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Access instructions, special requirements..."
                    rows={4}
                    style={{ backgroundColor: '#FFFFFF', minHeight: '96px' }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
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
                    <span>Your Cost:</span>
                    <span>${Math.round((finalCostMin + finalCostMax) / 2).toLocaleString()}</span>
                  </div>
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