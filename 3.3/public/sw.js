const cacheName = 'static-v1';
const preCache = [
    './',
    './index.html',
    './assets/vendor/css/bs.css',
    './assets/vendor/js/alpine.js',
    './assets/js/app.js',
    './data.json'
];

async function addCacheHeader(res) {
    if (!res) {
        return;
    }

    let headers = new Headers(res.headers);
    headers.set('sw-cache', 'true');

    let buffer = await res.arrayBuffer();

    return new Response(buffer, {
        status: res.status,
        statusText: res.statusText,
        headers: headers
    });
}

self.addEventListener('install', e => {
    console.log('installed');
    e.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(preCache))
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(async res => (await addCacheHeader(res)) || fetch(e.request))
    );
});