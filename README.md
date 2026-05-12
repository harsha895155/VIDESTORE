# 🛍️ VIDESTORE – Premium Fashion E-Commerce

> A full-stack production-ready fashion e-commerce platform built with React, Node.js, MongoDB, and Razorpay — inspired by Zara, Nike, and H&M.

![VideStore](https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Auth** | JWT + bcryptjs |
| **Storage** | Cloudinary |
| **Payments** | Razorpay + Stripe |
| **Deploy** | Vercel (frontend) + Render (backend) |

---

## 📁 Folder Structure

```
videstore/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── layout/       # Navbar, Footer
│       │   └── product/      # ProductCard
│       ├── context/          # Auth, Cart, Wishlist contexts
│       ├── pages/            # All pages
│       │   └── admin/        # Admin dashboard pages
│       └── services/         # API service (axios)
│
├── backend/
│   ├── config/               # DB + Cloudinary config
│   ├── controllers/          # Business logic
│   ├── middleware/           # Auth middleware
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express routes
│   ├── seed.js               # Database seeder
│   └── server.js             # Entry point
│
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- npm or yarn
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)
- Razorpay test account

---

### Step 1 — Clone & Install

```bash
# Install all dependencies
cd videstore
npm run install:all
```

Or install manually:
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

### Step 2 — Configure Environment Variables

#### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/videstore?retryWrites=true&w=majority

# JWT (use a long random string)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRE=30d

# Cloudinary (get from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (get from dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Stripe (optional alternative to Razorpay)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx

# Frontend URL
CLIENT_URL=http://localhost:5173
```

#### Frontend (`frontend/.env`)
```env
VITE_API_URL=${API_URL}/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

---

### Step 3 — Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Click **Connect** → **Connect your application**
4. Copy the connection string and paste it in `MONGODB_URI`
5. Add your IP to the Network Access whitelist (or allow `0.0.0.0/0` for dev)

---

### Step 4 — Set Up Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. From the dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**
3. Paste them into the backend `.env`

---

### Step 5 — Set Up Razorpay

1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Create a test account
3. Go to **Settings → API Keys** → Generate Test Key
4. Copy **Key ID** and **Key Secret** to both `.env` files

---

### Step 6 — Seed the Database

```bash
cd backend
node seed.js
```

This creates:
- 👑 **Admin**: `admin@videstore.in` / `Admin@123`
- 👤 **User**: `user@videstore.in` / `User@123`
- 🛍️ 8 sample products across all categories

---

### Step 7 — Run the Project

```bash
# Terminal 1 - Backend (${API_URL})
cd backend
npm run dev

# Terminal 2 - Frontend (http://localhost:5173)
cd frontend
npm run dev
```

Or run both simultaneously from root:
```bash
npm run dev
```

---

## 🌐 API Routes Reference

### Authentication
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (auth) |
| PUT | `/api/auth/profile` | Update profile (auth) |
| PUT | `/api/auth/change-password` | Change password (auth) |
| POST | `/api/auth/address` | Add address (auth) |

### Products
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/products` | Get products (with filters) |
| GET | `/api/products/featured` | Featured/New/BestSellers |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |

### Cart
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/cart` | Get cart (auth) |
| POST | `/api/cart` | Add to cart (auth) |
| PUT | `/api/cart/:itemId` | Update quantity (auth) |
| DELETE | `/api/cart/:itemId` | Remove item (auth) |
| DELETE | `/api/cart/clear` | Clear cart (auth) |

### Orders
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/orders` | Create order (auth) |
| GET | `/api/orders/my-orders` | My orders (auth) |
| GET | `/api/orders/:id` | Get single order (auth) |
| GET | `/api/orders/all` | All orders (admin) |
| PUT | `/api/orders/:id/status` | Update status (admin) |

### Payment
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/payment/razorpay/create-order` | Create Razorpay order |
| POST | `/api/payment/razorpay/verify` | Verify payment |
| POST | `/api/payment/stripe/create-intent` | Stripe payment intent |

---

## 🚀 Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
```

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Set **Root Directory** to `frontend`
5. Add environment variables from `frontend/.env`
6. Deploy!

### Backend → Render

1. Go to [render.com](https://render.com)
2. Create a new **Web Service**
3. Connect your GitHub repository
4. Set **Root Directory** to `backend`
5. **Build Command**: `npm install`
6. **Start Command**: `npm start`
7. Add all environment variables from `backend/.env`
8. Set `NODE_ENV=production` and `CLIENT_URL=https://your-vercel-app.vercel.app`
9. Deploy!

### Post-Deployment
- Update `VITE_API_URL` in Vercel environment to your Render backend URL
- Update `CLIENT_URL` in Render environment to your Vercel frontend URL
- Run seed script against production DB once

---

## 📄 Database Models

| Model | Key Fields |
|-------|-----------|
| **User** | name, email, password, role, addresses[] |
| **Product** | name, price, category, sizes[], colors[], images[], stock |
| **Order** | user, orderItems[], shippingAddress, orderStatus, paymentResult |
| **Cart** | user, items[{product, size, color, quantity}] |
| **Wishlist** | user, products[] |
| **Review** | user, product, rating, title, comment |

---

## 🎨 Pages Overview

| Page | Route | Auth Required |
|------|-------|--------------|
| Home | `/` | No |
| Shop | `/shop` | No |
| Product Detail | `/product/:id` | No |
| Cart | `/cart` | No |
| Checkout | `/checkout` | ✅ |
| Profile | `/profile` | ✅ |
| Wishlist | `/wishlist` | ✅ |
| My Orders | `/orders` | ✅ |
| Order Detail | `/orders/:id` | ✅ |
| Admin Dashboard | `/admin` | ✅ Admin |
| Admin Products | `/admin/products` | ✅ Admin |
| Admin Orders | `/admin/orders` | ✅ Admin |
| Admin Users | `/admin/users` | ✅ Admin |

---

## 🔐 Security Features

- JWT authentication with 30-day expiry
- bcrypt password hashing (12 rounds)
- Rate limiting (100 req/15min)
- Helmet.js security headers
- CORS configured for frontend origin
- Input validation on all routes
- Admin-only route protection

---

## 💡 Key Features

- ✅ Full authentication (register, login, profile)
- ✅ Product catalog with advanced filters (category, price, size, color, sort)
- ✅ Product search with text indexing
- ✅ Shopping cart with quantity management
- ✅ Wishlist system
- ✅ Customer reviews and ratings
- ✅ Razorpay payment integration
- ✅ Order management with status tracking
- ✅ Admin dashboard (products, orders, users)
- ✅ Image upload via Cloudinary
- ✅ Fully responsive (mobile-first)
- ✅ Framer Motion animations
- ✅ Premium Black + White + Gold design theme
- ✅ Newsletter subscription UI

---

## 🧪 Test Credentials

```
Admin: admin@videstore.in / Admin@123
User:  user@videstore.in / User@123

Razorpay Test Card:
  Number: 4111 1111 1111 1111
  Expiry: Any future date
  CVV:    Any 3 digits
  OTP:    Success
```

---

## 📝 License

MIT © 2026 VideStore Fashion Pvt. Ltd.
"# VIDESTORE" 
"# VIDESTORE" 
