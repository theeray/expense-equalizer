const CACHE='erics-expense-equalizer-v1.4.0';
const CORE=[
  './',
  './index.html',
  './style.css?v=14',
  './app.js?v=14',
  './manifest.webmanifest?v=14',
  './splash-art.png?v=14',
  './splash-art@2x.png?v=14',
  './brand-icon.png?v=14',
  './icon-192.png?v=14',
  './icon-512.png?v=14',
  './apple-touch-icon.png?v=14',
  './favicon.png?v=14'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(response => {
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      return response;
    }).catch(()=>caches.match(event.request).then(hit=>hit || caches.match('./index.html')))
  );
});
