import React, { useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Sparkles,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Home,
  Lightbulb
} from 'lucide-react';
import RecommendationCard, { RecommendationCardSkeleton } from './RecommendationCard';
import {
  generateRecommendations,
  generateDemoRecommendations
} from '@/lib/upgradeRecommendations';
import { useDemo } from '../shared/DemoContext';

/**
 * ForYouSection - Personalized upgrade recommendations
 *
 * Shows top 3 recommendations based on user's property systems,
 * financial profile, and regional costs.
 */
export default function ForYouSection({
  property,
  systems = [],
  regionalCosts,
  lifespanData,
  onStartProject,
  isLoading = false,
  className = ''
}) {
  const { demoMode, isInvestor } = useDemo();

  // Generate recommendations
  const recommendations = useMemo(() => {
    if (demoMode) {
      return generateDemoRecommendations(isInvestor);
    }

    if (!systems || systems.length === 0) {
      return [];
    }

    return generateRecommendations(systems, property, regionalCosts, lifespanData);
  }, [demoMode, isInvestor, systems, property, regionalCosts, lifespanData]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`mb-8 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RecommendationCardSkeleton />
          <RecommendationCardSkeleton />
          <RecommendationCardSkeleton />
        </div>
      </div>
    );
  }

  // No recommendations - show encouraging message
  if (recommendations.length === 0) {
    return (
      <div className={`mb-8 ${className}`}>
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">
              Your Systems Are in Great Shape!
            </h3>
            <p className="text-green-700 mb-4 max-w-md mx-auto">
              Based on your property baseline, all major systems have plenty of life left.
              Browse upgrade ideas below to find ways to add value or improve comfort.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge className="bg-green-600 text-white">No Urgent Upgrades</Badge>
              <Badge variant="outline" className="border-green-300 text-green-700">
                Keep Maintaining
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show top 3 recommendations
  const topRecommendations = recommendations.slice(0, 3);
  const hasMore = recommendations.length > 3;

  // Calculate totals for summary
  const totalPotentialInvestment = topRecommendations.reduce(
    (sum, r) => sum + (r.estimatedCost || 0),
    0
  );
  const totalPotentialValueAdded = topRecommendations.reduce(
    (sum, r) => sum + (r.valueImpact || 0),
    0
  );
  const urgentCount = recommendations.filter(r => r.priority === 'urgent').length;
  const soonCount = recommendations.filter(r => r.priority === 'soon').length;

  return (
    <div className={`mb-8 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
            <p className="text-sm text-gray-600">
              Based on your property systems and financial profile
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-3 text-sm">
          {urgentCount > 0 && (
            <Badge className="bg-red-100 text-red-800 border border-red-300">
              {urgentCount} Urgent
            </Badge>
          )}
          {soonCount > 0 && (
            <Badge className="bg-amber-100 text-amber-800 border border-amber-300">
              {soonCount} Plan Soon
            </Badge>
          )}
          <Badge className="bg-blue-100 text-blue-800 border border-blue-300">
            {recommendations.length} Total Ideas
          </Badge>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>Personalized for your property:</strong> These recommendations are based on
            the systems you documented in Baseline, their age, condition, and your regional costs.
          </p>
        </div>
      </div>

      {/* Recommendation Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topRecommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            onStartProject={onStartProject}
          />
        ))}
      </div>

      {/* View More (if there are additional recommendations) */}
      {hasMore && (
        <div className="mt-4 text-center">
          <Button variant="outline" className="gap-2">
            View {recommendations.length - 3} More Recommendations
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Potential Impact Summary */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-gray-600 mb-1">Potential Investment</p>
            <p className="text-2xl font-bold text-gray-900">
              ${totalPotentialInvestment.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">for top 3 projects</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-green-700 mb-1">Potential Value Added</p>
            <p className="text-2xl font-bold text-green-800">
              +${totalPotentialValueAdded.toLocaleString()}
            </p>
            <p className="text-xs text-green-600">estimated property value increase</p>
          </CardContent>
        </Card>
        <Card className={`${
          totalPotentialValueAdded >= totalPotentialInvestment
            ? 'bg-green-100 border-green-300'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <CardContent className="p-4 text-center">
            <p className={`text-xs mb-1 ${
              totalPotentialValueAdded >= totalPotentialInvestment
                ? 'text-green-700'
                : 'text-amber-700'
            }`}>
              Net Equity Impact
            </p>
            <p className={`text-2xl font-bold ${
              totalPotentialValueAdded >= totalPotentialInvestment
                ? 'text-green-800'
                : 'text-amber-800'
            }`}>
              {totalPotentialValueAdded - totalPotentialInvestment >= 0 ? '+' : ''}
              ${(totalPotentialValueAdded - totalPotentialInvestment).toLocaleString()}
            </p>
            <p className={`text-xs ${
              totalPotentialValueAdded >= totalPotentialInvestment
                ? 'text-green-600'
                : 'text-amber-600'
            }`}>
              if all 3 completed
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * NoSystemsPrompt - Shown when user hasn't documented systems yet
 */
export function NoSystemsPrompt({ onGoToBaseline, className = '' }) {
  return (
    <div className={`mb-8 ${className}`}>
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <Home className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 mb-2">
                Unlock Personalized Recommendations
              </h3>
              <p className="text-amber-800 mb-4">
                Document your home systems in Baseline to get personalized upgrade recommendations
                based on system age, condition, and your property's unique needs.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={onGoToBaseline}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Go to Baseline
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <Button variant="outline" className="border-amber-300 text-amber-700">
                  Browse Ideas Instead
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
