/* eslint-disable no-undef */
/* public/service-worker.js */

const SW_VERSION = "v1::polar-inventory";
const PRECACHE = `${SW_VERSION}:precache`;
const RUNTIME = `${SW_VERSION}:runtime`;

// Files to precache — adjust if you want to add more static files
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/vite.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/src/pages/Inventory.jsx",
  "/src/pages/ItemDetail.jsx",
  // add other static assets you want to guarantee offline
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // remove old caches
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== PRECACHE && k !== RUNTIME)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// simple helper: is request same-origin
function sameOrigin(req) {
  return new URL(req.url).origin === location.origin;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Always let non-GET pass through
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Navigation requests (HTML pages) -> network-first then fallback to cache
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/")))
    );
    return;
  }

  // API calls to external origins -> try network then fallback to cache
  const isApi =
    url.pathname.startsWith("/rest") ||
    url.pathname.startsWith("/api") ||
    url.pathname.includes("/invoices") ||
    url.pathname.includes("/profiles");
  if (!sameOrigin(req) || isApi) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // only cache 200 responses from same-origin APIs
          if (res && res.status === 200 && sameOrigin(req)) {
            const copy = res.clone();
            caches.open(RUNTIME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // For same-origin static assets (images, css, js) -> cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // put copy to runtime cache
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(RUNTIME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          // fallback for images
          if (req.destination === "image") {
            return caches.match("/icons/icon-192.png");
          }
          return caches.match("/");
        });
    })
  );
});

// Allow page to send commands to SW (eg skipWaiting)
self.addEventListener("message", (event) => {
  if (!event.data) return;
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
