// src/registerSW.js

import { toast } from "react-toastify";

export function registerSW({ onUpdate } = {}) {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/service-worker.js", {
        scope: "/",
      });

      // Listen for updates
      reg.addEventListener("updatefound", () => {
        const installing = reg.installing;
        if (!installing) return;

        installing.addEventListener("statechange", () => {
          if (installing.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // New update available
              onUpdate?.(reg);
              toast.info("New version ready. Reload to update.");
            } else {
              // First install
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

// helper: ask SW to activate immediately
export function skipWaiting(registration) {
  if (!registration?.waiting) return;
  registration.waiting.postMessage({ type: "SKIP_WAITING" });
}
