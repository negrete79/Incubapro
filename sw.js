// Service Worker simplificado para GitHub Pages
const CACHE_NAME = 'incubadora-pro-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './ws.js',
    './manifest.json',
    './png292.png',
    './png540.png'
];

// Instalar o Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Ativar o Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                
                return fetch(event.request);
            })
    );
});
