import React, { useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Printer, Trophy, TrendingUp, Shield, AlertTriangle, CheckCircle2, DollarSign, Home as HomeIcon, Calendar } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function Score360() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const printRef = useRef(null);
  
  // Demo data - in real app, this would come from property data
  const score = parseInt(searchParams.get('score')) || 78;
  const propertyName = searchParams.get('name') || 'My Property';
  const propertyAddress = searchParams.get('address') || 'Vancouver, WA';
  const propertyType = searchParams.get('propertyType') || 'Single-Family Home';
  const yearBuilt = searchParams.get('yearBuilt') || '2015';
  const sqft = searchParams.get('sqft') || '2400';
  
  const getCertification = (score) => {
    if (score >= 96) return { level: 'Platinum', stars: '👑', color: 'purple', text: 'Top 1%' };
    if (score >= 90) return { level: 'Gold', stars: '⭐⭐⭐', color: 'yellow', text: 'Top 5%' };
    if (score >= 85) return { level: 'Silver', stars: '⭐⭐', color: 'gray', text: 'Top 15%' };
    if (score >= 75) return { level: 'Bronze', stars: '⭐', color: 'amber', text: 'Top 35%' };
    return { level: 'Fair', stars: '', color: 'red', text: 'Bottom 65%' };
  };
  
  const cert = getCertification(score);
  
  const phases = [
    { name: 'AWARE (Own)', score: Math.round(score * 0.4), max: 40 },
    { name: 'ACT (Build)', score: Math.round(score * 0.35), max: 35 },
    { name: 'ADVANCE (Grow)', score: Math.round(score * 0.25), max: 25 }
  ];
  
  const handleDownloadPDF = () => {
    window.print();
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${propertyName} - 360° Score: ${score}`,
          text: `Check out my property's 360° Score: ${score}/100 - ${cert.level} Certified!`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Action Bar - Don't print */}
      <div className="bg-white border-b border-gray-200 p-4 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button
              onClick={handleDownloadPDF}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>
      
      {/* Printable Professional Report */}
      <div ref={printRef} className="max-w-5xl mx-auto p-8 bg-white print:p-12 print:max-w-none">
        
        {/* Professional Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg mb-8 print:rounded-none">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6911a3ab5b84ed3aa2d106c2/ea24cb40a_GreyProfessionalMonogramCircularBrandLogo.png" 
                  alt="360° Method" 
                  className="w-16 h-16 bg-white rounded-lg p-2"
                />
                <div>
                  <h1 className="text-4xl font-bold">360° Property Score</h1>
                  <p className="text-blue-100 text-lg">Official Maintenance Certificate</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Report Date</p>
              <p className="font-semibold text-lg">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-blue-100 text-xs mt-2">Certificate ID: {propertyAddress.replace(/\s/g, '').substring(0, 6).toUpperCase()}-{score}-{new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
        
        {/* Property Info Card */}
        <Card className="mb-8 border-2">
          <CardHeader className="bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{propertyName}</CardTitle>
                <p className="text-gray-600 flex items-center gap-2">
                  <HomeIcon className="w-4 h-4" />
                  {propertyAddress}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:text-right">
                <div>
                  <p className="text-sm text-gray-600">Property Type</p>
                  <p className="font-semibold">{propertyType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Year Built</p>
                  <p className="font-semibold">{yearBuilt}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Square Footage</p>
                  <p className="font-semibold">{parseInt(sqft).toLocaleString()} sq ft</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Score Showcase */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left: Big Score */}
          <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Overall Score</p>
            <div className="relative">
              <svg className="w-48 h-48" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke={score >= 90 ? '#EAB308' : score >= 75 ? '#F59E0B' : '#DC2626'}
                  strokeWidth="12"
                  strokeDasharray={`${(score / 100) * 534} 534`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-bold text-gray-900">{score}</span>
                <span className="text-2xl text-gray-500">/100</span>
              </div>
            </div>
            <Badge className={`mt-4 px-6 py-2 text-lg bg-${cert.color}-600`}>
              {cert.stars} {cert.level} Certified
            </Badge>
            <p className="text-sm text-gray-600 mt-2">{cert.text} of all properties</p>
          </div>

          {/* Right: Quick Stats */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">Maintenance Level</p>
                  <p className="text-gray-600">
                    {score >= 90 ? 'Elite - Top 5% of all properties' : 
                     score >= 75 ? 'Systematic - Better than most' : 
                     score >= 65 ? 'Developing - Room for improvement' : 
                     'Reactive - High risk of surprises'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">Risk Assessment</p>
                  <p className="text-gray-600">
                    {score >= 85 ? 'Low Risk - Well maintained' : 
                     score >= 70 ? 'Moderate Risk - Some gaps' : 
                     'High Risk - Needs attention'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">Percentile Ranking</p>
                  <p className="text-gray-600">
                    Better than {score < 65 ? 35 : score < 75 ? 50 : score < 85 ? 65 : score < 90 ? 85 : 95}% of similar properties
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Executive Summary */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {score >= 90 ? (
              <div className="space-y-3">
                <p className="text-gray-900 font-semibold text-lg">Elite Maintenance Standard</p>
                <p className="text-gray-700 leading-relaxed">
                  This property demonstrates exceptional maintenance practices placing it in the top 5% nationwide. 
                  All major systems are comprehensively documented with detailed service histories. Regular seasonal 
                  inspections prevent small issues from becoming costly repairs. A proactive maintenance schedule 
                  ensures systems receive care before problems develop.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-blue-200">
                  <div>
                    <p className="text-sm text-gray-600">Documentation</p>
                    <p className="font-bold text-green-700">Comprehensive</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Inspection Frequency</p>
                    <p className="font-bold text-green-700">Quarterly</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Response Time</p>
                    <p className="font-bold text-green-700">Within 48 hours</p>
                  </div>
                </div>
              </div>
            ) : score >= 75 ? (
              <div className="space-y-3">
                <p className="text-gray-900 font-semibold text-lg">Systematic Maintenance Approach</p>
                <p className="text-gray-700 leading-relaxed">
                  This property maintains strong systematic practices that place it above 65% of comparable properties. 
                  Key systems have documented service records and routine inspections catch most issues early. 
                  A preventive maintenance schedule is in place, though opportunities exist to expand documentation 
                  and increase inspection frequency for even better results.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-blue-200">
                  <div>
                    <p className="text-sm text-gray-600">Documentation</p>
                    <p className="font-bold text-amber-700">Good</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Inspection Frequency</p>
                    <p className="font-bold text-amber-700">Semi-Annual</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Response Time</p>
                    <p className="font-bold text-amber-700">Within 1 week</p>
                  </div>
                </div>
              </div>
            ) : score >= 65 ? (
              <div className="space-y-3">
                <p className="text-gray-900 font-semibold text-lg">Developing Maintenance Habits</p>
                <p className="text-gray-700 leading-relaxed">
                  This property shows emerging maintenance awareness with some tracking in place, but significant 
                  gaps remain. Documentation is incomplete for many systems, inspections happen irregularly, and 
                  preventive maintenance is limited. Without improvement, this property faces elevated risk of 
                  unexpected major repairs and expenses.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-blue-200">
                  <div>
                    <p className="text-sm text-gray-600">Documentation</p>
                    <p className="font-bold text-orange-700">Partial</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Inspection Frequency</p>
                    <p className="font-bold text-orange-700">Annual</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Response Time</p>
                    <p className="font-bold text-orange-700">Reactive</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-900 font-semibold text-lg">Reactive Maintenance Approach</p>
                <p className="text-gray-700 leading-relaxed">
                  This property operates in reactive mode - addressing issues only after they become problems. 
                  Little to no system documentation exists, inspections are rare or nonexistent, and no preventive 
                  maintenance schedule is followed. This creates high risk of expensive emergency repairs, potential 
                  cascade failures, and significant financial exposure.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-red-200">
                  <div>
                    <p className="text-sm text-gray-600">Documentation</p>
                    <p className="font-bold text-red-700">Minimal</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Inspection Frequency</p>
                    <p className="font-bold text-red-700">Rare/None</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Response Time</p>
                    <p className="font-bold text-red-700">Emergency Only</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Score Breakdown */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Score Breakdown</h3>
            <div className="space-y-4">
              {phases.map((phase, idx) => {
                const percentage = (phase.score / phase.max) * 100;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{phase.name}</span>
                      <span className="text-gray-600">{phase.score}/{phase.max} points</span>
                    </div>
                    <Progress value={percentage} className="h-3" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* What This Score Means - Narrative Section */}
        <div className="mb-8 print:hidden">
          {score < 65 ? (
            <div className="space-y-6">
              <Card className="border-2 border-red-200 bg-red-50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">What a {score} Score Means:</h3>
                  <p className="text-xl text-gray-700 mb-6">
                    Your home works... until something breaks.<br />
                    Then it's a $5,000 surprise.
                  </p>
                  
                  <div className="bg-white p-6 rounded-lg border-2 border-red-300">
                    <h4 className="font-bold text-xl text-gray-900 mb-4">You have:</h4>
                    <div className="space-y-3">
                      <p className="text-lg text-gray-700 flex items-start gap-3">
                        <span className="text-red-500 text-2xl">❌</span>
                        <span>No idea what's about to fail</span>
                      </p>
                      <p className="text-lg text-gray-700 flex items-start gap-3">
                        <span className="text-red-500 text-2xl">❌</span>
                        <span>No prevention plan</span>
                      </p>
                      <p className="text-lg text-gray-700 flex items-start gap-3">
                        <span className="text-red-500 text-2xl">❌</span>
                        <span>No records or documentation</span>
                      </p>
                      <p className="text-lg text-gray-700 flex items-start gap-3">
                        <span className="text-red-500 text-2xl">❌</span>
                        <span>No system</span>
                      </p>
                    </div>
                    <p className="text-xl font-bold text-red-600 mt-6">
                      Translation: You're just crossing your fingers.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200 bg-orange-50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">What Happens If You Do Nothing:</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg border-2 border-red-200">
                      <div className="flex items-start gap-4">
                        <Calendar className="w-8 h-8 text-red-600 flex-shrink-0" />
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-2">Next 6 months:</h4>
                          <p className="text-gray-700 mb-2">Your water heater dies on a Sunday morning.</p>
                          <p className="text-2xl font-bold text-red-600">Emergency plumber: $2,500</p>
                          <p className="text-sm text-gray-600 mt-1">(Planned replacement would've been $1,200)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border-2 border-red-200">
                      <div className="flex items-start gap-4">
                        <Calendar className="w-8 h-8 text-red-600 flex-shrink-0" />
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-2">Next 12 months:</h4>
                          <p className="text-gray-700 mb-2">Small roof leak you didn't know about damages your attic.</p>
                          <p className="text-2xl font-bold text-red-600">Repair + cleanup: $8,000</p>
                          <p className="text-sm text-gray-600 mt-1">(Catching it early would've been $200)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-red-600 text-white rounded-lg text-center">
                      <p className="text-xl mb-2">TOTAL IF YOU DO NOTHING:</p>
                      <p className="text-5xl font-bold mb-2">$10,000+</p>
                      <p className="text-lg">This is what a {score} score predicts.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : score < 75 ? (
            <Card className="border-2 border-amber-200 bg-amber-50 mb-8">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">What a {score} Score Means:</h3>
                <p className="text-xl text-gray-700 mb-6">
                  You're tracking some things, but gaps remain. You're better than most, but not yet systematic enough to prevent all surprises.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border-2 border-green-200">
                    <h4 className="font-bold text-green-700 mb-3">What You're Doing Right:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Some system documentation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Occasional inspections</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Addressing major issues</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border-2 border-orange-200">
                    <h4 className="font-bold text-orange-700 mb-3">What's Missing:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span>Incomplete documentation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span>Irregular inspection schedule</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span>No prevention plan</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : score < 90 ? (
            <Card className="border-2 border-yellow-200 bg-yellow-50 mb-8">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">What a {score} Score Means:</h3>
                <p className="text-xl text-gray-700 mb-6">
                  You're systematic and consistent. You're in the top tier of homeowners. Just a few optimizations away from elite status.
                </p>
                
                <div className="bg-white p-6 rounded-lg border-2 border-green-300">
                  <h4 className="font-bold text-green-700 text-lg mb-3">What Makes You Stand Out:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Comprehensive documentation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Consistent inspections</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Proactive maintenance</span>
                      </li>
                    </ul>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Fast issue resolution</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Smart upgrades</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Prevention focus</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-purple-200 bg-purple-50 mb-8">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">What a {score} Score Means:</h3>
                <p className="text-xl text-gray-700 mb-6">
                  You're in the top 1-5% of all properties. Elite maintenance standard. Your home is a benchmark for others.
                </p>
                
                <div className="bg-white p-6 rounded-lg border-2 border-purple-300">
                  <h4 className="font-bold text-purple-700 text-lg mb-3">Elite Status Achievements:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <Trophy className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Perfect system tracking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Trophy className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Never missed inspections</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Trophy className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Professional maintenance</span>
                      </li>
                    </ul>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <Trophy className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Smart protection systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Trophy className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Proactive replacements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Trophy className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Strategic value building</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Path to Next Level */}
        {score < 96 && (
          <Card className="mb-8 border-2 border-blue-200 bg-blue-50 print:hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Your Path to {score < 75 ? 'Bronze (75)' : score < 85 ? 'Silver (85)' : score < 90 ? 'Gold (90)' : 'Platinum (96)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                You're <span className="font-bold text-blue-600">{(score < 75 ? 75 : score < 85 ? 85 : score < 90 ? 90 : 96) - score} points</span> away from your next certification level.
              </p>
              
              <div className="space-y-4">
                {score < 65 && (
                  <>
                    <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">1</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg mb-2">Fix the Dangerous Stuff</h4>
                          <p className="text-gray-700 mb-3">Add CO detectors, fix electrical outlets near water</p>
                          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="text-center">
                              <DollarSign className="w-5 h-5 mx-auto mb-1 text-green-600" />
                              <p className="font-bold text-gray-900">$600</p>
                              <p className="text-xs text-gray-600">Cost</p>
                            </div>
                            <div className="text-center">
                              <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                              <p className="font-bold text-gray-900">1 day</p>
                              <p className="text-xs text-gray-600">Time</p>
                            </div>
                            <div className="text-center">
                              <TrendingUp className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                              <p className="font-bold text-gray-900">+4</p>
                              <p className="text-xs text-gray-600">Points</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">2</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg mb-2">Start Tracking Your Home</h4>
                          <p className="text-gray-700 mb-3">Document your 6 main systems, take photos, note ages</p>
                          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="text-center">
                              <DollarSign className="w-5 h-5 mx-auto mb-1 text-green-600" />
                              <p className="font-bold text-gray-900">FREE</p>
                              <p className="text-xs text-gray-600">Cost</p>
                            </div>
                            <div className="text-center">
                              <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                              <p className="font-bold text-gray-900">1 hour</p>
                              <p className="text-xs text-gray-600">Time</p>
                            </div>
                            <div className="text-center">
                              <TrendingUp className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                              <p className="font-bold text-gray-900">+8</p>
                              <p className="text-xs text-gray-600">Points</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">3</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg mb-2">Get One Professional Inspection</h4>
                          <p className="text-gray-700 mb-3">Expert assessment of all systems, complete report</p>
                          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="text-center">
                              <DollarSign className="w-5 h-5 mx-auto mb-1 text-green-600" />
                              <p className="font-bold text-gray-900">$400</p>
                              <p className="text-xs text-gray-600">Cost</p>
                            </div>
                            <div className="text-center">
                              <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                              <p className="font-bold text-gray-900">2 hours</p>
                              <p className="text-xs text-gray-600">Time</p>
                            </div>
                            <div className="text-center">
                              <TrendingUp className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                              <p className="font-bold text-gray-900">+6</p>
                              <p className="text-xs text-gray-600">Points</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {score >= 65 && score < 75 && (
                  <>
                    <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
                      <h4 className="font-bold text-gray-900 text-lg mb-3">Quick Wins to Reach Bronze (75):</h4>
                      <ul className="space-y-3">
                        <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-900">Complete all system documentation</span>
                          <Badge className="bg-green-600">+{Math.min(75 - score, 5)} pts</Badge>
                        </li>
                        <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-900">Schedule regular inspections</span>
                          <Badge className="bg-green-600">+{Math.min(Math.max(75 - score - 5, 0), 4)} pts</Badge>
                        </li>
                        <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-900">Create maintenance calendar</span>
                          <Badge className="bg-green-600">+{Math.max(75 - score - 9, 0)} pts</Badge>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
                
                {score >= 75 && score < 85 && (
                  <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
                    <h4 className="font-bold text-gray-900 text-lg mb-3">Path to Silver (85):</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">Perfect your quarterly inspection routine</span>
                        <Badge className="bg-green-600">+4 pts</Badge>
                      </li>
                      <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">Add smart home monitoring</span>
                        <Badge className="bg-green-600">+2 pts</Badge>
                      </li>
                      <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">Complete advanced system documentation</span>
                        <Badge className="bg-green-600">+{85 - score - 6} pts</Badge>
                      </li>
                    </ul>
                  </div>
                )}
                
                {score >= 85 && score < 90 && (
                  <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
                    <h4 className="font-bold text-gray-900 text-lg mb-3">Path to Gold (90):</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">3+ year perfect maintenance record</span>
                        <Badge className="bg-yellow-600">+2 pts</Badge>
                      </li>
                      <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">Advanced protection systems</span>
                        <Badge className="bg-yellow-600">+2 pts</Badge>
                      </li>
                      <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">Strategic preservation program</span>
                        <Badge className="bg-yellow-600">+{90 - score - 4} pts</Badge>
                      </li>
                    </ul>
                  </div>
                )}
                
                {score >= 90 && (
                  <div className="bg-white p-6 rounded-lg border-2 border-purple-200">
                    <h4 className="font-bold text-gray-900 text-lg mb-3">Path to Platinum (96) - Top 1%:</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">Whole-house surge protection</span>
                        <Badge className="bg-purple-600">+1 pt</Badge>
                      </li>
                      <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">Advanced leak detection system</span>
                        <Badge className="bg-purple-600">+1 pt</Badge>
                      </li>
                      <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">Energy optimization program</span>
                        <Badge className="bg-purple-600">+2 pts</Badge>
                      </li>
                      <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">5+ year excellence record</span>
                        <Badge className="bg-purple-600">+{Math.max(96 - score - 4, 0)} pts</Badge>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                <p className="text-lg mb-2">Total Investment to Next Level:</p>
                <p className="text-4xl font-bold mb-2">
                  {score < 65 ? '$1,000' : score < 75 ? '$200' : score < 85 ? '$400' : score < 90 ? '$800' : '$1,200'}
                </p>
                <p className="text-sm opacity-90">
                  Potential savings: {score < 75 ? '$5,000-15,000' : score < 85 ? '$3,000-8,000' : '$2,000-5,000'} in first year
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certified Benefits or Path Forward */}
        {score >= 75 ? (
          <Card className="mb-8 border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                Certified Benefits & Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                {cert.level} certification unlocks tangible financial benefits and market advantages:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border-2 border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Insurance Discount</p>
                      <p className="text-3xl font-bold text-green-600 my-2">
                        {score >= 90 ? '15%' : score >= 85 ? '10%' : '5%'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Eligible for homeowner's insurance discount. Save ${score >= 90 ? '300-500' : score >= 85 ? '200-300' : '100-200'}/year.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border-2 border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <HomeIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Increased Home Value</p>
                      <p className="text-3xl font-bold text-blue-600 my-2">
                        {score >= 90 ? '5-8%' : score >= 85 ? '3-5%' : '2-3%'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Well-maintained homes command premium pricing and attract quality buyers faster.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border-2 border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Faster Sale Time</p>
                      <p className="text-3xl font-bold text-purple-600 my-2">
                        {score >= 85 ? '20-30' : '15-20'} days
                      </p>
                      <p className="text-sm text-gray-600">
                        Certified homes sell faster with fewer negotiation issues during inspection periods.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border-2 border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Fewer Emergencies</p>
                      <p className="text-3xl font-bold text-amber-600 my-2">
                        {score >= 90 ? '90%' : score >= 85 ? '75%' : '60%'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Reduction in unexpected repair costs through proactive maintenance and early detection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg border-2 border-green-300">
                <p className="font-bold text-gray-900 mb-2">Estimated Annual Value:</p>
                <p className="text-2xl font-bold text-green-600">
                  ${score >= 90 ? '5,000-10,000' : score >= 85 ? '3,000-6,000' : '2,000-4,000'}+
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Combined savings from insurance discounts, avoided emergency repairs, and property value appreciation.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-2 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                Path to Certification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                You're <span className="font-bold">{75 - score} points</span> away from Bronze certification. 
                Here's what you need to unlock certified benefits:
              </p>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
                  <p className="font-bold text-gray-900 mb-2">✓ Complete System Documentation</p>
                  <p className="text-sm text-gray-600">Document all major systems (HVAC, Plumbing, Electrical, Roof)</p>
                  <p className="text-xs text-orange-600 mt-1">Worth +{Math.min(75 - score, 25)} points</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
                  <p className="font-bold text-gray-900 mb-2">✓ Schedule First Inspection</p>
                  <p className="text-sm text-gray-600">Complete a seasonal property inspection</p>
                  <p className="text-xs text-orange-600 mt-1">Worth +{Math.min(Math.max(75 - score - 25, 0), 15)} points</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
                  <p className="font-bold text-gray-900 mb-2">✓ Create Maintenance Plan</p>
                  <p className="text-sm text-gray-600">Set up preventive maintenance schedule</p>
                  <p className="text-xs text-orange-600 mt-1">Worth +{Math.max(75 - score - 40, 0)} points</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-orange-100 rounded-lg border-2 border-orange-300">
                <p className="font-bold text-gray-900">Once certified, you'll unlock:</p>
                <ul className="text-sm text-gray-700 mt-2 space-y-1">
                  <li>• Insurance discounts (5-15%)</li>
                  <li>• Faster home sale times (15-30 days)</li>
                  <li>• Higher property values (2-8%)</li>
                  <li>• Dramatically fewer emergency repairs</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Verification Footer */}
        <div className="mt-12 pt-8 border-t-2 border-gray-300">
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Issued By</p>
              <p className="font-bold text-gray-900">360° Method Platform</p>
              <p className="text-sm text-gray-600">Property Maintenance Certification</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Certificate ID</p>
              <p className="font-mono font-bold text-gray-900">{propertyAddress.replace(/\s/g, '').substring(0, 6).toUpperCase()}-{score}-{new Date().getFullYear()}</p>
              <p className="text-sm text-gray-600">Unique verification code</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Valid Until</p>
              <p className="font-bold text-gray-900">{new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              <p className="text-sm text-gray-600">Annual recertification required</p>
            </div>
          </div>
          
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-2">
              This certificate represents a comprehensive assessment of property maintenance practices using 
              the 360° Method scoring framework. Scores are calculated based on system documentation, 
              inspection frequency, preventive maintenance schedules, and historical repair responsiveness.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              To verify this certificate, visit <span className="font-semibold">360method.com/verify</span> and enter the Certificate ID above.
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            size: letter;
            margin: 0.75in;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-12 {
            padding: 3rem !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  );
}