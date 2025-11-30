import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES, ROLE_CONFIG } from '@/lib/AuthContext';
import { useUser } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';

/**
 * RouteGuard - Protects routes with authentication and role-based access
 *
 * Props:
 * - children: The component to render if access is granted
 * - allowedRoles: Array of roles that can access this route (e.g., ['owner', 'operator'])
 * - portalType: The portal this route belongs to (owner, operator, contractor, admin)
 * - allowIncompleteOnboarding: Skip onboarding check for this route
 * - requireCertification: For operator routes, require certification to be complete
 */
export default function RouteGuard({
  children,
  allowedRoles = [],
  portalType = null,
  allowIncompleteOnboarding = false,
  requireCertification = false
}) {
  const location = useLocation();
  const {
    user,
    isAuthenticated,
    isLoadingAuth,
    activeRole,
    roles,
    hasRole,
    isOnboardingComplete,
    getDefaultRoute,
    getActiveRoleProfile
  } = useAuth();
  const { user: clerkUser } = useUser();

  // Check if we're in demo mode - only allow on demo routes
  // SECURITY: Demo mode should ONLY work on /Demo* routes to prevent bypass
  const demoMode = sessionStorage.getItem('demoMode');
  const isDemoRoute = location.pathname.toLowerCase().startsWith('/demo');

  if (demoMode && isDemoRoute) {
    // Valid demo mode - allow access to demo routes without auth
    return children;
  }

  if (demoMode && !isDemoRoute) {
    // Invalid demo mode usage - clear it and require auth
    sessionStorage.removeItem('demoMode');
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

  // Get user metadata for backward compatibility checks
  const userMeta = user?.user_metadata || {};
  const clerkMeta = clerkUser?.publicMetadata || {};

  // Determine if the current route matches the user's portal
  const isCorrectPortal = !portalType || portalType === activeRole;

  // If portalType is specified and doesn't match active role, redirect to correct portal
  if (portalType && !isCorrectPortal) {
    // Check if user has the required role for this portal
    if (hasRole(portalType)) {
      // User has the role but it's not active - could auto-switch or redirect
      // For now, redirect to their active portal
      return <Navigate to={getDefaultRoute()} replace />;
    } else {
      // User doesn't have access to this portal at all
      return <Navigate to={getDefaultRoute()} replace />;
    }
  }

  // Check allowed roles (if specified)
  if (allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some(role => hasRole(role));
    if (!hasAllowedRole) {
      return <Navigate to={getDefaultRoute()} replace />;
    }
  }

  // Check onboarding completion for the active role
  if (!allowIncompleteOnboarding) {
    const roleConfig = ROLE_CONFIG[activeRole];

    // Special handling for different roles
    switch (activeRole) {
      case ROLES.OWNER: {
        // Check owner onboarding - using legacy check for backward compatibility
        const localOnboardingFlag = localStorage.getItem(`onboarding_completed_${user?.id}`);
        const ownerOnboardingComplete =
          userMeta.onboarding_completed ||
          clerkMeta.onboarding_completed ||
          userMeta.owner_profile?.onboarding_completed ||
          localOnboardingFlag === 'true';

        if (!ownerOnboardingComplete) {
          // Don't redirect if already on onboarding
          if (location.pathname !== '/Onboarding') {
            return <Navigate to="/Onboarding" replace />;
          }
        }
        break;
      }

      case ROLES.OPERATOR: {
        // Check operator certification
        const operatorProfile = getActiveRoleProfile();
        const isCertified = operatorProfile?.certified === true;
        const isTrainingComplete = operatorProfile?.training_completed === true;

        // If requireCertification is true, must be certified
        if (requireCertification && !isCertified) {
          if (!isTrainingComplete) {
            // Still in training
            if (location.pathname !== '/OperatorTraining' && location.pathname !== '/OperatorPending') {
              return <Navigate to="/OperatorPending" replace />;
            }
          } else {
            // Training complete, pending certification
            if (location.pathname !== '/OperatorPending') {
              return <Navigate to="/OperatorPending" replace />;
            }
          }
        }
        break;
      }

      case ROLES.CONTRACTOR: {
        // Check contractor onboarding
        const contractorProfile = getActiveRoleProfile();
        const contractorOnboardingComplete = contractorProfile?.onboarding_completed === true;

        if (!contractorOnboardingComplete) {
          if (location.pathname !== '/ContractorOnboarding') {
            return <Navigate to="/ContractorOnboarding" replace />;
          }
        }
        break;
      }

      case ROLES.ADMIN:
        // Admins don't need onboarding
        break;
    }
  }

  return children;
}

/**
 * Helper function to determine portal type from route path
 * Useful for automatic portal detection
 */
export function getPortalTypeFromPath(pathname) {
  if (pathname.startsWith('/Operator') || pathname.startsWith('/operator')) {
    return ROLES.OPERATOR;
  }
  if (pathname.startsWith('/Contractor') || pathname.startsWith('/contractor')) {
    return ROLES.CONTRACTOR;
  }
  if (pathname.startsWith('/HQ') || pathname.startsWith('/Admin')) {
    return ROLES.ADMIN;
  }
  // Default to owner for main app routes
  return ROLES.OWNER;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use useAuth().activeRole instead
 */
export function determineUserType(userMeta) {
  if (userMeta.role === 'admin' || userMeta.is_admin) return 'admin';
  if (userMeta.is_operator || userMeta.operator_id) return 'operator';
  if (userMeta.is_contractor || userMeta.contractor_id || userMeta.contractor_onboarding_completed) return 'contractor';
  if (userMeta.user_profile_type === 'investor' || userMeta.property_use_type === 'rental') return 'investor';
  return 'homeowner';
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use useAuth().getDefaultRoute() instead
 */
export function getDefaultPortalRoute(userType) {
  switch (userType) {
    case 'admin':
      return '/HQDashboard';
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
