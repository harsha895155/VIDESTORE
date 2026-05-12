import LegalLayout, { H2, P, UL, InfoBox } from './LegalLayout';

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="March 2026">
      <InfoBox>
        At VideStore, we respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information.
      </InfoBox>

      <H2>1. Who We Are</H2>
      <P>VideStore Fashion Pvt. Ltd. ("VideStore", "we", "us") operates the website VideStore.in. We are registered in India and comply with the Information Technology Act, 2000 and applicable data protection regulations.</P>
      <P><strong style={{color:'#fff'}}>Contact:</strong> vibestore2027@gmail.com | +91 98765 43210 | MG Road, Bengaluru – 560001, Karnataka, India</P>

      <H2>2. Information We Collect</H2>
      <P>We collect the following types of information:</P>
      <UL items={[
        'Account information: name, email address, phone number, date of birth',
        'Delivery information: shipping address, billing address',
        'Payment information: processed securely via Razorpay (we do not store card details)',
        'Order history: products purchased, order status, returns',
        'Device information: IP address, browser type, operating system',
        'Browsing behaviour: pages visited, time spent, clicks, search queries on our site',
      ]} />

      <H2>3. How We Use Your Information</H2>
      <UL items={[
        'Process and fulfil your orders',
        'Send order confirmations, shipping updates, and delivery notifications',
        'Provide customer support and handle returns/refunds',
        'Send promotional emails and offers (only with your consent)',
        'Improve our website, products, and services',
        'Prevent fraud and ensure security',
        'Comply with legal and regulatory obligations',
      ]} />

      <H2>4. Payment Data & Razorpay</H2>
      <P>All payment transactions are processed by Razorpay Payment Solutions Pvt. Ltd. We do not store your credit card, debit card, or net banking credentials on our servers. Razorpay complies with PCI-DSS Level 1 standards — the highest level of payment security certification.</P>

      <H2>5. Data Sharing</H2>
      <P>We never sell your personal information. We share data only with:</P>
      <UL items={[
        'Shipping partners (Delhivery, Blue Dart, etc.) — for order delivery only',
        'Razorpay — for payment processing',
        'Google Analytics — for anonymised website analytics',
        'Law enforcement — when required by law',
      ]} />

      <H2>6. Data Retention</H2>
      <P>We retain your account data for as long as your account is active. Order records are retained for 7 years for tax and legal purposes. You may request deletion of your account at any time.</P>

      <H2>7. Your Rights</H2>
      <UL items={[
        'Access: request a copy of your personal data',
        'Correction: update incorrect information',
        'Deletion: request deletion of your account and data',
        'Opt-out: unsubscribe from marketing emails at any time',
        'Data portability: receive your data in a machine-readable format',
      ]} />
      <P>To exercise your rights, email us at vibestore2027@gmail.com with subject "Data Request".</P>

      <H2>8. Cookies</H2>
      <P>We use essential, analytics, and marketing cookies. You can manage cookie preferences in your browser settings. See our Cookie Policy for details.</P>

      <H2>9. Security</H2>
      <P>We use 256-bit SSL encryption for all data transmission. Our servers are protected with firewalls and regular security audits. However, no internet transmission is 100% secure.</P>

      <H2>10. Changes to This Policy</H2>
      <P>We may update this policy periodically. We will notify you by email or prominent notice on our website before changes take effect.</P>
    </LegalLayout>
  );
}
