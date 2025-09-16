/*
  Basic PWA Service Worker for Next.js App Router
  - Precache core assets after install
  - Runtime cache for same-origin GET requests (network-first for pages, cache-first for static)
  - Handles SKIP_WAITING to activate new SW immediately
*/

const VERSION = 'v1';
const CORE_CACHE = `core-${VERSION}`;

const CORE_ASSETS = [
  '/',
  '/v1/dashboard',
  '/manifest.webmanifest',
  '/next.svg',
  '/vercel.svg',
  '/globe.svg',
  '/window.svg',
  '/file.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CORE_CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING' && self.skipWaiting) {
    self.skipWaiting();
  }
});

// Helper to determine if a request is for a Next.js data route or page
const isHtmlRequest = (request) => {
  const accept = request.headers.get('accept') || '';
  return accept.includes('text/html');
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Strategy: HTML pages -> network-first with cache fallback (for offline)
  if (isHtmlRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CORE_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch (err) {
          const cached = await caches.match(request);
          return cached || caches.match('/');
        }
      })()
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        const res = await fetch(request);
        // Only cache successful, basic responses
        if (res && res.status === 200 && res.type === 'basic') {
          const cache = await caches.open(CORE_CACHE);
          cache.put(request, res.clone());
        }
        return res;
      } catch (err) {
        return cached || Response.error();
      }
    })()
  );
});
