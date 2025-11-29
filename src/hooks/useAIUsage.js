import { useQuery } from '@tanstack/react-query';
import { auth } from '@/api/supabaseClient';
import { tierHasAI } from '@/components/shared/TierCalculator';

/**
 * Hook to check if the current user has AI access
 * 
 * Option C: AI is a paid feature only
 * - Free tier: No AI access
 * - Paid tiers (Homeowner+, Pioneer, Commander, Elite): Full AI access
 * 
 * Usage:
 * const { canUseAI, tier, isLoading } = useAIUsage();
 * 
 * if (canUseAI) {
 *   // Run AI analysis
 * } else {
 *   // Show upgrade prompt
 * }
 */
export function useAIUsage() {
  // Get current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => auth.me(),
  });

  const tier = user?.tier || 'free';
  const canUseAI = tierHasAI(tier);

  return {
    // Can the user run an AI analysis?
    canUseAI,
    
    // User's current tier
    tier,
    
    // Is this an unlimited tier? (same as canUseAI for Option C)
    unlimited: canUseAI,
    
    // Loading state
    isLoading,
  };
}

/**
 * Simple hook to just check AI access
 * Alias for useAIUsage for backward compatibility
 */
export function useCanUseAI() {
  return useAIUsage();
}

export default useAIUsage;
