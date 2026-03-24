// ═══ House Postventa — Service Worker v1 ═══
const CACHE_NAME = 'hp-v1';

// Install: cache shell
self.addEventListener('install', e => {
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Listen for push events (from postMessage)
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'PUSH_NOTIF') {
    const { title, body, tag, urgency, casoId } = e.data;
    const options = {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: tag || 'hp-' + Date.now(),
      requireInteraction: true,
      vibrate: urgency === 'emer' 
        ? [500, 200, 500, 200, 500, 200, 800, 300, 800, 300, 800]
        : urgency === 'urge'
        ? [400, 150, 400, 150, 400]
        : [300, 100, 300],
      actions: [
        { action: 'open', title: 'Abrir' },
        { action: 'dismiss', title: 'Cerrar' }
      ],
      data: { casoId, urgency },
      silent: false,
      renotify: true
    };
    e.waitUntil(self.registration.showNotification(title, options));
  }
});

// Notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
      if (cls.length > 0) {
        cls[0].focus();
        cls[0].postMessage({ type: 'NOTIF_CLICK', casoId: e.notification.data?.casoId });
      } else {
        clients.openWindow('/');
      }
    })
  );
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', e => {
  if (e.tag === 'check-alerts') {
    e.waitUntil(checkForNewAlerts());
  }
});

async function checkForNewAlerts() {
  // This will be enhanced with actual Supabase check
  // For now, the main thread handles it via Realtime
}
