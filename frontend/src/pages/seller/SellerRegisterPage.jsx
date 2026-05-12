import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiArrowRight, FiCheck, FiShoppingBag,
  FiUser, FiMail, FiPhone, FiMapPin, FiFileText,
  FiEye, FiEyeOff, FiShield, FiTrendingUp, FiPackage,
  FiAlertCircle, FiCreditCard, FiPieChart
} from 'react-icons/fi';

const GOLD = 'var(--p)';
const BG = 'var(--bg)';
const CARD = 'var(--card)';
const BORDER = 'var(--b)';

const STEPS = [
  { label: 'Account', icon: FiUser },
  { label: 'Business', icon: FiShoppingBag },
  { label: 'Address', icon: FiMapPin },
  { label: 'Bank', icon: FiCreditCard },
  { label: 'Confirm', icon: FiShield },
];

const TIERS = {
  silver: { name: 'Silver', color: '#94a3b8', limit: 5, commission: 15, price: 'Free' },
  gold: { name: 'Gold', color: '#fbbf24', limit: 50, commission: 10, price: '₹999/mo' },
  diamond: { name: 'Diamond', color: '#c084fc', limit: 9999, commission: 5, price: '₹2499/mo' },
};

const BENEFITS = [
  { icon: FiTrendingUp, title: 'Grow Your Business', desc: 'Reach thousands of customers across India' },
  { icon: FiPackage, title: 'Easy Inventory', desc: 'Manage products, stock & orders in one place' },
  { icon: FiShield, title: 'Secure Payments', desc: 'Fast settlements directly to your bank account' },
  { icon: FiPieChart, title: 'Analytics Dashboard', desc: 'Track sales, revenue & performance in real time' },
];

// ── Reusable Field ────────────────────────────────────────────────
function Field({ label, icon: Icon, error, hint, ...props }) {
  const [show, setShow] = useState(false);
  const isPass = props.type === 'password';
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block', color: 'var(--tm)', fontSize: '10px',
        letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px',
        fontWeight: '700', fontFamily: 'inherit',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon size={14} style={{
            position: 'absolute', left: '13px', top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.22)', pointerEvents: 'none',
          }} />
        )}
        <input
          {...props}
          type={isPass && show ? 'text' : props.type}
          style={{
            width: '100%', boxSizing: 'border-box',
            backgroundColor: 'var(--bg-alt)',
            border: `1px solid ${error ? 'var(--d)' : 'var(--b)'}`,
            borderRadius: '12px',
            padding: `12px ${isPass ? '44px' : '16px'} 12px ${Icon ? '40px' : '16px'}`,
            color: 'var(--t)', fontSize: '14px', outline: 'none',
            fontFamily: 'inherit', transition: 'all 0.3s',
          }}
          onFocus={e => e.target.style.borderColor = GOLD}
          onBlur={e => e.target.style.borderColor = error ? 'var(--d)' : 'var(--b)'}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{
              position: 'absolute', right: '13px', top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)', padding: 0,
            }}
          >
            {show ? <FiEyeOff size={14} /> : <FiEye size={14} />}
          </button>
        )}
      </div>
      {hint && !error && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '5px', fontFamily: 'inherit' }}>{hint}</p>}
      {error && <p style={{ color: '#f87171', fontSize: '11px', marginTop: '5px', fontFamily: 'inherit' }}>{error}</p>}
    </div>
  );
}

// ── Reusable SelectField ──────────────────────────────────────────
function SelectField({ label, icon: Icon, children, error, ...props }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block', color: 'var(--tm)', fontSize: '10px',
        letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px',
        fontWeight: '700', fontFamily: 'inherit',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon size={14} style={{
            position: 'absolute', left: '13px', top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.22)', pointerEvents: 'none',
          }} />
        )}
        <select
          {...props}
          style={{
            width: '100%', boxSizing: 'border-box',
            backgroundColor: 'var(--bg-alt)',
            border: `1px solid ${error ? 'var(--d)' : 'var(--b)'}`,
            borderRadius: '12px',
            padding: `12px 16px 12px ${Icon ? '40px' : '16px'}`,
            color: props.value ? 'var(--t)' : 'var(--tm)',
            fontSize: '14px', outline: 'none',
            fontFamily: 'inherit', appearance: 'none', cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onFocus={e => e.target.style.borderColor = GOLD}
          onBlur={e => e.target.style.borderColor = error ? 'var(--d)' : 'var(--b)'}
        >
          {children}
        </select>
      </div>
      {error && <p style={{ color: '#f87171', fontSize: '11px', marginTop: '5px', fontFamily: 'inherit' }}>{error}</p>}
    </div>
  );
}

