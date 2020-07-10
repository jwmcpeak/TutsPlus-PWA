const cacheName = 'static-v1';
const preCache = [
    './',
    './index.html',
    './assets/vendor/css/bs.css',
    './assets/vendor/js/alpine.js',
    './assets/js/app.js'
];

self.addEventListener('install', e => {
    console.log('installed');
    e.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(preCache))
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});