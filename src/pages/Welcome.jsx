import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Welcome() {
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = React.useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
    enabled: !!user,
    retry: false,
  });

  React.useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected) return;
    
    // Wait for both queries to load
    if (userLoading || propertiesLoading) return;

    // Small delay to prevent flashing
    const timer = setTimeout(() => {
      setHasRedirected(true);
      
      // If user has completed onboarding and has properties, go to dashboard
      if (user?.onboarding_completed && properties.length > 0) {
        navigate(createPageUrl('Dashboard'), { replace: true });
        return;
      }

      // If user has NOT completed onboarding, send to onboarding flow
      if (!user?.onboarding_completed) {
        navigate(createPageUrl('Onboarding'), { replace: true });
        return;
      }

      // If user completed onboarding but has no properties (edge case), send to onboarding
      if (user?.onboarding_completed && properties.length === 0) {
        navigate(createPageUrl('Onboarding'), { replace: true });
        return;
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user, properties, userLoading, propertiesLoading, navigate, hasRedirected]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 mx-auto mb-4 flex items-center justify-center animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to 360° Method</h2>
        <p className="text-gray-600">Setting up your experience...</p>
      </div>
    </div>
  );
}