const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const passport  = require('passport');

dotenv.config();
connectDB();

const app = express();

// Trust proxy - required for Render/Heroku to handle https correctly
app.set('trust proxy', 1);

// Security middleware
app.use(passport.initialize());
app.use(helmet());
app.use(morgan('dev'));

// CORS — must come before rate limiter so preflight OPTIONS requests get headers
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://videstore.onrender.com"
    ];
    // Allow local development, specified origins, and any vercel.app subdomain
    if (!origin || allowed.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Increased from 100 to prevent 429 errors in development/heavy usage
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ↓ Increased to 100mb to support video uploads via multipart/form-data
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve static files (logo, etc.) from /public
app.use(express.static(require('path').join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/delivery', require('./routes/deliveryRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

// Temporary route to create admin account easily via browser
app.get('/api/setup-admin', async (req, res) => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const email = 'vibestore2027@gmail.com';
    const password = 'VideStore2027';
    
    let user = await User.findOne({ email });
    if (user) {
      user.role = 'admin';
      user.password = password; // Will be hashed by pre-save hook
      await user.save();
      return res.send(`<h1>Admin account updated!</h1><p>Email: ${email}</p><p>Password: ${password}</p><a href="http://localhost:5173/login">Go to Login</a>`);
    } else {
      await User.create({
        name: 'Admin',
        email: email,
        password: password,
        role: 'admin',
        isActive: true
      });
      return res.send(`<h1>Admin account created!</h1><p>Email: ${email}</p><p>Password: ${password}</p><a href="http://localhost:5173/login">Go to Login</a>`);
    }
  } catch (error) {
    res.send(`Error: ${error.message}`);
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'VideStore API is running!', status: 'OK' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 VideStore server running on port ${PORT}`);
});