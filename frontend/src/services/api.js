import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "https://videstore.onrender.com";

const API = axios.create({
  baseURL: BASE + "/api",
  timeout: 15000,
});

// ── Request interceptor ───────────────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("videstore_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — unwraps response.data automatically ────
API.interceptors.response.use(
  (response) => response.data,   // ← all API calls return data directly
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("videstore_token");
      const isLoginReq = error.config?.url?.includes("/auth/login");
      if (token && !isLoginReq) {
        localStorage.removeItem("videstore_token");
        localStorage.removeItem("videstore_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// ── Auth ──────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  registerSeller: (data) => API.post("/auth/register-seller", data),
  getMe: () => API.get("/auth/me"),
  updateProfile: (data) => API.put("/auth/profile", data),
  changePassword: (data) => API.put("/auth/change-password", data),
  addAddress: (data) => API.post("/auth/address", data),
  forgotPassword: (data) => API.post("/auth/forgot-password", data),
  resetPassword: (data) => API.post("/auth/reset-password", data),
  updateSellerInfo: (data) => API.put("/auth/seller-info", data),
  upgradeTier: (tier) => API.put("/auth/upgrade-tier", { tier }),
  googleLogin: () => { window.location.href = `${BASE}/api/auth/google`; },
};

// ── Products ──────────────────────────────────────────────────────
export const productAPI = {
  getAll: (params) => API.get("/products", { params }),
  getById: (id) => API.get(`/products/${id}`),
  getFeatured: () => API.get("/products/featured"),
  getMine: () => API.get("/products/mine"),
  create: (data) => API.post("/products", data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
};

// ── Cart ──────────────────────────────────────────────────────────
export const cartAPI = {
  get: () => API.get("/cart"),
  add: (data) => API.post("/cart", data),
  update: (itemId, data) => API.put(`/cart/${itemId}`, data),
  remove: (itemId) => API.delete(`/cart/${itemId}`),
  clear: () => API.delete("/cart/clear"),
};

// ── Wishlist ──────────────────────────────────────────────────────
export const wishlistAPI = {
  get: () => API.get("/wishlist"),
  toggle: (productId) => API.post("/wishlist", { productId }),
};

// ── Orders ───────────────────────────────────────────────────────
export const orderAPI = {
  create: (data) => API.post("/orders", data),
  getMyOrders: () => API.get("/orders/my-orders"),
  getById: (id) => API.get(`/orders/${id}`),
  getAll: (params) => API.get("/orders/all", { params }),
  updateStatus: (id, d) => API.put(`/orders/${id}/status`, d),
  cancel: (id) => API.put(`/orders/${id}/cancel`),
  confirm: (id) => API.put(`/orders/${id}/confirm`),
  deleteMyOrders: () => API.delete("/orders/seller/my-orders"),

  // ── Return & Refund ───────────────────────────────────────────
  // Sends multipart/form-data with reason, note, images
  // Backend notifies seller + admin via email & notification
  requestReturn: (orderId, formData) =>
    API.post(`/orders/${orderId}/return`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Admin/Seller: approve or reject a return request
  // action: 'approve' | 'reject'
  handleReturn: (orderId, action, note = "") =>
    API.put(`/orders/${orderId}/return`, { action, note }),

  // Get all return requests (admin/seller view)
  getReturns: (params) => API.get("/orders/returns/all", { params }),
};

// ── Delivery ──────────────────────────────────────────────────────
export const deliveryAPI = {
  markReady: (orderId) => API.post(`/delivery/ready/${orderId}`),
  simulate: (orderId) => API.post(`/delivery/simulate/${orderId}`),
  track: (waybill) => API.get(`/delivery/track/${waybill}`),
  cancelOrder: (orderId) => API.post(`/delivery/cancel/${orderId}`),
  checkPincode: (pincode, sellerPincode = '') => API.get(`/delivery/check-pincode`, { params: { pincode, sellerPincode } }),
  getCharges: (params) => API.get(`/delivery/charges`, { params }),
  getMode: () => API.get(`/delivery/mode`),
  getLabel: (orderId) => `${API.defaults.baseURL}/delivery/label/${orderId}`,
  // Trigger Shiprocket reverse pickup after return is approved
  reversePickup: (orderId) => API.post(`/delivery/reverse/${orderId}`),
};

// ── Reviews ──────────────────────────────────────────────────────
export const reviewAPI = {
  create: (data) => API.post("/reviews", data),
  getByProduct: (productId) => API.get(`/reviews/${productId}`),
  delete: (id) => API.delete(`/reviews/${id}`),
  markHelpful: (id) => API.put(`/reviews/${id}/helpful`),
};

// ── Payment ──────────────────────────────────────────────────────
export const paymentAPI = {
  createRazorpayOrder: (amount) => API.post("/payment/razorpay/create-order", { amount }),
  verifyRazorpay: (data) => API.post("/payment/razorpay/verify", data),
  createStripeIntent: (amount) => API.post("/payment/stripe/create-intent", { amount }),
};

// ── Users (Admin) ─────────────────────────────────────────────────
export const userAPI = {
  getAll: (params) => API.get("/users", { params }),
  getById: (id) => API.get(`/users/${id}`),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
  getDashboardStats: (params) => API.get("/users/dashboard-stats", { params }),
  getAnalytics: (params) => API.get("/users/dashboard-stats", { params }),
  deleteAllOrders: () => API.delete("/orders/admin/delete-all-orders"),
  resetRevenueData: () => API.put("/orders/admin/reset-revenue"),
  purgeOrders: () => API.delete("/orders/admin/delete-all-orders"),
  purgeReturns: () => API.delete("/orders/admin/delete-all-returns"),
  purgeUsers: () => API.delete("/users/admin/purge"),
  processPayout: (id, data) => API.post(`/users/${id}/payout`, data),
  clearPayoutHistory: (id) => API.delete(`/users/${id}/payout-history`),
  toggleNoReturnsApproval: (id, approved) => API.patch(`/users/${id}/no-returns-approval`, { approved }),
};

// ── Seller self-service ───────────────────────────────────────────
export const sellerAPI = {
  toggleNoReturns: (enabled) => API.patch('/auth/no-returns', { enabled }),
};

// ── Coupons ───────────────────────────────────────────────────────
export const couponAPI = {
  apply: (data) => API.post("/coupons/apply", data),
  getAll: () => API.get("/coupons"),
  create: (data) => API.post("/coupons", data),
  delete: (id) => API.delete(`/coupons/${id}`),
};

// ── Upload ────────────────────────────────────────────────────────
export const uploadAPI = {
  uploadImage: (fd) => API.post("/upload/image", fd, { headers: { "Content-Type": "multipart/form-data" } }),
  uploadImages: (fd) => API.post("/upload/images", fd, { headers: { "Content-Type": "multipart/form-data" } }),
  deleteImage: (public_id) => API.delete("/upload/image", { data: { public_id } }),

  // ── Video upload (max 2, 50 MB each) ─────────────────────────────
  uploadVideos: (fd) => API.post("/upload/videos", fd, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000, // 2 min timeout for large video files
  }),
  deleteVideo: (public_id) => API.delete("/upload/video", { data: { public_id } }),
};

// ── Settings (Admin) — commission & fixed charge ──────────────────
export const settingsAPI = {
  get: () => API.get('/settings'),
  update: (data) => API.put('/settings', data),
};

export default API;