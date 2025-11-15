import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WelcomeDemo() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useEffect(() => {
    if (currentSlide === 0) {
      const timer = setTimeout(() => {
        handleSlideChange(1);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [currentSlide]);
  
  const handleSlideChange = (nextSlide) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(nextSlide);
      setIsTransitioning(false);
    }, 300);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Slide 1: Problem + Solution */}
        {currentSlide === 0 && (
          <div 
            className={`text-center space-y-8 bg-white p-8 md:p-12 rounded-2xl shadow-2xl transition-all duration-300 ${
              isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            <div className="space-y-4">
              <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase">
                360° Asset Command Center
              </p>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                Stop $50 Problems From Becoming $5,000 Disasters
              </h1>
              
              {/* Cascade Animation */}
              <div className="flex items-center justify-center gap-3 md:gap-6 text-xl md:text-3xl font-bold my-8">
                <div className="text-center">
                  <div className="text-green-600">$50</div>
                  <div className="text-xs text-gray-500 mt-1">Clogged gutter</div>
                </div>
                <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                <div className="text-center">
                  <div className="text-yellow-600">$500</div>
                  <div className="text-xs text-gray-500 mt-1">Foundation crack</div>
                </div>
                <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                <div className="text-center">
                  <div className="text-red-600">$5,000</div>
                  <div className="text-xs text-gray-500 mt-1">Basement flood</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
              <h2 className="text-xl md:text-2xl font-bold mb-4">
                The 360° Method Prevents This
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div>
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mb-3 text-lg">
                    1
                  </div>
                  <h3 className="font-semibold mb-1">AWARE</h3>
                  <p className="text-sm text-gray-600">Know your property</p>
                </div>
                
                <div>
                  <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold mb-3 text-lg">
                    2
                  </div>
                  <h3 className="font-semibold mb-1">ACT</h3>
                  <p className="text-sm text-gray-600">Fix problems</p>
                </div>
                
                <div>
                  <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold mb-3 text-lg">
                    3
                  </div>
                  <h3 className="font-semibold mb-1">ADVANCE</h3>
                  <p className="text-sm text-gray-600">Build value</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => handleSlideChange(1)}
                className="gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="ghost"
                onClick={() => navigate('/dashboard?demo=true')}
              >
                Skip Tour
              </Button>
            </div>
          </div>
        )}
        
        {/* Slide 2: Value + CTA */}
        {currentSlide === 1 && (
          <div 
            className={`text-center space-y-6 bg-white p-8 md:p-12 rounded-2xl shadow-2xl transition-all duration-300 ${
              isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Save $27K-$72K Over 10-15 Years
            </h2>
            
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
              Catch problems when they're cheap. Prevent cascade failures. 
              Build wealth through systematic property management.
            </p>
            
            <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200 max-w-md mx-auto">
              <p className="font-semibold mb-3">How it works:</p>
              <ul className="text-left text-sm space-y-2">
                <li>✅ Document your systems (10 min)</li>
                <li>✅ Get seasonal checkup reminders</li>
                <li>✅ Prioritize fixes by urgency</li>
                <li>✅ Track maintenance history</li>
              </ul>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                size="lg"
                onClick={() => navigate('/dashboard?demo=true')}
                className="gap-2"
              >
                Explore Demo Property <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate('/dashboard')}
              >
                Skip to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}