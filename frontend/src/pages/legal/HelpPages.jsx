import { Link, useLocation } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiClock, FiMessageCircle } from 'react-icons/fi';

const GOLD = 'var(--p)';
const BG = 'var(--bg)';
const BG2 = 'var(--bg-alt)';
const CARD = 'var(--card)';
const BORDER = 'var(--b)';
const TEXT = 'var(--tl)';

const helpLinks = [
  { label: 'Size Guide', to: '/size-guide' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Cancellation Policy', to: '/privacy-policy' },
];

function HelpLayout({ title, children }) {
  const location = useLocation();
  return (
  <div className="min-h-screen" style={{ backgroundColor: BG }}>
    <div className="py-2 px-6 text-center" style={{ backgroundColor: BG2, borderBottom: `1px solid ${BORDER}` }}>
      <p className="font-body text-xs tracking-[0.25em] uppercase mb-2" style={{ color: GOLD }}>Help Center</p>
      <h1 className="font-display text-3xl md:text-4xl font-light text-white">{title}</h1>
    </div>
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2">
      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-52 flex-shrink-0">
          <div className="sticky top-28" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            <p className="font-body text-[10px] tracking-[0.2em] uppercase px-5 py-4" style={{ color: GOLD, borderBottom: `1px solid ${BORDER}` }}>Help Topics</p>
            {helpLinks.map(link => (
              <Link key={link.to} to={link.to}
                className="flex items-center px-5 py-3.5 text-sm font-body transition-all hover:text-gold"
                style={{ color: location.pathname === link.to ? GOLD : TEXT, borderBottom: `1px solid ${BORDER}`, borderLeft: location.pathname === link.to ? `2px solid ${GOLD}` : '2px solid transparent' }}>
                {link.label}
              </Link>
            ))}
          </div>
        </aside>
        <main className="flex-1">
          <div className="p-6 sm:p-8" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  </div>
  );
}

const H2 = ({ children }) => (
  <h2 className="font-display text-xl font-light text-white mt-6 mb-3 pb-2"
    style={{ borderBottom: `1px solid rgba(201,168,76,0.25)`, color: GOLD }}>{children}</h2>
);
const P = ({ c }) => <p className="font-body text-sm leading-relaxed mb-3" style={{ color: TEXT }}>{c}</p>;

// ── SIZE GUIDE ──
export function SizeGuide() {
  const sizes = {
    tops: [
      { size: 'XS', chest: '32–34"', waist: '26–28"', hip: '34–36"', label: '0–2' },
      { size: 'S',  chest: '34–36"', waist: '28–30"', hip: '36–38"', label: '4–6' },
      { size: 'M',  chest: '36–38"', waist: '30–32"', hip: '38–40"', label: '8–10' },
      { size: 'L',  chest: '38–40"', waist: '32–34"', hip: '40–42"', label: '12–14' },
      { size: 'XL', chest: '40–42"', waist: '34–36"', hip: '42–44"', label: '16–18' },
      { size: 'XXL',chest: '42–44"', waist: '36–38"', hip: '44–46"', label: '18–20' },
    ]
  };
  const thStyle = { padding: '0.75rem 1rem', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', borderBottom: `1px solid ${BORDER}`, backgroundColor: BG2 };
  const tdStyle = { padding: '0.75rem 1rem', fontSize: '13px', color: TEXT, borderBottom: `1px solid ${BORDER}` };

  return (
    <HelpLayout title="Size Guide">
      <H2>How to Measure</H2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Chest', desc: 'Measure around the fullest part of your chest, keeping the tape horizontal.' },
          { label: 'Waist', desc: 'Measure around your natural waistline, the narrowest part of your torso.' },
          { label: 'Hip', desc: 'Measure around the fullest part of your hips and seat.' },
        ].map(m => (
          <div key={m.label} className="p-4" style={{ backgroundColor: BG2, border: `1px solid ${BORDER}` }}>
            <p className="font-body text-xs tracking-[0.15em] uppercase mb-2" style={{ color: GOLD }}>{m.label}</p>
            <p className="font-body text-xs leading-relaxed" style={{ color: TEXT }}>{m.desc}</p>
          </div>
        ))}
      </div>

      <H2>Tops, T-Shirts & Shirts</H2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full" style={{ backgroundColor: CARD }}>
          <thead><tr>
            {['Size', 'Chest', 'Waist', 'Hip', 'UK/US Size'].map(h => <th key={h} style={thStyle}>{h}</th>)}
          </tr></thead>
          <tbody>
            {sizes.tops.map(row => (
              <tr key={row.size}>
                <td style={{ ...tdStyle, color: GOLD, fontWeight: 600 }}>{row.size}</td>
                <td style={tdStyle}>{row.chest}</td>
                <td style={tdStyle}>{row.waist}</td>
                <td style={tdStyle}>{row.hip}</td>
                <td style={tdStyle}>{row.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2>Tips</H2>
      <div className="space-y-2">
        {[
          'When between sizes, size up for a relaxed fit or size down for a fitted look',
          'Stretch fabrics tend to run true to size',
          'Oversized styles are designed to fit larger — check product description for fit notes',
          'Still unsure? Email us at videstoreshoppingsai@gmail.com with your measurements',
        ].map((tip, i) => (
          <div key={i} className="flex items-start gap-2 font-body text-sm" style={{ color: TEXT }}>
            <span style={{ color: GOLD }}>•</span> {tip}
          </div>
        ))}
      </div>
    </HelpLayout>
  );
}

// ── FAQ ──
export function FAQ() {
  const faqs = [
    { q: 'How do I place an order?', a: 'Browse our collections, select your size and colour, click "Add to Cart", and proceed to checkout. You can pay via UPI, card, net banking, or Cash on Delivery.' },
    { q: 'Can I change or cancel my order?', a: 'Orders can be cancelled within 24 hours of placement by emailing videstoreshoppingsai@gmail.com. After 24 hours, cancellation is not possible but you can return the item after delivery.' },
    { q: 'How long does delivery take?', a: 'Metro cities: 2–4 business days. Tier-2 cities: 4–6 business days. Tier-3/rural: 6–10 business days. Express delivery (1–2 days) is available at checkout for select pincodes.' },
    { q: 'Is Cash on Delivery available?', a: 'Yes! COD is available for most pincodes across India. An additional ₹50 COD handling fee applies. COD orders above ₹5,000 require a prepaid confirmation.' },
    { q: 'How do I return an item?', a: 'Email videstoreshoppingsai@gmail.com with your order number and reason for return within 30 days of delivery. We will arrange a free pickup for defective items.' },
    { q: 'When will I get my refund?', a: 'Refunds are processed within 7–10 business days after we receive and inspect your return. You will receive an email confirmation when the refund is initiated.' },
    { q: 'How do I track my order?', a: 'Once shipped, you will receive an email and SMS with your tracking number. You can also track your order in the My Orders section of your account.' },
    { q: 'Are your products authentic?', a: 'Yes, 100%. All products on VideStore are authentic and sourced directly from our manufacturing partners. We do not sell counterfeit or replica products.' },
    { q: 'Do you offer discounts for bulk orders?', a: 'Yes! For bulk orders (10+ pieces), email us at videstoreshoppingsai@gmail.com with your requirements for a custom quote.' },
    { q: 'Is my payment information secure?', a: 'Absolutely. All payments are processed by Razorpay, which is PCI-DSS Level 1 compliant. We never store your card or banking details on our servers.' },
  ];

  return (
    <HelpLayout title="Frequently Asked Questions">
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details key={i} className="group" style={{ border: `1px solid ${BORDER}` }}>
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none"
              style={{ backgroundColor: BG2 }}>
              <span className="font-body text-sm font-medium text-white pr-4">{faq.q}</span>
              <span className="text-gold flex-shrink-0 text-lg font-light group-open:rotate-45 transition-transform" style={{ color: GOLD }}>+</span>
            </summary>
            <div className="px-5 py-4">
              <p className="font-body text-sm leading-relaxed" style={{ color: TEXT }}>{faq.a}</p>
            </div>
          </details>
        ))}
      </div>
      <div className="mt-8 p-5 text-center" style={{ backgroundColor: BG2, border: `1px solid ${BORDER}` }}>
        <p className="font-body text-sm mb-3" style={{ color: TEXT }}>Still have questions?</p>
        <Link to="/contact" className="inline-block px-8 py-3 font-body text-sm tracking-[0.15em] uppercase text-white"
          style={{ backgroundColor: GOLD }}>Contact Us</Link>
      </div>
    </HelpLayout>
  );
}

// ── CONTACT US ──
export function ContactUs() {
  return (
    <HelpLayout title="Contact Us">
      <p className="font-body text-sm mb-8 leading-relaxed" style={{ color: TEXT }}>
        We're here to help! Our customer support team responds within 24 business hours (Mon–Sat, 9am–6pm IST).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {[
          { icon: FiMail, label: 'Email', value: 'videstoreshoppingsai@gmail.com', sub: 'Response within 24 hours', href: 'mailto:videstoreshoppingsai@gmail.com' },
          { icon: FiPhone, label: 'Phone', value: '+91 6304000624', sub: 'Mon–Sat, 9am–6pm IST', href: 'tel:+916304000624' },
          { icon: FiClock, label: 'Working Hours', value: 'Mon–Sat', sub: '9:00 AM – 6:00 PM IST', href: null },
        ].map(({ icon: Icon, label, value, sub, href }) => (
          <div key={label} className="p-5 text-center" style={{ backgroundColor: BG2, border: `1px solid ${BORDER}` }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(201,168,76,0.12)' }}>
              <Icon size={18} style={{ color: GOLD }} />
            </div>
            <p className="font-body text-xs tracking-[0.15em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
            {href ? (
              <a href={href} className="font-body text-sm font-medium text-white hover:text-gold transition-colors">{value}</a>
            ) : (
              <p className="font-body text-sm font-medium text-white">{value}</p>
            )}
            <p className="font-body text-xs mt-1" style={{ color: TEXT }}>{sub}</p>
          </div>
        ))}
      </div>

      <H2>Send Us a Message</H2>
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); alert('Message sent! We will reply within 24 hours.'); }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { placeholder: 'Your Name', type: 'text' },
            { placeholder: 'Email Address', type: 'email' },
            { placeholder: 'Phone Number', type: 'tel' },
            { placeholder: 'Order Number (if any)', type: 'text' },
          ].map((f, i) => (
            <input key={i} type={f.type} placeholder={f.placeholder} required={i < 2}
              className="px-4 py-3 font-body text-sm focus:outline-none"
              style={{ backgroundColor: BG2, border: `1px solid ${BORDER}`, color: '#fff' }} />
          ))}
        </div>
        <select className="w-full px-4 py-3 font-body text-sm focus:outline-none"
          style={{ backgroundColor: BG2, border: `1px solid ${BORDER}`, color: TEXT }}>
          <option>Select Topic</option>
          {['Order Tracking', 'Return/Refund', 'Size Query', 'Payment Issue', 'Product Query', 'Other'].map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <textarea placeholder="Your message..." rows={4}
          className="w-full px-4 py-3 font-body text-sm focus:outline-none resize-none"
          style={{ backgroundColor: BG2, border: `1px solid ${BORDER}`, color: '#fff' }} required />
        <button type="submit" className="px-10 py-3 font-body text-sm tracking-[0.15em] uppercase text-white"
          style={{ backgroundColor: GOLD }}>Send Message</button>
      </form>

      <H2>Office Address</H2>
      <div className="flex items-start gap-3 p-4" style={{ backgroundColor: BG2, border: `1px solid ${BORDER}` }}>
        <FiMapPin size={18} style={{ color: GOLD, flexShrink: 0, marginTop: 2 }} />
        <div className="font-body text-sm" style={{ color: TEXT }}>
          <p className="font-medium text-white mb-1">VideStore Fashion Pvt. Ltd.</p>
          <p>Nellore – 524004, Andhra Pradesh, India</p>
          <p className="mt-1">GSTIN: 29XXXXX1234X1ZX</p>
        </div>
      </div>
    </HelpLayout>
  );
}

