import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff, FiAlertCircle, FiArrowRight, FiCheck } from 'react-icons/fi';
import { authAPI } from '../services/api';

const injectAuthStyles = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('auth-styles-luxury')) return;
  const s = document.createElement('style');
  s.id = 'auth-styles-luxury';
  s.textContent = `
    .fl-wrap { position: relative; width: 100%; }
    .fl-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      color: var(--t);
      border: 1px solid var(--b);
      border-radius: 1.5rem;
      padding: 1.5rem 1rem 0.6rem;
      font-size: 14px;
      font-weight: 600;
      outline: none;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .fl-input:focus {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--p);
      box-shadow: 0 0 20px rgba(200, 166, 70, 0.2);
    }
    .fl-input.err { border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }
    
    .fl-label {
      position: absolute;
      left: 1rem; top: 50%;
      transform: translateY(-50%);
      font-size: 13px;
      font-weight: 700;
      color: var(--tm);
      pointer-events: none;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      letter-spacing: 0.05em;
    }
    .fl-input:focus ~ .fl-label,
    .fl-input:not(:placeholder-shown) ~ .fl-label {
      top: 0.8rem; transform: none;
      font-size: 9px; letter-spacing: 0.2em;
      text-transform: uppercase; color: var(--p);
    }
  `;
  document.head.appendChild(s);
};

function FloatInput({ label, type = 'text', value, onChange, hasError, rightSlot, autoComplete }) {
  return (
    <div className="fl-wrap">
      <input
        className={`fl-input ${hasError ? 'err' : ''}`}
        type={type} value={value} onChange={onChange}
        placeholder=" " autoComplete={autoComplete}
        style={rightSlot ? { paddingRight: 48 } : {}}
      />
      <label className="fl-label">{label}</label>
      {rightSlot}
    </div>
  );
}

const EyeBtn = ({ show, toggle }) => (
  <button type="button" onClick={toggle}
    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors p-1 z-10" style={{ color: 'var(--tl)' }}>
    {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
  </button>
);

const GoogleSVG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function AuthLayout({ children, image, title, subtitle, isRegister }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel: Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-8 relative z-10">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-6">
            <Link to="/" className="flex items-center gap-5 mb-10 group no-underline">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-premium transition-all duration-1000 group-hover:rotate-[360deg] group-hover:scale-110 border border-[var(--p)]/30" 
                style={{ background: 'var(--card)', boxShadow: 'var(--shadow-premium)' }}>
                <span className="serif text-[var(--p)] text-3xl font-black">V</span>
              </div>
              <div className="flex flex-col border-l border-[var(--b)] pl-5 py-1">
                <span className="serif text-3xl font-black tracking-tighter text-gradient-gold leading-none">VIDESTORE</span>
                <span className="text-[8px] font-black tracking-[0.4em] text-[var(--tl)] uppercase opacity-40 mt-1">Exclusive Luxury</span>
              </div>
            </Link>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] mb-4" style={{ color: 'var(--s)' }}>{subtitle}</p>
            <h1 className="serif text-5xl font-bold leading-tight" style={{ color: 'var(--t)' }}>{title}</h1>
          </div>
          {children}
        </div>
      </div>

      {/* Right Panel: Image (Desktop) */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          src={image} 
          alt="Auth Visual" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(200, 166, 70, 0.2), rgba(0, 0, 0, 0.6))' }} />
        
        {/* Floating Decoration */}
        <div className="absolute bottom-16 left-16 right-16 p-12 rounded-[3.5rem] border border-white/30 text-white backdrop-blur-3xl bg-white/10 shadow-2xl">
          <p className="serif text-3xl font-medium leading-relaxed italic mb-8" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
            "{isRegister ? 'Join our exclusive community of trendsetters and style icons.' : 'Experience the next generation of digital fashion and luxury.'}"
          </p>
          <div className="flex items-center gap-6">
            <div className="w-12 h-px bg-white/60" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/80">The Collective Editorial</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  injectAuthStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/home';

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setErrorField('');
    if (!email.trim()) { setError('Email is required'); setErrorField('email'); return; }
    if (!password) { setError('Password is required'); setErrorField('password'); return; }
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.message || 'Authentication failed');
      setErrorField(res.message?.toLowerCase().includes('password') ? 'password' : 'email');
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Access Your Account" 
      image="https://images.unsplash.com/photo-1539109132314-34a7735ee29c?w=1200&q=80"
    >
      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 rounded-2xl flex items-start gap-4 border"
            style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.1)' }}
          >
            <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-bold text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={submit} className="space-y-5">
        <FloatInput 
          label="Email Address" 
          type="email" 
          value={email} 
          onChange={e => { setEmail(e.target.value); setError(''); }}
          hasError={errorField === 'email'}
          autoComplete="off"
        />
        <div className="relative">
          <FloatInput 
            label="Password" 
            type={showPass ? 'text' : 'password'} 
            value={password} 
            onChange={e => { setPassword(e.target.value); setError(''); }}
            hasError={errorField === 'password'}
            autoComplete="new-password"
            rightSlot={<EyeBtn show={showPass} toggle={() => setShowPass(!showPass)} />}
          />
        </div>
        
        <div className="flex justify-end pt-1">
          <Link to="/forgot-password" size="sm" className="text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: 'var(--p)' }}>
            Forgot Password?
          </Link>
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="btn-premium w-full h-[64px] rounded-3xl"
        >
          {submitting ? 'Authenticating...' : 'Sign In'}
          {!submitting && <FiArrowRight className="inline ml-2" />}
        </button>

        <div className="relative py-6 flex items-center gap-6">
          <div className="flex-1 h-px" style={{ background: 'var(--b)' }} />
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Or continue with</span>
          <div className="flex-1 h-px" style={{ background: 'var(--b)' }} />
        </div>

        <button 
          type="button" 
          onClick={() => authAPI.googleLogin()}
          className="w-full h-[60px] rounded-3xl border-2 transition-all flex items-center justify-center gap-4 text-sm font-bold glass"
          style={{ borderColor: 'rgba(255, 255, 255, 0.3)', color: 'var(--t)' }}
        >
          <GoogleSVG /> Continue with Google
        </button>
      </form>

      <p className="mt-12 text-center text-sm font-medium" style={{ color: 'var(--t-muted)' }}>
        New to VideStore?{' '}
        <Link to="/register" className="font-black hover:opacity-70" style={{ color: 'var(--p)' }}>Create Account</Link>
      </p>
    </AuthLayout>
  );
}

