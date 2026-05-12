import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { FiFilter, FiX, FiChevronDown, FiSearch, FiCheck, FiArrowRight } from 'react-icons/fi';

const CATEGORIES = ['Men', 'Women', 'Streetwear', 'Accessories', 'Kids'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
];

/* ─── Inject offer page styles ───────────────────────────────────────── */
const injectOfferStyles = () => {
  if (typeof document === 'undefined') return;
  const old = document.getElementById('offer-page-styles'); if (old) old.remove();
  const s = document.createElement('style');
  s.id = 'offer-page-styles';
  s.textContent = `
    .offer-grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(1, 1fr);
    }
    @media (min-width: 640px) {
      .offer-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 1024px) {
      .offer-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (min-width: 1536px) {
      .offer-grid { gap: 32px; grid-template-columns: repeat(4, 1fr); }
    }

    .sidebar-radio {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 4px 0;
    }
    .sidebar-radio input { display: none; }
    .radio-dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 1.5px solid var(--b);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }
    .sidebar-radio:hover .radio-dot { border-color: var(--p); }
    .sidebar-radio input:checked + .radio-dot {
      border-color: var(--p);
      background: rgba(200, 166, 70, 0.1);
    }
    .radio-dot-inner {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--p);
      transform: scale(0);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .sidebar-radio input:checked + .radio-dot .radio-dot-inner { transform: scale(1); }

    .price-input {
      width: 100%;
      background: var(--bg-alt);
      border: 1px solid var(--b);
      border-radius: 12px;
      padding: 12px 16px;
      color: var(--t);
      font-size: 13px;
      outline: none;
      transition: all 0.3s;
    }
    .price-input:focus { border-color: var(--p); box-shadow: 0 0 0 2px rgba(200, 166, 70, 0.1); }

    .size-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--bg-alt);
      border: 1px solid var(--b);
      color: var(--tm);
      font-size: 10px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .size-btn:hover { border-color: var(--p); color: var(--t); }
    .size-btn.active { background: var(--p); border-color: var(--p); color: var(--bg); }

    .search-bar-wrap {
      position: relative;
      flex: 1;
      max-width: 600px;
    }
    .search-input {
      width: 100%;
      background: var(--card);
      border: 1px solid var(--b);
      border-radius: 16px;
      padding: 14px 20px 14px 48px;
      color: var(--t);
      font-size: 14px;
      font-weight: 500;
      outline: none;
      transition: all 0.3s;
    }
    .search-input:focus { border-color: var(--p); background: #121214; }
  `;
  document.head.appendChild(s);
};

