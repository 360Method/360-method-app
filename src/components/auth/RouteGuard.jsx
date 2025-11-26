import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function RouteGuard({ 
  children, 
  allowedRoles = [],
  portalType = null,
  allowIncompleteOnboarding = false
}) {
  const location = useLocation();
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    userType: null,
  });
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        
        if (user) {
          const userType = determineUserType(user);
          
          setAuthState({
            isLoading: false,
            isAuthenticated: true,
            user,
            userType,
          });
          
          // Log access attempt
          try {
            await base44.functions.invoke('logAuthEvent', {
              event_type: 'profile_update',
              user_id: user.id,
              email: user.email,
              status: 'success',
              metadata: { 
                path: location.pathname,
                portal_type: portalType,
                user_type: userType
              }
            });
          } catch (e) {
            console.error('Failed to log access:', e);
          }
        } else {
          setAuthState({
            isLoading: false,
            isAuthenticated: false,
            user: null,
            userType: null,
          });
        }
      } catch (err) {
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          userType: null,
        });
      }
    };
    
    checkAuth();
  }, [location.pathname, portalType]);
  
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  if (!authState.isAuthenticated) {
    base44.auth.redirectToLogin(location.pathname);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  // Check if onboarding is required (only if not explicitly allowed to skip)
  if (!allowIncompleteOnboarding && authState.user && !authState.user.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(authState.userType)) {
    // Log unauthorized access
    try {
      base44.functions.invoke('logAuthEvent', {
        event_type: 'unauthorized_access',
        user_id: authState.user.id,
        email: authState.user.email,
        status: 'blocked',
        metadata: {
          attempted_path: location.pathname,
          user_type: authState.userType,
          required_roles: allowedRoles
        }
      });
    } catch (e) {
      console.error('Failed to log unauthorized access:', e);
    }
    
    return <Navigate to={getDefaultPortalRoute(authState.userType)} replace />;
  }
  
  return children;
}

function determineUserType(user) {
  if (user.role === 'admin') return 'admin';
  
  if (user.is_operator || user.operator_id) return 'operator';
  
  if (user.is_contractor || user.contractor_id || user.contractor_onboarding_completed) return 'contractor';
  
  if (user.user_profile_type === 'investor' || user.property_use_type === 'rental') return 'investor';
  
  return 'homeowner';
}

function getDefaultPortalRoute(userType) {
  switch (userType) {
    case 'admin':
      return '/admin';
    case 'operator':
      return '/operator/dashboard';
    case 'contractor':
      return '/contractor/dashboard';
    case 'investor':
      return '/investor/dashboard';
    case 'homeowner':
    default:
      return '/dashboard';
  }
}