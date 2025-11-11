import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, DollarSign, TrendingUp, Clock, Home, Star, Sparkles, Calendar, Shield, AlertTriangle, Wrench, PhoneCall } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { calculateSavingsRange, calculateAllTierSavings, getMemberTierName, isServiceMember } from "@/utils/memberPricing";

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
  const isMember = isServiceMember(currentTier);
  const tierName = getMemberTierName(currentTier);

  const handleStartProject = () => {
    navigate(createPageUrl("Upgrade") + "?new=true&template=" + templateId);
  };

  const handleRequestQuote = () => {
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
  const avgDIYCost = template.diy_cost_min && template.diy_cost_max 
    ? (template.diy_cost_min + template.diy_cost_max) / 2 
    : 0;
  const potentialSavings = avgCost - avgDIYCost;

  // Calculate member savings using official structure
  const memberSavings = isMember 
    ? calculateSavingsRange(template.average_cost_min, template.average_cost_max, currentTier)
    : null;

  const allTierSavings = calculateAllTierSavings(avgCost);

  // Estimated property value (use first property or default)
  const estimatedHomeValue = properties[0]?.current_value || properties[0]?.purchase_price || 400000;
  const valueAfter = estimatedHomeValue + (template.typical_value_added || avgCost * (template.average_roi_percent / 100));
  const memberPrice = isMember ? avgCost - memberSavings.avgSavings : avgCost;
  const trueCost = memberPrice - (template.typical_value_added || avgCost * (template.average_roi_percent / 100));

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

        {/* Typical Cost Range */}
        <Card className="border-2 border-gray-300 mb-6">
          <CardContent className="p-6">
            <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
              💰 Typical Cost Range
            </h2>
            <div className="text-center mb-4">
              <p className="text-gray-600 mb-2">National Average</p>
              <p className="text-4xl font-bold" style={{ color: '#1B365D' }}>
                ${template.average_cost_min.toLocaleString()} - ${template.average_cost_max.toLocaleString()}
              </p>
              <p className="text-gray-600 mt-2">
                Average: ${avgCost.toLocaleString()}
              </p>
            </div>
            <p className="text-xs text-gray-600 text-center">
              * Example estimates only. Request professional quote for your specific project.
            </p>
          </CardContent>
        </Card>

        {/* Member Preferred Pricing */}
        {isMember ? (
          <Card className="border-2 border-purple-300 bg-purple-50 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-8 h-8 text-purple-600 flex-shrink-0" />
                <div className="flex-1">
                  <Badge className="mb-3" style={{ backgroundColor: '#8B5CF6' }}>
                    YOUR {tierName.toUpperCase()} MEMBER BENEFIT
                  </Badge>
                  <h3 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '20px' }}>
                    Member Preferred Pricing on This Project
                  </h3>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="grid md:grid-cols-3 gap-4 text-center mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Standard Pricing</p>
                        <p className="text-2xl font-bold text-gray-700 line-through">
                          ${avgCost.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Your Savings</p>
                        <p className="text-2xl font-bold text-green-700">
                          -${Math.round(memberSavings.avgSavings).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          ({(memberSavings.minPercent * 100).toFixed(0)}%{memberSavings.minPercent !== memberSavings.maxPercent ? `-${(memberSavings.maxPercent * 100).toFixed(0)}%` : ''})
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Your Member Price</p>
                        <p className="text-2xl font-bold" style={{ color: '#28A745' }}>
                          ~${Math.round(memberPrice).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-purple-200 pt-4">
                      <p className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                        Your {tierName} Member Benefits:
                      </p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>✓ Pre-negotiated member pricing saves ${Math.round(memberSavings.minSavings).toLocaleString()}-${Math.round(memberSavings.maxSavings).toLocaleString()}</li>
                        <li>✓ We already know your home from diagnostics</li>
                        <li>✓ Priority scheduling (start within 3 weeks vs. 2-3 months market average)</li>
                        <li>✓ Quality guarantee backed by your operator</li>
                        <li>✓ No bidding hassle - single point of contact</li>
                        <li>✓ Project coordination included</li>
                      </ul>
                    </div>
                  </div>

                  {user?.operator_name && (
                    <p className="text-sm text-gray-700">
                      <strong>Your Operator:</strong> {user.operator_name}
                    </p>
                  )}
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
                  <h3 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '20px' }}>
                    💎 Unlock Member Preferred Pricing
                  </h3>
                  <p className="text-gray-800 mb-4">
                    Service members get exclusive pre-negotiated pricing with certified operators.
                  </p>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="font-semibold mb-3" style={{ color: '#1B365D' }}>
                      Potential Savings on This ${avgCost.toLocaleString()} Project:
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Essential Member:</span>
                        <span className="font-bold text-green-700">
                          Save ${Math.round(allTierSavings.essential.cappedSavings).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Premium Member:</span>
                        <span className="font-bold text-green-700">
                          Save ${Math.round(allTierSavings.premium.cappedSavings).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Elite Member:</span>
                        <span className="font-bold text-green-700">
                          Save ${Math.round(allTierSavings.elite.cappedSavings).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">
                      * Savings based on official member preferred pricing structure
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      asChild
                      className="w-full"
                      style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                    >
                      <Link to={createPageUrl("Pricing")}>
                        View Plans & Member Benefits →
                      </Link>
                    </Button>
                    <p className="text-xs text-center text-gray-600">
                      Plus: Priority scheduling • No bidding hassle • Quality guarantee
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* DIY vs Professional Comparison */}
        {avgDIYCost > 0 && (
          <Card className="border-2 border-blue-300 mb-6">
            <CardContent className="p-6">
              <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
                🔨 DIY vs Professional Comparison
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
                    {isMember && (
                      <p className="text-sm font-semibold text-green-700">
                        Your price: ~${Math.round(memberPrice).toLocaleString()}
                      </p>
                    )}
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
                      {isMember && <li>✓ <strong>Member preferred pricing</strong></li>}
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

        {/* ROI Analysis */}
        <Card className="border-2 border-green-300 bg-green-50 mb-6">
          <CardContent className="p-6">
            <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
              📊 ROI Analysis
            </h2>
            
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Current Home Value</p>
                <p className="text-xl font-bold" style={{ color: '#1B365D' }}>
                  ${estimatedHomeValue.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Your Investment</p>
                <p className="text-xl font-bold" style={{ color: '#1B365D' }}>
                  ${isMember ? Math.round(memberPrice).toLocaleString() : avgCost.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Value Added</p>
                <p className="text-xl font-bold text-green-700">
                  ${(template.typical_value_added || Math.round(avgCost * (template.average_roi_percent / 100))).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">ROI</p>
                <p className="text-xl font-bold text-green-700">
                  {template.average_roi_percent}%
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold mb-2" style={{ color: '#1B365D' }}>True Out-of-Pocket Cost:</p>
              <p className="text-3xl font-bold" style={{ color: trueCost > 0 ? '#1B365D' : '#28A745' }}>
                ${Math.abs(Math.round(trueCost)).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {trueCost > 0 
                  ? `You invest $${isMember ? Math.round(memberPrice).toLocaleString() : avgCost.toLocaleString()} but gain $${(template.typical_value_added || Math.round(avgCost * (template.average_roi_percent / 100))).toLocaleString()} in equity`
                  : `This upgrade pays for itself in equity gained!`
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What's Included */}
        {template.whats_included && template.whats_included.length > 0 && (
          <Card className="border-none shadow-sm mb-6">
            <CardContent className="p-6">
              <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
                ✅ What's Typically Included
              </h2>
              <ul className="space-y-2">
                {template.whats_included.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Why This Works */}
        {template.why_it_works && template.why_it_works.length > 0 && (
          <Card className="border-none shadow-sm mb-6">
            <CardContent className="p-6">
              <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
                💡 Why This Upgrade Works
              </h2>
              <ul className="space-y-3">
                {template.why_it_works.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{reason}</span>
                  </li>
                ))}
              </ul>
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

              {isMember && user?.operator_name && (
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

              {!isMember && (
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
      </div>
    </div>
  );
}