const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  fullName:     { type: String, required: true },
  phone:        { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: String,
  city:         { type: String, required: true },
  state:        { type: String, required: true },
  pincode:      { type: String, required: true },
  country:      { type: String, default: 'India' },
  isDefault:    { type: Boolean, default: false },
});

// ── NEW: seller info schema ──
const sellerInfoSchema = new mongoose.Schema({
  businessName: { type: String, default: '' },
  businessType: { type: String, default: '' },   // individual, partnership, pvt_ltd, llp, other
  gstin:        { type: String, default: '' },
  category:     { type: String, default: '' },   // men, women, streetwear, accessories, all
  address: {
    line:    { type: String, default: '' },
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
  bank: {
    account: { type: String, default: '' },
    ifsc:    { type: String, default: '' },
    name:    { type: String, default: '' },   // account holder name
  },
  status: {
    type:    String,
    enum:    ['pending', 'approved', 'suspended'],
    default: 'pending',
  },
  totalPaidOut: { type: Number, default: 0 },

  // Account Tiers & Limits
  tier: {
    type: String,
    enum: ['silver', 'gold', 'diamond'],
    default: 'silver',
  },
  listingLimit: { type: Number, default: 5 }, // Silver: 5, Gold: 50, Diamond: 9999
  
  // No-returns policy
  noReturnsApproved: { type: Boolean, default: false }, // admin grants permission
  noReturnsEnabled:  { type: Boolean, default: false }, // seller activates it (only if approved)

  payoutHistory: [{

    amount:      { type: Number },

    note:        { type: String, default: '' },

    processedAt: { type: Date,   default: Date.now },

    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  }],
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Name is required'], trim: true,
  },
  email: {
    type: String, required: [true, 'Email is required'],
    unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  // password not required for Google users
  password: { type: String, minlength: 6, select: false },
  phone:    String,
  fcmToken: { type: String, default: null },
  avatar:   { type: String, default: '' },

  // ── UPDATED: added 'seller' roles ──
  role: {
    type:    String,
    enum:    ['user', 'seller_owner', 'seller_staff', 'admin', 'seller'], // 'seller' kept for compat
    default: 'user',
  },

  // ── NEW: Link to SellerAccount ──
  sellerAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerAccount', default: null },
  
  // ── NEW: Granular Permissions ──
  // Examples: ['manage_products', 'view_orders', 'manage_inventory', 'view_finance', 'manage_team']
  permissions: [String],

  addresses:  [addressSchema],
  isActive:   { type: Boolean, default: true },

  resetPasswordToken:  String,
  resetPasswordExpire: Date,

  // Google OAuth
  googleId: { type: String, default: null },

  // ── DEPRECATED: legacy seller info (use sellerAccountId instead) ──
  sellerInfo: { type: sellerInfoSchema, default: () => ({}) },
  freeDelivery: { type: Boolean, default: false },


}, { timestamps: true });

// Only hash password if it exists and was modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (!this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);