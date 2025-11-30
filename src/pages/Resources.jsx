import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  MapPin,
  FileText,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/AuthContext';
import { supabase, hasResourceAccess } from '@/api/supabaseClient';
import { FreeGuideCard } from '@/components/resources/FreeGuideCard';
import { LockedGuideCard } from '@/components/resources/LockedGuideCard';
import { CategoryTabs } from '@/components/resources/CategoryTabs';
import { UpgradeCTA, UnlockModal } from '@/components/resources/UpgradeCTA';

export default function Resources() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);

  // Check if user has access to paid content
  const hasPaidAccess = hasResourceAccess(user);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch all guides from database
  const { data: guides = [], isLoading, error } = useQuery({
    queryKey: ['resource-guides'],
    queryFn: async () => {
      console.log('[Resources] Fetching guides from Supabase...');

      // First try with full schema (after migration 021)
      let query = supabase
        .from('resource_guides')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      let { data, error } = await query;

      // If error (e.g., column doesn't exist), try basic query
      if (error) {
        console.warn('[Resources] Full query failed, trying basic query:', error.message);
        const basicQuery = await supabase
          .from('resource_guides')
          .select('*')
          .order('created_at', { ascending: false });

        if (basicQuery.error) {
          console.error('[Resources] Basic query also failed:', basicQuery.error);
          throw basicQuery.error;
        }

        data = basicQuery.data;
        console.log('[Resources] Basic query succeeded:', data?.length || 0, 'guides');
      } else {
        console.log('[Resources] Fetched guides:', data?.length || 0, 'guides');
      }

      // Map field names for consistency and add defaults for missing columns
      return (data || []).map(guide => ({
        ...guide,
        read_time_minutes: guide.estimated_read_time_minutes || guide.read_time_minutes || 5,
        is_free: guide.is_free ?? false,
        slug: guide.slug || guide.id,
        category: guide.category || 'General'
      }));
    }
  });

  // Split guides into free and paid
  const freeGuides = guides.filter(g => g.is_free);
  const paidGuides = guides.filter(g => !g.is_free);

  // Filter paid guides by category
  const filteredPaidGuides = activeCategory === 'all'
    ? paidGuides
    : paidGuides.filter(g => g.category === activeCategory);

  // Count guides per category for tabs
  const categoryCounts = paidGuides.reduce((acc, guide) => {
    acc[guide.category] = (acc[guide.category] || 0) + 1;
    return acc;
  }, {});

  // Handle click on locked guide
  const handleLockedGuideClick = (guide) => {
    setSelectedGuide(guide);
    setShowUnlockModal(true);
  };

  // Handle click on accessible paid guide
  const handlePaidGuideClick = (guide) => {
    navigate(`/Resources/guide/${guide.slug}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading resources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('[Resources] Query error:', error);
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-red-500 mb-2">Failed to load resources. Please try again.</p>
          <p className="text-sm text-muted-foreground mb-4">
            {error?.message || 'Unknown error'}
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Member Resource Center
          </h1>
          <p className="text-muted-foreground">
            Your complete home maintenance education library
          </p>
        </div>

        {/* Free Resources Section */}
        <section className="mb-8 md:mb-12">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-600" />
            Free Resources
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {freeGuides.map((guide) => (
              <FreeGuideCard key={guide.id} guide={guide} />
            ))}
          </div>

          {freeGuides.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No free resources available yet.
            </p>
          )}
        </section>

        {/* Member Library Section */}
        <section className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Member Library
                {!hasPaidAccess && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {paidGuides.length} guides
                  </Badge>
                )}
              </h2>
              {!hasPaidAccess && (
                <p className="text-sm text-muted-foreground mt-1">
                  Unlock all guides with a membership
                </p>
              )}
            </div>

            {/* Category tabs */}
            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              counts={categoryCounts}
            />
          </div>

          {/* Guides grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPaidGuides.map((guide) => (
              hasPaidAccess ? (
                // User has access - show clickable card
                <PaidGuideCard
                  key={guide.id}
                  guide={guide}
                  onClick={() => handlePaidGuideClick(guide)}
                />
              ) : (
                // User doesn't have access - show locked card
                <LockedGuideCard
                  key={guide.id}
                  guide={guide}
                  onUnlockClick={() => handleLockedGuideClick(guide)}
                />
              )
            ))}
          </div>

          {filteredPaidGuides.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No guides found in this category.
            </p>
          )}
        </section>

        {/* Upgrade CTA (only show if user doesn't have access) */}
        {!hasPaidAccess && (
          <section className="mb-8">
            <UpgradeCTA variant="banner" />
          </section>
        )}
      </div>

      {/* Unlock Modal */}
      <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
        <DialogContent className="sm:max-w-md">
          <UnlockModal
            guide={selectedGuide}
            onClose={() => setShowUnlockModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Paid guide card for members who have access
 */
function PaidGuideCard({ guide, onClick }) {
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
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Category badge */}
      <div className="flex items-center justify-between mb-3">
        <Badge className={getCategoryColor(guide.category)}>
          {guide.category}
        </Badge>
        {guide.region === 'pnw' && (
          <Badge variant="outline" className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            PNW
          </Badge>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
        {guide.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
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

        {/* Checklist indicator */}
        {guide.checklist_data && (
          <Badge variant="secondary" className="text-xs">
            <FileText className="w-3 h-3 mr-1" />
            PDF
          </Badge>
        )}
      </div>
    </Card>
  );
}
