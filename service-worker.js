const CACHE='erics-expense-equalizer-v2.2.0';
const CORE=[
'./','./index.html?v=22','./app.html?v=22','./style.css?v=22','./app.js?v=22',
'./manifest.webmanifest?v=22','./splash-art-original.jpg?v=22','./splash-art-hidpi.png?v=22',
'./brand-icon.jpg?v=22','./icon-192.png?v=22','./icon-512.png?v=22',
'./apple-touch-icon.png?v=22','./favicon.png?v=22'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
if(e.request.method!=='GET')return;
e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;})
.catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html?v=22'))));
});
