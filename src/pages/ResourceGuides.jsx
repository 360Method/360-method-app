import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Clock, 
  Search,
  Download,
  Eye,
  TrendingUp,
  Star,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ResourceGuides() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || 'all';
  const initialSystem = searchParams.get('system') || 'all';

  const [selectedCategory, setSelectedCategory] = React.useState(initialCategory);
  const [selectedSystem, setSelectedSystem] = React.useState(initialSystem);
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: guides = [] } = useQuery({
    queryKey: ['resource-guides'],
    queryFn: () => base44.entities.ResourceGuide.list('sort_order'),
    initialData: [],
  });

  const categories = [
    "All Guides",
    "Getting Started",
    "AWARE Phase",
    "ACT Phase",
    "ADVANCE Phase",
    "For Homeowners",
    "For Investors",
    "DIY Guides"
  ];

  const systems = [
    "All Systems",
    "HVAC",
    "Plumbing",
    "Electrical",
    "Roofing",
    "Foundation",
    "Exterior",
    "Appliances"
  ];

  let filteredGuides = guides;

  if (selectedCategory !== 'all' && selectedCategory !== 'All Guides') {
    filteredGuides = filteredGuides.filter(g => g.category === selectedCategory);
  }

  if (selectedSystem !== 'all' && selectedSystem !== 'All Systems') {
    filteredGuides = filteredGuides.filter(g => g.system_type === selectedSystem);
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredGuides = filteredGuides.filter(g => 
      g.title.toLowerCase().includes(query) || 
      g.description.toLowerCase().includes(query)
    );
  }

  const featuredGuides = guides.filter(g => g.featured);

  const difficultyColors = {
    Beginner: '#28A745',
    Intermediate: '#FF6B35',
    Advanced: '#DC3545'
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-6xl md:mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            asChild
            variant="ghost"
            className="mb-4"
            style={{ minHeight: '44px' }}
          >
            <Link to={createPageUrl("Resources")}>
              ← Back to Resource Hub
            </Link>
          </Button>

          <h1 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px' }}>
            How-To Library
          </h1>
          <p className="text-gray-600">
            Step-by-step guides for every aspect of home maintenance
          </p>
          <p className="text-sm text-gray-500">
            {guides.length} comprehensive guides
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="border-none shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: '#1B365D' }}>
                  Filter by Category:
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      onClick={() => setSelectedCategory(cat === 'All Guides' ? 'all' : cat)}
                      variant={selectedCategory === cat || (selectedCategory === 'all' && cat === 'All Guides') ? "default" : "outline"}
                      size="sm"
                      style={{
                        backgroundColor: selectedCategory === cat || (selectedCategory === 'all' && cat === 'All Guides') ? '#3B82F6' : 'white',
                        minHeight: '40px'
                      }}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              {/* System Filter */}
              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: '#1B365D' }}>
                  Filter by System:
                </p>
                <div className="flex flex-wrap gap-2">
                  {systems.map((sys) => (
                    <Button
                      key={sys}
                      onClick={() => setSelectedSystem(sys === 'All Systems' ? 'all' : sys)}
                      variant={selectedSystem === sys || (selectedSystem === 'all' && sys === 'All Systems') ? "default" : "outline"}
                      size="sm"
                      style={{
                        backgroundColor: selectedSystem === sys || (selectedSystem === 'all' && sys === 'All Systems') ? '#28A745' : 'white',
                        minHeight: '40px'
                      }}
                    >
                      {sys}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Guides */}
        {featuredGuides.length > 0 && selectedCategory === 'all' && !searchQuery && (
          <div className="mb-8">
            <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#1B365D', fontSize: '22px' }}>
              <Star className="w-6 h-6 text-yellow-500" />
              Most Popular
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {featuredGuides.slice(0, 4).map((guide) => (
                <GuideCard key={guide.id} guide={guide} difficultyColors={difficultyColors} />
              ))}
            </div>
          </div>
        )}

        {/* All Guides */}
        {filteredGuides.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No Guides Found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search query
              </p>
              <Button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSystem('all');
                  setSearchQuery('');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div>
            <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
              {selectedCategory !== 'all' ? selectedCategory : selectedSystem !== 'all' ? `${selectedSystem} Guides` : 'All Guides'}
              <span className="text-gray-500 font-normal text-lg ml-2">
                ({filteredGuides.length})
              </span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredGuides.map((guide) => (
                <GuideCard key={guide.id} guide={guide} difficultyColors={difficultyColors} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GuideCard({ guide, difficultyColors }) {
  return (
    <Card className="border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all">
      <CardContent className="p-5">
        <Link to={createPageUrl("GuideDetail") + `?id=${guide.id}`}>
          <div className="flex items-start justify-between mb-3">
            <Badge style={{ backgroundColor: '#3B82F6' }}>
              {guide.category}
            </Badge>
            {guide.downloadable_checklist_url && (
              <Download className="w-5 h-5 text-gray-400" />
            )}
          </div>

          <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '18px' }}>
            {guide.title}
          </h3>

          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {guide.description}
          </p>

          <div className="flex flex-wrap gap-3 mb-3">
            {guide.time_required && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {guide.time_required}
              </div>
            )}
            <Badge
              variant="outline"
              style={{ 
                borderColor: difficultyColors[guide.difficulty_level],
                color: difficultyColors[guide.difficulty_level]
              }}
            >
              {guide.difficulty_level}
            </Badge>
            {guide.view_count > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                {guide.view_count.toLocaleString()}
              </div>
            )}
          </div>

          <div className="flex items-center text-sm font-semibold text-blue-600">
            Read Guide
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}