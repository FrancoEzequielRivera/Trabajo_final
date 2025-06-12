const CACHE_NAME = 'Pweanding-cache-v2'; // Incrementa la versión del caché
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './images/icon-192.png',
  './images/icon-512.png',
  './images/icon-192-maskable.png',
  './images/icon-512-maskable.png',
  './images/apple-touch-icon.png',
  './images/fg-flappy.jpeg',
  './images/fg-viga.png',
  './images/f2.jpg',
  './flappy-assets/bird.png',
  './flappy-assets/bg.png',
  './sounds/bm-bomb.mp3',
  './sounds/bm-descubrir.mp3',
  './sounds/bm-flag.mp3',
  './sounds/bm-winGame.mp3',
  './sounds/fg-music.mp3',
  './sounds/fg-salto.mp3',
  './sounds/gameOver.mp3',
  './sounds/menu-alPasarPorTexto.mp3',
  './sounds/menu-clickgame.mp3',
  './sounds/menu-music.mp3',
  './sounds/mostrarBestTimes.mp3',
  './sounds/nd-girarDados.mp3',
  './sounds/nd-congelar.mp3',
  './sounds/nd-anotar.mp3',
  './sounds/nd-anotar.mp3',
  './sounds/ss-red.mp3',
  './sounds/ss-green.mp3',
  './sounds/ss-blue.mp3',
  './sounds/ss-yellow.mp3',
  './sounds/winPPT.mp3',
  './sounds/losePPT.mp3',
  './sounds/cuackPPT.mp3',
];

// Instalar el service worker y cachear archivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Interceptar peticiones y servir desde caché
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// Evento activate para limpiar cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
