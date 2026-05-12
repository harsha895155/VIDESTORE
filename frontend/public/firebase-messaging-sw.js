// firebase-messaging-sw.js — Firebase Cloud Messaging Service Worker
// Place this file in /public so it's served at the root.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyB9mba8BnYyZmrr1qi1dK9ypUEG9-sBcTI",
  authDomain:        "fashions-235fc.firebaseapp.com",
  projectId:         "fashions-235fc",
  storageBucket:     "fashions-235fc.firebasestorage.app",
  messagingSenderId: "87385292327",
  appId:             "1:87385292327:web:2dc7d2cbe26db50d91d802",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const { title, body } = payload.notification || {};
  const notifTitle = title || 'VideStore';
  const notifOptions = {
    body:    body || 'You have a new notification',
    icon:    payload.notification?.icon || '/logo.png',
    image:   payload.notification?.image || payload.data?.image, // <-- Added Image support
    badge:   '/logo.png',
    vibrate: [200, 100, 200],
    data:    payload.data || {},
    actions: [
      { action: 'open',    title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  self.registration.showNotification(notifTitle, notifOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
