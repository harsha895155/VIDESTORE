import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, orderAPI, deliveryAPI, settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiShoppingBag, FiDollarSign, FiCheck, FiX,
  FiRefreshCw, FiEye, FiCopy, FiTrendingUp, FiPlay, FiLock,
  FiTrash2, FiAlertTriangle, FiClock, FiTruck, FiUser, FiShield,
  FiRotateCcw, FiActivity, FiInfo, FiCreditCard, FiExternalLink, FiPercent, FiUsers
} from 'react-icons/fi';

// ✅ Dynamic: fetched from DB — defaults to 0 until admin sets them
let _commRate  = 0;
let _fixedCharge = 0;

const calcEarnings = (price, deliveryCharge = 0) => {
  const p          = Number(price) || 0;
  const dc         = Number(deliveryCharge) || 0;
  const productVal = Math.max(0, p - dc);
  const commission = Math.round(productVal * (_commRate / 100));
  const fixed      = Number(_fixedCharge) || 0;
  return { commission, fixed, deliveryCharge: dc, productVal, earnings: Math.max(0, productVal - commission - fixed) };
};

const PAYOUT_LOCK_DAYS = 7;
const daysSince = (date) => date ? Math.floor((Date.now() - new Date(date)) / (1000*60*60*24)) : null;

const sellerStatusStyle = {
  pending:   { color: 'var(--w)', bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.1)' },
  approved:  { color: 'var(--s)', bg: 'rgba(16, 185, 129, 0.05)', border: 'rgba(16, 185, 129, 0.1)' },
  suspended: { color: 'var(--d)', bg: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.1)' },
};

const sStyle = (s) => ({
  Processing:         { color: 'var(--w)', bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.1)' },
  Confirmed:          { color: 'var(--p)', bg: 'rgba(200, 166, 70, 0.05)', border: 'rgba(200, 166, 70, 0.1)' },
  Shipped:            { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.05)', border: 'rgba(139, 92, 246, 0.1)' },
  'Out for Delivery': { color: '#f97316', bg: 'rgba(249, 115, 22, 0.05)', border: 'rgba(249, 115, 22, 0.1)' },
  Delivered:          { color: 'var(--s)', bg: 'rgba(16, 185, 129, 0.05)', border: 'rgba(16, 185, 129, 0.1)' },
  Cancelled:          { color: 'var(--d)', bg: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.1)' },
}[s] || { color: 'var(--tm)', bg: 'var(--bg-alt)', border: 'var(--b)' });

// ── Copy Button ───────────────────────────────────────────────────
function CopyBtn({ value, label }) {
  return (
    <button onClick={() => { navigator.clipboard.writeText(value); toast.success(`${label} copied!`); }}
      className="bg-transparent border-none cursor-pointer text-[var(--tl)] hover:text-[var(--p)] transition-colors p-1 ml-1">
      <FiCopy size={11} />
    </button>
  );
}

function InfoRow({ label, value, highlight, copy }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-[var(--b)] last:border-0">
      <span className="text-[10px] font-black text-[var(--tl)] uppercase tracking-widest opacity-60">{label}</span>
      <div className="flex items-center">
        <span className={`text-xs font-bold ${highlight ? 'text-[var(--p)]' : 'text-[var(--t)]'}`}>{value || '—'}</span>
        {copy && value && <CopyBtn value={value} label={label} />}
      </div>
    </div>
  );
}

function Tile({ label, value, color, sub }) {
  return (
    <div className="bg-[var(--bg-alt)] border border-[var(--b)] rounded-[20px] p-4 transition-all hover:border-[var(--p)]/20 shadow-inner">
      <p className="text-[9px] font-black text-[var(--tl)] uppercase tracking-widest mb-2 opacity-60">{label}</p>
      <p className="text-xl font-black m-0 leading-none tracking-tight serif" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] font-bold text-[var(--tl)] mt-2 m-0 opacity-40 uppercase tracking-tighter">{sub}</p>}
    </div>
  );
}

