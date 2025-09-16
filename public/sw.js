/*
  PWA Service Worker for Next.js App Router
  - Precache core assets after install
  - Network-first for HTML pages (cache fallback for offline)
  - Cache-first for static assets
  - Always fetch fresh for API/data requests
  - Auto-update with SKIP_WAITING + clientsClaim
*/

const VERSION = 'v2';
const CORE_CACHE = `core-${VERSION}`;

const CORE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/next.svg',
  '/vercel.svg',
  '/globe.svg',
  '/window.svg',
  '/file.svg',
];

// Install → precache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate → cleanup old caches + take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CORE_CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

// Listen for SKIP_WAITING messages
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

const isHtmlRequest = (request) => {
  const accept = request.headers.get('accept') || '';
  return accept.includes('text/html');
};

const isApiRequest = (request) => {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
};

// Fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  // 🔹 Never cache API responses
  if (isApiRequest(request)) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // 🔹 HTML pages: network-first
  if (isHtmlRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CORE_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(request);
          return cached || caches.match('/');
        }
      })()
    );
    return;
  }

  // 🔹 Static assets: cache-first
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        const res = await fetch(request);
        if (res && res.status === 200 && res.type === 'basic') {
          const cache = await caches.open(CORE_CACHE);
          cache.put(request, res.clone());
        }
        return res;
      } catch {
        return cached || Response.error();
      }
    })()
  );
});
