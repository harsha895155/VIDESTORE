import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiArrowLeft, FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import API from '../services/api';

const PRIMARY = '#4F46E5';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1=email, 2=otp+newpass, 3=success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const navigate = useNavigate();

  // Step 1 — Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email });
      setMaskedEmail(res.message?.match(/to (.+)$/)?.[1] || email);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally { setLoading(false); }
  };

  // Step 2 — Verify OTP + Reset password
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) { setError('Please enter the 6-digit OTP.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await API.post('/auth/reset-password', { email, otp, newPassword });
      setStep(3);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const inputClass = "w-full h-14 bg-white/5 border-2 border-transparent rounded-2xl px-5 text-sm font-bold text-white focus:border-gold transition-all outline-none focus:bg-white/10";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'var(--bg)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">

        {/* Brand/Header */}
        <div className="text-center mb-4">
          <Link to="/" className="inline-block mb-3">
            <span className="serif text-4xl font-black tracking-tighter" style={{ color: 'var(--t)' }}>Vide<span style={{ color: 'var(--p)' }}>Store</span></span>
          </Link>
          
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all`}
                  style={{ 
                    backgroundColor: step >= s ? 'var(--p)' : 'var(--bg-alt)',
                    color: step >= s ? 'white' : 'var(--t-muted)',
                    border: step >= s ? 'none' : '1px solid var(--b)'
                  }}>
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && <div className={`w-10 h-1 transition-all rounded-full`} style={{ background: step > s ? 'var(--p)' : 'var(--b)' }} />}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[3rem] border p-8 sm:p-12 relative overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--b)' }}>
          {/* Decorative element */}
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <FiShield size={120} style={{ color: 'var(--p)' }} />
          </div>

          <AnimatePresence mode="wait">

            {/* ── Step 1: Enter Email ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-left mb-8 relative z-10">
                  <h1 className="serif text-3xl font-black mb-3" style={{ color: 'var(--t)' }}>Forgot Password?</h1>
                  <p className="font-medium leading-relaxed" style={{ color: 'var(--t-muted)' }}>
                    Don't worry, it happens. Enter your email and we'll send you a code to reset your password.
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-3 px-4 py-3 mb-6 border border-red-500/20 rounded-2xl" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                    <FiAlertCircle size={16} className="text-red-500 flex-shrink-0" />
                    <p className="text-sm font-bold text-red-500">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSendOTP} className="space-y-6 relative z-10">
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block ml-1">Email Address</label>
                    <div className="relative">
                      <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                      <input 
                        type="email" 
                        value={email} 
                        onChange={e => { setEmail(e.target.value); setError(''); }}
                        placeholder="you@example.com" 
                        required 
                        className={`${inputClass} pl-12`}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full h-14 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
                    style={{ background: 'var(--p)' }}
                  >
                    {loading ? 'Sending Code...' : 'Send Reset Code'}
                  </button>
                </form>

                <div className="text-center mt-8">
                  <Link to="/login" className="text-sm font-bold text-white/40 hover:text-white transition-colors flex items-center justify-center gap-2">
                    <FiArrowLeft size={16} /> Back to Sign In
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Enter OTP + New Password ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-left mb-8 relative z-10">
                  <h1 className="serif text-3xl font-black mb-3" style={{ color: 'var(--t)' }}>Security Check</h1>
                  <p className="font-medium leading-relaxed" style={{ color: 'var(--t-muted)' }}>
                    We've sent a 6-digit code to <span style={{ color: 'var(--p)', fontWeight: '900' }}>{maskedEmail}</span>.
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-3 px-4 py-3 mb-6 border border-red-500/20 rounded-2xl" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                    <FiAlertCircle size={16} className="text-red-500 flex-shrink-0" />
                    <p className="text-sm font-bold text-red-500">{error}</p>
                  </div>
                )}

                <form onSubmit={handleReset} className="space-y-6 relative z-10">
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block ml-1 text-center">Enter 6-Digit Code</label>
                    <input 
                      type="text" 
                      value={otp}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full h-16 bg-white/5 border-2 border-transparent rounded-2xl text-center text-3xl font-black tracking-[0.5em] focus:bg-white/10 focus:border-gold transition-all outline-none"
                      style={{ color: 'var(--p)' }}
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block ml-1">New Password</label>
                      <div className="relative">
                        <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                        <input 
                          type={showPass ? 'text' : 'password'} 
                          value={newPassword}
                          onChange={e => { setNewPassword(e.target.value); setError(''); }}
                          placeholder="Min. 6 characters"
                          className={`${inputClass} pl-12 pr-14`}
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                          {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block ml-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                        placeholder="Repeat new password"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading || otp.length < 6}
                    className="w-full h-14 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
                    style={{ background: 'var(--p)' }}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>

                <div className="flex items-center justify-between mt-8">
                  <button onClick={() => { setStep(1); setOtp(''); setError(''); }}
                    className="text-xs font-black text-white/40 hover:text-white transition-all flex items-center gap-1 uppercase tracking-widest">
                    <FiArrowLeft /> Back
                  </button>
                  <button onClick={handleSendOTP}
                    className="text-xs font-black hover:opacity-70 transition-all uppercase tracking-widest" style={{ color: 'var(--p)' }}>
                    Resend Code
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Success ── */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center relative z-10">
                <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm" style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
                  <FiCheckCircle size={44} className="text-green-500" />
                </div>
                <h1 className="serif text-4xl font-black mb-4" style={{ color: 'var(--t)' }}>Success!</h1>
                <p className="font-medium leading-relaxed mb-10 max-w-xs mx-auto" style={{ color: 'var(--t-muted)' }}>
                  Your password has been updated successfully. You can now sign in with your new credentials.
                </p>
                <button onClick={() => navigate('/login')}
                  className="w-full h-14 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all"
                  style={{ background: 'var(--p)' }}
                >
                  Proceed to Sign In
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}