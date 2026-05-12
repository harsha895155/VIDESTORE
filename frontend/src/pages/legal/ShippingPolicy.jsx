import LegalLayout, { H2, P, UL, InfoBox } from './LegalLayout';

export default function ShippingPolicy() {
  return (
    <LegalLayout title="Shipping Policy" lastUpdated="March 2026">
      <InfoBox>
        We ship across India using trusted courier partners. All orders are carefully packed to ensure your items arrive in perfect condition.
      </InfoBox>

      <H2>1. Order Processing Time</H2>
      <P>Orders are processed within 1–2 business days after payment confirmation (Mon–Sat, excluding public holidays). You will receive a shipping confirmation email with a tracking number once your order is dispatched.</P>

      <H2>2. Delivery Timeframes</H2>
      <UL items={[
        'Metro cities (Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Kolkata): 2–4 business days',
        'Tier-2 cities: 4–6 business days',
        'Tier-3 cities and rural areas: 6–10 business days',
        'Express delivery (select pincodes): 1–2 business days',
        'Northeast states, Jammu & Kashmir, Andaman & Nicobar: 7–14 business days',
      ]} />

      <H2>3. Shipping Charges</H2>
      <UL items={[
        'Orders above ₹999: FREE standard shipping',
        'Orders below ₹999: ₹99 flat shipping fee',
        'Express delivery: ₹149–₹249 (based on location)',
        'Cash on Delivery: additional ₹50 COD handling fee',
      ]} />

      <H2>4. Courier Partners</H2>
      <P>We ship via Delhivery, Blue Dart, DTDC, and Ekart Logistics depending on your pincode and order size. The courier partner is assigned automatically for the fastest delivery to your location.</P>

      <H2>5. Order Tracking</H2>
      <P>Once your order is shipped, you will receive:</P>
      <UL items={[
        'Email with tracking number and courier partner details',
        'SMS notification with tracking link',
        'Live tracking available in My Orders section of your account',
      ]} />

      <H2>6. Failed Delivery Attempts</H2>
      <P>Our courier partners make up to 3 delivery attempts. After 3 failed attempts, the package is returned to our warehouse. In this case:</P>
      <UL items={[
        'We will contact you to arrange re-delivery (re-delivery charges apply)',
        'If you choose not to re-deliver, a refund will be issued minus the shipping and return charges',
      ]} />

      <H2>7. Undeliverable Packages</H2>
      <P>If a package cannot be delivered due to an incorrect address provided by you, VideStore is not responsible for the non-delivery. Re-shipping charges will apply. Please double-check your address before placing an order.</P>

      <H2>8. Multiple Items in One Order</H2>
      <P>If your order contains multiple items, they may be shipped in separate packages on different days depending on stock availability. You will receive separate tracking numbers for each shipment.</P>

      <H2>9. Shipping to Remote Areas</H2>
      <P>Some remote pincodes may not be serviceable. If your pincode is not serviceable, you will be notified at checkout. We are constantly expanding our delivery network.</P>

      <H2>10. International Shipping</H2>
      <P>Currently, VideStore ships only within India. International shipping will be available soon. Follow us on Instagram @VideStore.in for updates.</P>

      <H2>11. Contact for Shipping Queries</H2>
      <P>Email: vibestore2027@gmail.com | Phone: +91 8951556645 | Hours: Mon–Sat, 9am–6pm IST</P>
    </LegalLayout>
  );
}
