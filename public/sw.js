// Service Worker for Web Push Notifications
console.log('🔧 Service Worker loading...');

// Install event
self.addEventListener('install', function(event) {
  console.log('🔧 Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function(event) {
  console.log('🔧 Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Push event - handle incoming push notifications
self.addEventListener('push', function(event) {
  console.log('📱 Push event received:', event);
  console.log('📱 Event data:', event.data);
  console.log('📱 Event data type:', typeof event.data);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
      console.log('📱 Parsed JSON data:', data);
    } catch (e) {
      console.log('📱 Failed to parse JSON, using text:', e);
      data = { title: 'New Notification', body: event.data.text() || 'You have a new message.' };
    }
  } else {
    console.log('📱 No event data, using default');
    data = { title: 'New Notification', body: 'You have a new message.' };
  }

  const title = data.title || 'New Notification';
  const options = {
    body: data.body || 'You have a new message.',
    icon: data.icon || '/icon.svg',
    badge: data.badge || '/icon.svg',
    image: data.image,
    data: {
      url: data.data?.url || '/',
      notificationId: data.data?.notificationId,
      type: data.data?.type,
      timestamp: data.data?.timestamp
    },
    tag: data.tag || 'ctg-notification',
    requireInteraction: false, // Allow notification to auto-dismiss
    silent: false, // Ensure notification makes sound
    actions: data.actions || [],
    vibrate: [200, 100, 200], // Add vibration pattern for mobile
    timestamp: Date.now() // Add timestamp for better notification ordering
  };

  console.log('📱 Showing notification:', title, options);

  // Force show notification even when tab is active
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log('✅ Notification displayed successfully');
        
        // Don't try to focus the window as it causes InvalidAccessError
        // The notification will show natively without needing to focus
        return Promise.resolve();
      })
      .catch((error) => {
        console.error('❌ Failed to display notification:', error);
        // Don't use fallback - let the error be logged for debugging
        return Promise.resolve();
      })
  );
});

// Notification click event
self.addEventListener('notificationclick', function(event) {
  console.log('🖱️  Notification clicked:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', function(event) {
  console.log('❌ Notification closed:', event);
});

console.log('✅ Service Worker loaded successfully');
