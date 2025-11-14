import React from 'react';
import { CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { isServiceAvailable, getServiceMessage } from '@/components/shared/serviceAreas';

export default function ServiceAvailabilityBanner({ user, className = '' }) {
  if (!user || !user.zip_code) return null;

  const serviceCheck = isServiceAvailable(user.zip_code);
  const message = getServiceMessage(user.zip_code);

  if (serviceCheck.available) {
    return (
      <div className={`bg-green-50 border-2 border-green-300 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-green-900 mb-1">
              ✓ {message.title}
            </p>
            <p className="text-sm text-green-800">
              {serviceCheck.operator} serves {serviceCheck.area}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-amber-50 border-2 border-amber-300 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-amber-900 mb-1">
            {message.title}
          </p>
          <p className="text-sm text-amber-800 mb-3">
            {message.message}
          </p>
          {user.waitlist_status !== 'on_waitlist' && (
            <Button
              asChild
              size="sm"
              className="bg-amber-600 hover:bg-amber-700"
              style={{ minHeight: '40px' }}
            >
              <Link to={createPageUrl('Waitlist')}>
                <MapPin className="w-4 h-4 mr-2" />
                {message.cta}
              </Link>
            </Button>
          )}
          {user.waitlist_status === 'on_waitlist' && (
            <p className="text-sm text-green-700 font-semibold">
              ✓ You're on the waitlist! We'll notify you when service becomes available.
            </p>
          )}
          <p className="text-xs text-amber-700 mt-3">
            You can still use this app to track maintenance DIY-style and plan future projects.
          </p>
        </div>
      </div>
    </div>
  );
}