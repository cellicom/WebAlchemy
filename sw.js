// cache-first app shell so the game works offline; bump V when files change
const V = 'webalchemy-202611271632', FILES = ['./', 'index.html', 'style.css', 'data.js', 'version.js', 'game.js', 'logo.svg', 'favicon.svg', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => clients.claim())));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
