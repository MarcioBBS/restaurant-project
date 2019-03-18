const appName = "restaurant-reviews"
const staticCacheName = appName + "-v1.0";
const contentImgsCache = appName + "-images";

var allCaches = [
    staticCacheName,
    contentImgsCache
  ];

/** At Service Worker Install time, cache all static assets */
self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(staticCacheName).then(function(cache) {
        return cache.addAll([
          '/', 
          '/restaurant.html',
          '/css/styles.css',
          'css/responsive_large.css',
          'css/responsive_medium.css',
          'css/responsive_small.css',          
          '/js/dbhelper.js',
          '/js/secret.js',
          '/js/main.js',
          '/js/restaurant_info.js',
          'js/register-sw.js', 
          'data/restaurants.json',
          'images/favicon.png'          
        ]);
      })
    );
  });

/** At Service Worker Activation, Delete previous caches, if any */
self.addEventListener('activate', function(event) {
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            return cacheName.startsWith(appName) &&
                   !allCaches.includes(cacheName);
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
    );
  });

/** Hijack fetch requests and respond accordingly */
self.addEventListener('fetch', function(event) {    

    const requestUrl = new URL(event.request.url);

  // highjack request made to our app
  if (requestUrl.origin === location.origin) {          
    if (requestUrl.pathname.startsWith('/restaurant.html')) {
      event.respondWith(caches.match('/restaurant.html'));
      return; 
    }
    if (requestUrl.pathname.startsWith('/img')) {
        event.respondWith(serveImage(event.request));
        return; 
    }
  }
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });

// It store image into cache
function serveImage(request) {
let imageStorageUrl = request.url;
imageStorageUrl = imageStorageUrl.replace(/-small\.\w{3}|-medium\.\w{3}|-large\.\w{3}/i, '');

return caches.open(contentImgsCache).then(function(cache) {
    return cache.match(imageStorageUrl).then(function(response) {   
        return response || fetch(request).then(function(networkResponse) {
            cache.put(imageStorageUrl, networkResponse.clone());
            return networkResponse;
        });
    });
});
}