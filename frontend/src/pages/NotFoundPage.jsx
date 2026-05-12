import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center text-center px-6" style={{ backgroundColor: 'var(--bg)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
        <div className="w-20 h-20 rounded-[24px] bg-[var(--p)]/5 border border-[var(--p)]/10 flex items-center justify-center mx-auto mb-10 text-[var(--p)] shadow-inner">
           <FiAlertTriangle size={40} />
        </div>
        <p className="text-[10px] font-black text-[var(--p)] uppercase tracking-[0.4em] mb-4 opacity-60">Error Node 404</p>
        <h1 className="font-body text-4xl font-black text-[var(--t)] mb-6 tracking-tighter uppercase">Protocol Not Found</h1>
        <p className="text-xs font-bold text-[var(--tl)] mb-12 leading-relaxed uppercase tracking-widest opacity-60">The requested resource identifier does not exist within the current platform grid.</p>
        <Link to="/" 
          className="inline-flex items-center gap-3 px-10 py-5 bg-[var(--p)] text-[#040404] font-black text-[11px] uppercase tracking-[0.2em] rounded-[18px] shadow-2xl shadow-gold/20 hover:-translate-y-1 transition-all"
          style={{ textDecoration: 'none' }}>
          <FiArrowLeft size={16} /> Return to Home
        </Link>
      </motion.div>
    </div>
  );
}
