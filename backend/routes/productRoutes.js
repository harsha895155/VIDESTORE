const express = require('express');
const router  = express.Router();
const {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, getFeaturedProducts,
} = require('../controllers/productController');
const { protect, admin, seller, authorizeSeller } = require('../middleware/auth');

// ── Public ──────────────────────────────────────────────────────────────────
router.get('/featured', getFeaturedProducts);
router.get('/',         getProducts);

// ── Seller: get only their own products ─────────────────────────────────────
router.get('/mine', protect, seller, async (req, res) => {
  try {
    const Product = require('../models/Product');
    const query = req.user.role === 'admin' ? {} : { sellerId: req.user.sellerAccountId };
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Public: single product ───────────────────────────────────────────────────
router.get('/:id', getProduct);

// ── Admin + Seller: create & update ─────────────────────────────────────────
router.post('/',   protect, authorizeSeller('manage_products'), createProduct);
router.put('/:id', protect, authorizeSeller('manage_products'), isOwnerOrAdmin, updateProduct);

// ── Admin only: delete ───────────────────────────────────────────────────────
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;

// ── Middleware helpers ───────────────────────────────────────────────────────

async function isOwnerOrAdmin(req, res, next) {
  try {
    if (req.user.role === 'admin') return next();
    const Product = require('../models/Product');
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found' });
    
    if (product.sellerId?.toString() !== req.user.sellerAccountId?.toString())
      return res.status(403).json({ success: false, message: 'Not authorized to edit this product' });
    
    next();
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}