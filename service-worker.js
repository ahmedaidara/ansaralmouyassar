self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('ansar-almouyassar-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/main.css',
        '/main.js',
        '/chatbotResponses.js',
        '/assets/images/logo.png',
        '/assets/videos/intro.mp4'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
