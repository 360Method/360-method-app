// Service Worker for Push Notifications - 360° Method App

// Cache version for updates
const CACHE_VERSION = 'v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Push notification received
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  if (!event.data) {
    console.log('[SW] No data in push event');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error('[SW] Error parsing push data:', e);
    data = {
      title: '360° Method',
      body: event.data.text()
    };
  }

  const options = {
    body: data.body || data.message || '',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/badge-72.png',
    tag: data.tag || `notification-${Date.now()}`,
    data: {
      url: data.url || data.action_url || '/',
      notificationId: data.notification_id,
      timestamp: Date.now()
    },
    requireInteraction: data.requireInteraction || data.priority === 'urgent' || data.priority === 'high',
    vibrate: [200, 100, 200],
    actions: data.actions || []
  };

  // Add actions based on notification type
  if (data.type === 'work_order' || data.type === 'job') {
    options.actions = [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' }
    ];
  } else if (data.type === 'message') {
    options.actions = [
      { action: 'reply', title: 'Reply' },
      { action: 'view', title: 'View' }
    ];
  }

  event.waitUntil(
    self.registration.showNotification(data.title || '360° Method', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = data.url || '/';

  // Handle specific actions
  if (event.action === 'dismiss') {
    // Just close, don't navigate
    return;
  }

  if (event.action === 'reply' && data.url) {
    targetUrl = data.url + '?reply=true';
  }

  // Focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window/tab open
        for (const client of windowClients) {
          // If we have a matching URL, focus it
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            // Navigate to the notification URL
            if (client.navigate) {
              return client.navigate(targetUrl);
            }
            return client;
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Notification close handler (for analytics)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed without interaction');
  // Could send analytics here
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    console.log('[SW] Syncing notifications...');
    // Handle offline notification sync if needed
  }
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
