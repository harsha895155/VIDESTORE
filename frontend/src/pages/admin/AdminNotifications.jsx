import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiSend, FiSmartphone, FiMail, FiUsers, FiMessageSquare, FiCheck, FiAlertCircle, FiUploadCloud, FiActivity, FiShield, FiBell, FiRefreshCw, FiTag } from 'react-icons/fi';
import API from '../../services/api';
import toast from 'react-hot-toast';

const SMS_TEMPLATES = [
  { label: 'Royal Weekend', message: '🎉 A Royal Weekend at VideStore. Flat 20% OFF. Use code ROYAL20. Experience Luxury: videstore.in' },
  { label: 'New Collection', message: '✨ The Autumn/Winter 24 Collection has arrived. Discover the pinnacle of fashion. Shop: videstore.in' },
  { label: 'Gold Tier Service', message: '🚚 Complimentary Concierge Shipping on all orders this week. No minimum. Shop: videstore.in' },
  { label: 'Private Sale', message: '⚡ PRIVATE SALE - 3 hrs only! 30% OFF for our inner circle. Access: videstore.in' },
  { label: 'Gala Festive', message: '🎊 The Festive Gala is live. Up to 40% OFF. Use code GALA40 at VideStore. Shop: videstore.in' },
];

const EMAIL_TEMPLATES = [
  { label: 'Royal Weekend', subject: '🎉 The Royal Weekend — 20% OFF Everything at VideStore!', message: 'We invite you to experience our special Weekend Sale.\n\nEnjoy flat 20% OFF on all orders this weekend.\nUse the coupon code below at checkout.', coupon: 'ROYAL20', discount: '20% OFF' },
  { label: 'Modern Legacy', subject: '✨ The New Collection — Discover the Future of Fashion', message: 'Our latest collection is now live!\n\nShop fresh styles in Men, Women, Streetwear & Accessories.\nNew pieces added every week — don\'t miss out!', coupon: '', discount: '' },
  { label: 'Inner Circle', subject: '🎁 An Exclusive Invitation Just For You', message: 'As a valued member of the VideStore inner circle, we have a special offer for you.\n\nUse your exclusive coupon below to save on your next order.\nOffer valid for 48 hours only!', coupon: 'VIP15', discount: '15% OFF' },
  { label: 'Festive Gala', subject: '🎊 The Festive Gala — Up to 40% OFF at VideStore!', message: 'Celebrate in style with our biggest sale of the season!\n\nUp to 40% OFF on premium fashion across all categories.\nLimited time offer — grab your favourites before they\'re gone!', coupon: 'GALA40', discount: '40% OFF' },
];

