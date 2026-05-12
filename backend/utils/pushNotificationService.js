// ═══════════════════════════════════════════════════════════
// utils/pushNotificationService.js
// Firebase Cloud Messaging — replaces Fast2SMS
// ═══════════════════════════════════════════════════════════

const admin = require('firebase-admin');

let firebaseInitialized = false;

try {
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });

    firebaseInitialized = true;
    console.log('🔥 Firebase initialized');
  } else {
    console.log('⚠️ Firebase credentials not found. Push notifications disabled.');
  }
} catch (error) {
  console.error('Firebase initialization error:', error.message);
}

// ── Core send function ───────────────────────────────────────
const sendPush = async (fcmToken, { title, body, data = {} }) => {
  if (!firebaseInitialized) {
    console.log(`🔔 [Firebase Disabled] Would have sent: ${title}`);
    return { success: false, message: 'Firebase not initialized' };
  }
  
  try {
    const message = {
      notification: { title, body },
      data: data,
      token: fcmToken,
    };
    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Push error:', error.message);
    return { success: false, error: error.message };
  }
};

// ── Bulk send (multicast) ────────────────────────────────────
const sendBulkPush = async (fcmTokens, { title, body, imageUrl, data = {} }) => {
  if (!firebaseInitialized || !fcmTokens.length) {
    return { success: false, sent: 0 };
  }

  try {
    const message = {
      notification: { title, body, imageUrl },
      data: data,
      tokens: fcmTokens,
    };
    const response = await admin.messaging().sendEachForMulticast(message);
    return { 
      success: true, 
      sent: response.successCount, 
      total: fcmTokens.length 
    };
  } catch (error) {
    console.error('Bulk push error:', error.message);
    return { success: false, error: error.message };
  }
};

// ── Notification Templates ───────────────────────────────────
module.exports = {
  admin,
  firebaseInitialized,
  sendPush,
  sendBulkPush,

  sendOrderConfirmedPush: (order, user) => sendPush(user?.fcmToken, {
    title: '✅ Order Confirmed!',
    body: `Your VideStore order #${order._id.toString().slice(-8).toUpperCase()} is confirmed. Total: ₹${order.totalPrice?.toLocaleString()}`,
    data: { url: '/orders', orderId: order._id.toString(), type: 'order_confirmed' },
  }),

  sendOrderShippedPush: (order, user) => sendPush(user?.fcmToken, {
    title: '🚚 Order Shipped!',
    body: `VideStore order #${order._id.toString().slice(-8).toUpperCase()} is on its way!${order.trackingNumber ? ` Track: ${order.trackingNumber}` : ''}`,
    data: { url: `/orders/${order._id}`, orderId: order._id.toString(), type: 'order_shipped' },
  }),

  sendOrderDeliveredPush: (order, user) => sendPush(user?.fcmToken, {
    title: '🎉 Order Delivered!',
    body: `Your VideStore order #${order._id.toString().slice(-8).toUpperCase()} has been delivered! Hope you love it.`,
    data: { url: `/orders/${order._id}`, orderId: order._id.toString(), type: 'order_delivered' },
  }),

  sendOrderCancelledPush: (order, user) => sendPush(user?.fcmToken, {
    title: '❌ Order Cancelled',
    body: `VideStore order #${order._id.toString().slice(-8).toUpperCase()} cancelled. Refund in 5-7 days if paid online.`,
    data: { url: '/orders', orderId: order._id.toString(), type: 'order_cancelled' },
  }),

  sendWelcomePush: (user) => sendPush(user?.fcmToken, {
    title: '👋 Welcome to VideStore!',
    body: `Hey ${user.name?.split(' ')[0]}! Use code WELCOME10 for 10% OFF your first order.`,
    data: { url: '/shop', type: 'welcome' },
  }),
};