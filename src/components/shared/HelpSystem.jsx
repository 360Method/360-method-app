import { HelpCircle, PlayCircle, BookOpen, List, Map } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlossaryDialog from './GlossaryDialog';
import MethodExplainer from './MethodExplainer';
import JourneyRoadmap from './JourneyRoadmap';

export default function HelpSystem({ currentPhase, nextStep, selectedProperty, systems, tasks }) {
  const navigate = useNavigate();
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
            <h3 className="font-semibold text-sm">Quick Help</h3>
            
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/welcome')}
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Watch Quick Tour (15 sec)
              </Button>
              
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
                onClick={() => setShowGlossary(true)}
              >
                <List className="w-4 h-4 mr-2" />
                Glossary (Terms Explained)
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowRoadmap(true)}
              >
                <Map className="w-4 h-4 mr-2" />
                View Your Roadmap
              </Button>
            </div>
            
            {currentPhase && (
              <>
                <div className="border-t border-gray-200 my-2" />
                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    <span className="text-gray-500">Current phase:</span>{' '}
                    <strong>{currentPhase}</strong>
                  </p>
                  {nextStep && (
                    <p>
                      <span className="text-gray-500">Next step:</span>{' '}
                      <strong>{nextStep}</strong>
                    </p>
                  )}
                </div>
              </>
            )}
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