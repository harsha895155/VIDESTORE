const mongoose = require('mongoose');

// ── sizeGuide sub-schema ──────────────────────────────────────────────────────
// Stores per-size measurements set by the seller.
// Shape: { S: { chest: '34–35"', waist: '26–27"', hips: '36–37"', length: '26"' }, ... }
const sizeRowSchema = new mongoose.Schema(
  {
    chest: { type: String, default: '' },
    waist: { type: String, default: '' },
    hips: { type: String, default: '' },
    length: { type: String, default: '' },
  },
  { _id: false } // no separate _id per row
);

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true },
  description: { type: String, required: [true, 'Description is required'] },
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  discountPrice: { type: Number, default: 0 },
  images: [{ url: String, public_id: String }],
  videos: [{ url: String, public_id: String }],
  category: {
    type: String,
    required: true,
    enum: ['Men', 'Women', 'Streetwear', 'Accessories', 'Kids'],
  },
  subCategory: String,
  brand: { type: String, default: 'VideStore' },
  sizes: [{ type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'] }],
  colors: [{ name: String, hex: String }],
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String, sparse: true },
  tags: [String],
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  material: String,
  careInstructions: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sellerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'SellerAccount', index: true },

  // ── NEW: seller-customizable size guide ──────────────────────────────────
  // Mongoose Map: keys are size strings (e.g. 'S', 'M'), values are sizeRowSchema.
  // Serialises to a plain object automatically via .toObject() / .lean().
  sizeGuide: {
    type: Map,
    of: sizeRowSchema,
    default: {},
  },
  // ─────────────────────────────────────────────────────────────────────────

}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1, ratings: -1 });

module.exports = mongoose.model('Product', productSchema);