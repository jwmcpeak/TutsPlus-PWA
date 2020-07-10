const version = '4';
const staticCacheName = `static-v${version}`;
const dynamicCacheName = `dynamic-v${version}`;


const preCache = [{
    name: staticCacheName,
    urls: [
        './',
        './index.html',
        './assets/vendor/css/bs.css',
        './assets/vendor/js/alpine.js',
        './assets/js/app.js',
    ]
},{
    name: dynamicCacheName,
    urls: [
    './data.json'

    ]
}];

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

async function clearOldCache(keysToKeep) {
    let cacheKeys = await caches.keys();


    return Promise.all(
        cacheKeys
            .filter(key => keysToKeep.indexOf(key) === -1)
            .map(key => caches.delete(key))
    );
}

self.addEventListener('install', e => {
    console.log('installed');

    e.waitUntil(Promise.all(
            preCache.map(obj => 
                caches
                    .open(obj.name)
                    .then(cache => cache.addAll(obj.urls))
            )
        ).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(clearOldCache(preCache.map(obj => obj.name)));
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(async res => (await addCacheHeader(res)) || fetch(e.request))
    );
});