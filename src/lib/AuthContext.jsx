import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { syncCurrentUser } from '@/api/supabaseClient';
import { identifyUser, claritySetTag } from '@/lib/clarity';
import { shouldInitializeClerk, redirectToLogin, redirectToSignup } from '@/lib/domain';

const AuthContext = createContext();

// Role definitions
export const ROLES = {
  OWNER: 'owner',
  OPERATOR: 'operator',
  CONTRACTOR: 'contractor',
  ADMIN: 'admin'
};

// Role display names and colors
export const ROLE_CONFIG = {
  [ROLES.OWNER]: {
    label: 'Property Owner',
    shortLabel: 'Owner',
    color: 'blue',
    icon: 'Home',
    defaultRoute: '/Dashboard',
    onboardingRoute: '/Onboarding'
  },
  [ROLES.OPERATOR]: {
    label: 'Service Operator',
    shortLabel: 'Operator',
    color: 'orange',
    icon: 'Building',
    defaultRoute: '/OperatorDashboard',
    onboardingRoute: '/OperatorPending',
    requiresCertification: true
  },
  [ROLES.CONTRACTOR]: {
    label: 'Contractor',
    shortLabel: 'Contractor',
    color: 'green',
    icon: 'Wrench',
    defaultRoute: '/ContractorDashboard',
    onboardingRoute: '/ContractorOnboarding',
    inviteOnly: true
  },
  [ROLES.ADMIN]: {
    label: 'HQ Admin',
    shortLabel: 'Admin',
    color: 'purple',
    icon: 'Shield',
    defaultRoute: '/HQDashboard',
    onboardingRoute: null
  }
};

