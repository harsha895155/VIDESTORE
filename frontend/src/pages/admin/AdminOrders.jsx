import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI, userAPI, deliveryAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiTrash2, FiAlertTriangle, FiRefreshCw, FiShield, FiUser,
  FiX, FiTruck, FiPackage, FiShoppingBag, FiDollarSign, FiMapPin,
  FiPhone, FiCalendar, FiCreditCard, FiTag, FiCheckCircle, FiPlay,
  FiFileText, FiArrowRight, FiRotateCcw, FiCheck, FiInfo, FiActivity, FiLayers, FiSearch, FiClock
} from 'react-icons/fi';

const STATUS_OPTIONS = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

const sStyle = (s) => ({
  Processing: { color: 'var(--w)', bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.1)' },
  Confirmed: { color: 'var(--p)', bg: 'rgba(200, 166, 70, 0.05)', border: 'rgba(200, 166, 70, 0.1)' },
  Shipped: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.05)', border: 'rgba(139, 92, 246, 0.1)' },
  'Out for Delivery': { color: '#f97316', bg: 'rgba(249, 115, 22, 0.05)', border: 'rgba(249, 115, 22, 0.1)' },
  Delivered: { color: 'var(--s)', bg: 'rgba(16, 185, 129, 0.05)', border: 'rgba(16, 185, 129, 0.1)' },
  Cancelled: { color: 'var(--d)', bg: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.1)' },
}[s] || { color: 'var(--tm)', bg: 'var(--bg-alt)', border: 'var(--b)' });

const FLOW_STEPS = [
  { status: 'Processing', label: 'Processing', icon: <FiClock size={12}/> },
  { status: 'Confirmed', label: 'Confirmed', icon: <FiCheck size={12}/> },
  { status: 'Shipped', label: 'Shipped', icon: <FiPackage size={12}/> },
  { status: 'Out for Delivery', label: 'Out for Delivery', icon: <FiTruck size={12}/> },
  { status: 'Delivered', label: 'Delivered', icon: <FiCheckCircle size={12}/> },
];

