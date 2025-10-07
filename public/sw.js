// Service Worker for caching and push notifications
const CACHE_VERSION = 'v2';
const CACHE_NAME = `ctg-app-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `ctg-dynamic-${CACHE_VERSION}`;

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/icon.jpeg',
      badge: data.badge || '/icon.jpeg',
      tag: data.tag || 'ctg-notification',
      requireInteraction: data.requireInteraction || true,
      data: data.data || {}
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'CTG Notification', options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Fetch event - improved cache strategy with retry mechanism
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  const isDynamicImport = url.pathname.includes('/assets/') && url.pathname.endsWith('.js');
  const isStaticAsset = url.pathname.includes('/assets/') || 
                       url.pathname.includes('.css') || 
                       url.pathname.includes('.js') ||
                       url.pathname.includes('.png') ||
                       url.pathname.includes('.jpg') ||
                       url.pathname.includes('.svg');

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // For dynamic imports, always try network first to get latest version
        if (isDynamicImport) {
          return fetchWithRetry(event.request, 3).then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              // Update cache with new version
              caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
              return networkResponse;
            }
            return cachedResponse;
          }).catch(() => {
            return cachedResponse;
          });
        }
        return cachedResponse;
      }

      // Network first for dynamic imports, cache first for static assets
      if (isDynamicImport || isStaticAsset) {
        return fetchWithRetry(event.request, 3).then((fetchResponse) => {
          if (fetchResponse && fetchResponse.ok) {
            const cacheToUse = isDynamicImport ? DYNAMIC_CACHE_NAME : CACHE_NAME;
            caches.open(cacheToUse).then((cache) => {
              cache.put(event.request, fetchResponse.clone());
            });
          }
          return fetchResponse;
        }).catch(() => {
          // If network fails, try to serve from any available cache
          return caches.match(event.request);
        });
      }

      // For other requests, use network with cache fallback
      return fetchWithRetry(event.request, 2).catch(() => {
        return caches.match(event.request);
      });
    })
  );
});

// Helper function to retry failed requests
function fetchWithRetry(request, maxRetries) {
  return fetch(request).catch((error) => {
    if (maxRetries > 0) {
      // Exponential backoff: wait 1s, 2s, 4s...
      const delay = Math.pow(2, 3 - maxRetries) * 1000;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fetchWithRetry(request, maxRetries - 1));
        }, delay);
      });
    }
    throw error;
  });
}