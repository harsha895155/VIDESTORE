import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { FiFilter, FiX, FiChevronDown, FiSearch, FiCheck, FiArrowRight } from 'react-icons/fi';
import { getSubCategoryNames } from '../constants/categories';

const CATEGORIES = ['Men', 'Women', 'Streetwear', 'Accessories', 'Kids'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
];

/* ─── Inject shop grid styles once ───────────────────────────────────── */
const injectShopStyles = () => {
  if (typeof document === 'undefined') return;
  const old = document.getElementById('shop-grid-styles'); if (old) old.remove();
  const s = document.createElement('style');
  s.id = 'shop-grid-styles';
  s.textContent = `
    .product-grid-shop {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(1, 1fr);
    }
    @media (min-width: 640px) {
      .product-grid-shop { grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 1024px) {
      .product-grid-shop { gap: 24px; grid-template-columns: repeat(3, 1fr); }
    }
    @media (min-width: 1536px) {
      .product-grid-shop { gap: 32px; grid-template-columns: repeat(3, 1fr); }
    }

    .shop-skel-card {
      border-radius: 20px; overflow: hidden;
      background: #0D0D0F;
      border: 1px solid #232323;
    }
    .shop-skel-img {
      width: 100%; aspect-ratio: 1;
      background: #070707;
      animation: shopSkPulse 1.4s ease-in-out infinite;
    }
    @keyframes shopSkPulse { 0%,100%{opacity:0.6;}50%{opacity:1;} }

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
      border: 1.5px solid #232323;
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
      background: #070707;
      border: 1px solid #232323;
      border-radius: 12px;
      padding: 12px 16px;
      color: #F5F3EE;
      font-size: 13px;
      outline: none;
      transition: all 0.3s;
    }
    .price-input:focus { border-color: var(--p); box-shadow: 0 0 0 2px rgba(200, 166, 70, 0.1); }

    .size-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #070707;
      border: 1px solid #232323;
      color: #7F7765;
      font-size: 10px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .size-btn:hover { border-color: var(--p); color: #F5F3EE; }
    .size-btn.active { background: var(--p); border-color: var(--p); color: #040404; }

    .search-input-shop {
      width: 100%;
      background: #0D0D0F;
      border: 1px solid #232323;
      border-radius: 12px;
      padding: 12px 16px 12px 42px;
      color: #F5F3EE;
      font-size: 14px;
      outline: none;
      transition: all 0.3s;
    }
    .search-input-shop:focus { border-color: var(--p); background: #121214; }
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
    <div ref={ref} style={{ position: 'relative', minWidth: '160px' }}>
      <button onClick={() => setOpen(p => !p)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '10px', width: '100%', padding: '10px 18px',
        background: 'var(--card)', border: `1px solid ${open ? 'var(--p)' : 'var(--b)'}`,
        borderRadius: '12px', color: 'var(--t)', fontSize: '10px', fontWeight: 900,
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
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 200,
              minWidth: '200px', background: 'var(--card)', border: '1px solid var(--b)',
              borderRadius: '16px', padding: '6px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            {SORT_OPTIONS.map(opt => {
              const active = opt.value === value;
              return (
                <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '10px', width: '100%', padding: '10px 14px', borderRadius: '10px',
                    background: active ? 'var(--p)' : 'transparent', border: 'none',
                    color: active ? '#040404' : 'var(--tm)', fontSize: '11px', fontWeight: 700,
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}
                >
                  <span>{opt.label}</span>
                  {active && <FiCheck size={12} />}
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
        width: '100%', marginBottom: open ? '16px' : '0',
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      }}>
        <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--t)' }}>{title}</span>
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

/* ─── Pill Button ─────────────────────────────────────────────────────── */
function PillBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 24px', fontSize: '11px', borderRadius: '12px',
      background: active ? 'var(--p)' : '#0D0D0F',
      border: `1px solid ${active ? 'var(--p)' : '#232323'}`,
      color: active ? '#040404' : '#B8B1A1',
      cursor: 'pointer', fontFamily: 'inherit',
      fontWeight: 800, letterSpacing: '0.05em', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.3s',
      textTransform: 'uppercase'
    }}>
      {label}
    </button>
  );
}

/* ─── Skeleton Grid ───────────────────────────────────────────────────── */
function ShopSkeletonGrid() {
  return (
    <div className="product-grid-shop">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="shop-skel-card" style={{ height: '400px' }}>
          <div className="shop-skel-img" />
        </div>
      ))}
    </div>
  );
}

/* ─── Main ShopPage ───────────────────────────────────────────────────── */
export default function ShopPage() {
  injectShopStyles();

  const { category: urlCategory } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: urlCategory ? urlCategory.charAt(0).toUpperCase() + urlCategory.slice(1) : searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    subCategory: '',
    minPrice: '',
    maxPrice: '',
    sizes: [],
    sort: 'newest',
    page: 1,
  });

  useEffect(() => {
    const newCategory = urlCategory ? urlCategory.charAt(0).toUpperCase() + urlCategory.slice(1) : searchParams.get('category') || '';
    const newSearch = searchParams.get('search') || '';
    setFilters(prev => ({ ...prev, category: newCategory, search: newSearch, subCategory: '', page: 1 }));
  }, [location.pathname, location.search, urlCategory, searchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, search: filters.subCategory || filters.search };
      if (filters.sizes.length) params.size = filters.sizes.join(',');
      const res = await productAPI.getAll(params);
      setProducts(res.products);
      setPagination(res.pagination);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
  const toggleSize = size => setFilters(prev => ({ ...prev, sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size], page: 1 }));
  const clearFilters = () => setFilters({ category: '', search: '', subCategory: '', minPrice: '', maxPrice: '', sizes: [], sort: 'newest', page: 1 });
  const subCategoryNames = filters.category ? getSubCategoryNames(filters.category) : [];

  const FiltersPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4 style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--tm)', textTransform: 'uppercase', margin: 0 }}>Filters</h4>
        <button onClick={clearFilters} style={{ background: 'none', border: '1px solid var(--p)', color: 'var(--p)', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', padding: '5px 10px', borderRadius: '100px' }}>Clear</button>
      </div>

      <FilterSection title="Category">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[...CATEGORIES, 'All'].map(cat => {
            const val = cat === 'All' ? '' : cat;
            const active = filters.category === val;
            return (
              <label key={cat} className="sidebar-radio">
                <input type="radio" checked={active} onChange={() => updateFilter('category', val)} />
                <div className="radio-dot"><div className="radio-dot-inner" /></div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: active ? 'var(--t)' : 'var(--tm)', transition: 'all 0.2s' }}>{cat}</span>
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
        <div style={{ marginBottom: '16px' }}>
          <h1 className="serif" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--t)' }}>
            {filters.category || 'Collections'}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
              <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--tm)', zIndex: 1 }} size={16} />
              <input 
                type="text" 
                placeholder="Search styles..." 
                className="search-input-shop"
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value, subCategory: '', page: 1 }))}
                style={{ paddingLeft: '44px' }}
              />
            </div>
            
            <button 
              onClick={() => setFiltersOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--card)', border: '1px solid var(--b)', borderRadius: '12px', padding: '10px 18px', color: 'var(--t)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}
            >
              <FiFilter size={14} /> Filters
            </button>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'var(--p)/5', borderRadius: '100px', border: '1px solid var(--p)/10' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--p)' }}>{pagination.total} products</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--tm)' }}>Sort By</span>
                <SortDropdown value={filters.sort} onChange={v => updateFilter('sort', v)} />
              </div>
            </div>
          </div>

          {/* Subcategory Pills */}
          {filters.category && subCategoryNames.length > 0 && (
            <div style={{ marginTop: '32px', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ display: 'flex', gap: '12px', width: 'max-content' }}>
                <PillBtn label={`All ${filters.category}`} active={!filters.subCategory} onClick={() => updateFilter('subCategory', '')} />
                {subCategoryNames.map(sub => (
                  <PillBtn key={sub} label={sub} active={filters.subCategory === sub}
                    onClick={() => setFilters(prev => ({ ...prev, subCategory: prev.subCategory === sub ? '' : sub, search: '', page: 1 }))} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '60px', alignItems: 'flex-start' }}>
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block" style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '160px' }}>
            <FiltersPanel />
          </aside>

          {/* Product Grid */}
          <div style={{ flex: 1 }}>
            {loading ? <ShopSkeletonGrid /> : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px 0', background: 'var(--card)', borderRadius: '32px', border: '1px solid var(--b)' }}>
                <FiSearch size={48} style={{ color: 'var(--p)', opacity: 0.1, marginBottom: '24px' }} />
                <h3 className="serif" style={{ fontSize: '24px', fontWeight: 900, marginBottom: '10px' }}>No products found</h3>
                <p style={{ color: 'var(--tm)', fontSize: '14px', maxWidth: '360px', margin: '0 auto' }}>Try adjusting your filters or keywords.</p>
              </div>
            ) : (
              <>
                <div className="product-grid-shop">
                  {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
                </div>

                {pagination.pages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '80px' }}>
                    {[...Array(pagination.pages)].map((_, i) => {
                      const page = i + 1;
                      const active = filters.page === page;
                      return (
                        <button key={page} onClick={() => updateFilter('page', page)} style={{
                          width: '42px', height: '42px', borderRadius: '12px', fontSize: '12px',
                          background: active ? 'var(--p)' : '#0D0D0F',
                          color: active ? '#040404' : '#F5F3EE',
                          border: `1px solid ${active ? 'var(--p)' : '#232323'}`,
                          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 900, transition: 'all 0.3s',
                        }}>{page}</button>
                      );
                    })}
                  </div>
                )}
              </>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--t)', margin: 0 }}>Filters</h2>
                <button onClick={() => setFiltersOpen(false)} style={{ background: 'var(--bg-alt)', border: 'none', cursor: 'pointer', color: 'var(--t)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiX size={18} />
                </button>
              </div>
              <FiltersPanel />
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}