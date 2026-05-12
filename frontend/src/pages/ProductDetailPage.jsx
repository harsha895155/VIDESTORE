import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI, reviewAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FiHeart, FiShare2, FiCheck, FiTruck, FiRefreshCw,
  FiShield, FiXCircle, FiPlay, FiPause,
  FiChevronLeft, FiChevronRight, FiMinus, FiPlus, FiShoppingCart,
  FiZoomIn, FiX, FiInfo, FiZap
} from 'react-icons/fi';

const PRIMARY = 'var(--p)';

/* ── Inject page-level styles once ─────────────────────────────── */
const injectDetailStyles = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('pdp-styles')) return;
  const s = document.createElement('style');
  s.id = 'pdp-styles';
  s.textContent = `
    /* ── Main image card ── */
    .pdp-main-card {
      position: relative;
      border-radius: 24px;
      overflow: hidden;
      background: var(--card);
      border: 1px solid var(--b);
      aspect-ratio: 2/3;
      box-shadow: 0 10px 40px rgba(0,0,0,0.06);
    }

    .pdp-main-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      transition: transform 0.8s cubic-bezier(0.2, 0, 0, 1);
    }

    /* ── Size buttons ── */
    .pdp-size-btn {
      min-width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--b); border-radius: 12px; cursor: pointer;
      font-size: 12px; font-weight: 600; color: var(--tm);
      background: var(--card-alt); transition: all 0.3s ease; padding: 0 12px; font-family: inherit;
    }
    .pdp-size-btn:hover  { border-color: var(--p); color: var(--p); background: var(--card); }
    .pdp-size-btn.active { border-color: var(--p); background: var(--p); color: #000; box-shadow: 0 4px 15px rgba(200,166,70,0.3); }

    /* ── Color swatches ── */
    .pdp-color-swatch {
      width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
      border: 2px solid var(--card); transition: all 0.3s ease; position: relative; flex-shrink: 0;
      box-shadow: 0 0 0 1px var(--b);
    }
    .pdp-color-swatch.active {
      box-shadow: 0 0 0 2px var(--p); transform: scale(1.15);
    }

    /* ── Tab underline ── */
    .pdp-tab {
      position: relative; padding: 16px 0; font-size: 11px; font-weight: 700;
      letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer;
      background: none; border: none; font-family: inherit; color: var(--tm); transition: color 0.3s;
    }
    .pdp-tab.active { color: var(--p); }
    .pdp-tab::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0;
      height: 2px; background: var(--p); transform: scaleX(0); transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1); border-radius: 2px;
    }
    .pdp-tab.active::after { transform: scaleX(1); }

    /* ── Review card ── */
    .pdp-review-card {
      padding: 24px; border-radius: 20px;
      margin-bottom: 16px; transition: all 0.3s ease;
      background: var(--card);
      border: 1px solid var(--b);
    }
    .pdp-review-card:hover { border-color: var(--p); box-shadow: var(--shadow-premium); }

    /* ── Perk cards ── */
    .pdp-perk {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px;
      background: var(--card-alt); border: 1px solid var(--b); transition: all 0.3s;
    }
    .pdp-perk:hover { background: var(--card); border-color: var(--p); }

    /* ── Qty stepper ── */
    .pdp-qty-btn {
      width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
      background: var(--card); border: 1px solid var(--b);
      color: var(--t); cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .pdp-qty-btn:hover { border-color: var(--p); color: var(--p); background: var(--card-alt); }

    /* ── Breadcrumb ── */
    .pdp-crumb { font-size: 11px; color: var(--tm); text-decoration: none; transition: color 0.2s; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
    .pdp-crumb:hover { color: var(--p); }

    /* ── Skeleton ── */
    .pdp-skel { background: var(--card-alt); border-radius: 16px; animation: pdp-skel-pulse 1.4s ease-in-out infinite; }
    @keyframes pdp-skel-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }

    /* ── Size Guide Modal ── */
    .pdp-sg-overlay {
      position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.6);
      backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .pdp-sg-modal {
      background: var(--card); width: 100%; max-width: 540px; border-radius: 28px;
      box-shadow: var(--shadow-lg); overflow: hidden; border: 1px solid var(--b);
    }
    .pdp-sg-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    .pdp-sg-table th { text-align: left; padding: 12px; border-bottom: 2px solid var(--b); font-size: 10px; text-transform: uppercase; color: var(--tm); letter-spacing: 0.1em; font-weight: 700; }
    .pdp-sg-table td { padding: 14px 12px; border-bottom: 1px solid var(--b); font-size: 13px; color: var(--t); }
  `;
  document.head.appendChild(s);
};

