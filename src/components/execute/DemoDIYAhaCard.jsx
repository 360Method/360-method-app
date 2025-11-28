import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Search,
  Youtube,
  FileText,
  ArrowRight,
  Target,
  Home,
  Thermometer,
  Clock,
  CheckCircle2,
  Zap,
  X
} from 'lucide-react';

export default function DemoDIYAhaCard({ task, systemInfo, onDismiss }) {
  // Show the "aha" comparison between generic search and tailored 360° guides

  return (
    <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="font-bold text-white">Why This is Different</span>
          </div>
          {onDismiss && (
            <button onClick={onDismiss} className="text-white/80 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* Comparison: Old Way vs 360° Way */}
          <div className="grid grid-cols-2 gap-3">
            {/* Old Way */}
            <div className="bg-gray-100 rounded-xl p-3 border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                <Search className="w-3 h-3" />
                Google/YouTube
              </p>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <X className="w-3 h-3 text-red-400" />
                  <span>Generic "how to" videos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <X className="w-3 h-3 text-red-400" />
                  <span>10 browser tabs open</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <X className="w-3 h-3 text-red-400" />
                  <span>Wrong parts/tools listed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <X className="w-3 h-3 text-red-400" />
                  <span>No record of the work</span>
                </div>
              </div>
            </div>

            {/* 360° Way */}
            <div className="bg-green-50 rounded-xl p-3 border-2 border-green-300">
              <p className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                <Target className="w-3 h-3" />
                360° Method
              </p>
              <div className="space-y-1.5 text-xs text-green-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>Tailored to YOUR system</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>All info in one place</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>Exact tools & materials</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>Auto-logs to history</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personalization Showcase */}
          <div className="bg-white rounded-xl p-3 border border-orange-200">
            <p className="text-xs font-semibold text-orange-700 mb-2">
              This guide knows about YOUR home:
            </p>
            <div className="flex flex-wrap gap-2">
              {task?.system_type && (
                <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700 gap-1">
                  <Home className="w-3 h-3" />
                  {task.system_type}
                </Badge>
              )}
              {systemInfo?.brand_model && (
                <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
                  {systemInfo.brand_model}
                </Badge>
              )}
              {systemInfo?.installation_year && (
                <Badge variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-700">
                  Installed {systemInfo.installation_year}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs bg-teal-50 border-teal-200 text-teal-700 gap-1">
                <Thermometer className="w-3 h-3" />
                Your climate zone
              </Badge>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-[10px] text-gray-600 leading-tight">AI-curated steps</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-[10px] text-gray-600 leading-tight">Track your time</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <FileText className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-[10px] text-gray-600 leading-tight">Builds your record</p>
            </div>
          </div>

          {/* Bottom message */}
          <p className="text-xs text-center text-gray-500 italic">
            No more searching. Your personalized guide is ready.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
