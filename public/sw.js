// ChatBidan Service Worker v5
// Conservative policy after SSR rollout:
//   - Navigations: network-only with offline fallback (never cache SSR'd HTML,
//     so user-specific pages like /bookings can't leak across sessions and
//     stale HTML can't reference deleted JS chunks from previous deploys).
//   - Static assets (icons, logo, manifest): cache-first for instant repeat loads.
//   - Next.js chunks (/_next/...): pass through to network + browser cache —
//     Vercel already serves them with immutable Cache-Control, and caching them
//     here just makes chunk-hash mismatches harder to recover from after deploys.
//   - API + OneSignal + Supabase: always network.
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

const CACHE_VERSION = 'chatbidan-v5';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  '/icon.png',
  '/logo-vertical.png',
  '/manifest.json',
];

// ─── INSTALL ───────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// ─── ACTIVATE ──────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── FETCH ─────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // Let the browser handle cross-origin requests (CDN assets, analytics, etc.)
  if (!isSameOrigin) return;

  // Navigations → network-only, fall back to offline page only on true failure.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Next.js build output and API calls → always hit the network. Chunks are
  // content-hashed so the browser's own HTTP cache is the right place, not us.
  if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/api/')) {
    return;
  }

  // Static assets (images, fonts, manifest, offline.html, etc.) → cache-first.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          // Don't hand back HTML when the browser asked for an image — let the
          // request fail visibly instead of silently serving offline.html.
          if (request.destination === 'image') {
            return new Response('', { status: 404 });
          }
          return Response.error();
        });
    })
  );
});

// ─── PUSH NOTIFICATIONS ────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'ChatBidan', body: 'Ada pesan baru untuk Anda.' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.png',
      badge: '/icon.png',
      tag: 'chatbidan-notification',
      renotify: true,
      data: { url: data.url || '/' },
    })
  );
});

// ─── NOTIFICATION CLICK ────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(targetUrl);
      })
  );
});
