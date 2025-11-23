import React, { useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Printer, Trophy, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function Score360() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const printRef = useRef(null);
  
  // Demo data - in real app, this would come from property data
  const score = parseInt(searchParams.get('score')) || 78;
  const propertyName = searchParams.get('name') || 'My Property';
  const propertyAddress = searchParams.get('address') || 'Camas, WA';
  
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
  
  const handlePrint = () => {
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
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </Button>
          </div>
        </div>
      </div>
      
      {/* Printable One-Pager */}
      <div ref={printRef} className="max-w-4xl mx-auto p-8 bg-white print:p-0">
        
        {/* Header */}
        <div className="text-center mb-8 pb-8 border-b-2 border-gray-200">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6911a3ab5b84ed3aa2d106c2/ea24cb40a_GreyProfessionalMonogramCircularBrandLogo.png" 
              alt="360° Method" 
              className="w-12 h-12"
            />
            <h1 className="text-3xl font-bold text-gray-900">360° Property Score</h1>
          </div>
          <p className="text-gray-600">Official Property Maintenance Certificate</p>
          <p className="text-sm text-gray-500 mt-1">Generated {new Date().toLocaleDateString()}</p>
        </div>
        
        {/* Property Info & Score */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{propertyName}</h2>
            <p className="text-gray-600">{propertyAddress}</p>
          </div>
          
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <div className={`w-32 h-32 rounded-full bg-${cert.color}-100 border-4 border-${cert.color}-500 flex items-center justify-center mb-3`}>
                <div>
                  <div className={`text-5xl font-bold text-${cert.color}-600`}>{score}</div>
                  <div className="text-sm text-gray-500">/100</div>
                </div>
              </div>
              <Badge className={`bg-${cert.color}-600 text-white text-lg px-4 py-2`}>
                {cert.stars} {cert.level}
              </Badge>
            </div>
            
            <div className="text-left space-y-3">
              <div className="flex items-center gap-3">
                <Trophy className={`w-6 h-6 text-${cert.color}-600`} />
                <div>
                  <p className="font-semibold text-gray-900">{cert.level} Certified</p>
                  <p className="text-sm text-gray-600">{cert.text} of all properties</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">Maintenance Level</p>
                  <p className="text-sm text-gray-600">
                    {score >= 90 ? 'Elite' : score >= 75 ? 'Systematic' : score >= 65 ? 'Developing' : 'Reactive'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Risk Level</p>
                  <p className="text-sm text-gray-600">
                    {score >= 85 ? 'Low' : score >= 70 ? 'Moderate' : 'High'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <Progress value={score} className="h-4 mb-2" />
          <p className="text-center text-sm text-gray-600">
            Better than {score < 65 ? 35 : score < 75 ? 50 : score < 85 ? 65 : score < 90 ? 85 : 95}% of all properties
          </p>
        </div>
        
        {/* What This Score Means */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">What This Score Means</h3>
            {score >= 90 ? (
              <p className="text-gray-700">
                This property is maintained at an elite level. All systems are documented, inspected regularly, 
                and proactively maintained. Issues are addressed within 48 hours. This represents top 5% maintenance practices.
              </p>
            ) : score >= 75 ? (
              <p className="text-gray-700">
                This property has systematic maintenance practices in place. Key systems are tracked, 
                inspections happen regularly, and preventive maintenance is scheduled. This is better than most properties.
              </p>
            ) : score >= 65 ? (
              <p className="text-gray-700">
                This property is developing better maintenance habits. Some tracking exists but improvements are needed 
                in documentation, inspection frequency, and preventive care to avoid expensive surprises.
              </p>
            ) : (
              <p className="text-gray-700">
                This property operates reactively - fixing things only when they break. Limited documentation exists, 
                inspections are rare, and no preventive maintenance schedule is in place. High risk of expensive emergencies.
              </p>
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
        
        {/* Benefits */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Benefits</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {score >= 75 && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Insurance Discount</p>
                      <p className="text-sm text-gray-600">
                        {score >= 90 ? '15%' : score >= 85 ? '10%' : '5%'} eligible discount
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Faster Sale</p>
                      <p className="text-sm text-gray-600">
                        Sell {score >= 85 ? '20-30' : '15-20'} days faster
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Home Value</p>
                      <p className="text-sm text-gray-600">
                        {score >= 90 ? '5-8%' : score >= 85 ? '3-5%' : '2-3%'} value increase
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Lower Surprises</p>
                      <p className="text-sm text-gray-600">
                        {score >= 90 ? '90%' : score >= 85 ? '75%' : '60%'} fewer emergencies
                      </p>
                    </div>
                  </div>
                </>
              )}
              {score < 75 && (
                <div className="col-span-2 p-4 bg-red-50 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 mb-1">Not Yet Certified</p>
                    <p className="text-sm text-red-700">
                      Reach 75 points to unlock Bronze certification and start receiving benefits like insurance discounts and faster home sales.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Verification */}
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            This score is calculated using the 360° Method - a comprehensive property maintenance scoring system.
          </p>
          <p className="text-xs text-gray-500">
            Verification Code: {propertyAddress.replace(/\s/g, '').substring(0, 6).toUpperCase()}-{score}-{new Date().getFullYear()}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Visit 360method.com to verify this certificate
          </p>
        </div>
      </div>
      
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            margin: 0.5in;
          }
        }
      `}</style>
    </div>
  );
}