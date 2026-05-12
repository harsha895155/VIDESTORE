import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  FiHeart, FiShoppingBag, FiUser, FiX,
  FiLogOut, FiPackage, FiSettings, FiChevronRight,
  FiHome, FiGrid, FiShoppingCart, FiChevronDown,
  FiHelpCircle, FiFileText, FiShield, FiTruck,
  FiRefreshCw, FiTag, FiMenu, FiArrowRight, FiBell, FiSun, FiMoon
} from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import LiveSearch from './LiveSearch';
import {
  SUB_CATEGORIES
} from '../../constants/categories';

const CATEGORIES = ['Men', 'Women', 'Streetwear', 'Accessories'];

const CAT_CONFIG = {
  Men: { color: 'var(--p)', tag: 'New Season', count: '240+ styles' },
  Women: { color: 'var(--p)', tag: 'Trending', count: '380+ styles' },
  Streetwear: { color: 'var(--p)', tag: 'New Drop', count: '160+ styles' },
  Accessories: { color: 'var(--p)', tag: 'Curated', count: '120+ picks' },
};

const QUICK_FILTERS = {
  Men: ['New Arrivals', 'Best Sellers', 'Ethnic', 'Sports'],
  Women: ['New Arrivals', 'Trending Now', 'Ethnic Wear', 'Party Wear'],
  Streetwear: ['New Drops', 'Limited Edition', 'Vintage', 'Unisex'],
  Accessories: ['New In', 'Best Sellers', 'Luxury', 'Gift Ideas'],
};

