import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  ShoppingCart, 
  Trash2, 
  Send, 
  Sparkles, 
  Clock, 
  DollarSign,
  Gift,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Calendar,
  Crown
} from "lucide-react";
import { estimateCartItems } from "../components/cart/AIEstimator";
import { format } from "date-fns";

export default function CartReview() {
  const [aiEstimating, setAiEstimating] = React.useState(false);
  const [aiEstimates, setAiEstimates] = React.useState(null);
  const [packageName, setPackageName] = React.useState('');
  const [customerNotes, setCustomerNotes] = React.useState('');
  const [preferredStartDate, setPreferredStartDate] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

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
      const items = await base44.entities.CartItem.filter({ 
        status: 'in_cart',
        created_by: user?.email 
      });
      return items || [];
    },
    enabled: !!user,
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id) => base44.entities.CartItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CartItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    },
  });

  // Check membership status
  const isMember = user && (
    user.subscription_tier?.includes('homecare') || 
    user.subscription_tier?.includes('propertycare')
  );

  const memberDiscountPercent = user?.member_discount_percent || 15;
  const hourBucketTotal = user?.hour_bucket_total || 0;
  const hourBucketUsed = user?.hour_bucket_used || 0;
  const hourBucketRemaining = user?.hour_bucket_remaining || 0;

  // Run AI estimation automatically
  React.useEffect(() => {
    const runEstimation = async () => {
      if (cartItems.length > 0 && !aiEstimates && properties.length > 0) {
        setAiEstimating(true);
        try {
          const propertyId = cartItems[0]?.property_id;
          const property = properties.find(p => p.id === propertyId);
          
          if (property) {
            const estimates = await estimateCartItems(cartItems, property);
            setAiEstimates(estimates);
            
            // Update cart items with estimates
            for (let i = 0; i < cartItems.length; i++) {
              const estimate = estimates.estimates[i];
              if (estimate) {
                await updateItemMutation.mutateAsync({
                  id: cartItems[i].id,
                  data: {
                    estimated_hours: estimate.estimated_hours,
                    estimated_cost_min: estimate.cost_min,
                    estimated_cost_max: estimate.cost_max
                  }
                });
              }
            }
          }
        } catch (error) {
          console.error('Estimation failed:', error);
        } finally {
          setAiEstimating(false);
        }
      }
    };

    runEstimation();
  }, [cartItems.length, properties.length]);

  // Calculate totals
  const totalHours = cartItems.reduce((sum, item) => sum + (item.estimated_hours || 0), 0);
  const totalCostMin = cartItems.reduce((sum, item) => sum + (item.estimated_cost_min || 0), 0);
  const totalCostMax = cartItems.reduce((sum, item) => sum + (item.estimated_cost_max || 0), 0);

  // Member calculations
  const hoursFromBucket = Math.min(totalHours, hourBucketRemaining);
  const hoursCostSavings = hoursFromBucket * 150;
  const memberDiscountAmount = Math.round((totalCostMin + totalCostMax) / 2 * (memberDiscountPercent / 100));
  const totalSavings = hoursCostSavings + memberDiscountAmount;
  const finalCostMin = Math.max(0, totalCostMin - memberDiscountAmount - hoursCostSavings);
  const finalCostMax = Math.max(0, totalCostMax - memberDiscountAmount - hoursCostSavings);

  // Non-member potential savings
  const potentialMemberSavings = Math.round((totalCostMin + totalCostMax) / 2 * 0.15) + (Math.min(totalHours, 10) * 150);

  const handleSubmit = async () => {
    if (cartItems.length === 0 || !packageName) return;
    
    setSubmitting(true);
    try {
      // Create service package
      const packageData = {
        property_id: cartItems[0].property_id,
        package_name: packageName || `Service Package ${format(new Date(), 'MM/dd/yyyy')}`,
        item_count: cartItems.length,
        total_estimated_hours: totalHours,
        total_estimated_cost_min: totalCostMin,
        total_estimated_cost_max: totalCostMax,
        member_discount_percent: isMember ? memberDiscountPercent : 0,
        member_discount_amount: isMember ? memberDiscountAmount : 0,
        hours_from_bucket: isMember ? hoursFromBucket : 0,
        final_cost_min: isMember ? finalCostMin : totalCostMin,
        final_cost_max: isMember ? finalCostMax : totalCostMax,
        customer_notes: customerNotes,
        preferred_start_date: preferredStartDate,
        urgency: cartItems.some(i => i.priority === 'Emergency') ? 'Emergency' : 
                 cartItems.some(i => i.priority === 'High') ? 'High' : 'Medium',
        status: 'submitted'
      };

      const servicePackage = await base44.entities.ServicePackage.create(packageData);

      // Update all cart items to reference this package
      for (const item of cartItems) {
        await updateItemMutation.mutateAsync({
          id: item.id,
          data: {
            status: 'submitted',
            package_id: servicePackage.id
          }
        });
      }

      // Update member's hour bucket if applicable
      if (isMember && hoursFromBucket > 0) {
        await base44.auth.updateMe({
          hour_bucket_used: hourBucketUsed + hoursFromBucket,
          hour_bucket_remaining: hourBucketRemaining - hoursFromBucket
        });
      }

      // Send email to operator
      const property = properties.find(p => p.id === cartItems[0].property_id);
      
      const emailBody = `
NEW SERVICE PACKAGE REQUEST - #${servicePackage.id}

CUSTOMER: ${user.full_name || 'Not provided'}
EMAIL: ${user.email}
MEMBERSHIP: ${isMember ? user.subscription_tier : 'Non-Member'}

PROPERTY: ${property?.address || 'Not provided'}

PACKAGE: "${packageName}"
ITEMS: ${cartItems.length}
ESTIMATED HOURS: ${totalHours.toFixed(1)}
ESTIMATED COST: $${totalCostMin.toLocaleString()} - $${totalCostMax.toLocaleString()}

${isMember ? `
MEMBER BENEFITS APPLIED:
- Discount: ${memberDiscountPercent}% (-$${memberDiscountAmount.toLocaleString()})
- Hours from Bucket: ${hoursFromBucket.toFixed(1)} hours (-$${hoursCostSavings.toLocaleString()})
- Total Savings: $${totalSavings.toLocaleString()}
- Final Cost: $${finalCostMin.toLocaleString()} - $${finalCostMax.toLocaleString()}
` : ''}

PREFERRED START: ${preferredStartDate || 'Flexible'}
URGENCY: ${packageData.urgency}

CUSTOMER NOTES:
${customerNotes || 'None'}

ITEMS:
${cartItems.map((item, idx) => `
${idx + 1}. ${item.title}
   System: ${item.system_type || 'General'}
   Priority: ${item.priority}
   Hours: ${item.estimated_hours?.toFixed(1) || 'TBD'}
   Cost: $${item.estimated_cost_min?.toLocaleString() || '?'} - $${item.estimated_cost_max?.toLocaleString() || '?'}
   Description: ${item.description}
   Notes: ${item.customer_notes || 'None'}
   Photos: ${item.photo_urls?.length || 0}
`).join('\n')}

⚠️ AI DISCLAIMER: Cost estimates are AI-generated based on typical scenarios and $150/hour base rate. Actual costs may vary based on site conditions, materials pricing, scope changes, and unforeseen complications.

---
View in app: ServicePackage #${servicePackage.id}
      `;

      await base44.integrations.Core.SendEmail({
        from_name: 'Handy Pioneers Service Cart',
        to: 'services@handypioneers.com',
        subject: `New Service Package - ${cartItems.length} items - ${property?.address || 'Customer Request'}`,
        body: emailBody
      });

      // Redirect to success page
      alert(`Success! Your service package has been submitted.\n\nPackage ID: ${servicePackage.id}\n\nOur operator will review and contact you within 4 business hours with a detailed quote.`);
      
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      queryClient.invalidateQueries({ queryKey: ['servicePackages'] });
      window.location.href = createPageUrl('Dashboard');
      
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit service package. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                Add tasks, upgrades, or service requests to get started
              </p>
              <Button asChild>
                <a href={createPageUrl('Prioritize')}>Browse Services</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B365D' }}>
            Review Service Cart
          </h1>
          <p className="text-gray-600">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} ready for operator review
          </p>
        </div>

        {/* AI Estimation Status */}
        {aiEstimating && (
          <Card className="border-2 border-purple-300 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="animate-spin text-4xl">⚙️</div>
                <div>
                  <p className="font-semibold text-purple-900">AI analyzing your cart...</p>
                  <p className="text-sm text-gray-700">Calculating time and cost estimates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Member Status / Upgrade Prompt */}
            {isMember ? (
              <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Crown className="w-8 h-8 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                        Member Benefits Active
                        <Badge className="bg-green-600 text-white">
                          {user.subscription_tier}
                        </Badge>
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-700 mb-1">💰 Member Discount: <strong>{memberDiscountPercent}%</strong></p>
                          <p className="text-gray-700">Saves: <strong className="text-green-700">${memberDiscountAmount.toLocaleString()}</strong></p>
                        </div>
                        <div>
                          <p className="text-gray-700 mb-1">⏱️ Hour Bucket: <strong>{hourBucketRemaining.toFixed(1)} / {hourBucketTotal} hrs</strong></p>
                          <p className="text-gray-700">Using: <strong className="text-green-700">{hoursFromBucket.toFixed(1)} hrs (${hoursCostSavings.toLocaleString()})</strong></p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="font-bold text-green-900">
                          Total Savings: <span className="text-xl">${totalSavings.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Gift className="w-8 h-8 text-orange-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-bold text-orange-900 mb-2">
                        💡 Save ${potentialMemberSavings.toLocaleString()} with Membership
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        Members get 15% off all services + prepaid hour buckets. This cart would save you:
                      </p>
                      <div className="grid md:grid-cols-2 gap-3 text-sm mb-4">
                        <div className="bg-white p-3 rounded border border-orange-200">
                          <p className="text-gray-600 mb-1">15% Discount</p>
                          <p className="font-bold text-orange-700">-${Math.round((totalCostMin + totalCostMax) / 2 * 0.15).toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-3 rounded border border-orange-200">
                          <p className="text-gray-600 mb-1">Hour Bucket Savings</p>
                          <p className="font-bold text-orange-700">-${(Math.min(totalHours, 10) * 150).toLocaleString()}</p>
                        </div>
                      </div>
                      <Button
                        asChild
                        className="w-full md:w-auto"
                        style={{ backgroundColor: '#FF6B35' }}
                      >
                        <a href={createPageUrl('Pricing')}>View Membership Plans</a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cart Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Cart Items ({cartItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="border-2 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-400">#{idx + 1}</span>
                          <h3 className="font-semibold">{item.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {item.system_type && (
                            <Badge variant="outline">{item.system_type}</Badge>
                          )}
                          {item.priority && (
                            <Badge className={
                              item.priority === 'Emergency' ? 'bg-red-600' :
                              item.priority === 'High' ? 'bg-orange-600' :
                              'bg-blue-600'
                            }>
                              {item.priority}
                            </Badge>
                          )}
                          {item.photo_urls?.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              📷 {item.photo_urls.length} {item.photo_urls.length === 1 ? 'photo' : 'photos'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteItemMutation.mutate(item.id)}
                        className="text-red-600 hover:bg-red-50 rounded p-2 transition-colors"
                        style={{ minHeight: '40px', minWidth: '40px' }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{item.description}</p>
                    
                    {item.customer_notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Customer Notes:</p>
                        <p className="text-xs text-gray-800">{item.customer_notes}</p>
                      </div>
                    )}

                    {aiEstimates && aiEstimates.estimates[idx] && (
                      <div className="grid md:grid-cols-3 gap-3 mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{aiEstimates.estimates[idx].estimated_hours?.toFixed(1)} hrs</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">
                            ${item.estimated_cost_min?.toLocaleString()} - ${item.estimated_cost_max?.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {aiEstimates.estimates[idx].materials_note}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            {aiEstimates && (aiEstimates.bundle_discount_suggestion || aiEstimates.scheduling_suggestion) && (
              <Card className="border-2 border-blue-300 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-blue-900 mb-3">💡 AI Recommendations</h3>
                      {aiEstimates.bundle_discount_suggestion && (
                        <p className="text-sm text-gray-800 mb-2">
                          💰 {aiEstimates.bundle_discount_suggestion}
                        </p>
                      )}
                      {aiEstimates.scheduling_suggestion && (
                        <p className="text-sm text-gray-800">
                          📅 {aiEstimates.scheduling_suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Package Details Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Package Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Package Name</Label>
                  <Input
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="e.g., Spring Maintenance Bundle"
                    style={{ minHeight: '48px' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Give your package a name for easy reference
                  </p>
                </div>

                <div>
                  <Label>Preferred Start Date (Optional)</Label>
                  <Input
                    type="date"
                    value={preferredStartDate}
                    onChange={(e) => setPreferredStartDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    style={{ minHeight: '48px' }}
                  />
                </div>

                <div>
                  <Label>Additional Notes for Operator</Label>
                  <Textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Any special instructions, access details, scheduling preferences, etc."
                    rows={4}
                    style={{ minHeight: '96px' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The more details you provide, the more accurate the quote will be
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Cost Summary */}
              <Card className="border-2 border-indigo-300">
                <CardHeader>
                  <CardTitle className="text-lg">Cost Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Base Estimate */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Estimated Range:</span>
                      <span className="font-medium">${totalCostMin.toLocaleString()} - ${totalCostMax.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Total Hours:</span>
                      <span className="font-medium">{totalHours.toFixed(1)} hrs</span>
                    </div>
                  </div>

                  {/* Member Benefits */}
                  {isMember && (
                    <>
                      <div className="pt-3 border-t space-y-2">
                        <p className="text-xs font-semibold text-green-900 mb-2">Member Benefits Applied:</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Discount ({memberDiscountPercent}%):</span>
                          <span className="text-green-700 font-medium">-${memberDiscountAmount.toLocaleString()}</span>
                        </div>
                        {hoursFromBucket > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Hour Bucket ({hoursFromBucket.toFixed(1)} hrs):</span>
                            <span className="text-green-700 font-medium">-${hoursCostSavings.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">Your Cost:</span>
                          <span className="text-xl font-bold text-green-700">
                            ${finalCostMin.toLocaleString()} - ${finalCostMax.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-green-700 font-medium">
                          You're saving ${totalSavings.toLocaleString()}!
                        </p>
                      </div>
                    </>
                  )}

                  {/* Hour Bucket Progress */}
                  {isMember && hourBucketTotal > 0 && (
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Hour Bucket:</span>
                        <span className="font-medium">
                          {(hourBucketRemaining - hoursFromBucket).toFixed(1)} / {hourBucketTotal} hrs left
                        </span>
                      </div>
                      <Progress 
                        value={((hourBucketRemaining - hoursFromBucket) / hourBucketTotal) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="pt-3 border-t">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">
                        {aiEstimates?.disclaimer || 'Estimates are AI-generated. Final pricing after operator assessment.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={submitting || !packageName || cartItems.length === 0}
                className="w-full gap-2"
                style={{ backgroundColor: '#8B5CF6', minHeight: '56px', fontSize: '16px' }}
              >
                {submitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit to Operator
                  </>
                )}
              </Button>

              {/* What Happens Next */}
              <Card className="bg-blue-50 border-2 border-blue-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    What Happens Next:
                  </h3>
                  <ol className="text-sm text-gray-800 space-y-2 ml-6 list-decimal">
                    <li>Operator reviews your package within 4 hours</li>
                    <li>You receive detailed quote with breakdown</li>
                    <li>Schedule at your convenience</li>
                    <li>Work completed & tracked in app</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}