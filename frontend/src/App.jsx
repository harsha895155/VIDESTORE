import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Customer Pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import ReturnRequestPage from './pages/ReturnRequestPage';
import OffersPage from './pages/OffersPage';

import GoogleAuthSuccess from './pages/GoogleAuthSuccess';

import NotificationPermissionModal from './components/NotificationPermissionModal';
import { onForegroundMessage } from './firebase';
import { db } from './firebase';
import { toast } from 'react-hot-toast';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminSellers from './pages/admin/AdminSellers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReturns from './pages/admin/AdminReturns';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProductForm from './pages/seller/SellerProductForm';
import SellerRegisterPage from './pages/seller/SellerRegisterPage';

// Legal Pages
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import RefundPolicy from './pages/legal/RefundPolicy';
import ShippingPolicy from './pages/legal/ShippingPolicy';
import CookiePolicy from './pages/legal/CookiePolicy';
import Disclaimer from './pages/legal/Disclaimer';
import { SizeGuide, FAQ, ContactUs, TrackOrder } from './pages/legal/HelpPages';

// ── Route Guards ──────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, initializing } = useAuth();
  if (initializing) return null;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin, initializing } = useAuth();
  if (initializing) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="serif text-xl tracking-[0.3em] animate-pulse" style={{ color: 'var(--p)' }}>Manifesting...</div>
    </div>
  );
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const SellerRoute = ({ children }) => {
  const { isLoggedIn, user, initializing } = useAuth();
  if (initializing) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="serif text-xl tracking-[0.3em] animate-pulse" style={{ color: 'var(--p)' }}>Manifesting...</div>
    </div>
  );
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (user?.role !== 'seller' && user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// ── Scroll to top ─────────────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

const DASHBOARD_ROUTES = ['/seller', '/admin'];
const isDashboardRoute = (path) =>
  DASHBOARD_ROUTES.some(r => path === r || path.startsWith(r + '/'));

const isLandingRoute = (path) => path === '/';

const AppContent = () => {
  const { isLoggedIn, initializing } = useAuth();
  const { pathname } = useLocation();
  const [forcedLoading, setForcedLoading] = useState(true);

  // ── Must declare ALL hooks unconditionally at the top ──
  useEffect(() => {
    const timer = setTimeout(() => setForcedLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Sync FCM token on login
  useEffect(() => {
    if (isLoggedIn && Notification.permission === 'granted') {
      import('./firebase').then(({ requestNotificationPermission }) => {
        requestNotificationPermission().catch(() => { });
      });
    }
  }, [isLoggedIn]);

  // Foreground FCM messages → toast
  useEffect(() => {
    try {
      const unsubscribe = onForegroundMessage((payload) => {
        toast.custom((t) => (
          <div className="p-5 rounded-2xl border shadow-2xl max-w-sm flex items-start space-x-4 mt-6 transform transition-all duration-500 hover:scale-[1.02]" 
               style={{ background: 'var(--card)', borderColor: 'var(--b)', backdropFilter: 'blur(20px)' }}>
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--p)]/10 flex items-center justify-center">
              <FiBell className="text-[var(--p)]" size={18} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-[var(--p)] mb-1">{payload.notification?.title || 'VideStore'}</h4>
              <p className="text-[13px] text-[var(--t)] font-medium leading-relaxed">{payload.notification?.body}</p>
            </div>
            <button onClick={() => toast.dismiss(t.id)} className="text-[var(--tl)] hover:text-[var(--t)] transition-colors">
              <FiX size={16} />
            </button>
          </div>
        ), { duration: 6000 });
      });
      return () => unsubscribe();
    } catch (e) { console.error('Foreground listener error:', e) }
  }, []);

  // ── Conditional renders AFTER all hooks ──
  if ((initializing || forcedLoading) && pathname !== '/') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center" 
           style={{ backgroundColor: '#000000', zIndex: 9999 }}>
        <div className="relative mb-12">
          <div className="w-24 h-24 rounded-3xl border-2 border-[var(--p)] flex items-center justify-center animate-[spin_8s_linear_infinite] shadow-2xl shadow-gold/10"
               style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="serif text-[var(--p)] text-5xl font-black -rotate-[360deg]">V</span>
          </div>
          <div className="absolute -inset-3 rounded-[2.5rem] border border-dashed border-[var(--p)]/20 animate-[spin_12s_linear_infinite_reverse]" />
        </div>
        <div className="space-y-6">
          <h1 className="serif text-4xl font-bold tracking-[0.25em] text-white">VIDESTORE</h1>
          <div className="flex items-center justify-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-[var(--p)] animate-bounce" style={{ animationDelay: '0s' }} />
             <div className="w-1.5 h-1.5 rounded-full bg-[var(--p)] animate-bounce" style={{ animationDelay: '0.2s' }} />
             <div className="w-1.5 h-1.5 rounded-full bg-[var(--p)] animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Curating Luxury</p>
        </div>
      </div>
    );
  }

  const fullScreen = isDashboardRoute(pathname) || isLandingRoute(pathname);

  if (!initializing && pathname === '/' && isLoggedIn) {
    return <Navigate to="/home" replace />;
  }

  return (
    <>
      <NotificationPermissionModal />
      <ScrollToTop />
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-alt)' }}>
        {!fullScreen && <Navbar db={db} />}
        <main className={`flex-1 ${!fullScreen ? 'pt-[56px] md:pt-[64px]' : ''}`}>
          <Routes>
            {/* ── Customer Routes ── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shop/:category" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/orders/:id/return" element={<ProtectedRoute><ReturnRequestPage /></ProtectedRoute>} />
            <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />

            {/* ── Admin Routes ── */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/products/new" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
            <Route path="/admin/products/:id/edit" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
            <Route path="/admin/coupons" element={<AdminRoute><AdminCoupons /></AdminRoute>} />
            <Route path="/admin/notifications" element={<AdminRoute><AdminNotifications /></AdminRoute>} />
            <Route path="/admin/sellers" element={<AdminRoute><AdminSellers /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            <Route path="/admin/returns" element={<AdminRoute><AdminReturns /></AdminRoute>} />

            {/* ── Seller Routes ── */}
            <Route path="/seller" element={<SellerRoute><SellerDashboard /></SellerRoute>} />
            <Route path="/seller/dashboard" element={<SellerRoute><SellerDashboard /></SellerRoute>} />
            <Route path="/seller/products/new" element={<SellerRoute><SellerProductForm /></SellerRoute>} />
            <Route path="/seller/products/:id/edit" element={<SellerRoute><SellerProductForm /></SellerRoute>} />
            <Route path="/seller-register" element={<SellerRegisterPage />} />
            <Route path="/seller/register" element={<SellerRegisterPage />} />

            {/* ── Legal Pages ── */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/size-guide" element={<SizeGuide />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/track-order" element={<TrackOrder />} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        {!fullScreen && <Footer />}
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { 
            fontFamily: 'inherit', 
            fontSize: '11px', 
            fontWeight: '700',
            letterSpacing: '0.02em',
            borderRadius: '16px', 
            backgroundColor: 'var(--card)', 
            color: 'var(--t)', 
            border: '1px solid var(--b)', 
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            padding: '12px 20px',
            textTransform: 'uppercase'
          },
          success: { duration: 3000, iconTheme: { primary: 'var(--s)', secondary: 'var(--card)' } },
          error: { duration: 5000, iconTheme: { primary: 'var(--d)', secondary: 'var(--card)' } },
        }}
      />
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AppContent />
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}