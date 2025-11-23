import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Calendar, TrendingUp } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ScoreBadgeDemo from '@/components/demo/ScoreBadgeDemo';
import PhaseBreakdownDemo from '@/components/demo/PhaseBreakdownDemo';
import QuickWinsDemo from '@/components/demo/QuickWinsDemo';
import LevelUpPlanDemo from '@/components/demo/LevelUpPlanDemo';
import AchievementDisplayDemo from '@/components/demo/AchievementDisplayDemo';
import NextLevelPreviewDemo from '@/components/demo/NextLevelPreviewDemo';
import { useDemo } from '@/components/shared/DemoContext';

export default function DemoImproving() {
  const navigate = useNavigate();
  const { enterDemoMode } = useDemo();

  useEffect(() => {
    enterDemoMode('homeowner', 'improving');
  }, []);
  
  const demoData = {
    name: 'The Improver',
    location: 'Camas, WA',
    built: 2010,
    totalScore: 78,
    certification: 'bronze',
    phases: [
      {
        name: 'AWARE',
        score: 35,
        max: 40,
        description: 'Own your property baseline',
        details: {
          issues: [
            'Missing some warranty documentation',
            'Contractor relationships not fully documented'
          ],
          quickWins: [
            { action: 'Add warranty documentation', points: 3, cost: 'Free' },
            { action: 'Document contractor relationships', points: 2, cost: 'Free' }
          ]
        }
      },
      {
        name: 'ACT',
        score: 28,
        max: 35,
        description: 'Build maintenance routines',
        details: {
          issues: [
            'Skipped 1 of 4 quarterly checks last year',
            'Some preventive tasks delayed',
            'Not tracking all maintenance'
          ],
          quickWins: [
            { action: 'Complete ALL 4 quarterly checks', points: 4, cost: 'Free' },
            { action: 'Never skip maintenance', points: 3, cost: 'Free' }
          ]
        }
      },
      {
        name: 'ADVANCE',
        score: 15,
        max: 25,
        description: 'Grow property value strategically',
        details: {
          issues: [
            'No strategic upgrades yet',
            'Not maximizing system lifespans',
            'Missing optimization opportunities'
          ],
          quickWins: [
            { action: 'Add smart thermostat', points: 1, cost: '$250' },
            { action: 'Schedule annual HVAC service', points: 2, cost: '$150' },
            { action: 'Install leak detectors', points: 1, cost: '$80' },
            { action: 'Start preventive HVAC maintenance', points: 6, cost: '$300' }
          ]
        }
      }
    ],
    nextLevel: {
      name: 'Silver',
      threshold: 85,
      benefits: [
        'All Bronze benefits, PLUS:',
        'Better than 85% of homes',
        'Insurance discount (10%)',
        'Faster home sale (15-20 days)',
        'Home value increase (3-5%)'
      ]
    },
    quickWins: [
      { action: 'Complete all 4 quarterly checks this year', points: 4, cost: 'Free', time: '1 hour total', difficulty: 'Easy', category: 'KEEP' },
      { action: 'Add smart thermostat', points: 1, cost: '$250', time: '2 hours', difficulty: 'Medium', category: 'MAKE' },
      { action: 'Annual HVAC service', points: 2, cost: '$150', time: '3 hours', difficulty: 'Easy', category: 'MAKE' }
    ],
    levelUpPlan: [
      {
        name: 'Perfect Your Routine',
        points: 4,
        tasks: [
          { name: 'Complete all 4 quarterly checks this year', points: 4, cost: 'Free' }
        ],
        cost: 'Free',
        time: '1 hour total',
        newScore: 82
      },
      {
        name: 'Optimize Systems',
        points: 3,
        tasks: [
          { name: 'Add smart thermostat', points: 1, cost: '$250' },
          { name: 'Annual HVAC service', points: 2, cost: '$150' }
        ],
        cost: '$400',
        time: '3 hours',
        newScore: 85
      }
    ],
    achievements: {
      earned: [
        { name: 'Bronze Maintainer', icon: '🏅', earnedDate: '2024-03-15' },
        { name: 'Consistent Inspector', icon: '🏅', earnedDate: '2024-06-20' },
        { name: 'Early Adopter', icon: '🏅', earnedDate: '2024-01-10' },
        { name: 'Systems Optimizer', icon: '🏅', earnedDate: '2024-09-05' }
      ],
      nextUp: [
        { name: 'Silver Standard', requirement: 'Reach 85 score' },
        { name: 'Perfect Quarter', requirement: 'Complete all 4 quarterly checks' },
        { name: 'Smart Home Advocate', requirement: 'Add 3 smart devices' }
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
        
        {/* HERO SECTION - Above Fold */}
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-8">
          <div className="text-center max-w-2xl">
            <div className="text-6xl mb-4">😊</div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{demoData.name}</h1>
            <p className="text-xl text-gray-600 mb-2">{demoData.location}</p>
            <p className="text-lg text-gray-500 mb-8">Built {demoData.built}</p>
            
            <div className="border-t-2 border-gray-300 my-8"></div>
            
            {/* Score Display */}
            <div className="mb-6">
              <p className="text-gray-600 text-lg mb-2">YOUR SCORE:</p>
              <div className="text-8xl md:text-9xl font-bold text-amber-600 mb-4">
                {demoData.totalScore}<span className="text-5xl text-gray-400">/100</span>
              </div>
              <Progress value={demoData.totalScore} className="h-6 mb-4" />
              <Badge className="bg-amber-600 text-white text-xl px-6 py-2">
                ⭐ BRONZE CERTIFIED
              </Badge>
            </div>
            
            <p className="text-xl text-gray-700 mb-2">Better than 65 out of 100 homes.</p>
            <p className="text-2xl font-bold text-gray-900 mb-8">You're on the right track!</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => document.getElementById('breakdown')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xl px-12 py-6 rounded-full shadow-2xl"
              >
                See Your Path to Silver ↓
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate(createPageUrl('Score360') + `?property_id=demo-improving-001`)}
                className="border-2 border-amber-600 text-amber-600 hover:bg-amber-50 text-xl px-12 py-6 rounded-full shadow-2xl"
              >
                📄 View Score Report
              </Button>
            </div>
          </div>
        </div>
        
        <div id="breakdown" className="py-8"></div>
        
        {/* What This Score Means */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Does a 78 Mean?</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl mb-2">✅</div>
                <p className="font-semibold text-gray-900">You're maintaining consistently</p>
                <p className="text-sm text-gray-600 mt-1">Better than 65 out of 100 homes</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">📊</div>
                <p className="font-semibold text-gray-900">Bronze Certified</p>
                <p className="text-sm text-gray-600 mt-1">You track your home systems</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <div className="text-3xl mb-2">🎯</div>
                <p className="font-semibold text-gray-900">7 points to Silver</p>
                <p className="text-sm text-gray-600 mt-1">Top 15% within reach</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Where You Stand</h2>
          <PhaseBreakdownDemo phases={demoData.phases} interactive={true} />
        </div>

        {/* Path to Silver */}
        <Card className="mb-8 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">🥈</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Path to Silver</h2>
                <p className="text-gray-600">Just 7 points away from top 15%</p>
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <div className="text-2xl">1️⃣</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">Perfect Your Routine</h3>
                  <p className="text-gray-700 mb-2">Complete all 4 quarterly checks this year</p>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-600">+4 points</Badge>
                    <span className="text-sm text-gray-600">Free • 1 hour total</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <div className="text-2xl">2️⃣</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">Add Smart Protection</h3>
                  <p className="text-gray-700 mb-2">Smart thermostat saves energy + tracks data</p>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-600">+1 point</Badge>
                    <span className="text-sm text-gray-600">$250 • 2 hours</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <div className="text-2xl">3️⃣</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">Get Professional Maintenance</h3>
                  <p className="text-gray-700 mb-2">Annual HVAC service prevents breakdowns</p>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-600">+2 points</Badge>
                    <span className="text-sm text-gray-600">$150 • 3 hours</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-100 rounded-lg">
              <p className="font-bold text-gray-900 mb-1">Total Investment: $400</p>
              <p className="text-sm text-gray-700">Reach 85 score → Silver Certification → Top 15%</p>
            </div>
          </CardContent>
        </Card>

        {/* What You Get at Silver */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Potential Benefits at Silver (85+)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💰</div>
                <div>
                  <p className="font-semibold text-gray-900">Potential Insurance Benefits</p>
                  <p className="text-sm text-gray-600">May qualify for lower premiums</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🏠</div>
                <div>
                  <p className="font-semibold text-gray-900">Improved Marketability</p>
                  <p className="text-sm text-gray-600">Faster sale potential</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">📈</div>
                <div>
                  <p className="font-semibold text-gray-900">Property Value</p>
                  <p className="text-sm text-gray-600">Enhanced value positioning</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🎖️</div>
                <div>
                  <p className="font-semibold text-gray-900">Silver Badge</p>
                  <p className="text-sm text-gray-600">Better than 85% of homes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compare to Other Homes */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How You Compare</h2>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">The Struggling Home</span>
                  <Badge variant="destructive">62 score</Badge>
                </div>
                <Progress value={62} className="h-2 mb-2" />
                <p className="text-sm text-gray-700">No tracking. Reactive maintenance. High risk.</p>
              </div>

              <div className="p-4 bg-amber-50 border-2 border-amber-500 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">You (The Improver)</span>
                  <Badge className="bg-amber-600">78 score ⭐</Badge>
                </div>
                <Progress value={78} className="h-2 mb-2" />
                <p className="text-sm text-gray-700">Consistent tracking. Bronze certified. Improving.</p>
              </div>

              <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-lg opacity-60">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">Target: Silver Level</span>
                  <Badge className="bg-gray-500">85 score ⭐⭐</Badge>
                </div>
                <Progress value={85} className="h-2 mb-2" />
                <p className="text-sm text-gray-700">Top 15%. Insurance discounts. Higher value.</p>
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
            <h2 className="text-3xl font-bold mb-3">Ready to Build Your Score?</h2>
            <p className="text-lg mb-6 opacity-90">
              Join the waitlist to track your property's score and earn certifications
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
              Demo uses hypothetical data. Actual scores, costs, timelines, and benefits vary by property and circumstances.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}