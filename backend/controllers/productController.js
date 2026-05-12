const Product = require('../models/Product');

// ── helper: convert Mongoose Map fields (like sizeGuide) to plain JS object ──
// Mongoose Maps serialise correctly when you call .toObject() or use .lean().
// We apply this after every query so the API always returns a plain object.
const toPlain = (doc) => {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject({ getters: true }) : doc;
  // Convert sizeGuide Map → plain object if it's still a Map
  if (obj.sizeGuide instanceof Map) {
    const plain = {};
    obj.sizeGuide.forEach((v, k) => { plain[k] = v; });
    obj.sizeGuide = plain;
  }
  return obj;
};

// @desc  Get all products with filters
// @route GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const {
      search, category, subCategory, brand,
      minPrice, maxPrice, size, color, sort,
      page = 1, limit = 12,
      featured, newArrival, bestSeller,
    } = req.query;

    const query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
        { subCategory: searchRegex },
        { material: searchRegex },
        { tags: searchRegex },
      ];
    }

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (brand) query.brand = { $in: brand.split(',') };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (size) query.sizes = { $in: size.split(',') };
    if (color) query['colors.name'] = { $in: color.split(',') };

    if (featured === 'true') query.isFeatured = true;
    if (newArrival === 'true') query.isNewArrival = true;
    if (bestSeller === 'true') query.isBestSeller = true;

    const sortOptions = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'rating': { ratings: -1 },
      'newest': { createdAt: -1 },
      'popular': { numReviews: -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);

    // ── Fix 3: use .lean() so Maps are auto-converted to plain objects ──
    const products = await Product.find(query)
      .populate('createdBy', 'name role email sellerInfo')
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit))
      .lean();                          // ← plain JS objects, Maps become objects

    res.json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single product
// @route GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    // ── Fix 3: .lean() converts the sizeGuide Map to a plain object ──
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name role email sellerInfo')
      .lean();                          // ← plain JS object, Map → plain object

    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Create product (Admin / Seller)
// @route POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const sellerRoles = ['seller', 'seller_owner', 'seller_staff'];
    const isSeller = sellerRoles.includes(req.user.role);

    // Seller Limit Check
    if (isSeller) {
      if (!req.user.sellerAccountId) {
        return res.status(403).json({ success: false, message: 'Seller account not linked' });
      }

      const SellerAccount = require('../models/SellerAccount');
      const account = await SellerAccount.findById(req.user.sellerAccountId);
      if (!account) return res.status(404).json({ success: false, message: 'Seller account not found' });

      const currentCount = await Product.countDocuments({ sellerId: req.user.sellerAccountId });
      const limit = account.limits?.maxProducts || 100;
      
      if (currentCount >= limit) {
        return res.status(403).json({ 
          success: false, 
          message: `Listing limit reached (${limit} products). Please upgrade your tier (${account.tier}).` 
        });
      }
    }

    const productData = {
      ...req.body,
      createdBy: req.user._id,
      sellerId:  isSeller ? req.user.sellerAccountId : req.body.sellerId, // admin can set sellerId
    };

    const product = await Product.create(productData);

    // ── Fix 3: toPlain() converts sizeGuide Map → plain object in response ──
    res.status(201).json({ success: true, product: toPlain(product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update product (Admin / Seller)
// @route PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    // ── Fix 3: lean() on the updated doc so sizeGuide Map serialises correctly ──
    // findByIdAndUpdate with { new: true } returns a Mongoose doc (not lean).
    // We call toPlain() on it so the Map becomes a plain object in the response.
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found' });

    // toPlain converts the Mongoose Map → plain JS object before sending
    res.json({ success: true, product: toPlain(product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete product (Admin)
// @route DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get featured / new arrivals / best sellers
// @route GET /api/products/featured
exports.getFeaturedProducts = async (req, res) => {
  try {
    // ── Fix 3: .lean() on all three queries ──
    const [featured, newArrivals, bestSellers] = await Promise.all([
      Product.find({ isFeatured: true }).limit(8).lean(),
      Product.find({ isNewArrival: true }).sort({ createdAt: -1 }).limit(8).lean(),
      Product.find({ isBestSeller: true }).limit(8).lean(),
    ]);
    res.json({ success: true, featured, newArrivals, bestSellers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};