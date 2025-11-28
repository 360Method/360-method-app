import { useEffect } from 'react';
import { useDemo } from '@/components/shared/DemoContext';
import Score360 from './Score360';

export default function DemoExcellentScore() {
  const { enterDemoMode, demoMode } = useDemo();

  useEffect(() => {
    if (demoMode !== 'excellent') {
      enterDemoMode('homeowner', 'excellent');
    }
  }, [demoMode, enterDemoMode]);

  if (demoMode !== 'excellent') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return <Score360 />;
}
