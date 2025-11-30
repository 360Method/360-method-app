import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  MapPin,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/AuthContext';
import { supabase, hasResourceAccess } from '@/api/supabaseClient';
import { ChecklistDownloadCard } from '@/components/resources/ChecklistDownload';
import { UnlockModal } from '@/components/resources/UpgradeCTA';

export default function GuideDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Fetch guide by slug
  const { data: guide, isLoading, error } = useQuery({
    queryKey: ['resource-guide', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resource_guides')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      // Map field names for consistency
      return {
        ...data,
        read_time_minutes: data.estimated_read_time_minutes || data.read_time_minutes,
        content_markdown: data.content || data.content_markdown
      };
    },
    enabled: !!slug
  });

  // Check if user can access this guide
  const canAccess = guide?.is_free || hasResourceAccess(user);

  // Redirect to unlock modal if trying to access paid content without access
  useEffect(() => {
    if (guide && !guide.is_free && !canAccess) {
      setShowUnlockModal(true);
    }
  }, [guide, canAccess]);

  // Increment view count when guide is accessed
  useEffect(() => {
    if (guide?.id && canAccess) {
      supabase
        .from('resource_guides')
        .update({ view_count: (guide.view_count || 0) + 1 })
        .eq('id', guide.id)
        .then(() => {});
    }
  }, [guide?.id, canAccess]);

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
      case 'Getting Started':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-24 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-3xl mx-auto text-center py-12">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Guide Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The guide you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/Resources')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Resources
          </Button>
        </div>
      </div>
    );
  }

  // If user doesn't have access, show locked state
  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            to="/Resources"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Resources
          </Link>

          {/* Locked content preview */}
          <Card className="p-6 md:p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {guide.title}
            </h1>

            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {guide.description}
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <Badge className={getCategoryColor(guide.category)}>
                {guide.category}
              </Badge>
              {guide.read_time_minutes && (
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  {guide.read_time_minutes} min read
                </Badge>
              )}
              {guide.region === 'pnw' && (
                <Badge variant="outline">
                  <MapPin className="w-3 h-3 mr-1" />
                  PNW Region
                </Badge>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium mb-2">This guide includes:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complete {guide.category?.toLowerCase()} guidance</li>
                <li>• When to call a professional</li>
                {guide.checklist_data && (
                  <li>• Downloadable PDF checklist</li>
                )}
              </ul>
            </div>

            <Button size="lg" onClick={() => navigate('/Pricing')}>
              Upgrade to Access
            </Button>
          </Card>
        </div>

        {/* Unlock modal */}
        <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
          <DialogContent className="sm:max-w-md">
            <UnlockModal
              guide={guide}
              onClose={() => {
                setShowUnlockModal(false);
                navigate('/Resources');
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // User has access - show full guide
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto p-4 md:p-6">
          {/* Back link */}
          <Link
            to="/Resources"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Resources
          </Link>

          {/* Title and meta */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            {guide.title}
          </h1>

          <div className="flex flex-wrap gap-3 mb-4">
            <Badge className={getCategoryColor(guide.category)}>
              {guide.category}
            </Badge>
            {guide.read_time_minutes && (
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {guide.read_time_minutes} min read
              </Badge>
            )}
            {guide.difficulty_level && (
              <Badge variant="outline">
                <BookOpen className="w-3 h-3 mr-1" />
                {guide.difficulty_level}
              </Badge>
            )}
            {guide.region === 'pnw' && (
              <Badge variant="outline" className="bg-purple-50">
                <MapPin className="w-3 h-3 mr-1" />
                PNW Region
              </Badge>
            )}
            {guide.is_free && (
              <Badge className="bg-green-100 text-green-700">
                Free Access
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground">
            {guide.description}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        {/* Checklist download */}
        {guide.checklist_data && (
          <div className="mb-6">
            <ChecklistDownloadCard
              checklistData={guide.checklist_data}
              guideTitle={guide.title}
            />
          </div>
        )}

        {/* Guide content */}
        <Card className="p-4 md:p-6">
          <article className="prose prose-gray max-w-none">
            <ReactMarkdown
              components={{
                // Style headers
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mt-8 mb-4 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-900">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-medium mt-4 mb-2 text-gray-900">
                    {children}
                  </h3>
                ),
                // Style paragraphs
                p: ({ children }) => (
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                // Style lists
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 mb-4 text-gray-700">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 mb-4 text-gray-700">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700">{children}</li>
                ),
                // Style blockquotes (used for disclaimers)
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-amber-400 bg-amber-50 p-4 my-4 text-amber-900">
                    {children}
                  </blockquote>
                ),
                // Style strong text
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900">
                    {children}
                  </strong>
                ),
                // Style horizontal rules
                hr: () => <hr className="my-6 border-gray-200" />
              }}
            >
              {guide.content_markdown || ''}
            </ReactMarkdown>
          </article>
        </Card>

        {/* Checklist download (also at bottom) */}
        {guide.checklist_data && (
          <div className="mt-6">
            <ChecklistDownloadCard
              checklistData={guide.checklist_data}
              guideTitle={guide.title}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate('/Resources')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Resources
          </Button>
        </div>
      </div>
    </div>
  );
}
