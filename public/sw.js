// AstraMind Service Worker for PWA Offline Caching & Installability (/Astramind-Ai/ base path aware)
const CACHE_NAME = 'astramind-pwa-v2';

function getScopedAssets() {
  const scopeUrl = (self.registration && self.registration.scope) || '/Astramind-Ai/';
  const base = scopeUrl.endsWith('/') ? scopeUrl : scopeUrl + '/';
  return [
    base,
    base + 'index.html',
    base + 'manifest.json',
    base + 'logo.png',
    base + 'favicon.ico',
    base + 'favicon-16x16.png',
    base + 'favicon-32x32.png',
    base + 'pwa-192x192.png',
    base + 'pwa-512x512.png',
    base + 'maskable-192x192.png',
    base + 'maskable-512x512.png',
    base + 'apple-touch-icon.png'
  ];
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(getScopedAssets());
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Ignore non-http/https requests (e.g. chrome-extension scheme)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            const scopeUrl = (self.registration && self.registration.scope) || '/Astramind-Ai/';
            const base = scopeUrl.endsWith('/') ? scopeUrl : scopeUrl + '/';
            return caches.match(base + 'index.html') || caches.match(base);
          }
          return null;
        });
      })
  );
});
