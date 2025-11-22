import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Award, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import ScoreBadge from '@/components/score/ScoreBadge';
import NextMilestone from '@/components/score/NextMilestone';
import { useDemo } from '@/components/shared/DemoContext';

const CERTIFICATION_LEVELS = {
  platinum: { label: 'Platinum', color: 'from-gray-300 to-gray-400', minScore: 95 },
  gold: { label: 'Gold', color: 'from-yellow-400 to-yellow-600', minScore: 90 },
  silver: { label: 'Silver', color: 'from-gray-400 to-gray-500', minScore: 85 },
  bronze: { label: 'Bronze', color: 'from-amber-700 to-amber-900', minScore: 75 },
  fair: { label: 'Fair', color: 'from-gray-200 to-gray-300', minScore: 0 }
};

export default function PropertyScore() {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const { demoData } = useDemo();
  
  // For demo, use demo property data
  const property = demoData?.property || {
    address: '1234 Maple Street',
    totalScore: 92,
    certificationLevel: 'gold',
    breakdown: {
      condition: 36,
      maintenance: 34,
      improvement: 18
    },
    quickWins: [
      { action: 'Complete quarterly inspections', points: 2, cost: 'Free' },
      { action: 'Schedule annual HVAC service', points: 2, cost: '$150' },
      { action: 'Add exterior cameras', points: 1, cost: '$300' }
    ]
  };
  
  const level = CERTIFICATION_LEVELS[property.certificationLevel] || CERTIFICATION_LEVELS.fair;
  const isCertified = property.certificationLevel !== 'fair';
  
  const categoryData = [
    {
      name: 'Property Condition',
      score: property.breakdown.condition,
      maxScore: 40,
      description: 'Physical state of systems and structures',
      improvements: [
        'Complete all baseline documentation',
        'Address 2 outstanding maintenance items',
        'Update aging HVAC system'
      ]
    },
    {
      name: 'Maintenance History',
      score: property.breakdown.maintenance,
      maxScore: 35,
      description: 'Consistency and quality of upkeep',
      improvements: [
        'Complete seasonal inspection',
        'Log 3 recent maintenance tasks',
        'Schedule annual HVAC service'
      ]
    },
    {
      name: 'Value Improvement',
      score: property.breakdown.improvement,
      maxScore: 25,
      description: 'Strategic upgrades and preservation',
      improvements: [
        'Complete 1 high-ROI upgrade',
        'Document energy efficiency improvements',
        'Implement preservation recommendations'
      ]
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">360° Property Score</h1>
            {isCertified && (
              <Badge className={`bg-gradient-to-r ${level.color} text-white`}>
                {level.label} Certified
              </Badge>
            )}
          </div>
          <p className="text-gray-600 mt-2">{property.address}</p>
        </div>
        
        {/* Overall Score Card */}
        <Card className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Property Score</h2>
                <p className="text-gray-600 mb-4">
                  Your property's comprehensive health and value rating
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Based on {categoryData.length} key categories</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>Updated daily as you maintain your property</span>
                  </div>
                  {isCertified && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Award className="w-4 h-4 text-yellow-600" />
                      <span>{level.label} Certification achieved</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <ScoreBadge 
                  score={property.totalScore} 
                  certificationLevel={property.certificationLevel}
                  size="xl"
                  showTrend
                  showPercentile
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Next Milestone */}
        <NextMilestone 
          currentScore={property.totalScore}
          certificationLevel={property.certificationLevel}
          quickWins={property.quickWins || []}
        />
        
        {/* Score Breakdown */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Score Breakdown</h3>
          
          {categoryData.map((category) => {
            const percentage = (category.score / category.maxScore) * 100;
            const isGood = percentage >= 80;
            const isFair = percentage >= 60 && percentage < 80;
            
            return (
              <Card key={category.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        {category.score}
                        <span className="text-lg text-gray-500">/{category.maxScore}</span>
                      </div>
                      <Badge 
                        variant={isGood ? 'default' : isFair ? 'secondary' : 'destructive'}
                        className="mt-1"
                      >
                        {isGood ? 'Excellent' : isFair ? 'Good' : 'Needs Attention'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={percentage} className="mb-4 h-3" />
                  
                  {percentage < 100 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">How to Improve</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            {category.improvements.map((improvement, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                <span>{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Certification Levels Reference */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Certification Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(CERTIFICATION_LEVELS).map(([key, level]) => (
                <div 
                  key={key}
                  className={`p-4 rounded-lg border-2 ${
                    property.certificationLevel === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${level.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                      {level.minScore}+
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{level.label}</div>
                      <div className="text-xs text-gray-600">
                        {key === 'fair' ? 'Below 75' : `${level.minScore}+ points`}
                      </div>
                    </div>
                    {property.certificationLevel === key && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}