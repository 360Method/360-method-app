import React, { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Trophy, TrendingUp, Shield, AlertTriangle, CheckCircle2, DollarSign, Home as HomeIcon, Calendar, Zap, Target, Award, ChevronDown } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DEMO_PROPERTY_HOMEOWNER } from "@/components/shared/demoPropertyHomeowner";
import { DEMO_PROPERTY_STRUGGLING } from "@/components/shared/demoPropertyStruggling";
import { DEMO_PROPERTY_IMPROVING } from "@/components/shared/demoPropertyImproving";
import { DEMO_PROPERTY_EXCELLENT } from "@/components/shared/demoPropertyExcellent";
import { DEMO_PORTFOLIO_INVESTOR } from "@/components/shared/demoPropertyInvestor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Score360() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const printRef = useRef(null);
  
  const propertyId = searchParams.get('property_id');
  const portfolioView = searchParams.get('portfolio') === 'true';
  
  // Get all properties for portfolio view
  const getAllProperties = () => {
    if (propertyId?.startsWith('demo-investor') || portfolioView) {
      return DEMO_PORTFOLIO_INVESTOR.properties;
    }
    return [];
  };
  
  const allProperties = getAllProperties();
  const isPortfolio = allProperties.length > 1;
  
  // Calculate portfolio average score
  const portfolioScore = isPortfolio 
    ? Math.round(allProperties.reduce((sum, p) => sum + p.health_score, 0) / allProperties.length)
    : null;
  
  const handleBack = () => {
    if (propertyId?.startsWith('demo-')) {
      const parts = propertyId.split('-');
      const demoType = parts[1]; // struggling, improving, excellent, investor
      if (demoType === 'investor') {
        navigate(createPageUrl('DemoPortfolio'));
      } else {
        const capitalizedType = demoType.charAt(0).toUpperCase() + demoType.slice(1);
        navigate(createPageUrl(`Demo${capitalizedType}`));
      }
    } else {
      navigate(createPageUrl('Properties'));
    }
  };
  
  // Get property from demo data
  const getPropertyData = () => {
    // Portfolio view - return portfolio average as a virtual property
    if (portfolioView && isPortfolio) {
      return {
        id: 'portfolio',
        address: 'Portfolio Average',
        city: `${allProperties.length} Properties`,
        state: '',
        property_type: 'Multi-Property Portfolio',
        year_built: '',
        square_footage: allProperties.reduce((sum, p) => sum + (p.square_footage || 0), 0),
        health_score: portfolioScore
      };
    }
    
    if (propertyId === 'demo-homeowner-001') return DEMO_PROPERTY_HOMEOWNER.property;
    if (propertyId === 'demo-struggling-001') return DEMO_PROPERTY_STRUGGLING.property;
    if (propertyId === 'demo-improving-001') return DEMO_PROPERTY_IMPROVING.property;
    if (propertyId === 'demo-excellent-001') return DEMO_PROPERTY_EXCELLENT.property;

    // Portfolio investor properties
    const portfolioProperty = DEMO_PORTFOLIO_INVESTOR.properties.find(p => p.id === propertyId);
    if (portfolioProperty) return portfolioProperty;

    return null;
  };
  
  const property = getPropertyData();
  
  // Handle property selection
  const handlePropertySelect = (selectedId) => {
    if (selectedId === 'portfolio') {
      setSearchParams({ portfolio: 'true' });
    } else {
      setSearchParams({ property_id: selectedId });
    }
  };
  
  const score = property?.health_score || 0;
  const propertyName = property?.address || 'Property';
  const propertyAddress = `${property?.city || ''}, ${property?.state || ''}`.trim().replace(/^,\s*/, '');
  const propertyType = property?.property_type || 'N/A';
  const yearBuilt = property?.year_built || 'N/A';
  const sqft = property?.square_footage || 'N/A';
  
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Action Bar - Don't print */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              size="sm"
              onClick={handleDownloadPDF}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Print-Only One-Page Summary */}
      <div className="hidden print:block print:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-300">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">360° Property Score</h1>
              <p className="text-sm text-gray-600">Official Maintenance Certificate</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Report Date</p>
              <p className="text-sm font-semibold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Property & Score - Compact */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{propertyName}</h2>
              <p className="text-sm text-gray-600">{propertyAddress}</p>
              <p className="text-sm text-gray-600">{propertyType} • Built {yearBuilt} • {parseInt(sqft).toLocaleString()} sq ft</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase mb-1">Overall Score</p>
              <p className="text-5xl font-bold text-gray-900">{score}<span className="text-2xl text-gray-400">/100</span></p>
              <div 
                className="inline-block mt-2 px-4 py-1 text-sm font-bold rounded-full text-white"
                style={{
                  backgroundColor: score >= 96 ? '#9333EA' : score >= 90 ? '#EAB308' : score >= 85 ? '#6B7280' : score >= 75 ? '#D97706' : '#9CA3AF'
                }}
              >
                {cert.stars} {cert.level} {score >= 75 ? 'Certified' : ''}
              </div>
              <p className="text-xs text-gray-500 mt-1">{cert.text}</p>
            </div>
          </div>

          {/* Key Metrics - Compact Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-xs font-semibold text-green-700 uppercase">Maintenance Level</p>
              <p className="text-sm font-bold text-gray-900">{score >= 90 ? 'Elite' : score >= 75 ? 'Systematic' : score >= 65 ? 'Developing' : 'Reactive'}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-blue-700 uppercase">Risk Level</p>
              <p className="text-sm font-bold text-gray-900">{score >= 85 ? 'Low Risk' : score >= 70 ? 'Moderate' : 'High Risk'}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <p className="text-xs font-semibold text-purple-700 uppercase">Percentile</p>
              <p className="text-sm font-bold text-gray-900">Better than {score < 65 ? 35 : score < 75 ? 50 : score < 85 ? 65 : score < 90 ? 85 : 95}%</p>
            </div>
          </div>

          {/* Phase Breakdown - Compact */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Score Breakdown</h3>
            <div className="space-y-2">
              {phases.map((phase, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-32 text-xs font-semibold text-gray-700">{phase.name}</div>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${(phase.score / phase.max) * 100}%`,
                        background: idx === 0 ? '#3B82F6' : idx === 1 ? '#16A34A' : '#9333EA'
                      }}
                    />
                  </div>
                  <div className="w-16 text-right text-sm font-bold text-gray-900">{phase.score}/{phase.max}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits or Next Steps - Compact */}
          {score >= 75 ? (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Certified Benefits</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">Potential insurance benefits</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">Improved marketability</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">Enhanced property value</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">Fewer surprise repairs</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Path to Certification (75+)</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                  <span className="text-gray-700">Complete system documentation</span>
                  <span className="font-semibold text-gray-900">+{Math.min(75 - score, 25)} pts</span>
                </div>
                <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                  <span className="text-gray-700">Schedule regular inspections</span>
                  <span className="font-semibold text-gray-900">+{Math.min(Math.max(75 - score - 25, 0), 15)} pts</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-xs mb-3">
              <div>
                <p className="text-gray-500 uppercase">Issued By</p>
                <p className="font-semibold text-gray-900">360° Method</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase">Certificate ID</p>
                <p className="font-mono font-semibold text-gray-900">{propertyAddress.replace(/\s/g, '').substring(0, 6).toUpperCase()}-{score}-{new Date().getFullYear()}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase">Valid Through</p>
                <p className="font-semibold text-gray-900">{new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong>Disclaimers:</strong> Estimates and benefits shown are approximations and may vary based on property, location, and individual circumstances. Insurance benefits not guaranteed. For informational purposes only.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Professional Report */}
      <div ref={printRef} className="max-w-5xl mx-auto p-4 md:p-8 print:hidden">
        
        {/* Professional Header - Streamlined */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 md:p-8 rounded-2xl shadow-xl mb-6 print:rounded-none">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-3xl">🏠</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">360° Property Score</h1>
                <p className="text-blue-100">Official Maintenance Certificate</p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-blue-100 text-xs uppercase tracking-wide">Report Date</p>
              <p className="font-semibold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
        
        {/* Property Header with Score - Hero Section */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            {/* Top: Property Details */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{propertyName}</h2>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <HomeIcon className="w-4 h-4" />
                  {propertyAddress}
                </span>
                <span className="text-gray-400">•</span>
                <span>{propertyType}</span>
                <span className="text-gray-400">•</span>
                <span>Built {yearBuilt}</span>
                <span className="text-gray-400">•</span>
                <span>{parseInt(sqft).toLocaleString()} sq ft</span>
              </div>
            </div>
            
            {/* Bottom: Score Display */}
            <div className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left: Score Circle */}
                <div className="flex flex-col items-center">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Overall Score</p>
                  <div className="relative">
                    <svg className="w-48 h-48 md:w-56 md:h-56" viewBox="0 0 200 200">
                      {/* Background circle */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="16"
                      />
                      {/* Score circle */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke={score >= 90 ? '#EAB308' : score >= 85 ? '#F59E0B' : score >= 75 ? '#F59E0B' : score >= 65 ? '#FB923C' : '#DC2626'}
                        strokeWidth="16"
                        strokeDasharray={`${(score / 100) * 502.4} 502.4`}
                        strokeLinecap="round"
                        transform="rotate(-90 100 100)"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl md:text-6xl font-bold text-gray-900">{score}</span>
                      <span className="text-xl md:text-2xl text-gray-400">/100</span>
                    </div>
                  </div>
                  
                  {/* Certification Badge */}
                  <div className="mt-6 text-center">
                    <div 
                      className="inline-flex px-6 py-2.5 text-base md:text-lg font-bold rounded-full text-white"
                      style={{
                        backgroundColor: score >= 96 ? '#9333EA' :
                          score >= 90 ? '#EAB308' :
                          score >= 85 ? '#6B7280' :
                          score >= 75 ? '#D97706' :
                          '#9CA3AF'
                      }}
                    >
                      {cert.stars} {cert.level} {score >= 75 ? 'Certified' : ''}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{cert.text}</p>
                  </div>
                </div>
                
                {/* Right: Key Metrics Grid */}
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Maintenance Level</p>
                        <p className="font-bold text-gray-900 truncate">
                          {score >= 90 ? 'Elite' : score >= 75 ? 'Systematic' : score >= 65 ? 'Developing' : 'Reactive'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Risk Level</p>
                        <p className="font-bold text-gray-900 truncate">
                          {score >= 85 ? 'Low Risk' : score >= 70 ? 'Moderate' : 'High Risk'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Percentile</p>
                        <p className="font-bold text-gray-900 truncate">
                          Better than {score < 65 ? 35 : score < 75 ? 50 : score < 85 ? 65 : score < 90 ? 85 : 95}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {score >= 75 && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center flex-shrink-0">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Est. Annual Value</p>
                          <p className="font-bold text-gray-900 truncate">
                            ${score >= 90 ? '5,000-10,000' : score >= 85 ? '3,000-6,000' : '2,000-4,000'}+
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>


        
        {/* One-Line Summary */}
        <div className={`mb-6 p-6 rounded-2xl shadow-lg border-2 ${
          score >= 90 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300' :
          score >= 75 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300' :
          score >= 65 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300' :
          'bg-gradient-to-r from-red-50 to-orange-50 border-red-300'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              score >= 90 ? 'bg-yellow-600' :
              score >= 75 ? 'bg-blue-600' :
              score >= 65 ? 'bg-orange-600' :
              'bg-red-600'
            }`}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-xl md:text-2xl mb-2">
                {score >= 90 ? 'Elite property in the top 5%' :
                 score >= 75 ? 'Well-maintained and systematic' :
                 score >= 65 ? 'Developing good habits' :
                 'High risk of expensive surprises'}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {score >= 90 ? 'Exceptional maintenance practices with comprehensive documentation, quarterly inspections, and proactive care. This property sets the standard.' :
                 score >= 75 ? 'Strong systematic approach with documented systems, regular inspections, and preventive maintenance. A few optimizations away from elite status.' :
                 score >= 65 ? 'Some tracking exists but significant gaps remain. Inspections are irregular and documentation is incomplete. Elevated risk of unexpected repairs.' :
                 'Reactive approach with minimal documentation, rare inspections, and no prevention plan. Very high risk of emergency repairs and cascade failures.'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Score Breakdown - Simplified */}
        <Card className="mb-6 shadow-lg border border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Score Breakdown by Phase
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
              {phases.map((phase, idx) => {
                const percentage = (phase.score / phase.max) * 100;
                const phaseColors = ['blue', 'green', 'purple'];
                const color = phaseColors[idx];
                return (
                  <div key={idx} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ 
                            backgroundColor: idx === 0 ? '#2563EB' : idx === 1 ? '#16A34A' : '#9333EA' 
                          }}
                        ></div>
                        <span className="font-semibold text-gray-900">{phase.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-900">{phase.score}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-lg text-gray-500">{phase.max}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-1000 rounded-full"
                          style={{ 
                            width: `${percentage}%`,
                            background: idx === 0 
                              ? 'linear-gradient(to right, #3B82F6, #2563EB)' 
                              : idx === 1 
                              ? 'linear-gradient(to right, #22C55E, #16A34A)'
                              : 'linear-gradient(to right, #A855F7, #9333EA)'
                          }}
                        ></div>
                      </div>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-600">
                        {Math.round(percentage)}%
                      </span>
                    </div>
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

        {/* Path to Next Level - Clearer Format */}
        {score < 96 && (
          <Card className="mb-6 shadow-lg border-2 border-blue-300 print:hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  Next Level: {score < 75 ? 'Bronze (75)' : score < 85 ? 'Silver (85)' : score < 90 ? 'Gold (90)' : 'Platinum (96)'}
                </CardTitle>
                <Badge className="bg-blue-600 text-lg px-4 py-1">
                  {(score < 75 ? 75 : score < 85 ? 85 : score < 90 ? 90 : 96) - score} pts away
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">

              
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
              
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl">
                  <p className="text-sm opacity-90 mb-1">Investment Required</p>
                  <p className="text-3xl md:text-4xl font-bold">
                    {score < 65 ? '$1,000' : score < 75 ? '$200' : score < 85 ? '$400' : score < 90 ? '$800' : '$1,200'}
                  </p>
                </div>
                <div className="p-5 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-xl">
                  <p className="text-sm opacity-90 mb-1">Potential Year 1 Savings</p>
                  <p className="text-3xl md:text-4xl font-bold">
                    {score < 75 ? '$5K-15K' : score < 85 ? '$3K-8K' : '$2K-5K'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certified Benefits - More Visual */}
        {score >= 75 ? (
          <Card className="mb-6 shadow-lg border-2 border-green-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
              <CardTitle className="flex items-center gap-2">
                <Award className="w-6 h-6 text-green-600" />
                Your Certified Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-300">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-8 h-8 text-green-600" />
                    <p className="font-bold text-gray-900 text-lg">Insurance Benefits</p>
                  </div>
                  <p className="text-4xl font-bold text-green-700 mb-1">
                    {score >= 90 ? 'Premium' : score >= 85 ? 'Strong' : 'Good'}
                  </p>
                  <p className="text-sm text-gray-600">
                    May qualify for lower premiums
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-300">
                  <div className="flex items-center gap-3 mb-3">
                    <HomeIcon className="w-8 h-8 text-blue-600" />
                    <p className="font-bold text-gray-900 text-lg">Property Value</p>
                  </div>
                  <p className="text-4xl font-bold text-blue-700 mb-1">
                    +{score >= 90 ? '5-8%' : score >= 85 ? '3-5%' : '2-3%'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Premium pricing advantage
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-300">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-8 h-8 text-purple-600" />
                    <p className="font-bold text-gray-900 text-lg">Faster Sale</p>
                  </div>
                  <p className="text-4xl font-bold text-purple-700 mb-1">
                    {score >= 85 ? '-25' : '-18'} days
                  </p>
                  <p className="text-sm text-gray-600">
                    Quicker transaction time
                  </p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border-2 border-amber-300">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="w-8 h-8 text-amber-600" />
                    <p className="font-bold text-gray-900 text-lg">Less Emergencies</p>
                  </div>
                  <p className="text-4xl font-bold text-amber-700 mb-1">
                    -{score >= 90 ? '90%' : score >= 85 ? '75%' : '60%'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Fewer surprise repairs
                  </p>
                </div>
              </div>

              <div className="mt-6 p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl">
                <p className="text-sm opacity-90 mb-1">Estimated Annual Value</p>
                <p className="text-3xl md:text-4xl font-bold mb-2">
                  ${score >= 90 ? '5,000-10,000' : score >= 85 ? '3,000-6,000' : '2,000-4,000'}+
                </p>
                <p className="text-sm opacity-90">
                  Est. prevented repairs, potential insurance benefits, and property value gains
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 shadow-lg border-2 border-orange-300">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  Get Certified
                </CardTitle>
                <Badge className="bg-orange-600 text-lg px-4 py-1">
                  {75 - score} pts to Bronze
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
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
              <div className="mt-6 p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl">
                <p className="font-bold text-lg mb-3">Once Certified at Bronze (75+):</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Potential insurance benefits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Faster sale potential</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Improved property value</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Fewer surprise repairs</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Verification Footer - Simplified */}
        <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="grid md:grid-cols-3 gap-6 mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Issued By</p>
              <p className="font-bold text-gray-900">360° Method</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Certificate ID</p>
              <p className="font-mono font-semibold text-gray-900 text-sm">{propertyAddress.replace(/\s/g, '').substring(0, 6).toUpperCase()}-{score}-{new Date().getFullYear()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Valid Through</p>
              <p className="font-bold text-gray-900">{new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
            This score reflects your property's maintenance practices and system health as of {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. 
            Annual recertification recommended.
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong className="text-gray-900">Important Disclaimers:</strong> All estimates, savings projections, and benefits shown are approximations based on industry research and may vary significantly based on your specific property, location, insurance provider, and individual circumstances. Insurance benefits are not guaranteed and depend on your insurer's policies. Property value impacts and sale timelines are estimates only. Actual results may differ. This certificate is for informational purposes and does not constitute financial, insurance, or real estate advice.
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
            margin: 0.5in;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:p-8 {
            padding: 2rem !important;
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