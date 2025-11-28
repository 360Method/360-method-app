import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * PostLoginRedirect - Handles routing after successful authentication
 *
 * This component:
 * 1. Checks for a redirect_url in query params (from protected route redirects)
 * 2. Otherwise routes based on user's active role and onboarding status
 */
export default function PostLoginRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    user,
    isAuthenticated,
    isLoadingAuth,
    activeRole,
    getDefaultRoute,
    isOnboardingComplete
  } = useAuth();

  useEffect(() => {
    if (isLoadingAuth) return;

    if (!isAuthenticated) {
      // Not logged in, redirect to login
      navigate('/Login', { replace: true });
      return;
    }

    // Check for redirect URL from query params
    const redirectUrl = searchParams.get('redirect_url');

    if (redirectUrl) {
      // Validate the redirect URL is internal
      try {
        const url = new URL(redirectUrl, window.location.origin);
        if (url.origin === window.location.origin) {
          navigate(url.pathname + url.search, { replace: true });
          return;
        }
      } catch (e) {
        // Invalid URL, fall through to default routing
        console.warn('Invalid redirect URL:', redirectUrl);
      }
    }

    // Route based on user's active role
    const defaultRoute = getDefaultRoute();
    navigate(defaultRoute, { replace: true });

  }, [isLoadingAuth, isAuthenticated, user, activeRole, getDefaultRoute, navigate, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-600">Redirecting to your dashboard...</p>
    </div>
  );
}
