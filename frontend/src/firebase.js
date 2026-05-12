// src/firebase.js — Firebase SDK init + FCM helpers + Firestore
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB9mba8BnYyZmrr1qi1dK9ypUEG9-sBcTI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fashions-235fc.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fashions-235fc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fashions-235fc.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "87385292327",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:87385292327:web:2dc7d2cbe26db50d91d802",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX",
};

// Log to verify at runtime
console.log('🔥 Firebase Config Project ID:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BH-your-vapid-key-here";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const requestNotificationPermission = async () => {
  try {
    console.log('🔔 Requesting notification permission...');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return { granted: false };

    let registration;
    try {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    } catch (swErr) {
      console.error('🔔 SW registration failed:', swErr.message);
      return { granted: true, token: null, error: swErr.message };
    }

    let token;
    try {
      token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });
    } catch (tokenErr) {
      console.error('🔔 getToken failed:', tokenErr.message);
      return { granted: true, token: null, error: tokenErr.message };
    }

    if (token) {
      await saveFcmToken(token);
      return { granted: true, token };
    }
    return { granted: true, token: null };
  } catch (err) {
    console.error('🔔 Notification error:', err.message);
    return { granted: false, error: err.message };
  }
};

export const saveFcmToken = async (token) => {
  try {
    const authToken = localStorage.getItem('videstore_token');
    if (!authToken) return;
    await fetch(`${API_URL}/api/notifications/save-fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ fcmToken: token }),
    });
  } catch (err) {
    console.error('🔔 Failed to save FCM token:', err.message);
  }
};

export const onForegroundMessage = (callback) => {
  return onMessage(messaging, callback);
};

export { messaging };