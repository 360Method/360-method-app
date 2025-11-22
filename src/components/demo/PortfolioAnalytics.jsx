import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PortfolioAnalytics({ avgScore, distribution, weakestLinks }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-600" />
            Tier Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="font-semibold text-gray-900">⭐⭐⭐⭐ Platinum</span>
              <Badge>{distribution.platinum} properties</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="font-semibold text-gray-900">⭐⭐⭐ Gold</span>
              <Badge>{distribution.gold} properties</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <span className="font-semibold text-gray-900">⭐⭐ Silver</span>
              <Badge>{distribution.silver} properties</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <span className="font-semibold text-gray-900">⭐ Bronze</span>
              <Badge>{distribution.bronze} properties</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-semibold text-gray-900">Participant</span>
              <Badge>{distribution.participant} properties</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="font-semibold text-gray-900">Fair (Needs Work)</span>
              <Badge variant="destructive">{distribution.fair} properties</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weakest Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Weakest Links
          </CardTitle>
          <p className="text-sm text-gray-600">Properties dragging down your portfolio score</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weakestLinks.map((link, idx) => (
              <div key={idx} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{link.property}</span>
                  <Badge variant="destructive">{link.score}/100</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {link.score >= 70 ? 'Close to Bronze - quick wins available' :
                   link.score >= 65 ? 'Needs attention - moderate work required' :
                   'Critical - significant work needed'}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Pro Tip:</span> Fixing these 3 properties will boost your portfolio score significantly
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}