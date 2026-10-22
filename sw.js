<<<<<<< HEAD
// YWT Fitness 离线缓存 v5
// 页面导航 network-first：有网始终用最新版（4 秒超时回落缓存，弱网不白屏），
// 静态资源缓存优先+后台静默更新；安装失败自动保留旧缓存，不清空用户数据。
var CACHE = 'ywt-v5'
var CORE = ['./', './index.html', './apple-touch-icon.png?v=2']
var EXTRA = ['./manifest.json', './icon-192.png', './icon-512.png']

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // 核心文件必须成功；扩展资源单个失败不拖垮安装
      return Promise.all(CORE.map(function (u) { return c.add(u) }))
        .then(function () {
          return Promise.all(EXTRA.map(function (u) { return c.add(u).catch(function () {}) }))
        })
        .then(function () { return self.skipWaiting() })
    })
  )
})

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE }).map(function (k) { return caches.delete(k) }))
    }).then(function () { return self.clients.claim() })
  )
})

function withTimeout(p, ms) {
  return new Promise(function (resolve, reject) {
    var t = setTimeout(function () { reject(new Error('timeout')) }, ms)
    p.then(function (v) { clearTimeout(t); resolve(v) }, function (e2) { clearTimeout(t); reject(e2) })
  })
}

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return
  var req = e.request
  var isNav = req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') !== -1

  if (isNav) {
    // 页面导航：network-first（4 秒超时），失败回落缓存兜底
    e.respondWith(
      withTimeout(fetch(req), 4000).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone()
          caches.open(CACHE).then(function (c) { c.put(req, copy) })
        }
        return res
      }).catch(function () {
        return caches.match(req).then(function (hit) { return hit || caches.match('./index.html') })
      })
    )
    return
  }

  // 静态资源：缓存优先，后台静默更新
  e.respondWith(
    caches.open(CACHE).then(function (c) {
      return c.match(req).then(function (hit) {
        var net = fetch(req).then(function (res) {
          if (res && res.ok) c.put(req, res.clone())
          return res
        }).catch(function () { return hit })
        return hit || net
      })
    })
  )
})
=======
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
>>>>>>> 1e166e4 (YWT Fitness v2.1.2 发布)
