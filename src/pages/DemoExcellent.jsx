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
        
        {/* What This Score Means */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Does a 92 Mean?</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                <div className="text-3xl mb-2">🏆</div>
                <p className="font-semibold text-gray-900">Elite Homeowner</p>
                <p className="text-sm text-gray-600 mt-1">Top 5% of all homes</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl mb-2">📈</div>
                <p className="font-semibold text-gray-900">3-Year Journey</p>
                <p className="text-sm text-gray-600 mt-1">From 68 → 92 score</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl mb-2">👑</div>
                <p className="font-semibold text-gray-900">Almost Platinum</p>
                <p className="text-sm text-gray-600 mt-1">Just 4 points to top 1%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Journey */}
        <Card className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your 3-Year Journey to Excellence</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 text-center">
                  <div className="text-2xl font-bold text-gray-400">68</div>
                  <div className="text-xs text-gray-500">2022</div>
                </div>
                <div className="flex-1 p-4 bg-white rounded-lg">
                  <p className="font-semibold text-gray-900">Started Tracking</p>
                  <p className="text-sm text-gray-600">Began systematic maintenance</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 text-center">
                  <div className="text-2xl font-bold text-amber-600">76</div>
                  <div className="text-xs text-gray-500">2022</div>
                </div>
                <div className="flex-1 p-4 bg-white rounded-lg border-2 border-amber-200">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">Bronze Certified</p>
                    <Badge className="bg-amber-600">⭐</Badge>
                  </div>
                  <p className="text-sm text-gray-600">First certification milestone</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 text-center">
                  <div className="text-2xl font-bold text-gray-500">85</div>
                  <div className="text-xs text-gray-500">2023</div>
                </div>
                <div className="flex-1 p-4 bg-white rounded-lg border-2 border-gray-300">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">Silver Certified</p>
                    <Badge className="bg-gray-500">⭐⭐</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Top 15% of all homes</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 text-center">
                  <div className="text-2xl font-bold text-yellow-600">92</div>
                  <div className="text-xs text-gray-500">2024</div>
                </div>
                <div className="flex-1 p-4 bg-white rounded-lg border-2 border-yellow-300">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">Gold Certified</p>
                    <Badge className="bg-yellow-600">⭐⭐⭐</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Elite status - Top 5%</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-green-100 rounded-lg">
              <p className="font-bold text-gray-900">+24 points in 3 years</p>
              <p className="text-sm text-gray-700">Consistent maintenance + smart upgrades</p>
            </div>
          </CardContent>
        </Card>

        {/* What Makes This Home Elite */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Makes This Home Elite</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">✓ Perfect Tracking</p>
                <p className="text-sm text-gray-600">All systems documented with photos, ages, warranties</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">✓ Never Missed a Check</p>
                <p className="text-sm text-gray-600">All 4 quarterly checks for 3 years straight</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">✓ Fast Response</p>
                <p className="text-sm text-gray-600">Issues fixed within 48 hours, not weeks</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">✓ Professional Care</p>
                <p className="text-sm text-gray-600">Annual HVAC service, roof inspections</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">✓ Smart Protection</p>
                <p className="text-sm text-gray-600">Leak detectors, smart thermostat, monitoring</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">✓ Proactive Replacements</p>
                <p className="text-sm text-gray-600">Replaced water heater at 12 years, not 18</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nearly Perfect Scores</h2>
          <p className="text-gray-600 mb-4">
            Just a few advanced optimizations to reach Platinum
          </p>
          <PhaseBreakdownDemo phases={demoData.phases} interactive={true} />
        </div>

        {/* Path to Platinum */}
        <Card className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-10 h-10 text-purple-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">The Final Frontier: Platinum</h2>
                <p className="text-gray-600">Top 1% - Only 4 points away</p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <div className="text-2xl">1️⃣</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">Whole-House Surge Protection</h3>
                  <p className="text-gray-700 mb-2">Protects all electronics from power surges</p>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-purple-600">+1 point</Badge>
                    <span className="text-sm text-gray-600">$400 • 2 hours</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <div className="text-2xl">2️⃣</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">Advanced Leak Detection</h3>
                  <p className="text-gray-700 mb-2">Catches leaks before they cause damage</p>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-purple-600">+1 point</Badge>
                    <span className="text-sm text-gray-600">$500 • 3 hours</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <div className="text-2xl">3️⃣</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">Energy Optimization Program</h3>
                  <p className="text-gray-700 mb-2">Ongoing monitoring + quarterly adjustments</p>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-purple-600">+2 points</Badge>
                    <span className="text-sm text-gray-600">$300 • Ongoing</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-100 rounded-lg">
              <p className="font-bold text-gray-900 mb-1">Total: $1,200 → Platinum (96)</p>
              <p className="text-sm text-gray-700">Top 1% elite status • Maximum benefits</p>
            </div>
          </CardContent>
        </Card>

        {/* Compare to Other Homes */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How You Compare</h2>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg opacity-40">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">The Struggling Home</span>
                  <Badge variant="destructive">62 score</Badge>
                </div>
                <Progress value={62} className="h-2 mb-2" />
                <p className="text-sm text-gray-700">Reactive. No tracking. High risk.</p>
              </div>

              <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg opacity-60">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">The Improver</span>
                  <Badge className="bg-amber-600">78 score ⭐</Badge>
                </div>
                <Progress value={78} className="h-2 mb-2" />
                <p className="text-sm text-gray-700">Bronze certified. Improving steadily.</p>
              </div>

              <div className="p-4 bg-yellow-50 border-2 border-yellow-500 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">You (The Achiever)</span>
                  <Badge className="bg-yellow-600">92 score ⭐⭐⭐</Badge>
                </div>
                <Progress value={92} className="h-2 mb-2" />
                <p className="text-sm text-gray-700">Gold certified. Elite maintenance. Top 5%.</p>
              </div>

              <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-lg opacity-60">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">Target: Platinum</span>
                  <Badge className="bg-purple-600">96 score 👑</Badge>
                </div>
                <Progress value={96} className="h-2 mb-2" />
                <p className="text-sm text-gray-700">Top 1%. Maximum benefits. Legacy status.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Achievements</h2>
          <AchievementDisplayDemo
            earned={demoData.achievements.earned}
            nextUp={demoData.achievements.nextUp}
          />
        </div>
        
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