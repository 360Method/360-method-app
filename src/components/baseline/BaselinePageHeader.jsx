import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function BaselinePageHeader({ property, documentedCount, totalRequired }) {
  const progress = property?.baseline_completion || 0;
  
  if (progress === 0) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge className="bg-blue-600 text-white">Phase I - AWARE</Badge>
          <Badge variant="outline">Step 1 of 9</Badge>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
          Document Your Property
        </h1>
        <p className="text-gray-600 text-lg">
          Before we can protect your home, we need to know what's in it. 
          This takes 10-15 minutes with the Quick Start Wizard.
        </p>
      </div>
    );
  }
  
  if (progress < 66) {
    const remaining = Math.max(0, 4 - documentedCount);
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge className="bg-blue-600 text-white">Phase I - AWARE</Badge>
          <Badge className="bg-blue-100 text-blue-700">{progress}% Complete</Badge>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
          Continue Your Baseline
        </h1>
        <p className="text-gray-600 text-lg">
          You're making progress! {remaining > 0 ? `${remaining} essential system${remaining !== 1 ? 's' : ''} left to unlock ACT phase.` : 'Almost there!'}
        </p>
      </div>
    );
  }
  
  if (progress < 100) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge className="bg-green-600 text-white">✓ ACT Phase Unlocked</Badge>
          <Badge className="bg-blue-100 text-blue-700">{progress}%</Badge>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
          Great Progress!
        </h1>
        <p className="text-gray-600 text-lg">
          ACT phase is now available. Want to complete your baseline for full benefits?
        </p>
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge className="bg-green-600 text-white">✓ Complete</Badge>
        <Badge variant="outline">100%</Badge>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
        Baseline Complete! 🎉
      </h1>
      <p className="text-gray-600 text-lg">
        You've documented {documentedCount} systems. 
        Ready to <Link to={createPageUrl("Prioritize")} className="text-blue-600 hover:underline font-semibold">prioritize fixes</Link>?
      </p>
    </div>
  );
}