// ── Danger Modal ──────────────────────────────────────────────────
function DangerModal({ open, onClose, onConfirm, loading, title, subtitle, lines }) {
  const [typed, setTyped] = useState('');
  useEffect(() => { if (!open) setTyped(''); }, [open]);
  if (!open) return null;
  const ready = typed === 'DELETE' && !loading;
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-8 max-w-[440px] w-full shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-14 h-14 rounded-[14px] bg-red-500/5 flex items-center justify-center text-red-500 border border-red-500/10">
            <FiAlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-[var(--t)] m-0 uppercase tracking-tight">{title}</h3>
            <p className="text-[10px] font-black text-[var(--tl)] m-0 uppercase tracking-widest mt-1 opacity-60">{subtitle}</p>
          </div>
        </div>
        <div className="bg-red-500/5 border border-red-500/10 rounded-[18px] p-6 mb-6">
          {lines.map((l, i) => (
            <p key={i} className={`m-0 leading-relaxed ${i === 0 ? 'text-red-500 font-black text-sm uppercase' : 'text-red-400 text-xs mt-3 font-bold opacity-80'}`}>{l}</p>
          ))}
          <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-4 pt-4 border-t border-red-500/10">🚫 Irreversible Operation</p>
        </div>
        <div className="mb-6">
          <label className="block text-[10px] font-black text-[var(--tl)] uppercase tracking-widest mb-2 px-1 opacity-60">Type <span className="text-red-500">DELETE</span> to confirm</label>
          <input autoFocus type="text" value={typed} onChange={e => setTyped(e.target.value)} placeholder="Authorization sequence..."
            className="w-full bg-[var(--bg-alt)] border-2 border-[var(--b)] rounded-[14px] px-4 py-3 text-sm font-black text-[var(--t)] focus:border-red-500 outline-none transition-all font-mono" />
        </div>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 px-6 bg-[var(--bg-alt)] border border-[var(--b)] text-[var(--tl)] font-black text-[10px] uppercase tracking-widest rounded-[14px] hover:bg-[var(--card-alt)] transition-all">Cancel</button>
          <button onClick={() => ready && onConfirm()} disabled={!ready}
            className={`flex-1 py-4 px-6 rounded-[14px] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${ready ? 'bg-red-600 text-white shadow-xl shadow-red-500/20' : 'bg-red-500/5 text-red-500 opacity-20 cursor-not-allowed'}`}>
            {loading ? <FiRefreshCw className="animate-spin" /> : <FiTrash2 />}
            {loading ? 'Processing...' : 'Confirm Purge'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Payout Timeline ───────────────────────────────────────────────
function PayoutTimeline({ order }) {
  if (!order.deliveredAt) return null;
  const days = daysSince(order.deliveredAt);
  const pct  = Math.min(100, Math.round((days / PAYOUT_LOCK_DAYS) * 100));
  const daysLeft = Math.max(0, PAYOUT_LOCK_DAYS - days);
  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1.5 px-0.5">
        <span className={`text-[9px] font-black uppercase tracking-widest ${days < PAYOUT_LOCK_DAYS ? 'text-[var(--w)]' : 'text-emerald-500'}`}>
          {days < PAYOUT_LOCK_DAYS ? `🔒 ${daysLeft}d Hold` : '🔓 Released'}
        </span>
        <span className="text-[9px] font-bold text-[var(--tl)] opacity-40">{days}d Progress</span>
      </div>
      <div className="h-1 bg-[var(--bg-alt)] rounded-full overflow-hidden border border-[var(--b)] shadow-inner">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: days < PAYOUT_LOCK_DAYS ? 'var(--w)' : 'var(--s)' }} />
      </div>
    </div>
  );
}

