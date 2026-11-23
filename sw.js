// Service worker Aduan UIDM. Naikkan VERSI setiap kali anda menukar fail aplikasi.
const VERSI = "uidm-v12";
const SHELL = ["./", "index.html", "config.js", "manifest.json",
  "images/latar-1.jpg", "images/latar-2.jpg", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const OFFLINE_ADMIN = () => new Response(
  '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>Luar talian</title><body style="font-family:system-ui;padding:32px;text-align:center">' +
  '<h2>Anda sedang luar talian</h2><p>Halaman admin memerlukan sambungan internet.</p></body>',
  { headers: { "Content-Type": "text/html; charset=utf-8" } });

self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  // Hanya fail dari laman ini. Firebase, fon dan lain-lain terus ke rangkaian.
  if (req.method !== "GET" || url.origin !== location.origin) return;
  const admin = url.pathname.endsWith("/admin.html");
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok && !admin) { const salinan = res.clone(); caches.open(VERSI).then(c => c.put(req, salinan)); }
      return res;
    }).catch(async () => {
      if (admin) return OFFLINE_ADMIN();
      const hit = await caches.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === "navigate") return (await caches.match("index.html")) || OFFLINE_ADMIN();
      return Response.error();
    })
  );
});
