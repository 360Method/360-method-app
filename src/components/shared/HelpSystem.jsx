import { HelpCircle, PlayCircle, BookOpen, List, Map, Rocket } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import GlossaryDialog from './GlossaryDialog';
import MethodExplainer from './MethodExplainer';
import JourneyRoadmap from './JourneyRoadmap';
import { useDemo } from './DemoContext';

export default function HelpSystem({ currentPhase, nextStep, selectedProperty, systems, tasks }) {
  const navigate = useNavigate();
  const { demoMode } = useDemo();
  const [showGlossary, setShowGlossary] = useState(false);
  const [showMethod, setShowMethod] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="gap-2"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Help</span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80" align="end">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">
              {demoMode ? '🎬 Demo Guide' : 'Quick Help'}
            </h3>
            
            {demoMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                <p className="text-xs text-blue-900 font-medium mb-2">
                  You're exploring a complete demo property with:
                </p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• 16 documented systems</li>
                  <li>• 5 completed maintenance tasks</li>
                  <li>• $12,400 in prevented disasters</li>
                  <li>• 10-year wealth projection</li>
                </ul>
              </div>
            )}
            
            <div className="space-y-1">
              {demoMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100"
                  onClick={() => navigate(createPageUrl('Waitlist'))}
                >
                  <Rocket className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="font-semibold text-blue-700">Join Waitlist</span>
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowMethod(true)}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                What is the 360° Method?
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowRoadmap(true)}
              >
                <Map className="w-4 h-4 mr-2" />
                {demoMode ? 'Demo Roadmap (9 Steps)' : 'View Your Roadmap'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowGlossary(true)}
              >
                <List className="w-4 h-4 mr-2" />
                Glossary (Terms Explained)
              </Button>
            </div>
            
            <div className="border-t border-gray-200 my-2" />
            <div className="text-xs text-gray-600 space-y-1">
              {demoMode ? (
                <>
                  <p className="text-gray-700 font-medium mb-1">Demo Progress:</p>
                  <p>
                    <span className="text-gray-500">Current phase:</span>{' '}
                    <strong className="text-blue-600">{currentPhase || 'AWARE'}</strong>
                  </p>
                  <p className="text-gray-500 mt-2">
                    Navigate through all 9 steps to see the complete 360° Method in action
                  </p>
                </>
              ) : (
                <>
                  {currentPhase && (
                    <p>
                      <span className="text-gray-500">Current phase:</span>{' '}
                      <strong>{currentPhase}</strong>
                    </p>
                  )}
                  {nextStep && (
                    <p>
                      <span className="text-gray-500">Next step:</span>{' '}
                      <strong>{nextStep}</strong>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Dialogs */}
      <GlossaryDialog 
        open={showGlossary} 
        onClose={() => setShowGlossary(false)} 
      />
      <MethodExplainer 
        open={showMethod} 
        onClose={() => setShowMethod(false)} 
      />
      <JourneyRoadmap 
        open={showRoadmap} 
        onClose={() => setShowRoadmap(false)}
        selectedProperty={selectedProperty}
        systems={systems}
        tasks={tasks}
      />
    </>
  );
}