const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action:    { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details:   { type: String },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const sellerAccountSchema = new mongoose.Schema({
  // Identity
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  legalName:    { type: String, required: true },
  businessType: { type: String, enum: ['individual', 'partnership', 'pvt_ltd', 'llp', 'other'], required: true },
  gstin:        { type: String },
  pan:          { type: String },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified'
  },
  
  // Metadata
  storeName:    { type: String, required: true, unique: true },
  description:  { type: String },
  logo:         { type: String },
  banner:       { type: String },
  specialization: [String], // categories
  
  // Contact (Seller-specific)
  contactEmail: { type: String },
  contactPhone: { type: String },
  
  // Address
  address: {
    line:    { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
  },

  // Config
  fulfillmentRegions: [String],
  shippingConfig: {
    baseCharge: { type: Number, default: 0 },
    freeDeliveryThreshold: { type: Number, default: 0 },
  },
  returnPolicy: {
    allowReturns: { type: Boolean, default: true },
    returnWindowDays: { type: Number, default: 7 },
  },
  settlementPreferences: {
    cycle: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
  },
  payoutAccountId: { type: String }, // e.g. Razorpay/Stripe Account ID

  // Limits & Tier
  tier: {
    type: String,
    enum: ['starter', 'growth', 'enterprise'],
    default: 'starter'
  },
  limits: {
    maxProducts: { type: Number, default: 100 },
    maxSKUsPerProduct: { type: Number, default: 10 },
    maxImagesPerProduct: { type: Number, default: 5 },
    apiRateLimit: { type: Number, default: 100 }, // requests per minute
  },

  // Operational
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'active', 'restricted', 'suspended'],
    default: 'pending'
  },
  riskScore: { type: Number, default: 0, min: 0, max: 100 },
  region:    { type: String },
  
  auditLogs: [auditLogSchema],

}, { timestamps: true });

module.exports = mongoose.model('SellerAccount', sellerAccountSchema);
