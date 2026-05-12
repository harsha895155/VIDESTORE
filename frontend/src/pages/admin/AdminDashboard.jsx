import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../../services/api';
import {
  FiUsers, FiShoppingBag, FiDollarSign, FiPackage,
  FiTrendingUp, FiArrowRight, FiArrowLeft, FiBell, FiTag, FiSliders,
  FiTrash2, FiAlertTriangle, FiRefreshCw, FiGrid,
  FiShield, FiUser, FiActivity, FiArrowUpRight, FiLayers, FiSettings, FiRotateCcw
} from 'react-icons/fi';

const statusStyle = (s) => ({
  Processing: { color: 'var(--w)', backgroundColor: 'var(--w-light)', borderRadius: '8px', padding: '4px 10px', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', border: '1px solid var(--w-border)' },
  Confirmed: { color: 'var(--p)', backgroundColor: 'var(--p-light)', borderRadius: '8px', padding: '4px 10px', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', border: '1px solid var(--p-border)' },
  Shipped: { color: '#8b5cf6', backgroundColor: 'rgba(124, 58, 237, 0.05)', borderRadius: '8px', padding: '4px 10px', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', border: '1px solid rgba(124, 58, 237, 0.1)' },
  'Out for Delivery': { color: '#c2410c', backgroundColor: 'rgba(249, 115, 22, 0.05)', borderRadius: '8px', padding: '4px 10px', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', border: '1px solid rgba(249, 115, 22, 0.1)' },
  Delivered: { color: 'var(--s)', backgroundColor: 'var(--s-light)', borderRadius: '8px', padding: '4px 10px', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', border: '1px solid var(--s-border)' },
  Cancelled: { color: 'var(--d)', backgroundColor: 'var(--d-light)', borderRadius: '8px', padding: '4px 10px', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', border: '1px solid var(--d-border)' },
}[s] || { color: 'var(--tm)', backgroundColor: 'var(--bg-alt)', borderRadius: '8px', padding: '4px 10px', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' });

// ── Danger Modal ──────────────────────────────────────────────────
function DangerModal({ open, onClose, onConfirm, loading, title, subtitle, lines }) {
  const [typed, setTyped] = useState('');
  useEffect(() => { if (!open) setTyped(''); }, [open]);
  if (!open) return null;
  const ready = typed === 'DELETE' && !loading;
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-10 max-w-[480px] w-full shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 rounded-xl bg-red-500/5 flex items-center justify-center text-red-500 border border-red-500/10">
            <FiAlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--t)] m-0 tracking-tight uppercase">{title}</h3>
            <p className="text-[10px] font-bold text-[var(--tl)] m-0 uppercase tracking-widest mt-1 opacity-50">{subtitle}</p>
          </div>
        </div>
        <div className="bg-[var(--bg-alt)] border border-[var(--b)] rounded-2xl p-8 mb-8">
          {lines.map((l, i) => (
            <p key={i} className={`m-0 leading-relaxed ${i === 0 ? 'text-red-500 font-bold text-sm uppercase tracking-wide' : 'text-[var(--tm)] text-[11px] mt-4 font-medium opacity-60 uppercase tracking-wider'}`}>{l}</p>
          ))}
        </div>
        <div className="mb-8">
          <label className="block text-[10px] font-bold text-[var(--tl)] uppercase tracking-widest mb-3 px-1 opacity-60">Authorize Deletion: Type <span className="text-red-500">DELETE</span></label>
          <input autoFocus type="text" value={typed} onChange={e => setTyped(e.target.value)} placeholder="Authorization code..."
            className="w-full bg-[var(--bg-alt)] border-2 border-[var(--b)] rounded-xl px-6 py-4 text-sm font-bold text-[var(--t)] focus:border-red-500 outline-none transition-all" />
        </div>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 px-6 bg-[var(--bg-alt)] border border-[var(--b)] text-[var(--tl)] font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[var(--card-alt)] transition-all">Abort</button>
          <button onClick={() => ready && onConfirm()} disabled={!ready}
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${ready ? 'bg-red-600 text-white shadow-xl shadow-red-900/20' : 'bg-red-500/5 text-red-500/20 cursor-not-allowed border border-red-500/10'}`}>
            {loading ? <FiRefreshCw className="animate-spin" /> : <FiTrash2 />}
            {loading ? 'Purging...' : 'Confirm Purge'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [revenueDeleting, setRevenueDeleting] = useState(false);

  const fetchStats = () => {
    setLoading(true);
    userAPI.getDashboardStats().then(r => setStats(r.stats)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchStats(); }, []);

  const handleResetRevenue = async () => {
    setRevenueDeleting(true);
    try { await userAPI.resetRevenueData(); setShowRevenueModal(false); fetchStats(); }
    catch (e) { console.error(e); } finally { setRevenueDeleting(false); }
  };

  const totalRevenue = stats?.totalRevenue || 0;
  const sellerRevenue = stats?.sellerStats?.reduce((s, x) => s + (x.revenue || 0), 0) || 0;
  const adminRevenue = Math.max(0, totalRevenue - sellerRevenue);

  const statCards = stats ? [
    { label: 'Users', value: (stats.totalUsers || 0).toLocaleString(), icon: FiUsers, color: 'var(--p)', sub: `${stats.totalSellers || 0} sellers` },
    { label: 'Orders', value: (stats.totalOrders || 0).toLocaleString(), icon: FiShoppingBag, color: 'var(--p)', sub: `${stats.cancelledCount || 0} cancelled` },
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: FiDollarSign, color: 'var(--p)', sub: 'Gross earnings' },
    { label: 'Avg Order Value', value: stats.totalOrders ? `₹${Math.round(totalRevenue / stats.totalOrders).toLocaleString()}` : '₹0', icon: FiActivity, color: 'var(--p)', sub: 'Per sale' },
  ] : [];

  const adminLinks = [
    { to: '/admin/analytics', label: 'Analytics', icon: FiTrendingUp, desc: 'Sales & growth stats', color: 'var(--p)' },
    { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag, desc: 'Manage store orders', color: 'var(--p)' },
    { to: '/admin/products', label: 'Products', icon: FiLayers, desc: 'Manage inventory', color: 'var(--p)' },
    { to: '/admin/returns', label: 'Returns', icon: FiRotateCcw, desc: 'Manage product returns', color: 'var(--p)' },
    { to: '/admin/users', label: 'Users', icon: FiUsers, desc: 'Manage customer accounts', color: 'var(--p)' },
    { to: '/admin/coupons', label: 'Coupons', icon: FiTag, desc: 'Manage promo codes', color: 'var(--p)' },
    { to: '/admin/sellers', label: 'Sellers', icon: FiUser, desc: 'Manage third-party sellers', color: 'var(--p)' },
    { to: '/admin/settings', label: 'Settings', icon: FiSettings, desc: 'Global store settings', color: 'var(--p)' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <DangerModal open={showRevenueModal} onClose={() => setShowRevenueModal(false)}
        onConfirm={handleResetRevenue} loading={revenueDeleting}
        title="Clear All Data" subtitle="Delete Everything"
        lines={['⚠️ This will delete all sales and order data.', 'This action will reset your dashboard stats. This cannot be undone.']} />

      {/* ── Header ── */}
      <div className="px-8 py-6 flex items-center justify-between sticky top-0 z-10" 
        style={{ backgroundColor: 'var(--glass)', borderBottom: `1px solid var(--b)`, backdropFilter: 'blur(32px)' }}>
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-[var(--p)] flex items-center justify-center text-[#040404] shadow-xl shadow-gold/20">
            <FiGrid size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FiShield size={12} className="text-[var(--p)]" />
              <p className="font-bold text-[10px] tracking-[0.2em] uppercase opacity-60" style={{ color: 'var(--tm)' }}>Admin</p>
            </div>
            <h1 className="font-body text-2xl font-bold tracking-tight uppercase" style={{ color: 'var(--t)' }}>Dashboard</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchStats} className="font-bold text-[11px] uppercase tracking-wider px-5 py-3 bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl text-[var(--tm)] hover:bg-[var(--card-alt)] transition-all flex items-center gap-2 shadow-sm">
            <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowRevenueModal(true)} className="font-bold text-[11px] uppercase tracking-wider px-5 py-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-2 shadow-sm">
            <FiTrash2 size={14} /> Clear Data
          </button>
          <Link to="/" className="font-bold text-[11px] uppercase tracking-wider px-6 py-3 bg-[var(--p)] text-[#040404] rounded-xl shadow-lg shadow-gold/20 hover:-translate-y-0.5 transition-all flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <FiArrowLeft size={16} /> Storefront
          </Link>
        </div>
      </div>

      <div className="max-w-[1536px] mx-auto px-8 py-4">

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-64 rounded-3xl" />)}
          </div>
        ) : (
          <>
            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
              {statCards.map(({ label, value, icon: Icon, color, sub }) => (
                <div key={label} className="bg-[var(--card)] border border-[var(--b)] rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 shadow-inner"
                      style={{ backgroundColor: `${color}05`, borderColor: `${color}10`, color }}>
                      <Icon size={22} />
                    </div>
                    <div className="flex flex-col items-end opacity-40 group-hover:opacity-100 transition-all">
                       <span className="text-[9px] font-bold text-[var(--tl)] uppercase tracking-wider">{label}</span>
                       <FiArrowUpRight size={14} className="text-[var(--tl)] mt-1" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-[var(--t)] mb-1 m-0 tracking-tight">{value}</h3>
                  <p className="text-[11px] font-medium text-[var(--tl)] m-0 opacity-40 uppercase tracking-wide">{sub}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 opacity-20" style={{ backgroundColor: color }} />
                </div>
              ))}
            </div>

            {/* ── Strategic Navigation ── */}
            <div className="mb-20">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-2 h-8 bg-[var(--p)] rounded-full" />
                <h3 className="text-2xl font-bold text-[var(--t)] m-0 tracking-tight uppercase">Quick Links</h3>
                <div className="flex-1 h-px bg-[var(--b)] ml-6 opacity-40" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {adminLinks.map(({ to, label, icon: Icon, desc, color }) => (
                  <Link key={to} to={to}
                    className="bg-[var(--card)] border border-[var(--b)] rounded-2xl p-6 text-decoration-none group hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border mb-6 group-hover:scale-110 transition-all duration-500 shadow-inner"
                      style={{ backgroundColor: `${color}05`, borderColor: `${color}10`, color }}>
                      <Icon size={22} />
                    </div>
                    <h4 className="text-lg font-bold text-[var(--t)] mb-1.5 m-0 tracking-tight uppercase">{label}</h4>
                    <p className="text-[11px] font-medium text-[var(--tl)] m-0 leading-relaxed opacity-40 uppercase">{desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Analytics & Activity ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
              {/* Revenue Matrix */}
              <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--b)] rounded-2xl p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] border border-[var(--p)]/10 shadow-inner">
                       <FiTrendingUp size={22} />
                    </div>
                  </div>
                  <div className="flex p-1.5 bg-[var(--bg-alt)] rounded-2xl border border-[var(--b)] shadow-inner">
                    {['overview', 'sellers'].map(t => (
                      <button key={t} onClick={() => setTab(t)}
                        className={`px-8 py-3 text-[10px] font-bold uppercase tracking-wider transition-all rounded-xl ${tab === t ? 'bg-[var(--card)] text-[var(--p)] shadow-xl' : 'text-[var(--tl)] opacity-60'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {tab === 'overview' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: 'Total Sales', value: `₹${totalRevenue.toLocaleString()}`, color: 'var(--p)', pct: 100 },
                      { label: 'Profit', value: `₹${adminRevenue.toLocaleString()}`, color: 'var(--p)', pct: totalRevenue > 0 ? (adminRevenue/totalRevenue)*100 : 0 },
                      { label: 'Seller Sales', value: `₹${sellerRevenue.toLocaleString()}`, color: 'var(--p)', pct: totalRevenue > 0 ? (sellerRevenue/totalRevenue)*100 : 0 },
                    ].map((item, i) => (
                      <div key={i} className="p-8 rounded-2xl bg-[var(--bg-alt)] border border-[var(--b)] group hover:border-[var(--p)]/30 transition-all shadow-inner">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--tl)] mb-4 opacity-40">{item.label}</p>
                        <p className="text-2xl font-bold text-[var(--t)] mb-6 m-0 tracking-tight">{item.value}</p>
                        <div className="h-1.5 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--b)] shadow-inner">
                          <div className="h-full rounded-full transition-all duration-1000 group-hover:opacity-80 shadow-lg shadow-gold/20" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-[var(--bg-alt)]/30 border-b border-[var(--b)]">
                          {['Seller', 'Orders', 'Revenue', 'Status'].map(h => (
                            <th key={h} className="text-[9px] font-bold text-[var(--tl)] uppercase tracking-widest px-8 py-6 text-left opacity-40">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--b)]">
                        {stats?.sellerStats?.slice(0, 5).map((s, i) => (
                          <tr key={i} className="hover:bg-[var(--bg-alt)] transition-colors">
                            <td className="px-8 py-6">
                              <p className="text-sm font-bold text-[var(--t)] m-0 tracking-tight uppercase">{s.sellerName}</p>
                              <p className="text-[10px] font-bold text-[var(--tl)] m-0 uppercase mt-1 tracking-tighter opacity-40">{s.businessName}</p>
                            </td>
                            <td className="px-8 py-6 text-sm font-bold text-[var(--t)]">{s.orderCount}</td>
                            <td className="px-8 py-6 text-sm font-bold text-[var(--p)]">₹{(s.revenue || 0).toLocaleString()}</td>
                            <td className="px-8 py-6">
                              <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 bg-emerald-500/5 text-emerald-500 rounded-lg border border-emerald-500/10">Paid</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Status Breakdown */}
              <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] border border-[var(--p)]/10 shadow-inner">
                     <FiActivity size={22} />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--t)] m-0 tracking-tight uppercase">Order Status</h3>
                </div>
                <div className="space-y-8">
                  {stats?.ordersByStatus?.map(({ _id, count }) => (
                    <div key={_id} className="group">
                      <div className="flex justify-between items-end mb-3 px-1">
                        <span className="text-[10px] font-bold text-[var(--tl)] uppercase tracking-wider opacity-40">{_id}</span>
                        <span className="text-base font-bold text-[var(--t)]">{count}</span>
                      </div>
                      <div className="h-2 bg-[var(--bg-alt)] rounded-full overflow-hidden border border-[var(--b)] shadow-inner">
                        <div className="h-full rounded-full bg-[var(--p)] transition-all duration-1000 group-hover:opacity-80 shadow-lg shadow-gold/20" style={{ width: `${(count/(stats.totalOrders||1))*100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Activity Stream ── */}
            {stats?.recentOrders?.length > 0 && (
              <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-10 py-8 border-b border-[var(--b)] bg-[var(--bg-alt)]/30">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] border border-[var(--p)]/10 shadow-inner">
                       <FiBell size={22} />
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--t)] m-0 tracking-tight uppercase">Recent Orders</h3>
                  </div>
                  <Link to="/admin/orders" className="text-[10px] font-bold uppercase tracking-widest text-[var(--p)] hover:translate-x-2 transition-all flex items-center gap-4">
                    View Orders <FiArrowUpRight size={18} />
                  </Link>
                </div>
                <div className="divide-y divide-[var(--b)]">
                  {stats.recentOrders.slice(0, 10).map(order => {
                    const hasSeller = order.orderItems?.some(i => i.seller);
                    return (
                      <div key={order._id} className="flex flex-col md:flex-row md:items-center justify-between px-10 py-6 hover:bg-[var(--bg-alt)] transition-colors group">
                        <div className="flex items-center gap-6 mb-4 md:mb-0">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110 shadow-inner ${hasSeller ? 'bg-indigo-500/5 border-indigo-500/10 text-indigo-500' : 'bg-[var(--p)]/5 border-[var(--p)]/10 text-[var(--p)]'}`}>
                            {hasSeller ? <FiUser size={20} /> : <FiShield size={20} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-4 mb-1">
                               <p className="text-base font-bold text-[var(--t)] m-0 tracking-tight uppercase">#{order._id.slice(-8).toUpperCase()}</p>
                               {hasSeller && <span className="px-2.5 py-1 bg-indigo-500/5 text-indigo-500 text-[8px] font-bold uppercase rounded-lg tracking-widest border border-indigo-500/10">Seller</span>}
                            </div>
                            <p className="text-[10px] font-bold text-[var(--tl)] m-0 uppercase tracking-tighter opacity-40">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {order.user?.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-12">
                          <span style={statusStyle(order.orderStatus)} className="shadow-sm">{order.orderStatus}</span>
                          <span className="text-lg font-bold text-[var(--t)] min-w-[100px] text-right">₹{order.totalPrice?.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}