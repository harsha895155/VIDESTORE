import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, paymentAPI, couponAPI, deliveryAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiCheck, FiMapPin, FiCreditCard, FiShoppingBag, FiTruck, FiShield, FiChevronDown, FiChevronLeft, FiLock, FiInfo, FiArrowRight } from 'react-icons/fi';

const STEPS = [
  { label: 'Shipping', icon: FiMapPin },
  { label: 'Payment', icon: FiCreditCard },
  { label: 'Review',  icon: FiShoppingBag },
];

/* ── Reusable Input ── */
const TextInput = ({ label, value, onChange, placeholder, type = 'text', maxLength, required, col, error }) => {
  const [focus, setFocus] = useState(false);
  return (
    <div className={`${col || ''} flex flex-col gap-2`}>
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--tm)' }}>
        {label}
      </label>
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        maxLength={maxLength} 
        required={required}
        onFocus={() => setFocus(true)} 
        onBlur={() => setFocus(false)}
        className={`w-full px-6 py-4 rounded-2xl text-sm font-medium transition-all outline-none border-2
          ${focus ? 'shadow-premium' : ''}
          ${error ? 'border-red-500 bg-red-500/10' : ''}`}
        style={{ 
          background: 'var(--bg-alt)',
          borderColor: focus ? 'var(--p)' : 'var(--b)',
          color: 'var(--t)',
          boxShadow: focus ? 'var(--shadow-premium)' : 'none'
        }}
      />
      {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
    </div>
  );
};

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  
  const [address, setAddress] = useState({
    fullName: user?.name || '', phone: user?.phone || '',
    addressLine1: '', addressLine2: '',
    city: '', state: '', pincode: '', country: 'India',
  });

  const items = cart.items || [];
  const [shipping,        setShipping]        = useState(0);
  const [deliveryZone,    setDeliveryZone]    = useState('');
  const [notServiceable,  setNotServiceable]  = useState(false);
  const [serviceMsg,      setServiceMsg]      = useState('');
  const [checkingPin,     setCheckingPin]     = useState(false);
  const [pinValid,        setPinValid]        = useState(null);
  const [zoneLabel,       setZoneLabel]       = useState('');
  const [zoneDays,        setZoneDays]        = useState('');

  // ── Pincode validation + Shiprocket serviceability check ────────
  useEffect(() => {
    const pin = address.pincode?.trim();
    if (!pin || pin.length !== 6 || !/^[0-9]{6}$/.test(pin)) {
      setPinValid(null);
      setNotServiceable(false);
      setServiceMsg('');
      return;
    }

    setCheckingPin(true);
    setPinValid(null);

    fetch(`https://api.postalpincode.in/pincode/${pin}`)
      .then(r => r.json())
      .then(async data => {
        const post = data?.[0];

        if (post?.Status !== 'Success' || !post?.PostOffice?.length) {
          setNotServiceable(true);
          setPinValid(false);
          setServiceMsg(`Pincode ${pin} is not valid.`);
          setShipping(0);
          setCheckingPin(false);
          return;
        }

        const po = post.PostOffice[0];
        setAddress(prev => ({
          ...prev,
          city:  prev.city  || po.District || po.Name || '',
          state: prev.state || po.State    || '',
        }));

        try {
          const sellerPincode = cart.items?.[0]?.product?.createdBy?.sellerInfo?.address?.pincode || '';
          const res = await deliveryAPI.checkPincode(pin, sellerPincode);

          if (!res.serviceable) {
            setNotServiceable(true);
            setPinValid(false);
            setServiceMsg(`Delivery not available to ${pin}.`);
            setShipping(0);
          } else {
            setNotServiceable(false);
            setPinValid(true);
            setServiceMsg('');
            if (res.charge && cartTotal < 999) {
              setShipping(res.charge);
              setDeliveryZone(res.zone || 'SHIPROCKET_LIVE');
            }
          }
        } catch {
          setNotServiceable(false);
          setPinValid(true);
          setServiceMsg('');
        } finally {
          setCheckingPin(false);
        }
      })
      .catch(() => {
        setPinValid(null);
        setCheckingPin(false);
      });
  }, [address.pincode]);

  useEffect(() => {
    if (!address.pincode || address.pincode.length !== 6) { setShipping(0); setDeliveryZone(''); setZoneLabel(''); setZoneDays(''); return; }
    if (!address.city || !address.state) { setShipping(0); setDeliveryZone(''); return; }
    if (notServiceable) return;

    const productId = cart.items?.[0]?.product?._id || cart.items?.[0]?.product || '';

    deliveryAPI.getCharges({
      customerCity:    address.city,
      customerState:   address.state,
      customerPincode: address.pincode || '',
      productId,
    }).then(res => {
      if (res.success) {
        setShipping(res.charge);
        setDeliveryZone(res.zone);
        setZoneLabel(res.label);
        setZoneDays(res.days);
      }
    }).catch(() => {
      setShipping(0);
      setDeliveryZone('');
    });
  }, [address.city, address.state, address.pincode, cartTotal]);

  const total = cartTotal + (address.pincode?.length === 6 ? shipping : 0) - couponDiscount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { toast.error('Enter a coupon code'); return; }
    setApplyingCoupon(true);
    try {
      const res = await couponAPI.apply({ code: couponCode.trim(), orderTotal: cartTotal });
      setCouponDiscount(res.discount);
      setCouponApplied(res.coupon);
      toast.success(`Coupon applied! You save ₹${res.discount}`);
    } catch (err) {
      toast.error(err.message || 'Invalid coupon');
      setCouponDiscount(0); setCouponApplied(null);
    } finally { setApplyingCoupon(false); }
  };

  const removeCoupon = () => { setCouponCode(''); setCouponDiscount(0); setCouponApplied(null); };
  const set = (key) => (e) => setAddress(p => ({ ...p, [key]: e.target.value }));

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const { fullName, phone, addressLine1, city, state, pincode } = address;
    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      toast.error('Please fill all required fields'); return;
    }
    if (phone.length < 10) { toast.error('Enter valid phone number'); return; }
    if (pincode.length !== 6) { toast.error('Enter valid 6-digit pincode'); return; }
    if (notServiceable) {
      toast.error('Delivery not available to this pincode.');
      return;
    }
    setStep(1);
  };

  const placeOrder = async (paymentResult = null) => {
    setLoading(true);
    try {
      const orderItems = items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0]?.url,
        price: item.price || item.product.price,
        size: item.size, color: item.color, quantity: item.quantity,
      }));
      const res = await orderAPI.create({ orderItems, shippingAddress: address, paymentMethod, paymentResult });
      await clearCart();
      navigate(`/order-confirmation/${res.order._id}`);
    } catch (err) { toast.error(err.message || 'Failed to place order'); }
    finally { setLoading(false); }
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      const { order, key } = await paymentAPI.createRazorpayOrder(total);
      const options = {
        key, amount: order.amount, currency: order.currency,
        name: 'VideStore', description: 'Premium Order', order_id: order.id,
        handler: async (response) => {
          await paymentAPI.verifyRazorpay(response);
          await placeOrder({ id: response.razorpay_payment_id, status: 'COMPLETED', updateTime: new Date().toISOString(), emailAddress: user.email });
        },
        prefill: { name: user.name, email: user.email, contact: address.phone },
        theme: { color: 'var(--p)' },
      };
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => { const rzp = new window.Razorpay(options); rzp.open(); };
      document.body.appendChild(script);
    } catch { toast.error('Payment failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const handlePlaceOrder = () => paymentMethod === 'COD' ? placeOrder() : handleRazorpayPayment();

  /* ─────────── STEP INDICATOR ─────────── */
  const StepBar = () => (
    <div className="flex items-center justify-center mb-20 px-4">
      {STEPS.map((s, i) => (
        <div key={s.label} className="flex items-center group">
          <button 
            onClick={() => i < step && setStep(i)}
            className="flex flex-col items-center gap-4 relative"
            disabled={i > step}
          >
            <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-700
              ${i < step ? 'bg-indigo-600 text-white shadow-premium' : 
                i === step ? 'bg-white border-2 border-indigo-600 text-indigo-600 shadow-premium ring-4 ring-indigo-50' : 
                'bg-slate-100 text-slate-400 border-2 border-transparent'}`}
              style={{ 
                backgroundColor: i < step ? 'var(--p)' : (i === step ? 'var(--bg)' : 'var(--bg-alt)'),
                borderColor: i === step ? 'var(--p)' : 'transparent',
                color: i < step ? 'white' : (i === step ? 'var(--p)' : 'var(--t-muted)')
              }}>
              {i < step ? <FiCheck size={28} strokeWidth={3} /> : <s.icon size={22} />}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors
              ${i === step ? 'text-indigo-600' : i < step ? 'text-slate-900' : 'text-slate-400'}`}
              style={{ color: i === step ? 'var(--p)' : (i < step ? 'var(--t)' : 'var(--t-muted)') }}>
              {s.label}
            </span>
          </button>
          {i < STEPS.length - 1 && (
            <div className="mx-6 sm:mx-10 h-[2px] rounded-full transition-all duration-1000 w-16 sm:w-28" 
              style={{ background: i < step ? 'var(--p)' : 'var(--b)' }}
            />
          )}
        </div>
      ))}
    </div>
  );

  /* ─────────── ORDER SUMMARY ─────────── */
  const OrderSummary = ({ mobile }) => (
    <div className="rounded-[2.5rem] border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--b)', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
      {/* Mobile toggle header */}
      {mobile && (
        <button onClick={() => setSummaryOpen(!summaryOpen)}
          className="w-full flex items-center justify-between px-8 py-6" style={{ background: 'var(--bg-alt)' }}>
          <div className="flex items-center gap-4">
            <FiShoppingBag size={20} style={{ color: 'var(--p)' }} />
            <span className="font-bold text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--t)' }}>
              Summary
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-extrabold text-xl" style={{ color: 'var(--p)' }}>₹{total.toLocaleString()}</span>
            <FiChevronDown size={22} className={`transition-transform duration-500 ${summaryOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--t-muted)' }} />
          </div>
        </button>
      )}

      {/* Desktop header */}
      {!mobile && (
        <div className="px-10 py-8 border-b" style={{ background: 'var(--bg-alt)', borderColor: 'var(--b)' }}>
          <div className="flex items-center gap-4">
            <FiShoppingBag size={20} style={{ color: 'var(--p)' }} />
            <h3 className="font-bold text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--t)' }}>Order Summary</h3>
          </div>
        </div>
      )}

      {/* Content */}
      {(!mobile || summaryOpen) && (
        <div className="p-10">
          {/* Items */}
          <div className="space-y-6 mb-10 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
            {items.map(item => (
              <div key={item._id} className="flex items-center gap-6 group">
                <div className="relative flex-shrink-0">
                  <img 
                    src={item.product?.images?.[0]?.url} 
                    alt=""
                    className="w-16 h-20 object-cover rounded-xl shadow-sm border" 
                    style={{ background: 'var(--bg-alt)', borderColor: 'var(--b)' }}
                  />
                  <span className="absolute -top-3 -right-3 w-7 h-7 rounded-lg text-[10px] font-black text-white flex items-center justify-center border-2 border-white shadow-md"
                    style={{ background: 'var(--p)' }}>
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[13px] truncate leading-tight" style={{ color: 'var(--t)' }}>{item.product?.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--p)' }}>{item.product?.brand || 'Exclusive'}</p>
                  <div className="flex gap-2 mt-2">
                    {item.size && <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border" style={{ color: 'var(--t-muted)', borderColor: 'var(--b)', background: 'var(--bg-alt)' }}>{item.size}</span>}
                  </div>
                </div>
                <p className="font-extrabold text-sm" style={{ color: 'var(--t)' }}>
                  ₹{((item.price || item.product?.price) * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="space-y-5 pt-8 border-t mb-10" style={{ borderColor: 'var(--b)' }}>
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
              <span style={{ color: 'var(--t-muted)' }}>Subtotal</span>
              <span style={{ color: 'var(--t)' }}>₹{cartTotal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
              <span style={{ color: 'var(--t-muted)' }}>Logistics</span>
              <span className={`${notServiceable ? 'text-red-500' : ''}`} style={{ color: notServiceable ? '#ef4444' : 'var(--t)' }}>
                {notServiceable ? 'Not Serviceable' : (shipping > 0 ? `₹${shipping}` : 'FREE')}
              </span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                <span style={{ color: 'var(--t-muted)' }}>Discount</span>
                <span style={{ color: '#10b981' }}>- ₹{couponDiscount}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="rounded-[2rem] p-8 mb-10 shadow-inner" style={{ background: 'var(--bg)', border: '1px solid var(--b)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--p)' }}>Final Value</span>
              <span className="text-4xl font-black tracking-tighter" style={{ color: 'var(--t)' }}>₹{total.toLocaleString()}</span>
            </div>
          </div>


          {/* Security badge */}
          <div className="flex items-center justify-center gap-3 opacity-60">
            <FiLock size={16} style={{ color: 'var(--t-muted)' }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--t-muted)' }}>Secure 256-bit SSL Vault</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen py-0 pb-16" style={{ background: 'transparent' }}>
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-4">
          <Link to="/cart" className="inline-flex items-center font-bold text-[11px] uppercase tracking-widest mb-2 transition-all hover:gap-3" style={{ color: 'var(--p)' }}>
            <FiChevronLeft size={14} className="mr-2" /> Return to Bag
          </Link>
          <h1 className="serif text-6xl font-bold tracking-tight" style={{ color: 'var(--t)' }}>Checkout</h1>
        </div>

        <StepBar />

        {/* Mobile order summary */}
        <div className="lg:hidden mb-8">
          <OrderSummary mobile />
          {/* Promo code — rendered outside OrderSummary to prevent focus loss */}
          <div className="mt-4 px-2">
            {!couponApplied ? (
              <div className="flex gap-3">
                <input
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="PROMO CODE"
                  className="flex-1 px-5 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all outline-none border-2"
                  style={{ background: 'var(--bg)', borderColor: 'var(--b)', color: 'var(--t)' }}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon}
                  className="px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  style={{ background: 'var(--t)', color: 'var(--bg)' }}
                >
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl p-5 flex items-center justify-between border" style={{ background: 'var(--primary-glow)', borderColor: 'rgba(79,70,229,0.1)' }}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--p)' }}>Code Active</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--t)' }}>{couponApplied.code}</p>
                </div>
                <button onClick={removeCoupon} className="text-red-500 font-bold text-[10px] uppercase tracking-widest hover:underline">Remove</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-20 items-start">
          
          {/* Main Form Container */}
          <div className="flex-1 w-full">
            <div className="rounded-[3rem] border p-10 sm:p-16 transition-all duration-700" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--b)', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
              
              {/* Step 0: Address */}
              {step === 0 && (
                <form onSubmit={handleAddressSubmit} className="space-y-12">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-[2rem] flex items-center justify-center shadow-inner" style={{ background: 'var(--bg-alt)', border: '1px solid var(--b)' }}>
                      <FiMapPin style={{ color: 'var(--p)' }} size={28} />
                    </div>
                    <h2 className="serif text-3xl font-bold" style={{ color: 'var(--t)' }}>Shipping Details</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <TextInput label="Full Name" value={address.fullName} onChange={set('fullName')} placeholder="Enter your name" required />
                    <TextInput label="Contact Number" value={address.phone} onChange={set('phone')} type="tel" maxLength={10} placeholder="Mobile number" required />
                    
                    <div className="md:col-span-2">
                      <TextInput label="Address Line 1" value={address.addressLine1} onChange={set('addressLine1')} placeholder="House/Flat No, Street" required />
                    </div>
                    
                    <div className="md:col-span-2">
                      <TextInput label="Landmark / Floor" value={address.addressLine2} onChange={set('addressLine2')} placeholder="Optional" />
                    </div>

                    <TextInput label="Postal Code" value={address.pincode} 
                      onChange={e => { set('pincode')(e); setPinValid(null); setNotServiceable(false); setServiceMsg(''); }} 
                      maxLength={6} placeholder="6-Digit Pin" required 
                      error={serviceMsg}
                    />
                    <TextInput label="City / Region" value={address.city} onChange={set('city')} placeholder="Locality" required />
                    <TextInput label="State" value={address.state} onChange={set('state')} placeholder="State" required />
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--t-muted)' }}>Country</label>
                      <div className="w-full px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 border-2" 
                        style={{ background: 'var(--bg-alt)', borderColor: 'var(--b)', color: 'var(--t-muted)' }}>
                        <span className="text-xl">🇮🇳</span> India
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="btn-premium w-full h-18 text-lg group"
                  >
                    Proceed to Payment
                    <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-500" />
                  </button>
                </form>
              )}

              {/* Step 1: Payment */}
              {step === 1 && (
                <div className="space-y-12">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-[2rem] flex items-center justify-center shadow-inner" style={{ background: 'var(--bg-alt)', border: '1px solid var(--b)' }}>
                      <FiCreditCard style={{ color: 'var(--p)' }} size={28} />
                    </div>
                    <h2 className="serif text-3xl font-bold" style={{ color: 'var(--t)' }}>Payment Method</h2>
                  </div>

                  <div className="grid gap-6">
                    {[
                      { id: 'Razorpay', label: 'Online Payment', sub: 'Cards, UPI, NetBanking', icon: '🔒' },
                      { id: 'COD',      label: 'Cash on Delivery', sub: 'Pay when your order arrives', icon: '💵' },
                    ].map(m => (
                      <label 
                        key={m.id} 
                        onClick={() => setPaymentMethod(m.id)}
                        className="flex items-center gap-8 p-8 cursor-pointer rounded-[2.5rem] border-2 transition-all duration-500"
                        style={{ 
                          borderColor: paymentMethod === m.id ? 'var(--p)' : 'var(--b)',
                          background: paymentMethod === m.id ? 'var(--primary-glow)' : 'transparent',
                          boxShadow: paymentMethod === m.id ? 'var(--shadow-premium)' : 'none'
                        }}
                      >
                        <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500"
                          style={{ borderColor: paymentMethod === m.id ? 'var(--p)' : 'var(--b)', background: paymentMethod === m.id ? 'var(--p)' : 'transparent' }}>
                          {paymentMethod === m.id && <div className="w-2.5 h-2.5 bg-white rounded-full shadow-inner" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-lg" style={{ color: 'var(--t)' }}>{m.label}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--t-muted)' }}>{m.sub}</p>
                        </div>
                        <span className="text-3xl grayscale opacity-40 group-hover:grayscale-0 transition-all">{m.icon}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-6">
                    <button onClick={() => setStep(0)} className="h-16 px-10 border-2 rounded-2xl font-bold transition-all"
                      style={{ borderColor: 'var(--b)', color: 'var(--t-muted)', background: 'var(--bg-alt)' }}>
                      Back to Shipping
                    </button>
                    <button onClick={() => setStep(2)} className="btn-premium flex-1 h-16">
                      Final Review
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Review */}
              {step === 2 && (
                <div className="space-y-12">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-[2rem] flex items-center justify-center shadow-inner" style={{ background: 'var(--bg-alt)', border: '1px solid var(--b)' }}>
                      <FiCheck style={{ color: 'var(--p)' }} size={28} />
                    </div>
                    <h2 className="serif text-3xl font-bold" style={{ color: 'var(--t)' }}>Order Review</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="rounded-[2rem] p-8 border relative group transition-all duration-500 hover:shadow-premium" style={{ background: 'var(--bg-alt)', borderColor: 'var(--b)' }}>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--p)' }}>Ship To</p>
                      <p className="font-bold text-lg mb-2" style={{ color: 'var(--t)' }}>{address.fullName}</p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--t-muted)' }}>
                        {address.addressLine1}, {address.city}<br />
                        {address.state} - {address.pincode}
                      </p>
                      <button onClick={() => setStep(0)} className="absolute top-8 right-8 text-[10px] font-bold uppercase tracking-widest transition-all hover:underline" style={{ color: 'var(--p)' }}>Edit</button>
                    </div>

                    <div className="rounded-[2rem] p-8 border relative group transition-all duration-500 hover:shadow-premium" style={{ background: 'var(--bg-alt)', borderColor: 'var(--b)' }}>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--p)' }}>Payment Method</p>
                      <p className="font-bold text-lg mb-2" style={{ color: 'var(--t)' }}>{paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</p>
                      <p className="text-sm" style={{ color: 'var(--t-muted)' }}>Method: {paymentMethod}</p>
                      <button onClick={() => setStep(1)} className="absolute top-8 right-8 text-[10px] font-bold uppercase tracking-widest transition-all hover:underline" style={{ color: 'var(--p)' }}>Edit</button>
                    </div>
                  </div>

                  <div className="border rounded-[2.5rem] overflow-hidden shadow-sm" style={{ background: 'var(--bg-alt)', borderColor: 'var(--b)' }}>
                    <div className="px-10 py-6 border-b flex justify-between items-center" style={{ background: 'var(--bg-alt)', borderColor: 'var(--b)' }}>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--t-muted)' }}>Your Order ({items.length})</span>
                    </div>
                    <div className="divide-y" style={{ borderColor: 'var(--b)' }}>
                      {items.map(item => (
                        <div key={item._id} className="px-10 py-8 flex items-center gap-6">
                          <img src={item.product?.images?.[0]?.url} className="w-12 h-16 object-cover rounded-xl shadow-sm border" style={{ borderColor: 'var(--b)' }} alt="" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate" style={{ color: 'var(--t)' }}>{item.product?.name}</p>
                            <p className="text-[10px] font-bold mt-1 uppercase tracking-widest" style={{ color: 'var(--p)' }}>QTY: {item.quantity} {item.size && `| SIZE: ${item.size}`}</p>
                          </div>
                          <p className="font-bold" style={{ color: 'var(--t)' }}>₹{((item.price || item.product?.price) * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <button onClick={() => setStep(1)} className="h-16 px-10 border-2 rounded-2xl font-bold transition-all"
                      style={{ borderColor: 'var(--b)', color: 'var(--t-muted)', background: 'var(--bg-alt)' }}>
                      Back to Payment
                    </button>
                    <button 
                      onClick={handlePlaceOrder} 
                      disabled={loading}
                      className="btn-premium flex-1 h-16 text-lg"
                    >
                      {loading ? 'Processing...' : (paymentMethod === 'COD' ? 'Place Order' : `Pay Now: ₹${total.toLocaleString()}`)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Summary (Desktop) */}
          <div className="hidden lg:block w-[400px] flex-shrink-0">
            <div className="sticky top-32">
              <OrderSummary />

              {/* Promo code — rendered outside OrderSummary to prevent focus loss */}
              <div className="mt-4 px-2">
                {!couponApplied ? (
                  <div className="flex gap-3">
                    <input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="PROMO CODE"
                      className="flex-1 px-5 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all outline-none border-2"
                      style={{ background: 'var(--bg)', borderColor: 'var(--b)', color: 'var(--t)' }}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon}
                      className="px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      style={{ background: 'var(--t)', color: 'var(--bg)' }}
                    >
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl p-5 flex items-center justify-between border" style={{ background: 'var(--primary-glow)', borderColor: 'rgba(79,70,229,0.1)' }}>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--p)' }}>Code Active</p>
                      <p className="text-sm font-bold" style={{ color: 'var(--t)' }}>{couponApplied.code}</p>
                    </div>
                    <button onClick={removeCoupon} className="text-red-500 font-bold text-[10px] uppercase tracking-widest hover:underline">Remove</button>
                  </div>
                )}
              </div>

              {/* Trust markers */}
              <div className="mt-12 grid grid-cols-2 gap-6 px-4">
                <div className="flex flex-col items-center text-center gap-4 group">
                  <div className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 group-hover:shadow-premium" 
                    style={{ background: 'var(--bg-alt)', border: '1px solid var(--b)', color: '#10b981' }}>
                    <FiShield size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] leading-relaxed" style={{ color: 'var(--tm)' }}>Secure SSL<br/>Transaction</span>
                </div>
                <div className="flex flex-col items-center text-center gap-4 group">
                  <div className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 group-hover:shadow-premium" 
                    style={{ background: 'var(--bg-alt)', border: '1px solid var(--b)', color: 'var(--p)' }}>
                    <FiTruck size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] leading-relaxed" style={{ color: 'var(--tm)' }}>Fast & Reliable<br/>Logistics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}