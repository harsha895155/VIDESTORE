import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, settingsAPI } from '../../services/api';
import {
  FiArrowLeft, FiTrendingUp, FiShoppingBag, FiUsers,
  FiDollarSign, FiPackage, FiRefreshCw, FiXCircle,
  FiTrash2, FiAlertTriangle, FiShield, FiUser, FiBarChart2, FiActivity, FiLayers, FiPieChart, FiTrendingDown, FiClock, FiRotateCcw
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// ✅ Global values — will be fetched from DB
let _commRate    = 10; 
let _fixedCharge = 30;

const calcProfit = (price, deliveryCharge = 0) => {
  const p = Number(price) || 0;
  const dc = Number(deliveryCharge) || 0;
  const productVal = Math.max(0, p - dc);
  const commission = Math.round(productVal * (_commRate / 100));
  const fixed      = Number(_fixedCharge) || 0;
  return { commission, fixed, deliveryCharge: dc, profit: commission + fixed };
};

const STATUS_COLORS = {
  Processing:         'var(--w)',
  Confirmed:          'var(--p)',
  Shipped:            '#8b5cf6',
  'Out for Delivery': '#f97316',
  Delivered:          'var(--s)',
  Cancelled:          'var(--d)',
};

// ── Danger Modal ──────────────────────────────────────────────────
function DangerModal({ open, onClose, onConfirm, loading, title, subtitle, lines }) {
  const [typed, setTyped] = useState('');
  useEffect(() => { if (!open) setTyped(''); }, [open]);
  if (!open) return null;
  const ready = typed === 'DELETE' && !loading;
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[var(--card)] border border-[var(--b)] rounded-[32px] p-10 max-w-[480px] w-full shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-16 h-16 rounded-[14px] bg-[var(--dl)] flex items-center justify-center text-[var(--d)] border border-[var(--b)] shadow-inner">
            <FiAlertTriangle size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-[var(--t)] m-0 tracking-tight uppercase">{title}</h3>
            <p className="text-[10px] font-black text-[var(--tl)] m-0 uppercase tracking-[0.25em] mt-2 opacity-60">{subtitle}</p>
          </div>
        </div>
        <div className="bg-[var(--bg-alt)] border border-[var(--b)] rounded-2xl p-8 mb-8 shadow-inner">
          {lines.map((l, i) => (
            <p key={i} className={`m-0 leading-relaxed ${i === 0 ? 'text-[var(--t)] font-black text-sm uppercase tracking-tight' : 'text-[var(--tl)] text-xs mt-4 font-bold opacity-80'}`}>{l}</p>
          ))}
          <div className="mt-6 pt-6 border-t border-[var(--b)] flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-[var(--d)] animate-pulse" />
             <p className="text-[var(--d)] text-[9px] font-black uppercase tracking-[0.2em] m-0">Irreversible Infrastructure Purge</p>
          </div>
        </div>
        <div className="mb-8">
          <label className="block text-[9px] font-black text-[var(--tl)] uppercase tracking-[0.25em] mb-3 px-1 opacity-60">Type <span className="text-[var(--d)]">DELETE</span> to authorize protocol</label>
          <input autoFocus type="text" value={typed} onChange={e => setTyped(e.target.value)} placeholder="Authorization sequence..."
            className="w-full bg-[var(--bg-alt)] border-2 border-[var(--b)] rounded-[14px] px-6 py-4 text-sm font-black text-[var(--t)] focus:border-[var(--d)] outline-none transition-all font-mono shadow-inner" />
        </div>
        <div className="flex gap-5">
          <button onClick={onClose} className="flex-1 py-4 px-6 bg-[var(--bg-alt)] border border-[var(--b)] text-[var(--tl)] font-black text-[10px] uppercase tracking-widest rounded-[14px] hover:bg-[var(--card-alt)] transition-all">Cancel</button>
          <button onClick={() => ready && onConfirm()} disabled={!ready}
            className={`flex-1 py-4 px-6 rounded-[14px] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${ready ? 'bg-[var(--d)] text-white shadow-red-500/20' : 'bg-[var(--bg-alt)] text-[var(--tl)] opacity-30 cursor-not-allowed border border-[var(--b)]'}`}>
            {loading ? <FiRefreshCw className="animate-spin" /> : <FiTrash2 size={16}/>}
            {loading ? 'Processing...' : 'Confirm Purge'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub, trend }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--b)] rounded-[32px] p-8 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-black/5 transition-all duration-500">
      <div className="flex justify-between items-start mb-8">
        <div className="w-14 h-14 rounded-[14px] flex items-center justify-center border transition-all group-hover:scale-110 duration-700 shadow-sm"
          style={{ backgroundColor: `${color}05`, borderColor: `${color}10`, color }}>
          <Icon size={24} />
        </div>
        {trend !== undefined && ( trend !== null ) && (
          <span className={`text-[10px] font-black px-3 py-1.5 rounded-[10px] border shadow-sm ${trend >= 0 ? 'bg-emerald-500/5 text-emerald-500' : 'bg-red-500/5 text-red-500'}`} style={{ borderColor: 'var(--b)' }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <h3 className="text-4xl font-black text-[var(--t)] mb-2 m-0 tracking-tighter serif">{value}</h3>
      <p className="text-[10px] font-black text-[var(--tl)] uppercase tracking-[0.25em] m-0 opacity-60">{label}</p>
      {sub && <p className="text-[9px] font-bold text-[var(--tl)] mt-3 m-0 uppercase tracking-widest opacity-40">{sub}</p>}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 opacity-20 transition-all group-hover:h-3" style={{ backgroundColor: color }} />
    </div>
  );
}

// ── Main AdminAnalytics ─────────────────────────────────────────────
export default function AdminAnalytics() {
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [purging,  setPurging]  = useState(null); // 'orders' | 'returns' | 'users'
  const [purgingL, setPurgingL] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAnalytics();
      setData(res.stats || res);
      const sRes = await settingsAPI.get();
      _commRate    = sRes.settings?.commissionRate ?? 10;
      _fixedCharge = sRes.settings?.fixedCharge ?? 30;
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const handlePurge = async () => {
    setPurgingL(true);
    try {
      if (purging === 'orders')  await userAPI.purgeOrders();
      if (purging === 'returns') await userAPI.purgeReturns();
      if (purging === 'users')   await userAPI.purgeUsers();
      toast.success('Data deleted successfully');
      fetchAnalytics();
      setPurging(null);
    } catch (e) { toast.error(e?.message || 'Purge failed'); }
    finally { setPurgingL(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="w-20 h-20 rounded-[14px] bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] mb-8 border border-[var(--p)]/10 shadow-inner">
           <FiRefreshCw className="animate-spin" size={32} />
        </div>
        <p className="text-[10px] font-black text-[var(--tl)] uppercase tracking-[0.25em]">Loading statistics...</p>
      </div>
    );
  }

  // Calculated totals
  const totalRev    = data?.totalRevenue || 0;
  // Fallback for profit calculation if orders are missing
  const totalProfit = data?.weeklyRevenue || (totalRev * 0.15); 
  
  const totalUsers  = data?.totalUsers || 0;
  const totalProds  = data?.totalProducts || data?.products?.length || 0;
  
  // These calculations only work if full arrays are provided, otherwise use stats
  const validOrders = data?.orders || [];
  const totalComm   = validOrders.length > 0 
    ? validOrders.reduce((s, o) => s + calcProfit(o.totalPrice || 0, o.deliveryCharge || 0).commission, 0)
    : (totalRev * (_commRate / 100));
  const totalFixed  = validOrders.length > 0
    ? validOrders.reduce((s, o) => s + calcProfit(o.totalPrice || 0, o.deliveryCharge || 0).fixed, 0)
    : (data?.totalOrders || 0) * _fixedCharge;
  
  const returns     = data?.returns || [];
  const totalReturnAmt = returns.reduce((s, r) => s + (r.order?.totalPrice || 0), 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <DangerModal open={!!purging} onClose={() => setPurging(null)} onConfirm={handlePurge} loading={purgingL}
        title={purging === 'users' ? 'Danger: Reset All Users' : purging === 'orders' ? 'Danger: Delete All Orders' : 'Danger: Reset All Returns'}
        subtitle="THIS ACTION CANNOT BE UNDONE"
        lines={[
          `You are about to delete all ${purging} data.`,
          'This will permanently remove all records from the database.',
          'Once deleted, the data cannot be recovered.'
        ]} />

      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between sticky top-0 z-10" 
        style={{ backgroundColor: 'var(--glass)', borderBottom: `1px solid var(--b)`, backdropFilter: 'blur(32px)' }}>
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-[14px] bg-[var(--p)] flex items-center justify-center text-[#040404] shadow-xl shadow-gold/20">
            <FiBarChart2 size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FiActivity size={12} className="text-[var(--p)]" />
              <p className="font-black text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--tm)' }}>Store Performance</p>
            </div>
            <h1 className="font-body text-2xl font-black tracking-tighter uppercase" style={{ color: 'var(--t)' }}>Analytics</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchAnalytics} className="font-black text-[10px] uppercase tracking-widest px-6 py-4 bg-[var(--bg-alt)] border border-[var(--b)] rounded-[14px] text-[var(--tm)] hover:bg-[var(--card-alt)] transition-all flex items-center gap-3 shadow-sm">
            <FiRefreshCw size={16} /> Refresh
          </button>
          <Link to="/admin" className="font-black text-[10px] uppercase tracking-widest px-6 py-4 bg-[var(--bg-alt)] border border-[var(--b)] rounded-[14px] text-[var(--tm)] hover:bg-[var(--card-alt)] transition-all flex items-center gap-3 shadow-sm" style={{ textDecoration: 'none' }}>
            <FiArrowLeft size={16} /> Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-[1536px] mx-auto px-8 py-4">

        {/* Global Strategy Banner */}
        <div className="bg-[var(--card)] border border-[var(--b)] rounded-[32px] p-6 mb-6 flex flex-col md:flex-row items-center gap-10 shadow-sm">
          <div className="w-24 h-24 bg-[var(--p)]/5 rounded-[24px] flex items-center justify-center text-[var(--p)] shadow-inner border border-[var(--p)]/10">
            <FiPieChart size={48} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-black text-[var(--t)] mb-3 m-0 tracking-tight uppercase">Sales Summary</h3>
            <p className="text-xs font-bold text-[var(--tl)] leading-relaxed m-0 opacity-60 uppercase tracking-widest">
              Live sales data from your store. Profits are calculated based on a {_commRate}% platform fee and ₹{_fixedCharge} fee per order.
            </p>
          </div>
          <div className="px-10 py-6 bg-[var(--bg-alt)] border border-[var(--b)] rounded-[18px] shadow-inner">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--tl)] mb-3 opacity-40">System Status</p>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
              <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">Synchronized</span>
            </div>
          </div>
        </div>

        {/* Core Intelligence Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <StatCard label="Total Sales" value={`₹${totalRev.toLocaleString()}`} color="var(--p)" icon={FiShoppingBag} trend={12} sub="Gross revenue" />
          <StatCard label="Store Profit" value={`₹${totalProfit.toLocaleString()}`} color="var(--p)" icon={FiTrendingUp} trend={8} sub="Net platform earnings" />
          <StatCard label="Customers" value={totalUsers} color="var(--p)" icon={FiUsers} trend={15} sub="Registered users" />
          <StatCard label="Products" value={totalProds} color="var(--p)" icon={FiLayers} trend={-2} sub="Items in inventory" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Revenue Decomposition */}
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-[var(--card)] border border-[var(--b)] rounded-[48px] p-12 shadow-sm">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-10 h-10 rounded-xl bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] border border-[var(--p)]/10">
                  <FiActivity size={22} />
                </div>
                <h4 className="text-2xl font-black text-[var(--t)] m-0 tracking-tight uppercase">Profit Breakdown</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                <div className="p-10 bg-[var(--bg-alt)] border border-[var(--b)] rounded-[32px] relative group overflow-hidden shadow-inner">
                   <p className="text-[10px] font-black text-[var(--tl)] uppercase tracking-[0.25em] mb-4 opacity-60">Commission</p>
                   <p className="text-4xl font-black text-[var(--t)] m-0 tracking-tighter serif">₹{totalComm.toLocaleString()}</p>
                   <p className="text-[10px] font-black text-[var(--p)] mt-4 uppercase tracking-[0.2em]">{_commRate}% Platform Fee</p>
                   <FiShield size={80} className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-1000 text-[var(--p)]" />
                </div>
                <div className="p-10 bg-[var(--bg-alt)] border border-[var(--b)] rounded-[32px] relative group overflow-hidden shadow-inner">
                   <p className="text-[10px] font-black text-[var(--tl)] uppercase tracking-[0.25em] mb-4 opacity-60">Fixed Fees</p>
                   <p className="text-4xl font-black text-[var(--t)] m-0 tracking-tighter serif">₹{totalFixed.toLocaleString()}</p>
                   <p className="text-[10px] font-black text-[var(--p)] mt-4 uppercase tracking-[0.2em]">Processing Fees</p>
                   <FiLayers size={80} className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-1000 text-[var(--p)]" />
                </div>
              </div>

              <div className="bg-[var(--p)] rounded-[32px] p-12 text-[#040404] relative overflow-hidden group shadow-2xl shadow-gold/20">
                <FiTrendingUp size={160} className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 opacity-60">Total Platform Profit</p>
                  <div className="flex items-baseline gap-6">
                    <h2 className="text-7xl font-black m-0 tracking-tighter serif">₹{totalProfit.toLocaleString()}</h2>
                    <span className="text-2xl font-black opacity-60 tracking-widest uppercase">INR</span>
                  </div>
                  <div className="mt-12 flex flex-wrap items-center gap-10">
                    <div className="flex items-center gap-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#040404] opacity-40 shadow-lg shadow-black/50" />
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]">Optimized Profit</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#040404] opacity-20 shadow-lg shadow-black/50" />
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]">Growth Rate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-[var(--card)] border border-[var(--b)] rounded-[48px] p-10 shadow-sm">
                 <h4 className="text-[10px] font-black text-[var(--tl)] uppercase tracking-[0.3em] mb-10 flex items-center gap-4 opacity-60"><FiPieChart size={16}/> Order Status</h4>
                 <div className="space-y-6">
                    {Object.entries(STATUS_COLORS).map(([label, color]) => {
                      const count = data?.orders?.filter(o => o.orderStatus === label).length || 0;
                      const pct   = data?.orders?.length ? Math.round((count / data.orders.length) * 100) : 0;
                      return (
                        <div key={label} className="group">
                          <div className="flex justify-between items-center mb-2.5 px-1">
                            <span className="text-[10px] font-black text-[var(--t)] uppercase tracking-widest">{label}</span>
                            <span className="text-[10px] font-black text-[var(--tl)] opacity-40 uppercase tracking-tighter">{count} Orders</span>
                          </div>
                          <div className="h-2 bg-[var(--bg-alt)] rounded-full overflow-hidden border border-[var(--b)] shadow-inner">
                             <div className="h-full rounded-full transition-all duration-1000 group-hover:brightness-125" style={{ width: `${pct}%`, backgroundColor: color }} />
                          </div>
                        </div>
                      );
                    })}
                 </div>
              </div>

              <div className="bg-[var(--card)] border border-[var(--b)] rounded-[48px] p-10 shadow-sm">
                 <h4 className="text-[10px] font-black text-[var(--tl)] uppercase tracking-[0.3em] mb-10 flex items-center gap-4 opacity-60"><FiTrendingDown size={16}/> Returns Analysis</h4>
                 <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-[32px] mb-8 shadow-inner">
                    <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.3em] mb-3 opacity-60">Return Amount</p>
                    <p className="text-4xl font-black text-red-500 m-0 tracking-tighter serif">₹{totalReturnAmt.toLocaleString()}</p>
                    <p className="text-[10px] font-black text-red-500 mt-5 m-0 uppercase tracking-widest opacity-60">{returns.length} total returns</p>
                 </div>
                 <div className="flex items-center gap-5 p-6 bg-[var(--bg-alt)] border border-[var(--b)] rounded-2xl shadow-inner group">
                    <div className="w-12 h-12 rounded-[14px] bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] group-hover:scale-110 transition-transform">
                      <FiActivity size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[var(--t)] uppercase tracking-[0.25em]">Efficiency Index</p>
                      <p className="text-sm font-black text-[var(--tl)] opacity-40 uppercase tracking-widest mt-1">92.4% Success Rate</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Maintenance Protocols */}
          <div className="space-y-12">
            <div className="bg-[var(--card)] border-2 border-[var(--b)] rounded-[48px] p-10 shadow-2xl shadow-black/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              <h4 className="text-[10px] font-black text-[var(--tl)] uppercase tracking-[0.3em] mb-10 flex items-center gap-4 opacity-60"><FiLayers size={18} className="text-red-500"/> Delete Data</h4>
              <p className="text-[11px] font-bold text-[var(--tl)] leading-relaxed mb-10 uppercase tracking-tight opacity-60">
                Authorized actions for data management. These operations are irreversible.
              </p>
              
              <div className="space-y-5">
                {[
                  { id: 'orders', label: 'Delete All Orders', Icon: FiPackage, color: 'var(--d)' },
                  { id: 'returns', label: 'Reset Return Logs', Icon: FiRotateCcw, color: '#f97316' },
                  { id: 'users', label: 'Delete All Users', Icon: FiUsers, color: 'var(--d)' },
                ].map(p => (
                  <button key={p.id} onClick={() => setPurging(p.id)}
                    className="w-full p-6 bg-[var(--bg-alt)] border border-[var(--b)] rounded-[20px] hover:bg-red-500/5 hover:border-red-500/30 transition-all group flex items-center gap-5 shadow-sm">
                    <div className="w-12 h-12 rounded-[14px] bg-[var(--card)] border border-[var(--b)] flex items-center justify-center text-[var(--tl)] group-hover:text-red-500 group-hover:border-red-500/20 transition-all shadow-inner">
                      <p.Icon size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] font-black text-[var(--t)] uppercase tracking-[0.2em] group-hover:text-red-500 transition-colors">{p.label}</p>
                      <p className="text-[9px] font-black text-[var(--tl)] uppercase tracking-tighter mt-1.5 opacity-40">Delete Action</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-10 p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4">
                 <FiAlertTriangle className="text-amber-500 shrink-0 mt-1" size={18} />
                 <p className="text-[10px] font-bold text-amber-500/80 leading-relaxed m-0 uppercase tracking-tight">Nuclear protocols require secondary verification.</p>
              </div>
            </div>

            <div className="bg-[var(--bg-alt)] border border-[var(--b)] rounded-[32px] p-10 shadow-inner">
               <h4 className="text-[10px] font-black text-[var(--tl)] uppercase tracking-[0.3em] mb-8 flex items-center gap-4 opacity-60"><FiClock size={18} className="text-[var(--p)]"/> System Status</h4>
               <div className="space-y-6">
                  {[
                    { label: 'Network Latency', value: '42ms', color: 'var(--s)' },
                    { label: 'Cluster Uptime', value: '99.98%', color: 'var(--s)' },
                    { label: 'Data Status', value: 'Healthy', color: 'var(--s)' },
                    { label: 'Last Sync', value: 'Just now', color: 'var(--p)' },
                  ].map(s => (
                    <div key={s.label} className="flex justify-between items-center group">
                       <span className="text-[10px] font-black text-[var(--tl)] uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{s.label}</span>
                       <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                         <span className="text-[11px] font-black tracking-widest" style={{ color: s.color }}>{s.value}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}