const CACHE_VERSION = 'v2';
const STATIC_CACHE = `chainplay-static-${CACHE_VERSION}`;
const PAGE_CACHE = `chainplay-pages-${CACHE_VERSION}`;

const STATIC_CACHE_MAX = 120; // cap entries so the asset cache can't grow unbounded

// Drop the oldest entries (cache.keys() is insertion-ordered) once over the cap.
async function trimCache(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length <= maxItems) return;
    for (let i = 0; i < keys.length - maxItems; i++) {
        await cache.delete(keys[i]);
    }
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache =>
            cache.addAll([
                '/',
                '/icons/joystick.png',
                '/icons/Solana_logo.png',
                '/favicon.ico',
            ]).catch(() => {})
        )
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== STATIC_CACHE && key !== PAGE_CACHE)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET' || url.origin !== location.origin) return;

    // Never intercept Range requests (audio/video). They return 206 Partial Content,
    // which cache.put() rejects — let the browser handle these natively.
    if (request.headers.has('range')) return;

    // Cache-first: Next.js hashed static assets (JS, CSS, fonts) — safe forever
    if (url.pathname.startsWith('/_next/static/')) {
        event.respondWith(
            caches.open(STATIC_CACHE).then(cache =>
                cache.match(request).then(cached => {
                    if (cached) return cached;
                    return fetch(request).then(response => {
                        if (response.status === 200) {
                            cache.put(request, response.clone());
                            trimCache(STATIC_CACHE, STATIC_CACHE_MAX);
                        }
                        return response;
                    });
                })
            )
        );
        return;
    }

    // Cache-first: public static files (images, audio, icons).
    // Only cache full 200 responses — 206 partials are skipped above.
    if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|mp3|ogg|wav|woff2?)$/)) {
        event.respondWith(
            caches.open(STATIC_CACHE).then(cache =>
                cache.match(request).then(cached => {
                    if (cached) return cached;
                    return fetch(request).then(response => {
                        if (response.status === 200) {
                            cache.put(request, response.clone());
                            trimCache(STATIC_CACHE, STATIC_CACHE_MAX);
                        }
                        return response;
                    });
                })
            )
        );
        return;
    }

    // Network-first: page navigations. Always try the network so users get fresh
    // HTML (and current JS chunk hashes after a deploy); fall back to cache offline.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(PAGE_CACHE).then(cache => cache.put(request, clone));
                }
                return response;
            }).catch(() =>
                caches.open(PAGE_CACHE).then(cache =>
                    cache.match(request).then(cached => cached || caches.match('/'))
                )
            )
        );
        return;
    }
});

self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        event.waitUntil(
            self.registration.showNotification(data.title, {
                body: data.body,
                icon: data.icon || '/icons/joystick.png',
                badge: '/favicon.ico',
            })
        );
    }
});
