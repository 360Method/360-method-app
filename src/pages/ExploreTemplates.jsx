
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, DollarSign, Clock, Home, ChevronRight, Zap, Users, Shield, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { calculateMemberSavings, getAllTierSavings, getTierDisplayName } from "@/utils/memberDiscounts";

export default function ExploreTemplates() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || 'all';
  const showFeatured = searchParams.get('featured') === 'true';

  const [selectedCategory, setSelectedCategory] = React.useState(initialCategory);
  const [sortBy, setSortBy] = React.useState('roi'); // roi, cost, popularity

  const { data: templates = [] } = useQuery({
    queryKey: ['upgrade-templates'],
    queryFn: () => base44.entities.UpgradeTemplate.list('sort_order'),
    initialData: [],
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const currentTier = user?.subscription_tier || 'free';
  const isServiceMember = currentTier.includes('homecare') || currentTier.includes('propertycare');

  const categories = [
    { value: 'all', label: 'All Templates', icon: Sparkles },
    { value: 'High ROI Renovations', label: 'High ROI', icon: Award },
    { value: 'Energy Efficiency', label: 'Energy Efficiency', icon: Zap },
    { value: 'Rental Income Boosters', label: 'Rental Income', icon: DollarSign },
    { value: 'Preventive Replacements', label: 'Preventive', icon: Shield },
    { value: 'Curb Appeal', label: 'Curb Appeal', icon: Home },
  ];

  let filteredTemplates = templates;
  
  if (showFeatured) {
    filteredTemplates = templates.filter(t => t.featured);
  } else if (selectedCategory !== 'all') {
    filteredTemplates = templates.filter(t => t.category === selectedCategory);
  }

  // Sort templates
  filteredTemplates = [...filteredTemplates].sort((a, b) => {
    if (sortBy === 'roi') {
      return (b.average_roi_percent || 0) - (a.average_roi_percent || 0);
    } else if (sortBy === 'cost') {
      return (a.average_cost_min || 0) - (b.average_cost_min || 0);
    }
    return 0;
  });

  const categoryIcon = categories.find(c => c.value === selectedCategory)?.icon || Sparkles;
  const CategoryIcon = categoryIcon;

  return (
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-7xl md:mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px' }}>
            💡 Popular Upgrade Ideas
          </h1>
          <p className="text-gray-700" style={{ fontSize: '16px' }}>
            High-ROI projects that transform your property
          </p>
          <p className="text-sm text-gray-600">
            {templates.length} inspiring templates with real numbers and success stories
          </p>
        </div>

        {/* Member Savings Banner */}
        {isServiceMember && (
          <Card className="border-2 border-purple-300 bg-purple-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge style={{ backgroundColor: '#8B5CF6' }}>MEMBER BENEFIT</Badge>
                <p className="text-sm font-semibold text-purple-900">
                  🌟 All projects coordinated through your vetted contractor network with negotiated savings
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Non-Member Upsell */}
        {!isServiceMember && (
          <Card className="border-2 border-blue-300 bg-blue-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    💰 Members save on ALL upgrades through our contractor network
                  </p>
                  <p className="text-sm text-blue-700">
                    Plus: free project coordination, quality guarantee, and no bidding hassle
                  </p>
                </div>
                <Button
                  asChild
                  size="sm"
                  style={{ backgroundColor: '#3B82F6', minHeight: '40px' }}
                >
                  <Link to={createPageUrl("Pricing")}>
                    Learn More
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="border-none shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Category Filter */}
              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: '#1B365D' }}>
                  Filter by Category:
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        variant={selectedCategory === cat.value ? "default" : "outline"}
                        style={{
                          backgroundColor: selectedCategory === cat.value ? '#3B82F6' : 'white',
                          minHeight: '40px'
                        }}
                        size="sm"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {cat.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold" style={{ color: '#1B365D' }}>
                  Sort by:
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setSortBy('roi')}
                    variant={sortBy === 'roi' ? "default" : "outline"}
                    size="sm"
                    style={{ minHeight: '40px' }}
                  >
                    Highest ROI
                  </Button>
                  <Button
                    onClick={() => setSortBy('cost')}
                    variant={sortBy === 'cost' ? "default" : "outline"}
                    size="sm"
                    style={{ minHeight: '40px' }}
                  >
                    Lowest Cost
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-12 text-center">
              <CategoryIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No Templates Yet</h3>
              <p className="text-gray-600 mb-6">
                Check back soon for inspiring upgrade ideas in this category
              </p>
              <Button
                onClick={() => setSelectedCategory('all')}
                variant="outline"
              >
                View All Templates
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Featured Section */}
            {selectedCategory === 'all' && !showFeatured && (
              <div>
                <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
                  🏆 Featured: Highest ROI Upgrades
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {templates.filter(t => t.featured).slice(0, 3).map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      currentTier={currentTier}
                      isServiceMember={isServiceMember}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Category Header */}
            {selectedCategory !== 'all' && (
              <div className="flex items-center gap-3 mb-4">
                <CategoryIcon className="w-6 h-6" style={{ color: '#3B82F6' }} />
                <h2 className="font-bold" style={{ color: '#1B365D', fontSize: '22px' }}>
                  {categories.find(c => c.value === selectedCategory)?.label}
                </h2>
              </div>
            )}

            {/* All Templates */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  currentTier={currentTier}
                  isServiceMember={isServiceMember}
                />
              ))}
            </div>
          </div>
        )}

        {/* Educational CTA */}
        <Card className="border-2 border-blue-200 bg-blue-50 mt-8">
          <CardContent className="p-6">
            <h3 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '20px' }}>
              💡 How to Choose the Right Upgrade
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-semibold mb-2" style={{ color: '#1B365D' }}>Planning to sell soon?</p>
                <p className="text-sm text-gray-700">
                  Focus on <strong>High ROI</strong> projects like garage doors, stone veneer, and minor kitchen remodels
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2" style={{ color: '#1B365D' }}>Long-term ownership?</p>
                <p className="text-sm text-gray-700">
                  Prioritize <strong>Energy Efficiency</strong> upgrades that pay for themselves over time
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2" style={{ color: '#1B365D' }}>Rental properties?</p>
                <p className="text-sm text-gray-700">
                  Invest in <strong>Rental Income Boosters</strong> to increase monthly cash flow immediately
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2" style={{ color: '#1B365D' }}>Aging systems?</p>
                <p className="text-sm text-gray-700">
                  Consider <strong>Preventive Replacements</strong> before failures cause expensive damage
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              style={{ minHeight: '48px' }}
            >
              <Link to={createPageUrl("Upgrade")}>
                ← Back to My Projects
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Template Card Component
function TemplateCard({ template, currentTier, isServiceMember }) {
  const avgCost = (template.average_cost_min + template.average_cost_max) / 2;
  
  // Use new discount calculator
  const memberSavings = calculateMemberSavings(avgCost, currentTier);
  const allTierSavings = getAllTierSavings(avgCost);

  return (
    <Card className="border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer">
      <CardContent className="p-0">
        <Link to={createPageUrl("TemplateDetail") + `?id=${template.id}`}>
          {/* Image placeholder */}
          <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
            {template.hero_image_url ? (
              <img 
                src={template.hero_image_url} 
                alt={template.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Home className="w-16 h-16 text-gray-400" />
            )}
          </div>

          <div className="p-4">
            {/* Category badge */}
            <Badge className="mb-2 text-xs" style={{ backgroundColor: '#3B82F6' }}>
              {template.category}
            </Badge>

            {/* Title */}
            <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '18px' }}>
              {template.title}
            </h3>

            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-600">Investment Range</p>
                <p className="font-bold text-sm" style={{ color: '#1B365D' }}>
                  ${template.average_cost_min.toLocaleString()}-${template.average_cost_max.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Average ROI</p>
                <p className="font-bold text-2xl" style={{ color: template.average_roi_percent >= 80 ? '#28A745' : '#FF6B35' }}>
                  {template.average_roi_percent}%
                </p>
              </div>
            </div>

            {/* Member Savings Display */}
            {isServiceMember && memberSavings.savings > 0 && (
              <div className="mb-3 p-2 bg-purple-50 border border-purple-300 rounded">
                <p className="text-xs font-semibold text-purple-900 mb-1">
                  💎 Your Member Savings:
                </p>
                <p className="font-bold text-purple-700">
                  ~${memberSavings.savings.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600">
                  {getTierDisplayName(currentTier)} rate
                </p>
              </div>
            )}

            {/* Non-Member: Show potential savings */}
            {!isServiceMember && (
              <div className="mb-3 p-2 bg-blue-50 border border-blue-300 rounded">
                <p className="text-xs font-semibold text-blue-900 mb-1">
                  Member Savings:
                </p>
                <div className="text-xs text-blue-700 space-y-0.5">
                  <p>Premium: ~${allTierSavings.premium.savings.toLocaleString()}</p>
                  <p>Elite: ~${allTierSavings.elite.savings.toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Value added */}
            {template.typical_value_added && (
              <div className="mb-3 p-2 bg-green-50 rounded">
                <p className="text-xs text-gray-600">Typical Value Added</p>
                <p className="font-semibold text-green-700">
                  ${template.typical_value_added.toLocaleString()}
                </p>
              </div>
            )}

            {/* Why it works */}
            {template.why_it_works && template.why_it_works.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold mb-1" style={{ color: '#1B365D' }}>
                  Why This Works:
                </p>
                <ul className="text-xs text-gray-700 space-y-1">
                  {template.why_it_works.slice(0, 2).map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-green-600">✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Special indicators */}
            <div className="flex flex-wrap gap-2 mb-3">
              {template.rental_income_boost > 0 && (
                <Badge variant="outline" className="text-xs">
                  +${template.rental_income_boost}/mo rent
                </Badge>
              )}
              {template.annual_savings > 0 && (
                <Badge variant="outline" className="text-xs">
                  ${template.annual_savings}/yr savings
                </Badge>
              )}
              {template.payback_timeline && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {template.payback_timeline}
                </Badge>
              )}
            </div>

            {/* CTA */}
            <div className="flex gap-2">
              <Button
                asChild
                className="flex-1 font-semibold"
                style={{ backgroundColor: '#3B82F6', minHeight: '44px' }}
              >
                <Link to={createPageUrl("TemplateDetail") + `?id=${template.id}`}>
                  View Details
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
