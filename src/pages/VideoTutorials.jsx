import React from "react";
import { VideoTutorial } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Play, 
  Clock,
  Eye,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function VideoTutorials() {
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const { data: videos = [] } = useQuery({
    queryKey: ['video-tutorials'],
    queryFn: () => VideoTutorial.list('sort_order'),
    initialData: [],
  });

  const categories = [
    "All Videos",
    "Getting Started",
    "AWARE Phase",
    "ACT Phase",
    "ADVANCE Phase",
    "DIY Maintenance",
    "For Investors"
  ];

  let filteredVideos = videos;

  if (selectedCategory !== 'all' && selectedCategory !== 'All Videos') {
    filteredVideos = filteredVideos.filter(v => v.category === selectedCategory);
  }

  const featuredVideos = videos.filter(v => v.featured);

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
            Video Tutorials
          </h1>
          <p className="text-gray-600">
            Learn by watching
          </p>
          <p className="text-sm text-gray-500">
            {videos.length} video tutorials
          </p>
        </div>

        {/* Category Filter */}
        <Card className="border-none shadow-sm mb-6">
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-2" style={{ color: '#1B365D' }}>
              Filter by Category:
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === 'All Videos' ? 'all' : cat)}
                  variant={selectedCategory === cat || (selectedCategory === 'all' && cat === 'All Videos') ? "default" : "outline"}
                  size="sm"
                  style={{
                    backgroundColor: selectedCategory === cat || (selectedCategory === 'all' && cat === 'All Videos') ? '#FF6B35' : 'white',
                    minHeight: '40px'
                  }}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Featured Videos */}
        {featuredVideos.length > 0 && selectedCategory === 'all' && (
          <div className="mb-8">
            <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#1B365D', fontSize: '22px' }}>
              <Star className="w-6 h-6 text-yellow-500" />
              Featured Videos
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {featuredVideos.slice(0, 3).map((video) => (
                <VideoCard key={video.id} video={video} difficultyColors={difficultyColors} />
              ))}
            </div>
          </div>
        )}

        {/* All Videos */}
        {filteredVideos.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-12 text-center">
              <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No Videos Found</h3>
              <p className="text-gray-600 mb-6">
                Videos coming soon in this category
              </p>
              <Button
                onClick={() => setSelectedCategory('all')}
                variant="outline"
              >
                View All Videos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div>
            <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
              {selectedCategory !== 'all' ? selectedCategory : 'All Videos'}
              <span className="text-gray-500 font-normal text-lg ml-2">
                ({filteredVideos.length})
              </span>
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <VideoCard key={video.id} video={video} difficultyColors={difficultyColors} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VideoCard({ video, difficultyColors }) {
  return (
    <Card className="border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer">
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
          {video.thumbnail_url ? (
            <img 
              src={video.thumbnail_url} 
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Video className="w-16 h-16 text-gray-400" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-8 h-8 text-orange-600 ml-1" />
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <Badge style={{ backgroundColor: '#FF6B35' }}>
              {video.category}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {video.duration_minutes} min
            </div>
          </div>

          <h3 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '16px' }}>
            {video.title}
          </h3>

          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {video.description}
          </p>

          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              style={{ 
                borderColor: difficultyColors[video.difficulty_level],
                color: difficultyColors[video.difficulty_level]
              }}
            >
              {video.difficulty_level}
            </Badge>
            {video.view_count > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                {video.view_count.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}