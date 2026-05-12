import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiShoppingBag, FiArrowRight, FiMinus, FiPlus, FiChevronLeft, FiLock, FiShield, FiTag } from 'react-icons/fi';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();
  const items = cart.items || [];

  if (items.length === 0) return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-8" style={{ background: 'var(--bg)' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-40 h-40 rounded-[32px] flex items-center justify-center mb-12 shadow-2xl relative border"
        style={{ background: 'var(--card)', borderColor: 'var(--b)' }}
      >
        <div className="absolute inset-0 bg-[var(--p)]/5 rounded-[32px] blur-2xl" />
        <FiShoppingBag size={56} className="text-[var(--p)] relative z-10" />
      </motion.div>
      <h2 className="serif text-6xl font-black mb-8 tracking-tighter" style={{ color: 'var(--t)' }}>Selection Empty</h2>
      <p className="max-w-xl mx-auto mb-16 text-xl font-medium leading-relaxed opacity-60 uppercase tracking-widest" style={{ color: 'var(--tl)' }}>
        Your strategic collection awaits. Discover pieces that redefine your presence.
      </p>
      <Link to="/shop" className="btn-primary group" style={{ padding: '24px 60px', fontSize: '14px' }}>
        Begin Browsing <FiArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen pt-0 pb-16" style={{ background: 'var(--bg)' }}>
      <div className="max-w-[1440px] mx-auto px-8 sm:px-16">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-4 gap-10">
          <div>
            <Link to="/shop" className="inline-flex items-center font-black text-[10px] uppercase tracking-[0.25em] mb-2 transition-all hover:gap-4 group" style={{ color: 'var(--p)' }}>
              <FiChevronLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Return to Boutique
            </Link>
            <h1 className="serif text-7xl font-black tracking-tighter uppercase" style={{ color: 'var(--t)' }}>Your Selection</h1>
          </div>
          <div className="flex items-center gap-6 px-10 py-6 rounded-[24px] border bg-[var(--card)] shadow-2xl shadow-black/5" style={{ borderColor: 'var(--b)' }}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] opacity-40 mb-2" style={{ color: 'var(--tl)' }}>Curated Assets</p>
              <div className="flex items-end gap-3">
                 <span className="text-5xl font-black tracking-tighter serif" style={{ color: 'var(--p)' }}>{items.length}</span>
                 <span className="text-xs font-black uppercase tracking-widest pb-2 opacity-60" style={{ color: 'var(--tl)' }}>Active Nodes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-20">
          
          {/* Items List */}
          <div className="xl:col-span-8">
            <div className="rounded-[32px] border shadow-2xl shadow-black/5 overflow-hidden bg-[var(--card)]" style={{ borderColor: 'var(--b)' }}>
              <div className="hidden md:grid grid-cols-12 gap-8 px-12 py-8 border-b" style={{ background: 'var(--bg-alt)', borderColor: 'var(--b)' }}>
                <div className="col-span-6 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--tl)' }}>Asset Description</div>
                <div className="col-span-2 text-center text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--tl)' }}>Valuation</div>
                <div className="col-span-2 text-center text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--tl)' }}>Quantity</div>
                <div className="col-span-2 text-right text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--tl)' }}>Aggregated</div>
              </div>

              <div className="divide-y" style={{ borderColor: 'var(--b)' }}>
                <AnimatePresence>
                  {items.map(item => (
                    <motion.div 
                      key={item._id} 
                      layout 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-10 px-12 py-12 items-center hover:bg-[var(--bg-alt)]/30 transition-colors group"
                    >
                      {/* Product Info */}
                      <div className="col-span-12 md:col-span-6 flex items-center gap-10">
                        <Link to={`/product/${item.product?._id}`} className="block w-32 h-44 rounded-2xl overflow-hidden shadow-2xl border flex-shrink-0 relative" style={{ background: 'var(--bg-alt)', borderColor: 'var(--b)' }}>
                          <img 
                            src={item.product?.images?.[0]?.url} 
                            alt={item.product?.name} 
                            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-2" 
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${item.product?._id}`} className="block">
                            <h3 className="serif text-2xl font-black transition-colors truncate tracking-tight mb-2" style={{ color: 'var(--t)' }}>
                              {item.product?.name}
                            </h3>
                          </Link>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--p)' }}>{item.product?.brand || 'Institutional'}</p>
                          <div className="flex flex-wrap gap-3">
                            {item.size && (
                              <span className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm" style={{ background: 'var(--card)', color: 'var(--t)', borderColor: 'var(--b)' }}>Size: {item.size}</span>
                            )}
                            {item.color && (
                              <span className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm" style={{ background: 'var(--card)', color: 'var(--t)', borderColor: 'var(--b)' }}>{item.color}</span>
                            )}
                          </div>
                          <button 
                            onClick={() => removeFromCart(item._id)}
                            className="mt-8 inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 text-red-500 transition-all"
                          >
                            <FiTrash2 size={16} className="mr-3" /> Terminate Node
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-4 md:col-span-2 text-center">
                        <span className="text-lg font-black tracking-tight serif" style={{ color: 'var(--t)' }}>₹{(item.price || item.product?.price || 0).toLocaleString()}</span>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-4 md:col-span-2 flex justify-center">
                        <div className="flex items-center rounded-xl p-1.5 border shadow-inner" style={{ background: 'var(--bg-alt)', borderColor: 'var(--b)' }}>
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--card)] hover:shadow-xl hover:shadow-black/5 transition-all text-[var(--tl)] hover:text-[var(--p)]"
                          >
                            <FiMinus size={16} />
                          </button>
                          <span className="w-12 text-center font-black text-sm serif" style={{ color: 'var(--t)' }}>{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--card)] hover:shadow-xl hover:shadow-black/5 transition-all text-[var(--tl)] hover:text-[var(--p)]"
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="col-span-4 md:col-span-2 text-right">
                        <span className="text-2xl font-black tracking-tighter serif" style={{ color: 'var(--p)' }}>
                          ₹{((item.price || item.product?.price || 0) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="xl:col-span-4">
            <div className="rounded-[32px] border p-12 sticky top-32 bg-[var(--card)] shadow-2xl shadow-black/5" style={{ borderColor: 'var(--b)' }}>
              <h2 className="serif text-4xl font-black mb-12 tracking-tight uppercase" style={{ color: 'var(--t)' }}>Summary</h2>
              
              <div className="space-y-8 mb-12">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: 'var(--tl)' }}>Subtotal</span>
                  <span className="text-lg font-black tracking-tight serif" style={{ color: 'var(--t)' }}>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: 'var(--tl)' }}>Logistics</span>
                  <div className="flex items-center gap-2 text-emerald-500">
                     <FiShield size={12} />
                     <span className="font-black uppercase text-[10px] tracking-[0.2em]">Complimentary</span>
                  </div>
                </div>
                
                <div className="pt-10 border-t" style={{ borderColor: 'var(--b)' }}>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--p)' }}>Total Valuation</p>
                      <span className="text-5xl font-black tracking-tighter serif" style={{ color: 'var(--t)' }}>₹{cartTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full h-20 text-lg group rounded-[14px] shadow-2xl shadow-gold/20"
                style={{ background: 'var(--p)', color: '#040404', border: 'none' }}
              >
                Proceed to Checkout
                <FiArrowRight size={24} className="ml-4 group-hover:translate-x-3 transition-transform duration-700" />
              </button>

              <div className="mt-12 pt-12 border-t" style={{ borderColor: 'var(--b)' }}>
                <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
                  <FiLock size={16} style={{ color: 'var(--tl)' }} />
                  <p className="text-center text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: 'var(--tl)' }}>Encrypted Protocol</p>
                </div>
                <div className="flex justify-center flex-wrap gap-8 opacity-20 grayscale">
                   {['VISA', 'MASTERCARD', 'AMEX', 'UPI'].map(p => (
                     <span key={p} className="text-[11px] font-black tracking-widest">{p}</span>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}