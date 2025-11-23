import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import PortfolioDistribution from '@/components/demo/PortfolioDistribution';
import PortfolioAnalytics from '@/components/demo/PortfolioAnalytics';
import PortfolioMission from '@/components/demo/PortfolioMission';
import PortfolioROI from '@/components/demo/PortfolioROI';
import AchievementDisplayDemo from '@/components/demo/AchievementDisplayDemo';

export default function DemoPortfolio() {
  const navigate = useNavigate();
  
  const portfolioData = {
    portfolioScore: 84,
    propertyCount: 12,
    certification: 'Bronze Portfolio',
    message: 'Your portfolio is maintained better than 65% of investor portfolios',
    properties: [
      { name: '123 Maple St', score: 92, tier: 'Gold' },
      { name: '456 Oak Ave', score: 88, tier: 'Silver' },
      { name: '789 Cedar Ln', score: 86, tier: 'Silver' },
      { name: '147 Birch Way', score: 82, tier: 'Bronze' },
      { name: '258 Elm St', score: 80, tier: 'Bronze' },
      { name: '369 Pine Rd', score: 78, tier: 'Bronze' },
      { name: '471 Fir Ave', score: 76, tier: 'Bronze' },
      { name: '582 Ash Blvd', score: 75, tier: 'Bronze' },
      { name: '693 Willow Dr', score: 74, tier: 'Participant' },
      { name: '963 Hemlock Ln', score: 70, tier: 'Fair' },
      { name: '852 Spruce Ct', score: 68, tier: 'Fair' },
      { name: '741 Alder St', score: 65, tier: 'Fair' }
    ],
    analytics: {
      avgScore: 84,
      distribution: {
        platinum: 0,
        gold: 1,
        silver: 2,
        bronze: 5,
        participant: 1,
        fair: 3
      },
      weakestLinks: [
        { property: '741 Alder St', score: 65 },
        { property: '852 Spruce Ct', score: 68 },
        { property: '963 Hemlock Ln', score: 70 }
      ]
    },
    mission: {
      title: 'Fix the Bottom 3',
      description: 'Improve your 3 lowest-scoring properties to jump to Silver Portfolio',
      targetScore: 88,
      pointsNeeded: 4,
      properties: [
        {
          name: '741 Alder St',
          currentScore: 65,
          targetScore: 75,
          tasks: [
            { action: 'Professional inspection', points: 6, cost: '$600' },
            { action: 'Fix safety issues', points: 4, cost: '$1,200' }
          ],
          totalCost: '$1,800'
        },
        {
          name: '852 Spruce Ct',
          currentScore: 68,
          targetScore: 76,
          tasks: [
            { action: 'Tenant inspection program', points: 5, cost: 'Free' },
            { action: 'Address deferred maintenance', points: 3, cost: '$900' }
          ],
          totalCost: '$900'
        },
        {
          name: '963 Hemlock Ln',
          currentScore: 70,
          targetScore: 78,
          tasks: [
            { action: 'Implement quarterly checks', points: 4, cost: 'Free' },
            { action: 'Small repairs', points: 4, cost: '$800' }
          ],
          totalCost: '$800'
        }
      ],
      totalInvestment: '$3,500',
      timeline: '3-6 months',
      newPortfolioScore: 88
    },
    roi: {
      investment: 3500,
      savings: {
        loanTerms: 5000,
        insurance: 1800,
        emergencies: 8000
      },
      totalAnnualValue: 14800,
      roi: 423
    },
    achievements: {
      earned: [
        { name: 'Bronze Portfolio', icon: '🏅', earnedDate: '2024-03-15' },
        { name: '50% Consistency', icon: '🏅', earnedDate: '2024-06-10' },
        { name: 'Multi-Property Manager', icon: '🏅', earnedDate: '2024-09-20' }
      ],
      nextUp: [
        { name: 'Silver Portfolio', requirement: 'Avg score 88' },
        { name: 'No Weak Links', requirement: 'All properties 75+' },
        { name: 'Professional Operator', requirement: '12-month track record' }
      ]
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('DemoEntry'))}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Demo Selection
          </Button>
        </div>
        
        {/* HERO SECTION - Above Fold */}
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
          <div className="text-center max-w-2xl">
            <div className="text-6xl mb-4">🏢</div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">The Professional Investor</h1>
            <p className="text-xl text-gray-600 mb-8">12-Property Portfolio</p>
            
            <div className="border-t-2 border-gray-300 my-8"></div>
            
            {/* Score Display */}
            <div className="mb-6">
              <p className="text-gray-600 text-lg mb-2">PORTFOLIO SCORE:</p>
              <div className="text-8xl md:text-9xl font-bold text-blue-600 mb-4">
                {portfolioData.portfolioScore}<span className="text-5xl text-gray-400">/100</span>
              </div>
              <Progress value={portfolioData.portfolioScore} className="h-6 mb-4" />
              <Badge className="bg-amber-600 text-white text-xl px-6 py-2">
                ⭐ BRONZE PORTFOLIO
              </Badge>
            </div>
            
            <p className="text-xl text-gray-700 mb-2">Better than 65% of investor portfolios.</p>
            <p className="text-2xl font-bold text-gray-900 mb-8">Solid foundation. Ready to scale!</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => document.getElementById('breakdown')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-12 py-6 rounded-full shadow-2xl"
              >
                See Your Path to Silver ↓
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate(createPageUrl('Score360') + `?score=${portfolioData.portfolioScore}&name=12-Property Investment Portfolio&address=Vancouver & Portland Metro&propertyType=Multi-Family Portfolio&yearBuilt=Various (1985-2015)&sqft=28000`)}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-xl px-12 py-6 rounded-full shadow-2xl"
              >
                📄 View Score Report
              </Button>
            </div>
          </div>
        </div>
        
        <div id="breakdown" className="py-8"></div>
        
        {/* Info Banner */}
        <Card className="mb-8 bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Building2 className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Your Portfolio is Better Than Most
                </h2>
                <p className="text-gray-700">
                  At 84/100, you're in Bronze Portfolio tier (top 35%). But you're only 4 points from Silver - 
                  and the path is clear: fix your 3 weakest properties.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Analytics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Analytics</h2>
          <PortfolioAnalytics
            avgScore={portfolioData.analytics.avgScore}
            distribution={portfolioData.analytics.distribution}
            weakestLinks={portfolioData.analytics.weakestLinks}
          />
        </div>
        
        {/* Property Distribution */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Properties</h2>
          <PortfolioDistribution
            properties={portfolioData.properties}
            visualization="bars"
          />
        </div>
        
        {/* Mission */}
        <div className="mb-8">
          <PortfolioMission
            title={portfolioData.mission.title}
            description={portfolioData.mission.description}
            targetScore={portfolioData.mission.targetScore}
            pointsNeeded={portfolioData.mission.pointsNeeded}
            properties={portfolioData.mission.properties}
            totalInvestment={portfolioData.mission.totalInvestment}
            timeline={portfolioData.mission.timeline}
            newPortfolioScore={portfolioData.mission.newPortfolioScore}
          />
        </div>
        
        {/* ROI Calculator */}
        <div className="mb-8">
          <PortfolioROI
            investment={portfolioData.roi.investment}
            savings={portfolioData.roi.savings}
            totalAnnualValue={portfolioData.roi.totalAnnualValue}
            roi={portfolioData.roi.roi}
          />
        </div>
        
        {/* Achievements */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Achievements</h2>
          <AchievementDisplayDemo
            earned={portfolioData.achievements.earned}
            nextUp={portfolioData.achievements.nextUp}
          />
        </div>
        
        {/* Final Summary */}
        <Card className="mb-8 bg-blue-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">After Completing This Mission:</h3>
            <div className="space-y-2 text-gray-700">
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Silver Portfolio certification (top 15%)</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>No weak links - all properties 75+</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>$14,800/year in portfolio benefits</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Better loan terms and insurance rates</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Professional-grade portfolio management</span>
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-300">
              <p className="text-sm font-semibold text-blue-900">
                Portfolio improving: 84 → 88 (Bronze → Silver)
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* CTA Section */}
        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-3">Ready to Scale Your Portfolio?</h2>
            <p className="text-lg mb-6 opacity-90">
              Join the waitlist to get your portfolio scored and start managing properties like a pro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-bold"
                onClick={() => navigate(createPageUrl('Waitlist'))}
              >
                Join Waitlist
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate(createPageUrl('DemoEntry'))}
              >
                Try Another Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}