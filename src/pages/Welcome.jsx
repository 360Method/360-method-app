import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Welcome() {
  const navigate = useNavigate();
  const redirectedRef = React.useRef(false);

  const { data: user, isLoading: userLoading, isError: userError } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000,
  });

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
    enabled: !!user && !userError,
    retry: 1,
    staleTime: 30000,
  });

  React.useEffect(() => {
    // Only redirect once
    if (redirectedRef.current) return;
    
    // Wait for queries to complete
    if (userLoading || (!!user && propertiesLoading)) return;

    // Handle errors
    if (userError) {
      console.error('User loading error, redirecting to onboarding');
      redirectedRef.current = true;
      navigate(createPageUrl('Onboarding'), { replace: true });
      return;
    }

    // Redirect logic
    if (user?.onboarding_completed && properties.length > 0) {
      redirectedRef.current = true;
      navigate(createPageUrl('Dashboard'), { replace: true });
    } else {
      redirectedRef.current = true;
      navigate(createPageUrl('Onboarding'), { replace: true });
    }
  }, [user, properties, userLoading, propertiesLoading, userError, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 mx-auto mb-4 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to 360° Method</h2>
        <p className="text-gray-600">Setting up your experience...</p>
      </div>
    </div>
  );
}