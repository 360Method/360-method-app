import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Award, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import ScoreBadge from '@/components/score/ScoreBadge';
import NextMilestone from '@/components/score/NextMilestone';
import { useDemo } from '@/components/shared/DemoContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const CERTIFICATION_LEVELS = {
  platinum: { label: 'Platinum', color: 'from-purple-400 to-purple-600', minScore: 96 },
  gold: { label: 'Gold', color: 'from-yellow-400 to-yellow-600', minScore: 90 },
  silver: { label: 'Silver', color: 'from-gray-400 to-gray-500', minScore: 85 },
  bronze: { label: 'Bronze', color: 'from-amber-600 to-amber-800', minScore: 75 },
  fair: { label: 'Fair', color: 'from-gray-200 to-gray-300', minScore: 0 }
};

const getCertificationLevel = (score) => {
  if (score >= 96) return 'platinum';
  if (score >= 90) return 'gold';
  if (score >= 85) return 'silver';
  if (score >= 75) return 'bronze';
  return 'fair';
};

export default function PropertyScore() {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const [searchParams] = useSearchParams();
  const { demoData } = useDemo();
  
  const propertyIdFromParams = searchParams.get('property_id') || propertyId;
  
  const { data: propertyFromDB } = useQuery({
    queryKey: ['property', propertyIdFromParams],
    queryFn: async () => {
      if (!propertyIdFromParams) return null;
      const props = await base44.entities.Property.filter({ id: propertyIdFromParams });
      return props[0] || null;
    },
    enabled: !!propertyIdFromParams
  });
  
  // Use actual property data, fallback to demo data
  const property = propertyFromDB || demoData?.property || null;
  
  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Property Found</h2>
            <p className="text-gray-600 mb-6">Please select a property to view its score.</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const score = property.health_score || 0;
  const certLevel = getCertificationLevel(score);
  const level = CERTIFICATION_LEVELS[certLevel];
  const isCertified = certLevel !== 'fair';
  
  // Calculate phase scores based on actual property score
  const breakdown = {
    condition: Math.round(score * 0.4),
    maintenance: Math.round(score * 0.35),
    improvement: Math.round(score * 0.25)
  };
  
  const categoryData = [
    {
      name: 'AWARE (Own)',
      score: breakdown.condition,
      maxScore: 40,
      description: 'System documentation and property baseline',
      improvements: [
        'Complete all system baseline documentation',
        'Add photos for all major systems',
        'Document warranty and service records'
      ]
    },
    {
      name: 'ACT (Build)',
      score: breakdown.maintenance,
      maxScore: 35,
      description: 'Inspection routines and maintenance consistency',
      improvements: [
        'Complete all 4 seasonal inspections',
        'Address all identified issues promptly',
        'Maintain perfect quarterly check record'
      ]
    },
    {
      name: 'ADVANCE (Grow)',
      score: breakdown.improvement,
      maxScore: 25,
      description: 'Strategic upgrades and system preservation',
      improvements: [
        'Implement preservation recommendations',
        'Complete strategic upgrades',
        'Optimize system lifespans'
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
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">360° Property Score</h1>
                {isCertified && (
                  <Badge 
                    className="text-white"
                    style={{
                      background: score >= 96 ? 'linear-gradient(to right, #A855F7, #9333EA)' :
                        score >= 90 ? 'linear-gradient(to right, #FACC15, #EAB308)' :
                        score >= 85 ? 'linear-gradient(to right, #9CA3AF, #6B7280)' :
                        'linear-gradient(to right, #F59E0B, #D97706)'
                    }}
                  >
                    {level.label} Certified
                  </Badge>
                )}
              </div>
              <p className="text-gray-600">{property.address || property.street_address}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/score360?property_id=' + (propertyIdFromParams || property.id))}
              className="gap-2"
            >
              View Full Report
            </Button>
          </div>
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
                  score={score} 
                  certificationLevel={certLevel}
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
          currentScore={score}
          certificationLevel={certLevel}
          quickWins={[
            { action: 'Complete system baseline', points: Math.max(40 - breakdown.condition, 0), cost: 'Free' },
            { action: 'Schedule seasonal inspection', points: Math.max(35 - breakdown.maintenance, 0), cost: '$200' },
            { action: 'Add strategic upgrades', points: Math.max(25 - breakdown.improvement, 0), cost: '$500+' }
          ].filter(w => w.points > 0)}
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