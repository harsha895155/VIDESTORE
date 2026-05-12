import LegalLayout, { H2, P, UL, InfoBox } from './LegalLayout';

export default function RefundPolicy() {
  return (
    <LegalLayout title="Refund & Cancellation Policy" lastUpdated="March 2026">
      <InfoBox>
        We want you to love every purchase. If you're not satisfied, we offer hassle-free returns within 30 days of delivery.
      </InfoBox>

      <H2>1. Order Cancellation</H2>
      <P>You can cancel your order within 24 hours of placing it by emailing vibestore2027@gmail.com or calling +91 98765 43210. Once the order is shipped, cancellation is not possible — you may instead initiate a return after delivery.</P>
      <UL items={[
        'Cancellations within 24 hours: full refund to original payment method',
        'Cancellations after 24 hours but before shipping: full refund minus ₹50 processing fee',
        'Cancellations after shipping: not accepted — initiate return after delivery',
      ]} />

      <H2>2. Return Eligibility</H2>
      <P>Items are eligible for return within 30 days of delivery, provided they meet the following conditions:</P>
      <UL items={[
        'Unused, unwashed, and in original condition',
        'All original tags attached and packaging intact',
        'Accompanied by the original invoice',
        'Not listed under non-returnable items below',
      ]} />

      <H2>3. Non-Returnable Items</H2>
      <UL items={[
        'Sale or discounted items marked "Final Sale"',
        'Innerwear, socks, and swimwear (for hygiene reasons)',
        'Customized or personalized products',
        'Items damaged due to misuse, washing errors, or negligence',
        'Gift cards',
      ]} />

      <H2>4. How to Initiate a Return</H2>
      <P>To initiate a return:</P>
      <UL items={[
        'Step 1: Email vibestore2027@gmail.com with subject "Return Request – Order #XXXXX"',
        'Step 2: Include photos of the item and reason for return',
        'Step 3: Our team will respond within 24 business hours with return instructions',
        'Step 4: Pack the item securely and hand it to our pickup agent (free pickup for defective items)',
        'Step 5: Refund is processed within 7–10 business days after we receive and inspect the item',
      ]} />

      <H2>5. Refund Timeline</H2>
      <UL items={[
        'Credit/Debit Card: 7–10 business days after return approval',
        'UPI / Net Banking: 5–7 business days',
        'Cash on Delivery orders: refund via bank transfer within 10 business days (NEFT)',
        'Razorpay wallet: 2–3 business days',
      ]} />

      <H2>6. Damaged or Wrong Items</H2>
      <P>If you receive a damaged, defective, or incorrect item, contact us within 48 hours of delivery with clear photos. We will arrange a free replacement or full refund with free return pickup at no cost to you.</P>

      <H2>7. Exchange Policy</H2>
      <P>We offer one free size or colour exchange per order, subject to stock availability. To request an exchange, contact us within 30 days of delivery. If the requested size/colour is unavailable, a full refund will be issued.</P>

      <H2>8. Partial Refunds</H2>
      <P>Partial refunds may be issued in cases where: only part of the order is returned, the item shows signs of use, or original packaging is missing. Shipping charges are non-refundable unless the return is due to our error.</P>

      <H2>9. Contact for Returns & Refunds</H2>
      <P>Email: vibestore2027@gmail.com | Phone: +91 98765 43210 | Response time: within 24 business hours (Mon–Sat, 9am–6pm IST)</P>
    </LegalLayout>
  );
}
