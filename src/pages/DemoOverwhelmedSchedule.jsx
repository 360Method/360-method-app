import { useEffect } from 'react';
import { useDemo } from '@/components/shared/DemoContext';
import Schedule from './Schedule';

export default function DemoOverwhelmedSchedule() {
  const { enterDemoMode, demoMode } = useDemo();

  useEffect(() => {
    if (demoMode !== 'struggling') {
      enterDemoMode('struggling');
    }
  }, [demoMode, enterDemoMode]);

  if (demoMode !== 'struggling') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return <Schedule />;
}
