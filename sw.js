const CACHE = "fairway-v3-160";
const REMOTE_ASSET_PREFIXES = [
  "https://raw.githubusercontent.com/ardu01/app-golf/main/holes/",
  "https://raw.githubusercontent.com/ardu01/app-golf/main/icons/"
];
const ASSETS = ["./", "./index.html", "./manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("fairway-v3-") && k !== CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const cacheable =
    url.href.startsWith(self.registration.scope) ||
    REMOTE_ASSET_PREFIXES.some((prefix) => url.href.startsWith(prefix));
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request)
        .then((res) => {
          if (res.ok && cacheable) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