export function RegisterPage() {
  injectAuthStyles();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [strength, setStrength] = useState(0);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const pw = formData.password;
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    setStrength(s);
  }, [formData.password]);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setErrorField('');
    if (formData.password.length < 6) { setError('Password too short'); setErrorField('password'); return; }
    if (formData.password !== formData.confirm) { setError('Passwords do not match'); setErrorField('confirm'); return; }
    
    setSubmitting(true);
    const res = await register(formData);
    setSubmitting(false);
    if (res.success) navigate('/home');
    else {
      setError(res.message || 'Registration failed');
      setErrorField(res.message?.toLowerCase().includes('email') ? 'email' : 'phone');
    }
  };

  const update = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join Our Community" 
      image="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80"
      isRegister
    >
      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 rounded-2xl flex items-start gap-4 border"
            style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.1)' }}
          >
            <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-bold text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={submit} className="space-y-5">
        <FloatInput label="Full Name" value={formData.name} onChange={update('name')} required />
        <FloatInput label="Email Address" type="email" value={formData.email} onChange={update('email')} hasError={errorField === 'email'} required />
        <FloatInput label="Phone Number" type="tel" value={formData.phone} onChange={update('phone')} hasError={errorField === 'phone'} />
        
        <div className="space-y-3">
          <FloatInput 
            label="Password" 
            type={showPass ? 'text' : 'password'} 
            value={formData.password} 
            onChange={update('password')}
            hasError={errorField === 'password'}
            rightSlot={<EyeBtn show={showPass} toggle={() => setShowPass(!showPass)} />}
            required
          />
          {formData.password && (
            <div className="px-2 pt-1">
              <div className="flex gap-2 h-1">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={`flex-1 rounded-full transition-all duration-700`} style={{ background: i <= strength ? 'var(--p)' : 'var(--b)' }} />
                ))}
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest mt-3" style={{ color: 'var(--p)' }}>
                Security: {['Weak', 'Fair', 'Good', 'Strong', 'Excellent', 'Impenetrable'][strength]}
              </p>
            </div>
          )}
        </div>

        <FloatInput label="Confirm Password" type="password" value={formData.confirm} onChange={update('confirm')} hasError={errorField === 'confirm'} required />

        <button 
          type="submit" 
          disabled={submitting}
          className="btn-premium w-full h-[64px] rounded-3xl mt-6"
        >
          {submitting ? 'Creating...' : 'Create Account'}
          {!submitting && <FiArrowRight className="inline ml-2" />}
        </button>
      </form>

      <p className="mt-12 text-center text-sm font-medium" style={{ color: 'var(--t-muted)' }}>
        Member already?{' '}
        <Link to="/login" className="font-black hover:opacity-70" style={{ color: 'var(--p)' }}>Sign In</Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;