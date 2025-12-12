/**
 * Push Notification Registration Utility
 * Handles service worker registration and push subscription management
 */

import { functions } from '@/api/supabaseClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/**
 * Check if push notifications are supported in the browser
 */
export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Get the current notification permission status
 * @returns {'granted' | 'denied' | 'default'}
 */
export function getNotificationPermission() {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from the user
 * @returns {Promise<'granted' | 'denied' | 'default'>}
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Register the service worker
 * @returns {Promise<ServiceWorkerRegistration | null>}
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('Service Worker registered:', registration.scope);

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Convert a base64 string to Uint8Array for VAPID key
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Get existing push subscription
 * @returns {Promise<PushSubscription | null>}
 */
export async function getExistingSubscription() {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error('Error getting existing subscription:', error);
    return null;
  }
}

/**
 * Subscribe to push notifications
 * @returns {Promise<PushSubscription | null>}
 */
export async function subscribeToPush() {
  if (!isPushSupported()) {
    console.warn('Push notifications are not supported');
    return null;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.error('VAPID public key is not configured');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      console.log('Push subscription created:', subscription.endpoint);
    }

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 * @returns {Promise<boolean>}
 */
export async function unsubscribeFromPush() {
  try {
    const subscription = await getExistingSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('Unsubscribed from push notifications');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    return false;
  }
}

/**
 * Register push subscription with the backend
 * @param {string} userId - The user's ID
 * @param {PushSubscription} subscription - The push subscription object
 * @returns {Promise<boolean>}
 */
export async function registerPushSubscriptionWithBackend(userId, subscription) {
  try {
    const subscriptionJson = subscription.toJSON();

    const response = await functions.invoke('registerPushSubscription', {
      body: {
        user_id: userId,
        endpoint: subscriptionJson.endpoint,
        keys_p256dh: subscriptionJson.keys?.p256dh,
        keys_auth: subscriptionJson.keys?.auth,
        device_info: {
          device_type: 'web',
          browser: getBrowserName(),
          device_name: getDeviceName()
        }
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    console.log('Push subscription registered with backend');
    return true;
  } catch (error) {
    console.error('Error registering push subscription with backend:', error);
    return false;
  }
}

/**
 * Full push notification registration flow
 * 1. Request permission
 * 2. Register service worker
 * 3. Subscribe to push
 * 4. Send subscription to backend
 * @param {string} userId - The user's ID
 * @returns {Promise<{ success: boolean, subscription?: PushSubscription, error?: string }>}
 */
export async function registerPushNotifications(userId) {
  if (!isPushSupported()) {
    return { success: false, error: 'Push notifications are not supported in this browser' };
  }

  // Step 1: Request permission
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    return { success: false, error: 'Notification permission denied' };
  }

  // Step 2: Register service worker
  const registration = await registerServiceWorker();
  if (!registration) {
    return { success: false, error: 'Failed to register service worker' };
  }

  // Step 3: Subscribe to push
  const subscription = await subscribeToPush();
  if (!subscription) {
    return { success: false, error: 'Failed to subscribe to push notifications' };
  }

  // Step 4: Register with backend
  const registered = await registerPushSubscriptionWithBackend(userId, subscription);
  if (!registered) {
    return { success: false, error: 'Failed to register subscription with server' };
  }

  return { success: true, subscription };
}

/**
 * Get browser name for device info
 */
function getBrowserName() {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung Browser';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Trident')) return 'Internet Explorer';
  if (ua.includes('Edge')) return 'Edge Legacy';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Unknown';
}

/**
 * Get device name for device info
 */
function getDeviceName() {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) return 'Android Device';
  if (/Windows/.test(ua)) return 'Windows PC';
  if (/Mac/.test(ua)) return 'Mac';
  if (/Linux/.test(ua)) return 'Linux PC';
  return 'Web Browser';
}

/**
 * Show a local notification (for testing)
 * @param {string} title
 * @param {object} options
 */
export async function showLocalNotification(title, options = {}) {
  if (getNotificationPermission() !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    ...options
  });
}
