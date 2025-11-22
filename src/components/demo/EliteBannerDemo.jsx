import React from 'react';
import { Trophy, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function EliteBannerDemo({ title, subtitle, message, icon = '🏆' }) {
  return (
    <Card className="bg-gradient-to-r from-yellow-100 via-amber-100 to-yellow-100 border-2 border-yellow-400 overflow-hidden">
      <CardContent className="p-8 text-center relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"></div>
        
        <div className="flex justify-center gap-2 mb-4">
          <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
          <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
          <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
        </div>
        
        <div className="text-6xl mb-4">{icon}</div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
        
        <p className="text-lg text-amber-800 font-semibold mb-3">
          {subtitle}
        </p>
        
        <p className="text-gray-700 max-w-xl mx-auto">
          {message}
        </p>
        
        <div className="flex justify-center gap-2 mt-6">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <Trophy className="w-5 h-5 text-yellow-600" />
          <Trophy className="w-5 h-5 text-yellow-600" />
        </div>
      </CardContent>
    </Card>
  );
}