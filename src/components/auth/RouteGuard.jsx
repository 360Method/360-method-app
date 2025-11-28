import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Loader2 } from 'lucide-react';

export default function RouteGuard({
  children,
  allowedRoles = [],
  portalType = null,
  allowIncompleteOnboarding = false
}) {
  const location = useLocation();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  // Check if we're in demo mode - allow access without auth
  // Check FIRST before auth loading to avoid flicker/redirect
  const demoMode = sessionStorage.getItem('demoMode');
  if (demoMode) {
    return children;
  }

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to={`/Login?redirect_url=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Get user metadata
  const userMeta = user?.user_metadata || {};
  const userType = determineUserType(userMeta);

  // Check if onboarding is required (only if not explicitly allowed to skip)
  if (!allowIncompleteOnboarding && !userMeta.onboarding_completed) {
    return <Navigate to="/Onboarding" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
    return <Navigate to={getDefaultPortalRoute(userType)} replace />;
  }

  return children;
}

function determineUserType(userMeta) {
  if (userMeta.role === 'admin') return 'admin';

  if (userMeta.is_operator || userMeta.operator_id) return 'operator';

  if (userMeta.is_contractor || userMeta.contractor_id || userMeta.contractor_onboarding_completed) return 'contractor';

  if (userMeta.user_profile_type === 'investor' || userMeta.property_use_type === 'rental') return 'investor';

  return 'homeowner';
}

function getDefaultPortalRoute(userType) {
  switch (userType) {
    case 'admin':
      return '/AdminDashboard';
    case 'operator':
      return '/OperatorDashboard';
    case 'contractor':
      return '/ContractorDashboard';
    case 'investor':
      return '/DashboardInvestor';
    case 'homeowner':
    default:
      return '/Dashboard';
  }
}
