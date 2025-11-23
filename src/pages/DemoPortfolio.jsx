import React, { useEffect } from 'react';
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
import { useDemo } from '@/components/shared/DemoContext';
import { DEMO_PORTFOLIO_INVESTOR } from '@/components/shared/demoPropertyInvestor';

export default function DemoPortfolio() {
  const navigate = useNavigate();
  const { enterDemoMode } = useDemo();

  useEffect(() => {
    enterDemoMode('investor');
  }, []);
  
  // Use actual demo data
  const { properties } = DEMO_PORTFOLIO_INVESTOR;
  
  const portfolioScore = Math.round(
    properties.reduce((sum, p) => sum + p.health_score, 0) / properties.length
  );
  
  const getTier = (score) => {
    if (score >= 96) return 'Platinum';
    if (score >= 90) return 'Gold';
    if (score >= 85) return 'Silver';
    if (score >= 75) return 'Bronze';
    return 'Fair';
  };
  
  const portfolioData = {
    portfolioScore,
    propertyCount: properties.length,
    certification: getTier(portfolioScore) + ' Portfolio',
    message: `Your portfolio is maintained better than ${portfolioScore < 65 ? 35 : portfolioScore < 75 ? 50 : portfolioScore < 85 ? 65 : 85}% of investor portfolios`,
    properties: properties.map(p => ({
      name: p.nickname || p.address,
      score: p.health_score,
      tier: getTier(p.health_score),
      id: p.id
    })).sort((a, b) => b.score - a.score),
    analytics: {
      avgScore: portfolioScore,
      distribution: {
        platinum: properties.filter(p => p.health_score >= 96).length,
        gold: properties.filter(p => p.health_score >= 90 && p.health_score < 96).length,
        silver: properties.filter(p => p.health_score >= 85 && p.health_score < 90).length,
        bronze: properties.filter(p => p.health_score >= 75 && p.health_score < 85).length,
        participant: properties.filter(p => p.health_score >= 65 && p.health_score < 75).length,
        fair: properties.filter(p => p.health_score < 65).length
      },
      weakestLinks: properties
        .map(p => ({ property: p.nickname || p.address, score: p.health_score }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
    },
    mission: {
      title: 'Elevate Cedar Court',
      description: 'Fix the underperforming 4-plex to boost portfolio average',
      targetScore: 85,
      pointsNeeded: portfolioScore < 85 ? 85 - portfolioScore : 0,
      properties: [
        {
          name: properties[2].nickname,
          currentScore: properties[2].health_score,
          targetScore: 75,
          tasks: properties[2].quickWins || [],
          totalCost: '$2,825'
        }
      ],
      totalInvestment: '$2,825',
      timeline: '2-4 months',
      newPortfolioScore: 85
    },
    roi: {
      investment: 2825,
      savings: {
        loanTerms: 4200,
        insurance: 1600,
        emergencies: 12000
      },
      totalAnnualValue: 17800,
      roi: 630
    },
    achievements: {
      earned: [
        { name: 'Multi-Property Manager', icon: '🏅', earnedDate: '2023-03-15' },
        { name: 'Platinum Property Owner', icon: '👑', earnedDate: '2024-10-15' },
        { name: 'Preservation Pro', icon: '🛡️', earnedDate: '2024-08-20' }
      ],
      nextUp: [
        { name: 'Silver Portfolio', requirement: 'Avg score 85+' },
        { name: 'No Weak Links', requirement: 'All properties 75+' },
        { name: 'Gold Portfolio', requirement: 'Avg score 90+' }
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
            <p className="text-xl text-gray-600 mb-8">{portfolioData.propertyCount}-Property Portfolio</p>
            
            <div className="border-t-2 border-gray-300 my-8"></div>
            
            {/* Score Display */}
            <div className="mb-6">
              <p className="text-gray-600 text-lg mb-2">PORTFOLIO SCORE:</p>
              <div className="text-8xl md:text-9xl font-bold text-blue-600 mb-4">
                {portfolioData.portfolioScore}<span className="text-5xl text-gray-400">/100</span>
              </div>
              <Progress value={portfolioData.portfolioScore} className="h-6 mb-4" />
              <Badge className={`text-white text-xl px-6 py-2 ${
                portfolioScore >= 90 ? 'bg-yellow-500' :
                portfolioScore >= 85 ? 'bg-gray-400' :
                portfolioScore >= 75 ? 'bg-amber-600' :
                'bg-orange-500'
              }`}>
                {portfolioScore >= 96 ? '👑 PLATINUM' :
                 portfolioScore >= 90 ? '⭐⭐⭐ GOLD' :
                 portfolioScore >= 85 ? '⭐⭐ SILVER' :
                 portfolioScore >= 75 ? '⭐ BRONZE' :
                 'FAIR'} PORTFOLIO
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
                onClick={() => navigate(createPageUrl('Score360') + `?property_id=demo-investor-1`)}
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
                className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-bold"
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
            <p className="text-xs opacity-75 mt-6">
              Demo uses hypothetical portfolio data. Actual scores, ROI, loan terms, and savings vary by portfolio, market, and lender.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}