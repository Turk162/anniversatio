// Service worker minimale: cache degli asset statici per resistere a
// una connessione dati scarsa/assente durante la caccia al tesoro.
// Strategia: cache-first per gli asset noti, network-first con
// fallback alla cache per tutto il resto.

const CACHE_NAME = "caccia-tesoro-v2";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/data.js",
  "./js/geo.js",
  "./js/camera.js",
  "./js/app.js",
  "./manifest.webmanifest",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/images/tratto-1-2.png",
  "./assets/images/tratto-2-3.png",
  "./assets/images/tratto-3-4.png",
  "./assets/images/tratto-4-negozio.png",
  "./assets/images/tappa1-riferimento.png",
  "./assets/images/tappa2-riferimento.png",
  "./assets/images/tappa3-riferimento.png",
  "./assets/images/tappa4-riferimento.png",
  "./assets/images/finale-riferimento.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
