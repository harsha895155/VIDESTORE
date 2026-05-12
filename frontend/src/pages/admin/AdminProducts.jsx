import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiArrowLeft, FiUser, FiShield, FiSearch, FiLayers, FiActivity, FiTag, FiBox, FiRefreshCw } from 'react-icons/fi';

export default function AdminProducts() {
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [deleting,   setDeleting]   = useState(null);
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);
  const [pagination, setPagination] = useState({});
  const [filter,     setFilter]     = useState('all');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll({ search, page, limit: 50 });
      setProducts(res.products || []);
      setPagination(res.pagination || {});
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchProducts(); }, [search, page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This action cannot be undone.')) return;
    setDeleting(id);
    try { await productAPI.delete(id); toast.success('Product deleted'); fetchProducts(); }
    catch { toast.error('Delete failed'); } finally { setDeleting(null); }
  };

  const adminProducts  = products.filter(p => !p.createdBy || p.createdBy?.role !== 'seller');
  const sellerProducts = products.filter(p => p.createdBy?.role === 'seller');

  const sellerGroups = sellerProducts.reduce((acc, product) => {
    const email = product.createdBy?.email || 'unknown';
    const name  = product.createdBy?.name  || 'Unknown Vendor';
    if (!acc[email]) acc[email] = { name, email, products: [] };
    acc[email].products.push(product);
    return acc;
  }, {});
  const sellerEmails = Object.keys(sellerGroups);

  const tabs = [
    { key: 'all',   label: `All (${products.length})` },
    { key: 'admin', label: `Official (${adminProducts.length})`, icon: FiShield },
    ...sellerEmails.map(email => ({
      key:   email,
      label: `${sellerGroups[email].name} (${sellerGroups[email].products.length})`,
      icon: FiUser
    })),
  ];

  const visibleProducts = filter === 'all'
    ? products
    : filter === 'admin'
    ? adminProducts
    : sellerGroups[filter]?.products || [];

  const ProductRow = ({ product }) => {
    const isByAdmin  = !product.createdBy || product.createdBy?.role !== 'seller';
    const sellerName  = product.createdBy?.name  || null;
    const sellerEmail = product.createdBy?.email || null;

    return (
      <tr className="hover:bg-[var(--bg-alt)] transition-colors group">
        {/* Product */}
        <td className="px-8 py-6">
          <div className="flex items-center gap-5">
            <img src={product.images?.[0]?.url} alt=""
              className="w-16 h-20 object-cover rounded-xl bg-[var(--bg-alt)] border border-[var(--b)] shadow-sm" />
            <div>
              <p className="text-sm font-black text-[var(--t)] m-0 tracking-tight leading-tight mb-1.5">{product.name}</p>
              <p className="text-[10px] font-black text-[var(--tl)] m-0 uppercase tracking-widest">{product.brand}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {product.isFeatured   && <span className="px-2.5 py-1 rounded-lg bg-[var(--p)]/5 text-[var(--p)] font-black text-[8px] uppercase tracking-widest border border-[var(--p)]/10">Featured</span>}
                {product.isNewArrival && <span className="px-2.5 py-1 rounded-lg bg-emerald-500/5 text-emerald-500 font-black text-[8px] uppercase tracking-widest border border-emerald-500/10">New</span>}
                {product.isBestSeller && <span className="px-2.5 py-1 rounded-lg bg-amber-500/5 text-amber-500 font-black text-[8px] uppercase tracking-widest border border-amber-500/10">Best</span>}
              </div>
            </div>
          </div>
        </td>

        {/* Origin */}
        <td className="px-8 py-6">
          <div className="flex items-center gap-2">
            {isByAdmin ? (
              <div className="flex items-center gap-2.5 px-3.5 py-2 bg-[var(--p)]/5 text-[var(--p)] border border-[var(--p)]/10 rounded-xl shadow-sm">
                <FiShield size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Official</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-sm font-black text-[var(--t)] flex items-center gap-2">
                  <FiUser size={14} className="text-[var(--p)]" /> {sellerName}
                </span>
                <span className="text-[10px] font-bold text-[var(--tl)] uppercase tracking-tight mt-1 opacity-60 tracking-[0.05em]">{sellerEmail}</span>
              </div>
            )}
          </div>
        </td>

        {/* Economic Value */}
        <td className="px-8 py-6">
          <div className="flex flex-col">
            <span className="text-base font-black text-[var(--t)] tracking-tight serif">₹{product.price?.toLocaleString()}</span>
            {product.discountPrice > 0 && (
              <span className="text-[11px] font-bold text-[var(--tl)] line-through opacity-40">₹{product.price?.toLocaleString()}</span>
            )}
          </div>
        </td>

        {/* Logistics */}
        <td className="px-8 py-6">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full shadow-sm ${product.stock > 10 ? 'bg-emerald-500 shadow-emerald-500/30' : product.stock > 0 ? 'bg-amber-500 shadow-amber-500/30' : 'bg-red-500 shadow-red-500/30'}`} />
            <span className={`text-sm font-black ${product.stock > 0 ? 'text-[var(--t)]' : 'text-red-500'}`}>
              {product.stock} <span className="text-[10px] font-black text-[var(--tl)] uppercase tracking-[0.15em] ml-1 opacity-40">Stock</span>
            </span>
          </div>
        </td>

        {/* Quality Metric */}
        <td className="px-8 py-6">
          <div className="flex items-center gap-1.5">
            <FiStar className="text-[var(--p)] fill-[var(--p)]" size={16} />
            <span className="text-base font-black text-[var(--t)]">{product.rating || '0.0'}</span>
            <span className="text-[10px] font-black text-[var(--tl)] uppercase tracking-widest ml-1 opacity-40">({product.numReviews})</span>
          </div>
        </td>

        {/* Operations */}
        <td className="px-8 py-6">
          <div className="flex items-center gap-3">
            <Link to={`/admin/products/${product._id}/edit`}
              className="w-9 h-9 rounded-lg bg-[var(--bg-alt)] border border-[var(--b)] flex items-center justify-center text-[var(--tm)] hover:bg-[var(--p)] hover:text-[#040404] hover:border-[var(--p)] transition-all shadow-sm">
              <FiEdit2 size={14} />
            </Link>
            <button onClick={() => handleDelete(product._id)} disabled={deleting === product._id}
              className="w-9 h-9 rounded-lg bg-[var(--bg-alt)] border border-[var(--b)] flex items-center justify-center text-[var(--tm)] hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm">
              {deleting === product._id ? <FiRefreshCw className="animate-spin text-red-500" size={14} /> : <FiTrash2 size={14} />}
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between sticky top-0 z-10" 
        style={{ backgroundColor: 'var(--glass)', borderBottom: `1px solid var(--b)`, backdropFilter: 'blur(32px)' }}>
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-[14px] bg-[var(--p)] flex items-center justify-center text-[#040404] shadow-xl shadow-gold/20">
            <FiLayers size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FiShield size={12} className="text-[var(--p)]" />
              <p className="font-black text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--tm)' }}>Admin</p>
            </div>
            <h1 className="font-body text-2xl font-black tracking-tighter" style={{ color: 'var(--t)' }}>Products</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/admin/products/new" className="font-bold text-[12px] px-6 py-3 bg-[var(--p)] text-[#040404] rounded-xl shadow-lg shadow-gold/20 hover:-translate-y-0.5 transition-all flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <FiPlus size={16} /> Add Product
          </Link>
          <Link to="/admin" className="font-bold text-[12px] px-5 py-3 bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl text-[var(--tm)] hover:bg-[var(--card-alt)] transition-all flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <FiArrowLeft size={16} /> Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-4">

        {/* Global Strategy Bar */}
        <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
          <div className="relative flex-1 w-full md:w-auto">
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--p)] opacity-40" size={18} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-lg pl-14 pr-6 py-4 text-sm font-medium text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-sm" />
          </div>
          <div className="flex items-center gap-12 px-10 border-l border-[var(--b)] hidden lg:flex">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--tl)] mb-1 opacity-40">Total Assets</p>
                <p className="text-2xl font-bold text-[var(--t)] m-0 tracking-tight">{pagination.totalProducts || 0}</p>
              </div>
             <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--tl)] mb-1 opacity-40">External Nodes</p>
               <p className="text-2xl font-bold text-[var(--p)] m-0 tracking-tight">{sellerProducts.length}</p>
             </div>
          </div>
        </div>

        {/* Intelligence Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {tabs.map(t => {
            const Icon = t.icon || FiBox;
            return (
              <button key={t.key} onClick={() => setFilter(t.key)}
                className={`flex items-center gap-2.5 px-6 py-3 font-bold text-[11px] uppercase tracking-widest transition-all rounded-xl border ${filter === t.key ? 'bg-[var(--p)] text-[#040404] border-[var(--p)] shadow-md shadow-gold/20' : 'bg-[var(--card)] text-[var(--tl)] border-[var(--b)] hover:border-[var(--p)]/30 shadow-sm'}`}>
                <Icon size={14} className={filter === t.key ? 'text-[#040404]' : 'text-[var(--p)] opacity-40'} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Implementation Matrix */}
        <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-32 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-[14px] bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] mb-8 border border-[var(--p)]/10 shadow-inner">
                 <FiRefreshCw className="animate-spin" size={32} />
              </div>
              <p className="text-[10px] font-black text-[var(--tl)] uppercase tracking-[0.25em]">Loading Products...</p>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="p-40 text-center">
              <div className="w-28 h-28 bg-[var(--bg-alt)] rounded-[24px] flex items-center justify-center mx-auto mb-10 shadow-inner border border-[var(--b)]">
                <FiBox size={48} className="text-[var(--p)] opacity-20" />
              </div>
              <h3 className="text-3xl font-black text-[var(--t)] mb-4 tracking-tight uppercase">No Products</h3>
              <p className="text-sm font-bold text-[var(--tl)] opacity-60 uppercase tracking-widest">No products found matching your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-[var(--bg-alt)]/50 border-b border-[var(--b)]">
                    {['Product Name', 'Source', 'Price', 'Stock', 'Rating', 'Actions'].map(h => (
                      <th key={h} className="text-[10px] font-black text-[var(--tl)] uppercase tracking-[0.3em] px-8 py-6 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--b)]">
                  {visibleProducts.map(product => (
                    <ProductRow key={product._id} product={product} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Navigation Control */}
        {pagination.totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className={`w-14 h-14 rounded-[12px] flex items-center justify-center transition-all border ${page === 1 ? 'bg-[var(--bg-alt)] text-[var(--tl)] border-[var(--b)] cursor-not-allowed opacity-40' : 'bg-[var(--card)] text-[var(--t)] border-[var(--b)] hover:border-[var(--p)] shadow-xl shadow-black/5'}`}>
              <FiArrowLeft size={20} />
            </button>
            <div className="px-8 py-4 bg-[var(--card)] border border-[var(--b)] rounded-[12px] shadow-sm flex items-center gap-4">
              <span className="text-lg font-black text-[var(--p)] serif">{page}</span>
              <span className="text-[10px] font-black text-[var(--tl)] uppercase tracking-[0.2em] opacity-40">OF</span>
              <span className="text-lg font-black text-[var(--t)] serif">{pagination.totalPages}</span>
            </div>
            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
              className={`w-14 h-14 rounded-[12px] flex items-center justify-center transition-all border ${page === pagination.totalPages ? 'bg-[var(--bg-alt)] text-[var(--tl)] border-[var(--b)] cursor-not-allowed opacity-40' : 'bg-[var(--card)] text-[var(--t)] border-[var(--b)] hover:border-[var(--p)] shadow-xl shadow-black/5'}`}>
              <FiArrowLeft className="rotate-180" size={20} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}