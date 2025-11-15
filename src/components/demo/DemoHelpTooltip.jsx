import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export function DemoHelpTooltip({ children, side = 'top' }) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button 
            type="button"
            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors ml-1"
            onClick={(e) => e.preventDefault()}
          >
            <HelpCircle className="w-3 h-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="max-w-xs text-xs bg-blue-900 text-white border-blue-700"
        >
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}