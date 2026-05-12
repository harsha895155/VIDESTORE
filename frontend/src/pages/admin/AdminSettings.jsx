import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiSave, FiRefreshCw, FiPercent,
  FiDollarSign, FiInfo, FiShield, FiTrendingUp, FiLayers, FiSettings, FiCheckCircle, FiMinus, FiPlus, FiActivity, FiChevronDown
} from 'react-icons/fi';

const DEFAULT_SLABS = [
  { upTo: 500,    label: 'Up to ₹500',        fee: 0 },
  { upTo: 1000,   label: '₹501 – ₹1,000',     fee: 0 },
  { upTo: 5000,   label: '₹1,001 – ₹5,000',   fee: 0 },
  { upTo: 10000,  label: '₹5,001 – ₹10,000',  fee: 0 },
  { upTo: 20000,  label: '₹10,001 – ₹20,000', fee: 0 },
  { upTo: null,   label: 'Above ₹20,000',      fee: 0 },
];

const getFeeForPrice = (price, slabs) => {
  if (!slabs || slabs.length === 0) return 0;
  const sorted = [...slabs].sort((a, b) => {
    if (a.upTo === null) return 1;
    if (b.upTo === null) return -1;
    return a.upTo - b.upTo;
  });
  for (const s of sorted) {
    if (s.upTo === null || price <= s.upTo) return Number(s.fee) || 0;
  }
  return 0;
};

