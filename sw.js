if (typeof idb === "undefined") {
	self.importScripts('js/idb.js');
}
let staticCacheName = 'restaurant-001';


const dbPromise = idb.open('restaurants-db',1,upgradeDB =>{
	switch (upgradeDB.oldVersion) {
		case 0:
		  upgradeDB.createObjectStore('restaurants');
	  }
});

const idbKeyVal = {
	get(key) {
	  return dbPromise.then(db => {
		return db
		  .transaction('restaurants')
		  .objectStore('restaurants')
		  .get(key);
	  });
	},
	set(key, val) {
	  return dbPromise.then(db => {
		const tx = db.transaction('restaurants', 'readwrite');
		tx.objectStore('restaurants').put(val, key);
		return tx.complete;
	  });
	}
  };

  //cache to install
self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(staticCacheName).then(function(cache) {
			return cache.addAll([
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
			]).catch(error => {
				console.log('Cache open failed: ' + error);
			  });
		})
	);
});
//deleting old cache
self.addEventListener('activate', function(event) {
	event.waitUntil(
		caches.keys()
		.then(function(cacheNames) {
			return Promise.all(
				cacheNames.filter(function(cacheName) {
					return cacheName.startsWith('restaurant-') &&
						   cacheName != staticCacheName;
				}).map(function(cacheName) {
					return caches.delete(cacheName);
				})
			);
		})
	);
})

self.addEventListener('fetch', event => {
	const request = event.request;
	const requestUrl = new URL(request.url);
	if (requestUrl.port === '1337') {
	  event.respondWith(idbCache(request));
	}
	else {
	  event.respondWith(cacheResponseData(request));
	}
  });

  function idbCache(request) {
	return idbKeyVal.get('restaurants')
	  .then(restaurants => {
		return (
		  restaurants ||
		  fetch(request)
			.then(response => response.json())
			.then(json => {
			  idbKeyVal.set('restaurants', json);
			  return json;
			})
		);
	  })
	  .then(response => new Response(JSON.stringify(response)))
	  .catch(error => {
		return new Response(error, {
		  status: 404,
		  statusText: 'Not found'
		});
	  });
	}
	
	  function cacheResponseData(request) {
	
		return caches.match(request).then(response => {
		  return response || fetch(request).then(fetchResponse => {
			return caches.open(staticCacheName).then(cache => {
			
			  if (!fetchResponse.url.includes('browser-sync')) { 
				cache.put(request, fetchResponse.clone()); 
			  }
			  return fetchResponse; 
			});
		  });
		}).catch(error => {
		 
		
		  return new Response(error, {
			status: 404,
			statusText: 'Not connected to the internet'
		  });
		});
		
	
  }

  