import { BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

/**
 * Free guide card - fully accessible to all users
 *
 * @param {Object} guide - The guide data
 */
export function FreeGuideCard({ guide }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/Resources/guide/${guide.slug}`);
  };

  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer border-green-200 bg-gradient-to-br from-green-50/50 to-white"
      onClick={handleClick}
    >
      {/* Free badge */}
      <div className="flex items-center justify-between mb-3">
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Free Access
        </Badge>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          {guide.category || 'Getting Started'}
        </Badge>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
        {guide.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {guide.description}
      </p>

      {/* Meta info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {guide.read_time_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {guide.read_time_minutes} min
            </span>
          )}
          {guide.difficulty_level && (
            <Badge variant="outline" className="text-xs">
              {guide.difficulty_level}
            </Badge>
          )}
        </div>

        <Button variant="ghost" size="sm" className="text-blue-600">
          <BookOpen className="w-4 h-4 mr-1" />
          Read
        </Button>
      </div>
    </Card>
  );
}

export default FreeGuideCard;