/* ─── Sort Dropdown ──────────────────────────────────────────────────── */
function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = SORT_OPTIONS.find(o => o.value === value);
  useEffect(() => {
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative', minWidth: '180px' }}>
      <button onClick={() => setOpen(p => !p)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px', width: '100%', padding: '12px 20px',
        background: '#0D0D0F', border: `1px solid ${open ? 'var(--p)' : '#232323'}`,
        borderRadius: '14px', color: '#F5F3EE', fontSize: '11px', fontWeight: 900,
        textTransform: 'uppercase', letterSpacing: '0.1em',
        fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.3s',
      }}>
        <span>{current?.label}</span>
        <FiChevronDown size={14} style={{ color: 'var(--p)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 100,
              minWidth: '220px', background: '#0D0D0F', border: '1px solid #232323',
              borderRadius: '18px', padding: '8px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            {SORT_OPTIONS.map(opt => {
              const active = opt.value === value;
              return (
                <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '12px', width: '100%', padding: '12px 16px', borderRadius: '12px',
                    background: active ? 'var(--p)' : 'transparent', border: 'none',
                    color: active ? '#040404' : '#B8B1A1', fontSize: '12px', fontWeight: 700,
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}
                >
                  <span>{opt.label}</span>
                  {active && <FiCheck size={14} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Collapsible Filter Section ─────────────────────────────────────── */
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(p => !p)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', marginBottom: open ? '24px' : '0',
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      }}>
        <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#F5F3EE' }}>{title}</span>
        <FiChevronDown size={14} style={{ color: 'var(--p)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="c"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OffersPage() {
  injectOfferStyles();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: '',
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
    sizes: [],
    sort: 'newest',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll({ ...filters, limit: 100 });
      const onOffer = res.products.filter(p => p.discountPrice && p.discountPrice < p.price);
      setProducts(onOffer);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const toggleSize = size => setFilters(prev => ({ ...prev, sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size] }));
  const clearFilters = () => setFilters({ category: '', search: '', minPrice: '', maxPrice: '', sizes: [], sort: 'newest' });

  const FiltersContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4 style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', color: '#7F7765', textTransform: 'uppercase', margin: 0 }}>Filters</h4>
        <button onClick={clearFilters} style={{ background: 'none', border: '1px solid var(--p)', color: 'var(--p)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', padding: '6px 12px', borderRadius: '100px' }}>Clear All</button>
      </div>

      <FilterSection title="Category">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[...CATEGORIES, 'All Categories'].map(cat => {
            const val = cat === 'All Categories' ? '' : cat;
            const active = filters.category === val;
            return (
              <label key={cat} className="sidebar-radio">
                <input type="radio" checked={active} onChange={() => updateFilter('category', val)} />
                <div className="radio-dot"><div className="radio-dot-inner" /></div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: active ? '#F5F3EE' : '#B8B1A1', transition: 'all 0.2s' }}>{cat}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} className="price-input" />
          <div style={{ width: '12px', height: '1px', background: '#232323' }} />
          <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} className="price-input" />
        </div>
      </FilterSection>

      <FilterSection title="Size">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {SIZES.map(size => (
            <button key={size} onClick={() => toggleSize(size)} className={`size-btn ${filters.sizes.includes(size) ? 'active' : ''}`}>
              {size}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#040404', color: '#F5F3EE', padding: '0px 0 60px' }}>
      
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '8px' }}>
          <h1 className="serif" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.02em' }}>Special Offers</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div className="search-bar-wrap">
              <FiSearch style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#7F7765', zIndex: 1 }} size={18} />
              <input 
                type="text" 
                placeholder="Search products, brands or tags..." 
                className="search-input"
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
              />
            </div>
            
            <button 
              onClick={() => setFiltersOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#0D0D0F', border: '1px solid #232323', borderRadius: '12px', padding: '12px 20px', color: '#F5F3EE', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}
            >
              <FiFilter size={16} /> Filters
            </button>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(200, 166, 70, 0.05)', borderRadius: '100px', border: '1px solid rgba(200, 166, 70, 0.1)' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--p)' }}>{products.length} products</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7F7765' }}>Sort</span>
                <SortDropdown value={filters.sort} onChange={v => updateFilter('sort', v)} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '60px', alignItems: 'flex-start' }}>
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block" style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '140px' }}>
            <FiltersContent />
          </aside>

          {/* Product Grid */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div className="offer-grid">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '400px', borderRadius: '24px', background: '#0D0D0F' }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '120px 0', background: '#0D0D0F', borderRadius: '40px', border: '1px solid #232323' }}>
                <FiSearch size={64} style={{ color: 'var(--p)', opacity: 0.1, marginBottom: '32px' }} />
                <h3 className="serif" style={{ fontSize: '24px', fontWeight: 900, marginBottom: '10px' }}>No Offers Found</h3>
                <p style={{ color: '#7F7765', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>Adjust your filters or check back later for exclusive deals.</p>
              </div>
            ) : (
              <div className="offer-grid">
                {products.map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{ position: 'fixed', right: 0, top: 0, height: '100%', width: '100%', maxWidth: '400px', zIndex: 110, padding: '40px', overflowY: 'auto', background: '#0D0D0F', borderLeft: '1px solid #232323', boxShadow: '-20px 0 40px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#F5F3EE', margin: 0 }}>Refine Selection</h2>
                <button onClick={() => setFiltersOpen(false)} style={{ background: '#121214', border: 'none', cursor: 'pointer', color: '#F5F3EE', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiX size={20} />
                </button>
              </div>
              <FiltersContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
