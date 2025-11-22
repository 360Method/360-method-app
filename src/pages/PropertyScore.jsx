import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Download, Award, TrendingUp, CheckCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useDemo } from '../components/shared/DemoContext';
import ScoreBadge from '../components/shared/ScoreBadge';
import { format } from 'date-fns';

export default function PropertyScore() {
  const navigate = useNavigate();
  const location = useLocation();
  const { demoMode, demoData, isInvestor } = useDemo();
  
  // Get property ID from URL
  const searchParams = new URLSearchParams(location.search);
  const propertyId = searchParams.get('propertyId');
  
  // Find the property
  let property = null;
  if (demoMode) {
    if (isInvestor) {
      property = demoData?.properties?.find(p => p.id === propertyId) || demoData?.properties?.[0];
    } else {
      property = demoData?.property;
    }
  }
  
  if (!property || !property.totalScore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                360° Score Not Available
              </h2>
              <p className="text-gray-600 mb-6">
                This property doesn't have score data yet.
              </p>
              <Button onClick={() => navigate(createPageUrl('Properties'))}>
                Back to Properties
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  const { totalScore, certificationLevel, isCertified, certifiedBy, certificationDate, expiresAt, scoreBreakdown } = property;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('Properties'))}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Properties
        </Button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            360° Property Score
          </h1>
          <p className="text-lg text-gray-600">
            {property.address || property.nickname}
          </p>
        </div>

        {/* Main Score Display */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1">
            <ScoreBadge
              score={totalScore}
              level={certificationLevel}
              certified={isCertified}
              certifiedBy={certifiedBy}
              size="large"
            />
            
            {isCertified && certificationDate && (
              <Card className="mt-4 border-2 border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-900">Certified</span>
                  </div>
                  <div className="text-xs text-green-800 space-y-1">
                    <div>Certified: {format(new Date(certificationDate), 'MMM d, yyyy')}</div>
                    <div>Expires: {format(new Date(expiresAt), 'MMM d, yyyy')}</div>
                    <div>By: {certifiedBy}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>What This Score Means</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 mb-4">
                      Your property scored <strong>{totalScore}/100</strong>, earning a <strong>{certificationLevel.toUpperCase()}</strong> certification level.
                    </p>
                    
                    {certificationLevel === 'platinum' && (
                      <p className="text-gray-700">
                        💎 <strong>Exemplar Property</strong> - Top 1% of all certified properties. Your systematic maintenance approach is exceptional.
                      </p>
                    )}
                    
                    {certificationLevel === 'gold' && (
                      <p className="text-gray-700">
                        🥇 <strong>Excellent Condition</strong> - Top 5% of certified properties. Your proactive care prevents expensive failures.
                      </p>
                    )}
                    
                    {certificationLevel === 'silver' && (
                      <p className="text-gray-700">
                        🥈 <strong>Very Good</strong> - Above average maintenance consistency. A few improvements will boost you to Gold.
                      </p>
                    )}
                    
                    {certificationLevel === 'bronze' && (
                      <p className="text-gray-700">
                        🥉 <strong>Good Start</strong> - You're tracking systems and preventing disasters. Continue building momentum.
                      </p>
                    )}
                    
                    {certificationLevel === 'participant' && (
                      <p className="text-gray-700">
                        ✓ <strong>Active Participant</strong> - You're engaged in preventive maintenance. Focus on consistency to reach Bronze.
                      </p>
                    )}
                    
                    {certificationLevel === 'fair' && (
                      <p className="text-gray-700">
                        ⚠️ <strong>Needs Improvement</strong> - Your property has potential but requires attention to reach certification standards.
                      </p>
                    )}
                    
                    {certificationLevel === 'poor' && (
                      <p className="text-gray-700">
                        ❗ <strong>Action Required</strong> - Critical systems need immediate attention. Focus on safety and major systems first.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Your Score</div>
                      <div className="text-3xl font-bold text-blue-600">{totalScore}</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Avg Certified</div>
                      <div className="text-3xl font-bold text-green-600">83</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Score Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Overall Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-gray-900">Total Score</span>
                <span className="text-2xl font-bold text-blue-600">{totalScore}/100</span>
              </div>
              <Progress value={totalScore} className="h-3" />
            </div>

            {/* Category 1: Condition */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-base font-bold text-gray-900">Condition</span>
                  <p className="text-xs text-gray-600">System health & safety compliance</p>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {scoreBreakdown.condition}/40
                </span>
              </div>
              <Progress value={(scoreBreakdown.condition / 40) * 100} className="h-2" />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {Math.round((scoreBreakdown.condition / 40) * 100)}%
              </div>
            </div>

            {/* Category 2: Maintenance */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-base font-bold text-gray-900">Maintenance</span>
                  <p className="text-xs text-gray-600">Inspection consistency & response time</p>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {scoreBreakdown.maintenance}/35
                </span>
              </div>
              <Progress value={(scoreBreakdown.maintenance / 35) * 100} className="h-2" />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {Math.round((scoreBreakdown.maintenance / 35) * 100)}%
              </div>
            </div>

            {/* Category 3: Improvement */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-base font-bold text-gray-900">Improvement</span>
                  <p className="text-xs text-gray-600">Preservation activities & strategic upgrades</p>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {scoreBreakdown.improvement}/25
                </span>
              </div>
              <Progress value={(scoreBreakdown.improvement / 25) * 100} className="h-2" />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {Math.round((scoreBreakdown.improvement / 25) * 100)}%
              </div>
            </div>

            {/* Climate Bonus */}
            {scoreBreakdown.climateBonus > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-green-600">Climate Bonus</span>
                    <p className="text-xs text-gray-600">Regional adaptation measures</p>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    +{scoreBreakdown.climateBonus}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Improve Your Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Continue using the 360° Method to maintain and improve your property score:
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate(createPageUrl('Inspect'))}
                className="w-full flex items-center justify-between p-4 bg-white border border-blue-200 rounded-lg hover:shadow-md transition-all text-left"
                style={{ minHeight: '48px' }}
              >
                <div>
                  <div className="font-semibold text-gray-900">Complete Seasonal Inspections</div>
                  <div className="text-xs text-gray-600">Maintain high maintenance score</div>
                </div>
                <ArrowLeft className="w-5 h-5 text-blue-600 rotate-180" />
              </button>
              
              <button
                onClick={() => navigate(createPageUrl('Preserve'))}
                className="w-full flex items-center justify-between p-4 bg-white border border-blue-200 rounded-lg hover:shadow-md transition-all text-left"
                style={{ minHeight: '48px' }}
              >
                <div>
                  <div className="font-semibold text-gray-900">Extend System Lifespans</div>
                  <div className="text-xs text-gray-600">Boost improvement score</div>
                </div>
                <ArrowLeft className="w-5 h-5 text-blue-600 rotate-180" />
              </button>
              
              <button
                onClick={() => navigate(createPageUrl('Upgrade'))}
                className="w-full flex items-center justify-between p-4 bg-white border border-blue-200 rounded-lg hover:shadow-md transition-all text-left"
                style={{ minHeight: '48px' }}
              >
                <div>
                  <div className="font-semibold text-gray-900">Strategic Upgrades</div>
                  <div className="text-xs text-gray-600">Add value & improve scores</div>
                </div>
                <ArrowLeft className="w-5 h-5 text-blue-600 rotate-180" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => alert('Download feature coming soon!')}
          >
            <Download className="w-4 h-4" />
            Download Certificate
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => alert('Share feature coming soon!')}
          >
            <Award className="w-4 h-4" />
            Share Score
          </Button>
        </div>

      </div>
    </div>
  );
}