import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiEye, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const injectStyles = () => {
  if (typeof document === 'undefined') return;
  const oldStyle = document.getElementById('pc-styles-v5'); if (oldStyle) oldStyle.remove();
  if (document.getElementById('pc-styles-v6')) return;
  const style = document.createElement('style');
  style.id = 'pc-styles-v6';
  style.textContent = `
    .pc-wrap {
      position: relative;
      border-radius: 12px;
      background: var(--card);
      display: block;
      width: 100%;
      border: 1px solid var(--b);
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
      box-shadow: var(--shadow);
    }

    .pc-wrap:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-premium);
      border-color: #0EA5E9;
    }

    .pc-inner {
      position: relative;
      background: transparent;
      display: flex;
      flex-direction: column;
    }

    .pc-img-box {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      overflow: hidden;
      background: var(--bg-alt);
    }

    .pc-img-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .pc-wrap:hover img {
      transform: scale(1.05);
    }

    .pc-actions {
      position: absolute;
      top: 1rem;
      right: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      z-index: 10;
      opacity: 0;
      transform: translateX(10px);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .pc-wrap:hover .pc-actions {
      opacity: 1;
      transform: translateX(0);
    }

    .pc-action-btn {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--glass);
      backdrop-filter: blur(8px);
      color: var(--t);
      border: 1px solid var(--b);
      cursor: pointer;
      box-shadow: var(--shadow);
      transition: all 0.3s ease;
    }

    .pc-action-btn:hover {
      background: var(--p);
      color: #040404;
      border-color: var(--p);
      transform: scale(1.1);
    }

    .pc-quick-add {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--p);
      color: #040404;
      padding: 0.75rem;
      text-align: center;
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      transform: translateY(100%);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 20;
      cursor: pointer;
    }

    .pc-wrap:hover .pc-quick-add {
      transform: translateY(0);
    }

    .pc-tag-new {
      position: absolute;
      top: 12px;
      left: 12px;
      background: var(--p);
      color: #040404;
      font-size: 8px;
      font-weight: 900;
      padding: 4px 10px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      z-index: 10;
    }

    .pc-tag-discount {
      position: absolute;
      top: 36px;
      left: 12px;
      background: #ef4444;
      color: #fff;
      font-size: 8px;
      font-weight: 900;
      padding: 4px 10px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      z-index: 10;
    }

    .pc-info {
      padding: 0.75rem;
      background: var(--card);
    }

    .pc-brand {
      font-size: 8px;
      color: var(--p);
      margin-bottom: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-weight: 900;
      opacity: 0.8;
    }

    .pc-name {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--t);
      margin-bottom: 0.5rem;
      display: block;
      transition: color 0.3s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .pc-name:hover {
      color: var(--p);
    }

    .pc-price-box {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 0.75rem;
    }

    .pc-price-now {
      font-size: 0.9rem;
      font-weight: 900;
      color: var(--t);
      font-family: 'serif', 'Cormorant Garamond';
    }

    .pc-price-old {
      font-size: 0.75rem;
      color: var(--tl);
      text-decoration: line-through;
      font-weight: 500;
    }

    .pc-off-badge {
      display: inline-block;
      background: #22c55e;
      color: #040404;
      font-size: 9px;
      font-weight: 900;
      padding: 4px 10px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    .pc-img-link {
      position: absolute;
      inset: 0;
      z-index: 5;
    }
  `;
  document.head.appendChild(style);
};

export default function ProductCard({ product, index = 0 }) {
  injectStyles();

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product._id);

  const hasDiscount = product.discountPrice != null && product.discountPrice > 0 && product.discountPrice < product.price;
  const effectivePrice = hasDiscount ? product.discountPrice : product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  const mainImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: (index % 4) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="pc-wrap"
    >
      <div className="pc-inner">

        <div className="pc-img-box">
          <Link to={`/product/${product._id}`} className="pc-img-link" />
          <img src={mainImage} alt={product.name} loading="lazy" />
          
          {product.isNewArrival && (
            <div className="pc-tag-new">NEW</div>
          )}
          
          {discountPercent && (
            <div className="pc-tag-discount" style={{ top: product.isNewArrival ? '36px' : '12px' }}>
              -{discountPercent}%
            </div>
          )}

          <div className="pc-actions">
            <button
              className="pc-action-btn"
              onClick={e => { e.preventDefault(); toggleWishlist(product._id); }}
            >
              <FiHeart size={18} fill={wishlisted ? 'var(--p)' : 'none'} style={{ color: wishlisted ? 'var(--p)' : 'none', stroke: wishlisted ? 'var(--p)' : '#F5F3EE' }} />
            </button>
            <Link to={`/product/${product._id}`} className="pc-action-btn">
              <FiEye size={18} />
            </Link>
          </div>

          <div
            className="pc-quick-add"
            onClick={e => { e.preventDefault(); addToCart(product._id, product.sizes?.[0], product.colors?.[0]?.name); }}
          >
            Add to Cart <FiArrowRight className="inline ml-2" />
          </div>
        </div>

        <div className="pc-info">
          <p className="pc-brand">{product.brand || 'TRENDORRA'}</p>
          <Link to={`/product/${product._id}`} className="pc-name">
            {product.name}
          </Link>

          <div className="pc-price-box">
            <span className="pc-price-now">₹{effectivePrice?.toLocaleString()}</span>
            {hasDiscount && <span className="pc-price-old">₹{product.price?.toLocaleString()}</span>}
          </div>

          {discountPercent && (
            <div className="pc-off-badge">
              {discountPercent}% OFF
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}