// ── Rich Order Detail Modal ───────────────────────────────────────
function OrderDetailModal({ open, order, onClose, onRefresh }) {
  const [confirmingOrder, setConfirmingOrder] = useState(false);
  const [markingReady, setMarkingReady] = useState(false);
  const [simulatingOrder, setSimulatingOrder] = useState(false);

  if (!open || !order) return null;

  const s = sStyle(order.orderStatus);
  const isCOD = order.paymentMethod === 'COD';
  const addr = order.shippingAddress || {};
  const isCancelled = order.orderStatus === 'Cancelled';
  const dc = order.deliveryCharge || order.shippingPrice || 0;
  const totalPrice = order.totalPrice || 0;

  const isProcessing = order.orderStatus === 'Processing';
  const isConfirmed = order.orderStatus === 'Confirmed';
  const canReady = isProcessing || isConfirmed;
  const hasTracking = !!order.trackingId;
  const canSimulate = hasTracking && !['Delivered', 'Cancelled'].includes(order.orderStatus) && !order.returnRequest;

  const handleConfirm = async () => {
    setConfirmingOrder(true);
    try {
      await orderAPI.confirm(order._id);
      toast.success('Order Confirmed');
      await onRefresh(order._id);
    } catch (e) { toast.error(e?.message || 'Confirmation failed'); }
    finally { setConfirmingOrder(false); }
  };

  const handleMarkReady = async () => {
    setMarkingReady(true);
    try {
      const res = await deliveryAPI.markReady(order._id);
      toast.success(res.waybill ? `Shipping ID Generated: ${res.waybill}` : 'Ready to Ship');
      await onRefresh(order._id);
    } catch (e) { toast.error(e?.message || 'Manifest failed'); }
    finally { setMarkingReady(false); }
  };

  const handleSimulate = async () => {
    setSimulatingOrder(true);
    try {
      const res = await deliveryAPI.simulate(order._id);
      toast.success(`Status Updated: ${res.newStatus}`);
      await onRefresh(order._id);
    } catch (e) { toast.error(e?.message || 'Update failed'); }
    finally { setSimulatingOrder(false); }
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300 scrollbar-hide">
        
        {/* Modal Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[14px] bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] border border-[var(--p)]/10 shadow-inner">
              <FiShoppingBag size={30} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <h3 className="text-3xl font-black text-[var(--t)] m-0 tracking-tight uppercase">Order #{order._id.slice(-8).toUpperCase()}</h3>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border shadow-sm" 
                  style={{ color: s.color, backgroundColor: s.bg, borderColor: s.border }}>{order.orderStatus}</span>
              </div>
              <p className="text-[11px] font-bold text-[var(--tl)] m-0 mt-3 flex items-center gap-2 uppercase tracking-widest opacity-60">
                <FiCalendar /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-[var(--bg-alt)] border border-[var(--b)] rounded-[14px] text-[var(--tl)] flex items-center justify-center hover:bg-[var(--card-alt)] hover:text-[var(--t)] transition-all text-2xl font-black">×</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            
            {!isCancelled && (
              <div className="bg-[var(--bg-alt)] border border-[var(--b)] rounded-2xl p-8 shadow-inner">
                <h4 className="text-[10px] font-bold text-[var(--tl)] uppercase tracking-[0.2em] m-0 flex items-center gap-3 opacity-60 mb-6">
                 <FiActivity size={14} className="text-[var(--p)]"/> Track Order
              </h4>
                <div className="flex justify-between relative px-4">
                  <div className="absolute top-[12px] left-8 right-8 h-1 bg-[var(--b)] -z-10 rounded-full" />
                  {FLOW_STEPS.map((step, idx) => {
                    const currentStepIdx = FLOW_STEPS.findIndex(f => f.status === order.orderStatus);
                    const isActive = idx <= currentStepIdx;
                    return (
                      <div key={step.status} className="flex flex-col items-center gap-4">
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${isActive ? 'bg-[var(--p)] border-[var(--p)] text-[#040404] shadow-xl shadow-gold/20' : 'bg-[var(--card)] border-[var(--b)] text-[var(--tl)]/20'}`}>
                          {isActive ? <FiCheck size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-[var(--b)]" />}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-[var(--t)]' : 'text-[var(--tl)] opacity-40'}`}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-[var(--card)] border border-[var(--b)] rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-[var(--bg-alt)]/50 px-8 py-4 border-b border-[var(--b)]">
                <h4 className="text-[10px] font-bold text-[var(--tl)] uppercase tracking-[0.25em] m-0">Order Items</h4>
              </div>
              <div className="divide-y divide-[var(--b)]">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center gap-4 hover:bg-[var(--bg-alt)]/30 transition-colors group">
                    <img src={item.image} alt="" className="w-16 h-20 object-cover rounded-[8px] bg-[var(--bg-alt)] border border-[var(--b)] shadow-sm transition-transform group-hover:scale-105" />
                    <div className="flex-1">
                      <h1 className="serif" style={{ fontSize: '16px', fontWeight: '900', color: 'var(--t)', margin: 0 }}>{item.name}</h1>
                      <p className="text-[9px] font-black text-[var(--tl)] uppercase tracking-widest opacity-60">{item.brand}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <div className="px-2 py-1 bg-[var(--bg-alt)] border border-[var(--b)] rounded-lg text-[8px] font-black text-[var(--tm)] uppercase tracking-widest">Qty: {item.quantity}</div>
                        {item.size && <div className="px-2 py-1 bg-[var(--bg-alt)] border border-[var(--b)] rounded-lg text-[8px] font-black text-[var(--tm)] uppercase tracking-widest">Size: {item.size}</div>}
                        {item.color && <div className="px-2 py-1 bg-[var(--bg-alt)] border border-[var(--b)] rounded-lg text-[8px] font-black text-[var(--tm)] uppercase tracking-widest">Color: {item.color}</div>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-[var(--t)] tracking-tight serif">₹{item.price?.toLocaleString()}</p>
                      <p className="text-[9px] font-black text-[var(--tl)] uppercase tracking-[0.2em] mt-2 opacity-40">Price per unit</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[var(--bg-alt)] border border-[var(--b)] rounded-2xl p-8 group hover:border-[var(--p)]/20 transition-all">
                <h4 className="text-[10px] font-bold text-[var(--tl)] uppercase tracking-[0.25em] mb-6 flex items-center gap-3"><FiUser size={16} className="text-[var(--p)]"/> Customer Details</h4>
                <p className="text-lg font-black text-[var(--t)] mb-2 tracking-tight serif">{order.user?.name}</p>
                <p className="text-xs font-bold text-[var(--tl)] mb-6 opacity-60 uppercase">{order.user?.email}</p>
                <div className="flex items-center gap-3 text-xs font-black text-[var(--tm)]">
                  <div className="w-8 h-8 rounded-lg bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)]">
                    <FiPhone size={14} />
                  </div>
                  <span className="tracking-widest">{addr.phone || 'N/A'}</span>
                </div>
              </div>
              <div className="bg-[var(--bg-alt)] border border-[var(--b)] rounded-2xl p-8 group hover:border-emerald-500/20 transition-all">
                <h4 className="text-[10px] font-bold text-[var(--tl)] uppercase tracking-[0.25em] mb-6 flex items-center gap-3"><FiMapPin size={16} className="text-emerald-500"/> Delivery Address</h4>
                <p className="text-sm font-bold text-[var(--t)] leading-relaxed m-0 opacity-80 uppercase tracking-tight">
                  {addr.address}, {addr.city}<br />
                  {addr.state} - {addr.pincode}
                </p>
                <div className="mt-6 inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 rounded-xl shadow-sm">
                  <FiShield size={12} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{addr.country || 'India'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="bg-[var(--card)] border border-[var(--b)] rounded-2xl p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--p)]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              <h4 className="text-[10px] font-bold text-[var(--tl)] uppercase tracking-[0.25em] mb-8 flex items-center gap-3"><FiDollarSign size={16} className="text-[var(--p)]"/> Payment Summary</h4>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-[var(--tl)] uppercase tracking-widest opacity-60">Items Total</span>
                  <span className="text-sm font-black text-[var(--t)] serif">₹{(totalPrice - dc).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-[var(--tl)] uppercase tracking-widest opacity-60">Shipping Fee</span>
                  <span className="text-sm font-black text-[var(--p)] serif">₹{dc.toLocaleString()}</span>
                </div>
                {order.couponApplied && (
                   <div className="flex justify-between items-center px-4 py-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                      <FiTag size={12}/> Discount
                    </span>
                    <span className="text-sm font-black text-emerald-500 serif">−₹{order.discountAmount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-8 border-t border-[var(--b)] flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black text-[var(--tl)] uppercase tracking-[0.25em] mb-2 opacity-60">Grand Total</p>
                    <p className="text-[10px] font-black text-[var(--p)] uppercase tracking-tighter m-0">{order.paymentMethod}</p>
                  </div>
                  <p className="text-4xl font-black text-[var(--t)] m-0 tracking-tighter serif">₹{totalPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-alt)] border border-[var(--b)] rounded-2xl p-8 space-y-5 shadow-inner">
              <h4 className="text-[10px] font-bold text-[var(--tl)] uppercase tracking-[0.25em] mb-6 flex items-center gap-3"><FiLayers size={16} className="text-[var(--p)]"/> Actions</h4>
              
              {isProcessing && (
                <button onClick={handleConfirm} disabled={confirmingOrder}
                  className="w-full py-4 px-6 bg-[var(--p)] text-[#040404] font-bold text-[12px] uppercase tracking-wider rounded-xl shadow-lg shadow-gold/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                  {confirmingOrder ? <FiRefreshCw className="animate-spin" /> : <FiCheckCircle size={16}/>} Confirm Order
                </button>
              )}

              {canReady && (
                <button onClick={handleMarkReady} disabled={markingReady}
                  className="w-full py-4 px-6 bg-emerald-600 text-white font-bold text-[12px] uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                  {markingReady ? <FiRefreshCw className="animate-spin" /> : <FiTruck size={16}/>} Mark as Shipped
                </button>
              )}

              {canSimulate && (
                <button onClick={handleSimulate} disabled={simulatingOrder}
                  className="w-full py-5 px-6 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[14px] shadow-xl shadow-black/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                  {simulatingOrder ? <FiRefreshCw className="animate-spin" /> : <FiPlay size={16}/>} Update Status
                </button>
              )}

              <div className="p-6 bg-[var(--card)] border border-[var(--b)] rounded-2xl flex items-start gap-4">
                <FiInfo className="text-[var(--p)] mt-1" size={18} />
                <p className="text-[10px] font-bold text-[var(--tl)] leading-relaxed m-0 opacity-80 uppercase tracking-tight">All actions are logged for security and order tracking.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getAll({ limit: 500 });
      setOrders(res.orders || []);
    } catch (e) {
      toast.error('Synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filteredOrders = orders.filter(o => {
    const sMatch = filter === 'all' || o.orderStatus === filter;
    const q = search.toLowerCase();
    const qMatch = !search || 
                  o._id.toLowerCase().includes(q) || 
                  o.user?.name?.toLowerCase().includes(q) || 
                  o.user?.email?.toLowerCase().includes(q);
    return sMatch && qMatch;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {selectedOrder && <OrderDetailModal open order={selectedOrder} onClose={() => setSelectedOrder(null)} onRefresh={async (id) => {
        const updated = await orderAPI.getById(id);
        setOrders(prev => prev.map(o => o._id === id ? updated.order : o));
        setSelectedOrder(updated.order);
      }} />}

      <div className="px-8 py-6 flex items-center justify-between sticky top-0 z-10" 
        style={{ backgroundColor: 'var(--glass)', borderBottom: `1px solid var(--b)`, backdropFilter: 'blur(32px)' }}>
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-[14px] bg-[var(--p)] flex items-center justify-center text-[#040404] shadow-xl shadow-gold/20">
            <FiShoppingBag size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FiShield size={12} className="text-[var(--p)]" />
              <p className="font-black text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--tm)' }}>Order Management</p>
            </div>
            <h1 className="font-body text-2xl font-black tracking-tighter uppercase" style={{ color: 'var(--t)' }}>Orders</h1>
          </div>
        </div>
        <Link to="/admin" className="font-black text-[10px] uppercase tracking-widest px-6 py-4 bg-[var(--bg-alt)] border border-[var(--b)] rounded-[14px] text-[var(--tm)] hover:bg-[var(--card-alt)] transition-all flex items-center gap-3" style={{ textDecoration: 'none' }}>
          <FiArrowLeft size={16} /> Dashboard
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-4">

        <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--p)] opacity-40" size={18} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl pl-14 pr-6 py-4 text-sm font-medium text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-sm" />
          </div>
          <button onClick={fetchOrders} className="px-6 py-3 bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl text-[11px] font-bold uppercase tracking-wider text-[var(--tm)] hover:bg-[var(--card-alt)] transition-all flex items-center gap-2 shadow-sm">
            <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          {['all', ...STATUS_OPTIONS].map(opt => (
            <button key={opt} onClick={() => setFilter(opt)}
              className={`px-6 py-3 text-[11px] font-bold uppercase tracking-widest transition-all rounded-xl border ${filter === opt ? 'bg-[var(--p)] text-[#040404] border-[var(--p)] shadow-md shadow-gold/20' : 'bg-[var(--card)] text-[var(--tl)] border-[var(--b)] hover:border-[var(--p)]/30 shadow-sm'}`}>
              {opt}
            </button>
          ))}
        </div>

        <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-32 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] border border-[var(--p)]/10">
                <FiRefreshCw className="animate-spin" size={20} />
              </div>
              <p className="text-[10px] font-black text-[var(--tl)] uppercase tracking-[0.25em] mt-8">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-40 text-center">
              <div className="w-28 h-28 bg-[var(--bg-alt)] rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-inner border border-[var(--b)]">
                <FiPackage size={48} className="text-[var(--p)] opacity-20" />
              </div>
              <h3 className="text-3xl font-black text-[var(--t)] mb-4 tracking-tight uppercase">No Orders</h3>
              <p className="text-sm font-bold text-[var(--tl)] opacity-60 uppercase tracking-widest">No orders found matching your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-[var(--bg-alt)]/50 border-b border-[var(--b)]">
                    {['Order ID', 'Customer', 'Status', 'Total Amount', 'Actions'].map(h => (
                      <th key={h} className="text-[10px] font-black text-[var(--tl)] uppercase tracking-[0.3em] px-12 py-6 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--b)]">
                  {filteredOrders.map(order => {
                    const s = sStyle(order.orderStatus);
                    return (
                      <tr key={order._id} className="hover:bg-[var(--bg-alt)] transition-colors group">
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-[12px] bg-[var(--bg-alt)] border border-[var(--b)] flex items-center justify-center text-[var(--tl)] group-hover:scale-110 transition-transform duration-500 shadow-inner">
                              <FiUser size={18} className="text-[var(--p)]" />
                            </div>
                            <div>
                              <p className="text-base font-black text-[var(--t)] m-0 tracking-tight serif uppercase">#{order._id.slice(-8)}</p>
                              <p className="text-[11px] font-bold text-[var(--tl)] m-0 opacity-40 uppercase tracking-tighter mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <p className="text-sm font-black text-[var(--t)] m-0 tracking-tight serif">{order.user?.name}</p>
                          <p className="text-[10px] font-bold text-[var(--tl)] m-0 opacity-60 mt-1 uppercase tracking-tighter">{order.user?.email}</p>
                        </td>
                        <td className="px-8 py-8">
                           <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border w-fit shadow-sm" 
                            style={{ color: s.color, backgroundColor: s.bg, borderColor: s.border }}>{order.orderStatus}</span>
                        </td>
                        <td className="px-8 py-8">
                            <p className="text-lg font-black text-[var(--p)] m-0 tracking-tight serif">₹{order.totalPrice.toLocaleString()}</p>
                            <p className="text-[9px] font-black text-[var(--tl)] uppercase tracking-tighter mt-1.5 opacity-40">{order.orderItems?.length} items</p>
                        </td>
                        <td className="px-8 py-8">
                           <button onClick={() => setSelectedOrder(order)}
                            className="w-12 h-12 rounded-[14px] bg-[var(--bg-alt)] border border-[var(--b)] flex items-center justify-center text-[var(--tm)] hover:bg-[var(--p)] hover:text-[#040404] hover:border-[var(--p)] transition-all shadow-sm">
                            <FiFileText size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}