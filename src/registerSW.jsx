// src/registerSW.js
export function registerSW({ onUpdate } = {}) {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const reg = await navigator.serviceWorker.register(
          "/service-worker.js",
          {
            scope: "/",
          }
        );

        // listen for updatefound
        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          installing?.addEventListener("statechange", () => {
            if (installing.state === "installed") {
              if (navigator.serviceWorker.controller) {
                // new content available
                onUpdate?.(reg);
              } else {
                // cached for offline
                console.log("Content cached for offline use.");
              }
            }
          });
        });
      } catch (err) {
        console.error("SW registration failed:", err);
      }
    });
  }

  self.addEventListener("activate", (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
    );
  });
}

// helper to ask the service worker to activate immediately
export function skipWaiting(registration) {
  if (!registration || !registration.waiting) return;
  registration.waiting.postMessage({ type: "SKIP_WAITING" });
}
