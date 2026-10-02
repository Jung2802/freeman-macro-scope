// Offline support: app shell cache-first, data network-first (falls back to the last copy).
const VERSION = 'fms-v1';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'assets/css/app.css', 'assets/vendor/chart.umd.min.js',
  'assets/icons/icon.svg', 'src/main.js', 'src/i18n.js', 'src/format.js', 'src/data.js', 'src/analysis.js',
  'src/charts.js', 'src/ads.js', 'src/site-config.js', 'src/views/overview.js', 'src/views/indicator.js',
  'src/views/compare.js', 'src/views/pages.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.includes('/data/') || url.pathname.endsWith('/src/') || e.request.mode === 'navigate') {
    // network-first
    e.respondWith(fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request)));
    return;
  }
  // stale-while-revalidate for code and assets
  e.respondWith(caches.match(e.request).then((hit) => {
    const net = fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
