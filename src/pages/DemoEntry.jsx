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
      navigate(createPageUrl('DemoStruggling'));
    } else if (score === 'improving') {
      enterDemoMode('homeowner');
      navigate(createPageUrl('DemoImproving'));
    } else if (score === 'excellent') {
      enterDemoMode('homeowner');
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
              onClick={() => navigate(createPageUrl('Welcome'))}
              className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-2"
            >
              ← Back
            </button>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Compare Different Score Levels
            </h1>
            <p className="text-lg text-gray-600">
              Pick one to explore in detail
            </p>
          </div>
          
          {/* Score Level Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            
            {/* Struggling Home */}
            <Card className="hover:shadow-lg transition-shadow border-2 border-red-200">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-3xl mb-2">😰</div>
                    <CardTitle className="text-xl">The Struggling Home</CardTitle>
                  </div>
                  <Badge variant="destructive">Needs Work</Badge>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">62/100</div>
                <Progress value={62} className="h-3 mb-4" />
                <p className="text-sm text-gray-600">
                  Reactive maintenance. No tracking. Bottom 65%.
                </p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleEnterDemo('homeowner', 'struggling')}
                  className="w-full"
                  variant="outline"
                >
                  See This Home
                </Button>
              </CardContent>
            </Card>
            
            {/* Improving Home */}
            <Card className="hover:shadow-lg transition-shadow border-2 border-amber-200">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-3xl mb-2">😊</div>
                    <CardTitle className="text-xl">The Improving Home</CardTitle>
                  </div>
                  <Badge className="bg-amber-600">Bronze ⭐</Badge>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">78/100</div>
                <Progress value={78} className="h-3 mb-4" />
                <p className="text-sm text-gray-600">
                  Getting better. Bronze certified. Better than 65%.
                </p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleEnterDemo('homeowner', 'improving')}
                  className="w-full"
                >
                  See This Home
                </Button>
              </CardContent>
            </Card>
            
            {/* Excellent Home */}
            <Card className="hover:shadow-lg transition-shadow border-2 border-yellow-300">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-3xl mb-2">🏆</div>
                    <CardTitle className="text-xl">The Excellent Home</CardTitle>
                  </div>
                  <Badge className="bg-yellow-500">Gold ⭐⭐⭐</Badge>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">92/100</div>
                <Progress value={92} className="h-3 mb-4" />
                <p className="text-sm text-gray-600">
                  Elite maintenance. Gold certified. Top 5%.
                </p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleEnterDemo('homeowner', 'excellent')}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  See This Home
                </Button>
              </CardContent>
            </Card>
            
            {/* Portfolio */}
            <Card className="hover:shadow-lg transition-shadow border-2 border-green-200">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-3xl mb-2">🏢</div>
                    <CardTitle className="text-xl">Investor Portfolio</CardTitle>
                  </div>
                  <Badge className="bg-green-600">Bronze Portfolio</Badge>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">79/100</div>
                <Progress value={79} className="h-3 mb-4" />
                <p className="text-sm text-gray-600">
                  3 properties. Portfolio average. Better than 65%.
                </p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleEnterDemo('investor', 'portfolio')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  See Portfolio
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
                    <span className="font-semibold">Each demo is fully interactive.</span> You'll see real data, 
                    real scores, and real paths to improvement. No sign-up required.
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