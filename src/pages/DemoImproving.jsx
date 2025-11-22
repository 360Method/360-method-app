import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Calendar, TrendingUp } from 'lucide-react';
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

export default function DemoImproving() {
  const navigate = useNavigate();
  
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
        
        {/* Property Header */}
        <Card className="mb-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-4xl">😊</div>
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
                <Badge className="bg-amber-600 text-white text-lg px-4 py-1">
                  ⭐ Bronze Certified
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
              <p className="text-gray-700 font-medium">
                You're maintaining systematically. Better than 65% of all homes.
              </p>
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Score improving from 68 → 78 this year
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Celebration Banner */}
        <Card className="mb-8 bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300">
          <CardContent className="p-6 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bronze Certification Earned!
            </h2>
            <p className="text-gray-700">
              You're better than 65 out of 100 homes. Keep going!
            </p>
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