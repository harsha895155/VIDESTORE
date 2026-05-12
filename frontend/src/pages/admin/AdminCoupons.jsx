import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { couponAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiTrash2, FiTag, FiCalendar, FiTarget, FiActivity, FiX, FiTrendingUp, FiLayers, FiShield, FiPercent } from 'react-icons/fi';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    code: '', description: '', discountType: 'percentage', 
    discountValue: '', minOrderValue: '', maxDiscount: '', 
    usageLimit: '', validTill: '' 
  });

  const fetchCoupons = () => { 
    setLoading(true);
    couponAPI.getAll().then(r => setCoupons(r.coupons || [])).finally(() => setLoading(false)); 
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await couponAPI.create({ ...form, code: form.code.toUpperCase() });
      toast.success('Strategy Catalyst Initialized');
      setShowForm(false);
      setForm({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderValue: '', maxDiscount: '', usageLimit: '', validTill: '' });
      fetchCoupons();
    } catch (err) { 
      toast.error(err.message || 'Strategy Validation Failed'); 
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Decommission tactical coupon ${code}? This operation is irreversible.`)) return;
    try { 
      await couponAPI.delete(id); 
      toast.success('Strategy assets purged'); 
      fetchCoupons(); 
    } catch { 
      toast.error('Purge failed'); 
    }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const isExpired = (date) => new Date(date) < new Date();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between sticky top-0 z-10" 
        style={{ backgroundColor: 'var(--glass)', borderBottom: `1px solid var(--b)`, backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-[14px] bg-[var(--p)] flex items-center justify-center text-[#040404] shadow-xl shadow-gold/20">
            <FiTag size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FiShield size={12} className="text-[var(--p)]" />
              <p className="font-black text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--tm)' }}>Marketing Strategy</p>
            </div>
            <h1 className="font-body text-2xl font-bold tracking-tighter uppercase" style={{ color: 'var(--t)' }}>Revenue Catalysts</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/admin" className="font-bold text-[11px] uppercase tracking-wider px-6 py-3 bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl text-[var(--tm)] hover:bg-[var(--card-alt)] transition-all flex items-center gap-2 shadow-sm" style={{ textDecoration: 'none' }}>
            <FiArrowLeft size={16}/> Dashboard
          </Link>
          <button onClick={() => setShowForm(!showForm)} 
            className={`flex items-center gap-2 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[#040404] transition-all rounded-xl shadow-lg ${showForm ? 'bg-[#040404] text-white' : 'bg-[var(--p)] shadow-gold/20'}`}>
            {showForm ? <FiX size={18}/> : <FiPlus size={18}/>}
            {showForm ? 'Cancel' : 'Add Catalyst'}
          </button>
        </div>
      </div>

      <div className="max-w-[1536px] mx-auto px-8 py-4">

        {/* Global Strategy Banner */}
        <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
          <div className="w-20 h-20 bg-[var(--p)]/5 rounded-2xl flex items-center justify-center text-[var(--p)] shadow-inner border border-[var(--p)]/10">
            <FiTrendingUp size={32} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-[var(--t)] mb-2 m-0 tracking-tight uppercase">Catalyst Intelligence</h3>
            <p className="text-xs font-medium text-[var(--tl)] leading-relaxed m-0 opacity-40 uppercase tracking-wider">
              Tactical incentivization protocols. Deploy discounts to optimize conversion velocity across user nodes.
            </p>
          </div>
          <div className="px-8 py-4 bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl shadow-sm">
             <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--tl)] mb-1.5 opacity-40">Active Protocols</p>
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/30" />
               <p className="text-2xl font-bold text-[var(--t)] m-0 tracking-tight">{coupons.filter(c => !isExpired(c.validTill)).length}</p>
             </div>
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-8 mb-8 shadow-xl animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] border border-[var(--p)]/10">
                <FiPlus size={20} />
              </div>
              <h2 className="text-xl font-bold text-[var(--t)] m-0 tracking-tight uppercase">Add New Coupon</h2>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div>
                  <label className="block text-[9px] font-bold text-[var(--tl)] uppercase tracking-[0.2em] mb-3 px-1 opacity-40">Code</label>
                  <input required value={form.code} onChange={set('code')} placeholder="e.g. LUXURY20"
                    className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl px-5 py-4 text-sm font-medium text-[var(--t)] focus:border-[var(--p)] outline-none transition-all uppercase shadow-sm" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-[var(--tl)] uppercase tracking-[0.2em] mb-3 px-1 opacity-40">Value</label>
                  <input required type="number" value={form.discountValue} onChange={set('discountValue')} placeholder="Magnitude"
                    className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl px-5 py-4 text-sm font-medium text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-[var(--tl)] uppercase tracking-[0.2em] mb-3 px-1 opacity-40">Type</label>
                  <div className="relative">
                    <select value={form.discountType} onChange={set('discountType')}
                      className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl px-5 py-4 text-sm font-medium text-[var(--t)] focus:border-[var(--p)] outline-none transition-all appearance-none cursor-pointer shadow-sm">
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                    <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-[var(--p)]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-[var(--tl)] uppercase tracking-[0.2em] mb-3 px-1 opacity-40">Expiry Date</label>
                  <input required type="date" value={form.validTill} onChange={set('validTill')}
                    className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl px-5 py-4 text-sm font-medium text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="block text-[9px] font-bold text-[var(--tl)] uppercase tracking-[0.2em] mb-3 px-1 opacity-40">Min Order (₹)</label>
                  <input required type="number" value={form.minOrderValue} onChange={set('minOrderValue')} placeholder="Threshold"
                    className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl px-5 py-4 text-sm font-medium text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-[var(--tl)] uppercase tracking-[0.2em] mb-3 px-1 opacity-40">Max Discount (₹)</label>
                  <input type="number" value={form.maxDiscount} onChange={set('maxDiscount')} placeholder="Ceiling"
                    className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl px-5 py-4 text-sm font-medium text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-[var(--tl)] uppercase tracking-[0.2em] mb-3 px-1 opacity-40">Usage Limit</label>
                  <input required type="number" value={form.usageLimit} onChange={set('usageLimit')} placeholder="Limit"
                    className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl px-5 py-4 text-sm font-medium text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-sm" />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-[var(--tl)] uppercase tracking-[0.2em] mb-3 px-1 opacity-40">Description</label>
                <textarea value={form.description} onChange={set('description')} placeholder="Strategic rationale..."
                  className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-2xl px-6 py-5 text-sm font-medium text-[var(--t)] focus:border-[var(--p)] outline-none transition-all resize-none shadow-sm" rows={3} />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 bg-[var(--bg-alt)] border border-[var(--b)] text-[var(--tl)] font-bold text-[11px] uppercase tracking-wider rounded-xl hover:bg-[var(--card-alt)] transition-all">Cancel</button>
                <button type="submit" className="px-10 py-3 bg-[var(--p)] text-[#040404] font-bold text-[11px] uppercase tracking-wider rounded-xl shadow-lg shadow-gold/20 hover:-translate-y-1 transition-all">Create Coupon</button>
              </div>
            </form>
          </div>
        )}

        {/* Master Registry */}
        <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-[var(--bg-alt)]/50 px-8 py-5 border-b border-[var(--b)] flex justify-between items-center">
             <h4 className="text-[10px] font-bold text-[var(--tl)] uppercase tracking-[0.2em] m-0 flex items-center gap-3 opacity-60">
                <FiActivity size={14} className="text-[var(--p)]"/> Catalyst Registry
             </h4>
             <span className="text-[9px] font-bold text-[var(--tl)] uppercase tracking-[0.2em] opacity-40">{coupons.length} Protocols</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-[var(--bg-alt)]/30 border-b border-[var(--b)]">
                  {['Catalyst Identifier', 'Yield Protocol', 'Economic Constraint', 'Utilization Grid', 'Lifecycle', 'Operations'].map(h => (
                    <th key={h} className="text-[10px] font-black text-[var(--tl)] uppercase tracking-[0.3em] px-12 py-6 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--b)]">
                {loading ? (
                   [...Array(4)].map((_, i) => (
                    <tr key={i}><td colSpan="6" className="px-12 py-10"><div className="h-16 w-full rounded-2xl bg-[var(--bg-alt)] animate-pulse" /></td></tr>
                  ))
                ) : coupons.length === 0 ? (
                  <tr><td colSpan="6" className="px-12 py-40 text-center text-[var(--tl)] font-black uppercase tracking-[0.3em] opacity-20">Null Strategy Distribution</td></tr>
                ) : (
                  coupons.map(c => {
                    const expired = isExpired(c.validTill);
                    return (
                      <tr key={c._id} className={`${expired ? 'opacity-40 grayscale' : 'hover:bg-[var(--bg-alt)]'} transition-all group`}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 shadow-inner ${expired ? 'bg-[var(--bg-alt)] border-[var(--b)] text-[var(--tl)]' : 'bg-[var(--p)]/5 border-[var(--p)]/10 text-[var(--p)]'}`}>
                               <FiTag size={18} />
                            </div>
                            <div>
                               <p className="text-base font-bold text-[var(--t)] m-0 tracking-tight mb-0.5">{c.code}</p>
                               <p className="text-[10px] font-medium text-[var(--tl)] m-0 line-clamp-1 opacity-40 uppercase">{c.description || 'Global incentive protocol'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-xl bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 flex items-center justify-center shadow-inner">
                                <FiPercent size={14} />
                             </div>
                             <span className="text-base font-bold text-emerald-500 tracking-tight">
                                {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                             </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1.5">
                             <span className="text-[10px] font-bold text-[var(--t)] uppercase tracking-wide flex items-center gap-2">
                                <FiTarget size={12} className="text-[var(--p)]" /> ₹{c.minOrderValue} Min
                             </span>
                             {c.maxDiscount && (
                               <span className="text-[9px] font-medium text-[var(--tl)] uppercase opacity-30">
                                  Ceiling: ₹{c.maxDiscount}
                               </span>
                             )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex flex-col gap-2.5">
                              <div className="flex justify-between items-center px-0.5">
                                 <span className="text-[9px] font-bold text-[var(--tl)] uppercase tracking-wider opacity-40">{c.usedCount} / {c.usageLimit} Used</span>
                              </div>
                              <div className="w-24 h-1.5 bg-[var(--bg-alt)] rounded-full overflow-hidden border border-[var(--b)] shadow-inner">
                                 <div className="h-full bg-[var(--p)] rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (c.usedCount / c.usageLimit) * 100)}%` }} />
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex flex-col gap-2">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl border w-fit shadow-sm ${expired ? 'bg-red-500/5 border-red-500/10 text-red-500' : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500'}`}>
                                 {expired ? 'Expired' : 'Active'}
                              </span>
                              <span className="text-[10px] font-medium text-[var(--tl)] flex items-center gap-1.5 uppercase opacity-30">
                                 <FiCalendar size={12}/> {new Date(c.validTill).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <button onClick={() => handleDelete(c._id, c.code)}
                            className="w-10 h-10 rounded-xl bg-[var(--bg-alt)] border border-[var(--b)] flex items-center justify-center text-[var(--tl)] hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm">
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function FiChevronDown(props) {
  return (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}