// ── Seller Detail Modal ───────────────────────────────────────────
function SellerModal({ seller, orders, onClose, onStatusChange, onPayout, onSimulate, simulating, onResetPayout, deliveryMode, onToggleNoReturns }) {
  const [showReset, setShowReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const enriched = orders.map(o => {
    const dc = o.deliveryCharge || o.shippingPrice || 0;
    const calc = calcEarnings(o.totalPrice || 0, dc);
    const isDelivered = o.orderStatus === 'Delivered';
    const daysAfter = o.deliveredAt ? daysSince(o.deliveredAt) : null;
    const unlocked  = isDelivered && daysAfter !== null && daysAfter >= PAYOUT_LOCK_DAYS;
    return { ...o, calc, isDelivered, daysAfter, unlocked };
  });

  const valid       = enriched.filter(o => o.orderStatus !== 'Cancelled');
  const delivered   = enriched.filter(o => o.isDelivered);
  const unlocked    = enriched.filter(o => o.unlocked);

  const gross       = valid.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const totalDC     = valid.reduce((s, o) => s + o.calc.deliveryCharge, 0);
  const totalComm   = valid.reduce((s, o) => s + o.calc.commission, 0);
  const totalFixed  = valid.reduce((s, o) => s + o.calc.fixed, 0);
  const totalEarn   = valid.reduce((s, o) => s + o.calc.earnings, 0);
  const delivEarn   = delivered.reduce((s, o) => s + o.calc.earnings, 0);
  const unlockEarn  = unlocked.reduce((s, o) => s + o.calc.earnings, 0);
  const paidOut     = seller.sellerInfo?.totalPaidOut || 0;
  const pending     = Math.max(0, unlockEarn - paidOut);
  const locked      = Math.max(0, delivEarn - unlockEarn);
  const canPayout   = pending > 0;

  const st = sellerStatusStyle[seller.sellerInfo?.status || 'pending'];

  return (
    <>
      {showReset && (
        <DangerModal open onClose={() => setShowReset(false)}
          onConfirm={async () => { setResetting(true); try { await onResetPayout(seller._id); setShowReset(false); } finally { setResetting(false); } }}
          loading={resetting} title="Reset Yield History" subtitle={seller.sellerInfo?.businessName || seller.name}
          lines={[`Initiating full reset of payout historical data for ${seller.name}.`, 'This will zero out totalPaidOut and purge associated transaction logs.']} />
      )}
      <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-8 max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300 scrollbar-hide">

          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-[14px] bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] border border-[var(--p)]/10 shadow-inner">
                <FiUser size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-[var(--t)] m-0 tracking-tight uppercase serif">{seller.sellerInfo?.businessName || seller.name}</h3>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border" 
                    style={{ color: st.color, backgroundColor: st.bg, borderColor: st.border }}>{seller.sellerInfo?.status || 'pending'}</span>
                </div>
                <p className="text-xs font-bold text-[var(--tl)] m-0 mt-1 uppercase tracking-tighter opacity-60">{seller.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowReset(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500/5 border border-red-500/10 rounded-[12px] text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                <FiTrash2 size={12} /> Purge Yield
              </button>
              <button onClick={onClose} className="w-10 h-10 bg-[var(--bg-alt)] border border-[var(--b)] rounded-[12px] text-[var(--tl)] flex items-center justify-center hover:bg-[var(--card-alt)] hover:text-[var(--t)] transition-all text-lg">×</button>
            </div>
          </div>

          {/* Revenue Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Tile label="Gross Network Volume" value={`₹${gross.toLocaleString()}`} color="var(--t)" sub={`${valid.length} cycles`} />
            <Tile label="Logistics Deduction" value={`₹${totalDC.toLocaleString()}`} color="var(--p)" sub="Courier disbursements" />
            <Tile label="Platform Fee" value={`₹${totalComm.toLocaleString()}`} color="var(--d)" sub="Infrastructure maintenance" />
            <Tile label="Fixed Overhead" value={`₹${totalFixed.toLocaleString()}`} color="var(--w)" sub="Order processing cost" />
          </div>

          {/* Yield Disposition */}
          <div className="bg-[var(--bg-alt)] border border-[var(--b)] rounded-2xl p-8 mb-8 shadow-inner">
            <div className="flex items-center gap-3 mb-6">
              <FiShield className="text-[var(--p)]" size={16} />
              <h4 className="text-[10px] font-black text-[var(--tl)] uppercase tracking-[0.25em] m-0">Economic Yield Matrix — 7-Day Protection</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Tile label="Theoretical Yield" value={`₹${totalEarn.toLocaleString()}`} color="var(--s)" sub="All validated cycles" />
              <Tile label="Released Capital" value={`₹${unlockEarn.toLocaleString()}`} color="var(--s)" sub={`${unlocked.length} unlocked`} />
              <Tile label="Hold Protection" value={`₹${locked.toLocaleString()}`} color="var(--w)" sub="Return window hold" />
              <Tile label="Disbursed Capital" value={`₹${paidOut.toLocaleString()}`} color="var(--p)" sub="Historical payouts" />
            </div>

            <div className={`flex justify-between items-center p-6 rounded-xl border transition-all ${canPayout ? 'bg-[var(--p)]/5 border-[var(--p)]/20 shadow-xl shadow-gold/5' : 'bg-[var(--card)] border-[var(--b)]'}`}>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--tl)] mb-2 opacity-60">
                  {canPayout ? '⚠️ Deployment Required' : locked > 0 ? '🔒 Cycle Hold' : '✅ Balanced Matrix'}
                </p>
                <p className={`text-4xl font-black m-0 tracking-tighter serif ${canPayout ? 'text-[var(--p)]' : locked > 0 ? 'text-[var(--w)]' : 'text-emerald-500'}`}>
                  ₹{pending.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[var(--tl)] leading-relaxed m-0 uppercase opacity-40">
                  Matrix Formula: (Gross − Logistics) × 0.9 − Overhead<br />
                  <span className="text-emerald-500 font-black">Optimization: ₹1k Assets → ₹816 Net Yield</span>
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Register */}
          {orders.length > 0 && (
            <div className="border border-[var(--b)] rounded-2xl overflow-hidden mb-8 shadow-sm">
              <div className="bg-[var(--bg-alt)]/50 px-6 py-4 border-b border-[var(--b)] flex justify-between items-center">
                <h4 className="text-[10px] font-black text-[var(--tl)] uppercase tracking-widest m-0 flex items-center gap-2 uppercase">
                  <FiActivity size={12} className="text-[var(--p)]" /> Cycle Register ({orders.length})
                </h4>
                <div className="flex items-center gap-2 px-3 py-1 bg-[var(--card)] border border-[var(--b)] rounded-lg shadow-sm">
                  <div className={`w-1.5 h-1.5 rounded-full ${deliveryMode === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--tl)] opacity-60">
                    {deliveryMode === 'live' ? 'Synchronized' : 'Simulation'}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg-alt)]/30">
                      {['Cycle', 'Volume', 'Logistics', 'Net Yield', 'State', 'Protection', 'Operations'].map(h => (
                        <th key={h} className="text-[9px] font-black text-[var(--tl)] uppercase tracking-widest px-6 py-4 text-left border-b border-[var(--b)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--b)]">
                    {enriched.map(order => {
                      const { commission, fixed, deliveryCharge: dc, productVal, earnings } = order.calc;
                      const cancelled = order.orderStatus === 'Cancelled';
                      const s = sStyle(order.orderStatus);
                      const canSim = !cancelled && !order.isDelivered && deliveryMode !== 'live';
                      return (
                        <tr key={order._id} className={`${cancelled ? 'opacity-40 grayscale' : 'hover:bg-[var(--bg-alt)]/30'} transition-all`}>
                          <td className="px-6 py-5">
                            <span className="text-[10px] font-black text-[var(--p)] block mb-1 serif">#{order._id.slice(-6).toUpperCase()}</span>
                            <span className="text-[9px] font-bold text-[var(--tl)] block uppercase opacity-40">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          </td>
                          <td className="px-6 py-5 text-xs font-black text-[var(--t)] serif">₹{(order.totalPrice || 0).toLocaleString()}</td>
                          <td className="px-6 py-5 text-xs font-bold text-[var(--p)] opacity-80">−₹{dc}</td>
                          <td className="px-6 py-5">
                            <span className={`text-xs font-black serif ${cancelled ? 'text-red-500' : 'text-emerald-500'}`}>{cancelled ? 'VOID' : `₹${earnings}`}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border" 
                              style={{ color: s.color, backgroundColor: s.bg, borderColor: s.border }}>{order.orderStatus}</span>
                          </td>
                          <td className="px-6 py-5 min-w-[140px]">
                            {cancelled ? <span className="text-[9px] font-black text-[var(--tl)] uppercase opacity-20">Voided</span>
                            : !order.isDelivered ? <span className="text-[9px] font-black text-[var(--tl)] uppercase tracking-widest flex items-center gap-1.5 opacity-40"><FiClock size={10}/> Pending Fulfillment</span>
                            : order.unlocked ? <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5"><FiCheck size={10}/> Ready ({order.daysAfter}d)</span>
                            : <PayoutTimeline order={order} />}
                          </td>
                          <td className="px-6 py-5">
                            {canSim ? (
                              <button onClick={() => onSimulate(order._id)} disabled={simulating === order._id}
                                className="flex items-center gap-2 px-3 py-1.5 bg-[var(--p)]/5 border border-[var(--p)]/10 rounded-[8px] text-[var(--p)] text-[9px] font-black uppercase tracking-widest hover:bg-[var(--p)] hover:text-[#040404] transition-all">
                                {simulating === order._id ? <FiRefreshCw size={10} className="animate-spin" /> : <FiPlay size={10} />}
                                {simulating === order._id ? 'Syncing' : 'Simulate State'}
                              </button>
                            ) : order.isDelivered ? (
                              <FiCheck className="text-emerald-500" />
                            ) : <span className="text-[var(--tl)] opacity-20 text-xs">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Infrastructure: Financial Node */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-[var(--bg-alt)] border border-[var(--b)] rounded-2xl p-6 shadow-inner">
              <h4 className="text-[10px] font-black text-[var(--tl)] uppercase tracking-widest mb-4 flex items-center gap-2 uppercase opacity-60"><FiCreditCard size={14} className="text-[var(--p)]"/> Destination Account</h4>
              <InfoRow label="Protocol Holder" value={seller.sellerInfo?.bank?.name} highlight />
              <InfoRow label="Institutional Node" value={seller.sellerInfo?.bank?.bankName} />
              <InfoRow label="Account Parameter" value={seller.sellerInfo?.bank?.account} copy highlight />
              <InfoRow label="Routing Identifier" value={seller.sellerInfo?.bank?.ifsc} copy highlight />
            </div>

            <div className="bg-[var(--p)]/5 border border-[var(--p)]/10 rounded-2xl p-6 shadow-inner flex flex-col">
              <h4 className="text-[10px] font-black text-[var(--p)] uppercase tracking-widest mb-4 flex items-center gap-2 uppercase opacity-60"><FiExternalLink size={14}/> Resolution Protocol</h4>
              <p className="text-[11px] font-bold text-[var(--tl)] leading-relaxed flex-1 opacity-80">
                Authorized yields should be disbursed via external financial channels. Document the UTR/Reference parameter within the platform to finalize reconciliation.
              </p>
              <div className="mt-4 p-3 bg-[var(--card)] border border-[var(--p)]/20 rounded-xl flex items-center justify-between shadow-sm">
                <span className="text-[10px] font-black text-[var(--p)] uppercase tracking-widest">Active Resolution</span>
                <span className="text-sm font-black text-[var(--t)] serif">₹{pending.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Operations */}
          <div className="flex gap-4">
            {seller.sellerInfo?.status !== 'approved' && (
              <button onClick={() => onStatusChange(seller._id, 'approved')}
                className="flex-1 py-4 px-6 bg-emerald-600 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20">
                <FiCheck /> Authorize Node
              </button>
            )}
            {seller.sellerInfo?.status !== 'suspended' && (
              <button onClick={() => onStatusChange(seller._id, 'suspended')}
                className="flex-1 py-4 px-6 bg-red-500/5 text-red-500 border border-red-500/10 font-bold text-[11px] uppercase tracking-wider rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3">
                <FiX /> Suspend Node
              </button>
            )}
            <button onClick={() => canPayout && onPayout(seller, pending)} disabled={!canPayout}
              className={`flex-[1.5] py-4 px-6 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-3 ${canPayout ? 'bg-[var(--p)] text-[#040404] shadow-lg shadow-gold/20' : 'bg-[var(--bg-alt)] text-[var(--tl)] opacity-20 cursor-not-allowed border-none'}`}>
              {canPayout ? <><FiDollarSign /> Disburse ₹{pending.toLocaleString()}</> : <><FiLock /> {locked > 0 ? `₹${locked.toLocaleString()} Hold` : 'Capital Balanced'}</>}
            </button>
          </div>

          {/* Policy: Returns */}
          <div className={`mt-8 p-6 rounded-2xl border flex items-center justify-between gap-6 transition-all ${seller.sellerInfo?.noReturnsApproved ? 'bg-red-500/5 border-red-500/10' : 'bg-[var(--bg-alt)] border-[var(--b)]'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center border transition-all ${seller.sellerInfo?.noReturnsApproved ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-[var(--card)] border-[var(--b)] text-[var(--tl)] opacity-40'}`}>
                <FiRotateCcw size={18} />
              </div>
              <div>
                <h4 className="text-sm font-black text-[var(--t)] mb-1 m-0 uppercase tracking-tight serif">Protocol: "No Returns" Privilege</h4>
                <p className="text-[10px] font-bold text-[var(--tl)] m-0 uppercase opacity-60">
                  {seller.sellerInfo?.noReturnsApproved
                    ? seller.sellerInfo?.noReturnsEnabled ? '🔴 ACTIVE PROTOCOL — Consumer return rights restricted.' : '✅ AUTHORIZED — Protocol permission granted, node activation pending.'
                    : 'STANDARD — This node is governed by global consumer protection protocols.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onToggleNoReturns(seller._id, !seller.sellerInfo?.noReturnsApproved)}
              className={`px-5 py-2.5 rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-all border ${seller.sellerInfo?.noReturnsApproved ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white' : 'bg-[var(--p)]/5 border-[var(--p)]/20 text-[var(--p)] hover:bg-[var(--p)] hover:text-[#040404]'}`}>
              {seller.sellerInfo?.noReturnsApproved ? 'Revoke Protocol' : 'Grant Privilege'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Payout Confirm Modal ──────────────────────────────────────────
function PayoutModal({ seller, amount, onClose, onConfirm }) {
  const [note, setNote]         = useState('');
  const [processing, setProc]   = useState(false);
  const go = async () => { setProc(true); try { await onConfirm(amount, note); onClose(); } finally { setProc(false); } };
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-8 max-w-[420px] w-full shadow-2xl animate-in zoom-in-95 duration-300">
        <h3 className="text-xl font-black text-[var(--t)] mb-2 m-0 tracking-tight uppercase serif">Confirm Disbursement</h3>
        <p className="text-[10px] font-black text-[var(--tl)] mb-8 uppercase tracking-widest opacity-60">Target Node: <span className="text-[var(--p)] serif">{seller.sellerInfo?.bank?.name}</span></p>
        
        <div className="bg-[var(--p)]/5 border border-[var(--p)]/10 rounded-[24px] p-8 mb-8 text-center shadow-inner">
          <p className="text-[10px] font-black text-[var(--p)] uppercase tracking-widest mb-3 opacity-60">Disbursement Volume</p>
          <p className="text-5xl font-black text-[var(--p)] m-0 tracking-tighter serif">₹{amount.toLocaleString()}</p>
        </div>

        <div className="mb-6">
          <label className="block text-[10px] font-black text-[var(--tl)] uppercase tracking-widest mb-2 px-1 opacity-60">Reference (UTR)</label>
          <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Enter transaction ID..."
            className="w-full bg-[var(--bg-alt)] border-2 border-[var(--b)] rounded-[14px] px-4 py-3 text-sm font-black text-[var(--t)] focus:border-[var(--p)] outline-none transition-all" />
        </div>

        <div className="bg-amber-500/5 border border-amber-500/10 rounded-[14px] p-4 mb-8 flex gap-3">
          <FiInfo className="text-amber-500 flex-shrink-0 mt-0.5" size={14} />
          <p className="text-[10px] font-bold text-amber-500/80 leading-relaxed m-0 uppercase tracking-tight">Validate external transfer before authorizing platform reconciliation.</p>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 px-6 bg-[var(--bg-alt)] border border-[var(--b)] text-[var(--tl)] font-black text-[10px] uppercase tracking-widest rounded-[14px] hover:bg-[var(--card-alt)] transition-all">Cancel</button>
          <button onClick={go} disabled={processing}
            className={`flex-[1.5] py-4 px-6 rounded-[14px] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${processing ? 'bg-[var(--bg-alt)] text-[var(--tl)] opacity-20 cursor-not-allowed' : 'bg-[var(--p)] text-[#040404] shadow-xl shadow-gold/20'}`}>
            {processing ? <FiRefreshCw className="animate-spin" /> : <FiDollarSign />}
            {processing ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main AdminSellers ─────────────────────────────────────────────
export default function AdminSellers() {
  const [sellers,      setSellers]     = useState([]);
  const [allOrders,    setAllOrders]   = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [selected,     setSelected]    = useState(null);
  const [payoutData,   setPayoutData]  = useState(null);
  const [simulating,   setSimulating]  = useState(null);
  const [deliveryMode, setDeliveryMode]= useState(null);

  useEffect(() => {
    fetchData();
    deliveryAPI.getMode().then(r => setDeliveryMode(r.mode)).catch(() => setDeliveryMode('prototype'));
    settingsAPI.get().then(res => {
      _commRate    = res.settings?.commissionRate ?? 0;
      _fixedCharge = res.settings?.fixedCharge   ?? 0;
    }).catch(() => {});
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sellerRes, orderRes] = await Promise.all([
        userAPI.getAll({ role: 'seller', limit: 100 }),
        orderAPI.getAll({ limit: 1000 }).catch(() => ({ orders: [] })),
      ]);
      setSellers(sellerRes.users || []);
      setAllOrders(orderRes.orders || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const getSellerOrders = (sellerId) =>
    allOrders.filter(o =>
      o.orderItems?.some(item => {
        if (!item.seller) return false;
        const id = item.seller?._id || item.seller;
        return String(id) === String(sellerId);
      })
    );

  const getStats = (seller) => {
    const orders    = getSellerOrders(seller._id);
    const valid     = orders.filter(o => o.orderStatus !== 'Cancelled');
    const delivered = orders.filter(o => o.orderStatus === 'Delivered');
    const unlocked  = delivered.filter(o => o.deliveredAt && daysSince(o.deliveredAt) >= PAYOUT_LOCK_DAYS);

    const gross    = valid.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const comm     = valid.reduce((s, o) => s + calcEarnings(o.totalPrice || 0, o.deliveryCharge || 0).commission, 0);
    const earn     = valid.reduce((s, o) => s + calcEarnings(o.totalPrice || 0, o.deliveryCharge || 0).earnings, 0);
    const unlEarn  = unlocked.reduce((s, o) => s + calcEarnings(o.totalPrice || 0, o.deliveryCharge || 0).earnings, 0);
    const paidOut  = seller.sellerInfo?.totalPaidOut || 0;
    const pending  = Math.max(0, unlEarn - paidOut);
    return { orders: orders.length, gross, comm, earn, paidOut, pending, deliveredCount: delivered.length, unlockedCount: unlocked.length };
  };

  const handleStatusChange = async (sellerId, newStatus) => {
    try {
      await userAPI.update(sellerId, { 'sellerInfo.status': newStatus });
      toast.success(`Node state: ${newStatus}`);
      fetchData();
      if (selected?._id === sellerId) setSelected(s => ({ ...s, sellerInfo: { ...s.sellerInfo, status: newStatus } }));
    } catch { toast.error('Synchronization failed'); }
  };

  const handlePayout = async (amount, note) => {
    try {
      await userAPI.processPayout(payoutData.seller._id, { amount, note });
      toast.success(`✅ Disbursement recorded: ₹${amount}`);
      fetchData(); setSelected(null);
    } catch (e) { toast.error(e?.message || 'Transaction failed'); throw e; }
  };

  const handleResetPayout = async (sellerId) => {
    try { await userAPI.clearPayoutHistory(sellerId); toast.success('Yield history purged'); fetchData(); }
    catch (e) { toast.error(e?.message || 'Purge failed'); throw e; }
  };

  const handleSimulate = async (orderId) => {
    setSimulating(orderId);
    try {
      const res = await deliveryAPI.simulate(orderId);
      toast.success(`📦 Cycle: ${res.newStatus}${res.payoutEligible ? ' · 💰 Yield unlocked!' : ''}`);
      fetchData();
    } catch (e) { toast.error(e?.message || 'Simulation failed'); }
    finally { setSimulating(null); }
  };

  const handleNoReturnsApproval = async (sellerId, approve) => {
    try {
      const res = await userAPI.toggleNoReturnsApproval(sellerId, approve);
      toast.success(approve ? '✅ Protocol permission granted' : '🚫 Protocol revoked');
      fetchData();
      if (selected?._id === sellerId) setSelected(s => ({ ...s, sellerInfo: { ...s.sellerInfo, noReturnsApproved: approve, ...(!approve && { noReturnsEnabled: false }) } }));
    } catch { toast.error('Permission update failed'); }
  };

  const totComm    = sellers.reduce((s, x) => s + getStats(x).comm, 0);
  const totPending = sellers.reduce((s, x) => s + getStats(x).pending, 0);
  const approvedCount = sellers.filter(s => s.sellerInfo?.status === 'approved').length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {selected && <SellerModal seller={selected} orders={getSellerOrders(selected._id)} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} simulating={simulating} onSimulate={handleSimulate} onPayout={(seller, amt) => { setSelected(null); setPayoutData({ seller, amount: amt }); }} onResetPayout={handleResetPayout} deliveryMode={deliveryMode} onToggleNoReturns={handleNoReturnsApproval} />}
      {payoutData && <PayoutModal seller={payoutData.seller} amount={payoutData.amount} onClose={() => setPayoutData(null)} onConfirm={handlePayout} />}

      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between sticky top-0 z-10" 
        style={{ backgroundColor: 'var(--glass)', borderBottom: `1px solid var(--b)`, backdropFilter: 'blur(32px)' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FiUser size={14} style={{ color: 'var(--p)' }} />
            <p className="font-black text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--tl)' }}>Vendor Control</p>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="font-body text-2xl font-bold tracking-tighter uppercase" style={{ color: 'var(--t)' }}>Seller Infrastructure</h1>
            {deliveryMode && (
              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-[8px] border ${deliveryMode === 'live' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' : 'bg-amber-500/5 border-amber-500/10 text-amber-500'}`}>
                {deliveryMode === 'live' ? 'Live Grid' : 'Prototype'}
              </span>
            )}
          </div>
        </div>
        <Link to="/admin" className="font-bold text-[11px] uppercase tracking-wider px-6 py-3 bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl text-[var(--tm)] hover:bg-[var(--card-alt)] transition-all flex items-center gap-2 shadow-sm" style={{ textDecoration: 'none' }}>
          <FiArrowLeft size={16} /> Dashboard
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-4">

        {/* Global Protocol Banner */}
        <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
          <div className="w-20 h-20 bg-[var(--p)]/5 rounded-[24px] flex items-center justify-center text-[var(--p)] shadow-inner border border-[var(--p)]/10">
            <FiShield size={40} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-black text-[var(--t)] mb-2 m-0 tracking-tight uppercase">Seller Payment Protection</h3>
            <p className="text-xs font-bold text-[var(--tl)] leading-relaxed m-0 opacity-60 uppercase tracking-widest">
              Payments are held for {PAYOUT_LOCK_DAYS} days after delivery to handle potential returns. Final earnings are shown after fees and logistics.
            </p>
          </div>
          <div className="flex gap-3">
             <button onClick={fetchData} className="px-6 py-4 bg-[var(--bg-alt)] border border-[var(--b)] rounded-[14px] text-[10px] font-black uppercase tracking-widest text-[var(--tm)] hover:bg-[var(--card-alt)] transition-all flex items-center gap-2 shadow-sm">
               <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync Records
             </button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {[
            { label: 'Total Sellers', value: sellers.length, color: 'var(--p)', Icon: FiUsers, sub: `${approvedCount} active` },
            { label: 'Total Platform Fees', value: `₹${totComm.toLocaleString()}`, color: 'var(--s)', Icon: FiTrendingUp, sub: 'Your commission' },
            { label: 'Pending Payouts', value: `₹${totPending.toLocaleString()}`, color: 'var(--w)', Icon: FiDollarSign, sub: 'Waiting to be paid' },
            { label: 'Active Access', value: approvedCount, color: '#8b5cf6', Icon: FiCheck, sub: 'Verified sellers' },
          ].map(({ label, value, color, Icon, sub }) => (
            <div key={label} className="bg-[var(--card)] border border-[var(--b)] rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center border transition-transform group-hover:scale-110 duration-500 shadow-inner"
                  style={{ backgroundColor: `${color}05`, borderColor: `${color}10`, color }}>
                  <Icon size={22} />
                </div>
                <span className="text-[10px] font-black text-[var(--tl)] uppercase tracking-widest opacity-60">{label}</span>
              </div>
              <h3 className="text-3xl font-black text-[var(--t)] mb-1 m-0 tracking-tight serif">{value}</h3>
              <p className="text-[11px] font-bold text-[var(--tl)] m-0 uppercase tracking-tighter opacity-40">{sub}</p>
              <div className="absolute bottom-0 left-0 right-0 h-1.5 opacity-20" style={{ backgroundColor: color }} />
            </div>
          ))}
        </div>

        {/* Seller Registry */}
        <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-[var(--bg-alt)]/50 px-8 py-5 border-b border-[var(--b)]">
            <h3 className="text-[10px] font-black text-[var(--tl)] uppercase tracking-widest m-0 flex items-center gap-2 uppercase opacity-60">
              <FiActivity size={12} className="text-[var(--p)]" /> Active Node Registry
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-[var(--bg-alt)]/30">
                  {['Institutional Node', 'State', 'Cycles', 'Volume', 'Net Yield', 'Disbursed', 'Disposition', 'Operations'].map(h => (
                    <th key={h} className="text-[9px] font-black text-[var(--tl)] uppercase tracking-[0.3em] px-8 py-5 text-left border-b border-[var(--b)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--b)]">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}><td colSpan="8" className="px-8 py-6"><div className="skeleton h-10 w-full rounded-xl" /></td></tr>
                  ))
                ) : sellers.length === 0 ? (
                  <tr><td colSpan="8" className="px-8 py-20 text-center text-[var(--tl)] text-sm font-black uppercase tracking-widest opacity-20">Null node registry</td></tr>
                ) : sellers.map(seller => {
                  const st    = sellerStatusStyle[seller.sellerInfo?.status || 'pending'];
                  const stats = getStats(seller);
                  return (
                    <tr key={seller._id} className="hover:bg-[var(--bg-alt)] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[12px] bg-[var(--bg-alt)] border border-[var(--b)] flex items-center justify-center text-[var(--tl)] group-hover:scale-110 group-hover:text-[var(--p)] transition-all duration-500 shadow-inner">
                            <FiUser size={16} className="text-[var(--p)]" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-[var(--t)] m-0 serif uppercase tracking-tight">{seller.sellerInfo?.businessName || seller.name}</p>
                            <p className="text-[10px] font-bold text-[var(--tl)] m-0 uppercase tracking-tighter opacity-40">{seller.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border shadow-sm" 
                          style={{ color: st.color, backgroundColor: st.bg, borderColor: st.border }}>{seller.sellerInfo?.status || 'pending'}</span>
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-[var(--t)] serif">{stats.orders}</td>
                      <td className="px-8 py-6 text-sm font-black text-[var(--t)] serif">₹{stats.gross.toLocaleString()}</td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-emerald-500 serif">₹{stats.earn.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-[var(--tl)] opacity-40 serif">₹{stats.paidOut.toLocaleString()}</td>
                      <td className="px-8 py-6">
                        {stats.pending > 0 ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-[var(--p)] serif">₹{stats.pending.toLocaleString()}</span>
                            <span className="text-[9px] font-black text-[var(--p)] uppercase tracking-tighter opacity-40">Ready</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[var(--tl)] opacity-20">
                            <FiLock size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Balanced</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex gap-2">
                          <button onClick={() => setSelected(seller)} title="View Node Details"
                            className="w-9 h-9 rounded-[10px] bg-[var(--bg-alt)] text-[var(--tl)] border border-[var(--b)] hover:bg-[var(--p)] hover:text-[#040404] hover:border-[var(--p)] transition-all flex items-center justify-center shadow-sm">
                            <FiEye size={16} />
                          </button>
                          {stats.pending > 0 && (
                            <button onClick={() => setPayoutData({ seller, amount: stats.pending })} title="Disburse Yield"
                              className="w-9 h-9 rounded-[10px] bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
                              <FiDollarSign size={16} />
                            </button>
                          )}
                          {seller.sellerInfo?.status !== 'approved' && (
                            <button onClick={() => handleStatusChange(seller._id, 'approved')} title="Authorize Node"
                              className="w-9 h-9 rounded-[10px] bg-[var(--bg-alt)] text-[var(--tl)] border border-[var(--b)] hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
                              <FiCheck size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}