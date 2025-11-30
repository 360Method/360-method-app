import { Sparkles, BookOpen, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

/**
 * Upgrade CTA banner for Resource Center
 *
 * @param {string} variant - 'banner' for full width, 'card' for sidebar
 */
export function UpgradeCTA({ variant = 'banner' }) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/Pricing');
  };

  if (variant === 'card') {
    return (
      <Card className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold">Unlock Full Access</h3>
        </div>

        <ul className="space-y-2 text-sm text-blue-100 mb-4">
          <li className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            15 expert guides
          </li>
          <li className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Downloadable PDF checklists
          </li>
          <li className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New content added monthly
          </li>
        </ul>

        <Button
          onClick={handleUpgrade}
          className="w-full bg-white text-blue-600 hover:bg-blue-50"
        >
          Upgrade Now
        </Button>
      </Card>
    );
  }

  // Default banner variant
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Get Full Access to All Resources</h3>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-blue-100">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              15 expert guides
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              PDF checklists
            </span>
            <span className="flex items-center gap-1">
              <Plus className="w-4 h-4" />
              New monthly content
            </span>
          </div>
        </div>

        <Button
          onClick={handleUpgrade}
          size="lg"
          className="bg-white text-blue-600 hover:bg-blue-50 whitespace-nowrap"
        >
          Upgrade Now
        </Button>
      </div>
    </div>
  );
}

/**
 * Unlock modal content for when user clicks locked content
 */
export function UnlockModal({ guide, onClose }) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose?.();
    navigate('/Pricing');
  };

  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-8 h-8 text-blue-600" />
      </div>

      <h2 className="text-xl font-semibold mb-2">
        Unlock the Full Resource Library
      </h2>

      <p className="text-muted-foreground mb-6">
        Get instant access to "{guide?.title}" and 14 other expert guides with downloadable checklists.
      </p>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium mb-3">Membership includes:</h4>
        <ul className="space-y-2 text-sm text-left max-w-xs mx-auto">
          <li className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            15 comprehensive maintenance guides
          </li>
          <li className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Downloadable PDF checklists for each guide
          </li>
          <li className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            New guides added regularly
          </li>
        </ul>
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onClose}>
          Maybe Later
        </Button>
        <Button onClick={handleUpgrade}>
          View Pricing
        </Button>
      </div>
    </div>
  );
}

export default UpgradeCTA;
