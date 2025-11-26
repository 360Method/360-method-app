import React, { useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Loader2 } from 'lucide-react';

export default function Waitlist() {
  // Redirect all waitlist traffic to signup
  useEffect(() => {
    base44.auth.redirectToLogin();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to signup...</p>
      </div>
    </div>
  );
}