// ── Info box ──────────────────────────────────────────────────────
function InfoBox({ color = GOLD, children }) {
  return (
    <div style={{
      backgroundColor: `${color}08`,
      border: `1px solid ${color}25`,
      borderRadius: '8px', padding: '12px 14px', marginBottom: '16px',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', lineHeight: '1.65', fontFamily: 'inherit', margin: 0 }}>
        {children}
      </p>
    </div>
  );
}

// ── Indian states list ────────────────────────────────────────────
const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Other',
];

// ── Mobile detection hook ─────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

// ── Main Page ─────────────────────────────────────────────────────
export default function SellerRegisterPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    // Step 0
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    // Step 1
    businessName: '', businessType: '', gstin: '', category: '',
    // Step 2
    tier: 'silver',
    // Step 3
    addressLine: '', city: '', state: '', pincode: '',
    // Step 4
    bankAccount: '', confirmBankAccount: '', ifsc: '', accountName: '', bankName: '',
    // Step 5
    agreed: false,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Pincode verification state ────────────────────────────────
  const [pinChecking, setPinChecking] = useState(false);
  const [pinValid, setPinValid] = useState(null);   // null=unchecked, true=ok, false=fail
  const [pinMsg, setPinMsg] = useState('');
  const [pinNotService, setPinNotService] = useState(false);
  const pinTimerRef = useRef(null);

  // Auto-verify pincode using India Post + Shiprocket (same as Checkout)
  useEffect(() => {
    const pin = form.pincode?.trim();
    if (!pin || pin.length !== 6 || !/^[0-9]{6}$/.test(pin)) {
      setPinValid(null); setPinMsg(''); setPinNotService(false); setPinChecking(false);
      return;
    }
    // Debounce 600ms
    clearTimeout(pinTimerRef.current);
    pinTimerRef.current = setTimeout(async () => {
      setPinChecking(true); setPinValid(null); setPinMsg(''); setPinNotService(false);
      try {
        // Step 1: India Post — validate pincode + auto-fill city/state
        const r = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await r.json();
        const post = data?.[0];
        if (post?.Status !== 'Success' || !post?.PostOffice?.length) {
          setPinValid(false); setPinNotService(true);
          setPinMsg(`Pincode ${pin} is not valid. Please enter a correct pincode.`);
          setPinChecking(false); return;
        }
        // Auto-fill city and state from India Post
        const po = post.PostOffice[0];
        setForm(f => ({
          ...f,
          city: f.city || po.District || po.Name || '',
          state: f.state || po.State || '',
        }));
        // Step 2: Shiprocket serviceability check
        try {
          const res = await fetch(
            `/api/delivery/check-pincode?pincode=${pin}`,
            { headers: { 'Content-Type': 'application/json' } }
          ).then(r => r.json());
          if (!res.serviceable) {
            setPinValid(false); setPinNotService(true);
            setPinMsg(`Shiprocket cannot deliver to pincode ${pin}. Please use a different pickup address.`);
          } else {
            setPinValid(true); setPinNotService(false);
            setPinMsg('✅ Pincode verified — Shiprocket pickup available');
          }
        } catch {
          // Backend unreachable — don't block, just mark valid
          setPinValid(true); setPinNotService(false);
          setPinMsg('✅ Pincode valid');
        }
      } catch {
        setPinValid(null); setPinMsg('');
      } finally {
        setPinChecking(false);
      }
    }, 600);
    return () => clearTimeout(pinTimerRef.current);
  }, [form.pincode]);

  // ── Validation per step ───────────────────────────────────────
  const validate = () => {
    const e = {};

    if (step === 0) {
      if (!form.name.trim()) e.name = 'Full name required';
      if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
      if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Valid 10-digit mobile required';
      if (form.password.length < 8) e.password = 'Minimum 8 characters required';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }

    if (step === 1) {
      if (!form.businessName.trim()) e.businessName = 'Business name required';
      if (!form.businessType) e.businessType = 'Select a business type';
      if (!form.category) e.category = 'Select a category';
    }

    if (step === 2) {
      if (!form.addressLine.trim()) e.addressLine = 'Address required';
      if (!form.city.trim()) e.city = 'City required';
      if (!form.state) e.state = 'Select a state';
      if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Valid 6-digit pincode required';
    }

    if (step === 3) {
      if (!form.accountName.trim()) e.accountName = 'Account holder name required';
      if (!form.bankName.trim()) e.bankName = 'Bank name required';
      if (!form.bankAccount.trim()) e.bankAccount = 'Account number required';
      if (form.bankAccount !== form.confirmBankAccount) e.confirmBankAccount = 'Account numbers do not match';
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc.toUpperCase())) e.ifsc = 'Valid IFSC required (e.g. SBIN0001234)';
    }

    if (step === 4) {
      if (!form.agreed) e.agreed = 'You must accept the terms to continue';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => { setStep(s => s - 1); setErrors({}); };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.registerSeller({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        sellerInfo: {
          businessName: form.businessName,
          businessType: form.businessType,
          gstin: form.gstin,
          category: form.category,
          address: {
            line: form.addressLine,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
          bank: {
            account: form.bankAccount,
            ifsc: form.ifsc.toUpperCase(),
            name: form.accountName,
            bankName: form.bankName,
          },
          tier: form.tier,
          listingLimit: TIERS[form.tier]?.limit || 5,
        },
      });

      // Log them in immediately
      localStorage.setItem('videstore_token', res.token);
      localStorage.setItem('videstore_user', JSON.stringify(res.user));

      const isUpgrade = res.message?.toLowerCase().includes('upgraded');
      toast.success(
        isUpgrade
          ? '🎉 Account upgraded to seller! Welcome to your dashboard.'
          : '🎉 Seller account created! Welcome aboard.',
        { duration: 3000 }
      );

      setTimeout(() => navigate('/seller/dashboard'), 1200);

    } catch (err) {
      const msg = err?.message || '';

      if (msg.includes('Enter your existing account password')) {
        toast.error(
          'This email is already registered. Enter your existing VideStore password to upgrade your account.',
          { duration: 6000 }
        );
        setStep(0);
        setErrors({ password: 'Enter your existing VideStore account password to upgrade' });
      } else if (msg.includes('already registered as a seller')) {
        toast.error('This email is already a seller account. Redirecting to login…', { duration: 4000 });
        setTimeout(() => navigate('/login'), 2000);
      } else if (msg.includes('admin account')) {
        toast.error('This email belongs to an admin account and cannot be used here.');
      } else {
        toast.error(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Summary for Step 4 ────────────────────────────────────────
  const summaryRows = [
    { label: 'Name', value: form.name },
    { label: 'Email', value: form.email },
    { label: 'Phone', value: form.phone },
    { label: 'Business Name', value: form.businessName },
    { label: 'Business Type', value: form.businessType },
    { label: 'Category', value: form.category },
    { label: 'GSTIN', value: form.gstin || 'Not provided' },
    { label: 'Pincode', value: form.pincode },
    { label: 'Selected Plan', value: TIERS[form.tier]?.name },
    { label: 'Bank', value: form.bankName },
    { label: 'Account Holder', value: form.accountName },
    { label: 'Account Number', value: form.bankAccount ? `****${form.bankAccount.slice(-4)}` : '' },
    { label: 'IFSC', value: form.ifsc.toUpperCase() },
  ].filter(r => r.value);

  return (
    <>
      {/* ── Global mobile styles injected once ── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Pincode grid: stacked on mobile, side-by-side on desktop */
        .pin-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 480px) {
          .pin-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Step label: hide text on very small screens */
        @media (max-width: 400px) {
          .step-label { display: none !important; }
        }

        /* Nav buttons: full-width stack on very small screens */
        @media (max-width: 360px) {
          .nav-buttons {
            flex-direction: column !important;
          }
        }

        /* Form card padding tighter on mobile */
        @media (max-width: 600px) {
          .form-card {
            padding: 20px 16px !important;
          }
        }

        /* Reduce outer horizontal padding on mobile */
        @media (max-width: 600px) {
          .form-panel {
            padding-left: 12px !important;
            padding-right: 12px !important;
            padding-top: 24px !important;
          }
        }

        /* Step progress: shrink circle on tiny screens */
        @media (max-width: 360px) {
          .step-circle {
            width: 26px !important;
            height: 26px !important;
          }
        }

        /* Summary table: wrap value text properly */
        .summary-row-value {
          word-break: break-all;
          text-align: right;
        }
        @media (max-width: 480px) {
          .summary-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 2px !important;
          }
          .summary-row-value {
            text-align: left !important;
          }
        }

        /* Mobile: compact top bar with brand name */
        .mobile-topbar {
          display: none;
        }
        @media (max-width: 1023px) {
          .mobile-topbar {
            display: flex;
          }
        }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: BG, display: 'flex' }}>

        {/* ── Left sidebar (desktop only) ── */}
        <div
          className="hidden lg:flex"
          style={{
            width: '360px', flexShrink: 0,
            backgroundColor: 'var(--bg-alt)',
            borderRight: `1px solid ${BORDER}`,
            padding: '44px 36px',
            flexDirection: 'column',
          }}
        >
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '44px', textDecoration: 'none' }}>
            <FiArrowLeft size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontFamily: 'inherit', letterSpacing: '0.08em' }}>
              Back to VideStore
            </span>
          </Link>

          <p style={{ color: GOLD, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'inherit' }}>
            Seller Program
          </p>
          <h2 style={{ color: '#fff', fontFamily: 'Cinzel, serif', fontSize: '22px', letterSpacing: '0.08em', lineHeight: '1.35', marginBottom: '14px' }}>
            Grow Your Business with VideStore
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', lineHeight: '1.7', fontFamily: 'inherit', marginBottom: '32px' }}>
            Join thousands of sellers already growing their fashion business on India's premium marketplace.
          </p>

          {/* Benefits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: '13px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                  backgroundColor: `${GOLD}15`, border: `1px solid ${GOLD}28`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={15} style={{ color: GOLD }} />
                </div>
                <div>
                  <p style={{ color: '#fff', fontSize: '13px', fontWeight: '600', marginBottom: '3px', fontFamily: 'inherit' }}>{title}</p>
                  <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '12px', lineHeight: '1.5', fontFamily: 'inherit' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Existing account upgrade notice */}
          <div style={{
            marginTop: '32px', padding: '14px 16px',
            backgroundColor: `${GOLD}08`, border: `1px solid ${GOLD}22`, borderRadius: '8px',
          }}>
            <p style={{ color: GOLD, fontSize: '11px', fontWeight: '600', marginBottom: '5px', fontFamily: 'inherit' }}>
              Already have a VideStore account?
            </p>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px', lineHeight: '1.6', fontFamily: 'inherit', margin: 0 }}>
              Use the same email & your existing password — your account will be upgraded to a seller account automatically. Your orders and profile stay intact.
            </p>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: `1px solid ${BORDER}` }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontFamily: 'inherit' }}>
              Already a seller?{' '}
              <Link to="/login" style={{ color: GOLD, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div
          className="form-panel"
          style={{
            flex: 1, overflowY: 'auto',
            padding: '44px 24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}
        >
          <div style={{ width: '100%', maxWidth: '520px' }}>

            {/* ── Mobile top bar: back link + brand ── */}
            <div
              className="mobile-topbar"
              style={{
                alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '24px',
              }}
            >
              <Link
                to="/"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  textDecoration: 'none', color: 'rgba(255,255,255,0.3)',
                  fontSize: '12px', fontFamily: 'inherit',
                }}
              >
                <FiArrowLeft size={13} />
                <span>Back</span>
              </Link>

              {/* Brand name centred on mobile */}
              <span style={{
                color: GOLD, fontSize: '13px', fontFamily: 'Cinzel, serif',
                letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                VideStore
              </span>

              {/* Placeholder to keep brand centred */}
              <span style={{ width: '48px' }} />
            </div>

            {/* Mobile: seller program mini-header */}
            <div
              className="lg:hidden"
              style={{
                display: isMobile ? 'block' : 'none',
                marginBottom: '20px',
                paddingBottom: '20px',
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <p style={{
                color: GOLD, fontSize: '10px', letterSpacing: '0.2em',
                textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'inherit',
              }}>
                Seller Program
              </p>
              <h2 style={{
                color: '#fff', fontFamily: 'Cinzel, serif',
                fontSize: '18px', letterSpacing: '0.06em', lineHeight: '1.3',
              }}>
                Grow Your Business
              </h2>
            </div>

            {/* ── Step progress bar ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
              {STEPS.map((s, i) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div
                      className="step-circle"
                      style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        backgroundColor: i < step ? GOLD : i === step ? 'transparent' : 'transparent',
                        border: `2px solid ${i <= step ? GOLD : 'rgba(255,255,255,0.1)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s',
                        boxShadow: i === step ? `0 0 15px ${GOLD}33` : 'none',
                      }}
                    >
                      {i < step
                        ? <FiCheck size={14} style={{ color: '#fff' }} />
                        : <s.icon size={14} style={{ color: i === step ? GOLD : 'rgba(255,255,255,0.25)' }} />
                      }
                    </div>
                    <span
                      className="step-label"
                      style={{
                        fontSize: '8px', color: i <= step ? GOLD : 'rgba(255,255,255,0.2)',
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        fontWeight: '800', fontFamily: 'inherit', whiteSpace: 'nowrap',
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{
                      flex: 1, height: '1px',
                      backgroundColor: i < step ? GOLD : 'rgba(255,255,255,0.07)',
                      marginBottom: '22px', marginLeft: '4px', marginRight: '4px',
                      transition: 'background-color 0.3s',
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* ── Form card ── */}
            <div
              className="form-card"
              style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: '24px', padding: '32px', boxShadow: 'var(--shadow-premium)' }}
            >

              {/* ════ STEP 0 — Account ════ */}
              {step === 0 && (
                <>
                  <h3 style={{ color: '#fff', fontFamily: 'Cinzel, serif', fontSize: '17px', letterSpacing: '0.08em', marginBottom: '5px' }}>
                    Create Your Account
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '22px', fontFamily: 'inherit' }}>
                    These will be your login credentials for the seller dashboard.
                  </p>

                  <InfoBox>
                    💡 <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Already have a VideStore account?</strong> Enter your existing email and password below — your account will be upgraded to a seller account automatically.
                  </InfoBox>

                  <Field
                    label="Full Name" icon={FiUser} type="text"
                    value={form.name} onChange={e => set('name', e.target.value)}
                    error={errors.name} placeholder="Your full name"
                  />
                  <Field
                    label="Email Address" icon={FiMail} type="email"
                    value={form.email} onChange={e => set('email', e.target.value)}
                    error={errors.email} placeholder="you@business.com"
                  />
                  <Field
                    label="Mobile Number" icon={FiPhone} type="tel"
                    value={form.phone} onChange={e => set('phone', e.target.value)}
                    error={errors.phone} placeholder="10-digit mobile number"
                  />
                  <Field
                    label="Password" type="password"
                    value={form.password} onChange={e => set('password', e.target.value)}
                    error={errors.password}
                    placeholder="Min 8 characters"
                  />
                  <Field
                    label="Confirm Password" type="password"
                    value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                    error={errors.confirmPassword} placeholder="Re-enter password"
                  />
                </>
              )}
                       {/* ════ STEP 1 — Business Information ════ */}
              {step === 1 && (
                <>
                  <h3 style={{ color: '#fff', fontFamily: 'Cinzel, serif', fontSize: '18px', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Business Information
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginBottom: '24px', fontFamily: 'inherit' }}>
                    Tell us about your business to set up your seller profile.
                  </p>

                  <Field
                    label="Business / Brand Name" icon={FiShoppingBag} type="text"
                    value={form.businessName} onChange={e => set('businessName', e.target.value)}
                    error={errors.businessName} placeholder="Your brand or shop name"
                  />
                  <SelectField
                    label="Business Type" icon={FiFileText}
                    value={form.businessType} onChange={e => set('businessType', e.target.value)}
                    error={errors.businessType}
                  >
                    <option value="">Select business type</option>
                    <option value="individual">Individual / Sole Proprietor</option>
                    <option value="partnership">Partnership Firm</option>
                    <option value="pvt_ltd">Private Limited Company</option>
                    <option value="llp">LLP</option>
                    <option value="other">Other</option>
                  </SelectField>
                  <SelectField
                    label="Primary Category" icon={FiPackage}
                    value={form.category} onChange={e => set('category', e.target.value)}
                    error={errors.category}
                  >
                    <option value="">Select your main category</option>
                    <option value="men">Men's Fashion</option>
                    <option value="women">Women's Fashion</option>
                    <option value="streetwear">Streetwear</option>
                    <option value="accessories">Accessories</option>
                    <option value="all">Multiple Categories</option>
                  </SelectField>
                  <Field
                    label="GSTIN (Optional)" icon={FiFileText} type="text"
                    value={form.gstin} onChange={e => set('gstin', e.target.value)}
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    hint="Leave blank if annual turnover is below ₹20 lakhs — you can add it later from your seller dashboard."
                  />

                  {/* Plan Selection Integrated Here */}
                  <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: `1px solid ${BORDER}` }}>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '700' }}>
                      Choose Your Account Plan
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {Object.entries(TIERS).map(([key, tier]) => (
                        <div 
                          key={key} 
                          onClick={() => set('tier', key)}
                          style={{ 
                            backgroundColor: '#0d0d0d', 
                            border: `1px solid ${form.tier === key ? tier.color : 'rgba(255,255,255,0.1)'}`, 
                            borderRadius: '10px', 
                            padding: '14px', 
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FiShield size={14} style={{ color: tier.color }} />
                              <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>{tier.name}</span>
                            </div>
                            <span style={{ color: tier.color, fontSize: '13px', fontWeight: '800' }}>{tier.price}</span>
                          </div>
                          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: 0 }}>
                            Up to <strong>{tier.limit === 9999 ? 'Unlimited' : tier.limit}</strong> products • <strong>{tier.commission}%</strong> commission
                          </p>
                          {form.tier === key && (
                            <div style={{ position: 'absolute', top: '10px', right: '10px', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: tier.color }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ════ STEP 2 — Pickup Address ════ */}
              {step === 2 && (
                <>
                  <h3 style={{ color: '#fff', fontFamily: 'Cinzel, serif', fontSize: '18px', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Pickup Address
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginBottom: '24px', fontFamily: 'inherit' }}>
                    Our logistics partner will pick up orders from this address.
                  </p>

                  <InfoBox>
                    📦 This address is used for <strong style={{ color: 'rgba(255,255,255,0.6)' }}>order pickups</strong> by our delivery partner.
                  </InfoBox>

                  <Field
                    label="Street / Area / Building" icon={FiMapPin} type="text"
                    value={form.addressLine} onChange={e => set('addressLine', e.target.value)}
                    error={errors.addressLine} placeholder="e.g. 12, Gandhi Road, Opp. City Mall"
                  />

                  <div className="pin-grid">
                    <Field
                      label="City" type="text"
                      value={form.city} onChange={e => set('city', e.target.value)}
                      error={errors.city} placeholder="City"
                    />
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700' }}>
                        Pincode
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text" maxLength={6}
                          value={form.pincode}
                          onChange={e => set('pincode', e.target.value.replace(/\D/g, ''))}
                          placeholder="6-digit pincode"
                          style={{
                            width: '100%', boxSizing: 'border-box', backgroundColor: '#0d0d0d',
                            border: `1px solid ${errors.pincode ? '#f87171' : pinValid === true ? '#4ade80' : pinValid === false ? '#f87171' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '6px', padding: '11px 40px 11px 14px',
                            color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit',
                          }}
                        />
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                          {pinChecking && (
                            <div style={{ width: '14px', height: '14px', border: '2px solid rgba(201,168,76,0.3)', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          )}
                          {!pinChecking && pinValid === true && <span style={{ color: '#4ade80', fontSize: '16px', lineHeight: '1' }}>&#10003;</span>}
                          {!pinChecking && pinValid === false && <span style={{ color: '#f87171', fontSize: '16px', lineHeight: '1' }}>&#10007;</span>}
                        </div>
                      </div>
                      {pinMsg && !errors.pincode && <p style={{ color: pinValid ? '#4ade80' : '#f87171', fontSize: '10px', marginTop: '5px' }}>{pinMsg}</p>}
                      {errors.pincode && <p style={{ color: '#f87171', fontSize: '10px', marginTop: '5px' }}>{errors.pincode}</p>}
                    </div>
                  </div>

                  <SelectField
                    label="State"
                    value={form.state} onChange={e => set('state', e.target.value)}
                    error={errors.state}
                  >
                    <option value="">Select state</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </SelectField>
                </>
              )}

              {/* ════ STEP 3 — Bank Details ════ */}
              {step === 3 && (
                <>
                  <h3 style={{ color: '#fff', fontFamily: 'Cinzel, serif', fontSize: '18px', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Bank Account Details
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginBottom: '24px', fontFamily: 'inherit' }}>
                    All payments will be settled to this account.
                  </p>

                  <Field
                    label="Account Holder Name" icon={FiUser} type="text"
                    value={form.accountName} onChange={e => set('accountName', e.target.value)}
                    error={errors.accountName} placeholder="Exactly as per bank records"
                  />
                  <Field
                    label="Bank Name" icon={FiCreditCard} type="text"
                    value={form.bankName} onChange={e => set('bankName', e.target.value)}
                    error={errors.bankName} placeholder="e.g. State Bank of India"
                  />
                  <Field
                    label="Account Number" icon={FiCreditCard} type="text"
                    value={form.bankAccount} onChange={e => set('bankAccount', e.target.value)}
                    error={errors.bankAccount} placeholder="Enter account number"
                  />
                  <Field
                    label="Confirm Account Number" icon={FiCreditCard} type="password"
                    value={form.confirmBankAccount} onChange={e => set('confirmBankAccount', e.target.value)}
                    error={errors.confirmBankAccount} placeholder="Re-enter to confirm"
                  />
                  <Field
                    label="IFSC Code" icon={FiFileText} type="text"
                    value={form.ifsc} onChange={e => set('ifsc', e.target.value.toUpperCase())}
                    error={errors.ifsc} placeholder="e.g. SBIN0001234"
                  />
                </>
              )}

              {/* ════ STEP 4 — Review & Agree ════ */}
              {step === 4 && (
                <>
                  <h3 style={{ color: '#fff', fontFamily: 'Cinzel, serif', fontSize: '18px', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Review & Agree
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginBottom: '20px', fontFamily: 'inherit' }}>
                    Check your details before submitting your application.
                  </p>

                  <div style={{ backgroundColor: '#0d0d0d', border: `1px solid ${BORDER}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
                    {summaryRows.map(({ label, value }, i) => (
                      <div
                        key={label}
                        className="summary-row"
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '11px 16px',
                          borderBottom: i < summaryRows.length - 1 ? `1px solid ${BORDER}` : 'none',
                        }}
                      >
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontFamily: 'inherit', fontWeight: '700', textTransform: 'uppercase' }}>
                          {label}
                        </span>
                        <span className="summary-row-value" style={{ color: '#fff', fontSize: '12px', fontFamily: 'inherit', fontWeight: '600' }}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: '10px' }}>
                    <div
                      onClick={() => set('agreed', !form.agreed)}
                      style={{
                        width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0, marginTop: '2px',
                        backgroundColor: form.agreed ? GOLD : 'transparent',
                        border: `2px solid ${form.agreed ? GOLD : 'rgba(255,255,255,0.2)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      {form.agreed && <FiCheck size={12} style={{ color: '#000' }} />}
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: '1.6' }}>
                      I agree to the Seller Terms & Conditions and Privacy Policy.
                    </span>
                  </label>
                  {errors.agreed && <p style={{ color: '#f87171', fontSize: '11px' }}>{errors.agreed}</p>}
                </>
              )}

              {/* ── Navigation buttons ── */}
              <div className="nav-buttons" style={{ display: 'flex', gap: '10px', marginTop: '28px' }}>
                {step > 0 && (
                  <button
                    onClick={back}
                    style={{
                      flex: 1, padding: '12px', backgroundColor: 'transparent',
                      border: `1px solid ${BORDER}`, borderRadius: '6px',
                      color: 'rgba(255,255,255,0.45)', fontSize: '14px',
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'border-color 0.2s',
                      /* Ensures tap target is tall enough on mobile */
                      minHeight: '48px',
                    }}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = BORDER}
                  >
                    <FiArrowLeft size={14} /> Back
                  </button>
                )}

                {step < 4 ? (
                  <button
                    onClick={next}
                    style={{
                      flex: 1, padding: '12px', backgroundColor: GOLD,
                      border: 'none', borderRadius: '10px',
                      color: '#000', fontSize: '14px', fontWeight: '800',
                      cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'all 0.2s',
                      minHeight: '52px',
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'none'}
                  >
                    Continue <FiArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      flex: 1, padding: '12px',
                      backgroundColor: loading ? `${GOLD}80` : GOLD,
                      border: 'none', borderRadius: '10px',
                      color: '#000', fontSize: '14px', fontWeight: '800',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      minHeight: '52px',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseOut={e => e.currentTarget.style.transform = 'none'}
                  >
                    {loading ? 'Submitting…' : 'Submit Application'}
                  </button>
                )}
              </div>
            </div>

            <p style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.2)', fontSize: '12px', fontFamily: 'inherit' }}>
              Already a seller?{' '}
              <Link to="/login" style={{ color: GOLD, textDecoration: 'none' }}>Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}