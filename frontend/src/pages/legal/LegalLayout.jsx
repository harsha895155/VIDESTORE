import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

const GOLD = '#C9A84C';
const BG = '#111111';
const BG2 = '#0a0a0a';
const CARD = '#1a1a1a';
const BORDER = 'rgba(255,255,255,0.08)';

const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms of Service', to: '/terms-of-service' },
  { label: 'Refund Policy', to: '/refund-policy' },
  { label: 'Shipping Policy', to: '/shipping-policy' },
  { label: 'Cookie Policy', to: '/cookie-policy' },
  { label: 'Disclaimer', to: '/disclaimer' },
];

export default function LegalLayout({ title, lastUpdated = 'March 2026', children }) {
  const location = useLocation();
  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="py-6 px-6 text-center glass" style={{ borderBottom: `1px solid var(--b)` }}>
        <p className="font-body text-xs tracking-[0.25em] uppercase mb-2" style={{ color: 'var(--p)' }}>Legal</p>
        <h1 className="serif text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--t)' }}>{title}</h1>
        <p className="font-body text-sm opacity-50" style={{ color: 'var(--t)' }}>Last updated: {lastUpdated}</p>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar navigation */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="sticky top-28 rounded-3xl border shadow-premium overflow-hidden glass" style={{ borderColor: 'var(--b)' }}>
              <p className="font-body text-[10px] tracking-[0.2em] uppercase px-5 py-4 border-b opacity-40" style={{ color: 'var(--t)', borderColor: 'var(--b)' }}>
                Legal Pages
              </p>
              {legalLinks.map(link => {
                const isActive = window.location.pathname === link.to;
                return (
                  <Link key={link.to} to={link.to}
                    className="flex items-center justify-between px-5 py-3.5 text-sm font-body transition-all"
                    style={{
                      color: isActive ? 'var(--p)' : 'var(--t)',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                      borderBottom: `1px solid var(--b)`,
                      borderLeft: isActive ? `2px solid var(--p)` : '2px solid transparent',
                    }}>
                    {link.label}
                    {isActive && <FiChevronRight size={13} style={{ color: 'var(--p)' }} />}
                  </Link>
                );
              })}
              <div className="px-5 py-4">
                <p className="font-body text-xs leading-relaxed opacity-30" style={{ color: 'var(--t)' }}>
                  Questions? Contact us at<br />
                  <a href="mailto:videstoreshoppingsai@gmail.com" className="hover:opacity-100 transition-opacity" style={{ color: 'var(--p)' }}>
                    videstoreshoppingsai@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <div className="p-6 sm:p-8 rounded-[2.5rem] border shadow-premium glass" style={{ borderColor: 'var(--b)' }}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export const H2 = ({ children }) => (
  <h2 className="serif text-xl font-bold mt-4 mb-2 pb-1 border-b"
    style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--p)' }}>
    {children}
  </h2>
);

export const P = ({ children }) => (
  <p className="font-body text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
    {children}
  </p>
);

export const UL = ({ items }) => (
  <ul className="space-y-2 mb-4 ml-4">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2 font-body text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
        <span style={{ color: '#C9A84C', marginTop: '2px' }}>•</span>
        {item}
      </li>
    ))}
  </ul>
);

export const InfoBox = ({ children }) => (
  <div className="p-4 mb-6 rounded" style={{ backgroundColor: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
    <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{children}</p>
  </div>
);
