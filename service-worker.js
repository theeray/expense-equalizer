const CACHE='erics-expense-equalizer-v1.9.0';
const CORE=[
  './',
  './index.html?v=19',
  './app.html?v=19',
  './style.css?v=19',
  './app.js?v=19',
  './manifest.webmanifest?v=19',
  './splash-art-original.jpg?v=19',
  './splash-art-hidpi.png?v=19',
  './brand-icon.jpg?v=19',
  './icon-192.png?v=19',
  './icon-512.png?v=19',
  './apple-touch-icon.png?v=19',
  './favicon.png?v=19'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if(event.request.method!=='GET') return;
  event.respondWith(
    fetch(event.request).then(response => {
      const clone=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,clone));
      return response;
    }).catch(() => caches.match(event.request).then(hit => hit || caches.match('./index.html?v=19')))
  );
});
