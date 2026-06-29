/**
 * Service Worker for the Vite SPA.
 *
 * Caching strategies:
 *   - Versioned build assets (/assets/)           → Cache-First (immutable)
 *   - Images, fonts                               → Cache-First
 *   - API requests (/api/)                        → Network-Only
 *   - SPA shell (index.html) and other pages      → Network-First with offline fallback
 *
 * Bump CACHE_VERSION on every production deploy so outdated caches are purged.
 */

const CACHE_VERSION = "v1";
const CACHE_NAME = `spa-cache-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";
const APP_SHELL_URL = "/";

const PRECACHE_URLS = [APP_SHELL_URL, OFFLINE_URL];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Network-only for API routes.
  if (url.pathname.startsWith("/api/")) return;

  // Cache-first for Vite's hashed build assets (immutable content-addressed URLs).
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request, { immutable: true }));
    return;
  }

  // Cache-first for images and fonts.
  if (request.destination === "image" || request.destination === "font") {
    event.respondWith(cacheFirst(request, {}));
    return;
  }

  // Network-first with offline fallback for the SPA shell and all other requests.
  event.respondWith(networkFirst(request));
});

// ── Strategies ────────────────────────────────────────────────────────────────

async function cacheFirst(request, { immutable = false } = {}) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      // For immutable assets, clone and store; for others do the same.
      cache.put(immutable ? request : request.url, response.clone());
    }
    return response;
  } catch {
    return Response.error();
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    // For SPA navigation, serve the cached app shell so React Router can handle the route.
    if (request.mode === "navigate") {
      const shell = await cache.match(APP_SHELL_URL);
      if (shell) return shell;
      const offline = await cache.match(OFFLINE_URL);
      if (offline) return offline;
    }

    const cached = await cache.match(request);
    return cached ?? Response.error();
  }
}

// ── Background sync (optional) ────────────────────────────────────────────────
// Uncomment to retry failed form submissions when the connection returns.
//
// self.addEventListener("sync", (event) => {
//   if (event.tag === "retry-form") {
//     event.waitUntil(retryPendingForms());
//   }
// });
