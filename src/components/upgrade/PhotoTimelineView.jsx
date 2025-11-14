import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Calendar, Image as ImageIcon } from 'lucide-react';

export default function PhotoTimelineView({ project, onUpdate }) {
  const allPhotos = [];

  // Collect photos from milestones
  if (project.milestones) {
    project.milestones.forEach(milestone => {
      if (milestone.photos && milestone.photos.length > 0) {
        milestone.photos.forEach(photo => {
          allPhotos.push({
            url: photo,
            milestone: milestone.title,
            date: milestone.completed_date || new Date().toISOString(),
            type: 'milestone'
          });
        });
      }
    });
  }

  // Add before photos
  if (project.before_photo_urls) {
    project.before_photo_urls.forEach(photo => {
      allPhotos.push({
        url: photo,
        milestone: 'Before',
        date: project.created_date,
        type: 'before'
      });
    });
  }

  // Add after photos
  if (project.after_photo_urls) {
    project.after_photo_urls.forEach(photo => {
      allPhotos.push({
        url: photo,
        milestone: 'After',
        date: project.completion_date || new Date().toISOString(),
        type: 'after'
      });
    });
  }

  // Sort by date
  allPhotos.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (allPhotos.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Photos Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Document your project progress with photos at each milestone
          </p>
          <Button disabled style={{ minHeight: '48px' }}>
            <Camera className="w-5 h-5 mr-2" />
            Add Photos (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Photo Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600 mb-1">Total Photos</p>
            <p className="text-2xl font-bold text-gray-900">{allPhotos.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600 mb-1">Before</p>
            <p className="text-2xl font-bold text-blue-700">
              {project.before_photo_urls?.length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600 mb-1">After</p>
            <p className="text-2xl font-bold text-green-700">
              {project.after_photo_urls?.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Photo Timeline */}
      <div className="space-y-6">
        {allPhotos.map((photo, index) => (
          <div key={index} className="flex gap-4">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full ${
                photo.type === 'before' ? 'bg-blue-500' :
                photo.type === 'after' ? 'bg-green-500' :
                'bg-purple-500'
              }`} />
              {index < allPhotos.length - 1 && (
                <div className="w-0.5 h-full bg-gray-300 flex-1 min-h-[100px]" />
              )}
            </div>

            {/* Photo Card */}
            <Card className="flex-1">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Photo */}
                  <div className="w-full md:w-64 h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={photo.url}
                      alt={photo.milestone}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        photo.type === 'before' ? 'bg-blue-100 text-blue-800' :
                        photo.type === 'after' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {photo.milestone}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(photo.date).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Before/After Comparison */}
      {project.before_photo_urls?.length > 0 && project.after_photo_urls?.length > 0 && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-green-600" />
              Before & After Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Before</p>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={project.before_photo_urls[0]}
                    alt="Before"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">After</p>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={project.after_photo_urls[0]}
                    alt="After"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}