const cacheName = 'static-v1';
const preCache = [
    './',
    './index.html'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(preCache))
    );

});