/**
 * Service Worker for the Next.js app.
 *
 * Caching strategies:
 *   - Static assets (_next/static, fonts, images) → Cache-First
 *   - HTML pages (navigation)                     → Network-First with offline fallback
 *   - API routes (/api/)                          → Network-Only (never cached)
 *   - Cross-origin requests                       → Pass through (not intercepted)
 *
 * To bust the cache, increment CACHE_VERSION on every deploy.
 * The activate handler automatically deletes old caches.
 */

const CACHE_VERSION = "v1";
const CACHE_NAME = `app-cache-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";

/** Assets that are precached on install. Keep this list small. */
const PRECACHE_URLS = [OFFLINE_URL];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

// ── Activate ─────────────────────────────────────────────────────────────────
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

  // Only handle same-origin GET requests.
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Network-only for API routes — never serve stale API data.
  if (url.pathname.startsWith("/api/")) return;

  // Cache-first for immutable Next.js build assets.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Cache-first for images and fonts.
  if (request.destination === "image" || request.destination === "font") {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network-first with offline fallback for navigations and other requests.
  event.respondWith(networkFirst(request));
});

// ── Strategies ────────────────────────────────────────────────────────────────

/** Cache-First: return cached copy; fetch and cache on miss. */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return Response.error();
  }
}

/** Network-First: try network; fall back to cache; fall back to offline page. */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    // Return the offline page for HTML navigation requests.
    if (request.mode === "navigate") {
      const offline = await cache.match(OFFLINE_URL);
      if (offline) return offline;
    }

    return Response.error();
  }
}

// ── Push notifications (optional) ─────────────────────────────────────────────
// Uncomment and implement if you need push notifications.
//
// self.addEventListener("push", (event) => {
//   const data = event.data?.json() ?? {};
//   event.waitUntil(
//     self.registration.showNotification(data.title ?? "Notification", {
//       body: data.body,
//       icon: "/icons/icon-192.png",
//     }),
//   );
// });
