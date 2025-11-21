import { useDemo } from '@/components/shared/DemoContext';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function DontWantDIYBanner() {
  const { demoMode } = useDemo();
  const navigate = useNavigate();

  if (!demoMode) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 md:p-6 mb-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-blue-900 mb-2 text-lg">💡 Not a DIYer? We Can Help</h3>
          <p className="text-blue-800 text-sm mb-4 leading-relaxed">
            Join the waitlist to be notified when we offer full-service concierge 
            options - we'll handle everything for you.
          </p>
          <button
            onClick={() => navigate(createPageUrl('Waitlist') + '?source=full-service')}
            className="px-5 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 text-base font-bold transition-colors shadow-md hover:shadow-lg"
            style={{ minHeight: '48px' }}
          >
            Notify Me When Available →
          </button>
        </div>
      </div>
    </div>
  );
}