export default function AdminNotifications() {
  const [tab, setTab] = useState('sms');
  const [stats, setStats] = useState(null);
  const [smsMessage, setSmsMessage] = useState('');
  const [smsImage, setSmsImage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailCoupon, setEmailCoupon] = useState('');
  const [emailDiscount, setEmailDiscount] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    API.get('/notifications/stats').then(res => setStats(res.stats)).catch(console.error);
  }, []);

  const handleSendSMS = async () => {
    if (!smsMessage.trim()) { toast.error('Strategic message required'); return; }
    if (!window.confirm(`Deploy push notification to ${stats?.withPhone} active nodes?`)) return;
    setSending(true); setResult(null);
    try {
      const res = await API.post('/notifications/bulk-sms', 
        { message: smsMessage, targetAll: true, imageUrl: smsImage.trim() || undefined },
        { timeout: 60000 }
      );
      setResult({ success: true, msg: res.message || `Successful deployment to ${res.sent} nodes!` });
      toast.success(`Deployment complete: ${res.sent} nodes notified`);
    } catch (err) {
      const errorMsg = err.message || (typeof err === 'string' ? err : 'Deployment failed.');
      setResult({ success: false, msg: errorMsg });
      toast.error(errorMsg);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    setUploadingImage(true);
    try {
      const res = await API.post('/upload/image', fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSmsImage(res.url);
      toast.success('Asset synchronized');
    } catch (err) {
      toast.error('Asset synchronization failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) { toast.error('Fill subject and message matrix'); return; }
    if (!window.confirm(`Deploy email campaign to ${stats?.withEmail} active nodes?`)) return;
    setSending(true); setResult(null);
    try {
      const res = await API.post('/notifications/bulk-email', 
        { subject: emailSubject, message: emailMessage, couponCode: emailCoupon, discount: emailDiscount },
        { timeout: 60000 }
      );
      setResult({ success: true, msg: res.message || `Successful deployment to ${res.sent} nodes.` });
      toast.success(`Deployment complete: ${res.sent} nodes notified`);
    } catch (err) {
      const errorMsg = err.message || (typeof err === 'string' ? err : 'Deployment failed.');
      setResult({ success: false, msg: errorMsg });
      toast.error(errorMsg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between sticky top-0 z-10" 
        style={{ backgroundColor: 'var(--glass)', borderBottom: `1px solid var(--b)`, backdropFilter: 'blur(32px)' }}>
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-[var(--p)] flex items-center justify-center text-[#040404] shadow-xl shadow-gold/20">
            <FiBell size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FiShield size={12} className="text-[var(--p)]" />
              <p className="font-bold text-[10px] tracking-[0.2em] uppercase opacity-60" style={{ color: 'var(--tm)' }}>Notifications</p>
            </div>
            <h1 className="font-body text-2xl font-bold tracking-tight uppercase" style={{ color: 'var(--t)' }}>System Updates</h1>
          </div>
        </div>
        <Link to="/admin" className="font-bold text-[10px] uppercase tracking-widest px-6 py-4 bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl text-[var(--tm)] hover:bg-[var(--card-alt)] transition-all flex items-center gap-3 shadow-sm" style={{ textDecoration: 'none' }}>
          <FiArrowLeft size={16} /> Dashboard
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-4">

        {/* Intelligence Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {[
            { icon: FiUsers,       label: 'Total Users', value: stats?.totalUsers || 0, color: 'var(--p)' },
            { icon: FiSmartphone,  label: 'Push Enabled',    value: stats?.withPhone  || 0, color: 'var(--p)' },
            { icon: FiMail,        label: 'Email Enabled',    value: stats?.withEmail || 0, color: 'var(--p)' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-8 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-black/5 transition-all duration-500">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all group-hover:scale-110 duration-700 shadow-inner"
                  style={{ backgroundColor: `${color}05`, borderColor: `${color}10`, color }}>
                  <Icon size={22} />
                </div>
                <span className="text-[9px] font-bold text-[var(--tl)] uppercase tracking-wider opacity-40">{label}</span>
              </div>
              <h3 className="text-3xl font-bold text-[var(--t)] mb-1 m-0 tracking-tight">{value}</h3>
              <p className="text-[11px] font-medium text-[var(--tl)] m-0 opacity-40 uppercase tracking-tight">Active Sync</p>
            </div>
          ))}
        </div>

        {/* Strategy Switcher */}
        <div className="flex items-center gap-4 mb-6 bg-[var(--card)] p-2 rounded-2xl border border-[var(--b)] w-fit shadow-sm">
          {[
            { id: 'sms',   icon: FiSmartphone, label: 'Push Notifications' },
            { id: 'email', icon: FiMail,        label: 'Email Campaigns' },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setResult(null); }}
              className={`flex items-center gap-3 px-8 py-4 font-bold text-[10px] uppercase tracking-widest transition-all rounded-xl ${tab === t.id ? 'bg-[var(--p)] text-[#040404] shadow-xl shadow-gold/20' : 'bg-transparent text-[var(--tl)] hover:text-[var(--t)]'}`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* ── Implementation Surface ── */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-10 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-10 rounded-xl bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] border border-[var(--p)]/10">
                   <FiActivity size={20} />
                </div>
                <h2 className="text-xl font-bold text-[var(--t)] m-0 tracking-tight uppercase">
                  {tab === 'sms' ? 'Push Notification Editor' : 'Email Campaign Editor'}
                </h2>
              </div>

              {tab === 'sms' ? (
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-end mb-4 px-1">
                      <label className="text-[10px] font-bold text-[var(--tl)] uppercase tracking-widest opacity-40">Message Content</label>
                      <span className={`text-[10px] font-bold tracking-widest ${smsMessage.length > 140 ? 'text-red-500' : 'text-[var(--tl)] opacity-30'}`}>{smsMessage.length} / 160</span>
                    </div>
                    <textarea value={smsMessage} onChange={e => setSmsMessage(e.target.value)} rows={4} maxLength={160}
                      placeholder="Type your message here..."
                      className="w-full bg-[var(--bg-alt)] border-2 border-[var(--b)] rounded-2xl p-6 text-sm font-bold text-[var(--t)] focus:border-[var(--p)] outline-none transition-all resize-none shadow-inner leading-relaxed" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-[var(--tl)] uppercase tracking-widest mb-4 px-1 opacity-60">Image URL (Optional)</label>
                    <div className="flex items-center gap-4">
                      <input value={smsImage} onChange={e => setSmsImage(e.target.value)}
                        placeholder="Add image URL..."
                        className="flex-1 bg-[var(--bg-alt)] border-2 border-[var(--b)] rounded-xl p-4 text-sm font-bold text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-inner" />
                      <label className="w-14 h-14 rounded-xl bg-[var(--bg-alt)] border-2 border-dashed border-[var(--b)] flex items-center justify-center text-[var(--tl)] hover:text-[var(--p)] hover:border-[var(--p)]/50 cursor-pointer transition-all shadow-sm">
                        {uploadingImage ? <FiRefreshCw className="animate-spin" /> : <FiUploadCloud size={20} />}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                      </label>
                    </div>
                  </div>

                  {/* Device Preview */}
                  {smsMessage && (
                    <div className="bg-[var(--bg-alt)]/50 border border-[var(--b)] rounded-2xl p-8 shadow-inner">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--tl)] mb-6 flex items-center gap-3 opacity-40">
                        <FiSmartphone size={12}/> Notification Preview
                      </p>
                      <div className="max-w-[280px] mx-auto bg-[var(--card)] rounded-2xl rounded-tl-sm p-6 shadow-2xl border border-[var(--b)] border-l-4 border-l-[var(--p)] transition-all animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-6 h-6 bg-[var(--p)]/10 rounded-lg flex items-center justify-center">
                            <FiBell className="text-[var(--p)]" size={12} />
                          </div>
                          <span className="text-[9px] font-bold text-[var(--t)] uppercase tracking-widest opacity-60">VIDESTORE</span>
                        </div>
                        <p className="text-[11px] font-bold text-[var(--tm)] leading-relaxed m-0 opacity-80">{smsMessage}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--tl)] uppercase tracking-widest mb-4 px-1 opacity-40">Subject Header</label>
                    <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                      placeholder="Add campaign subject..."
                      className="w-full bg-[var(--bg-alt)] border-2 border-[var(--b)] rounded-xl p-4 text-sm font-bold text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-inner uppercase tracking-tight" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--tl)] uppercase tracking-widest mb-4 px-1 opacity-40">Message Content</label>
                    <textarea value={emailMessage} onChange={e => setEmailMessage(e.target.value)} rows={6}
                      placeholder="Define the message narrative..."
                      className="w-full bg-[var(--bg-alt)] border-2 border-[var(--b)] rounded-2xl p-6 text-sm font-bold text-[var(--t)] focus:border-[var(--p)] outline-none transition-all resize-none shadow-inner leading-relaxed" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--tl)] uppercase tracking-widest mb-4 px-1 opacity-40">Coupon Code</label>
                      <input value={emailCoupon} onChange={e => setEmailCoupon(e.target.value.toUpperCase())}
                        placeholder="e.g. SAVE20"
                        className="w-full bg-[var(--bg-alt)] border-2 border-[var(--b)] rounded-xl p-4 text-sm font-bold text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-inner tracking-widest" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--tl)] uppercase tracking-widest mb-4 px-1 opacity-40">Discount Offer</label>
                      <input value={emailDiscount} onChange={e => setEmailDiscount(e.target.value)}
                        placeholder="e.g. 20% OFF"
                        className="w-full bg-[var(--bg-alt)] border-2 border-[var(--b)] rounded-xl p-4 text-sm font-bold text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-inner" />
                    </div>
                  </div>
                </div>
              )}

              {result && (
                <div className={`flex items-center gap-4 p-6 mt-8 rounded-2xl border transition-all animate-in zoom-in-95 duration-500 ${result.success ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>
                  {result.success ? <FiCheck size={18}/> : <FiAlertCircle size={18}/>}
                  <p className="text-[10px] font-bold m-0 uppercase tracking-widest">{result.msg}</p>
                </div>
              )}
              <button onClick={tab === 'sms' ? handleSendSMS : handleSendEmail} disabled={sending || (tab === 'sms' ? !smsMessage.trim() : (!emailSubject.trim() || !emailMessage.trim()))}
                className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-[11px] tracking-widest uppercase mt-10 transition-all ${sending ? 'bg-[var(--bg-alt)] text-[var(--tl)] cursor-not-allowed border border-[var(--b)] opacity-40' : 'bg-[var(--p)] text-[#040404] shadow-xl shadow-gold/20 hover:-translate-y-1'}`}>
                {sending ? <FiRefreshCw className="animate-spin" size={16}/> : <FiSend size={16}/>}
                {sending ? 'Sending...' : `Send to ${tab === 'sms' ? stats?.withPhone : stats?.withEmail} Users`}
              </button>
            </div>
          </div>

          {/* ── Library: Templates ── */}
          <div className="space-y-8">
            <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-8 shadow-sm">
              <h4 className="text-[10px] font-bold text-[var(--tl)] uppercase tracking-widest mb-8 opacity-40">Presets</h4>
              <div className="space-y-4">
                {(tab === 'sms' ? SMS_TEMPLATES : EMAIL_TEMPLATES).map(t => (
                  <button key={t.label} onClick={() => {
                    if(tab === 'sms') { setSmsMessage(t.message); }
                    else { setEmailSubject(t.subject); setEmailMessage(t.message); setEmailCoupon(t.coupon); setEmailDiscount(t.discount); }
                  }}
                    className="w-full text-left p-5 bg-[var(--bg-alt)] border border-[var(--b)] rounded-2xl hover:bg-[var(--card)] hover:border-[var(--p)]/50 hover:shadow-lg transition-all duration-300 group">
                    <p className="text-xs font-bold text-[var(--t)] mb-2 group-hover:text-[var(--p)] transition-colors uppercase tracking-tight">{t.label}</p>
                    <p className="text-[10px] font-medium text-[var(--tl)] leading-relaxed line-clamp-2 m-0 opacity-40">{tab === 'sms' ? t.message : t.subject}</p>
                    {t.coupon && (
                      <div className="mt-4 inline-flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 bg-emerald-500/5 text-emerald-500 rounded-lg border border-emerald-500/10">Active</span>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--bg)] border border-[var(--b)] rounded-lg">
                          <FiTag size={10} />
                          <span className="text-[8px] font-bold uppercase tracking-widest">{t.coupon}</span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#070707] rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--p)]/5 rounded-full -mr-20 -mt-20 blur-3xl transition-all group-hover:scale-150 duration-1000" />
              <FiShield size={120} className="absolute -bottom-8 -right-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-transform duration-1000 text-[var(--p)]" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest mb-10 opacity-40">Architecture Core</h4>
              <div className="space-y-6">
                {['Integrated Cloud Core', 'Secure Token Matrix', 'Active Communication', 'Optimized Latency'].map((s, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--p)] shadow-lg shadow-gold/50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{s}</span>
                  </div>
                ))}
              </div>
              <div className="mt-16 pt-10 border-t border-white/5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-3">Institutional Node</p>
                  <p className="text-xl font-bold m-0 tracking-tight uppercase">Deployment Grid v4.2</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}