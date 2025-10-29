// Service Worker for Offline Support
const CACHE_NAME = 'medicare-v1.0.0';
const STATIC_CACHE = 'medicare-static-v1.0.0';
const DYNAMIC_CACHE = 'medicare-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/medications.html',
  '/reminders.html',
  '/history.html',
  '/hospitals.html',
  '/doctors.html',
  '/vitals.html',
  '/analytics.html',
  '/profile.html',
  '/styles/main.css',
  '/styles/dashboard.css',
  '/styles/medications.css',
  '/styles/analytics.css',
  '/scripts/data.js',
  '/scripts/dashboard.js',
  '/scripts/medications.js',
  '/scripts/reminders.js',
  '/scripts/doctors.js',
  '/scripts/vitals.js',
  '/scripts/search.js',
  '/scripts/interactions.js',
  '/scripts/analytics.js',
  '/scripts/analytics-ui.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests (CDNs, APIs)
  if (!url.origin.includes(self.location.origin) &&
      !url.hostname.includes('cdnjs.cloudflare.com') &&
      !url.hostname.includes('cdn.jsdelivr.net')) {
    return;
  }

  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cache the response
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => cache.put(request, responseClone));

            return response;
          })
          .catch(() => {
            // Return offline fallback for HTML pages
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html') || caches.match('/index.html');
            }
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);

  if (event.tag === 'medication-sync') {
    event.waitUntil(syncMedicationData());
  }

  if (event.tag === 'vitals-sync') {
    event.waitUntil(syncVitalsData());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event);

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || 'You have a medication reminder',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1
    },
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/icon-192x192.png'
      },
      {
        action: 'snooze',
        title: 'Snooze 15min',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'MediCare Reminder',
      options
    )
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click', event);

  event.notification.close();

  if (event.action === 'snooze') {
    // Snooze logic would go here
    console.log('Snoozing notification');
    return;
  }

  // Default action: open the app
  event.waitUntil(
    clients.openWindow('/dashboard.html')
  );
});

// Sync medication data when back online
async function syncMedicationData() {
  try {
    // Get pending medication actions from IndexedDB or similar
    const pendingActions = await getPendingMedicationActions();

    for (const action of pendingActions) {
      try {
        await syncMedicationAction(action);
        await removePendingAction(action.id);
      } catch (error) {
        console.error('Failed to sync medication action:', error);
      }
    }
  } catch (error) {
    console.error('Medication sync failed:', error);
  }
}

// Sync vitals data when back online
async function syncVitalsData() {
  try {
    const pendingVitals = await getPendingVitalsData();

    for (const vital of pendingVitals) {
      try {
        await syncVitalData(vital);
        await removePendingVital(vital.id);
      } catch (error) {
        console.error('Failed to sync vital data:', error);
      }
    }
  } catch (error) {
    console.error('Vitals sync failed:', error);
  }
}

// Placeholder functions for data synchronization
// These would be implemented based on your backend API
async function getPendingMedicationActions() {
  // Return pending actions from local storage or IndexedDB
  return [];
}

async function syncMedicationAction(action) {
  // Sync with backend API
  return fetch('/api/medications/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(action)
  });
}

async function getPendingVitalsData() {
  // Return pending vitals from local storage or IndexedDB
  return [];
}

async function syncVitalData(vital) {
  // Sync with backend API
  return fetch('/api/vitals/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vital)
  });
}

async function removePendingAction(id) {
  // Remove from local storage
}

async function removePendingVital(id) {
  // Remove from local storage
}

// Periodic background tasks (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'medication-check') {
    event.waitUntil(checkMedicationReminders());
  }
});

async function checkMedicationReminders() {
  // Check for upcoming medication reminders
  // This would typically query your medication schedule
  console.log('Checking medication reminders in background');
}
