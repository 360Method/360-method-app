import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen, Video, Calculator, Download, Sparkles, Eye, TrendingUp,
  Home, Building2, Wrench, HelpCircle, MessageSquare, FileText,
  Info, ArrowRight, PlayCircle, Target
} from 'lucide-react';
import { useDemo } from '../components/shared/DemoContext';

export default function Resources() {
  const { demoMode } = useDemo();
  const [startHereExpanded, setStartHereExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
      <div className="w-full max-w-6xl mx-auto px-4 py-6 md:py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
            Resource Hub
          </h1>
          <p className="text-gray-600 text-lg">
            Your Complete Guide to Proactive Home Maintenance
          </p>
        </div>

        {/* Demo Mode Alert */}
        {demoMode && (
          <Alert className="mb-6 border-yellow-400 bg-yellow-50">
            <Info className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              <strong>Demo Mode:</strong> All resources are available for exploration. 
              Educational content is fully accessible without restrictions.
            </AlertDescription>
          </Alert>
        )}

        {/* NEW: Start Here Section */}
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-xl mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D' }}>
                <Sparkles className="w-6 h-6 text-purple-600" />
                New to the 360° Method? Start Here
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-6">
              Choose your learning style—all paths lead to the same goal: preventing disasters and building wealth through systematic property management.
            </p>

            {/* Three Pathways */}
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Interactive Demo */}
              <Card className="border-2 border-blue-400 hover:shadow-xl transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: '#1B365D' }}>
                    🎮 Interactive Demo
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Explore a real property example with 16 systems, tasks, and maintenance history
                  </p>
                  <Badge className="bg-blue-600 text-white mb-4">
                    <Clock className="w-3 h-3 mr-1" />
                    10-15 minutes
                  </Badge>
                  <Button
                    asChild
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    style={{ minHeight: '48px' }}
                  >
                    <Link to={createPageUrl('DemoEntry')}>
                      Explore Demo
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Read the Guide */}
              <Card className="border-2 border-green-400 hover:shadow-xl transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: '#1B365D' }}>
                    📚 Read the Guide
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Complete framework guide explaining all 9 steps with examples and best practices
                  </p>
                  <Badge className="bg-green-600 text-white mb-4">
                    <Clock className="w-3 h-3 mr-1" />
                    20 minutes
                  </Badge>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                    style={{ minHeight: '48px' }}
                  >
                    <Link to={createPageUrl('ResourceGuides') + '?guide=getting-started'}>
                      Read Guide
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Watch Video Tour */}
              <Card className="border-2 border-orange-400 hover:shadow-xl transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: '#1B365D' }}>
                    📹 Watch Video Tour
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    12-minute walkthrough showing the entire Method in action
                  </p>
                  <Badge className="bg-orange-600 text-white mb-4">
                    <Clock className="w-3 h-3 mr-1" />
                    12 minutes
                  </Badge>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
                    style={{ minHeight: '48px' }}
                  >
                    <Link to={createPageUrl('VideoTutorials') + '?video=method-overview'}>
                      Watch Tour
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

            </div>

            {/* Quick Framework Reference */}
            <div className="mt-6 p-4 bg-white rounded-lg border-2 border-indigo-300">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-indigo-600" />
                <h4 className="font-semibold text-indigo-900">Quick Reference: The 3×3 System</h4>
              </div>
              <div className="grid md:grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="font-bold text-blue-900 mb-1">🔵 AWARE (Know)</p>
                  <p className="text-gray-600">1. Baseline → 2. Inspect → 3. Track</p>
                </div>
                <div>
                  <p className="font-bold text-orange-900 mb-1">🟠 ACT (Decide)</p>
                  <p className="text-gray-600">4. Prioritize → 5. Schedule → 6. Execute</p>
                </div>
                <div>
                  <p className="font-bold text-green-900 mb-1">🟢 ADVANCE (Build)</p>
                  <p className="text-gray-600">7. Preserve → 8. Upgrade → 9. SCALE</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Resources */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1B365D' }}>
            Popular Resources
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to={createPageUrl('ResourceGuides')}>
              <Card className="border-2 border-blue-300 hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold mb-2">Getting Started</h3>
                  <p className="text-sm text-gray-600">Step-by-step guides</p>
                </CardContent>
              </Card>
            </Link>
            <Link to={createPageUrl('ResourceGuides')}>
              <Card className="border-2 border-green-300 hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-green-600" />
                  <h3 className="font-semibold mb-2">How-To Library</h3>
                  <p className="text-sm text-gray-600">64+ maintenance guides</p>
                </CardContent>
              </Card>
            </Link>
            <Link to={createPageUrl('VideoTutorials')}>
              <Card className="border-2 border-orange-300 hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 text-center">
                  <Video className="w-12 h-12 mx-auto mb-3 text-orange-600" />
                  <h3 className="font-semibold mb-2">Video Tutorials</h3>
                  <p className="text-sm text-gray-600">42 video walkthroughs</p>
                </CardContent>
              </Card>
            </Link>
            <Link to={createPageUrl('ROICalculators')}>
              <Card className="border-2 border-purple-300 hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 text-center">
                  <Calculator className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold mb-2">ROI Calculators</h3>
                  <p className="text-sm text-gray-600">Financial planning tools</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Browse by Topic: The 360° Method Framework */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1B365D' }}>
            Browse by Topic: The 360° Method Framework
          </h2>
          
          {/* AWARE Phase */}
          <Card className="border-2 border-blue-300 mb-4">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Eye className="w-5 h-5" />
                Phase I: AWARE - Know Your Property
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Link to={createPageUrl('ResourceGuides') + '?topic=baseline'} className="p-3 hover:bg-blue-50 rounded-lg transition-colors">
                  <p className="font-semibold mb-1">Step 1: Baseline</p>
                  <p className="text-sm text-gray-600">System documentation guides</p>
                </Link>
                <Link to={createPageUrl('ResourceGuides') + '?topic=inspect'} className="p-3 hover:bg-blue-50 rounded-lg transition-colors">
                  <p className="font-semibold mb-1">Step 2: Inspect</p>
                  <p className="text-sm text-gray-600">Seasonal inspection checklists</p>
                </Link>
                <Link to={createPageUrl('ResourceGuides') + '?topic=track'} className="p-3 hover:bg-blue-50 rounded-lg transition-colors">
                  <p className="font-semibold mb-1">Step 3: Track</p>
                  <p className="text-sm text-gray-600">History & analytics guides</p>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* ACT Phase */}
          <Card className="border-2 border-orange-300 mb-4">
            <CardHeader className="bg-orange-50">
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <TrendingUp className="w-5 h-5" />
                Phase II: ACT - Make Smart Decisions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Link to={createPageUrl('ResourceGuides') + '?topic=prioritize'} className="p-3 hover:bg-orange-50 rounded-lg transition-colors">
                  <p className="font-semibold mb-1">Step 4: Prioritize</p>
                  <p className="text-sm text-gray-600">Risk assessment guides</p>
                </Link>
                <Link to={createPageUrl('ResourceGuides') + '?topic=schedule'} className="p-3 hover:bg-orange-50 rounded-lg transition-colors">
                  <p className="font-semibold mb-1">Step 5: Schedule</p>
                  <p className="text-sm text-gray-600">Strategic timing tips</p>
                </Link>
                <Link to={createPageUrl('ResourceGuides') + '?topic=execute'} className="p-3 hover:bg-orange-50 rounded-lg transition-colors">
                  <p className="font-semibold mb-1">Step 6: Execute</p>
                  <p className="text-sm text-gray-600">DIY tutorials & contractor guides</p>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* ADVANCE Phase */}
          <Card className="border-2 border-green-300 mb-4">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <TrendingUp className="w-5 h-5" />
                Phase III: ADVANCE - Build Value
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Link to={createPageUrl('ResourceGuides') + '?topic=preserve'} className="p-3 hover:bg-green-50 rounded-lg transition-colors">
                  <p className="font-semibold mb-1">Step 7: Preserve</p>
                  <p className="text-sm text-gray-600">System life extension strategies</p>
                </Link>
                <Link to={createPageUrl('ResourceGuides') + '?topic=upgrade'} className="p-3 hover:bg-green-50 rounded-lg transition-colors">
                  <p className="font-semibold mb-1">Step 8: Upgrade</p>
                  <p className="text-sm text-gray-600">High-ROI improvement ideas</p>
                </Link>
                <Link to={createPageUrl('ResourceGuides') + '?topic=scale'} className="p-3 hover:bg-green-50 rounded-lg transition-colors">
                  <p className="font-semibold mb-1">Step 9: SCALE</p>
                  <p className="text-sm text-gray-600">Portfolio strategy & wealth building</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* By Property Type */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1B365D' }}>
            By Property Type
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to={createPageUrl('ResourceGuides') + '?type=homeowner'}>
              <Card className="border-2 border-blue-300 hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6">
                  <Home className="w-10 h-10 mb-3 text-blue-600" />
                  <h3 className="font-semibold mb-2">For Homeowners</h3>
                  <p className="text-sm text-gray-600">Primary residence guides</p>
                </CardContent>
              </Card>
            </Link>
            <Link to={createPageUrl('ResourceGuides') + '?type=investor'}>
              <Card className="border-2 border-green-300 hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6">
                  <Building2 className="w-10 h-10 mb-3 text-green-600" />
                  <h3 className="font-semibold mb-2">For Investors</h3>
                  <p className="text-sm text-gray-600">Rental & portfolio strategies</p>
                </CardContent>
              </Card>
            </Link>
            <Link to={createPageUrl('ResourceGuides') + '?type=diy'}>
              <Card className="border-2 border-orange-300 hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6">
                  <Wrench className="w-10 h-10 mb-3 text-orange-600" />
                  <h3 className="font-semibold mb-2">For DIYers</h3>
                  <p className="text-sm text-gray-600">Hands-on maintenance tutorials</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* By System */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1B365D' }}>
            By Home System
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Foundation', 'Exterior', 'Windows/Doors', 'Appliances'].map(system => (
              <Link 
                key={system}
                to={createPageUrl('ResourceGuides') + `?system=${system.toLowerCase()}`}
                className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <p className="font-medium text-sm">{system}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Downloads & Tools */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1B365D' }}>
            Downloads & Tools
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <Download className="w-8 h-8 mb-2 text-blue-600" />
                <h3 className="font-semibold mb-1">Seasonal Checklists</h3>
                <p className="text-sm text-gray-600 mb-3">Printable inspection forms</p>
                <Button variant="outline" size="sm" className="w-full">
                  Download
                </Button>
              </CardContent>
            </Card>
            <Card className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <Calculator className="w-8 h-8 mb-2 text-green-600" />
                <h3 className="font-semibold mb-1">Budget Worksheets</h3>
                <p className="text-sm text-gray-600 mb-3">Annual planning templates</p>
                <Button variant="outline" size="sm" className="w-full">
                  Download
                </Button>
              </CardContent>
            </Card>
            <Card className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <FileText className="w-8 h-8 mb-2 text-orange-600" />
                <h3 className="font-semibold mb-1">Contractor Forms</h3>
                <p className="text-sm text-gray-600 mb-3">Evaluation & bid templates</p>
                <Button variant="outline" size="sm" className="w-full">
                  Download
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Featured Content */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1B365D' }}>
            Featured Content
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-purple-300">
              <CardHeader>
                <Badge className="bg-purple-600 text-white w-fit mb-2">Case Study</Badge>
                <CardTitle className="text-lg">How Sarah Prevented a $23K Disaster</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  A $45 gutter cleaning caught early signs of foundation issues—saving $23,000 in emergency repairs.
                </p>
                <Button variant="outline" size="sm">Read Story</Button>
              </CardContent>
            </Card>
            <Card className="border-2 border-blue-300">
              <CardHeader>
                <Badge className="bg-blue-600 text-white w-fit mb-2">Video</Badge>
                <CardTitle className="text-lg">The $50 to $5,000 Cascade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Watch how small problems trigger expensive chain reactions—and how to stop them.
                </p>
                <Button variant="outline" size="sm">Watch Now</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Need Help? */}
        <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D' }}>
              <HelpCircle className="w-6 h-6" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Help Center</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Search FAQs and troubleshooting guides
                  </p>
                  <Button variant="outline" size="sm">Visit Help Center</Button>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Community</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Connect with other property owners
                  </p>
                  <Button variant="outline" size="sm">Join Community</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}