// ── TRACK ORDER ──
export function TrackOrder() {
  return (
    <HelpLayout title="Track My Order">
      <p className="font-body text-sm mb-6 leading-relaxed" style={{ color: TEXT }}>
        Track your order status below. Once your order is shipped, you'll receive a tracking number via email and SMS.
      </p>
      <div className="p-6 mb-8" style={{ backgroundColor: BG2, border: `1px solid ${BORDER}` }}>
        <p className="font-body text-xs tracking-[0.15em] uppercase mb-4" style={{ color: GOLD }}>Track by Order ID</p>
        <form className="flex gap-3" onSubmit={e => { e.preventDefault(); }}>
          <input type="text" placeholder="Enter Order ID (e.g. #ABC12345)"
            className="flex-1 px-4 py-3 font-body text-sm focus:outline-none"
            style={{ backgroundColor: '#111', border: `1px solid ${BORDER}`, color: '#fff' }} />
          <Link to="/orders" className="px-6 py-3 font-body text-sm tracking-[0.1em] uppercase text-white whitespace-nowrap"
            style={{ backgroundColor: GOLD }}>View Orders</Link>
        </form>
      </div>
      <H2>Order Status Guide</H2>
      <div className="space-y-3">
        {[
          { status: 'Processing', color: '#fbbf24', desc: 'Your order has been received and payment confirmed. We are preparing your items.' },
          { status: 'Confirmed', color: '#60a5fa', desc: 'Your order is confirmed and will be handed over to our courier partner shortly.' },
          { status: 'Shipped', color: '#a78bfa', desc: 'Your order has been picked up by the courier. You will receive a tracking number.' },
          { status: 'Out for Delivery', color: '#fb923c', desc: 'Your order is with the delivery agent and will be delivered today.' },
          { status: 'Delivered', color: '#4ade80', desc: 'Your order has been delivered. Enjoy your new VideStore pieces!' },
        ].map(s => (
          <div key={s.status} className="flex items-start gap-4 p-4" style={{ backgroundColor: BG2, border: `1px solid ${BORDER}` }}>
            <span className="px-2 py-1 text-xs font-body font-medium whitespace-nowrap" style={{ backgroundColor: `${s.color}15`, color: s.color }}>{s.status}</span>
            <p className="font-body text-sm" style={{ color: TEXT }}>{s.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 text-center" style={{ backgroundColor: BG2, border: `1px solid ${BORDER}` }}>
        <p className="font-body text-sm" style={{ color: TEXT }}>Can't find your order? <a href="mailto:videstoreshoppingsai@gmail.com" className="hover:underline" style={{ color: GOLD }}>Contact Support</a></p>
      </div>
    </HelpLayout>
  );
}