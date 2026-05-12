const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  seller:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerAccount', index: true },
  name: String,
  image: String,
  price: { type: Number, required: true },
  size: { type: String, default: '' },
  color: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: String, phone: String,
  addressLine1: String, addressLine2: String,
  city: String, state: String, pincode: String,
  country: { type: String, default: 'India' },
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  message: { type: String, default: '' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
});

// ── Return Request sub-schema ─────────────────────────────────────
const returnRequestSchema = new mongoose.Schema({
  reason: { type: String },               // e.g. 'wrong_size'
  reasonLabel: { type: String },               // e.g. 'Wrong Size / Doesn\'t Fit'
  note: { type: String, default: '' },  // customer's extra description
  upiId: { type: String, default: '' }, // customer's UPI ID for refund
  images: [{
    url: { type: String },
    public_id: { type: String },
  }],
  requestedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  resolvedAt: { type: Date, default: null },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolutionNote: { type: String, default: '' },
  // Refund details populated after approval
  refundAmount: { type: Number, default: 0 },
  refundStatus: {
    type: String,
    enum: ['NA', 'Pending', 'Processed'],
    default: 'NA',
  },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [orderItemSchema],
  shippingAddress: shippingAddressSchema,

  // Payment
  paymentMethod: { type: String, enum: ['COD', 'Razorpay', 'Stripe'], default: 'COD' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
  paymentResult: {
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    stripePaymentId: { type: String, default: null },
    paidAt: { type: Date, default: null },
  },

  // Pricing
  subtotal: { type: Number, required: true },
  shippingPrice: { type: Number, default: 0 },
  taxPrice: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date, default: null },

  // ── Status Flow ───────────────────────────────────────────────
  // Processing → Confirmed → Shipped → Out for Delivery → Delivered
  // After Delivered: customer can request Return within 6 days
  // Return flow: Return Requested → Return Approved / Return Rejected → Returned
  orderStatus: {
    type: String,
    enum: [
      'Processing',
      'Confirmed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Returned',
      'Return Requested',   // customer submitted return form
      'Return Approved',    // seller/admin approved return
      'Return Rejected',    // seller/admin rejected return
    ],
    default: 'Processing',
  },

  // Delivery Tracking (prototype now, real Shiprocket later)
  trackingId: { type: String, default: null },
  trackingNumber: { type: String, default: null },
  courierPartner: { type: String, default: null },
  estimatedDelivery: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },
  readyAt: { type: Date, default: null },
  shiprocketShipmentId: { type: String, default: null },

  // Cancellation & Refund
  cancellationFee: { type: Number, default: 0 },
  refundAmount: { type: Number, default: 0 },
  refundStatus: { type: String, enum: ['NA', 'Pending', 'Processed'], default: 'NA' },

  // Payout
  payoutEligible: { type: Boolean, default: false },
  payoutProcessed: { type: Boolean, default: false },

  // Coupon
  couponCode: { type: String, default: null },

  statusHistory: [statusHistorySchema],

  // ── Return Request (filled when customer submits return form) ──
  returnRequest: returnRequestSchema,

}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'orderItems.seller': 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ trackingId: 1 });
orderSchema.index({ 'returnRequest.status': 1 });  // fast return queries

module.exports = mongoose.model('Order', orderSchema);