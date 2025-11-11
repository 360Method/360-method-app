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
  Crown,
  Edit,
  Image as ImageIcon
} from "lucide-react";
import { estimateCartItems } from "../components/cart/AIEstimator";
import EditCartItemDialog from "../components/cart/EditCartItemDialog";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";

export default function CartReview() {
  const [aiEstimating, setAiEstimating] = React.useState(false);
  const [aiEstimates, setAiEstimates] = React.useState(null);
  const [packageName, setPackageName] = React.useState('');
  const [customerNotes, setCustomerNotes] = React.useState('');
  const [preferredStartDate, setPreferredStartDate] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState(null);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

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

  const isMember = user && (
    user.subscription_tier?.includes('homecare') || 
    user.subscription_tier?.includes('propertycare')
  );

  const memberDiscountPercent = user?.subscription_tier?.includes('elite') ? 20 :
                                 user?.subscription_tier?.includes('premium') ? 15 :
                                 user?.subscription_tier?.includes('essential') ? 10 : 0;

  const hourBucket = user?.hour_bucket || { total: 0, used: 0, remaining: 0 };

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

  const totalHours = cartItems.reduce((sum, item) => sum + (item.estimated_hours || 0), 0);
  const totalCostMin = cartItems.reduce((sum, item) => sum + (item.estimated_cost_min || 0), 0);
  const totalCostMax = cartItems.reduce((sum, item) => sum + (item.estimated_cost_max || 0), 0);
  
  const memberDiscountAmount = isMember ? (totalCostMin + totalCostMax) / 2 * (memberDiscountPercent / 100) : 0;
  
  const hoursFromBucket = isMember ? Math.min(totalHours, hourBucket.remaining || 0) : 0;
  const hourBucketSavings = hoursFromBucket * 150;
  
  const finalCostMin = Math.max(0, totalCostMin - memberDiscountAmount - hourBucketSavings);
  const finalCostMax = Math.max(0, totalCostMax - memberDiscountAmount - hourBucketSavings);

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const handleSubmit = async () => {
    if (!packageName.trim()) {
      alert('Please enter a package name');
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

      const emailBody = `
NEW SERVICE PACKAGE REQUEST - #${servicePackage.id}

CUSTOMER: ${user.full_name} (${user.email})
MEMBERSHIP: ${user.subscription_tier || 'Non-member'}

PROPERTY: ${property?.address || 'N/A'}

PACKAGE: "${packageName}"
ITEMS: ${cartItems.length}
ESTIMATED HOURS: ${totalHours.toFixed(1)}
ESTIMATED COST: $${totalCostMin.toLocaleString()} - $${totalCostMax.toLocaleString()}

${isMember ? `MEMBER BENEFITS APPLIED:
- Discount: ${memberDiscountPercent}% (-$${Math.round(memberDiscountAmount).toLocaleString()})
- Hours from Bucket: ${hoursFromBucket.toFixed(1)} hours (-$${hourBucketSavings.toLocaleString()})
- Total Savings: $${Math.round(memberDiscountAmount + hourBucketSavings).toLocaleString()}
- Final Cost: $${Math.round(finalCostMin).toLocaleString()} - $${Math.round(finalCostMax).toLocaleString()}
` : ''}

PREFERRED START: ${preferredStartDate || 'Not specified'}

CUSTOMER NOTES:
${customerNotes || 'None'}

ITEMS:
${cartItems.map((item, idx) => `
${idx + 1}. ${item.system_type || 'General'}: ${item.title}
   Priority: ${item.priority}
   Hours: ${item.estimated_hours?.toFixed(1) || '?'}
   Cost: $${item.estimated_cost_min?.toLocaleString() || '?'} - $${item.estimated_cost_max?.toLocaleString() || '?'}
   Description: ${item.description}
   ${item.customer_notes ? `Notes: ${item.customer_notes}` : ''}
   ${item.photo_urls?.length > 0 ? `Photos: ${item.photo_urls.length}` : ''}
   ${item.preferred_timeline ? `Timeline: ${item.preferred_timeline}` : ''}
`).join('\n')}

⚠️ AI DISCLAIMER: Estimates based on $150/hr + materials. 
Actual costs vary based on site conditions.

---
View in app: ServicePackage #${servicePackage.id}
      `;

      await base44.integrations.Core.SendEmail({
        to: 'operator@example.com',
        subject: `New Service Package Request - ${packageName}`,
        body: emailBody
      });

      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      alert('✅ Service package submitted successfully! Your operator will review and provide a detailed quote.');
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
              Add services from AI suggestions, priority tasks, or upgrades to get started
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#1B365D' }}>
              Review Service Cart
            </h1>
            <p className="text-gray-600 mt-1">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} ready for review
            </p>
          </div>
        </div>

        {aiEstimating && (
          <Card className="border-2 border-purple-300 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                <div className="flex-1">
                  <h3 className="font-bold text-purple-900">AI Estimating Your Cart...</h3>
                  <p className="text-sm text-gray-700">Analyzing {cartItems.length} items for accurate time and cost estimates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {isMember && (
              <Card className="border-2 border-green-300 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Crown className="w-8 h-8 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-bold text-green-900 mb-1">👑 Member Benefits Active</h3>
                      <p className="text-sm text-gray-700">Your discounts are automatically applied</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">💰 Member Discount</p>
                      <p className="text-2xl font-bold text-green-700">{memberDiscountPercent}%</p>
                      <p className="text-xs text-gray-600">Saves ${Math.round(memberDiscountAmount).toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">⏱️ Hour Bucket</p>
                      <p className="text-2xl font-bold text-green-700">{hoursFromBucket.toFixed(1)} hrs</p>
                      <p className="text-xs text-gray-600">Saves ${hourBucketSavings.toLocaleString()}</p>
                      <Progress 
                        value={(hourBucket.remaining / hourBucket.total) * 100} 
                        className="mt-2 h-2"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        {hourBucket.remaining?.toFixed(1)} / {hourBucket.total} hrs remaining
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                            <Badge variant="outline" className="text-xs gap-1">
                              <ImageIcon className="w-3 h-3" />
                              {item.photo_urls.length}
                            </Badge>
                          )}
                          {item.preferred_timeline && (
                            <Badge variant="outline" className="text-xs">
                              📅 {item.preferred_timeline}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="text-blue-600 hover:bg-blue-50 rounded p-2 transition-colors"
                          style={{ minHeight: '40px', minWidth: '40px' }}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Remove this item from cart?')) {
                              deleteItemMutation.mutate(item.id);
                            }
                          }}
                          className="text-red-600 hover:bg-red-50 rounded p-2 transition-colors"
                          style={{ minHeight: '40px', minWidth: '40px' }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{item.description}</p>
                    
                    {item.customer_notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Customer Notes:</p>
                        <p className="text-xs text-gray-800">{item.customer_notes}</p>
                      </div>
                    )}

                    {item.photo_urls && item.photo_urls.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {item.photo_urls.slice(0, 4).map((url, photoIdx) => (
                          <img
                            key={photoIdx}
                            src={url}
                            alt={`Photo ${photoIdx + 1}`}
                            className="w-16 h-16 object-cover rounded border-2 border-gray-200 cursor-pointer hover:border-purple-400"
                            onClick={() => window.open(url, '_blank')}
                          />
                        ))}
                        {item.photo_urls.length > 4 && (
                          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border-2 border-gray-200 text-xs font-medium text-gray-600">
                            +{item.photo_urls.length - 4}
                          </div>
                        )}
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

            {aiEstimates?.bundle_discount_suggestion && (
              <Card className="border-2 border-blue-300 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900 mb-1">💡 AI Bundling Suggestion</p>
                      <p className="text-sm text-gray-800">{aiEstimates.bundle_discount_suggestion}</p>
                      {aiEstimates.scheduling_suggestion && (
                        <p className="text-sm text-gray-800 mt-1">📅 {aiEstimates.scheduling_suggestion}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Package Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Package Name *</Label>
                  <Input
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="e.g., Spring Maintenance Bundle, Emergency Repairs"
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
                  <Label>Additional Notes for Operator</Label>
                  <Textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Access instructions, scheduling preferences, special requirements..."
                    rows={4}
                    style={{ backgroundColor: '#FFFFFF', minHeight: '96px' }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <Card className="border-2 border-purple-300">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="text-lg">Cost Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Items:</span>
                    <span className="font-semibold">{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Est. Hours:</span>
                    <span className="font-semibold">{totalHours.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span>Base Cost:</span>
                    <span className="font-semibold">
                      ${totalCostMin.toLocaleString()} - ${totalCostMax.toLocaleString()}
                    </span>
                  </div>
                  {isMember && (
                    <>
                      <div className="flex justify-between text-sm text-green-700">
                        <span>Discount ({memberDiscountPercent}%):</span>
                        <span className="font-semibold">-${Math.round(memberDiscountAmount).toLocaleString()}</span>
                      </div>
                      {hoursFromBucket > 0 && (
                        <div className="flex justify-between text-sm text-green-700">
                          <span>Hour Bucket ({hoursFromBucket.toFixed(1)} hrs):</span>
                          <span className="font-semibold">-${hourBucketSavings.toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-3 border-t" style={{ color: '#8B5CF6' }}>
                    <span>Your Cost:</span>
                    <span>${Math.round(finalCostMin).toLocaleString()} - ${Math.round(finalCostMax).toLocaleString()}</span>
                  </div>
                  {isMember && (memberDiscountAmount + hourBucketSavings) > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
                      <p className="text-sm font-semibold text-green-900">💰 Total Savings</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${Math.round(memberDiscountAmount + hourBucketSavings).toLocaleString()}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 text-center pt-2">
                    {aiEstimates?.disclaimer || '⚠️ Estimates based on AI analysis. Final pricing after operator review.'}
                  </p>
                </CardContent>
              </Card>

              <Button
                onClick={handleSubmit}
                disabled={submitting || !packageName.trim()}
                className="w-full gap-2"
                style={{ backgroundColor: '#28A745', minHeight: '56px', fontSize: '18px' }}
              >
                {submitting ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit to Operator
                  </>
                )}
              </Button>

              {!isMember && (
                <Card className="border-2 border-orange-300 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Gift className="w-6 h-6 text-orange-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-orange-900 mb-2">💡 Save with Membership</p>
                        <p className="text-sm text-gray-700 mb-3">
                          This cart would save you ${Math.round((totalCostMin + totalCostMax) / 2 * 0.15).toLocaleString()} with a membership
                        </p>
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          <a href={createPageUrl('Pricing')}>View Plans</a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditCartItemDialog
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingItem(null);
        }}
        item={editingItem}
      />
    </div>
  );
}