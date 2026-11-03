/* 서비스 워커: 앱 파일을 기기에 저장해 인터넷 없이 실행되게 한다.
 * 데이터(IndexedDB)는 여기서 다루지 않는다. 네트워크로 데이터를 보내지 않는다. */
const VERSION = '4804b1afaa0e';
const CACHE = `assetbook-${VERSION}`;
const FILES = ["./","./app.css","./app.js","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./index.html","./manifest.webmanifest"];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('assetbook-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

// 캐시 우선. 앱 파일은 버전별로 통째로 교체되므로 실행 중 섞이지 않는다.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      if (req.mode === 'navigate') return caches.match('./index.html').then((r) => r || fetch(req));
      return fetch(req);
    }),
  );
});
