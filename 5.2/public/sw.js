self.importScripts('/assets/vendor/js/idb-keyval.js');

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
        './assets/vendor/js/idb-keyval.js',
    ]
},{
    name: dynamicCacheName,
    urls: [
    './data.json',
    './assets/js/app.js',

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

async function getResponseFor(req) {
    let staticCache = await caches.open(staticCacheName);
    let cacheRes = await staticCache.match(req);

    if (cacheRes) {
        return cacheRes;
    }

    let dynCache = await caches.open(dynamicCacheName);

    try {
        let res = await fetch(req);
        cacheRes = await dynCache.match(req);

        if (cacheRes) {
            await dynCache.put(req.url, res.clone());
        }

        return res;
    } catch (err) {
        return await addCacheHeader(await dynCache.match(req));
    }
}

async function syncReport() {
    let changed = await idbKeyval.get('changed');

    if (changed && changed.length > 0) {
        console.log('send report to server');
        await idbKeyval.set('changed', []);
    }
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

self.addEventListener('fetch', e => 
    e.respondWith(
        getResponseFor(e.request)
    )
);

self.addEventListener('sync', e => {
    if (e.tag === 'sync-report') {
        e.waitUntil(syncReport());
    }
});

self.addEventListener('notificationclick', e => {
    let notification = e.notification;
    let taskId = notification.data.taskId;
    let action = e.action;

    if (action === 'close') {
        // do something
    } else if (action === 'incomplete') {
        console.log('make this incomplete');
    } else {
        clients.openWindow(`http://localhost:3000/${taskId}`);
    }

    notification.close();

});

self.addEventListener('notificationclose', e => {
    // that event
});

self.addEventListener('push', e => {
    let body = 'There was no data with push.';

    if (e.data) {
        body = e.data.text();
    }

    e.waitUntil(
        self.registration.showNotification('Push Notification', {body})
    );
});