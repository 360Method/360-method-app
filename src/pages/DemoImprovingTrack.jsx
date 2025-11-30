import { useEffect } from 'react';
import { useDemo } from '@/components/shared/DemoContext';
import Track from './Track';

export default function DemoImprovingTrack() {
  const { enterDemoMode, demoMode } = useDemo();

  useEffect(() => {
    if (demoMode !== 'improving') {
      enterDemoMode('homeowner', 'improving');
    }
  }, [demoMode, enterDemoMode]);

  if (demoMode !== 'improving') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return <Track />;
}
