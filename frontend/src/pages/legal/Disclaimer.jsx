import LegalLayout, { H2, P, UL, InfoBox } from './LegalLayout';

export default function Disclaimer() {
  return (
    <LegalLayout title="Disclaimer" lastUpdated="March 2026">
      <InfoBox>
        Please read this disclaimer carefully before using VideStore's website or purchasing our products.
      </InfoBox>

      <H2>1. General Disclaimer</H2>
      <P>The information provided on VideStore.in is for general informational and commercial purposes only. While we strive to keep information accurate and up-to-date, VideStore Fashion Pvt. Ltd. makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information, products, or services on this website.</P>

      <H2>2. Product Descriptions and Images</H2>
      <UL items={[
        'Product images are as accurate as possible but colours may vary due to monitor/screen settings and lighting',
        'Product dimensions and measurements are approximate and may have a ±1–2 cm variance',
        'We reserve the right to change product specifications without prior notice',
        'Fabric textures may appear different on screen compared to the actual product',
      ]} />

      <H2>3. Pricing Disclaimer</H2>
      <P>Prices displayed on our website are subject to change without notice. In the event of a pricing error, VideStore reserves the right to cancel orders placed at the incorrect price and issue a full refund. We are not obligated to fulfil orders at erroneous prices.</P>

      <H2>4. Stock Availability</H2>
      <P>Product availability is updated in real time, but due to high demand, items may sell out between the time you add them to your cart and checkout. VideStore is not liable for any inconvenience caused by stock unavailability.</P>

      <H2>5. External Links</H2>
      <P>Our website may contain links to third-party websites for reference or convenience. These links do not constitute endorsement. VideStore has no control over the content, privacy practices, or availability of external sites and accepts no responsibility for them.</P>

      <H2>6. Fashion and Style Advice</H2>
      <P>Any style suggestions, size recommendations, or fashion advice provided on this website are for general guidance only. Individual body types, preferences, and regional trends may vary. We recommend using our Size Guide and consulting our customer support for personalized advice.</P>

      <H2>7. Limitation of Liability</H2>
      <P>To the fullest extent permitted by Indian law, VideStore Fashion Pvt. Ltd. shall not be liable for:</P>
      <UL items={[
        'Any direct, indirect, incidental, or consequential loss or damage',
        'Loss of business, profits, or revenue arising from use of our website',
        'Damage to your device caused by downloading content from our website',
        'Any errors, omissions, or inaccuracies in content',
        'Delays or failures in delivery caused by third-party courier partners',
      ]} />

      <H2>8. Indemnification</H2>
      <P>You agree to indemnify and hold harmless VideStore Fashion Pvt. Ltd., its directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from your use of our website, violation of these terms, or infringement of any third-party rights.</P>

      <H2>9. Applicable Law</H2>
      <P>This disclaimer is governed by and construed in accordance with the laws of India. Any disputes will be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.</P>

      <H2>10. Contact</H2>
      <P>VideStore Fashion Pvt. Ltd. | MG Road, Bengaluru – 560001, Karnataka | vibestore2027@gmail.com | +91 98765 43210</P>
    </LegalLayout>
  );
}
