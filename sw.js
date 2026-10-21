// YWT Fitness 离线缓存（stale-while-revalidate：优先缓存，后台静默更新）
var CACHE = 'ywt-v4'
var ASSETS = ['./', './index.html', './apple-touch-icon.png']

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS) }).then(function () { return self.skipWaiting() })
  )
})

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE }).map(function (k) { return caches.delete(k) }))
    }).then(function () { return self.clients.claim() })
  )
})

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return
  e.respondWith(
    caches.open(CACHE).then(function (c) {
      return c.match(e.request).then(function (hit) {
        var net = fetch(e.request).then(function (res) {
          if (res && res.ok) c.put(e.request, res.clone())
          return res
        }).catch(function () { return hit })
        return hit || net
      })
    })
  )
})
