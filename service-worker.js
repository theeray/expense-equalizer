const CACHE='erics-expense-equalizer-phase2-v2.4.0';
const CORE=[
  './',
  './index.html?v=24',
  './app.html?v=24',
  './style.css?v=24',
  './app.js?v=24',
  './firebase-config.js?v=24',
  './firebase-sync.js?v=24',
  './manifest.webmanifest?v=24',
  './splash-art-original.jpg?v=24',
  './splash-art-hidpi.png?v=24',
  './brand-icon.jpg?v=24',
  './icon-192.png?v=24',
  './icon-512.png?v=24',
  './apple-touch-icon.png?v=24',
  './favicon.png?v=24'
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;

  e.respondWith(
    fetch(e.request)
      .then(r=>{
        const copy=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy));
        return r;
      })
      .catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html?v=24')))
  );
});
