import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, DollarSign, Clock, CheckCircle, TrendingUp, Shield, Calendar } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function DemoStruggling() {
  const navigate = useNavigate();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  
  // Animate score on load
  useEffect(() => {
    const timer = setTimeout(() => {
      let count = 0;
      const interval = setInterval(() => {
        count += 2;
        if (count >= 62) {
          setAnimatedScore(62);
          clearInterval(interval);
        } else {
          setAnimatedScore(count);
        }
      }, 30);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Show floating CTA on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToSolution = () => {
    document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Floating CTA - Sticky */}
        {showFloatingCTA && (
          <div className="fixed bottom-24 right-6 z-50 animate-bounce-slow">
            <Button
              size="lg"
              onClick={scrollToSolution}
              className="bg-red-600 hover:bg-red-700 text-white shadow-2xl text-lg px-6 py-6 rounded-full"
            >
              Get to 75 ↑
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="p-4 md:p-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('DemoEntry'))}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Demo Selection
          </Button>
        </div>
        
        {/* HERO SECTION - Above Fold */}
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-8">
          <div className="text-center max-w-2xl">
            <div className="text-6xl mb-4 animate-pulse">🏠</div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">The Fixer-Upper</h1>
            <p className="text-xl text-gray-600 mb-8">Vancouver, WA</p>
            
            <div className="border-t-2 border-gray-300 my-8"></div>
            
            {/* Animated Score */}
            <div className="mb-6">
              <p className="text-gray-600 text-lg mb-2">YOUR SCORE:</p>
              <div className="text-8xl md:text-9xl font-bold text-red-500 mb-4">
                {animatedScore}<span className="text-5xl text-gray-400">/100</span>
              </div>
              <Progress value={animatedScore} className="h-6 mb-4" />
              <Badge variant="destructive" className="text-xl px-6 py-2 animate-pulse">
                ⚠️ NOT GOOD ENOUGH TO CERTIFY
              </Badge>
            </div>
            
            <p className="text-xl text-gray-700 mb-2">You're in the bottom 65%.</p>
            <p className="text-2xl font-bold text-gray-900 mb-8">But you can fix this.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={scrollToSolution}
                className="bg-red-600 hover:bg-red-700 text-white text-xl px-12 py-6 rounded-full shadow-2xl"
              >
                See How to Get to 75 ↓
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate(createPageUrl('Score360') + '?score=62&name=1847 Riverside Drive&address=Vancouver, WA&propertyType=Single-Family Home&yearBuilt=2010&sqft=1850')}
                className="border-2 border-red-600 text-red-600 hover:bg-red-50 text-xl px-12 py-6 rounded-full shadow-2xl"
              >
                📄 View Score Report
              </Button>
            </div>
          </div>
        </div>
        
        {/* SECTION 1: THE PROBLEM */}
        <div className="py-20 px-8 bg-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">WHAT A 62 SCORE MEANS:</h2>
            
            <p className="text-2xl text-gray-700 mb-8">
              Your home works... until something breaks.<br />
              Then it's a $5,000 surprise.
            </p>
            
            <div className="text-left space-y-4 bg-red-50 p-8 rounded-lg border-2 border-red-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">You have:</h3>
              <p className="text-xl text-gray-700 flex items-start gap-3">
                <span className="text-red-500 text-2xl">❌</span>
                <span>No idea what's about to fail</span>
              </p>
              <p className="text-xl text-gray-700 flex items-start gap-3">
                <span className="text-red-500 text-2xl">❌</span>
                <span>No prevention plan</span>
              </p>
              <p className="text-xl text-gray-700 flex items-start gap-3">
                <span className="text-red-500 text-2xl">❌</span>
                <span>No records or documentation</span>
              </p>
              <p className="text-xl text-gray-700 flex items-start gap-3">
                <span className="text-red-500 text-2xl">❌</span>
                <span>No system</span>
              </p>
            </div>
            
            <p className="text-2xl font-bold text-gray-900 mt-8">
              You're just crossing your fingers.
            </p>
          </div>
        </div>
        
        {/* SECTION 2: THE BREAKDOWN */}
        <div className="py-20 px-8 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">WHY YOUR SCORE IS 62:</h2>
            
            {/* Phase 1: AWARE */}
            <Card className="mb-8 border-2 border-blue-200">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-blue-700 mb-4">PHASE 1: AWARE (OWN) — 26/40 points</h3>
                <Progress value={65} className="h-4 mb-6" />
                
                <h4 className="font-bold text-gray-900 mb-3 text-lg">Missing:</h4>
                <ul className="space-y-2 mb-4">
                  <li className="text-gray-700">• You don't have photos of your systems</li>
                  <li className="text-gray-700">• You don't know how old anything is</li>
                  <li className="text-gray-700">• You have no maintenance records</li>
                </ul>
                
                <p className="text-xl font-bold text-red-600 mt-4">Translation: You're guessing.</p>
              </CardContent>
            </Card>
            
            {/* Phase 2: ACT */}
            <Card className="mb-8 border-2 border-green-200">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-green-700 mb-4">PHASE 2: ACT (BUILD) — 18/35 points</h3>
                <Progress value={51} className="h-4 mb-6" />
                
                <h4 className="font-bold text-gray-900 mb-3 text-lg">Missing:</h4>
                <ul className="space-y-2 mb-4">
                  <li className="text-gray-700">• You never check anything (0 inspections)</li>
                  <li className="text-gray-700">• Safety stuff is broken (CO detectors missing)</li>
                  <li className="text-gray-700">• You only fix things when they break</li>
                </ul>
                
                <p className="text-xl font-bold text-red-600 mt-4">Translation: You're reacting, not preventing.</p>
              </CardContent>
            </Card>
            
            {/* Phase 3: ADVANCE */}
            <Card className="border-2 border-purple-200">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-purple-700 mb-4">PHASE 3: ADVANCE (GROW) — 18/25 points</h3>
                <Progress value={72} className="h-4 mb-6" />
                
                <h4 className="font-bold text-gray-900 mb-3 text-lg">Missing:</h4>
                <ul className="space-y-2 mb-4">
                  <li className="text-gray-700">• No professional has ever looked at this</li>
                  <li className="text-gray-700">• Your water heater is 16 years old (avg: 10-15)</li>
                  <li className="text-gray-700">• Your HVAC is 18 years old (avg: 15-20)</li>
                  <li className="text-gray-700">• You have no plan for when they die</li>
                </ul>
                
                <p className="text-xl font-bold text-red-600 mt-4">Translation: Expensive surprises are coming.</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* SECTION 3: THE STAKES */}
        <div className="py-20 px-8 bg-red-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">WHAT HAPPENS IF YOU DO NOTHING:</h2>
            
            <div className="space-y-8">
              <Card className="bg-white border-2 border-red-300">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <Calendar className="w-8 h-8 text-red-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Next 6 months:</h3>
                      <p className="text-lg text-gray-700 mb-2">Your water heater dies on a Sunday morning.</p>
                      <p className="text-3xl font-bold text-red-600">Emergency plumber: $2,500</p>
                      <p className="text-sm text-gray-600 mt-1">(Planned replacement would've been $1,200)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-2 border-red-300">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <Calendar className="w-8 h-8 text-red-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Next 12 months:</h3>
                      <p className="text-lg text-gray-700 mb-2">Small roof leak you didn't know about damages your attic.</p>
                      <p className="text-3xl font-bold text-red-600">Repair + cleanup: $8,000</p>
                      <p className="text-sm text-gray-600 mt-1">(Catching it early would've been $200)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-2 border-red-300">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <Calendar className="w-8 h-8 text-red-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Next 24 months:</h3>
                      <p className="text-lg text-gray-700 mb-2">HVAC dies in summer heat.</p>
                      <p className="text-3xl font-bold text-red-600">Emergency replacement: $6,500</p>
                      <p className="text-sm text-gray-600 mt-1">(Planned would've been $5,000)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-12 p-8 bg-red-600 text-white rounded-lg text-center">
              <p className="text-2xl mb-4">TOTAL IF YOU DO NOTHING:</p>
              <p className="text-7xl font-bold mb-4">$17,000</p>
              <p className="text-xl">These aren't "what ifs."</p>
              <p className="text-xl font-bold">This is what a 62 score predicts.</p>
            </div>
          </div>
        </div>
        
        {/* SECTION 4: THE SOLUTION */}
        <div id="solution" className="py-20 px-8 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">GET TO 75 IN 3 SIMPLE STEPS:</h2>
            <div className="text-center mb-12">
              <p className="text-xl text-gray-700 mb-2">75 = Bronze Certified</p>
              <p className="text-xl text-gray-700 mb-2">75 = Better than 65% of homes</p>
              <p className="text-xl text-gray-700">75 = You know what's happening</p>
            </div>
            
            {/* Step 1 */}
            <Card className="mb-8 border-4 border-red-200 hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center text-3xl font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">FIX THE DANGEROUS STUFF</h3>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-bold text-xl text-gray-900 mb-3">What:</h4>
                  <ul className="space-y-2 text-lg text-gray-700">
                    <li>• Add carbon monoxide detectors</li>
                    <li>• Fix those electrical outlets near water</li>
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-bold text-xl text-gray-900 mb-3">Why:</h4>
                  <p className="text-lg text-red-600 font-bold">These can kill you or your family.</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <DollarSign className="w-6 h-6 mx-auto mb-1 text-green-600" />
                    <p className="text-2xl font-bold text-gray-900">$600</p>
                    <p className="text-sm text-gray-600">Cost</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                    <p className="text-2xl font-bold text-gray-900">1 day</p>
                    <p className="text-sm text-gray-600">Time</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                    <p className="text-2xl font-bold text-gray-900">+4</p>
                    <p className="text-sm text-gray-600">Points</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-xl font-bold text-green-600 mb-2">Your new score: 66</p>
                  <Progress value={66} className="h-4" />
                </div>
              </CardContent>
            </Card>
            
            {/* Step 2 */}
            <Card className="mb-8 border-4 border-blue-200 hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">START TRACKING YOUR HOME</h3>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-bold text-xl text-gray-900 mb-3">What:</h4>
                  <ul className="space-y-2 text-lg text-gray-700">
                    <li>• Take photos of your 6 main systems</li>
                    <li>• Write down how old they are</li>
                    <li>• Use the app to track everything</li>
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-bold text-xl text-gray-900 mb-3">Why:</h4>
                  <p className="text-lg text-blue-600 font-bold">You can't manage what you don't track.</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <DollarSign className="w-6 h-6 mx-auto mb-1 text-green-600" />
                    <p className="text-2xl font-bold text-gray-900">FREE</p>
                    <p className="text-sm text-gray-600">Cost</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                    <p className="text-2xl font-bold text-gray-900">1 hour</p>
                    <p className="text-sm text-gray-600">Time</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                    <p className="text-2xl font-bold text-gray-900">+8</p>
                    <p className="text-sm text-gray-600">Points</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-xl font-bold text-green-600 mb-2">Your new score: 74</p>
                  <Progress value={74} className="h-4" />
                </div>
              </CardContent>
            </Card>
            
            {/* Step 3 */}
            <Card className="border-4 border-green-200 hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-3xl font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">GET ONE PROFESSIONAL INSPECTION</h3>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-bold text-xl text-gray-900 mb-3">What:</h4>
                  <ul className="space-y-2 text-lg text-gray-700">
                    <li>• Someone who knows what they're doing looks at everything</li>
                    <li>• You get a complete report</li>
                    <li>• You know exactly what needs attention</li>
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-bold text-xl text-gray-900 mb-3">Why:</h4>
                  <p className="text-lg text-green-600 font-bold">This is your baseline. Your starting point.</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <DollarSign className="w-6 h-6 mx-auto mb-1 text-green-600" />
                    <p className="text-2xl font-bold text-gray-900">$400</p>
                    <p className="text-sm text-gray-600">Cost</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                    <p className="text-2xl font-bold text-gray-900">2 hours</p>
                    <p className="text-sm text-gray-600">Time</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                    <p className="text-2xl font-bold text-gray-900">+6</p>
                    <p className="text-sm text-gray-600">Points</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-xl font-bold text-green-600 mb-2">Your new score: 80 ✓</p>
                  <Progress value={80} className="h-4 mb-4" />
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <p className="text-4xl mb-2">🎉</p>
                    <p className="text-2xl font-bold text-green-700">BRONZE CERTIFIED!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* SECTION 5: THE MATH */}
        <div className="py-20 px-8 bg-green-50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-12">THE ACTUAL NUMBERS:</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardContent className="p-8">
                  <p className="text-lg text-gray-600 mb-2">Cost to get from 62 → 80:</p>
                  <p className="text-5xl font-bold text-gray-900">$1,000</p>
                  <p className="text-sm text-gray-600 mt-2">total</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-8">
                  <p className="text-lg text-gray-600 mb-2">Time to get from 62 → 80:</p>
                  <p className="text-5xl font-bold text-gray-900">2 months</p>
                  <p className="text-sm text-gray-600 mt-2">timeline</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="border-t-4 border-gray-300 my-12"></div>
            
            <Card className="mb-8">
              <CardContent className="p-8">
                <p className="text-lg text-gray-600 mb-2">What you avoid in year 1:</p>
                <p className="text-5xl font-bold text-red-600">$5,000 - $15,000</p>
                <p className="text-sm text-gray-600 mt-2">in emergency repairs</p>
              </CardContent>
            </Card>
            
            <div className="border-t-4 border-gray-300 my-12"></div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="bg-red-50 border-2 border-red-200">
                <CardContent className="p-8">
                  <p className="text-lg text-gray-600 mb-2">Your investment:</p>
                  <p className="text-4xl font-bold text-red-600">$1,000</p>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-2 border-green-200">
                <CardContent className="p-8">
                  <p className="text-lg text-gray-600 mb-2">Your savings:</p>
                  <p className="text-4xl font-bold text-green-600">$5,000 - $15,000</p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-gradient-to-br from-green-600 to-emerald-600 text-white mb-12">
              <CardContent className="p-12">
                <p className="text-2xl mb-4">ROI:</p>
                <p className="text-7xl font-bold mb-4">500% - 1,500%</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-8 text-left">
                <p className="text-xl font-bold text-gray-900 mb-4">Plus you get:</p>
                <ul className="space-y-3 text-lg text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <span>Peace of mind <span className="italic text-gray-500">(priceless)</span></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <span>No more weekend emergencies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <span>Insurance discount (5%)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <span>Official certificate to show buyers</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* SECTION 6: WHAT YOU GET */}
        <div className="py-20 px-8 bg-blue-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">WHEN YOU HIT 75 (BRONZE):</h2>
            <p className="text-2xl font-bold text-gray-900 mb-8 text-center">Your life changes:</p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="bg-red-50 border-2 border-red-200">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-red-700 mb-6">Before (62):</h3>
                  <ul className="space-y-4 text-lg text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">😰</span>
                      <span>"Is that ceiling stain bad?"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">😰</span>
                      <span>"When did I last check anything?"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">😰</span>
                      <span>"Should I be worried about that noise?"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">😰</span>
                      <span>"I have no idea what's about to break"</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-2 border-green-200">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-green-700 mb-6">After (75):</h3>
                  <ul className="space-y-4 text-lg text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">😊</span>
                      <span>"I checked last month, it's fine"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">😊</span>
                      <span>"Next inspection is in 2 weeks"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">😊</span>
                      <span>"That's normal, I know what to listen for"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">😊</span>
                      <span>"I have a plan for everything"</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-white border-4 border-green-300">
              <CardContent className="p-12 text-center">
                <p className="text-3xl font-bold text-gray-900 mb-4">
                  You go from REACTING to PREVENTING.
                </p>
                <p className="text-2xl text-gray-700">
                  That's worth way more than $1,000.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* SECTION 7: THE COMPARISON */}
        <div className="py-20 px-8 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">YOU (62) VS EVERYONE ELSE:</h2>
            
            <Card className="mb-12">
              <CardContent className="p-8">
                <p className="text-xl font-bold text-red-600 mb-4 text-center">You're here (bottom 65%)</p>
                <Progress value={62} className="h-8 mb-6" />
                <p className="text-lg text-gray-700 text-center">Out of 100 homes:</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-4xl font-bold text-gray-900 mb-2">65</p>
                    <p className="text-gray-700">homes are better than yours</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-4xl font-bold text-gray-900 mb-2">35</p>
                    <p className="text-gray-700">homes are worse than yours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center mb-8">
              <p className="text-3xl font-bold text-gray-900">⬇️</p>
            </div>
            
            <Card className="bg-green-50 border-2 border-green-300">
              <CardContent className="p-8">
                <p className="text-xl font-bold text-green-600 mb-4 text-center">At 75 (Bronze) - You'd be here</p>
                <Progress value={75} className="h-8 mb-6" />
                <p className="text-lg text-gray-700 text-center">Out of 100 homes:</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-4 bg-green-100 rounded-lg">
                    <p className="text-4xl font-bold text-gray-900 mb-2">35</p>
                    <p className="text-gray-700">homes would be better than yours</p>
                  </div>
                  <div className="text-center p-4 bg-green-200 rounded-lg">
                    <p className="text-4xl font-bold text-gray-900 mb-2">65</p>
                    <p className="text-gray-700">homes would be worse than yours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <p className="text-3xl font-bold text-gray-900 text-center mt-12">
              You flip from bottom tier to above average.
            </p>
          </div>
        </div>

        {/* SECTION 8: AFTER BRONZE */}
        <div className="py-20 px-8 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">AND AFTER YOU GET BRONZE?</h2>
            
            <div className="mb-12 text-center">
              <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
                <Badge className="bg-amber-600 text-white text-lg px-4 py-2">⭐ Bronze (75)</Badge>
                <span className="text-2xl">→</span>
                <Badge className="bg-gray-500 text-white text-lg px-4 py-2">⭐⭐ Silver (85)</Badge>
                <span className="text-2xl">→</span>
                <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">⭐⭐⭐ Gold (90)</Badge>
                <span className="text-2xl">→</span>
                <Badge className="bg-purple-600 text-white text-lg px-4 py-2">⭐⭐⭐⭐ Platinum (96)</Badge>
              </div>
              
              <Card className="mb-8">
                <CardContent className="p-8">
                  <p className="text-xl font-bold text-gray-900 mb-4">Each level:</p>
                  <ul className="space-y-3 text-lg text-gray-700 text-left max-w-xl mx-auto">
                    <li className="flex items-start gap-3">
                      <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <span>Better insurance discounts</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <span>Higher home value</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                      <span>More peace of mind</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <DollarSign className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                      <span>Easier to sell</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-blue-50 border-2 border-blue-200">
              <CardContent className="p-8">
                <p className="text-xl font-bold text-gray-900 mb-4">Sarah in Portland went from 62 → 85 in 18 months:</p>
                <blockquote className="text-lg text-gray-700 italic border-l-4 border-blue-400 pl-4">
                  "I caught a roof leak before it destroyed my attic. Cost me $200 to fix. 
                  My neighbor ignored theirs for 6 months. Cost him $12,000."
                </blockquote>
                <p className="text-xl font-bold text-gray-900 mt-6">That's what this system does.</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* SECTION 9: THE CALL TO ACTION */}
        <div className="py-20 px-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-8">READY TO GO FROM 62 TO 75?</h2>
            
            <p className="text-2xl mb-4">We're launching in Clark County.</p>
            <p className="text-2xl mb-12">Join the waitlist now.</p>
            
            <Card className="bg-white text-gray-900 mb-8">
              <CardContent className="p-8">
                <p className="text-xl font-bold mb-6">When you join, you'll get:</p>
                <ul className="space-y-4 text-lg text-left max-w-xl mx-auto">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <span>Your actual starting score</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <span>Your personalized 3-step plan</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <span>First access when we launch</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Button 
              size="lg"
              onClick={() => navigate(createPageUrl('Waitlist'))}
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-2xl px-16 py-8 rounded-full shadow-2xl mb-12"
            >
              JOIN WAITLIST
            </Button>
            
            <div className="border-t-2 border-white/30 pt-8">
              <p className="text-xl mb-6">Or explore another demo:</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => navigate(createPageUrl('DemoImproving'))}
                >
                  78 - Already Improving
                </Button>
                <Button 
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => navigate(createPageUrl('DemoExcellent'))}
                >
                  92 - Crushing It
                </Button>
                <Button 
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => navigate(createPageUrl('DemoPortfolio'))}
                >
                  84 - Portfolio
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}