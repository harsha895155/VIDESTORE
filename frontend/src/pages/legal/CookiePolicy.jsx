import LegalLayout, { H2, P, UL, InfoBox } from './LegalLayout';

export default function CookiePolicy() {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="March 2026">
      <InfoBox>
        We use cookies to make your shopping experience better. This policy explains what cookies we use and how you can control them.
      </InfoBox>

      <H2>1. What Are Cookies?</H2>
      <P>Cookies are small text files stored on your device (computer, phone, or tablet) when you visit a website. They help websites remember information about your visit — like items in your cart or your login status — making your next visit easier and the site more useful.</P>

      <H2>2. Types of Cookies We Use</H2>

      <P><strong style={{color:'#fff'}}>Essential Cookies (Always Active)</strong></P>
      <P>These cookies are necessary for the website to function. Without them, you cannot log in, add items to cart, or complete checkout. They cannot be disabled.</P>
      <UL items={[
        'Session cookies: keep you logged in during your visit',
        'Cart cookies: remember items in your shopping cart',
        'Security cookies: protect against CSRF attacks',
        'Razorpay cookies: enable secure payment processing',
      ]} />

      <P><strong style={{color:'#fff'}}>Analytics Cookies (Optional)</strong></P>
      <P>These help us understand how visitors use our site so we can improve it.</P>
      <UL items={[
        'Google Analytics: page views, session duration, traffic sources',
        'Hotjar: heatmaps and user session recordings (anonymised)',
      ]} />

      <P><strong style={{color:'#fff'}}>Marketing Cookies (Optional)</strong></P>
      <P>These cookies help us show relevant advertisements and track the effectiveness of our marketing campaigns.</P>
      <UL items={[
        'Facebook Pixel: tracks conversions from Facebook ads',
        'Google Ads: tracks conversions and enables remarketing',
      ]} />

      <P><strong style={{color:'#fff'}}>Preference Cookies (Optional)</strong></P>
      <UL items={[
        'Theme preference: remembers your light/dark mode setting',
        'Language preference: remembers your language selection',
        'Recently viewed products',
      ]} />

      <H2>3. Third-Party Cookies</H2>
      <P>Some cookies are set by third-party services we use. We do not control these cookies. Please refer to the privacy policies of: Google (analytics.google.com), Facebook (facebook.com/privacy), Razorpay (razorpay.com/privacy).</P>

      <H2>4. Managing Cookies</H2>
      <P>You can control and delete cookies through your browser settings:</P>
      <UL items={[
        'Chrome: Settings → Privacy and Security → Cookies',
        'Firefox: Settings → Privacy & Security → Cookies and Site Data',
        'Safari: Preferences → Privacy → Manage Website Data',
        'Edge: Settings → Privacy, Search, and Services → Cookies',
      ]} />
      <P>Note: Disabling essential cookies will prevent core features like login and checkout from working.</P>

      <H2>5. Cookie Lifespan</H2>
      <UL items={[
        'Session cookies: deleted when you close your browser',
        'Persistent cookies: remain for 30 days to 2 years depending on purpose',
        'Third-party cookies: governed by respective third-party policies',
      ]} />

      <H2>6. Updates to This Policy</H2>
      <P>We may update this Cookie Policy as we add new features or services. We will notify you of significant changes via email or a website banner.</P>

      <H2>7. Contact</H2>
      <P>For questions about our use of cookies: vibestore2027@gmail.com</P>
    </LegalLayout>
  );
}
