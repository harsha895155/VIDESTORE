import LegalLayout, { H2, P, UL, InfoBox } from './LegalLayout';

export default function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="March 2026">
      <InfoBox>
        By using VideStore's website or placing an order, you agree to these Terms of Service. Please read carefully before proceeding.
      </InfoBox>

      <H2>1. Acceptance of Terms</H2>
      <P>By accessing VideStore.in, creating an account, or placing an order, you confirm you are at least 18 years of age and legally capable of entering into a binding contract under Indian law. If you do not agree, please do not use our services.</P>

      <H2>2. Account Responsibilities</H2>
      <P>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately at vibestore2027@gmail.com if you suspect unauthorized access. VideStore is not liable for losses resulting from unauthorized account use.</P>

      <H2>3. Products and Pricing</H2>
      <UL items={[
        'All prices are in Indian Rupees (INR) and inclusive of applicable GST',
        'Product images are for representation only — actual colours may vary slightly',
        'We reserve the right to modify prices without prior notice',
        'We are not responsible for typographical errors in pricing',
        'In case of pricing errors, we reserve the right to cancel affected orders with full refund',
      ]} />

      <H2>4. Orders and Payment</H2>
      <P>Order confirmation does not constitute acceptance. We reserve the right to cancel any order due to stock unavailability, payment failure, or suspected fraud. Payment is due in full at the time of order. We accept payments via Razorpay including:</P>
      <UL items={[
        'Credit Cards (Visa, Mastercard, RuPay, Amex)',
        'Debit Cards',
        'UPI (Google Pay, PhonePe, Paytm, BHIM)',
        'Net Banking',
        'Cash on Delivery (COD) for select pincodes',
      ]} />

      <H2>5. Shipping and Delivery</H2>
      <P>Please refer to our Shipping Policy for complete details. Estimated delivery dates are approximate. VideStore is not liable for delays caused by courier partners, natural disasters, or events beyond our control.</P>

      <H2>6. Returns and Refunds</H2>
      <P>Please refer to our Refund & Cancellation Policy. All returns are subject to inspection. VideStore reserves the right to reject returns that do not meet our return criteria.</P>

      <H2>7. Intellectual Property</H2>
      <P>All content on VideStore.in — including but not limited to text, graphics, logos, images, product designs, and software — is the exclusive property of VideStore Fashion Pvt. Ltd. and is protected under Indian copyright, trademark, and intellectual property laws.</P>
      <UL items={[
        'You may not reproduce, distribute, or create derivative works without written permission',
        'You may not use our trademarks or logos without prior consent',
        'Scraping or automated data collection is strictly prohibited',
      ]} />

      <H2>8. Prohibited Activities</H2>
      <UL items={[
        'Using the site for fraudulent transactions',
        'Submitting false or misleading product reviews',
        'Attempting to hack, disrupt, or overload our systems',
        'Reselling products purchased from VideStore without authorization',
        'Using the site for any unlawful purpose',
      ]} />

      <H2>9. Limitation of Liability</H2>
      <P>VideStore's maximum liability to you for any claim shall not exceed the value of the product(s) in dispute. We are not liable for indirect, incidental, special, or consequential damages including loss of profits, data, or business opportunities.</P>

      <H2>10. Governing Law and Dispute Resolution</H2>
      <P>These Terms are governed by the laws of India. Any disputes shall first be attempted to be resolved through mutual negotiation. If unresolved, disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.</P>

      <H2>11. Changes to Terms</H2>
      <P>We reserve the right to modify these Terms at any time. Continued use of the website after changes constitutes acceptance of the new Terms.</P>

      <H2>12. Contact</H2>
      <P>VideStore Fashion Pvt. Ltd. | vibestore2027@gmail.com | +91 98765 43210 | MG Road, Bengaluru – 560001</P>
    </LegalLayout>
  );
}
