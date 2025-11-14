import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Sparkles, TrendingUp, DollarSign, Clock, Zap,
  ArrowLeft, Search, Filter, ChevronDown, Home,
  Trophy, Leaf, Shield, Heart, Building2, MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { calculateMemberDiscount, getAllTierDiscounts } from '@/components/shared/MemberDiscountCalculator';
import AICostDisclaimer from '@/components/shared/AICostDisclaimer';
import { isServiceAvailable, shouldShowMemberBenefits } from '@/lib/serviceAreas';

const CATEGORY_ICONS = {
  'High ROI Renovations': Trophy,
  'Energy Efficiency': Leaf,
  'Rental Income Boosters': Building2,
  'Preventive Replacements': Shield,
  'Curb Appeal': Home,
  'Interior Updates': Heart
};

const CATEGORY_COLORS = {
  'High ROI Renovations': 'bg-green-100 text-green-800 border-green-300',
  'Energy Efficiency': 'bg-blue-100 text-blue-800 border-blue-300',
  'Rental Income Boosters': 'bg-purple-100 text-purple-800 border-purple-300',
  'Preventive Replacements': 'bg-red-100 text-red-800 border-red-300',
  'Curb Appeal': 'bg-orange-100 text-orange-800 border-orange-300',
  'Interior Updates': 'bg-pink-100 text-pink-800 border-pink-300'
};

