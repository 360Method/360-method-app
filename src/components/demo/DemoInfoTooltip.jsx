import { useState } from 'react';
import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDemo } from '@/components/shared/DemoContext';

function DemoInfoTooltip({ title, content, placement = 'bottom', className = '' }) {
  const { demoMode } = useDemo();
  const [open, setOpen] = useState(false);

  if (!demoMode) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors ${className}`}
          aria-label="Information"
        >
          <Info className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        align="start" 
        side={placement}
        className="w-80 p-4 bg-white border-2 border-blue-200 shadow-lg"
      >
        <div className="space-y-2">
          <h4 className="font-bold text-blue-900 flex items-center gap-2">
            <Info className="w-4 h-4" />
            {title}
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">
            {content}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DemoInfoTooltip;