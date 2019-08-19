'use strict';
importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');
if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);
    workbox.precaching.precacheAndRoute([
  {
    "url": "404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  },
  {
    "url": "firebase.json",
    "revision": "eba4c1149475e78daca63e518b923b72"
  },
  {
    "url": "images/ic_add_white_24px.svg",
    "revision": "b09442e8f4b45894cf21566f0813453c"
  },
  {
    "url": "images/ic_refresh_white_24px.svg",
    "revision": "21e4c77a8b98c7516d6c7a97cdbddc22"
  },
  {
    "url": "images/icons/icon-128x128.png",
    "revision": "2130834cd714238e9787cd73fd388fef"
  },
  {
    "url": "images/icons/icon-144x144.png",
    "revision": "6209f144b06ec8ad7e0b377b32e6dcbe"
  },
  {
    "url": "images/icons/icon-152x152.png",
    "revision": "4a3438688d0bf6c0424b4eba7f7db29e"
  },
  {
    "url": "images/icons/icon-192x192.png",
    "revision": "ae24766a189b6a61a650f81783c07648"
  },
  {
    "url": "images/icons/icon-256x256.png",
    "revision": "e2c4b64bf679d78a4eddde131c2bddc4"
  },
  {
    "url": "images/icons/icon-512x512.png",
    "revision": "318757cd5256eef9eb3c52d1ae074eec"
  },
  {
    "url": "index.html",
    "revision": "620db885c6747557b527c7ce2362cfe8"
  },
  {
    "url": "manifest.json",
    "revision": "de8234e7b243a1b3718258b498842fbd"
  },
  {
    "url": "scripts/app.js",
    "revision": "3581ac6982b587a1b5528542be2bab06"
  },
  {
    "url": "scripts/install.js",
    "revision": "9fb5fa28cadcbc66c80e1440821445e4"
  },
  {
    "url": "service-worker.js",
    "revision": "63a6720fcfae0a61e8517bfe7b58234c"
  },
  {
    "url": "styles/inline.css",
    "revision": "964e8546d971e6d204fd2644c3ed4abf"
  },
  {
    "url": "workbox-config.js",
    "revision": "b992612ef8c22868e13ac0f5ad60546b"
  }
]);
    workbox.routing.registerRoute(
      /\.js$/,
      new workbox.strategies.CacheFirst(
          {
              cacheName: 'js-cache',
          }
      )
    );
    workbox.routing.registerRoute(
      // Cache CSS files.
      /\.css$/,
      // Use cache but update in the background.
      new workbox.strategies.CacheFirst({
        // Use a custom cache name.
        cacheName: 'css-cache',
      })
    );
    workbox.routing.registerRoute(
      // Cache image files.
      /\.(?:png|jpg|jpeg|svg|gif)$/,
      // Use the cache if it's available.
      new workbox.strategies.CacheFirst({
        // Use a custom cache name.
        cacheName: 'image-cache',
        plugins: [
          new workbox.expiration.Plugin({
            // Cache only 20 images.
            maxEntries: 20,
            // Cache for a maximum of a week.
            maxAgeSeconds: 7 * 24 * 60 * 60,
          })
        ],
      })
    );
    const CACHE_NAME = 'static-cache-v1.2';
    const DATA_CACHE_NAME = 'data-cache-v1.2';
    // CODELAB: Update cache names any time any of the cached files change.
    const FILES_TO_CACHE = [
        '/',
        // '/index.html',
        // '/scripts/app.js',
        // '/styles/inline.css',
        // '/images/ic_add_white_24px.svg',
        // '/images/ic_refresh_white_24px.svg',
    ];
    self.addEventListener('install', (evt) => {
      console.log('[ServiceWorker] Install');
      // CODELAB: Precache static resources here.
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
          console.log('[ServiceWorker] Pre-caching offline page');
          return cache.addAll(FILES_TO_CACHE);
        })
    );
      self.skipWaiting();
    });

    self.addEventListener('activate', (evt) => {
      console.log('[ServiceWorker] Activate');
      // CODELAB: Remove previous cached data from disk.
    evt.waitUntil(
        caches.keys().then((keyList) => {
          return Promise.all(keyList.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log('[ServiceWorker] Removing old cache', key);
              return caches.delete(key);
            }
          }));
        })
    );
      self.clients.claim();
    });


    self.addEventListener('fetch', (evt) => {
        console.log('[ServiceWorker] Fetch', evt.request.url);
        if (evt.request.url.includes('https://api-ratp.pierre-grimaud.fr/v3/schedules/')) {
          console.log('[Service Worker] Fetch (data)', evt.request.url);
          evt.respondWith(
              caches.open(DATA_CACHE_NAME).then((cache) => {
                return fetch(evt.request)
                    .then((response) => {
                      // If the response was good, clone it and store it in the cache.
                      if (response.status === 200) {
                            cache.put(evt.request.url, response.clone());
                      }
                      return response;
                    }).catch((err) => {
                      // Network request failed, try to get it from the cache.
                      return cache.match(evt.request);
                    });
              }));
          return;
        }
        evt.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
              return cache.match(evt.request)
                  .then((response) => {
                    return response || fetch(evt.request);
                  });
            })
        );

    });
}
else {
    console.log(`Noooooo`);

}




