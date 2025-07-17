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
        '/assets/images/chatbot-bg.jpg',
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

self.addEventListener('push', (event) => {
  const data = event.data.json();
  const title = data.title || 'ANSAR ALMOUYASSAR';
  const options = {
    body: data.body,
    icon: '/assets/images/logo.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
