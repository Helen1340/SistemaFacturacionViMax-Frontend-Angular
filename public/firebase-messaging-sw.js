// src/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDuJH7SNtmi0ZlUA_SjyYhKL7zbKLT-9wY",
  authDomain: "vi-max-ec031.firebaseapp.com",
  projectId: "vi-max-ec031",
  storageBucket: "vi-max-ec031.firebasestorage.app",
  messagingSenderId: "724035536242",
  appId: "1:724035536242:web:5cc0e5da71737ee1f1c9eb"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('📩 Notificación en background:', payload);

  const title = payload.notification?.title || 'Notificación';
  const options = {
    body: payload.notification?.body || '',
    icon: '/favicon.ico'
  };

  self.registration.showNotification(title, options);
});