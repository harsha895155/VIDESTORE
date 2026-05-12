const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user)          return res.status(401).json({ success: false, message: 'User not found' });
    if (!req.user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated' });
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ success: false, message: 'Not authorized as admin' });
};

// ── NEW: seller middleware ──
// Allows seller owners, staff, and admins (admin can do everything a seller can)
const seller = (req, res, next) => {
  if (req.user && (
    req.user.role === 'seller' || 
    req.user.role === 'seller_owner' || 
    req.user.role === 'seller_staff' || 
    req.user.role === 'admin'
  )) return next();
  res.status(403).json({ success: false, message: 'Not authorized as seller' });
};

// ── NEW: granular seller permission middleware ──
const authorizeSeller = (permission) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    
    // Admins bypass all permission checks
    if (req.user.role === 'admin') return next();
    
    // Owner bypasses all seller-level permission checks
    if (req.user.role === 'seller_owner' || req.user.role === 'seller') return next();
    
    // Staff check
    if (req.user.role === 'seller_staff' && req.user.permissions.includes(permission)) return next();
    
    res.status(403).json({ success: false, message: `Access denied: missing ${permission} permission` });
  };
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
};

module.exports = { protect, admin, seller, authorizeSeller, generateToken };