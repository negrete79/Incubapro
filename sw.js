const CACHE_NAME = 'incubadora-pro-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './png192.png',
    './png512.png',
    './manifest.json'
];

// Instalar
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Cacheando assets...');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch((err) => {
                console.warn('⚠️ Alguns assets não foram cacheados:', err);
                return self.skipWaiting();
            })
    );
});

// Ativar
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('🗑️ Removendo cache antigo:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('api.groq.com')) {
        return;
    }

    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                    return new Response('Offline', { status: 503 });
                });
            })
    );
});
