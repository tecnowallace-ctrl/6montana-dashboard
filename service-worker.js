// Service Worker - Montana Vinos & Parrilla Dashboard
// Estrategia: cachear la app (HTML, iconos) para abrir rapido y offline,
// pero NUNCA cachear los datos de Google (Apps Script) ni CDNs de datos:
// esos siempre se piden a la red para tener informacion fresca.
 
var CACHE_NAME = 'montana-dashboard-v2';
var APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];
 
// Instalacion: guardar el "esqueleto" de la app
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    }).then(function () { return self.skipWaiting(); })
  );
});
 
// Activacion: borrar caches viejos de versiones anteriores
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE_NAME) { return caches.delete(k); }
      }));
    }).then(function () { return self.clients.claim(); })
  );
});
 
self.addEventListener('fetch', function (event) {
  var url = event.request.url;
 
  // 1) Datos de Google Apps Script: SIEMPRE a la red (nunca cache)
  if (url.indexOf('script.google.com') !== -1 ||
      url.indexOf('script.googleusercontent.com') !== -1) {
    event.respondWith(fetch(event.request));
    return;
  }
 
  // 2) Librerias externas (Chart.js, jsPDF, fuentes): red primero, cache de respaldo
  if (url.indexOf('cdnjs.cloudflare.com') !== -1 ||
      url.indexOf('cdn.jsdelivr.net') !== -1 ||
      url.indexOf('fonts.googleapis.com') !== -1 ||
      url.indexOf('fonts.gstatic.com') !== -1) {
    event.respondWith(
      fetch(event.request).then(function (resp) {
        var copy = resp.clone();
        caches.open(CACHE_NAME).then(function (c) { c.put(event.request, copy); });
        return resp;
      }).catch(function () { return caches.match(event.request); })
    );
    return;
  }
 
  // 3) El HTML del dashboard (navegacion): RED PRIMERO, cache de respaldo.
  //    Asi siempre se ve la ultima version publicada; el cache solo se usa sin internet.
  if (event.request.mode === 'navigate' ||
      url.indexOf('index.html') !== -1 ||
      url.endsWith('/')) {
    event.respondWith(
      fetch(event.request).then(function (resp) {
        var copy = resp.clone();
        caches.open(CACHE_NAME).then(function (c) { c.put(event.request, copy); });
        return resp;
      }).catch(function () {
        return caches.match(event.request).then(function (c) {
          return c || caches.match('./index.html');
        });
      })
    );
    return;
  }
 
  // 4) Resto de archivos (iconos, manifest): cache primero, red de respaldo
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request).then(function (resp) {
        var copy = resp.clone();
        caches.open(CACHE_NAME).then(function (c) { c.put(event.request, copy); });
        return resp;
      });
    })
  );
});
 
