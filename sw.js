const CACHE = 'rpn-v2';
const LOCAL = [
  './',
  './index.html',
  './manifest.json',
  './fonts/DMSans-VariableFont_opsz_wght.ttf',
  './ios-frame.jsx',
  './rpn-pwa.jsx',
  './tweaks-panel.jsx',
  './rpn-core.jsx',
  './rpn-ui.jsx',
  './rpn-sheets.jsx',
  './rpn-app.jsx',
  './swiftui/AppIcon/appicon-180.png',
  './swiftui/AppIcon/appicon-1024.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(LOCAL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok && new URL(e.request.url).origin === self.location.origin) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      });
    })
  );
});
