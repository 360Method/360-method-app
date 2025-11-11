
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, DollarSign, TrendingUp, Clock, Home, Star, Sparkles, Calendar, Shield, AlertTriangle, Wrench, PhoneCall } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { calculateMemberSavings, getAllTierSavings, getTierDisplayName } from "@/utils/memberDiscounts";

export default function TemplateDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const templateId = searchParams.get('id');

  const { data: template } = useQuery({
    queryKey: ['upgrade-template', templateId],
    queryFn: async () => {
      const templates = await base44.entities.UpgradeTemplate.list();
      return templates.find(t => t.id === templateId);
    },
    enabled: !!templateId,
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const currentTier = user?.subscription_tier || 'free';
  const isServiceMember = currentTier.includes('homecare') || currentTier.includes('propertycare');

  const handleStartProject = () => {
    navigate(createPageUrl("Upgrade") + "?new=true&template=" + templateId);
  };

  const handleRequestQuote = () => {
    // Navigate to services or show quote request dialog
    navigate(createPageUrl("Services"));
  };

  if (!template) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading template...</p>
          <Button asChild variant="outline">
            <Link to={createPageUrl("ExploreTemplates")}>
              ← Back to Templates
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const avgCost = (template.average_cost_min + template.average_cost_max) / 2;
  
  // Use new capped discount calculator
  const memberSavings = calculateMemberSavings(avgCost, currentTier);
  const allTierSavings = getAllTierSavings(avgCost);
  
  const avgDIYCost = template.diy_cost_min && template.diy_cost_max 
    ? (template.diy_cost_min + template.diy_cost_max) / 2 
    : 0;
  const potentialSavings = avgCost - avgDIYCost;

  // Estimated property value (use first property or default)
  const estimatedHomeValue = properties[0]?.current_value || properties[0]?.purchase_price || 400000;
  const valueAfter = estimatedHomeValue + (template.typical_value_added || avgCost * (template.average_roi_percent / 100));
  const trueCost = avgCost - (template.typical_value_added || avgCost * (template.average_roi_percent / 100));

  return (
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-5xl md:mx-auto">
        {/* Back Button */}
        <Button
          asChild
          variant="ghost"
          className="mb-4"
          style={{ minHeight: '44px' }}
        >
          <Link to={createPageUrl("ExploreTemplates")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Link>
        </Button>

        {/* Hero Section */}
        <div className="mb-6">
          <Badge className="mb-3" style={{ backgroundColor: '#3B82F6' }}>
            {template.category}
          </Badge>
          <h1 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '32px' }}>
            {template.title}
          </h1>

          {/* Hero Image */}
          <div className="w-full h-64 md:h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
            {template.hero_image_url ? (
              <img 
                src={template.hero_image_url} 
                alt={template.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Home className="w-24 h-24 text-gray-400" />
            )}
          </div>
        </div>

        {/* Cost Disclaimer */}
        <Card className="border-2 border-yellow-300 bg-yellow-50 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900 mb-1">
                  ⚠️ Pricing Disclaimer
                </p>
                <p className="text-sm text-yellow-800">
                  All costs shown are <strong>example estimates only</strong> based on national averages. 
                  Actual costs vary significantly by location, materials, labor rates, and project specifics. 
                  A professional quote from a licensed contractor is required for accurate pricing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Get Professional Quote CTA */}
        <Card className="border-2 mb-6" style={{ borderColor: '#28A745' }}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                <PhoneCall className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                  Get Accurate Pricing for Your Project
                </h3>
                <p className="text-gray-700 mb-3">
                  Request a free quote from a licensed 360° Method contractor operator in your area.
                </p>
                <Button
                  onClick={handleRequestQuote}
                  style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                >
                  <PhoneCall className="w-5 h-5 mr-2" />
                  Request Professional Quote
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="h-6" />

        {/* DIY vs Professional Comparison */}
        {avgDIYCost > 0 && (
          <Card className="border-2 border-blue-300 mb-6">
            <CardContent className="p-6">
              <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
                💰 DIY vs Professional Cost Comparison
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                {/* DIY Column */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold" style={{ color: '#1B365D' }}>DIY Approach</h3>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Materials Cost Range</p>
                    <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                      ${template.diy_cost_min?.toLocaleString()} - ${template.diy_cost_max?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Average: ${avgDIYCost.toLocaleString()}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-semibold mb-1">Difficulty Level</p>
                    <Badge className={
                      template.diy_difficulty === 'Not Recommended' ? 'bg-red-600' :
                      template.diy_difficulty === 'Advanced DIY Only' ? 'bg-orange-600' :
                      template.diy_difficulty === 'Intermediate DIY' ? 'bg-yellow-600' :
                      'bg-green-600'
                    }>
                      {template.diy_difficulty}
                    </Badge>
                  </div>

                  {template.diy_time_estimate && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold mb-1">Time Investment</p>
                      <p className="text-sm text-gray-700">{template.diy_time_estimate}</p>
                    </div>
                  )}

                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-sm font-semibold mb-2" style={{ color: '#1B365D' }}>
                      Potential Savings
                    </p>
                    <p className="text-xl font-bold text-green-700">
                      ${Math.round(potentialSavings).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      * Your time not factored in
                    </p>
                  </div>
                </div>

                {/* Professional Column */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold" style={{ color: '#1B365D' }}>Professional Install</h3>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Total Cost Range</p>
                    <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                      ${template.average_cost_min.toLocaleString()} - ${template.average_cost_max.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Average: ${avgCost.toLocaleString()}</p>
                  </div>

                  {template.project_duration && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold mb-1">Duration</p>
                      <p className="text-sm text-gray-700">{template.project_duration}</p>
                    </div>
                  )}

                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-sm font-semibold mb-2" style={{ color: '#1B365D' }}>
                      Professional Benefits
                    </p>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>✓ Licensed & insured</li>
                      <li>✓ Warranty on work</li>
                      <li>✓ Correct permits & inspections</li>
                      <li>✓ Professional results</li>
                      <li>✓ No time investment required</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 text-center">
                💡 All cost estimates are examples only. Request a professional quote for accurate pricing.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Member Benefits or Upsell with CAPPED DISCOUNTS */}
        {isServiceMember && memberSavings.savings > 0 ? (
          <Card className="border-2 border-purple-300 bg-purple-50 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-8 h-8 text-purple-600 flex-shrink-0" />
                <div>
                  <Badge className="mb-2" style={{ backgroundColor: '#8B5CF6' }}>
                    YOUR MEMBER BENEFIT
                  </Badge>
                  <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                    Premium Contractor Network Access
                  </h3>
                  <p className="text-gray-800 mb-3">
                    As a {getTierDisplayName(currentTier)} member, you get this project coordinated through our vetted contractor network.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="font-semibold mb-2" style={{ color: '#1B365D' }}>Your Member Pricing:</p>
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Standard Cost:</span>
                        <span className="font-semibold">${avgCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-700 font-semibold">Your Price:</span>
                        <span className="font-bold text-purple-700">${Math.round(memberSavings.memberPrice).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-green-700 font-bold">You Save:</span>
                        <span className="font-bold text-green-700">${Math.round(memberSavings.savings).toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      * Savings based on negotiated member rates with {memberSavings.effectivePercent.toFixed(1)}% discount
                      {memberSavings.wasCapped && " (capped at maximum savings)"}
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Free project coordination & management</li>
                      <li>• Quality guarantee from your operator</li>
                      <li>• No bidding, vetting, or oversight hassle</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-blue-300 bg-blue-50 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
                    💰 Save with Service Membership
                  </h3>
                  <p className="text-gray-800 mb-3">
                    Members get access to our vetted contractor network with pre-negotiated rates.
                  </p>
                  <div className="bg-white rounded-lg p-4 mb-3">
                    <p className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                      Potential Savings on This ~${avgCost.toLocaleString()} Project:
                    </p>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>• Essential: <strong className="text-green-700">${Math.round(allTierSavings.essential.savings).toLocaleString()}</strong>
                        {allTierSavings.essential.wasCapped && " (capped)"}
                      </p>
                      <p>• Premium: <strong className="text-green-700">${Math.round(allTierSavings.premium.savings).toLocaleString()}</strong>
                        {allTierSavings.premium.wasCapped && " (capped)"}
                      </p>
                      <p>• Elite: <strong className="text-green-700">${Math.round(allTierSavings.elite.savings).toLocaleString()}</strong>
                        {allTierSavings.elite.wasCapped && " (capped)"}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      * Example savings based on project size. Actual savings may vary.
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    style={{ backgroundColor: '#28A745', minHeight: '44px' }}
                  >
                    <Link to={createPageUrl("Pricing")}>
                      View Plans & Pricing →
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* The Opportunity */}
        <Card className="border-2 border-green-300 bg-green-50 mb-6">
          <CardContent className="p-6">
            <h2 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '24px' }}>
              💡 The Opportunity
            </h2>
            <p className="text-gray-800 mb-4" style={{ fontSize: '16px', lineHeight: '1.6' }}>
              <strong>Invest ${template.average_cost_min.toLocaleString()}-${template.average_cost_max.toLocaleString()}, 
              gain ${(template.typical_value_added || avgCost * (template.average_roi_percent / 100)).toLocaleString()} in value.</strong>
            </p>
            <p className="text-gray-700" style={{ fontSize: '16px', lineHeight: '1.6' }}>
              With an average {template.average_roi_percent}% ROI, this upgrade pays for most of itself in increased property value.
              {trueCost > 0 && (
                <> Your true cost? Just ${Math.round(trueCost).toLocaleString()} for a transformed property.</>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Why This Works */}
        {template.why_it_works && template.why_it_works.length > 0 && (
          <Card className="border-none shadow-sm mb-6">
            <CardContent className="p-6">
              <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
                ✓ Why This Upgrade Works
              </h2>
              <div className="space-y-2">
                {template.why_it_works.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* What's Included */}
        {template.whats_included && template.whats_included.length > 0 && (
          <Card className="border-none shadow-sm mb-6">
            <CardContent className="p-6">
              <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
                📋 What's Typically Included
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {template.whats_included.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cost Breakdown */}
        <Card className="border-2 border-blue-300 mb-6">
          <CardContent className="p-6">
            <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
              💰 Investment Range
            </h2>
            
            <div className="space-y-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Typical Investment Range</p>
                <p className="text-3xl font-bold" style={{ color: '#1B365D' }}>
                  ${template.average_cost_min.toLocaleString()} - ${template.average_cost_max.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Average: ${avgCost.toLocaleString()}
                </p>
              </div>

              {isServiceMember && memberSavings.savings > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="font-semibold text-purple-900 mb-2">
                      🌟 Your Member Pricing
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700">
                        Market rate: <span className="line-through">${avgCost.toLocaleString()}</span>
                      </p>
                      <p className="text-gray-700">
                        Your savings: <span className="font-bold text-purple-700">-${Math.round(memberSavings.savings).toLocaleString()}</span>
                      </p>
                      <p className="font-bold text-lg text-purple-900">
                        Your cost: ~${Math.round(avgCost - memberSavings.savings).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ROI Calculator */}
        <Card className="border-2 border-green-300 bg-green-50 mb-6">
          <CardContent className="p-6">
            <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
              📈 ROI Calculator (Customized to Your Property)
            </h2>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Home Value</p>
                <p className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                  ${estimatedHomeValue.toLocaleString()}
                </p>
                {properties.length > 0 && (
                  <p className="text-xs text-gray-600">{properties[0].address}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Expected Value Added</p>
                <p className="text-2xl font-bold text-green-700">
                  +${(template.typical_value_added || avgCost * (template.average_roi_percent / 100)).toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">{template.average_roi_percent}% ROI</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Home Value After</p>
                <p className="text-2xl font-bold text-green-700">
                  ${Math.round(valueAfter).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="border-t border-green-300 pt-4">
              <p className="text-sm font-semibold mb-2" style={{ color: '#1B365D' }}>
                Your True Cost:
              </p>
              <p className="text-lg text-gray-700">
                You invest ${avgCost.toLocaleString()} but gain ${(template.typical_value_added || avgCost * (template.average_roi_percent / 100)).toLocaleString()} in equity.
              </p>
              <p className="text-xl font-bold" style={{ color: trueCost > 0 ? '#1B365D' : '#28A745' }}>
                Net cost: {trueCost > 0 ? `$${Math.round(trueCost).toLocaleString()}` : '$0 (pays for itself!)'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        {template.project_duration && (
          <Card className="border-none shadow-sm mb-6">
            <CardContent className="p-6">
              <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#1B365D', fontSize: '22px' }}>
                <Clock className="w-6 h-6" />
                Timeline
              </h2>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold">Typical Duration:</p>
                  <p className="text-gray-700">{template.project_duration}</p>
                </div>
              </div>
              {template.best_for && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold mb-1" style={{ color: '#1B365D' }}>
                    💡 Best For:
                  </p>
                  <p className="text-sm text-gray-700">{template.best_for}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Success Stories */}
        {template.success_stories && template.success_stories.length > 0 && (
          <Card className="border-2 border-yellow-300 bg-yellow-50 mb-6">
            <CardContent className="p-6">
              <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#1B365D', fontSize: '22px' }}>
                <Star className="w-6 h-6 text-yellow-600" />
                Success Stories
              </h2>
              <div className="space-y-4">
                {template.success_stories.map((story, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg">
                    <p className="text-gray-700 italic mb-2">"{story.quote}"</p>
                    <p className="text-sm font-semibold text-gray-900">
                      — {story.author}, {story.location}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Special Benefits */}
        {(template.rental_income_boost > 0 || template.annual_savings > 0) && (
          <Card className="border-2 border-purple-300 bg-purple-50 mb-6">
            <CardContent className="p-6">
              <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
                ✨ Special Benefits
              </h2>
              {template.rental_income_boost > 0 && (
                <div className="flex items-start gap-3 mb-3">
                  <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold" style={{ color: '#1B365D' }}>
                      Rental Income Boost
                    </p>
                    <p className="text-gray-700">
                      Increase rent by <strong>${template.rental_income_boost}/month</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      Annual: ${template.rental_income_boost * 12}/year additional income
                    </p>
                  </div>
                </div>
              )}
              {template.annual_savings > 0 && (
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold" style={{ color: '#1B365D' }}>
                      Annual Energy Savings
                    </p>
                    <p className="text-gray-700">
                      Save <strong>${template.annual_savings}/year</strong> on utility bills
                    </p>
                    {template.payback_timeline && (
                      <p className="text-sm text-gray-600">
                        Payback: {template.payback_timeline}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <Card className="border-2 mb-6" style={{ borderColor: '#28A745' }}>
          <CardContent className="p-6">
            <h2 className="font-bold mb-4 text-center" style={{ color: '#1B365D', fontSize: '24px' }}>
              Ready to Start This Project?
            </h2>
            
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleStartProject}
                className="w-full font-bold"
                style={{ backgroundColor: '#28A745', minHeight: '56px' }}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create Project & Track Progress
              </Button>

              <Button
                onClick={handleRequestQuote}
                variant="outline"
                className="w-full font-semibold"
                style={{ minHeight: '56px', borderColor: '#28A745', color: '#28A745' }}
              >
                <PhoneCall className="w-5 h-5 mr-2" />
                Get Professional Quote from 360° Contractor
              </Button>

              {isServiceMember && user?.operator_name && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full font-semibold"
                  style={{ minHeight: '56px', borderColor: '#8B5CF6', color: '#8B5CF6' }}
                >
                  <Link to={createPageUrl("Services")}>
                    <Shield className="w-5 h-5 mr-2" />
                    Contact Your Operator: {user.operator_name}
                  </Link>
                </Button>
              )}

              {!isServiceMember && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full font-semibold"
                  style={{ minHeight: '56px', borderColor: '#3B82F6', color: '#3B82F6' }}
                >
                  <Link to={createPageUrl("Pricing")}>
                    <Sparkles className="w-5 h-5 mr-2" />
                    See Member Benefits & Savings
                  </Link>
                </Button>
              )}

              <Button
                asChild
                variant="outline"
                className="w-full"
                style={{ minHeight: '48px' }}
              >
                <Link to={createPageUrl("ExploreTemplates")}>
                  Browse More Templates
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Related Templates */}
        <Card className="border-none shadow-sm bg-gray-50">
          <CardContent className="p-6">
            <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '20px' }}>
              💡 Related Upgrades
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Other projects in the {template.category} category
            </p>
            <Button
              asChild
              variant="outline"
              style={{ minHeight: '48px' }}
            >
              <Link to={createPageUrl("ExploreTemplates") + `?category=${encodeURIComponent(template.category)}`}>
                View Similar Templates →
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
