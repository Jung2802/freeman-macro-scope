// Offline support: always try the network first (revalidated, so a new deploy shows at once),
// fall back to the last cached copy only when offline.
const VERSION = 'fms-v6';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'favicon.ico', 'assets/css/app.css', 'assets/vendor/chart.umd.min.js',
  'assets/icons/icon-192.png', 'assets/img/logo-freeman.png', 'assets/img/logo.png', 'assets/img/earth.webp',
  'src/main.js', 'src/i18n.js', 'src/format.js', 'src/data.js', 'src/analysis.js',
  'src/charts.js', 'src/ads.js', 'src/site-config.js', 'src/views/overview.js', 'src/views/indicator.js',
  'src/views/compare.js', 'src/views/pages.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION)
    .then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Network first, revalidated past the 10-minute HTTP cache (unchanged files cost only a 304).
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then((res) => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(e.request, copy));
    }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
