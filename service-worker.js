const CACHE='erics-expense-equalizer-v1.6.0';
const CORE=[
  './',
  './index.html',
  './style.css?v=16',
  './app.js?v=16',
  './manifest.webmanifest?v=16',
  './splash-art-original.jpg?v=16',
  './splash-art-hidpi.png?v=16',
  './brand-icon.jpg?v=16',
  './icon-192.png?v=16',
  './icon-512.png?v=16',
  './apple-touch-icon.png?v=16',
  './favicon.png?v=16'
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
