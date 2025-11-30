import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

/**
 * Locked guide card with blur effect for non-members
 *
 * @param {Object} guide - The guide data
 * @param {Function} onUnlockClick - Callback when unlock button is clicked
 */
export function LockedGuideCard({ guide, onUnlockClick }) {
  const navigate = useNavigate();

  const handleUnlock = () => {
    if (onUnlockClick) {
      onUnlockClick(guide);
    } else {
      navigate('/Pricing');
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Awareness':
        return 'bg-blue-100 text-blue-700';
      case 'Seasonal':
        return 'bg-green-100 text-green-700';
      case 'PNW':
        return 'bg-purple-100 text-purple-700';
      case 'Smart Homeowner':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="relative overflow-hidden group">
      {/* Blurred content preview */}
      <div className="blur-sm opacity-60 pointer-events-none select-none p-4">
        {/* Category badge */}
        <Badge variant="secondary" className={`mb-3 ${getCategoryColor(guide.category)}`}>
          {guide.category}
        </Badge>

        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {guide.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {guide.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {guide.read_time_minutes && (
            <span>{guide.read_time_minutes} min read</span>
          )}
          {guide.difficulty_level && (
            <Badge variant="outline" className="text-xs">
              {guide.difficulty_level}
            </Badge>
          )}
        </div>

        {/* Checklist indicator */}
        {guide.checklist_data && (
          <div className="mt-3 flex items-center gap-1 text-xs text-blue-600">
            <span>Includes PDF Checklist</span>
          </div>
        )}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[1px]">
        <div className="bg-white/95 rounded-xl p-4 shadow-lg text-center max-w-[180px]">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
            <Lock className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-900 block mb-2">
            Members Only
          </span>
          <Button
            size="sm"
            onClick={handleUnlock}
            className="w-full"
          >
            Unlock Access
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default LockedGuideCard;