function EarningsPreview({ rate, slabs }) {
  const examples = [300, 800, 2000, 7000, 15000, 25000];
  return (
    <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl overflow-hidden shadow-sm">
      <div className="bg-[var(--bg-alt)]/50 px-10 py-6 border-b border-[var(--b)] flex items-center gap-4">
        <FiTrendingUp className="text-[var(--p)]" size={18} />
        <h4 className="text-[10px] font-bold text-[var(--tl)] uppercase tracking-widest m-0 opacity-40">Revenue Projection</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[var(--bg-alt)]/30">
              {['Sale Price', 'Logistics', 'Asset Value', `Comm. ${rate}%`, 'Fixed Slab', 'Net Payout'].map(h => (
                <th key={h} className="text-[9px] font-bold text-[var(--tl)] uppercase tracking-widest px-10 py-6 text-left opacity-40">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--b)]">
            {examples.map(price => {
              const dc         = 60;
              const productVal = price - dc;
              const comm       = Math.round(productVal * (rate / 100));
              const fixed      = getFeeForPrice(price, slabs);
              const earn       = Math.max(0, productVal - comm - fixed);
              const slab       = [...(slabs || [])].sort((a, b) => a.upTo === null ? 1 : b.upTo === null ? -1 : a.upTo - b.upTo).find(s => s.upTo === null || price <= s.upTo);
              return (
                <tr key={price} className="hover:bg-[var(--bg-alt)] transition-colors">
                  <td className="px-10 py-6">
                    <span className="text-sm font-bold text-[var(--t)] tracking-tight">₹{price.toLocaleString()}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[11px] font-black text-[var(--p)] opacity-80 tracking-tighter serif">−₹{dc}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[11px] font-black text-[var(--tl)] opacity-40 serif">₹{productVal.toLocaleString()}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`text-[11px] font-black tracking-tighter serif ${rate > 0 ? 'text-[var(--d)]' : 'text-[var(--tl)] opacity-20'}`}>
                      {rate > 0 ? `−₹${comm}` : '₹0'}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                       <span className={`text-[11px] font-black tracking-tighter serif ${fixed > 0 ? 'text-[var(--w)]' : 'text-[var(--tl)] opacity-20'}`}>
                        {fixed > 0 ? `−₹${fixed}` : '₹0'}
                      </span>
                      {slab && (
                        <span className="text-[9px] font-black text-[var(--tl)] uppercase tracking-tighter opacity-30">
                          ({slab.label})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-base font-bold text-emerald-500 tracking-tight">₹{earn.toLocaleString()}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SlabEditor({ slabs, onChange }) {
  const sorted = [...(slabs || [])].sort((a, b) => {
    if (a.upTo === null) return 1;
    if (b.upTo === null) return -1;
    return a.upTo - b.upTo;
  });

  const update = (idx, field, val) => {
    const next = [...sorted];
    next[idx][field] = val;
    onChange(next);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sorted.map((s, i) => (
        <div key={i} className="flex items-center gap-6 p-8 bg-[var(--bg-alt)] border border-[var(--b)] rounded-2xl transition-all hover:border-[var(--p)]/20 group shadow-inner">
          <div className="flex-1">
             <div className="flex justify-between mb-3 px-1">
                <label className="text-[9px] font-bold text-[var(--tl)] uppercase tracking-widest opacity-40">{s.label}</label>
                <span className="text-[9px] font-bold text-[var(--p)] uppercase tracking-widest opacity-40">{s.upTo === null ? 'Terminal' : `≤ ₹${s.upTo}`}</span>
             </div>
             <div className="relative">
                <FiDollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--p)]" size={16} />
                <input type="number" value={s.fee} onChange={e => update(i, 'fee', e.target.value)}
                  className="w-full bg-[var(--card)] border-2 border-[var(--b)] rounded-xl pl-12 pr-6 py-4 text-sm font-bold text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-sm" />
             </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[var(--card)] border border-[var(--b)] flex items-center justify-center text-[var(--tl)] group-hover:text-[var(--p)] group-hover:scale-110 transition-all shadow-sm">
             <FiLayers size={20} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState({ commissionRate: 0, fixedCharge: 0, slabs: [] });
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    settingsAPI.get().then(res => {
      setSettings({
        commissionRate: res.settings?.commissionRate ?? 0,
        fixedCharge:    res.settings?.fixedCharge    ?? 0,
        slabs:          res.settings?.slabs?.length ? res.settings.slabs : DEFAULT_SLABS
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update(settings);
      toast.success('Strategy Matrix Synchronized');
    } catch {
      toast.error('Synchronization failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="w-20 h-20 rounded-2xl bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] mb-8 border border-[var(--p)]/10 shadow-inner">
           <FiRefreshCw className="animate-spin" size={32} />
        </div>
        <p className="text-[10px] font-bold text-[var(--tl)] uppercase tracking-widest opacity-40">Synchronizing Protocol Matrix...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between sticky top-0 z-10" 
        style={{ backgroundColor: 'var(--glass)', borderBottom: `1px solid var(--b)`, backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-[var(--p)] flex items-center justify-center text-[#040404] shadow-xl shadow-gold/20">
            <FiSettings size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FiShield size={12} className="text-[var(--p)]" />
              <p className="font-bold text-[10px] tracking-[0.2em] uppercase opacity-60" style={{ color: 'var(--tm)' }}>Infrastructure Control</p>
            </div>
            <h1 className="font-body text-2xl font-bold tracking-tight uppercase" style={{ color: 'var(--t)' }}>Economic Parameters</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/admin" className="font-bold text-[10px] uppercase tracking-widest px-6 py-4 bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl text-[var(--tm)] hover:bg-[var(--card-alt)] transition-all flex items-center gap-3 shadow-sm" style={{ textDecoration: 'none' }}>
            <FiArrowLeft size={16} /> Dashboard
          </Link>
          <button onClick={handleSave} disabled={saving}
            className={`flex items-center gap-3 px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#040404] transition-all rounded-xl shadow-2xl ${saving ? 'bg-[var(--bg-alt)] text-[var(--tl)] opacity-40' : 'bg-[var(--p)] shadow-gold/30 hover:-translate-y-1'}`}>
            {saving ? <FiRefreshCw size={18} className="animate-spin" /> : <FiSave size={18} />}
            {saving ? 'Synchronizing...' : 'Commit Parameters'}
          </button>
        </div>
      </div>

      <div className="max-w-[1536px] mx-auto px-8 py-4">

        {/* Global Strategy Banner */}
        <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-6 mb-6 flex flex-col md:flex-row items-center gap-10 shadow-sm">
          <div className="w-24 h-24 bg-[var(--p)]/5 rounded-2xl flex items-center justify-center text-[var(--p)] shadow-inner border border-[var(--p)]/10">
            <FiShield size={48} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-[var(--t)] mb-3 m-0 tracking-tight uppercase">Governance Protocol</h3>
            <p className="text-xs font-bold text-[var(--tl)] leading-relaxed m-0 opacity-40 uppercase tracking-widest">
              Define the institutional logic for vendor yield calculations. Commission rates apply to product valuation post-logistics. Fixed overhead slabs ensure infrastructure cost recovery.
            </p>
          </div>
          <div className="px-10 py-6 bg-[var(--bg-alt)] border border-[var(--b)] rounded-2xl shadow-inner">
             <div className="flex items-center gap-4">
               <FiCheckCircle size={24} className="text-emerald-500" />
               <div>
                  <p className="text-[9px] font-bold text-[var(--tl)] uppercase tracking-widest mb-1 opacity-40">Logic Status</p>
                  <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">Live Protocol</span>
               </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          
          {/* Main Parameters */}
          <div className="xl:col-span-2 space-y-12">
            
            <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-6 shadow-sm">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] border border-[var(--p)]/10">
                    <FiPercent size={22} />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--t)] m-0 tracking-tight uppercase">Primary Catalyst Rate</h2>
               </div>
               
               <div className="p-6 bg-[var(--bg-alt)] border border-[var(--b)] rounded-3xl flex flex-col md:flex-row items-center gap-12 group hover:border-[var(--p)]/20 transition-all shadow-inner">
                  <div className="flex-1 w-full">
                     <label className="block text-[9px] font-bold text-[var(--tl)] uppercase tracking-widest mb-5 px-1 opacity-40">Global Commission Catalyst (%)</label>
                     <div className="relative">
                        <FiPercent className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--p)]" size={24} />
                        <input type="number" value={settings.commissionRate} onChange={e => setSettings(s => ({ ...s, commissionRate: e.target.value }))}
                          className="w-full bg-[var(--card)] border-2 border-[var(--b)] rounded-2xl pl-16 pr-10 py-8 text-4xl font-bold text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-sm tracking-tight" />
                     </div>
                  </div>
                  <div className="w-28 h-28 rounded-2xl bg-[var(--p)] text-[#040404] flex items-center justify-center shadow-2xl shadow-gold/30 group-hover:scale-110 transition-transform duration-700">
                     <FiTrendingUp size={48} />
                  </div>
               </div>

               <div className="mt-12 p-8 bg-[var(--p)]/5 border border-[var(--p)]/10 rounded-2xl flex gap-5">
                  <FiInfo className="text-[var(--p)] shrink-0 mt-1" size={22} />
                  <p className="text-[11px] font-bold text-[var(--tl)] leading-relaxed m-0 opacity-60 uppercase tracking-tight">
                    This catalyst rate is applied to the net product valuation (Sale Price − Logistics Charge). Adjust with institutional caution.
                  </p>
               </div>
            </div>

            <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-6 shadow-sm">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] border border-[var(--p)]/10">
                    <FiActivity size={22} />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--t)] m-0 tracking-tight uppercase">Fixed Slab Matrix</h2>
               </div>
               <SlabEditor slabs={settings.slabs} onChange={next => setSettings(s => ({ ...s, slabs: next }))} />
            </div>

          </div>

          {/* Verification Sidebar */}
          <div className="space-y-12">
            <EarningsPreview rate={settings.commissionRate} slabs={settings.slabs} />
            
            <div className="bg-[#070707] border border-[var(--b)] rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--p)]/5 rounded-full -mr-20 -mt-20 blur-3xl transition-all group-hover:scale-150 duration-1000" />
               <FiShield size={140} className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-transform duration-1000 text-[var(--p)]" />
               <h4 className="text-[10px] font-bold uppercase tracking-widest mb-10 opacity-40">Compliance Protocol</h4>
               <div className="space-y-6">
                  {[
                    'Automated Reconciliation',
                    'Immutable Audit Trail',
                    'Dynamic Payout Logic',
                    'Institutional Custody'
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-4">
                       <div className="w-2 h-2 rounded-full bg-[var(--p)] shadow-lg shadow-gold/50" />
                       <span className="text-[11px] font-bold uppercase tracking-widest opacity-60">{s}</span>
                    </div>
                  ))}
               </div>
               <div className="mt-16 pt-10 border-t border-white/5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-3">Institutional Core</p>
                  <p className="text-2xl font-bold m-0 tracking-tight uppercase">Economic Node v4.2</p>
               </div>
            </div>

            <button onClick={() => setSettings(s => ({ ...s, slabs: DEFAULT_SLABS }))}
              className="w-full py-6 border-2 border-dashed border-[var(--b)] rounded-2xl text-[var(--tl)] text-[10px] font-bold uppercase tracking-widest hover:border-[var(--p)]/50 hover:text-[var(--p)] hover:bg-[var(--p)]/5 transition-all flex items-center justify-center gap-4 opacity-40 hover:opacity-100">
               <FiRefreshCw size={18} /> Restore Default Matrix
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}