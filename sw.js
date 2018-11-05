var CACHE_VERSION = 'restaurant-static-v1';

var CACHE_URLS = [
  './index.html',
               
  './restaurant.html',
  './js/dbhelper.js',
  './js/main.js',
  './js/restaurant_info.js',
  './js/sw_register.js',
  './sw.js',
  './manifest.json',
 './css/styles.css',
 './data/restaurants.json',
 './img/1-300.jpg',
 './img/2-300.jpg',
 './img/3-300.jpg',
 './img/4-300.jpg',
 './img/5-300.jpg',
 './img/6-300.jpg',
 './img/7-300.jpg',
 './img/8-300.jpg',
 './img/9-300.jpg',
 './img/10-300.jpg',

'http://localhost:1337/restaurants/',
'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
'https://fonts.googleapis.com/css?family=Open+Sans:300,400',
'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css'

];

self.addEventListener('install', function (event) {
 
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(function (cache) {
                console.log('Opened cache');
                return cache.addAll(CACHE_URLS);
            })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            return cacheName.startsWith('restaurant-') &&
                   cacheName != CACHE_VERSION;
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
    );
  });
  
self.addEventListener('fetch', function(event) {   
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        var fetchRequest = event.request.clone();
        

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

    
            var responseToCache = response.clone();
            console.log('response To Cache: ', responseToCache);

            caches.open(CACHE_VERSION)
              .then(function(cache) {
                console.log('responseToCache stored: ', cache);

                //cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
  