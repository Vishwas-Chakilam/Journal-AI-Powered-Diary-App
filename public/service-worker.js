// Simple service worker for PWA installability and basic offline support

self.addEventListener('install', (event) => {
  // Activate worker immediately after installation
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Become available to all pages
  event.waitUntil(self.clients.claim());
});

// Placeholder fetch handler – required for many browsers' PWA criteria
self.addEventListener('fetch', () => {
  // You can add caching logic here later if needed
});


