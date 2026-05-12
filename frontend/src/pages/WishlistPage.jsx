import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/product/ProductCard';

export default function WishlistPage() {
  const { wishlist, fetchWishlist } = useWishlist();
  useEffect(() => { fetchWishlist(); }, []);
  const products = wishlist.products || [];

  return (
    <div className="min-h-screen py-0 px-4 sm:px-6" style={{ background: 'transparent' }}>
      <div className="max-w-[1440px] mx-auto">
        
        {/* Header */}
        <div className="mb-2">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--p)' }}>Saved Items</p>
              <h1 className="serif text-5xl font-black" style={{ color: 'var(--t)' }}>My Wishlist</h1>
            </div>
            {products.length > 0 && (
              <div className="px-6 py-3 border rounded-2xl shadow-sm glass" style={{ borderColor: 'var(--b)' }}>
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1" style={{ color: 'var(--t)' }}>Total Items</p>
                <p className="text-sm font-black" style={{ color: 'var(--p)' }}>{products.length} Products</p>
              </div>
            )}
          </div>
          <div className="h-px bg-gray-200/50 mt-4" />
        </div>

        {products.length === 0 ? (
          <div className="rounded-[3rem] border shadow-sm py-24 px-6 text-center glass" style={{ borderColor: 'var(--b)' }}>
            <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8" style={{ color: 'var(--p)' }}>
              <FiHeart size={40} />
            </div>
            <h2 className="serif text-3xl font-black mb-4" style={{ color: 'var(--t)' }}>Your Wishlist is Empty</h2>
            <p className="opacity-50 max-w-sm mx-auto font-medium leading-relaxed mb-10" style={{ color: 'var(--t)' }}>
              Looks like you haven't saved any items yet. Start exploring our collections to find your next favorite piece.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/shop" className="btn-premium h-14 px-10 flex items-center gap-2">
                <FiShoppingBag /> Browse Collection
              </Link>
              <Link to="/" className="h-14 px-10 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2 border border-white/10">
                Go to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        )}

        {/* Newsletter/Action section */}
        {products.length > 0 && (
          <div className="mt-24 p-12 bg-indigo-600 rounded-[3rem] text-center relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-[100px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-[100px]" />
            </div>
            <div className="relative z-10">
              <h2 className="serif text-3xl font-black text-white mb-4">Found Something You Love?</h2>
              <p className="text-indigo-100 font-medium mb-8 max-w-md mx-auto">
                Don't miss out! Our collections move fast. Add them to your cart and make them yours today.
              </p>
              <Link to="/shop" className="h-14 px-10 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all inline-flex items-center gap-2">
                Continue Shopping <FiArrowRight />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}