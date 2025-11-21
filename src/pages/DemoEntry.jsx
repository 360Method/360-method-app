import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDemo } from '@/components/shared/DemoContext';
import { createPageUrl } from '@/utils';
import { CheckCircle2, ArrowRight, Home, Building2, TrendingUp, Shield, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DemoEntry() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { enterDemoMode } = useDemo();
  
  const userType = searchParams.get('type') || 'homeowner';
  const isInvestor = userType === 'investor';

  const handleEnterDemo = () => {
    enterDemoMode(userType);
    navigate(createPageUrl('Dashboard'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-6">
            {isInvestor ? (
              <Building2 className="w-5 h-5 text-green-600" />
            ) : (
              <Home className="w-5 h-5 text-blue-600" />
            )}
            <span className="text-sm font-semibold text-gray-700">
              {isInvestor ? 'Investor Demo' : 'Homeowner Demo'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {isInvestor ? (
              'The 360° Method for Real Estate Investors'
            ) : (
              'The 360° Method for Homeowners'
            )}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {isInvestor ? (
              'Transform maintenance from a cost center into a wealth-building strategy'
            ) : (
              'From reactive chaos to proactive control in 9 systematic steps'
            )}
          </p>
          
          {/* Top CTA */}
          <div className="flex justify-center">
            <Button
              onClick={handleEnterDemo}
              size="lg"
              className="px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl text-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            >
              {isInvestor ? (
                <>
                  Jump Into Portfolio Demo
                  <ArrowRight className="w-6 h-6 ml-2" />
                </>
              ) : (
                <>
                  Jump Into Demo Property
                  <ArrowRight className="w-6 h-6 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 3x3 Framework */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
            The 9-Step Framework
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* AWARE Phase */}
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-blue-900">AWARE</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>1. Baseline:</strong> Document systems
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>2. Inspect:</strong> Seasonal diagnostics
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>3. Track:</strong> Log maintenance history
                  </div>
                </div>
              </div>
            </div>

            {/* ACT Phase */}
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-purple-900">ACT</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>4. Prioritize:</strong> AI risk analysis
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>5. Schedule:</strong> Strategic timing
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>6. Execute:</strong> DIY or professional
                  </div>
                </div>
              </div>
            </div>

            {/* ADVANCE Phase */}
            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-green-900">ADVANCE</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>7. Preserve:</strong> Extend system life
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>8. Upgrade:</strong> High-ROI improvements
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>9. Scale:</strong> {isInvestor ? 'Portfolio CFO' : 'Multi-property (unlock)'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Preview */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            {isInvestor ? (
              'Explore a 3-Property Portfolio'
            ) : (
              'Explore a Fully Documented Property'
            )}
          </h2>
          
          {isInvestor ? (
            // Investor Stats
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">3</div>
                <div className="text-gray-700 font-semibold">Properties</div>
                <div className="text-sm text-gray-600 mt-2">Duplex, SFH, 4-Plex</div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6">
                <div className="text-4xl font-bold text-green-600 mb-2">$785K</div>
                <div className="text-gray-700 font-semibold">Total Value</div>
                <div className="text-sm text-gray-600 mt-2">$412K equity</div>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">18.2%</div>
                <div className="text-gray-700 font-semibold">Portfolio ROI</div>
                <div className="text-sm text-gray-600 mt-2">$2,710/mo cash flow</div>
              </div>
              
              <div className="bg-orange-50 rounded-xl p-6">
                <div className="text-4xl font-bold text-orange-600 mb-2">22</div>
                <div className="text-gray-700 font-semibold">Active Tasks</div>
                <div className="text-sm text-gray-600 mt-2">Across all properties</div>
              </div>
              
              <div className="bg-red-50 rounded-xl p-6">
                <div className="text-4xl font-bold text-red-600 mb-2">$18.4K</div>
                <div className="text-gray-700 font-semibold">Prevented Costs</div>
                <div className="text-sm text-gray-600 mt-2">Year to date</div>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">81</div>
                <div className="text-gray-700 font-semibold">Avg Health Score</div>
                <div className="text-sm text-gray-600 mt-2">Portfolio-wide</div>
              </div>
            </div>
          ) : (
            // Homeowner Stats
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">16</div>
                <div className="text-gray-700 font-semibold">Systems Documented</div>
                <div className="text-sm text-gray-600 mt-2">100% baseline complete</div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6">
                <div className="text-4xl font-bold text-green-600 mb-2">$7,200</div>
                <div className="text-gray-700 font-semibold">Disasters Prevented</div>
                <div className="text-sm text-gray-600 mt-2">Small problems caught early</div>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">12</div>
                <div className="text-gray-700 font-semibold">Tasks Prioritized</div>
                <div className="text-sm text-gray-600 mt-2">With AI cost analysis</div>
              </div>
              
              <div className="bg-orange-50 rounded-xl p-6">
                <div className="text-4xl font-bold text-orange-600 mb-2">4</div>
                <div className="text-gray-700 font-semibold">Inspections Done</div>
                <div className="text-sm text-gray-600 mt-2">Seasonal diagnostics</div>
              </div>
              
              <div className="bg-red-50 rounded-xl p-6">
                <div className="text-4xl font-bold text-red-600 mb-2">8</div>
                <div className="text-gray-700 font-semibold">Tasks Completed</div>
                <div className="text-sm text-gray-600 mt-2">Full execution history</div>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">87</div>
                <div className="text-gray-700 font-semibold">Health Score</div>
                <div className="text-sm text-gray-600 mt-2">Excellent condition</div>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto text-center">
          <Button
            onClick={handleEnterDemo}
            size="lg"
            className="px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl text-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            {isInvestor ? (
              <>
                Jump Into Portfolio Demo
                <ArrowRight className="w-6 h-6 ml-2" />
              </>
            ) : (
              <>
                Jump Into Demo Property
                <ArrowRight className="w-6 h-6 ml-2" />
              </>
            )}
          </Button>
          
          <p className="text-sm text-gray-600 mt-6">
            Fully interactive • No signup required • Exit anytime
          </p>
        </div>
      </div>
    </div>
  );
}