export const AuthProvider = ({ children }) => {
  // This is now just a wrapper for backwards compatibility
  // The actual auth is handled by ClerkProvider in App.jsx
  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Create a guest auth state for use on non-Clerk domains (marketing, operators)
 * This allows pages to call useAuth() without errors when Clerk isn't available
 */
function createGuestAuthState() {
  return {
    user: null,
    clerkUser: null,
    session: null,
    isAuthenticated: false,
    isLoadingAuth: false,
    isLoadingPublicSettings: false,
    authError: null,
    appPublicSettings: null,
    // Auth actions redirect to app domain
    login: () => redirectToLogin(),
    signup: () => redirectToSignup(),
    logout: async () => {},
    navigateToLogin: () => redirectToLogin(),
    getSupabaseToken: async () => null,
    // Clerk-specific (null when not available)
    userId: null,
    openSignIn: () => redirectToLogin(),
    openSignUp: () => redirectToSignup(),
    // Multi-role support (guest has no roles)
    roles: [],
    activeRole: null,
    switchRole: async () => false,
    hasRole: () => false,
    isOnboardingComplete: () => false,
    getDefaultRoute: () => '/Login',
    getActiveRoleProfile: () => ({}),
    ROLES,
    ROLE_CONFIG,
    // Database user
    dbUser: null,
    // Tier management
    updateUserMetadata: async () => { throw new Error('Not authenticated'); },
    // Flag to indicate Clerk availability
    isClerkAvailable: false,
  };
}

/**
 * Custom hook that provides auth state from Clerk
 * Maintains backwards compatibility with existing code
 * Now includes multi-role support
 *
 * On non-Clerk domains (marketing, operators), returns guest state
 * without attempting to use Clerk hooks.
 */
export const useAuth = () => {
  // Check if Clerk should be initialized on this domain
  // This check is stable (depends only on hostname) so the conditional is safe
  const isClerkAvailable = shouldInitializeClerk();

  // If Clerk isn't available (marketing/operators domain), return guest state
  // This avoids calling Clerk hooks when ClerkProvider isn't in the tree
  if (!isClerkAvailable) {
    return createGuestAuthState();
  }

  // Clerk is available - use normal Clerk hooks
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { isLoaded: isAuthLoaded, userId, getToken } = useClerkAuth();
  const { signOut, openSignIn, openSignUp } = useClerk();

  const isLoadingAuth = !isUserLoaded || !isAuthLoaded;
  const isAuthenticated = isSignedIn === true;

  // Track if we've synced this user to avoid duplicate syncs
  const syncedUserRef = useRef(null);
  const [dbUser, setDbUser] = useState(null);

  // Get metadata
  const publicMetadata = user?.publicMetadata || {};

  // Extract roles from multiple sources and merge them
  // Priority: Clerk metadata + Database + Legacy fallback
  const clerkRoles = publicMetadata.roles || [];
  const legacyRoles = determineRolesFromLegacyMetadata(publicMetadata);

  // Note: dbUser.roles comes from Supabase users table (database source of truth)
  // dbUser is populated via syncCurrentUser() after initial render
  const dbRoles = dbUser?.roles || [];

  // Combine and deduplicate roles from all sources
  const allRoles = [...new Set([...clerkRoles, ...dbRoles, ...legacyRoles])];
  const roles = allRoles.length > 0 ? allRoles : ['owner'];

  // Get active role from metadata or localStorage (for persistence across refreshes)
  const storedActiveRole = typeof window !== 'undefined'
    ? localStorage.getItem(`active_role_${user?.id}`)
    : null;

  const [activeRole, setActiveRoleState] = useState(
    publicMetadata.active_role || storedActiveRole || roles[0] || ROLES.OWNER
  );

  // Sync user to database when they sign in
  useEffect(() => {
    if (user?.id && user.id !== syncedUserRef.current) {
      syncedUserRef.current = user.id;

      // Identify user in Clarity for session recordings
      const displayName = user.fullName || user.firstName || user.emailAddresses?.[0]?.emailAddress;
      identifyUser(user.id, undefined, undefined, displayName);

      syncCurrentUser(user)
        .then((syncedUser) => {
          if (syncedUser) {
            setDbUser(syncedUser);
            console.log('User synced to database:', syncedUser.id);
          }
        })
        .catch((err) => {
          console.error('Failed to sync user to database:', err);
        });
    }
  }, [user?.id, user]);

  // Sync active role when user changes
  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`active_role_${user.id}`);
      const metaRole = publicMetadata.active_role;
      const defaultRole = roles[0] || ROLES.OWNER;

      // Priority: metadata > localStorage > first role
      const newActiveRole = metaRole || stored || defaultRole;

      // Ensure the active role is actually in the user's roles
      if (roles.includes(newActiveRole)) {
        setActiveRoleState(newActiveRole);
        // Tag session with user role for filtering in Clarity
        claritySetTag('role', newActiveRole);
      } else {
        setActiveRoleState(defaultRole);
        claritySetTag('role', defaultRole);
      }
    }
  }, [user?.id, publicMetadata.active_role, roles]);

  // Function to switch active role
  const switchRole = useCallback(async (newRole) => {
    if (!roles.includes(newRole)) {
      console.error(`User does not have role: ${newRole}`);
      return false;
    }

    // Update local state immediately
    setActiveRoleState(newRole);

    // Persist to localStorage
    if (user?.id) {
      localStorage.setItem(`active_role_${user.id}`, newRole);
    }

    // Update Clerk metadata (async, non-blocking)
    try {
      await user?.update({
        publicMetadata: {
          ...publicMetadata,
          active_role: newRole
        }
      });
    } catch (e) {
      console.warn('Failed to persist active role to Clerk:', e);
      // Local state is already updated, so user experience isn't affected
    }

    return true;
  }, [roles, user, publicMetadata]);

  // Get profile for current active role
  const getActiveRoleProfile = () => {
    switch (activeRole) {
      case ROLES.OWNER:
        return publicMetadata.owner_profile || {};
      case ROLES.OPERATOR:
        return publicMetadata.operator_profile || {};
      case ROLES.CONTRACTOR:
        return publicMetadata.contractor_profile || {};
      case ROLES.ADMIN:
        return publicMetadata.admin_profile || {};
      default:
        return {};
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => roles.includes(role);

  // Check if user has completed onboarding for active role
  const isOnboardingComplete = () => {
    const profile = getActiveRoleProfile();
    switch (activeRole) {
      case ROLES.OWNER:
        return profile.onboarding_completed || publicMetadata.onboarding_completed || false;
      case ROLES.OPERATOR:
        return profile.certified === true;
      case ROLES.CONTRACTOR:
        return profile.onboarding_completed || false;
      case ROLES.ADMIN:
        return true; // Admins don't need onboarding
      default:
        return false;
    }
  };

  // Get the appropriate route for the active role
  const getDefaultRoute = () => {
    const config = ROLE_CONFIG[activeRole];
    if (!config) return '/Dashboard';

    if (!isOnboardingComplete() && config.onboardingRoute) {
      return config.onboardingRoute;
    }

    return config.defaultRoute;
  };

  // Function to update user metadata (tier, preferences, etc.)
  const updateUserMetadata = useCallback(async (updates) => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      await user.update({
        publicMetadata: {
          ...publicMetadata,
          ...updates
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to update user metadata:', error);
      throw error;
    }
  }, [user, publicMetadata]);

  // Map Clerk user to our expected format
  const mappedUser = user ? {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress,
    full_name: user.fullName,
    first_name: user.firstName,
    last_name: user.lastName,
    image_url: user.imageUrl,
    user_metadata: publicMetadata,
    created_at: user.createdAt,
    // Tier (subscription level)
    tier: publicMetadata.tier || 'free',
    // Multi-role fields
    roles,
    active_role: activeRole,
    role_profile: getActiveRoleProfile(),
  } : null;

  const login = async () => {
    openSignIn();
  };

  const signup = async () => {
    openSignUp();
  };

  const logout = async (shouldRedirect = true) => {
    // Clear local role storage
    if (user?.id) {
      localStorage.removeItem(`active_role_${user.id}`);
    }
    await signOut();
    if (shouldRedirect) {
      window.location.href = '/Welcome';
    }
  };

  const navigateToLogin = () => {
    openSignIn();
  };

  // Get Supabase-compatible token (if needed later)
  const getSupabaseToken = async () => {
    try {
      return await getToken({ template: 'supabase' });
    } catch (e) {
      console.error('Failed to get Supabase token:', e);
      return null;
    }
  };

  return {
    user: mappedUser,
    clerkUser: user, // Original Clerk user if needed
    session: null, // For backwards compatibility
    isAuthenticated,
    isLoadingAuth,
    isLoadingPublicSettings: false, // For backwards compatibility
    authError: null,
    appPublicSettings: null, // For backwards compatibility
    login,
    signup,
    logout,
    navigateToLogin,
    getSupabaseToken,
    // Clerk-specific
    userId,
    openSignIn,
    openSignUp,
    // Multi-role support
    roles,
    activeRole,
    switchRole,
    hasRole,
    isOnboardingComplete,
    getDefaultRoute,
    getActiveRoleProfile,
    ROLES,
    ROLE_CONFIG,
    // Database user (synced from Clerk)
    dbUser,
    // Tier management
    updateUserMetadata,
    // Flag to indicate Clerk availability
    isClerkAvailable: true,
  };
};

/**
 * Determine roles from legacy metadata format
 * For backward compatibility with existing users
 */
function determineRolesFromLegacyMetadata(metadata) {
  const roles = [];

  // Check for admin
  if (metadata.role === 'admin' || metadata.is_admin) {
    roles.push(ROLES.ADMIN);
  }

  // Check for operator
  if (metadata.is_operator || metadata.operator_id || metadata.operator_profile) {
    roles.push(ROLES.OPERATOR);
  }

  // Check for contractor
  if (metadata.is_contractor || metadata.contractor_id || metadata.contractor_profile || metadata.contractor_onboarding_completed) {
    roles.push(ROLES.CONTRACTOR);
  }

  // Default to owner if no other roles or if onboarding completed
  if (roles.length === 0 || metadata.onboarding_completed || metadata.owner_profile) {
    roles.push(ROLES.OWNER);
  }

  return roles;
}
