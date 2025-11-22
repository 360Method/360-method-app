import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Calendar, Star, Crown } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ScoreBadgeDemo from '@/components/demo/ScoreBadgeDemo';
import PhaseBreakdownDemo from '@/components/demo/PhaseBreakdownDemo';
import QuickWinsDemo from '@/components/demo/QuickWinsDemo';
import AchievementDisplayDemo from '@/components/demo/AchievementDisplayDemo';
import NextLevelPreviewDemo from '@/components/demo/NextLevelPreviewDemo';
import EliteBannerDemo from '@/components/demo/EliteBannerDemo';
import PerformanceTimelineDemo from '@/components/demo/PerformanceTimelineDemo';

export default function DemoExcellent() {
  const navigate = useNavigate();
  
  const demoData = {
    name: 'The Achiever',
    location: 'Battle Ground, WA',
    built: 2012,
    totalScore: 92,
    certification: 'gold',
    phases: [
      {
        name: 'AWARE',
        score: 38,
        max: 40,
        description: 'Own your property baseline',
        details: {
          issues: [
            'Missing advanced system analytics (requires 3+ years data)',
            'Historical trending incomplete (will auto-complete with time)'
          ],
          quickWins: [
            { action: 'Advanced system analytics', points: 1, cost: 'Free' },
            { action: '3+ year historical trending', points: 1, cost: 'Time' }
          ]
        }
      },
      {
        name: 'ACT',
        score: 34,
        max: 35,
        description: 'Build maintenance routines',
        details: {
          issues: [
            '5+ year perfect track record pending (keep going!)'
          ],
          quickWins: [
            { action: 'Maintain perfect record for 2+ more years', points: 1, cost: 'Free' }
          ]
        }
      },
      {
        name: 'ADVANCE',
        score: 20,
        max: 25,
        description: 'Grow property value strategically',
        details: {
          issues: [
            'Missing some advanced protection systems',
            'Energy optimization program not yet implemented'
          ],
          quickWins: [
            { action: 'Whole-house surge protection', points: 1, cost: '$400' },
            { action: 'Advanced leak detection system', points: 1, cost: '$500' },
            { action: 'Energy optimization program', points: 2, cost: '$300' }
          ]
        }
      }
    ],
    nextLevel: {
      name: 'Platinum',
      threshold: 96,
      benefits: [
        'Top 1% elite status',
        'Maximum insurance discount (15%)',
        'Premium home sale positioning',
        'Industry benchmark property',
        'Legacy status after 3+ years'
      ]
    },
    quickWins: [
      { action: 'Whole-house surge protection', points: 1, cost: '$400', time: '2 hours', difficulty: 'Medium', category: 'MAKE' },
      { action: 'Advanced leak detection system', points: 1, cost: '$500', time: '3 hours', difficulty: 'Medium', category: 'MAKE' },
      { action: 'Energy optimization program', points: 2, cost: '$300', time: 'Ongoing', difficulty: 'Easy', category: 'MAKE' }
    ],
    achievements: {
      earned: [
        { name: 'Bronze Maintainer', icon: '🏅', earnedDate: '2022-06-15' },
        { name: 'Silver Standard', icon: '🏅', earnedDate: '2023-02-10' },
        { name: 'Gold Achievement', icon: '🥇', earnedDate: '2024-01-20' },
        { name: '3-Year Consistency', icon: '🏅', earnedDate: '2025-01-10' },
        { name: 'Perfect Inspector', icon: '🏅', earnedDate: '2024-03-01' },
        { name: 'Systems Master', icon: '🏅', earnedDate: '2024-09-15' }
      ],
      nextUp: [
        { name: 'Platinum Elite', requirement: 'Reach 96 score' },
        { name: 'Top 1% Club', requirement: 'Maintain Platinum for 6 months' },
        { name: 'Legacy Property', requirement: 'Maintain excellence for 5+ years' }
      ]
    },
    timeline: {
      startScore: 68,
      currentScore: 92,
      timeframe: '3 years',
      milestones: [
        { 
          date: '2022-01-15', 
          event: 'Started tracking', 
          score: 68,
          description: 'Began systematic maintenance approach',
          badge: 'Started',
          badgeColor: 'bg-blue-600'
        },
        { 
          date: '2022-06-20', 
          event: 'Earned Bronze', 
          score: 76,
          description: 'Achieved first certification milestone',
          badge: '⭐ Bronze',
          badgeColor: 'bg-amber-600'
        },
        { 
          date: '2023-02-10', 
          event: 'Earned Silver', 
          score: 85,
          description: 'Top 15% of all homes',
          badge: '⭐⭐ Silver',
          badgeColor: 'bg-gray-500'
        },
        { 
          date: '2024-01-20', 
          event: 'Earned Gold', 
          score: 92,
          description: 'Elite status - Top 5% of homes',
          badge: '⭐⭐⭐ Gold',
          badgeColor: 'bg-yellow-600'
        }
      ]
    }
  };
  
  const pointsNeeded = demoData.nextLevel.threshold - demoData.totalScore;
  
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
        
        {/* Property Header */}
        <Card className="mb-8 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-4xl">🏆</div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{demoData.name}</h1>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <Home className="w-4 h-4" />
                      <span>{demoData.location}</span>
                      <span>•</span>
                      <Calendar className="w-4 h-4" />
                      <span>Built {demoData.built}</span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-yellow-500 text-white text-lg px-4 py-1">
                  ⭐⭐⭐ Gold Certified
                </Badge>
              </div>
              <ScoreBadgeDemo 
                score={demoData.totalScore} 
                size="large"
                showLabel={false}
                showPercentile={true}
              />
            </div>
            
            <div className="mt-4 p-4 bg-white rounded-lg">
              <div className="flex items-start gap-2">
                <Crown className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-semibold">What this score means:</p>
                  <p className="text-gray-700 mt-1">
                    You're in the TOP 5% of all homes. Elite maintenance. Exceptional care.
                  </p>
                  <p className="text-sm text-yellow-700 font-medium mt-2 flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-600" />
                    Better than 95 out of 100 homes
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Elite Banner */}
        <div className="mb-8">
          <EliteBannerDemo
            title="Gold Certification"
            subtitle="Better than 95 out of 100 homes"
            message="You've achieved elite homeowner status through consistent excellence"
            icon="🏆"
          />
        </div>
        
        {/* Platinum Preview */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-gray-50 to-purple-50 border-2 border-gray-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-8 h-8 text-purple-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">The Final Frontier: Platinum</h2>
                  <p className="text-sm text-gray-600">Only 1% of all homes reach this level</p>
                </div>
              </div>
              
              <NextLevelPreviewDemo
                currentScore={demoData.totalScore}
                nextLevel={demoData.nextLevel.name}
                nextThreshold={demoData.nextLevel.threshold}
                pointsNeeded={pointsNeeded}
                benefits={demoData.nextLevel.benefits}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Performance Timeline */}
        <div className="mb-8">
          <PerformanceTimelineDemo
            startScore={demoData.timeline.startScore}
            currentScore={demoData.timeline.currentScore}
            timeframe={demoData.timeline.timeframe}
            milestones={demoData.timeline.milestones}
          />
        </div>
        
        {/* Phase Breakdown */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Score Breakdown</h2>
          <p className="text-gray-600 mb-4">
            Nearly perfect across all phases - just a few advanced optimizations remain
          </p>
          <PhaseBreakdownDemo phases={demoData.phases} interactive={true} />
        </div>
        
        {/* Quick Wins to Platinum */}
        <div className="mb-8">
          <QuickWinsDemo 
            title="Path to Platinum"
            wins={demoData.quickWins}
            showTotal={true}
          />
        </div>
        
        {/* All Achievements */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Achievement Showcase</h2>
          <AchievementDisplayDemo
            earned={demoData.achievements.earned}
            nextUp={demoData.achievements.nextUp}
          />
        </div>
        
        {/* Final Summary */}
        <Card className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Why This Home is Elite:</h3>
            <div className="space-y-2 text-gray-700">
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Never missed a quarterly check in 3 years</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>All preventive tasks completed on schedule</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Issues fixed within 48 hours</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Professional inspections annual</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Smart systems and proactive replacements</span>
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-green-300">
              <p className="text-sm font-semibold text-green-900">
                Only 4 points from Platinum - Top 1% status within reach
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* CTA Section */}
        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-3">Ready to Achieve Excellence?</h2>
            <p className="text-lg mb-6 opacity-90">
              Join the waitlist to start your journey to elite property maintenance
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