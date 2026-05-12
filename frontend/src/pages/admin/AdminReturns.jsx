// pages/admin/AdminReturns.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
    FiArrowLeft, FiRotateCcw, FiCheck, FiX, FiRefreshCw,
    FiImage, FiUser, FiCalendar, FiPackage, FiInfo, FiActivity, FiShield
} from 'react-icons/fi';

const rStyle = (s) => ({
    Pending: { color: 'var(--w)', bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.1)' },
    Approved: { color: 'var(--s)', bg: 'rgba(16, 185, 129, 0.05)', border: 'rgba(16, 185, 129, 0.1)' },
    Rejected: { color: 'var(--d)', bg: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.1)' },
}[s] || { color: 'var(--tm)', bg: 'var(--bg-alt)', border: 'var(--b)' });

// ── Image lightbox ────────────────────────────────────────────────
function ImageModal({ src, onClose }) {
    if (!src) return null;
    return (
        <div onClick={onClose}
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
            <img src={src} alt="Return evidence" className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10" />
            <button onClick={onClose} className="absolute top-8 right-8 w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-all border border-white/10 cursor-pointer text-xl">✕</button>
        </div>
    );
}

// ── Action modal (approve / reject) ──────────────────────────────
function ActionModal({ open, order, action, onClose, onConfirm, loading }) {
    const [note, setNote] = useState('');
    useEffect(() => { if (open) setNote(''); }, [open]);
    if (!open || !order) return null;

    const isApprove = action === 'approve';
    const refund = order.totalPrice || 0;
    const orderId = order._id.slice(-8).toUpperCase();

    return (
        <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-8 max-w-[480px] w-full shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-5 mb-8">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center border shadow-inner ${isApprove ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' : 'bg-red-500/5 border-red-500/10 text-red-500'}`}>
                        {isApprove ? <FiCheck size={24} /> : <FiX size={24} />}
                    </div>
                    <div>
                        <h3 className={`text-xl font-bold m-0 tracking-tight uppercase ${isApprove ? 'text-emerald-500' : 'text-red-500'}`}>
                            {isApprove ? 'Authorize Refund' : 'Decline Request'}
                        </h3>
                        <p className="text-[10px] font-bold text-[var(--tl)] m-0 uppercase tracking-widest mt-1 opacity-40">Transaction #{orderId}</p>
                    </div>
                </div>

                {isApprove && (
                    <div className="bg-[var(--p)]/5 border border-[var(--p)]/10 rounded-2xl p-6 mb-8 shadow-inner">
                        <p className="text-[9px] font-bold text-[var(--p)] uppercase tracking-widest mb-2 px-1 opacity-40">Refund Capital Transfer</p>
                        <p className="text-3xl font-bold text-[var(--p)] m-0">₹{refund.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] font-medium text-[var(--tl)] m-0 mt-2 uppercase tracking-tight opacity-40">Cycle: 3–5 Business Days</p>
                    </div>
                )}

                <div className="mb-8">
                    <label className="block text-[10px] font-bold text-[var(--tl)] uppercase tracking-widest mb-3 px-1 opacity-40">
                        {isApprove ? 'Internal Disposition (Optional)' : 'Rejection Rationale (Required)'}
                    </label>
                    <textarea
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        rows={4}
                        placeholder={isApprove ? 'Strategic note for the customer...' : 'Explicit reason for declining the asset return...'}
                        className="w-full bg-[var(--bg-alt)] border-2 border-[var(--b)] rounded-xl p-4 text-sm font-bold text-[var(--t)] focus:border-[var(--p)] outline-none transition-all resize-none shadow-inner"
                    />
                </div>

                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 px-6 bg-[var(--bg-alt)] border border-[var(--b)] text-[var(--tl)] font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[var(--card-alt)] transition-all">Cancel</button>
                    <button
                        onClick={() => onConfirm(action, note)}
                        disabled={loading || (!isApprove && !note.trim())}
                        className={`flex-[2] py-4 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${loading || (!isApprove && !note.trim()) ? 'bg-[var(--bg-alt)] text-[var(--tl)] opacity-20 cursor-not-allowed' : isApprove ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-red-600 text-white shadow-xl shadow-red-500/20'}`}>
                        {loading ? <FiRefreshCw className="animate-spin" /> : isApprove ? <FiCheck /> : <FiX />}
                        {loading ? 'Processing...' : isApprove ? 'Authorize' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function AdminReturns() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Pending');
    const [actModal, setActModal] = useState({ open: false, order: null, action: null });
    const [actLoad, setActLoad] = useState(false);
    const [imgSrc, setImgSrc] = useState(null);

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const res = await orderAPI.getReturns({ status: filter || undefined, limit: 100 });
            setOrders(res.orders || []);
        } catch (e) {
            toast.error(e?.message || 'Synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReturns(); }, [filter]);

    const handleAction = async (action, note) => {
        if (!actModal.order) return;
        setActLoad(true);
        try {
            const res = await orderAPI.handleReturn(actModal.order._id, action, note);
            toast.success(res.message || (action === 'approve' ? 'Resolution authorized' : 'Request declined'));
            setActModal({ open: false, order: null, action: null });
            fetchReturns();
        } catch (e) {
            toast.error(e?.message || 'Resolution failed');
        } finally {
            setActLoad(false);
        }
    };

    const counts = { Pending: 0, Approved: 0, Rejected: 0 };
    orders.forEach(o => { if (o.returnRequest?.status) counts[o.returnRequest.status] = (counts[o.returnRequest.status] || 0) + 1; });

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
            <ImageModal src={imgSrc} onClose={() => setImgSrc(null)} />
            <ActionModal
                open={actModal.open}
                order={actModal.order}
                action={actModal.action}
                onClose={() => setActModal({ open: false, order: null, action: null })}
                onConfirm={handleAction}
                loading={actLoad}
            />

            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between sticky top-0 z-10" 
                style={{ backgroundColor: 'var(--glass)', borderBottom: `1px solid var(--b)`, backdropFilter: 'blur(32px)' }}>
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-xl bg-[var(--p)] flex items-center justify-center text-[#040404] shadow-xl shadow-gold/20">
                        <FiRotateCcw size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <FiShield size={12} className="text-[var(--p)]" />
                            <p className="font-bold text-[10px] tracking-[0.2em] uppercase opacity-60" style={{ color: 'var(--tm)' }}>Resolution Center</p>
                        </div>
                        <h1 className="font-body text-2xl font-bold tracking-tight uppercase" style={{ color: 'var(--t)' }}>Return Pipeline</h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={fetchReturns} className="font-bold text-[10px] uppercase tracking-widest px-6 py-4 bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl text-[var(--tm)] hover:bg-[var(--card-alt)] transition-all flex items-center gap-3 shadow-sm">
                        <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync Records
                    </button>
                    <Link to="/admin" className="font-bold text-[10px] uppercase tracking-widest px-6 py-4 bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl text-[var(--tm)] hover:bg-[var(--card-alt)] transition-all flex items-center gap-3 shadow-sm" style={{ textDecoration: 'none' }}>
                        <FiArrowLeft size={16} /> Dashboard
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-4">

                {/* Filter tabs */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    {[
                        { key: '', label: `Aggregate Assets (${orders.length})`, color: 'var(--p)' },
                        { key: 'Pending', label: `Pending Protocol (${counts.Pending || 0})`, color: 'var(--w)' },
                        { key: 'Approved', label: `Authorized Returns (${counts.Approved || 0})`, color: 'var(--s)' },
                        { key: 'Rejected', label: `Declined Requests (${counts.Rejected || 0})`, color: 'var(--d)' },
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setFilter(tab.key)}
                            className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl border shadow-sm ${filter === tab.key ? 'text-[#040404] shadow-xl' : 'bg-[var(--card)] text-[var(--tl)] border-[var(--b)] hover:border-[var(--p)]/30'}`}
                            style={{ 
                                backgroundColor: filter === tab.key ? tab.color : '',
                                borderColor: filter === tab.key ? tab.color : ''
                            }}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="p-32 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 rounded-2xl bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] mb-8 border border-[var(--p)]/10 shadow-inner">
                                <FiRefreshCw className="animate-spin" size={32} />
                            </div>
                            <p className="text-[10px] font-bold text-[var(--tl)] uppercase tracking-widest opacity-40">Synchronizing records...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-40 text-center">
                            <div className="w-24 h-24 bg-[var(--bg-alt)] rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-inner border border-[var(--b)]">
                                <FiRotateCcw size={48} className="text-[var(--p)] opacity-20" />
                            </div>
                            <h3 className="text-3xl font-bold text-[var(--t)] mb-4 tracking-tight uppercase">Null Disposition</h3>
                            <p className="text-sm font-bold text-[var(--tl)] opacity-40 uppercase tracking-widest">No return requests found within the current filter parameters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse min-w-[1200px]">
                                <thead>
                                    <tr className="bg-[var(--bg-alt)]/30">
                                        {['Transaction', 'Client Node', 'Strategic Reason', 'Evidence Assets', 'Timestamp', 'Current Status', 'Operations'].map(h => (
                                            <th key={h} className="text-[9px] font-bold text-[var(--tl)] uppercase tracking-widest px-8 py-5 text-left border-b border-[var(--b)] opacity-40">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--b)]">
                                    {orders.map(order => {
                                        const rr = order.returnRequest;
                                        const rs = rStyle(rr?.status);
                                        const orderId = order._id.slice(-8).toUpperCase();
                                        const isPending = rr?.status === 'Pending';

                                        return (
                                            <tr key={order._id} className="hover:bg-[var(--bg-alt)] transition-colors group">
                                                {/* Order */}
                                                <td className="px-8 py-6">
                                                    <Link to={`/admin/orders`} className="text-sm font-bold text-[var(--p)] hover:opacity-80 transition-all block mb-1 uppercase tracking-tight">
                                                        #{orderId}
                                                    </Link>
                                                    <p className="text-[11px] font-medium text-[var(--tl)] m-0 opacity-40">₹{order.totalPrice?.toLocaleString('en-IN')}</p>
                                                </td>

                                                {/* Customer */}
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-alt)] border border-[var(--b)] flex items-center justify-center text-[var(--tl)] group-hover:text-[var(--p)] transition-all shadow-inner">
                                                            <FiUser size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-[var(--t)] m-0 uppercase tracking-tight">{order.user?.name}</p>
                                                            <p className="text-[10px] font-medium text-[var(--tl)] m-0 uppercase tracking-tight opacity-40">{order.user?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Reason */}
                                                <td className="px-8 py-6">
                                                    <p className="text-xs font-bold text-[var(--t)] m-0 leading-relaxed uppercase tracking-tight">{rr?.reasonLabel || rr?.reason || '—'}</p>
                                                    {rr?.note && (
                                                        <p className="text-[10px] font-medium text-[var(--tl)] m-0 mt-1 truncate max-w-[200px] opacity-40">
                                                            {rr.note}
                                                        </p>
                                                    )}
                                                    {rr?.upiId && (
                                                        <div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-[var(--p)]/5 text-[var(--p)] rounded-lg w-fit border border-[var(--p)]/10 shadow-inner">
                                                            <FiActivity size={10} />
                                                            <span className="text-[9px] font-bold uppercase tracking-widest">{rr.upiId}</span>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Evidence */}
                                                <td className="px-8 py-6">
                                                    {rr?.images?.length > 0 ? (
                                                        <div className="flex -space-x-4 hover:space-x-1 transition-all duration-500">
                                                            {rr.images.map((img, i) => (
                                                                <img key={i} src={img.url} alt="" onClick={() => setImgSrc(img.url)}
                                                                    className="w-12 h-16 object-cover rounded-lg border-2 border-[var(--card)] shadow-lg cursor-zoom-in hover:z-10 hover:-translate-y-2 transition-all duration-500"
                                                                />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-[var(--tl)] opacity-20">
                                                            <FiImage size={14} />
                                                            <span className="text-[9px] font-bold uppercase tracking-widest">Null Assets</span>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Date */}
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-[var(--tl)] opacity-30">
                                                        <FiCalendar size={14} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                                            {rr?.requestedAt ? new Date(rr.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-8 py-6">
                                                    <span className="text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border shadow-sm" 
                                                        style={{ color: rs.color, backgroundColor: rs.bg, borderColor: rs.border }}>
                                                        {rr?.status || '—'}
                                                    </span>
                                                    {rr?.status === 'Approved' && rr?.refundAmount > 0 && (
                                                        <p className="text-[9px] font-bold text-emerald-500 m-0 mt-2 uppercase tracking-tight">
                                                            ₹{rr.refundAmount.toLocaleString('en-IN')} Disbursed
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-8 py-6">
                                                    {isPending ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setActModal({ open: true, order, action: 'approve' })}
                                                                className="w-9 h-9 rounded-xl bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
                                                                <FiCheck size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => setActModal({ open: true, order, action: 'reject' })}
                                                                className="w-9 h-9 rounded-xl bg-red-500/5 text-red-500 border border-red-500/10 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
                                                                <FiX size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-[var(--tl)] opacity-20">
                                                            <FiInfo size={14} />
                                                            <span className="text-[9px] font-bold uppercase tracking-widest">Resolved</span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Disclaimer */}
                <div className="mt-12 p-8 bg-[var(--bg-alt)] border border-[var(--b)] rounded-3xl flex gap-6 shadow-inner">
                    <FiInfo className="text-[var(--p)] mt-1 flex-shrink-0" size={20} />
                    <div>
                        <h4 className="text-sm font-bold text-[var(--t)] mb-2 uppercase tracking-tight">Resolution Protocol</h4>
                        <p className="text-xs font-bold text-[var(--tl)] leading-relaxed m-0 opacity-40 uppercase tracking-widest">
                            Approved returns trigger a platform-wide financial reconciliation. Ensure all evidence assets are verified before authorization. Rejections require an explicit rationale for audit transparency. Resolution cycles Typically settle within 3–5 cycles.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}