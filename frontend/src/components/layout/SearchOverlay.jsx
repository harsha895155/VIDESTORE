import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiArrowRight, FiClock, FiTrendingUp, FiArrowUpRight } from 'react-icons/fi';
import { productAPI } from '../../services/api';

const GOLD = '#C9A84C';
const TRENDING = ['Oversized T-Shirts', 'Cargo Pants', 'Summer Dresses', 'Slim Fit Shirts', 'Sneakers'];
const CATEGORIES = [
  { name: 'Men', emoji: '👔' },
  { name: 'Women', emoji: '👗' },
  { name: 'Streetwear', emoji: '🧢' },
  { name: 'Accessories', emoji: '👜' },
];

export default function SearchOverlay({ isOpen, onClose, isDark }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('videstore_searches') || '[]'); } catch { return []; }
  });
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const BG     = isDark ? '#111111' : '#fafafa';
  const CARD   = isDark ? '#1a1a1a' : '#fff';
  const BORDER = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const TEXT   = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)';
  const DIM    = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
  const HOVER  = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Live search — debounced 280ms
  const doSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await productAPI.getAll({ search: q.trim(), limit: 6 });
      setResults(res.products || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 280);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  const saveSearch = (term) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem('videstore_searches', JSON.stringify(updated));
  };

  const go = (path, term) => {
    if (term) saveSearch(term);
    navigate(path);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) go(`/shop?search=${encodeURIComponent(query.trim())}`, query.trim());
  };

  const highlight = (text, q) => {
    if (!q || q.length < 2) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} style={{ backgroundColor: 'rgba(201,168,76,0.25)', color: GOLD, borderRadius: '2px' }}>{part}</mark>
        : part
    );
  };

  const showDefault = query.length < 2;
  const showResults = query.length >= 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99]"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Search panel — slides down from top */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed top-0 left-0 right-0 z-[100]"
            style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* ── Search input bar ── */}
            <div style={{ backgroundColor: isDark ? '#0d0d0d' : '#fff', borderBottom: `1px solid ${BORDER}` }}>
              <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                {/* Animated search icon */}
                <motion.div animate={{ scale: focused ? 1.1 : 1 }} transition={{ duration: 0.15 }}>
                  <FiSearch size={20} style={{ color: focused ? GOLD : DIM, flexShrink: 0, transition: 'color 0.2s' }} />
                </motion.div>

                <form onSubmit={handleSubmit} className="flex-1">
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="Search products, brands, categories..."
                    className="w-full text-base font-body bg-transparent focus:outline-none"
                    style={{ color: isDark ? '#fff' : '#111', caretColor: GOLD }}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </form>

                {/* Clear button */}
                <AnimatePresence>
                  {query && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                      className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 transition-colors"
                      style={{ backgroundColor: BORDER, color: DIM }}>
                      <FiX size={14} />
                    </motion.button>
                  )}
                </AnimatePresence>

                <button onClick={onClose}
                  className="font-body text-sm px-3 py-1.5 flex-shrink-0 transition-colors"
                  style={{ color: DIM, border: `1px solid ${BORDER}`, borderRadius: '6px' }}>
                  Cancel
                </button>
              </div>

              {/* Progress bar when loading */}
              <AnimatePresence>
                {loading && (
                  <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ opacity: 0 }}
                    style={{ height: '2px', backgroundColor: GOLD, transformOrigin: 'left', borderRadius: '1px' }} />
                )}
              </AnimatePresence>
            </div>

            {/* ── Results / Default content ── */}
            <div style={{ backgroundColor: BG, flex: 1, overflowY: 'auto' }}>
              <div className="max-w-2xl mx-auto">

                {/* ── LIVE RESULTS ── */}
                {showResults && (
                  <div className="p-4">
                    {loading && results.length === 0 ? (
                      <div className="space-y-3 py-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3 px-3 py-2">
                            <div className="skeleton w-11 h-13 rounded-lg flex-shrink-0" style={{ height: '52px', width: '44px' }} />
                            <div className="flex-1 space-y-2">
                              <div className="skeleton h-3 rounded w-3/4" />
                              <div className="skeleton h-3 rounded w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : results.length > 0 ? (
                      <>
                        {/* Result count */}
                        <p className="font-body text-[10px] tracking-[0.18em] uppercase px-1 mb-3"
                          style={{ color: DIM }}>
                          {results.length} result{results.length !== 1 ? 's' : ''} for
                          <span style={{ color: GOLD }}> "{query}"</span>
                        </p>

                        {/* Product rows */}
                        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                          {results.map((product, idx) => (
                            <motion.button
                              key={product._id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.04 }}
                              onClick={() => go(`/product/${product._id}`, product.name)}
                              className="w-full flex items-center gap-4 px-4 py-3 text-left transition-colors"
                              style={{
                                backgroundColor: CARD,
                                borderBottom: idx < results.length - 1 ? `1px solid ${BORDER}` : 'none',
                              }}
                              onMouseOver={e => e.currentTarget.style.backgroundColor = HOVER}
                              onMouseOut={e => e.currentTarget.style.backgroundColor = CARD}
                            >
                              {/* Product image */}
                              <div className="flex-shrink-0 rounded-lg overflow-hidden"
                                style={{ width: '44px', height: '52px', backgroundColor: isDark ? '#111' : '#f0f0f0' }}>
                                <img src={product.images?.[0]?.url} alt={product.name}
                                  className="w-full h-full object-cover" />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-body text-sm font-medium truncate"
                                  style={{ color: isDark ? '#fff' : '#111' }}>
                                  {highlight(product.name, query)}
                                </p>
                                <p className="font-body text-xs mt-0.5 truncate" style={{ color: DIM }}>
                                  {product.category} · {product.brand}
                                </p>
                              </div>

                              {/* Price */}
                              <div className="text-right flex-shrink-0">
                                <p className="font-body text-sm font-semibold" style={{ color: GOLD }}>
                                  ₹{(product.discountPrice || product.price)?.toLocaleString()}
                                </p>
                                {product.discountPrice && (
                                  <p className="font-body text-[10px] line-through" style={{ color: DIM }}>
                                    ₹{product.price?.toLocaleString()}
                                  </p>
                                )}
                              </div>

                              <FiArrowUpRight size={14} style={{ color: DIM, flexShrink: 0 }} />
                            </motion.button>
                          ))}
                        </div>

                        {/* View all button */}
                        <button
                          onClick={() => go(`/shop?search=${encodeURIComponent(query)}`, query)}
                          className="w-full flex items-center justify-center gap-2 mt-3 py-3 font-body text-sm tracking-wider text-white rounded-xl transition-colors"
                          style={{ backgroundColor: GOLD }}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = '#A07830'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = GOLD}>
                          See all results for "{query}" <FiArrowRight size={15} />
                        </button>
                      </>
                    ) : !loading ? (
                      <div className="text-center py-12">
                        <p className="text-4xl mb-3">🔍</p>
                        <p className="font-body font-medium text-base mb-1" style={{ color: isDark ? '#fff' : '#111' }}>
                          No results for "{query}"
                        </p>
                        <p className="font-body text-sm" style={{ color: DIM }}>
                          Try a shorter or different search term
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center mt-4">
                          {TRENDING.slice(0, 3).map(t => (
                            <button key={t} onClick={() => setQuery(t)}
                              className="px-3 py-1.5 text-xs font-body rounded-full transition-colors"
                              style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, color: TEXT }}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* ── DEFAULT STATE ── */}
                {showDefault && (
                  <div className="p-4 space-y-6">

                    {/* Recent searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3 px-1">
                          <p className="font-body text-[10px] tracking-[0.18em] uppercase flex items-center gap-1.5" style={{ color: DIM }}>
                            <FiClock size={11} /> Recent
                          </p>
                          <button onClick={() => { setRecentSearches([]); localStorage.removeItem('videstore_searches'); }}
                            className="font-body text-xs hover:underline" style={{ color: GOLD }}>
                            Clear
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map(s => (
                            <button key={s}
                              onClick={() => setQuery(s)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-body rounded-full transition-all"
                              style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, color: TEXT }}
                              onMouseOver={e => e.currentTarget.style.borderColor = GOLD}
                              onMouseOut={e => e.currentTarget.style.borderColor = BORDER}>
                              <FiClock size={10} style={{ color: DIM }} /> {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending */}
                    <div>
                      <p className="font-body text-[10px] tracking-[0.18em] uppercase flex items-center gap-1.5 mb-3 px-1" style={{ color: DIM }}>
                        <FiTrendingUp size={11} /> Trending Now
                      </p>
                      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                        {TRENDING.map((term, i) => (
                          <button key={term}
                            onClick={() => go(`/shop?search=${encodeURIComponent(term)}`, term)}
                            className="w-full flex items-center justify-between px-4 py-3 transition-colors text-left"
                            style={{
                              backgroundColor: CARD,
                              borderBottom: i < TRENDING.length - 1 ? `1px solid ${BORDER}` : 'none',
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = HOVER}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = CARD}>
                            <div className="flex items-center gap-3">
                              <span className="font-body text-xs font-bold w-5 text-center"
                                style={{ color: i < 3 ? GOLD : DIM }}>#{i + 1}</span>
                              <span className="font-body text-sm" style={{ color: TEXT }}>{term}</span>
                            </div>
                            <FiTrendingUp size={13} style={{ color: i < 3 ? GOLD : DIM }} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <p className="font-body text-[10px] tracking-[0.18em] uppercase mb-3 px-1" style={{ color: DIM }}>
                        Browse Categories
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {CATEGORIES.map(cat => (
                          <button key={cat.name}
                            onClick={() => go(`/shop/${cat.name.toLowerCase()}`)}
                            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all"
                            style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}
                            onMouseOver={e => { e.currentTarget.style.borderColor = GOLD; }}
                            onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; }}>
                            <span className="text-xl">{cat.emoji}</span>
                            <span className="font-body text-sm font-medium" style={{ color: TEXT }}>{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}