import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderAPI, deliveryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiPackage, FiCheck, FiCopy, FiPrinter, FiTruck, FiMapPin, FiClock, FiRotateCcw, FiChevronRight, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const PRIMARY = '#4F46E5';
const STATUS_STEPS = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

const statusConfig = {
  Processing: { color: '#F59E0B', bg: '#FFFBEB', border: '#FEF3C7' },
  Confirmed: { color: '#3B82F6', bg: '#EFF6FF', border: '#DBEAFE' },
  Shipped: { color: '#8B5CF6', bg: '#F5F3FF', border: '#EDE9FE' },
  'Out for Delivery': { color: '#F97316', bg: '#FFF7ED', border: '#FFEDD5' },
  Delivered: { color: '#10B981', bg: '#ECFDF5', border: '#D1FAE5' },
  Cancelled: { color: '#EF4444', bg: '#FEF2F2', border: '#FEE2E2' },
  'Return Requested': { color: '#6366F1', bg: '#EEF2FF', border: '#E0E7FF' },
};

const getStatusStyle = (s) => statusConfig[s] || { color: '#6B7280', bg: '#F9FAFB', border: '#F3F4F6' };

const isWithinDays = (dateStr, days) => {
  if (!dateStr) return false;
  const diff = Date.now() - new Date(dateStr).getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
};

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getMyOrders()
      .then(res => setOrders(res.orders || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen py-0 px-4 sm:px-6" style={{ background: 'transparent' }}>
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--p)' }}>Order History</p>
          <h1 className="serif text-5xl font-black" style={{ color: 'var(--t)' }}>Your Purchases</h1>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-3xl border animate-pulse glass" style={{ borderColor: 'var(--b)' }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 rounded-[3rem] border shadow-sm glass" style={{ borderColor: 'var(--b)' }}>
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
              <FiPackage size={40} className="opacity-20" />
            </div>
            <h2 className="serif text-3xl font-black mb-4" style={{ color: 'var(--t)' }}>No Orders Yet</h2>
            <p className="opacity-50 mb-8 max-w-xs mx-auto font-medium" style={{ color: 'var(--t)' }}>Your purchase history is empty. Start exploring our latest collections.</p>
            <Link to="/shop" className="btn-premium h-14 px-10 inline-flex items-center">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const style = getStatusStyle(order.orderStatus);
              return (
                <Link key={order._id} to={`/orders/${order._id}`} className="group block rounded-[2rem] border p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all glass" style={{ borderColor: 'var(--b)' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                        <img 
                          src={order.orderItems?.[0]?.image || order.orderItems?.[0]?.product?.images?.[0]?.url} 
                          className="w-full h-full object-cover" 
                          alt="" 
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-black text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                          <FiChevronRight className="text-gray-300 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-none pt-4 sm:pt-0">
                      <div className="text-right">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-lg font-black text-gray-900">₹{order.totalPrice?.toLocaleString()}</p>
                      </div>
                      <div 
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border"
                        style={{ color: style.color, backgroundColor: style.bg, borderColor: style.border }}
                      >
                        {order.orderStatus}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [scans, setScans] = useState([]);
  const [showScans, setShowScans] = useState(false);
  const [scansLoading, setScansLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [returnImgView, setReturnImgView] = useState(null);

  useEffect(() => {
    orderAPI.getById(id)
      .then(res => setOrder(res.order))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    const wasPaidOnline = order?.isPaid && order?.paymentMethod !== 'COD';
    const msg = wasPaidOnline
      ? 'Cancel this order? A ₹50 cancellation fee will be deducted. Remaining amount will be refunded in 5-7 business days.'
      : 'Are you sure you want to cancel this order?';
    if (!window.confirm(msg)) return;
    setCancelling(true);
    try {
      const res = await orderAPI.cancel(id);
      toast.success(res.message || 'Order cancelled');
      setOrder(prev => ({ ...prev, orderStatus: 'Cancelled', refundAmount: res.refundAmount, cancellationFee: res.cancellationFee }));
    } catch (err) {
      toast.error(err.message || 'Cannot cancel this order');
    } finally { setCancelling(false); }
  };

  const handleCopyAWB = () => {
    navigator.clipboard.writeText(order.trackingId || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLoadScans = async () => {
    if (showScans) { setShowScans(false); return; }
    if (!order?.trackingId) return;
    setScansLoading(true);
    try {
      const res = await deliveryAPI.track(order.trackingId);
      const shipData = res?.data?.ShipmentData?.[0]?.Shipment || res?.ShipmentData?.[0]?.Shipment;
      setScans(shipData?.Scans || []);
      setShowScans(true);
    } catch { 
      setScans([]); 
      setShowScans(true); 
    } finally { 
      setScansLoading(false); 
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
  
  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <FiAlertCircle size={48} className="text-gray-200 mb-4" />
      <h2 className="serif text-3xl font-black text-gray-900">Order Not Found</h2>
      <Link to="/orders" className="text-indigo-600 font-black mt-4 hover:underline">Back to Purchases</Link>
    </div>
  );

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);
  const deliveredEntry = order?.statusHistory?.find(h => h.status === 'Delivered');
  const deliveredAt = deliveredEntry?.timestamp || order?.deliveredAt;
  const showReturnButton = order?.orderStatus === 'Delivered' && isWithinDays(deliveredAt, 6);
  const returnDaysLeft = deliveredAt ? Math.max(0, 6 - Math.floor((Date.now() - new Date(deliveredAt).getTime()) / (24 * 60 * 60 * 1000))) : 0;
  const statusStyle = getStatusStyle(order.orderStatus);

  return (
    <div className="min-h-screen bg-gray-50/50 py-0 px-4 sm:px-6">
      <div className="max-w-[1440px] mx-auto">
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors mb-2">
          <FiPackage /> Back to History
        </Link>

        {/* Hero Header */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-8 sm:p-12 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <div 
              className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border shadow-sm"
              style={{ color: statusStyle.color, backgroundColor: statusStyle.bg, borderColor: statusStyle.border }}
            >
              {order.orderStatus}
            </div>
          </div>

          <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Confirmed Order</p>
          <h1 className="serif text-5xl font-black text-gray-900 mb-6">#{order._id.slice(-8).toUpperCase()}</h1>
          
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Placed On</p>
              <p className="text-sm font-bold text-gray-700">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-sm font-bold text-gray-700">₹{order.totalPrice?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Method</p>
              <p className="text-sm font-bold text-gray-700">{order.paymentMethod}</p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            {showReturnButton && (
              <Link to={`/orders/${order._id}/return`} className="h-12 px-6 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-colors flex items-center gap-2 border border-indigo-100">
                <FiRotateCcw /> Return & Refund ({returnDaysLeft}d left)
              </Link>
            )}
            {!['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order.orderStatus) && (
              <button onClick={handleCancel} disabled={cancelling} className="h-12 px-6 bg-red-50 text-red-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-colors border border-red-100 disabled:opacity-50">
                {cancelling ? 'Processing...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        {/* Tracking Timeline */}
        {!['Cancelled', 'Returned'].includes(order.orderStatus) && (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-4 sm:p-6 mb-4">
            <h3 className="serif text-2xl font-black text-gray-900 mb-4">Tracking Status</h3>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-6 right-6 h-1 bg-gray-100 rounded-full hidden sm:block" />
              <div 
                className="absolute top-5 left-6 h-1 bg-indigo-600 rounded-full transition-all duration-1000 hidden sm:block" 
                style={{ width: `${Math.max(0, currentStep) * (100 / (STATUS_STEPS.length - 1))}%` }}
              />

              <div className="flex flex-col sm:flex-row justify-between relative gap-8 sm:gap-4">
                {STATUS_STEPS.map((step, i) => {
                  const isDone = i <= currentStep;
                  const isActive = i === currentStep;
                  return (
                    <div key={step} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2 sm:flex-1">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 ${
                        isDone ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-2 border-gray-100 text-gray-300'
                      }`}>
                        {isDone ? <FiCheck size={20} /> : <span className="text-sm font-black">{i + 1}</span>}
                      </div>
                      <div>
                        <p className={`text-xs font-black uppercase tracking-widest ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>{step}</p>
                        {isActive && <p className="text-[10px] font-bold text-indigo-500 uppercase mt-1 animate-pulse">Current Status</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {order.trackingId && (
              <div className="mt-12 p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                    <FiTruck />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tracking Number (AWB)</p>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900">{order.trackingId}</span>
                      <button onClick={handleCopyAWB} className="text-gray-400 hover:text-indigo-600 transition-colors">
                        <FiCopy size={14} />
                      </button>
                      {copied && <span className="text-[10px] font-black text-green-500 uppercase">Copied!</span>}
                    </div>
                  </div>
                </div>
                <button onClick={handleLoadScans} className="h-10 px-5 bg-white border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all">
                  {scansLoading ? 'Loading Events...' : showScans ? 'Hide History' : 'Full History'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Order Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-4">
              <h3 className="serif text-2xl font-black text-gray-900 mb-4">Items In Order</h3>
              <div className="divide-y divide-gray-50">
                {order.orderItems?.map(item => (
                  <div key={item._id} className="py-6 flex items-center gap-6 group">
                    <div className="w-20 h-24 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-gray-900 mb-1">{item.name}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6">Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-gray-900">₹{order.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-green-600">{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-400">Tax (GST)</span>
                  <span className="text-gray-900">₹{order.taxPrice?.toLocaleString()}</span>
                </div>
                <div className="h-px bg-gray-50 my-2" />
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Total</span>
                  <span className="text-2xl font-black text-indigo-600">₹{order.totalPrice?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6">Delivery</h3>
              <div className="space-y-2">
                <p className="text-sm font-black text-gray-900">{order.shippingAddress?.fullName}</p>
                <p className="text-xs font-medium text-gray-500 leading-relaxed">
                  {order.shippingAddress?.addressLine1},<br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                  {order.shippingAddress?.pincode}
                </p>
                <div className="pt-4 flex items-center gap-2 text-xs font-black text-indigo-600">
                  <FiClock /> 📞 {order.shippingAddress?.phone}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default OrdersPage;