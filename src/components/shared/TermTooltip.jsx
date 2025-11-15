import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../ui/tooltip';

const TERM_DEFINITIONS = {
  "baseline": "Documenting what systems exist in your home and their condition",
  "cascade failure": "When a small $50 problem becomes a $5,000 disaster",
  "health score": "0-100 rating of your property's overall condition",
  "system": "Major home component like HVAC, water heater, roof, etc.",
  "prioritize": "Ranking tasks by urgency to fix critical issues first",
  "preserve": "Preventive maintenance that extends system lifespan 20-40%",
  "scale": "Managing multiple properties with the same systematic approach",
  "execute": "Completing maintenance tasks yourself or with contractors"
};

export default function TermTooltip({ term, children }) {
  const definition = TERM_DEFINITIONS[term.toLowerCase()];
  
  if (!definition) {
    return <>{children}</>;
  }
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className="underline decoration-dotted decoration-gray-400 cursor-help">
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs">{definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}