export default function ExploreTemplatesPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [costFilter, setCostFilter] = useState('all');
  const [sortBy, setSortBy] = useState('roi');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch user for member tier
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  // Fetch upgrade templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['upgradeTemplates'],
    queryFn: () => base44.entities.UpgradeTemplate.list()
  });

  const memberTier = user?.subscription_tier || 'free';
  const serviceCheck = isServiceAvailable(user?.zip_code);
  const showMemberBenefits = shouldShowMemberBenefits(user);
  
  // Get tier name for display
  const tierDisplayName = memberTier.includes('essential') ? 'Essential' 
    : memberTier.includes('premium') ? 'Premium' 
    : memberTier.includes('elite') ? 'Elite' 
    : 'Free';

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = [...templates];

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    if (costFilter === 'under_10k') {
      filtered = filtered.filter(t => t.average_cost_max < 10000);
    } else if (costFilter === '10k_to_30k') {
      filtered = filtered.filter(t => t.average_cost_min >= 10000 && t.average_cost_max <= 30000);
    } else if (costFilter === 'over_30k') {
      filtered = filtered.filter(t => t.average_cost_min > 30000);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title?.toLowerCase().includes(query) ||
        t.why_it_works?.some(w => w.toLowerCase().includes(query)) ||
        t.best_for?.toLowerCase().includes(query)
      );
    }

    if (sortBy === 'roi') {
      filtered.sort((a, b) => (b.average_roi_percent || 0) - (a.average_roi_percent || 0));
    } else if (sortBy === 'cost_low') {
      filtered.sort((a, b) => (a.average_cost_min || 0) - (b.average_cost_min || 0));
    } else if (sortBy === 'cost_high') {
      filtered.sort((a, b) => (b.average_cost_max || 0) - (a.average_cost_max || 0));
    } else if (sortBy === 'value') {
      filtered.sort((a, b) => (b.typical_value_added || 0) - (a.typical_value_added || 0));
    }

    return filtered;
  }, [templates, categoryFilter, costFilter, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading upgrade ideas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pb-20">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6">
        
        {/* Header */}
        <div className="mb-6">
          <Link to={createPageUrl('Upgrade')}>
            <Button variant="ghost" className="mb-4" style={{ minHeight: '44px' }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upgrade
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Upgrade Ideas
              </h1>
              <p className="text-gray-600">
                Strategic improvements that pay for themselves
              </p>
            </div>
          </div>

          {/* Service Availability Banner */}
          {serviceCheck.available && showMemberBenefits && (
            <div className="mt-4 p-4 bg-purple-50 border-2 border-purple-300 rounded-lg">
              <Badge className="bg-purple-600 text-white mb-2">
                ⭐ MEMBER BENEFIT
              </Badge>
              <p className="text-sm text-purple-900 font-semibold">
                All prices shown include your {tierDisplayName} member discount! {serviceCheck.operator} serves your area.
              </p>
            </div>
          )}

          {!serviceCheck.available && (
            <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 mb-1">
                    Professional Service Not Yet Available
                  </p>
                  <p className="text-sm text-amber-800 mb-3">
                    360° Operator service isn't in your area yet. You can still use upgrade ideas for DIY planning or to find local contractors.
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700"
                    style={{ minHeight: '40px' }}
                  >
                    <Link to={createPageUrl('Waitlist')}>
                      <MapPin className="w-4 h-4 mr-2" />
                      Join Waitlist for Your Area
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-3">
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search upgrades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  style={{ minHeight: '48px' }}
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="High ROI Renovations">🏆 High ROI</SelectItem>
                    <SelectItem value="Energy Efficiency">🍃 Energy Efficiency</SelectItem>
                    <SelectItem value="Rental Income Boosters">🏢 Rental Boosters</SelectItem>
                    <SelectItem value="Preventive Replacements">🛡️ Preventive</SelectItem>
                    <SelectItem value="Curb Appeal">🏠 Curb Appeal</SelectItem>
                    <SelectItem value="Interior Updates">💖 Interior</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={costFilter} onValueChange={setCostFilter}>
                  <SelectTrigger style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Any Cost" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Cost</SelectItem>
                    <SelectItem value="under_10k">Under $10K</SelectItem>
                    <SelectItem value="10k_to_30k">$10K - $30K</SelectItem>
                    <SelectItem value="over_30k">Over $30K</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roi">Highest ROI</SelectItem>
                    <SelectItem value="cost_low">Lowest Cost</SelectItem>
                    <SelectItem value="cost_high">Highest Cost</SelectItem>
                    <SelectItem value="value">Biggest Value Add</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredTemplates.length} of {templates.length} upgrades
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => {
            const avgCost = (template.average_cost_min + template.average_cost_max) / 2;
            const CategoryIcon = CATEGORY_ICONS[template.category] || Sparkles;
            const memberDiscount = showMemberBenefits ? calculateMemberDiscount(avgCost, memberTier) : null;
            const allDiscounts = getAllTierDiscounts(avgCost);

            return (
              <Card 
                key={template.id}
                className="cursor-pointer hover:shadow-xl transition-all border-2 border-gray-200 hover:border-green-400 overflow-hidden"
                onClick={() => setSelectedTemplate(template)}
              >
                {/* Hero Image */}
                {template.hero_image_url && (
                  <div className="w-full h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={template.hero_image_url}
                      alt={template.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <CardContent className="p-4">
                  
                  {/* Title and Category */}
                  <div className="mb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-lg text-gray-900">
                        {template.title}
                      </h3>
                      <CategoryIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    </div>
                    <Badge className={CATEGORY_COLORS[template.category]}>
                      {template.category}
                    </Badge>
                  </div>

                  {/* Why It Matters (Truncated) */}
                  {template.why_it_works && template.why_it_works.length > 0 && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {template.why_it_works[0]}
                    </p>
                  )}

                  <div className="space-y-3">
                    
                    {/* Cost Range */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-xs font-semibold text-gray-600">TYPICAL COST</span>
                      <span className="font-bold text-gray-900 text-sm">
                        ${template.average_cost_min?.toLocaleString()} - ${template.average_cost_max?.toLocaleString()}
                      </span>
                    </div>

                    {/* AI Disclaimer - Compact */}
                    <AICostDisclaimer variant="compact" />

                    {/* ROI */}
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                      <span className="text-xs font-semibold text-green-700">ROI</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-green-700 text-xl">
                          {template.average_roi_percent}%
                        </span>
                      </div>
                    </div>

                    {/* Member Price (ONLY if service available + member) */}
                    {showMemberBenefits && memberDiscount && memberDiscount.actualSavings > 0 && (
                      <div className="p-3 bg-purple-50 border-2 border-purple-300 rounded">
                        <p className="text-xs font-semibold text-purple-600 mb-1">⭐ YOUR {tierDisplayName.toUpperCase()} PRICE</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-purple-700">
                            ${(avgCost - memberDiscount.actualSavings).toLocaleString()}
                          </span>
                          <Badge className="bg-green-600 text-white">
                            Save ${memberDiscount.actualSavings.toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Service Available - Non-Member Upsell */}
                    {serviceCheck.available && !showMemberBenefits && (
                      <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded">
                        <p className="text-xs font-semibold text-blue-900 mb-2">
                          💰 Members Save 5-15%
                        </p>
                        <div className="text-xs text-blue-800 space-y-1">
                          <div className="flex justify-between">
                            <span>Essential:</span>
                            <strong>${allDiscounts.essential.actualSavings.toLocaleString()} off</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Premium:</span>
                            <strong>${allDiscounts.premium.actualSavings.toLocaleString()} off</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Elite:</span>
                            <strong className="text-green-700">${allDiscounts.elite.actualSavings.toLocaleString()} off</strong>
                          </div>
                        </div>
                        <Button
                          asChild
                          size="sm"
                          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-xs"
                          style={{ minHeight: '36px' }}
                        >
                          <Link to={createPageUrl('Pricing')}>
                            Become a Member →
                          </Link>
                        </Button>
                      </div>
                    )}

                    {/* Service NOT Available - Waitlist */}
                    {!serviceCheck.available && (
                      <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded">
                        <p className="text-xs font-semibold text-amber-900 mb-2">
                          Service Coming Soon
                        </p>
                        <p className="text-xs text-amber-800 mb-2">
                          Professional service not yet available in your area.
                        </p>
                        <Button
                          asChild
                          size="sm"
                          className="w-full bg-amber-600 hover:bg-amber-700 text-xs"
                          style={{ minHeight: '36px' }}
                        >
                          <Link to={createPageUrl('Waitlist')}>
                            <MapPin className="w-3 h-3 mr-1" />
                            Join Waitlist
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                    style={{ minHeight: '48px' }}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No upgrades match your filters
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters
              </p>
              <Button
                onClick={() => {
                  setCategoryFilter('all');
                  setCostFilter('all');
                  setSearchQuery('');
                }}
                variant="outline"
                style={{ minHeight: '48px' }}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Template Detail Modal */}
        {selectedTemplate && (
          <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl pr-6">
                  {selectedTemplate.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                
                {/* Hero Image */}
                {selectedTemplate.hero_image_url && (
                  <div className="w-full h-64 rounded-lg overflow-hidden">
                    <img
                      src={selectedTemplate.hero_image_url}
                      alt={selectedTemplate.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Category Badge */}
                <Badge className={CATEGORY_COLORS[selectedTemplate.category]}>
                  {selectedTemplate.category}
                </Badge>

                {/* Why This Matters */}
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-3 text-blue-900">
                      💡 Why This Matters
                    </h3>
                    {selectedTemplate.why_it_works?.map((reason, idx) => (
                      <p key={idx} className="text-sm text-gray-800 mb-2 leading-relaxed">
                        {reason}
                      </p>
                    ))}
                  </CardContent>
                </Card>

                {/* AI Cost Disclaimer - Prominent in Detail View */}
                <AICostDisclaimer variant="default" />

                {/* Financial Breakdown */}
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg">📊 Estimated Financial Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Typical Investment</p>
                        <p className="text-xl font-bold text-gray-900">
                          ${selectedTemplate.average_cost_min?.toLocaleString()} - ${selectedTemplate.average_cost_max?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Est. Value Added</p>
                        <p className="text-xl font-bold text-green-700">
                          ${selectedTemplate.typical_value_added?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Projected ROI</p>
                        <p className="text-2xl font-bold text-green-700">
                          {selectedTemplate.average_roi_percent}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Payback</p>
                        <p className="text-xl font-bold text-gray-900">
                          {selectedTemplate.payback_timeline || 'At Sale'}
                        </p>
                      </div>
                    </div>

                    {/* Net Gain */}
                    <div className="p-4 bg-white rounded border border-green-300">
                      <p className="text-sm text-gray-600 mb-1">Estimated Net Gain</p>
                      <p className="text-3xl font-bold text-green-700">
                        +${((selectedTemplate.typical_value_added || 0) - ((selectedTemplate.average_cost_min + selectedTemplate.average_cost_max) / 2)).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Member Pricing - ONLY if service available + member */}
                {showMemberBenefits && (() => {
                  const avgCost = (selectedTemplate.average_cost_min + selectedTemplate.average_cost_max) / 2;
                  const discount = calculateMemberDiscount(avgCost, memberTier);
                  const allTiers = getAllTierDiscounts(avgCost);
                  const isElite = memberTier.includes('elite');
                  
                  return (
                    <Card className="border-2 border-purple-300 bg-purple-50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="w-5 h-5 text-purple-600" />
                          ⭐ Your Member Pricing ({serviceCheck.operator})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-purple-600 mb-1">Standard Price</p>
                            <p className="text-xl font-bold text-gray-900 line-through">
                              ${avgCost.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-purple-600 mb-1">Your {tierDisplayName} Price</p>
                            <p className="text-2xl font-bold text-purple-700">
                              ${(avgCost - discount.actualSavings).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded border border-purple-200">
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            You Save: ${discount.actualSavings.toLocaleString()} ({discount.percent}% discount)
                          </p>
                          <p className="text-xs text-gray-600">
                            {discount.isCapped ? `Maximum ${tierDisplayName} tier savings reached` : `${discount.percent}% member discount applied`}
                          </p>
                        </div>

                        {!isElite && (
                          <div className="p-3 bg-blue-50 border border-blue-300 rounded">
                            <p className="text-xs font-semibold text-blue-900 mb-2">
                              💡 Upgrade to Elite and Save Even More
                            </p>
                            <p className="text-sm text-blue-800">
                              Elite Price: <strong>${(avgCost - allTiers.elite.actualSavings).toLocaleString()}</strong>
                            </p>
                            <p className="text-sm text-green-700">
                              Additional Savings: <strong>${(allTiers.elite.actualSavings - discount.actualSavings).toLocaleString()}</strong>
                            </p>
                            <Button
                              asChild
                              size="sm"
                              className="w-full mt-2 bg-blue-600"
                              style={{ minHeight: '40px' }}
                            >
                              <Link to={createPageUrl('Pricing')}>
                                Upgrade to Elite →
                              </Link>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Service Available - Free User Pricing Comparison */}
                {serviceCheck.available && !showMemberBenefits && (() => {
                  const avgCost = (selectedTemplate.average_cost_min + selectedTemplate.average_cost_max) / 2;
                  const allTiers = getAllTierDiscounts(avgCost);
                  
                  return (
                    <Card className="border-2 border-blue-300 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          💰 Member Pricing Available
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="p-3 bg-white rounded">
                          <p className="text-sm font-semibold text-gray-900 mb-3">
                            Standard Price: ${avgCost.toLocaleString()}
                          </p>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="font-medium">Essential:</span>
                              <div className="text-right">
                                <div className="font-bold text-green-700">${(avgCost - allTiers.essential.actualSavings).toLocaleString()}</div>
                                <div className="text-xs text-gray-600">Save ${allTiers.essential.actualSavings.toLocaleString()}</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="font-medium">Premium:</span>
                              <div className="text-right">
                                <div className="font-bold text-green-700">${(avgCost - allTiers.premium.actualSavings).toLocaleString()}</div>
                                <div className="text-xs text-gray-600">Save ${allTiers.premium.actualSavings.toLocaleString()}</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-300">
                              <span className="font-bold">Elite:</span>
                              <div className="text-right">
                                <div className="font-bold text-green-700 text-lg">${(avgCost - allTiers.elite.actualSavings).toLocaleString()}</div>
                                <div className="text-xs text-green-700 font-semibold">Save ${allTiers.elite.actualSavings.toLocaleString()}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          asChild
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          style={{ minHeight: '48px' }}
                        >
                          <Link to={createPageUrl('Pricing')}>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Become a Member to Save
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* What's Included */}
                {selectedTemplate.whats_included?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">🎯 What's Typically Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedTemplate.whats_included.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-800">
                            <span className="text-green-600 font-bold mt-0.5">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Timeline */}
                {selectedTemplate.project_duration && (
                  <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-xs text-gray-600">Typical Project Duration</p>
                      <p className="font-semibold text-gray-900">
                        {selectedTemplate.project_duration}
                      </p>
                    </div>
                  </div>
                )}

                {/* DIY Difficulty */}
                {selectedTemplate.diy_difficulty && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      🔧 DIY Difficulty: {selectedTemplate.diy_difficulty}
                    </p>
                    {selectedTemplate.diy_cost_min && (
                      <p className="text-xs text-gray-700">
                        DIY materials only: ${selectedTemplate.diy_cost_min?.toLocaleString()} - ${selectedTemplate.diy_cost_max?.toLocaleString()}
                        {selectedTemplate.diy_time_estimate && ` • ${selectedTemplate.diy_time_estimate}`}
                      </p>
                    )}
                  </div>
                )}

                {/* Investor Benefits */}
                {selectedTemplate.rental_income_boost && (
                  <Card className="border-2 border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">🏢 For Investors</h4>
                      <p className="text-sm text-gray-800 mb-2">
                        <strong>Potential Rental Income Boost:</strong> +${selectedTemplate.rental_income_boost}/month
                      </p>
                      <p className="text-xs text-gray-600">
                        Annual: +${(selectedTemplate.rental_income_boost * 12).toLocaleString()} • 10-Year: +${(selectedTemplate.rental_income_boost * 120).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Best For */}
                {selectedTemplate.best_for && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      👥 Best For:
                    </p>
                    <p className="text-sm text-gray-800">
                      {selectedTemplate.best_for}
                    </p>
                  </div>
                )}

                {/* Action Buttons - Conditional based on service availability */}
                <div className="flex flex-col gap-3 pt-4 border-t">
                  {serviceCheck.available ? (
                    <>
                      <Button
                        asChild
                        className="bg-green-600 hover:bg-green-700"
                        style={{ minHeight: '48px' }}
                      >
                        <Link to={`${createPageUrl('Upgrade')}?new=true&template=${selectedTemplate.id}`}>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Start This Project
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        style={{ minHeight: '48px' }}
                      >
                        <Link to={createPageUrl('Services')}>
                          Request Free Quote from {serviceCheck.operator}
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 text-center">
                        <h4 className="font-semibold text-amber-900 mb-2">
                          Professional Service Coming Soon
                        </h4>
                        <p className="text-sm text-amber-800 mb-3">
                          360° Operator service isn't available in your area yet. Join our waitlist to be notified when we expand.
                        </p>
                        <Button
                          asChild
                          className="bg-amber-600 hover:bg-amber-700"
                          style={{ minHeight: '48px' }}
                        >
                          <Link to={createPageUrl('Waitlist')}>
                            <MapPin className="w-5 h-5 mr-2" />
                            Join Waitlist
                          </Link>
                        </Button>
                        <p className="text-xs text-amber-700 mt-3">
                          You can still track this project DIY-style or hire local contractors on your own.
                        </p>
                      </div>
                      
                      <Button
                        asChild
                        variant="outline"
                        style={{ minHeight: '48px' }}
                      >
                        <Link to={`${createPageUrl('Upgrade')}?new=true&template=${selectedTemplate.id}`}>
                          Track as DIY Project
                        </Link>
                      </Button>
                    </>
                  )}
                </div>

              </div>
            </DialogContent>
          </Dialog>
        )}

      </div>
    </div>
  );
}