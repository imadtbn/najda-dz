const CACHE_NAME = 'najda-cache-v2';
const STATIC_ASSETS = [
    './',
    './index.html',
    './style/css-main.css',
    './style/SidebarAnimation.css',
    './script/SidebarAnimation.js',
    './manifest.json',
    './icons/najda_icon_3.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;

            return fetch(event.request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
                    return networkResponse;
                }
                const responseCopy = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseCopy));
                return networkResponse;
            });
        })
    );
});
