import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ScoreBadge from '../components/score/ScoreBadge';
import { useDemo } from '../components/shared/DemoContext';
import { DEMO_PROPERTY_HOMEOWNER } from '../components/shared/demoPropertyHomeowner';
import { DEMO_PORTFOLIO_INVESTOR } from '../components/shared/demoPropertyInvestor';

export default function PropertyScore() {
  const navigate = useNavigate();
  const { demoMode, demoData, isInvestor } = useDemo();
  
  // Get property data based on demo mode
  const property = demoMode 
    ? (isInvestor ? demoData?.property : DEMO_PROPERTY_HOMEOWNER.property)
    : null;
  
  if (!property || !property.totalScore) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Score data not available for this property.</p>
        </div>
      </div>
    );
  }

  const { totalScore, certificationLevel, scoreBreakdown, isCertified, certifiedBy, certificationDate } = property;
  
  const getScoreLabel = (score) => {
    if (score >= 96) return 'Exemplar';
    if (score >= 90) return 'Excellent';
    if (score >= 85) return 'Very Good';
    if (score >= 75) return 'Good';
    if (score >= 65) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
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
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            360° Property Score
          </h1>
          <p className="text-gray-600">
            Comprehensive assessment of condition, maintenance, and improvement
          </p>
        </div>

        {/* Score Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <ScoreBadge
            score={totalScore}
            level={certificationLevel}
            certified={isCertified}
            certifiedBy={certifiedBy}
            certificationDate={certificationDate}
            size="large"
            showDetails={true}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Overall Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Total Score</span>
                    <span className="text-sm font-bold text-gray-900">{totalScore}/100</span>
                  </div>
                  <Progress value={totalScore} className="h-3" />
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {getScoreLabel(totalScore)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {totalScore >= 90 && "This property is exceptionally well-maintained and demonstrates systematic care."}
                    {totalScore >= 75 && totalScore < 90 && "This property shows good maintenance practices with room for optimization."}
                    {totalScore >= 65 && totalScore < 75 && "This property meets basic standards with opportunities for improvement."}
                    {totalScore < 65 && "This property needs attention to prevent costly repairs and maintain value."}
                  </p>
                </div>
                
                {isCertified && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold text-green-900">Professionally Certified</div>
                      <div className="text-green-700">
                        This score has been verified by {certifiedBy}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Score Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Condition Score */}
              <div>
                <div className="flex justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">CONDITION</h3>
                    <p className="text-xs text-gray-500">System health & safety compliance</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {scoreBreakdown.condition}<span className="text-lg text-gray-500">/40</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.round((scoreBreakdown.condition / 40) * 100)}%
                    </div>
                  </div>
                </div>
                <Progress 
                  value={(scoreBreakdown.condition / 40) * 100} 
                  className="h-2"
                />
                <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-xs text-blue-600 font-medium mb-1">Critical Systems</div>
                    <div className="text-lg font-bold text-blue-900">21/24</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-xs text-green-600 font-medium mb-1">Safety</div>
                    <div className="text-lg font-bold text-green-900">10/10</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-xs text-purple-600 font-medium mb-1">Envelope</div>
                    <div className="text-lg font-bold text-purple-900">5/6</div>
                  </div>
                </div>
              </div>

              {/* Maintenance Score */}
              <div>
                <div className="flex justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">MAINTENANCE</h3>
                    <p className="text-xs text-gray-500">Inspection consistency & response time</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {scoreBreakdown.maintenance}<span className="text-lg text-gray-500">/35</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.round((scoreBreakdown.maintenance / 35) * 100)}%
                    </div>
                  </div>
                </div>
                <Progress 
                  value={(scoreBreakdown.maintenance / 35) * 100} 
                  className="h-2"
                />
                <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-xs text-blue-600 font-medium mb-1">Inspections</div>
                    <div className="text-lg font-bold text-blue-900">15/15</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-xs text-orange-600 font-medium mb-1">Response Time</div>
                    <div className="text-lg font-bold text-orange-900">11/12</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-xs text-green-600 font-medium mb-1">Documentation</div>
                    <div className="text-lg font-bold text-green-900">8/8</div>
                  </div>
                </div>
              </div>

              {/* Improvement Score */}
              <div>
                <div className="flex justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">IMPROVEMENT</h3>
                    <p className="text-xs text-gray-500">Preservation activities & strategic upgrades</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {scoreBreakdown.improvement}<span className="text-lg text-gray-500">/25</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.round((scoreBreakdown.improvement / 25) * 100)}%
                    </div>
                  </div>
                </div>
                <Progress 
                  value={(scoreBreakdown.improvement / 25) * 100} 
                  className="h-2"
                />
                <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-xs text-blue-600 font-medium mb-1">Preservation</div>
                    <div className="text-lg font-bold text-blue-900">8/10</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-xs text-purple-600 font-medium mb-1">Upgrades</div>
                    <div className="text-lg font-bold text-purple-900">4/10</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-xs text-green-600 font-medium mb-1">Longevity</div>
                    <div className="text-lg font-bold text-green-900">2/5</div>
                  </div>
                </div>
              </div>

              {/* Climate Bonus */}
              {scoreBreakdown.climateBonus !== 0 && (
                <div>
                  <div className="flex justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">CLIMATE BONUS</h3>
                      <p className="text-xs text-gray-500">Region-specific adaptations</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        +{scoreBreakdown.climateBonus}
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-900">
                    <div className="font-medium mb-1">Pacific Northwest Adaptations</div>
                    <div className="text-xs text-blue-700">
                      ✓ Moisture management • ✓ Enhanced ventilation
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* How to Improve */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              How to Improve Your Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {totalScore < 96 && (
                <>
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                    <h3 className="font-bold text-purple-900 mb-2">
                      Quick Wins (Can add {Math.min(6, 96 - totalScore)} points)
                    </h3>
                    <div className="space-y-3 text-sm">
                      {totalScore < 90 && (
                        <>
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 border-2 border-purple-600 rounded mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-gray-900">
                                Complete seasonal inspections
                              </div>
                              <div className="text-gray-600">
                                Impact: +2 points | Cost: Free | Time: 30 min/quarter
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 border-2 border-purple-600 rounded mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-gray-900">
                                Add smart leak detector
                              </div>
                              <div className="text-gray-600">
                                Impact: +1 point | Cost: $300-400 | Time: 2 hours
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 border-2 border-purple-600 rounded mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-gray-900">
                            Schedule preventive maintenance
                          </div>
                          <div className="text-gray-600">
                            Impact: +2 points | Cost: $150-300 | Time: 1-2 hours
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-bold text-blue-900 mb-2">
                      Potential New Score: {Math.min(100, totalScore + 6)} 
                      {totalScore < 90 && totalScore + 6 >= 90 && " (Would reach GOLD level!)"}
                    </h3>
                    <p className="text-sm text-blue-800">
                      These improvements would increase your property value and reduce future repair costs
                    </p>
                  </div>
                </>
              )}
              
              {totalScore >= 96 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-bold text-green-900 mb-2">
                    Exceptional Property Maintenance!
                  </h3>
                  <p className="text-sm text-green-800">
                    You're in the top 1% of certified properties. Keep up the excellent work!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}