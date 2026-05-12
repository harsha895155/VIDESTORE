import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiArrowRight, FiX } from 'react-icons/fi';
import { productAPI } from '../../services/api';

export default function LiveSearch({ isDark, placeholder = "Search collections...", isDesktop = false }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
      setQuery('');
      inputRef.current?.blur();
    }
  };

  const doSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await productAPI.getAll({ search: q.trim(), limit: 5 });
      setResults(res.products || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 250);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const highlight = (text, q) => {
    if (!q || q.length < 2) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="bg-[var(--p)]/20 text-[var(--p)] rounded-sm px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <div ref={containerRef} className={`relative flex-1 w-full ${isDesktop ? 'max-w-[560px]' : 'max-w-none'}`}>
      <form onSubmit={handleSearch}
        className={`flex items-center rounded-full overflow-hidden transition-all duration-300 border ${isDesktop ? 'p-1 pl-4' : 'p-1 pl-3.5'}`}
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--b)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
        }}
        onFocusCapture={e => {
            e.currentTarget.style.borderColor = 'var(--p)';
            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(200, 166, 70, 0.1)';
        }}
        onBlurCapture={e => {
            e.currentTarget.style.borderColor = 'var(--b)';
            e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)';
        }}>
        <FiSearch size={isDesktop ? 18 : 16} className="opacity-40" style={{ color: 'var(--tm)' }} />
        <input 
          ref={inputRef}
          type="text" 
          value={query} 
          onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none font-bold"
          style={{ 
            padding: isDesktop ? '10px 16px' : '8px 12px', 
            color: 'var(--t)', 
            fontSize: isDesktop ? '14px' : '13px',
          }} 
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="px-3 opacity-40 hover:opacity-100 transition-opacity">
            <FiX size={16} style={{ color: 'var(--tm)' }} />
          </button>
        )}
        <button type="submit"
          className="flex items-center justify-center rounded-full transition-all duration-300 shadow-lg shadow-gold/20"
          style={{ 
            width: isDesktop ? '40px' : '36px',
            height: isDesktop ? '40px' : '36px',
            background: 'var(--p)',
          }}
        >
          <FiArrowRight size={isDesktop ? 18 : 16} style={{ color: '#040404' }} />
        </button>
      </form>

      <AnimatePresence>
        {showDropdown && query.trim().length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-3 rounded-[24px] border shadow-2xl overflow-hidden py-3 z-[9999]"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--b)',
            }}>
            {loading && results.length === 0 ? (
               <div className="py-12 text-center text-[11px] font-bold uppercase tracking-widest opacity-40" style={{ color: 'var(--tm)' }}>Searching...</div>
            ) : results.length > 0 ? (
              <>
                <p className="px-6 py-2 text-[9px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--tm)' }}>
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </p>
                {results.map((p, i) => (
                  <button key={p._id}
                    onClick={() => { navigate(`/product/${p._id}`); setShowDropdown(false); setQuery(''); }}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[var(--bg-alt)] transition-all text-left"
                    style={{
                      borderBottom: i < results.length - 1 ? '1px solid var(--b-inner)' : 'none',
                    }}
                  >
                    <div className="w-10 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--bg-alt)] border border-[var(--b)]">
                      <img src={p.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="m-0 text-sm font-black truncate tracking-tight" style={{ color: 'var(--t)' }}>
                        {highlight(p.name, query)}
                      </p>
                      <p className="m-0 text-[10px] font-bold opacity-60 uppercase tracking-tighter" style={{ color: 'var(--tm)' }}>{p.category} · {p.brand}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="m-0 text-sm font-black" style={{ color: 'var(--p)' }}>₹{(p.discountPrice || p.price)?.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
                <div className="px-4 mt-2">
                  <button
                    onClick={() => handleSearch()}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-[var(--p)]/5 border border-[var(--p)]/10 text-[var(--p)] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[var(--p)]/10 transition-all"
                  >
                    View all results <FiArrowRight size={14} />
                  </button>
                </div>
              </>
            ) : (
              <div className="py-12 text-center px-8">
                <p className="text-sm font-black tracking-tight" style={{ color: 'var(--t)' }}>No products found</p>
                <p className="text-[11px] font-bold opacity-60 uppercase tracking-tighter mt-2" style={{ color: 'var(--tm)' }}>Try different keywords</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