/* ── Default size measurements ── */
const SIZE_MEASUREMENTS = {
  XS: { chest: '32–33"', waist: '24–25"', hips: '34–35"', length: '25"' },
  S: { chest: '34–35"', waist: '26–27"', hips: '36–37"', length: '26"' },
  M: { chest: '36–37"', waist: '28–29"', hips: '38–39"', length: '27"' },
  L: { chest: '38–40"', waist: '30–32"', hips: '40–42"', length: '28"' },
  XL: { chest: '41–43"', waist: '33–35"', hips: '43–45"', length: '29"' },
  XXL: { chest: '44–46"', waist: '36–38"', hips: '46–48"', length: '30"' },
  'Free Size': { chest: '32–42"', waist: '24–36"', hips: '34–46"', length: 'Adjustable' },
};

/* ── Size Guide Modal ── */
function SizeGuideModal({ sizes, sizeGuide, onClose }) {
  const mergedMeasurements = { ...SIZE_MEASUREMENTS, ...(sizeGuide || {}) };
  const displaySizes = (sizes?.length > 0 ? sizes : Object.keys(mergedMeasurements))
    .filter(sz => mergedMeasurements[sz]);

  return (
    <div className="pdp-sg-overlay" onClick={onClose}>
      <motion.div
        className="pdp-sg-modal"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--b)' }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--p)', fontWeight: 700, margin: '0 0 4px' }}>VideStore</p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t)', margin: 0 }}>Size Guide</h3>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--t-muted)' }}>
            <FiX size={16} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'var(--primary-glow)', border: '1px solid rgba(79, 70, 229, 0.15)', display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <FiInfo size={16} style={{ color: 'var(--p)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: '12px', color: 'var(--p)', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
              Measure chest at fullest point, waist at narrowest, and hips at fullest. All measurements in inches.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="pdp-sg-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest</th>
                  <th>Waist</th>
                  <th>Hips</th>
                  <th>Length</th>
                </tr>
              </thead>
              <tbody>
                {displaySizes.map(sz => {
                  const m = mergedMeasurements[sz];
                  return (
                    <tr key={sz}>
                      <td style={{ fontWeight: 700, color: '#111827' }}>{sz}</td>
                      <td>{m.chest || '—'}</td>
                      <td>{m.waist || '—'}</td>
                      <td>{m.hips || '—'}</td>
                      <td>{m.length || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #F3F4F6', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>If between sizes, we recommend sizing up for comfort.</p>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Video Player ── */
function VideoPlayer({ src, style }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [showCtrl, setShowCtrl] = useState(true);
  const hideTimer = useRef(null);

  const toggle = e => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play(); setPlaying(true);
      hideTimer.current = setTimeout(() => setShowCtrl(false), 1800);
    } else {
      v.pause(); setPlaying(false); setShowCtrl(true);
      clearTimeout(hideTimer.current);
    }
  };
  useEffect(() => () => clearTimeout(hideTimer.current), []);

  return (
    <div onClick={() => { setShowCtrl(true); if (playing) { clearTimeout(hideTimer.current); hideTimer.current = setTimeout(() => setShowCtrl(false), 1800); } }} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <video ref={videoRef} src={src} playsInline loop muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 'inherit' }} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <div onClick={toggle} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: showCtrl ? 1 : 0, transition: 'opacity 0.3s', background: playing && !showCtrl ? 'transparent' : 'rgba(0,0,0,0.15)', cursor: 'pointer', borderRadius: 'inherit' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff', border: `1px solid #E5E7EB`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {playing ? <FiPause size={18} color={PRIMARY} /> : <FiPlay size={18} color={PRIMARY} style={{ marginLeft: 2 }} />}
        </div>
      </div>
    </div>
  );
}

/* ── Stars ── */
function Stars({ rating, size = 12 }) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ fontSize: size, color: s <= Math.round(rating) ? 'var(--p)' : 'var(--b)' }}>★</span>
      ))}
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */
export default function ProductDetailPage() {
  injectDetailStyles();

  const { id } = useParams();
  const navigate = useNavigate();
  const reviewsRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [related, setRelated] = useState([]);
  const [activeMedia, setActiveMedia] = useState({ type: 'image', index: 0 });
  const [imgZoomed, setImgZoomed] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    Promise.all([productAPI.getById(id), reviewAPI.getByProduct(id)])
      .then(([pRes, rRes]) => {
        const p = pRes.product;
        setProduct(p);
        setReviews(rRes.reviews || []);
        if (p.colors?.[0]) setSelectedColor(p.colors[0].name);
        if (p.sizes?.[0]) setSelectedSize(p.sizes[0]);
        if (p.category) {
          productAPI.getAll({ category: p.category, limit: 5 })
            .then(r => setRelated((r.products || []).filter(x => x._id !== id).slice(0, 4)));
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!product) return;
    document.title = `${product.name} | VideStore`;
  }, [product]);

  const handleReadReviews = e => {
    e.preventDefault();
    setActiveTab('reviews');
    setTimeout(() => {
      reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleAddToCart = async () => {
    if (product.sizes?.length && !selectedSize) { toast.error('Please select a size'); return; }
    setAddingCart(true);
    try {
      await addToCart(product._id, selectedSize, selectedColor, quantity);
      toast.success('Added to cart');
    } catch (err) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (product.sizes?.length && !selectedSize) { toast.error('Please select a size'); return; }
    setBuyingNow(true);
    try {
      await addToCart(product._id, selectedSize, selectedColor, quantity);
      navigate('/checkout');
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setBuyingNow(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch (e) { if (e.name !== 'AbortError') toast.error('Share failed'); }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied!');
      } catch { toast.error('Copy failed'); }
    }
  };

  const handleReview = async e => {
    e.preventDefault();
    if (!isLoggedIn) { toast.error('Please login to review'); return; }
    setSubmitting(true);
    try {
      const res = await reviewAPI.create({ productId: id, ...reviewForm });
      setReviews(prev => [res.review, ...prev]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (err) { toast.error(err.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', padding: '40px 16px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: 40 }} className="lg:grid-cols-2">
        <div className="pdp-skel" style={{ width: '100%', aspectRatio: '2/3', borderRadius: 24 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[80, 55, 40, 65, 45, 75, 40].map((w, i) => (
            <div key={i} className="pdp-skel" style={{ height: i === 0 ? 32 : 14, width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '80px 16px', minHeight: '100vh' }}>
      <p style={{ color: '#6B7280', fontSize: 16, marginBottom: 24 }}>Product not found</p>
      <Link to="/shop" style={{ background: PRIMARY, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700, padding: '12px 24px', borderRadius: 12 }}>Back to Shop</Link>
    </div>
  );

  const images = product.images?.length > 0 ? product.images : [{ url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600' }];
  const videos = product.videos || [];
  const allMedia = [
    ...images.map((img, i) => ({ type: 'image', index: i, url: img.url })),
    ...videos.map((vid, i) => ({ type: 'video', index: i, url: vid.url })),
  ];

  const hasDiscount = product.discountPrice != null && product.discountPrice > 0;
  const effectivePrice = hasDiscount ? product.discountPrice : product.price;
  const discountPct = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : null;

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0px 24px 20px' }}>
        
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Link to="/" className="pdp-crumb">Home</Link>
          <FiChevronRight size={10} style={{ color: 'var(--b)' }} />
          <Link to="/shop" className="pdp-crumb">Collection</Link>
          <FiChevronRight size={10} style={{ color: 'var(--b)' }} />
          <span style={{ fontSize: '11px', color: 'var(--t)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{product.name}</span>
        </nav>

        <div style={{ display: 'grid', gap: 24 }} className="lg:grid-cols-2">
          
          {/* Gallery */}
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 80 }} className="hidden sm:flex">
              {allMedia.map((m, i) => (
                <button key={i} onClick={() => setActiveMedia({ type: m.type, index: m.index })}
                  style={{ width: '100%', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', border: `2px solid ${activeMedia.index === m.index && activeMedia.type === m.type ? PRIMARY : '#F3F4F6'}`, background: '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {m.type === 'image' ? <img src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPlay size={20} color={PRIMARY} /></div>}
                </button>
              ))}
            </div>

            <div className="pdp-main-card" style={{ flex: 1 }}>
              <AnimatePresence mode="wait">
                {activeMedia.type === 'image' ? (
                  <motion.img key={`img-${activeMedia.index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} src={allMedia.find(m => m.type === 'image' && m.index === activeMedia.index)?.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <motion.div key={`vid-${activeMedia.index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: '100%' }}>
                    <VideoPlayer src={allMedia.find(m => m.type === 'video' && m.index === activeMedia.index)?.url} style={{ height: '100%' }} />
                  </motion.div>
                )}
              </AnimatePresence>
              <button onClick={() => setImgZoomed(true)} style={{ position: 'absolute', bottom: '20px', right: '20px', width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', border: '1px solid var(--b)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-premium)', transition: 'all 0.3s' }}>
                <FiZoomIn size={22} color="var(--t)" />
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--p)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>{product.brand || 'Exclusive'}</p>
              <h1 className="serif" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: 'var(--t)', marginBottom: '12px', lineHeight: 1.1 }}>{product.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Stars rating={product.ratings} size={14} />
                <span style={{ fontSize: '12px', color: 'var(--t-muted)', fontWeight: 500 }}>{product.numReviews} Reviews</span>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--t)', letterSpacing: '-0.02em' }}>₹{effectivePrice?.toLocaleString()}</span>
                {hasDiscount && <span style={{ fontSize: '18px', color: 'var(--t-muted)', textDecoration: 'line-through', opacity: 0.5 }}>₹{product.price?.toLocaleString()}</span>}
                {discountPct && <div style={{ padding: '4px 10px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: '40px', fontSize: '11px', fontWeight: 700 }}>{discountPct}% OFF</div>}
              </div>
            </div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Color: <span style={{ color: 'var(--t)', fontWeight: 700 }}>{selectedColor}</span></p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {product.colors.map(c => (
                    <button key={c.name} onClick={() => setSelectedColor(c.name)} className={`pdp-color-swatch ${selectedColor === c.name ? 'active' : ''}`} style={{ background: c.hex, border: 'none' }} title={c.name} />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Select Size: <span style={{ color: 'var(--t)', fontWeight: 700 }}>{selectedSize}</span></p>
                  <button onClick={() => setSizeGuideOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--p)', fontSize: '10px', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Size Guide</button>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {product.sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} className={`pdp-size-btn ${selectedSize === s ? 'active' : ''}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Quantity</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--card-alt)', borderRadius: '10px', border: '1px solid var(--b)', padding: '2px' }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="pdp-qty-btn" style={{ border: 'none' }}><FiMinus size={14} /></button>
                  <span style={{ width: '32px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--t)' }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="pdp-qty-btn" style={{ border: 'none' }}><FiPlus size={14} /></button>
                </div>
                <div>
                   <p style={{ fontSize: '12px', color: product.stock < 10 ? '#EF4444' : '#10B981', fontWeight: 700, margin: 0 }}>
                    {product.stock < 10 ? `Only ${product.stock} left` : 'In Stock'}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--t-muted)', margin: '2px 0 0' }}>Express Shipping</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <button onClick={handleAddToCart} disabled={addingCart} className="btn-premium" style={{ flex: 1, height: '44px', fontSize: '13px' }}>
                <FiShoppingCart size={18} /> {addingCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button onClick={() => toggleWishlist(product._id)} style={{ width: '44px', height: '44px', borderRadius: '12px', border: '1px solid var(--b)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isWishlisted(product._id) ? '#EF4444' : 'var(--t-muted)', transition: 'all 0.3s', boxShadow: 'var(--shadow-premium)' }}>
                <FiHeart size={22} fill={isWishlisted(product._id) ? 'currentColor' : 'none'} />
              </button>
            </div>
            <button onClick={handleBuyNow} disabled={buyingNow} style={{ width: '100%', height: '44px', background: 'var(--card-alt)', color: 'var(--t)', border: '1px solid var(--b)', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginBottom: '32px', letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'all 0.3s' }}>
              {buyingNow ? 'Redirecting...' : 'Buy Now'}
            </button>

            {/* Perks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="pdp-perk">
                <FiTruck size={18} color="var(--p)" />
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--t)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Free Delivery</p>
                  <p style={{ fontSize: '10px', color: 'var(--t-muted)', margin: '2px 0 0' }}>Over ₹999</p>
                </div>
              </div>
              <div className="pdp-perk">
                <FiRefreshCw size={18} color="var(--p)" />
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--t)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Easy Returns</p>
                  <p style={{ fontSize: '10px', color: 'var(--t-muted)', margin: '2px 0 0' }}>7-day policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginTop: '64px' }}>
          <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--b)', marginBottom: '32px' }}>
            {['description', 'reviews', 'shipping'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`pdp-tab ${activeTab === t ? 'active' : ''}`}>{t}</button>
            ))}
          </div>

          <div style={{ maxWidth: '900px' }}>
            {activeTab === 'description' && (
              <div style={{ color: 'var(--t)', lineHeight: 1.8 }}>
                <p className="serif" style={{ fontSize: '16px', marginBottom: '24px', color: 'var(--t)' }}>{product.description}</p>
                <div style={{ display: 'grid', gap: '20px' }} className="sm:grid-cols-2">
                  <div style={{ background: 'var(--bg-alt)', padding: '20px', borderRadius: '12px', border: '1px solid var(--b)' }}>
                    <h4 style={{ fontSize: '10px', fontWeight: 700, color: 'var(--p)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Material & Care</h4>
                    <p style={{ fontSize: '13px', margin: 0, color: 'var(--t)', fontWeight: 500 }}>{product.material || 'Premium Fabric'}</p>
                    <p style={{ fontSize: '12px', margin: '8px 0 0', color: 'var(--t-muted)' }}>{product.careInstructions || 'Dry clean only'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div ref={reviewsRef}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40, flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 36, fontWeight: 800, color: 'var(--t)', margin: 0 }}>{product.ratings?.toFixed(1)}</p>
                    <Stars rating={product.ratings} size={14} />
                    <p style={{ fontSize: 12, color: 'var(--t-muted)', marginTop: 4 }}>{product.numReviews} Reviews</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    {[5, 4, 3, 2, 1].map(star => (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, width: 12, color: 'var(--t-muted)' }}>{star}</span>
                        <div style={{ flex: 1, height: 4, background: 'var(--card-alt)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: '#FBBF24', width: `${(reviews.filter(r => Math.round(r.rating) === star).length / (reviews.length || 1)) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {isLoggedIn && (
                  <form onSubmit={handleReview} style={{ background: 'var(--card)', padding: '24px', borderRadius: '16px', marginBottom: '40px', border: '1px solid var(--b)' }}>
                    <h3 className="serif" style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--t)' }}>Add a Review</h3>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: s <= reviewForm.rating ? 'var(--p)' : 'var(--b)', transition: 'transform 0.2s' }}>★</button>
                      ))}
                    </div>
                    <input required placeholder="Review Title" value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--b)', background: 'var(--bg)', marginBottom: '12px', outline: 'none', fontSize: '13px', color: 'var(--t)' }} />
                    <textarea required placeholder="Your thoughts..." rows={3} value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--b)', background: 'var(--bg)', marginBottom: '16px', outline: 'none', resize: 'none', fontSize: '13px', color: 'var(--t)' }} />
                    <button disabled={submitting} type="submit" className="btn-premium" style={{ padding: '0 24px', height: '40px', fontSize: '12px' }}>{submitting ? 'Sharing...' : 'Submit Review'}</button>
                  </form>
                )}

                <div style={{ display: 'grid', gap: 20 }}>
                  {reviews.map(r => (
                    <div key={r._id} className="pdp-review-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div>
                          <Stars rating={r.rating} size={12} />
                          <p style={{ fontWeight: 700, fontSize: '14px', margin: '4px 0 2px', color: 'var(--t)' }}>{r.title}</p>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--tm)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p style={{ color: 'var(--tm)', fontSize: '13px', margin: '0 0 12px' }}>{r.comment}</p>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--t)' }}>- {r.user?.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div style={{ marginTop: '100px', borderTop: '1px solid var(--b)', paddingTop: '80px' }}>
            <h2 className="serif" style={{ fontSize: '32px', marginBottom: '48px', color: 'var(--t)' }}>Curated For You</h2>
            <div style={{ display: 'grid', gap: '32px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {related.map(p => (
                <Link key={p._id} to={`/product/${p._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--b)', borderRadius: '24px', overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)', boxShadow: 'var(--shadow-premium)' }}>
                    <div style={{ aspectRatio: '4/5', overflow: 'hidden' }}>
                      <img src={p.images?.[0]?.url} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }} className="hover-zoom" />
                    </div>
                    <div style={{ padding: '24px' }}>
                      <p style={{ fontSize: '10px', color: 'var(--p)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{p.brand}</p>
                      <h4 className="serif" style={{ color: 'var(--t)', margin: '0 0 12px', fontSize: '18px' }}>{p.name}</h4>
                      <p style={{ fontWeight: 800, color: 'var(--t)', margin: 0, fontSize: '16px' }}>₹{p.price?.toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {imgZoomed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setImgZoomed(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={allMedia.find(m => m.type === 'image' && m.index === activeMedia.index)?.url} style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sizeGuideOpen && <SizeGuideModal sizes={product.sizes} sizeGuide={product.sizeGuide} onClose={() => setSizeGuideOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}