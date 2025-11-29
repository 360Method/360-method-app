import { useDemo } from '@/components/shared/DemoContext';
import { MapPin, Wrench, Award } from 'lucide-react';

export default function DontWantDIYBanner() {
  const { demoMode } = useDemo();

  if (!demoMode) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-200 rounded-xl p-5 md:p-6 mb-6 shadow-md overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-100/50 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-emerald-900 text-lg">Not a DIYer? Pro Help is Here!</h3>
        </div>

        {/* Content */}
        <p className="text-emerald-800 text-sm mb-4 leading-relaxed">
          360° Certified Operators are expanding to neighborhoods across the country.
          Get matched with vetted professionals who follow the 360° Method.
        </p>

        {/* Currently Available Badge */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 mb-4 border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-emerald-900 text-sm">Currently Available:</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-800 text-sm font-medium">Clark County, WA</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              Handy Pioneers
            </span>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="flex items-center gap-2 text-sm text-emerald-700">
          <div className="flex -space-x-1">
            <div className="w-6 h-6 bg-emerald-200 rounded-full border-2 border-white flex items-center justify-center">
              <MapPin className="w-3 h-3 text-emerald-600" />
            </div>
            <div className="w-6 h-6 bg-emerald-300 rounded-full border-2 border-white flex items-center justify-center">
              <MapPin className="w-3 h-3 text-emerald-700" />
            </div>
            <div className="w-6 h-6 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
              <MapPin className="w-3 h-3 text-emerald-800" />
            </div>
          </div>
          <span className="font-medium">More cities coming soon!</span>
        </div>
      </div>
    </div>
  );
}