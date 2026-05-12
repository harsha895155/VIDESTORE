const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Coupon = require('../models/Coupon');

// Public: Get active coupons for Offers page
router.get('/active', async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      validTill: { $gt: new Date() },
      validFrom: { $lt: new Date() }
    }).select('code description discountType discountValue minOrderValue maxDiscount').sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Apply coupon (customer)
router.post('/apply', protect, async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (new Date() > coupon.validTill) return res.status(400).json({ success: false, message: 'Coupon has expired' });
    if (new Date() < coupon.validFrom) return res.status(400).json({ success: false, message: 'Coupon is not yet active' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    if (orderTotal < coupon.minOrderValue) return res.status(400).json({ success: false, message: `Minimum order value ₹${coupon.minOrderValue} required` });
    if (coupon.usedBy.includes(req.user._id)) return res.status(400).json({ success: false, message: 'You have already used this coupon' });

    let discount = coupon.discountType === 'percentage'
      ? Math.round((orderTotal * coupon.discountValue) / 100)
      : coupon.discountValue;

    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);

    res.json({ success: true, discount, coupon: { code: coupon.code, description: coupon.description, discountType: coupon.discountType, discountValue: coupon.discountValue } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Admin: Get all coupons
router.get('/', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Admin: Create coupon
router.post('/', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// Admin: Delete coupon
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;