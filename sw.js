// LifeOS Service Worker
// نسخه cache رو هر بار که HTML آپدیت می‌کنی عوض کن تا کاربران نسخه جدید رو بگیرن
const CACHE_VERSION = 'lifeos-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

// ── Install: cache all assets ──────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: delete old caches ────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for assets, network-first for HTML ──────────────────
self.addEventListener('fetch', event => {
  // فقط GET request هارو handle کن
  if (event.request.method !== 'GET') return;

  // برای HTML: network اول، اگه آفلاین بود cache
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // برای بقیه assets: cache اول
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(event.request, clone));
        }
        return res;
      }))
  );
});

// ── Notification click: برنامه رو به foreground بیار ──────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const action = event.action;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // اگه tab باز هست، focus کن
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        // وگرنه باز کن
        if (self.clients.openWindow) {
          return self.clients.openWindow('./');
        }
      })
  );
});

// ── Push (آماده برای آینده) ────────────────────────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'LifeOS', {
        body: data.body || '',
        icon: './icons/icon-192.png',
        badge: './icons/icon-96.png',
        tag: data.tag || 'lifeos-push',
        dir: 'rtl',
        lang: 'fa',
      })
    );
  } catch(e) {}
});
