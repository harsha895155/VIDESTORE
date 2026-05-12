const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/emailService');
const { sendWelcomePush } = require('../utils/pushNotificationService');
const { saveNotificationToFirestore } = require('../utils/notifyUser');

// @desc Register user
// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'This email is already registered. Please login instead.' });
    if (phone) {
      const cleanPhone = phone.toString().replace(/[\s\-\+]/g, '').replace(/^91/, '').slice(-10);
      const phoneExists = await User.findOne({ phone: { $in: [phone, cleanPhone, `+91${cleanPhone}`, `91${cleanPhone}`] } });
      if (phoneExists) return res.status(400).json({ success: false, message: 'This phone number is already linked to another account.' });
    }
    const user = await User.create({ name, email, password, phone });
    const token = generateToken(user._id);
    console.log('📧 Sending welcome email to:', user.email);
    console.log('🔔 Sending welcome push to:', user.fcmToken || 'no fcmToken');
    sendWelcomeEmail(user).catch(err => console.error('❌ Welcome email failed:', err.message));
    if (user.fcmToken) sendWelcomePush(user).catch(err => console.error('❌ Welcome push failed:', err.message));

    // ── In-app notification: welcome message ──
    saveNotificationToFirestore(
      user._id,
      '👋 Welcome to VideStore!',
      `Hi ${user.name?.split(' ')[0]}! Your account has been created. Use code WELCOME10 for 10% OFF your first order.`,
      'info'
    ).catch(console.error);

    res.status(201).json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'No account found with this email. Please register first.' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated' });
    const token = generateToken(user._id);

    // ── In-app notification: login alert ──
    saveNotificationToFirestore(
      user._id,
      '🔐 New Login',
      `A new login to your VideStore account was detected. If this wasn't you, please change your password immediately.`,
      'alert'
    ).catch(console.error);

    res.json({
      success: true,
      token,
      user: {
        _id:        user._id,
        name:       user.name,
        email:      user.email,
        role:       user.role,
        avatar:     user.avatar,
        phone:      user.phone,
        sellerInfo: user.sellerInfo,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get current user
// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update profile
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Change password
// @route PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Add address
// @route POST /api/auth/address
exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) user.addresses.forEach(addr => addr.isDefault = false);
    user.addresses.push(req.body);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Forgot password
// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email address.' });
    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const expire = new Date(Date.now() + 15 * 60 * 1000);
    user.resetPasswordToken  = otp;
    user.resetPasswordExpire = expire;
    await user.save();
    if (process.env.RESEND_API_KEY) {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: user.email,
        subject: '🔐 Password Reset OTP — VideStore',
        html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px 0">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #eee">
  <div style="background:#111;padding:24px;text-align:center">
    <h1 style="color:#C9A84C;font-size:20px;letter-spacing:4px;margin:0;font-weight:300">VIDESTORE</h1>
  </div>
  <div style="padding:32px 40px;text-align:center">
    <p style="color:#666;font-size:14px;margin-bottom:24px">Hi ${user.name?.split(' ')[0]}, use this OTP to reset your password.</p>
    <div style="background:#f9f9f9;border:2px dashed #C9A84C;border-radius:8px;padding:20px;margin:20px 0">
      <p style="font-size:40px;font-weight:700;color:#C9A84C;letter-spacing:8px;margin:0">${otp}</p>
      <p style="font-size:12px;color:#999;margin-top:8px">Valid for 15 minutes only</p>
    </div>
  </div>
</div></body></html>`
      });
      if (error) console.error('[Resend Password Reset Error]', error.message);
    }
    res.json({ success: true, message: `OTP sent to ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Reset password
// @route POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ success: false, message: 'Email, OTP and new password are required.' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    const user = await User.findOne({
      email,
      resetPasswordToken:  otp,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please request a new one.' });
    user.password            = newPassword;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successfully. You can now login.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc  Register as Seller OR upgrade existing account to seller
// @route POST /api/auth/register-seller
// ─────────────────────────────────────────────────────────────────
exports.registerSeller = async (req, res) => {
  try {
    const { name, email, phone, password, sellerInfo } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, phone and password are required.' });
    }
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    // ── CASE 1: Email already exists ──────────────────────────────
    if (existingUser) {
      if (existingUser.role === 'seller') {
        return res.status(400).json({
          success: false,
          message: 'This email is already registered as a seller account. Please login to access your seller dashboard.',
        });
      }
      if (existingUser.role === 'admin') {
        return res.status(400).json({
          success: false,
          message: 'This email belongs to an admin account and cannot be used for seller registration.',
        });
      }
      // Regular user — verify password then upgrade
      const isMatch = await existingUser.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Enter your existing account password to upgrade to a seller account.',
        });
      }
      // ✅ Upgrade to seller
      existingUser.role       = 'seller';
      existingUser.sellerInfo = sellerInfo || {};
      if (name)  existingUser.name  = name;
      if (phone) existingUser.phone = phone;
      await existingUser.save();
      const token = generateToken(existingUser._id);
      console.log(`🏪 Upgraded to seller: ${existingUser.email} — ${sellerInfo?.businessName || ''}`);
      return res.status(200).json({
        success: true,
        message: 'Your account has been upgraded to a seller account!',
        token,
        user: {
          _id:        existingUser._id,
          name:       existingUser.name,
          email:      existingUser.email,
          phone:      existingUser.phone,
          role:       existingUser.role,
          sellerInfo: existingUser.sellerInfo,
        },
      });
    }

    // ── CASE 2: Brand new email — create fresh seller account ─────
    const cleanPhone  = phone.toString().replace(/[\s\-\+]/g, '').replace(/^91/, '').slice(-10);
    const phoneExists = await User.findOne({
      phone: { $in: [phone, cleanPhone, `+91${cleanPhone}`, `91${cleanPhone}`] },
    });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already linked to another account.',
      });
    }
    const user = await User.create({
      name,
      email:      email.toLowerCase().trim(),
      phone,
      password,
      role:       'seller',
      sellerInfo: sellerInfo || {},
    });
    const token = generateToken(user._id);
    sendWelcomeEmail(user).catch(err => console.error('❌ Seller welcome email failed:', err.message));
    if (user.fcmToken) sendWelcomePush(user).catch(err => console.error('❌ Seller welcome push failed:', err.message));
    console.log(`🏪 New seller created: ${user.email} — ${sellerInfo?.businessName || ''}`);
    return res.status(201).json({
      success: true,
      message: 'Seller account created successfully!',
      token,
      user: {
        _id:        user._id,
        name:       user.name,
        email:      user.email,
        phone:      user.phone,
        role:       user.role,
        sellerInfo: user.sellerInfo,
      },
    });
  } catch (error) {
    console.error('registerSeller error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc  Update seller info (bank, address, business details)
// @route PUT /api/auth/seller-info
// ─────────────────────────────────────────────────────────────────
exports.updateSellerInfo = async (req, res) => {
  try {
    const { businessName, gstin, freeDelivery, address, bank } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Merge updates into sellerInfo
    if (businessName !== undefined) user.sellerInfo.businessName = businessName;
    if (gstin        !== undefined) user.sellerInfo.gstin        = gstin;
    if (freeDelivery !== undefined) user.sellerInfo.freeDelivery = freeDelivery;

    if (address) {
      user.sellerInfo.address = {
        line:    address.line    ?? user.sellerInfo.address?.line    ?? '',
        city:    address.city    ?? user.sellerInfo.address?.city    ?? '',
        state:   address.state   ?? user.sellerInfo.address?.state   ?? '',
        pincode: address.pincode ?? user.sellerInfo.address?.pincode ?? '',
      };
    }

    if (bank) {
      user.sellerInfo.bank = {
        name:     bank.name     ?? user.sellerInfo.bank?.name     ?? '',
        bankName: bank.bankName ?? user.sellerInfo.bank?.bankName ?? '',
        account:  bank.account  ?? user.sellerInfo.bank?.account  ?? '',
        ifsc:     bank.ifsc     ?? user.sellerInfo.bank?.ifsc     ?? '',
      };
    }

    await user.save();

    console.log(`✏️  Seller info updated: ${user.email}`);
    res.json({ success: true, message: 'Seller profile updated successfully', user });
  } catch (error) {
    console.error('updateSellerInfo error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Upgrade seller tier
// @route PUT /api/auth/upgrade-tier
exports.upgradeTier = async (req, res) => {
  try {
    const { tier } = req.body;
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'seller') {
      return res.status(403).json({ success: false, message: 'Only sellers can upgrade tiers' });
    }

    const limits = { silver: 5, gold: 50, diamond: 9999 };
    if (!limits[tier]) {
      return res.status(400).json({ success: false, message: 'Invalid tier' });
    }

    user.sellerInfo.tier = tier;
    user.sellerInfo.listingLimit = limits[tier];
    await user.save();

    res.json({ success: true, message: `Upgraded to ${tier.toUpperCase()} tier!`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};