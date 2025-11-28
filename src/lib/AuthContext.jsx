import React, { createContext, useContext } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';

const AuthContext = createContext();

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
 * Custom hook that provides auth state from Clerk
 * Maintains backwards compatibility with existing code
 */
export const useAuth = () => {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { isLoaded: isAuthLoaded, userId, getToken } = useClerkAuth();
  const { signOut, openSignIn, openSignUp } = useClerk();

  const isLoadingAuth = !isUserLoaded || !isAuthLoaded;
  const isAuthenticated = isSignedIn === true;

  // Map Clerk user to our expected format
  const mappedUser = user ? {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress,
    full_name: user.fullName,
    first_name: user.firstName,
    last_name: user.lastName,
    image_url: user.imageUrl,
    user_metadata: user.publicMetadata || {},
    created_at: user.createdAt,
  } : null;

  const login = async () => {
    openSignIn();
  };

  const signup = async () => {
    openSignUp();
  };

  const logout = async (shouldRedirect = true) => {
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
  };
};
