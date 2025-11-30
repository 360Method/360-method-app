import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDemo } from '@/components/shared/DemoContext';
import { createPageUrl } from '@/utils';
import { Home, Building2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function DemoEntry() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { enterDemoMode } = useDemo();
  
  const userType = searchParams.get('type');
  const scoreLevel = searchParams.get('score');

  const handleEnterDemo = (demoType, score) => {
    if (score === 'struggling') {
      enterDemoMode('struggling');
      navigate(createPageUrl('DemoOverwhelmed'));
    } else if (score === 'improving') {
      enterDemoMode('homeowner', 'improving');
      navigate(createPageUrl('DemoImproving'));
    } else if (score === 'excellent') {
      enterDemoMode('homeowner', 'excellent');
      navigate(createPageUrl('DemoExcellent'));
    } else if (score === 'portfolio') {
      enterDemoMode('investor');
      navigate(createPageUrl('DemoPortfolio'));
    } else {
      enterDemoMode(demoType);
      if (demoType === 'homeowner' || score !== 'portfolio') {
        navigate(createPageUrl('DashboardHomeowner') + `?score=${score || 'improving'}`);
      } else {
        navigate(createPageUrl('DashboardInvestor'));
      }
    }
  };

  // Show score selection if no type/score specified
  if (!userType && !scoreLevel) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-2"
            >
              ← Back
            </button>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Which Journey Sounds Like Yours?
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Pick the situation that feels most like you.
            </p>
            <p className="text-base text-gray-500">
              Explore real examples, then create your free account when ready.
            </p>
          </div>
          
          {/* Score Level Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            
            {/* Struggling Home */}
            <Card className="hover:shadow-lg transition-shadow border-2 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">😰</div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">62</div>
                    <div className="text-xs text-gray-500">Current Score</div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">THE OVERWHELMED OWNER</h3>
                <p className="text-lg italic text-gray-600 mb-6">"I have no idea what's about to break."</p>
                
                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-900 mb-2">You right now:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Reacting to emergencies</li>
                    <li>• Crossing fingers nothing breaks</li>
                    <li>• Losing weekends to home chaos</li>
                  </ul>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-900 mb-2">Where you could be:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>→ Nothing surprises you</li>
                    <li>→ Problems caught early</li>
                    <li>→ Peace of mind</li>
                  </ul>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  <strong>The transformation:</strong> 6 months, $1,000
                </p>
                
                <Button 
                  onClick={() => handleEnterDemo('homeowner', 'struggling')}
                  className="w-full"
                >
                  See This Journey →
                </Button>
              </CardContent>
            </Card>
            
            {/* Improving Home */}
            <Card className="hover:shadow-lg transition-shadow border-2 border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">😊</div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">78</div>
                    <div className="text-xs text-gray-500">Current Score</div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">THE ORGANIZED OWNER</h3>
                <p className="text-lg italic text-gray-600 mb-6">"I maintain pretty well, but is it enough?"</p>
                
                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-900 mb-2">You right now:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Doing quarterly checks (mostly)</li>
                    <li>• Bronze certified - doing okay</li>
                    <li>• Could your home be worth more?</li>
                  </ul>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-900 mb-2">Where you could be:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>→ Never skip maintenance</li>
                    <li>→ Home value up 5%</li>
                    <li>→ Silver certified (top 15%)</li>
                  </ul>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  <strong>The upgrade:</strong> 3 months, $400
                </p>
                
                <Button 
                  onClick={() => handleEnterDemo('homeowner', 'improving')}
                  className="w-full"
                >
                  See This Journey →
                </Button>
              </CardContent>
            </Card>
            
            {/* Excellent Home */}
            <Card className="hover:shadow-lg transition-shadow border-2 border-yellow-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">🏆</div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">92</div>
                    <div className="text-xs text-gray-500">Current Score</div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">THE ELITE OWNER</h3>
                <p className="text-lg italic text-gray-600 mb-6">"My home is dialed in. How do I keep it there?"</p>
                
                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-900 mb-2">You right now:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Gold certified (top 5%)</li>
                    <li>• Perfect maintenance routine</li>
                    <li>• Everything documented</li>
                  </ul>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-900 mb-2">How to maintain excellence:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>→ Keep the system effortless</li>
                    <li>→ Premium value when selling</li>
                    <li>→ Benchmark-quality property</li>
                  </ul>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Your maintenance strategy</strong>
                </p>
                
                <Button 
                  onClick={() => handleEnterDemo('homeowner', 'excellent')}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  See This Journey →
                </Button>
              </CardContent>
            </Card>
            
            {/* Portfolio */}
            <Card className="hover:shadow-lg transition-shadow border-2 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">🏢</div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">79</div>
                    <div className="text-xs text-gray-500">Portfolio Avg</div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">THE PORTFOLIO OPERATOR</h3>
                <p className="text-lg italic text-gray-600 mb-6">"How do I manage 3 properties without chaos?"</p>
                
                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-900 mb-2">You right now:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 3 properties, mixed condition</li>
                    <li>• Getting emergency calls</li>
                    <li>• Spending $8K+ on reactive repairs</li>
                  </ul>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-900 mb-2">Where you could be:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>→ One dashboard, all 3 properties</li>
                    <li>→ Cut reactive repairs 60%</li>
                    <li>→ Professional operation</li>
                  </ul>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  <strong>The transformation:</strong> 6 months, $3,500
                </p>
                
                <Button 
                  onClick={() => handleEnterDemo('investor', 'portfolio')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  See This Journey →
                </Button>
              </CardContent>
            </Card>
            
          </div>
          
          {/* Info Box */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Each journey shows real examples with actual numbers and timelines.</span> See how others transformed from where you are now. No sign-up required.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    );
  }

  // If type specified, show that specific demo (legacy flow support)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto text-center">
        <button
          onClick={() => navigate(createPageUrl('DemoEntry'))}
          className="text-blue-600 hover:text-blue-700 mb-8 inline-flex items-center gap-2"
        >
          ← Choose Different Demo
        </button>
        
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-4">
            {userType === 'investor' ? (
              <Building2 className="w-5 h-5 text-green-600" />
            ) : (
              <Home className="w-5 h-5 text-blue-600" />
            )}
            <span className="text-sm font-semibold text-gray-700">
              {userType === 'investor' ? 'Investor Demo' : 'Homeowner Demo'}
            </span>
          </div>
          
          <Button
            onClick={() => handleEnterDemo(userType, scoreLevel || 'improving')}
            size="lg"
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg text-lg hover:bg-blue-700"
          >
            Enter Demo →
          </Button>
        </div>
      </div>
    </div>
  );
}