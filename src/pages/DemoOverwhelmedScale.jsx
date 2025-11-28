import { useEffect } from 'react';
import { useDemo } from '@/components/shared/DemoContext';
import Scale from './Scale';

export default function DemoOverwhelmedScale() {
  const { enterDemoMode, demoMode } = useDemo();

  useEffect(() => {
    if (demoMode !== 'struggling') {
      enterDemoMode('homeowner', 'struggling');
    }
  }, [demoMode, enterDemoMode]);

  if (demoMode !== 'struggling') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return <Scale />;
}
