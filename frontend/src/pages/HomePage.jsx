import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { FiArrowRight } from 'react-icons/fi';
import womenTraditional from '../assets/images/women_traditional.png';
import womenStylish from '../assets/images/women_stylish.png';

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=90',
    tag: 'New Collection', title: 'Autumn\nWinter\n2026',
    subtitle: 'Upgrade your wardrobe with timeless pieces made for everyone.',
    cta: 'Explore Collection', link: '/shop',
  },
  {
    image: womenStylish, tag: 'VideStore Fusion', title: 'Modern\nTraditional\nFusion',
    subtitle: 'Where tradition meets modern style. Discover our unique collection.',
    cta: 'Shop Fusion', link: '/shop/women',
  },
  {
    image: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?w=1600&q=90',
    tag: 'Trending Now', title: 'Street\nHeritage\nSharp.',
    subtitle: 'Quality tailoring reimagined for a bold, stylish generation.',
    cta: 'Shop Trends', link: '/shop/men',
  },
];

const categories = [
  { name: 'Men', image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600&q=80', link: '/shop/men' },
  { name: 'Women', image: womenTraditional, link: '/shop/women' },
  { name: 'Streetwear', image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80', link: '/shop/streetwear' },
  { name: 'Accessories', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', link: '/shop/accessories' },
];

/* ─── One-time style injection ─────────────────────────────────── */
const injectHomeStyles = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('home-styles-v2')) return;
  const s = document.createElement('style');
  s.id = 'home-styles-v2';
  s.textContent = `
    /* ── Product grids ── */
    .product-grid-home {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(2, 1fr);
    }
    @media (min-width: 640px) {
      .product-grid-home { gap: 20px; }
    }
    @media (min-width: 768px) {
      .product-grid-home { gap: 24px; grid-template-columns: repeat(4, 1fr); }
    }

    /* ── Category grid ── */
    .cat-grid {
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(2, 1fr);
    }
    @media (min-width: 768px) {
      .cat-grid { grid-template-columns: repeat(4, 1fr); }
    }

    .cat-card {
      position: relative;
      overflow: hidden;
      border-radius: 20px;
      display: block;
      aspect-ratio: 1;
      text-decoration: none;
      background: var(--card);
      border: 1px solid var(--b);
      box-shadow: var(--shadow);
      transition: all 0.4s ease;
    }

    .cat-card:hover {
      box-shadow: var(--shadow-premium);
      transform: translateY(-4px);
      border-color: #0EA5E9;
    }

    .cat-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0.95;
    }

    .cat-card:hover img {
      transform: scale(1.08);
    }

    .cat-card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%);
    }

    .cat-card-text {
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 24px;
    }

    /* ── Skeleton ── */
    .home-skel-card {
      border-radius: 20px;
      overflow: hidden;
      background: var(--card);
      border: 1px solid var(--b);
    }
    .home-skel-img {
      width: 100%;
      aspect-ratio: 1;
      background: var(--bg-alt);
      animation: homeSk 1.4s ease-in-out infinite;
    }
    .home-skel-line {
      height: 10px;
      border-radius: 6px;
      background: var(--b-inner);
      animation: homeSk 1.4s ease-in-out infinite;
    }
    @keyframes homeSk { 0%,100%{opacity:0.6} 50%{opacity:1} }
  `;
  document.head.appendChild(s);
};

/* ─── Sub-components ────────────────────────────────────────────── */
function SectionHeader({ sup, title, link, linkLabel = 'View All' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div>
        <p style={{ fontSize: '8px', fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--p)', marginBottom: '6px' }}>{sup}</p>
        <h2 className="serif" style={{ fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 900, color: 'var(--t)', margin: 0, lineHeight: 1.1 }}>{title}</h2>
      </div>
      <Link to={link} style={{ color: 'var(--p)', textDecoration: 'none', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', borderBottom: '2px solid var(--p)' }}
        className="hover:gap-3 transition-all">
        {linkLabel} <FiArrowRight size={14} />
      </Link>
    </div>
  );
}

function SkeletonGrid({ count = 4 }) {
  return (
    <div className="product-grid-home">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="home-skel-card">
          <div className="home-skel-img" />
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="home-skel-line" style={{ width: '40%' }} />
            <div className="home-skel-line" style={{ width: '70%' }} />
            <div className="home-skel-line" style={{ width: '30%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────────── */
export default function HomePage() {
  injectHomeStyles();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide(s => (s + 1) % heroSlides.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    productAPI.getFeatured()
      .then(res => { setNewArrivals(res.newArrivals || []); setBestSellers(res.bestSellers || []); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const slide = heroSlides[currentSlide];

  return (
    <div style={{ backgroundColor: 'var(--bg)', color: 'var(--t)' }}>

      {/* ── Hero ── */}
      <section className="sm:px-6 md:px-8" style={{ padding: '20px 20px 0', backgroundColor: 'var(--bg)' }}>
        <div style={{ borderRadius: '24px', height: 'clamp(500px, 80vh, 900px)', background: 'var(--card-alt)', overflow: 'hidden', position: 'relative', border: '1px solid var(--b)', boxShadow: 'var(--shadow-lg)' }}>
          {heroSlides.map((s, i) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
              <img src={s.image} alt={s.title} className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />
            </div>
          ))}
          <div className="absolute inset-0 flex items-center">
            <div style={{ padding: '0 48px', width: '100%', maxWidth: '800px' }}>
              <motion.div key={currentSlide} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
                <div style={{ background: 'var(--p)', padding: '5px 14px', borderRadius: '100px', fontSize: '9px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px', display: 'inline-block', color: '#fff' }}>
                  {slide.tag}
                </div>
                <h1 className="serif text-white font-bold" style={{ fontSize: 'clamp(36px, 7vw, 72px)', lineHeight: 0.95, marginBottom: '20px' }}>
                  {slide.title.split('\n').map((line, li) => (
                    <span key={li} style={{ display: 'block' }}>{line}</span>
                  ))}
                </h1>
                <p className="text-white/80 hidden sm:block" style={{ fontSize: '16px', lineHeight: 1.6, marginBottom: '28px', maxWidth: '500px' }}>
                  {slide.subtitle}
                </p>
                <Link
                  to={slide.link}
                  className="btn-primary px-8 py-4"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '12px',
                    fontWeight: 800, fontSize: '11px',
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    borderRadius: '100px', textDecoration: 'none',
                    border: 'none',
                  }}
                >
                  {slide.cta} <FiArrowRight size={16} />
                </Link>
              </motion.div>
            </div>
          </div>
          {/* Slide Indicators */}
          <div style={{ position: 'absolute', bottom: '40px', left: '48px', display: 'flex', gap: '12px' }}>
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)}
                style={{
                  width: i === currentSlide ? '48px' : '8px',
                  height: '4px', borderRadius: '100px',
                  backgroundColor: i === currentSlide ? 'var(--p)' : 'rgba(255,255,255,0.3)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.5s ease',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="py-8 overflow-hidden border-y" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--b)' }}>
        <div className="marquee-track flex whitespace-nowrap">
            {['ELEGANCE REIMAGINED', 'ARTISANAL QUALITY', 'FREE GLOBAL SHIPPING', 'NEW ARRIVALS EVERY WEEK',
            'SECURE PAYMENTS', 'EXCLUSIVE OFFERS', 'CURATED FOR YOU', 'THE LUXURY STANDARD'].map((t, i) => (
              <span key={i} className="font-black text-[11px] tracking-[0.5em] uppercase mx-12 flex-shrink-0 flex items-center gap-4" style={{ color: 'var(--tm)', opacity: 0.4 }}>
                {t} <span className="w-1.5 h-1.5 rounded-full bg-[var(--p)]" />
              </span>
            ))}
        </div>
      </div>

      {/* ── Categories ── */}
      <section style={{ backgroundColor: 'var(--bg)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '16px 24px' }} className="sm:px-6">
          <SectionHeader sup="Shop by" title="Collections" link="/shop" linkLabel="View All" />
          <div className="cat-grid">
            {categories.map((cat, i) => (
              <motion.div key={cat.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}>
                <Link to={cat.link} className="cat-card group">
                  <img src={cat.image} alt={cat.name} loading="lazy" />
                  <div className="cat-card-overlay" />
                  <div className="cat-card-text">
                    <h3 className="serif text-white font-bold" style={{ fontSize: '28px', marginBottom: '8px' }}>{cat.name}</h3>
                    <span className="flex items-center gap-2 font-bold text-white/80 tracking-[0.2em] uppercase"
                      style={{ fontSize: '10px' }}>
                      Shop Now <FiArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── New Arrivals ── */}
      {(newArrivals.length > 0 || loading) && (
        <section className="py-16" style={{ backgroundColor: 'var(--bg-alt)', borderTop: '1px solid var(--b)', borderBottom: '1px solid var(--b)' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }} className="sm:px-6">
            <SectionHeader sup="Latest" title="New Arrivals" link="/shop?newArrival=true" />
            {loading ? <SkeletonGrid count={4} /> : (
              <div className="product-grid-home">
                {newArrivals.slice(0, 8).map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Banner ── */}
      <section className="relative overflow-hidden py-32">
        <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=90" alt="Campaign"
          className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative text-center text-white max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p style={{ fontWeight: 800, letterSpacing: '0.4em', textTransform: 'uppercase', fontSize: '11px', marginBottom: '20px' }}>Special Offer</p>
            <h2 className="serif font-bold mb-8" style={{ fontSize: 'clamp(36px, 7vw, 72px)', lineHeight: 1 }}>Summer Sale</h2>
              Upgrade your summer wardrobe with our curated selection of quality pieces.
            <Link to="/shop?sale=true" className="btn-primary px-12 py-5 bg-[#C8A646] text-black hover:bg-[#B88D2D]" style={{ border: 'none' }}>
              Shop the Collection <FiArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Best Sellers ── */}
      {(bestSellers.length > 0 || loading) && (
        <section className="py-16" style={{ backgroundColor: 'var(--bg)' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }} className="sm:px-6">
            <SectionHeader sup="Top Picks" title="Best Sellers" link="/shop?bestSeller=true" />
            {loading ? <SkeletonGrid count={4} /> : (
              <div className="product-grid-home">
                {bestSellers.slice(0, 8).map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section className="py-16 border-t" style={{ backgroundColor: 'var(--card-alt)', borderColor: 'var(--b)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }} className="sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {
              [
                { icon: '🚚', title: 'Free Shipping', desc: 'On all orders above ₹999' },
                { icon: '↩️', title: '30-Day Returns', desc: 'Easy returns' },
                { icon: '🔒', title: 'Secure Payment', desc: '100% encrypted' },
                { icon: '✨', title: 'Premium Quality', desc: 'Crafted with care' },
              ].map(f => (
                <div key={f.title} className="p-8 rounded-[1.5rem] border transition-all hover:shadow-2xl hover:-translate-y-2 group" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--b)' }}>
                  <div style={{ 
                    fontSize: '28px', 
                    marginBottom: '20px', 
                    background: 'var(--bg-alt)',
                    width: '60px', height: '60px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '16px',
                    border: '1px solid var(--b)'
                  }} className="group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h4 className="font-black text-sm tracking-tight mb-2" style={{ color: 'var(--t)' }}>{f.title}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--tm)' }}>{f.desc}</p>
                </div>
              ))
            }
          </div>
        </div>
      </section>

    </div>
  );
}