// ─── Notification type configs ────────────────────────────────────────────────
const NOTIF_TYPE_CONFIG = {
  offer: { color: 'var(--p)', icon: FiTag, bg: 'var(--pl)' },
  order: { color: '#3b82f6', icon: FiPackage, bg: 'rgba(59, 130, 246, 0.1)' },
  alert: { color: 'var(--d)', icon: FiBell, bg: 'var(--dl)' },
  info: { color: 'var(--s)', icon: FiBell, bg: 'var(--sl)' },
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('videstore_token');
      if (!token || !userId) { setNotifications([]); return; }
      const res = await fetch(`${API_URL}/api/notifications/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setNotifications(data.notifications || []);
    } catch (e) { /* silent */ }
  };

  useEffect(() => {
    if (!userId) { setNotifications([]); return; }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const markRead = async (notifId) => {
    try {
      const token = localStorage.getItem('videstore_token');
      await fetch(`${API_URL}/api/notifications/mark-read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notificationId: notifId })
      });
      setNotifications(prev => prev.map(n =>
        n._id === notifId ? { ...n, isRead: true } : n
      ));
    } catch (e) { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('videstore_token');
      await fetch(`${API_URL}/api/notifications/mark-read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({})
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) { /* silent */ }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return { notifications, unreadCount, markRead, markAllRead };
}

function NotificationPanel({ notifications, unreadCount, markRead, markAllRead, onClose, isMobile }) {
  return (
    <motion.div
      initial={isMobile ? { y: '100%' } : { opacity: 0, y: 15, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={isMobile ? { y: '100%' } : { opacity: 0, y: 15, scale: 0.95 }}
      className={`fixed md:absolute z-[100] ${isMobile ? 'inset-0 bottom-[76px]' : 'top-full right-0 w-[420px] mt-4'} rounded-3xl border shadow-2xl overflow-hidden flex flex-col`}
      style={{ borderColor: 'var(--b)', backgroundColor: 'var(--card)', backdropFilter: 'blur(30px)' }}
    >
      <div className="flex items-center justify-between px-8 py-5 border-b" style={{ background: 'var(--bg-alt)', borderColor: 'var(--b)' }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner" style={{ border: '1px solid var(--b)', background: 'var(--card)' }}>
            <FiBell size={18} style={{ color: 'var(--p)' }} />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--t)' }}>Notifications</h3>
            {unreadCount > 0 && <p className="text-[10px] font-bold mt-0.5 uppercase tracking-wider" style={{ color: 'var(--p)' }}>{unreadCount} New Updates</p>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-[10px] font-bold uppercase tracking-wider opacity-40 hover:opacity-100 transition-all" style={{ color: 'var(--t)' }}>
              Clear
            </button>
          )}
          {isMobile && (
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: '1px solid var(--b)', color: 'var(--t)', background: 'var(--bg-alt)' }}>
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3 max-h-[500px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-12">
            <div className="w-20 h-20 rounded-[32px] flex items-center justify-center mb-8 opacity-20 shadow-inner" style={{ border: '1px solid var(--b)', background: 'var(--bg-alt)' }}>
              <FiBell size={32} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--tl)' }}>No notifications</p>
            <p className="text-[11px] mt-3 opacity-60 font-bold leading-relaxed" style={{ color: 'var(--tl)' }}>You're all caught up! New updates will appear here.</p>
          </div>
        ) : (
          notifications.map(notif => {
            const cfg = NOTIF_TYPE_CONFIG[notif.type] || NOTIF_TYPE_CONFIG.info;
            const Icon = cfg.icon;
            return (
              <div 
                key={notif._id} 
                onClick={() => markRead(notif._id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex gap-4 ${!notif.isRead ? 'shadow-lg shadow-black/5' : 'opacity-40'}`}
                style={{ 
                  background: !notif.isRead ? 'var(--card)' : 'var(--bg-alt)', 
                  borderColor: !notif.isRead ? 'var(--p)' : 'var(--b)' 
                }}
              >
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-inner" style={{ background: cfg.bg, color: cfg.color, border: '1px solid var(--b-inner)' }}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate mb-1 tracking-tight" style={{ color: 'var(--t)' }}>{notif.title}</p>
                  <p className="text-[11px] font-medium opacity-50 leading-relaxed line-clamp-2" style={{ color: 'var(--t)' }}>{notif.message}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-[9px] font-bold uppercase tracking-wider opacity-30" style={{ color: 'var(--t)' }}>
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                    {!notif.isRead && <div className="w-2 h-2 rounded-full shadow-sm" style={{ background: 'var(--p)' }} />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [deskCatOpen, setDeskCatOpen] = useState(false);
  const [deskMoreOpen, setDeskMoreOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [activeCat, setActiveCat] = useState('Men');
  const [notifOpen, setNotifOpen] = useState(false);

  const { user, logout, isAdmin, isSeller } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(user?._id);

  const deskNotifRef = useRef(null);
  const userMenuRef = useRef(null);
  const deskMoreRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (deskNotifRef.current && !deskNotifRef.current.contains(e.target)) setNotifOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (deskMoreRef.current && !deskMoreRef.current.contains(e.target)) setDeskMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setNotifOpen(false);
    setUserMenuOpen(false);
    setDeskCatOpen(false);
    setDeskMoreOpen(false);
    setMobileMoreOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    window.location.href = '/home'; // Full reload → loading screen restarts
  };

  return (
    <header 
      className={`fixed top-0 w-full z-[1000] transition-all duration-500 border-b py-1`}
      style={{ 
        backgroundColor: scrolled ? 'var(--glass)' : 'transparent',
        borderColor: scrolled ? 'var(--glass-b)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        boxShadow: scrolled ? 'var(--shadow-premium)' : 'none'
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4 md:gap-10">
        
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
          <div className="w-11 h-11 md:w-13 md:h-13 rounded-xl flex items-center justify-center transition-all duration-700 group-hover:rotate-[360deg] border border-[var(--p)] shadow-lg shadow-gold/20 overflow-hidden" 
            style={{ background: 'var(--card)' }}>
            <span className="serif text-[var(--p)] text-2xl font-black">V</span>
          </div>
          <div className="flex flex-col border-l border-[var(--b)] pl-4 py-1">
            <span className="serif text-xl md:text-2xl font-black tracking-tight text-gradient-gold leading-none">VIDESTORE</span>
            <span className="text-[8px] font-black tracking-[0.4em] uppercase opacity-40 mt-1" style={{ color: 'var(--tl)' }}>Exclusive Luxury</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="flex items-center gap-4 flex-1">
          <>
            {/* All Categories Button */}
            <button 
              onClick={() => setDeskCatOpen(!deskCatOpen)}
              className="hidden lg:flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-xl border transition-all hover:bg-[var(--bg-alt)] whitespace-nowrap shadow-sm"
              style={{ 
                color: 'var(--p)',
                borderColor: 'var(--b)',
                background: deskCatOpen ? 'var(--card)' : 'transparent'
              }}
            >
              <FiGrid size={15} /> Categories <FiChevronDown size={12} className={`transition-transform duration-500 ${deskCatOpen ? 'rotate-180' : ''}`} />
            </button>
          </>

          {/* Central Search - Always Visible */}
          <div className="flex-[2] max-w-xl mx-auto hidden md:block">
            <LiveSearch isDesktop scrolled={scrolled} isDark={isDark} />
          </div>

          <>
              {/* More Dropdown */}
              <div className="relative hidden xl:block" ref={deskMoreRef}>
                <button 
                  onClick={() => setDeskMoreOpen(!deskMoreOpen)}
                  className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-xl border transition-all hover:bg-[var(--bg-alt)] shadow-sm"
                  style={{ 
                    color: 'var(--t)',
                    borderColor: 'var(--b)',
                    background: deskMoreOpen ? 'var(--card)' : 'transparent'
                  }}
                >
                  Support <FiChevronDown size={12} className={`transition-transform duration-500 ${deskMoreOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {deskMoreOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute top-full right-0 mt-4 w-80 rounded-3xl border shadow-2xl overflow-hidden p-3"
                      style={{ borderColor: 'var(--b)', background: 'var(--card)' }}
                    >
                      <p className="px-5 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider opacity-30" style={{ color: 'var(--t)' }}>Institutional Links</p>
                      
                      {[
                        ...(!user ? [{ label: 'Sell Products', sub: 'Open your store', icon: FiShoppingBag, to: '/seller/register', color: 'var(--w)', bg: 'var(--wl)' }] : []),
                        { label: 'Track Order', sub: 'View status', icon: FiTruck, to: '/track-order', color: 'var(--p)', bg: 'var(--pl)' },
                        { label: 'Deals', sub: 'Special offers', icon: FiTag, to: '/offers', color: 'var(--s)', bg: 'var(--sl)' },
                        { label: 'Get Help', sub: 'Support & FAQ', icon: FiHelpCircle, to: '/size-guide', color: 'var(--tl)', bg: 'var(--bg-alt)' },
                        ...(isAdmin ? [{ label: 'Admin', sub: 'Dashboard', icon: FiShield, to: '/admin', color: 'var(--p)', bg: 'var(--pl)' }] : []),
                      ].map(item => (
                        <Link 
                          key={item.label} 
                          to={item.to}
                          className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--bg-alt)] transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm" style={{ background: item.bg, color: item.color, border: '1px solid var(--b-inner)' }}>
                            <item.icon size={18} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[13px] font-bold tracking-tight" style={{ color: 'var(--t)' }}>{item.label}</p>
                            <p className="text-[10px] font-medium opacity-40 uppercase tracking-wider" style={{ color: 'var(--t)' }}>{item.sub}</p>
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
          </>
        </nav>

        {/* Mobile Header Icons */}
        <div className="flex md:hidden items-center gap-1 sm:gap-2">
          <Link to="/cart" className="p-2 relative group">
             <FiShoppingBag size={20} style={{ color: 'var(--t)' }} />
             {cartCount > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-[8px] bg-[var(--p)] text-black flex items-center justify-center font-bold shadow-sm">{cartCount}</span>}
          </Link>
          <button onClick={() => setMobileMoreOpen(!mobileMoreOpen)} className="p-2 text-[var(--p)] hover:bg-[var(--p)]/10 rounded-xl transition-all">
            <FiMenu size={24} />
          </button>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          <Link to="/wishlist" className="relative group p-2 rounded-xl hover:bg-[var(--bg-alt)] transition-all">
            <FiHeart size={20} className="transition-all group-hover:scale-110 group-hover:text-[var(--p)]" style={{ color: 'var(--t)' }} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 rounded-full text-[9px] font-bold text-[#040404] flex items-center justify-center shadow-lg" style={{ background: 'var(--p)' }}>
                {wishlistCount}
              </span>
            )}
          </Link>

          <button 
            onClick={() => toggleTheme()}
            className="p-2 rounded-xl hover:bg-[var(--bg-alt)] transition-all"
            style={{ color: 'var(--t)' }}
          >
            {isDark ? <FiSun size={20} className="text-amber-500" /> : <FiMoon size={20} className="text-blue-600" />}
          </button>

          <Link to="/cart" className="relative group p-2 rounded-xl hover:bg-[var(--bg-alt)] transition-all">
            <FiShoppingBag size={20} className="transition-all group-hover:scale-110 group-hover:text-[var(--p)]" style={{ color: 'var(--t)' }} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 rounded-full text-[9px] font-bold text-[#040404] flex items-center justify-center shadow-lg" style={{ background: 'var(--p)' }}>
                {cartCount}
              </span>
            )}
          </Link>

          <div className="relative" ref={deskNotifRef}>
            <button 
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative group p-2 rounded-xl hover:bg-[var(--bg-alt)] transition-all"
            >
              <FiBell size={21} className="transition-all group-hover:scale-110 group-hover:text-[var(--p)]" style={{ color: 'var(--t)' }} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full text-[9px] font-bold text-black flex items-center justify-center shadow-lg" style={{ background: 'var(--p)' }}>
                  {unreadCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <NotificationPanel 
                  notifications={notifications}
                  unreadCount={unreadCount}
                  markRead={markRead}
                  markAllRead={markAllRead}
                  onClose={() => setNotifOpen(false)}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={userMenuRef}>
            {user ? (
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-black shadow-lg shadow-gold/10 transition-all hover:scale-105 active:scale-95 ml-2"
                style={{ background: 'var(--p)' }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </button>
            ) : (
              <Link to="/login"
                className="font-bold text-[9px] uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gold/10 whitespace-nowrap inline-flex items-center justify-center mr-2"
                style={{
                  background: 'var(--p)',
                  color: 'black',
                }}
              >
                SIGN IN
              </Link>
            )}

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute top-full right-0 mt-4 w-64 rounded-3xl border shadow-2xl overflow-hidden"
                  style={{ borderColor: 'var(--b)', background: 'var(--card)' }}
                >
                  <div className="p-6 border-b" style={{ borderColor: 'var(--b)' }}>
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--t)' }}>{user?.name}</p>
                    <p className="text-[12px] opacity-50 truncate" style={{ color: 'var(--tm)' }}>{user?.email}</p>
                  </div>
                  <div className="p-2 py-3">
                    {[
                      { to: '/profile', icon: FiUser, label: 'My Profile' },
                      { to: '/orders', icon: FiPackage, label: 'My Orders' },
                      { to: '/wishlist', icon: FiHeart, label: 'Wishlist' },
                    ].map(item => (
                      <Link 
                        key={item.to} 
                        to={item.to}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[var(--b)]/10 transition-all group"
                      >
                        <item.icon size={16} className="transition-colors" style={{ color: 'var(--tl)' }} />
                        <span className="text-[13px] font-medium" style={{ color: 'var(--t)' }}>{item.label}</span>
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-blue-600/5 transition-all group">
                        <FiShield size={16} className="text-blue-600" />
                        <span className="text-[13px] font-medium text-blue-600">Admin Panel</span>
                      </Link>
                    )}
                    {isSeller && (
                      <Link to="/seller/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[var(--p)]/5 transition-all group">
                        <FiShoppingBag size={16} className="text-[var(--p)]" />
                        <span className="text-[13px] font-medium text-[var(--p)]">Seller Dashboard</span>
                      </Link>
                    )}
                    <div className="my-2 border-t" style={{ borderColor: 'var(--b)' }} />
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/5 transition-all group text-red-500"
                    >
                      <FiLogOut size={16} />
                      <span className="text-[13px] font-medium">Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Categories Mega Menu */}
      <AnimatePresence>
        {deskCatOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-[-1]"
              onClick={() => setDeskCatOpen(false)}
            />
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-full left-0 w-full border-b shadow-2xl py-16"
              style={{ borderColor: 'var(--b)', background: 'var(--card)' }}
            >
              <div className="max-w-[1536px] mx-auto px-16 grid grid-cols-4 gap-16">
                {CATEGORIES.map(cat => (
                  <div key={cat} className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-8 rounded-full" style={{ background: CAT_CONFIG[cat].color }} />
                      <h3 className="serif text-3xl font-black" style={{ color: 'var(--t)' }}>{cat}</h3>
                    </div>
                    <div className="space-y-4">
                      {SUB_CATEGORIES[cat]?.slice(0, 8).map(sub => (
                        <Link 
                          key={sub.name} 
                          to={`/shop?category=${cat}&search=${encodeURIComponent(sub.name)}`}
                          className="block text-[11px] font-bold uppercase tracking-widest text-[var(--tl)] hover:text-blue-600 hover:translate-x-2 transition-all"
                        >
                          {sub.name}
                        </Link>
                      ))}
                      <Link 
                        to={`/shop/${cat.toLowerCase()}`}
                        className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] pt-6 group"
                        style={{ color: 'var(--p)' }}
                      >
                        View All <FiArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
        {mobileMoreOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMoreOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1100]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-[var(--card)] z-[1200] border-l border-[var(--b)] shadow-2xl flex flex-col">
              <div className="p-8 flex items-center justify-between border-b border-[var(--b)] bg-[var(--bg-alt)]/50">
                <span className="serif text-xl font-black text-gradient-gold">MENU</span>
                <button onClick={() => setMobileMoreOpen(false)} className="w-10 h-10 rounded-full bg-[var(--bg)] flex items-center justify-center border border-[var(--b)] text-[var(--t)]"><FiX size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {[
                  { label: 'Home', to: '/', icon: FiHome },
                  { label: 'Shop All', to: '/shop', icon: FiGrid },
                  { label: 'My Cart', to: '/cart', icon: FiShoppingCart, count: cartCount },
                  { label: 'Wishlist', to: '/wishlist', icon: FiHeart, count: wishlistCount },
                  { label: 'My Profile', to: '/profile', icon: FiUser },
                  { label: 'Orders', to: '/orders', icon: FiPackage },
                  ...(isSeller ? [{ label: 'Seller Dashboard', to: '/seller/dashboard', icon: FiShoppingBag }] : []),
                  ...(isAdmin ? [{ label: 'Admin Panel', to: '/admin', icon: FiShield }] : []),
                ].map(item => (
                  <Link key={item.label} to={item.to} className="flex items-center justify-between px-4 py-4 rounded-xl hover:bg-[var(--b)]/10 transition-all group">
                    <div className="flex items-center gap-4">
                      <item.icon size={18} className="text-[var(--tl)] group-hover:text-[var(--p)] transition-colors" />
                      <span className="font-medium text-[14px] text-[var(--t)]">{item.label}</span>
                    </div>
                    {item.count > 0 && <span className="px-2 py-0.5 rounded-md bg-[var(--p)] text-black text-[10px] font-bold">{item.count}</span>}
                  </Link>
                ))}
              </div>
              <div className="p-6 border-t border-[var(--b)]">
                {user ? (
                   <button onClick={handleLogout} className="w-full py-4 rounded-xl hover:bg-red-500/5 text-red-500 flex items-center gap-4 font-medium text-[14px] px-4 transition-all">
                     <FiLogOut size={18} /> Logout
                   </button>
                ) : (
                  <Link to="/login" className="w-full py-4 rounded-xl bg-[var(--p)] text-black flex items-center justify-center gap-4 font-bold text-[14px] shadow-lg shadow-gold/20">
                    <FiUser size={18} /> Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}