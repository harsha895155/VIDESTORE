const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const { sendBulkPush, sendPush } = require('../utils/pushNotificationService');
const { saveNotificationToFirestore } = require('../utils/notifyUser');

// ── Send bulk email + save notification (background processing) ─────
router.post('/bulk-email', protect, admin, async (req, res) => {
  try {
    const { subject, message, toAll = true, customerEmail = '' } = req.body;

    let users = [];
    if (toAll) {
      // ✅ Send to both users and sellers, exclude admins
      users = await User.find({ role: { $in: ['user', 'seller'] } }).select('email fcmToken _id');
    } else {
      // ✅ Single user — also exclude admins
      const user = await User.findOne({
        email: customerEmail,
        role: { $in: ['user', 'seller'] }
      }).select('email fcmToken _id');
      if (user) users = [user];
    }

    if (users.length === 0)
      return res.status(400).json({ success: false, message: 'No target users found' });

    // ✅ RESPOND IMMEDIATELY — admin doesn't wait, no timeout error
    res.json({
      success: true,
      message: `Sending to ${users.length} users in background...`,
      total: users.length,
    });

    // ✅ PROCESS IN BACKGROUND — runs after response is sent
    setImmediate(async () => {
      let sent = 0;
      for (const user of users) {
        try {
          const htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #111; border-top: 4px solid #C9A84C;">
              <h1 style="color: #C9A84C; font-size: 20px; letter-spacing: 2px;">VIDESTORE</h1>
              <div style="margin-top: 20px; font-size: 16px; line-height: 1.6;">${message}</div>
              <p style="margin-top: 30px; font-size: 12px; color: #999;">Explore luxury at videstore.in</p>
            </div>
          `;

          // 1️⃣ Send email
          await sendEmail({ to: user.email, subject, html: htmlContent });

          // 2️⃣ Save to MongoDB + Firestore
          await saveNotificationToFirestore(user._id, subject, message, 'offer');

          // 3️⃣ Send FCM push if token exists
          if (user.fcmToken) {
            await sendPush(user.fcmToken, { title: subject, body: message });
          }

          sent++;
          console.log(`[Email] ✅ Sent ${sent}/${users.length} — ${user.email}`);
        } catch (err) {
          console.error(`[Email Error] ${user.email}: ${err.message}`);
        }
      }
      console.log(`[Email Complete] ✅ Done — ${sent}/${users.length} sent successfully`);
    });

  } catch (err) {
    console.error(`[Email Global Error] 🚨: ${err.message}`);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Send bulk push ───────────────────────────────────────────────────
router.post('/bulk-sms', protect, admin, async (req, res) => {
  try {
    const { message, title = 'VIDESTORE', targetAll = true, customerEmail = '', imageUrl } = req.body;

    let targets = [];
    if (targetAll) {
      const users = await User.find({ fcmToken: { $exists: true, $ne: null } }).select('fcmToken');
      targets = users.map(u => u.fcmToken).filter(Boolean);
    } else {
      if (customerEmail) {
        const user = await User.findOne({ email: customerEmail, fcmToken: { $exists: true, $ne: null } });
        if (user) targets = [user.fcmToken];
      }
    }

    if (targets.length === 0)
      return res.status(400).json({ success: false, message: 'No target devices found' });

    const result = await sendBulkPush(targets, { title, body: message, imageUrl });

    res.json({
      success: true,
      message: `Sent ${result.sent}/${targets.length} push notifications`,
      sent: result.sent,
      total: targets.length,
    });
  } catch (err) {
    console.error(`[Push Global Error] 🚨: ${err.message}`);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Get my notifications (MongoDB polling) ───────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    console.error(`[Get Notifications Error] 🚨: ${err.message}`);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Mark notification(s) as read ────────────────────────────────────
router.put('/mark-read', protect, async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId: req.user._id },
        { isRead: true }
      );
    } else {
      await Notification.updateMany(
        { userId: req.user._id, isRead: false },
        { isRead: true }
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(`[Mark Read Error] 🚨: ${err.message}`);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Save FCM Token ───────────────────────────────────────────────────
router.post('/save-fcm-token', protect, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken)
      return res.status(400).json({ success: false, message: 'Token is required' });
    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    res.json({ success: true, message: 'Token saved' });
  } catch (err) {
    console.error(`[FCM Save Error] 🚨: ${err.message}`);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Stats ────────────────────────────────────────────────────────────
router.get('/stats', protect, admin, async (req, res) => {
  const total = await User.countDocuments({ role: { $in: ['user', 'seller'] } });
  const withPush = await User.countDocuments({ fcmToken: { $exists: true, $ne: null } });
  res.json({ success: true, stats: { totalUsers: total, withEmail: total, withPhone: withPush } });
});

module.exports = router;