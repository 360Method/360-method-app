import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Calendar, AlertTriangle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ScoreBadgeDemo from '@/components/demo/ScoreBadgeDemo';
import PhaseBreakdownDemo from '@/components/demo/PhaseBreakdownDemo';
import QuickWinsDemo from '@/components/demo/QuickWinsDemo';
import LevelUpPlanDemo from '@/components/demo/LevelUpPlanDemo';
import AchievementDisplayDemo from '@/components/demo/AchievementDisplayDemo';
import NextLevelPreviewDemo from '@/components/demo/NextLevelPreviewDemo';

export default function DemoStruggling() {
  const navigate = useNavigate();
  
  const demoData = {
    name: 'The Fixer-Upper',
    location: 'Vancouver, WA',
    built: 2010,
    totalScore: 62,
    certification: null,
    phases: [
      {
        name: 'KNOW',
        score: 26,
        max: 40,
        description: 'Document your property systems',
        details: {
          issues: [
            'No documentation of systems',
            'Missing age info on key equipment',
            'No maintenance history',
            'No photos of major systems'
          ],
          quickWins: [
            { action: 'Take photos of all 6 systems', points: 6, cost: 'Free' },
            { action: 'Record ages and install dates', points: 4, cost: 'Free' },
            { action: 'Start tracking in app', points: 4, cost: 'Free' }
          ]
        }
      },
      {
        name: 'KEEP',
        score: 18,
        max: 35,
        description: 'Maintain with seasonal inspections',
        details: {
          issues: [
            'No quarterly inspections (0 in last year)',
            'Safety issues not addressed',
            'Reactive repairs only',
            'No maintenance schedule'
          ],
          quickWins: [
            { action: 'Fix CO detector issue', points: 2, cost: '$100' },
            { action: 'Fix GFCI outlets', points: 2, cost: '$400' },
            { action: 'Start quarterly checks', points: 8, cost: 'Free' }
          ]
        }
      },
      {
        name: 'MAKE',
        score: 18,
        max: 25,
        description: 'Strategic improvements and upgrades',
        details: {
          issues: [
            'No preventive maintenance',
            'Systems aging, no replacement plan',
            'No strategic upgrades',
            'No budget for future replacements'
          ],
          quickWins: [
            { action: 'Get professional inspection', points: 6, cost: '$400' },
            { action: 'Create replacement budget', points: 3, cost: 'Free' }
          ]
        }
      }
    ],
    nextLevel: {
      name: 'Bronze',
      threshold: 75,
      benefits: [
        'Official certificate',
        'Better than 65% of homes',
        'Insurance discount (5%)',
        'Proof you maintain properly'
      ]
    },
    quickWins: [
      { action: 'Fix CO detector issue', points: 2, cost: '$100', time: '1 hour', difficulty: 'Easy', category: 'KEEP' },
      { action: 'Fix GFCI outlets', points: 2, cost: '$400', time: '2 hours', difficulty: 'Easy', category: 'KEEP' },
      { action: 'Take photos of all systems', points: 6, cost: 'Free', time: '30 min', difficulty: 'Easy', category: 'KNOW' },
      { action: 'Start quarterly checks', points: 8, cost: 'Free', time: '1 hour', difficulty: 'Easy', category: 'KEEP' }
    ],
    levelUpPlan: [
      {
        name: 'Fix Safety',
        points: 4,
        tasks: [
          { name: 'Add CO detectors', points: 2, cost: '$100' },
          { name: 'Fix GFCI outlets', points: 2, cost: '$400' }
        ],
        cost: '$500',
        time: '1 day',
        newScore: 66
      },
      {
        name: 'Start Tracking',
        points: 8,
        tasks: [
          { name: 'Take system photos', points: 3, cost: 'Free' },
          { name: 'Record ages', points: 2, cost: 'Free' },
          { name: 'Set up app', points: 3, cost: 'Free' }
        ],
        cost: 'Free',
        time: '1 hour',
        newScore: 74
      },
      {
        name: 'Get Certified',
        points: 6,
        tasks: [
          { name: 'Professional inspection', points: 6, cost: '$400' }
        ],
        cost: '$400',
        time: '2 hours',
        newScore: 80
      }
    ],
    achievements: {
      earned: [],
      nextUp: [
        { name: 'Bronze Maintainer', requirement: 'Reach 75 score' },
        { name: 'Safety First', requirement: 'Fix all safety issues' },
        { name: 'Documentation Master', requirement: 'Complete Phase 1' }
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
        <Card className="mb-8 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-4xl">😰</div>
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
                <Badge variant="destructive" className="text-lg px-4 py-1">
                  ⚠️ Not Certifiable Yet
                </Badge>
              </div>
              <ScoreBadgeDemo 
                score={demoData.totalScore} 
                size="large"
                showLabel={false}
                showPercentile={true}
              />
            </div>
            
            <div className="mt-4 p-4 bg-white rounded-lg border-2 border-red-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-semibold">What this score means:</p>
                  <p className="text-gray-700 mt-1">
                    You're reactive, not proactive. Things work... until they don't.
                  </p>
                  <p className="text-sm text-red-600 font-medium mt-2">
                    You're in the bottom 65% of homes
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Warning Banner */}
        <Card className="mb-8 bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-300">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  You're One Surprise Away From Crisis
                </h2>
                <p className="text-gray-700">
                  Without tracking and maintenance, small issues become expensive disasters. 
                  The good news? You're only 13 points from Bronze certification.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Next Level Preview */}
        <div className="mb-8">
          <NextLevelPreviewDemo
            currentScore={demoData.totalScore}
            nextLevel={demoData.nextLevel.name}
            nextThreshold={demoData.nextLevel.threshold}
            pointsNeeded={pointsNeeded}
            benefits={demoData.nextLevel.benefits}
          />
        </div>
        
        {/* Phase Breakdown */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Score Breakdown</h2>
          <PhaseBreakdownDemo phases={demoData.phases} interactive={true} />
        </div>
        
        {/* Quick Wins */}
        <div className="mb-8">
          <QuickWinsDemo 
            title="Quick Wins to Get Started"
            wins={demoData.quickWins}
            showTotal={true}
          />
        </div>
        
        {/* Level Up Plan */}
        <div className="mb-8">
          <LevelUpPlanDemo
            currentScore={demoData.totalScore}
            targetScore={demoData.nextLevel.threshold}
            targetLevel={demoData.nextLevel.name}
            levels={demoData.levelUpPlan}
          />
        </div>
        
        {/* Achievements */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Achievements</h2>
          <AchievementDisplayDemo
            earned={demoData.achievements.earned}
            nextUp={demoData.achievements.nextUp}
          />
        </div>
        
        {/* Final Summary */}
        <Card className="mb-8 bg-blue-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">The Result After Fixing:</h3>
            <div className="space-y-2 text-gray-700">
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Know exactly what you have and its condition</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Safety issues resolved (no more CO or electrical risks)</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Never surprised by big expenses</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Bronze certified - proof you maintain properly</span>
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-300">
              <p className="text-sm font-semibold text-blue-900">
                Score improving: 62 → 80 (Bronze + Silver track)
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* CTA Section */}
        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-3">I Want to Build My Score</h2>
            <p className="text-lg mb-6 opacity-90">
              Join the waitlist to get your starting score and personalized improvement plan
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