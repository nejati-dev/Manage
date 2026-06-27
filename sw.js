// LifeOS Service Worker
// نسخه cache رو هر بار که HTML آپدیت می‌کنی عوض کن تا کاربران نسخه جدید رو بگیرن
const CACHE_VERSION = 'lifeos-v3';
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
  if (event.request.method !== 'GET') return;

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
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if ('focus' in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow('./');
      })
  );
});

// ── پیام از صفحه اصلی ─────────────────────────────────────────────────────
//
// SCHEDULE_NOTIF: صفحه اصلی endTime (timestamp میلی‌ثانیه) + متن نوتیف رو میفرسته
//   SW یه setTimeout با delayMs = endTime - Date.now() میزنه
//   مزیت: اگه SW کشته بشه و دوباره بیدار بشه (از طریق postMessage جدید)،
//   همیشه از endTime حساب میکنه نه از یه counter نسبی
//
// CANCEL_NOTIF: لغو نوتیف زمان‌بندی‌شده

let _scheduledNotif = null;
let _scheduledEndTime = 0;

self.addEventListener('message', event => {
  const { type } = event.data || {};

  if (type === 'SCHEDULE_NOTIF') {
    // لغو قبلی
    if (_scheduledNotif) { clearTimeout(_scheduledNotif); _scheduledNotif = null; }

    const { endTime, title, body, tag } = event.data;
    _scheduledEndTime = endTime;

    const delayMs = Math.max(0, endTime - Date.now());

    _scheduledNotif = setTimeout(async () => {
      _scheduledNotif = null;
      _scheduledEndTime = 0;

      // اگه صفحه visible باشه نوتیف نفرست — خود صفحه handle می‌کنه
      const clients = await self.clients.matchAll({ type: 'window' });
      const hasVisible = clients.some(c => c.visibilityState === 'visible');
      if (!hasVisible) {
        self.registration.showNotification(title, {
          body,
          tag: tag || 'pom-scheduled',
          icon: './icons/icon-192.png',
          badge: './icons/icon-96.png',
          dir: 'rtl',
          lang: 'fa',
          requireInteraction: false,
        });
      }
    }, delayMs);
  }

  if (type === 'CANCEL_NOTIF') {
    if (_scheduledNotif) { clearTimeout(_scheduledNotif); _scheduledNotif = null; }
    _scheduledEndTime = 0;
  }
});

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
