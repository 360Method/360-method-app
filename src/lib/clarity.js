/**
 * Microsoft Clarity Analytics Integration
 *
 * This tracks user sessions, clicks, scrolls, and generates heatmaps.
 * View your analytics at: https://clarity.microsoft.com
 *
 * What you'll see:
 * - Session recordings (video playback of user sessions)
 * - Heatmaps (where users click/scroll most)
 * - Rage clicks (frustrated repeated clicking)
 * - Dead clicks (clicks on non-interactive elements)
 */

// Your Clarity Project ID - get this from clarity.microsoft.com
const CLARITY_PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID;

// Dynamically import clarity-js to avoid build failures
let clarity = null;

/**
 * Initialize Microsoft Clarity
 * Call this once when your app starts (in main.jsx)
 */
export async function initClarity() {
  // Don't initialize if no project ID configured
  if (!CLARITY_PROJECT_ID) {
    console.log('📊 Clarity: No project ID found. Add VITE_CLARITY_PROJECT_ID to your .env file');
    return;
  }

  try {
    const clarityModule = await import('clarity-js');
    clarity = clarityModule.clarity;

    // Start Clarity tracking
    clarity.start({
      projectId: CLARITY_PROJECT_ID,
      upload: 'https://m.clarity.ms/collect',
      track: true,      // Track clicks, scrolls, etc.
      content: true,    // Capture page content for heatmaps
    });

    console.log('📊 Clarity: Analytics initialized');
  } catch (error) {
    console.warn('📊 Clarity: Failed to load clarity-js', error);
  }
}

/**
 * Identify a logged-in user (optional but recommended)
 * This helps you see which specific user did what in recordings
 *
 * @param {string} userId - Unique user ID (from Clerk)
 * @param {string} sessionId - Optional session ID
 * @param {string} pageId - Optional page ID
 * @param {string} friendlyName - User's name for easy identification
 */
export function identifyUser(userId, sessionId = undefined, pageId = undefined, friendlyName = undefined) {
  if (!CLARITY_PROJECT_ID || !clarity) return;

  try {
    clarity.identify(userId, sessionId, pageId, friendlyName);
    console.log('📊 Clarity: User identified');
  } catch (error) {
    console.warn('Clarity identify error:', error);
  }
}

/**
 * Set a custom tag for filtering sessions
 * Example: claritySetTag('plan', 'premium') or claritySetTag('portal', 'investor')
 *
 * @param {string} key - Tag name
 * @param {string} value - Tag value
 */
export function claritySetTag(key, value) {
  if (!CLARITY_PROJECT_ID || !clarity) return;

  try {
    clarity.set(key, value);
  } catch (error) {
    console.warn('Clarity set tag error:', error);
  }
}

/**
 * Track a custom event
 * Example: clarityEvent('completed_onboarding')
 *
 * @param {string} eventName - Name of the event
 */
export function clarityEvent(eventName) {
  if (!CLARITY_PROJECT_ID || !clarity) return;

  try {
    clarity.event(eventName);
  } catch (error) {
    console.warn('Clarity event error:', error);
  }
}

/**
 * Upgrade the session priority (marks it as important)
 * Use this for key moments like purchases, sign-ups, errors
 *
 * @param {string} reason - Why this session is important
 */
export function clarityUpgrade(reason) {
  if (!CLARITY_PROJECT_ID || !clarity) return;

  try {
    clarity.upgrade(reason);
  } catch (error) {
    console.warn('Clarity upgrade error:', error);
  }
}

