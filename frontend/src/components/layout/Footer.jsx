import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMail, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { useSupportEmail } from '../../hooks/useSupportEmail';

export default function Footer() {
  const [email, setEmail] = useState('');
  const supportEmail = useSupportEmail();

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email) { 
      toast.success('Your presence is noted. Thank you for joining.'); 
      setEmail(''); 
    }
  };

  return (
    <footer className="pt-32 pb-12 overflow-hidden" style={{ backgroundColor: 'var(--bg)', borderTop: '1px solid var(--b)' }}>
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12">
        
        {/* Newsletter Section */}
        <div className="mb-32 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[3rem] p-12 sm:p-20 text-center relative overflow-hidden shadow-2xl border"
            style={{ borderColor: 'var(--b)', background: 'var(--card)' }}
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] opacity-10 pointer-events-none" style={{ background: 'var(--p)' }} />
            
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] mb-6" style={{ color: 'var(--p)' }}>Newsletter</p>
            <h2 className="serif text-5xl sm:text-6xl font-bold mb-8 tracking-tight" style={{ color: 'var(--t)' }}>Join the Inner Circle</h2>
            <p className="max-w-xl mx-auto mb-12 text-lg font-medium opacity-60 leading-relaxed" style={{ color: 'var(--tm)' }}>
              Subscribe for exclusive drops, early access, and secret collection updates.
            </p>
            
            <form onSubmit={handleNewsletter} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4 relative z-10">
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email" 
                required
                className="flex-1 px-8 py-5 rounded-2xl text-sm font-medium transition-all outline-none border focus:ring-4 focus:ring-[var(--p)]/10"
                style={{ borderColor: 'var(--b)', background: 'var(--bg-alt)', color: 'var(--t)' }}
              />
              <button type="submit" className="btn-primary h-[60px] px-10 group">
                Join <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-500" />
              </button>
            </form>
          </motion.div>
        </div>

        {/* Main Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-16 mb-32">
          
          <div className="col-span-2 md:col-span-4 space-y-10">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:rotate-[360deg] border border-[var(--p)]/40 shadow-2xl"
                style={{ background: 'var(--card)' }}>
                <span className="serif text-[var(--p)] text-2xl font-black">V</span>
              </div>
              <span className="serif text-3xl font-black tracking-tight" style={{ color: 'var(--t)' }}>VIDESTORE</span>
            </Link>
            <p className="text-lg font-medium opacity-60 leading-relaxed max-w-sm" style={{ color: 'var(--tm)' }}>
              Defining modern luxury essentials. Curating a high-end experience for the global trendsetter.
            </p>
            <div className="flex gap-6">
              {[FiInstagram, FiTwitter, FiFacebook, FiYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all hover:shadow-sm group" style={{ borderColor: 'var(--b)', background: 'var(--card)' }}>
                  <Icon size={18} className="transition-all group-hover:text-[var(--p)] group-hover:scale-110" style={{ color: 'var(--tm)' }} />
                </a>
              ))}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--p)' }}>Shop</h4>
            <ul className="space-y-4">
              {['Men', 'Women', 'Streetwear', 'Accessories', 'New Arrivals'].map(item => (
                <li key={item}>
                  <Link to={`/shop/${item.toLowerCase()}`} className="text-sm font-bold uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-[var(--p)] transition-all" style={{ color: 'var(--t)' }}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--p)' }}>Care</h4>
            <ul className="space-y-4">
              {['Size Guide', 'Shipping Policy', 'Track Order', 'FAQ', 'Contact Us'].map(item => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-bold uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-[var(--p)] transition-all" style={{ color: 'var(--t)' }}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-4 space-y-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--p)' }}>Contact</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-6 p-6 rounded-3xl border transition-all hover:shadow-md" style={{ borderColor: 'var(--b)', background: 'var(--card)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ border: '1px solid var(--b)', background: 'var(--bg-alt)' }}>
                  <FiMail style={{ color: 'var(--p)' }} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-50" style={{ color: 'var(--tm)' }}>Email Us</p>
                  {supportEmail ? (
                    <a href={`mailto:${supportEmail}`} className="text-sm font-bold" style={{ color: 'var(--t)' }}>{supportEmail}</a>
                  ) : (
                    <span className="text-sm font-bold opacity-50" style={{ color: 'var(--t)' }}>Loading...</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-6 p-6 rounded-3xl border transition-all hover:shadow-md" style={{ borderColor: 'var(--b)', background: 'var(--card)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ border: '1px solid var(--b)', background: 'var(--bg-alt)' }}>
                  <FiMapPin style={{ color: 'var(--p)' }} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-50" style={{ color: 'var(--tm)' }}>Our Studio</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--t)' }}>Nellore, Andhra Pradesh</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-12 border-t flex flex-col md:flex-row justify-between items-center gap-8" style={{ borderColor: 'var(--b)' }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--tm)' }}>
            © 2026 VideStore. All rights reserved.
          </p>
          <div className="flex items-center gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            {['VISA', 'MASTERCARD', 'UPI', 'RAZORPAY'].map(p => (
              <span key={p} className="text-[9px] font-black tracking-[0.3em]" style={{ color: 'var(--t)' }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
